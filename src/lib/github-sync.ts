import { prisma } from "@/lib/prisma";
import { analyzeGithubDeveloperProfile } from "@/lib/github-profile";
import {
  decryptToken,
  encryptToken,
  isEncryptedToken,
} from "@/lib/token-crypto";

type GithubTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  refresh_token_expires_in?: number;
  error?: string;
  error_description?: string;
};

async function maybeReencryptAccountTokens(account: {
  id: string;
  access_token: string | null;
  refresh_token: string | null;
}) {
  const data: { access_token?: string; refresh_token?: string } = {};
  if (account.access_token && !isEncryptedToken(account.access_token)) {
    const enc = encryptToken(account.access_token);
    if (enc && enc !== account.access_token) data.access_token = enc;
  }
  if (account.refresh_token && !isEncryptedToken(account.refresh_token)) {
    const enc = encryptToken(account.refresh_token);
    if (enc && enc !== account.refresh_token) data.refresh_token = enc;
  }
  if (Object.keys(data).length > 0) {
    await prisma.account.update({ where: { id: account.id }, data });
  }
}

async function refreshGithubAccessToken(
  accountId: string,
  refreshTokenPlain: string
) {
  const body = new URLSearchParams({
    client_id: process.env.AUTH_GITHUB_ID ?? "",
    client_secret: process.env.AUTH_GITHUB_SECRET ?? "",
    grant_type: "refresh_token",
    refresh_token: refreshTokenPlain,
  });

  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    throw new Error("Falha ao renovar o token do GitHub.");
  }

  const data = (await response.json()) as GithubTokenResponse;
  if (!data.access_token) {
    throw new Error(
      data.error_description ||
        "Token do GitHub expirado. Saia e entre novamente com o GitHub."
    );
  }

  const expiresAt = data.expires_in
    ? Math.floor(Date.now() / 1000) + data.expires_in
    : null;

  await prisma.account.update({
    where: { id: accountId },
    data: {
      access_token: encryptToken(data.access_token),
      refresh_token: encryptToken(
        data.refresh_token ?? refreshTokenPlain
      ),
      expires_at: expiresAt ?? undefined,
      token_type: "bearer",
    },
  });

  return data.access_token;
}

export async function getGithubAccessTokenForUser(userId: string) {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "github" },
    select: {
      id: true,
      access_token: true,
      refresh_token: true,
      expires_at: true,
    },
  });

  if (!account) return null;

  await maybeReencryptAccountTokens(account);

  const accessPlain = decryptToken(account.access_token);
  const refreshPlain = decryptToken(account.refresh_token);

  const now = Math.floor(Date.now() / 1000);
  const expired =
    typeof account.expires_at === "number" && account.expires_at <= now + 60;

  if (accessPlain && !expired) {
    return accessPlain;
  }

  if (refreshPlain) {
    try {
      return await refreshGithubAccessToken(account.id, refreshPlain);
    } catch (error) {
      console.error("GitHub token refresh failed:", error);
      return accessPlain;
    }
  }

  return accessPlain;
}

async function tokenLooksValid(accessToken: string) {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": "contribly",
    },
    next: { revalidate: 0 },
  });
  return response.ok;
}

export async function applyGithubProfileInsights(
  userId: string,
  options: {
    accessToken?: string | null;
    username?: string | null;
    mode: "fill-empty" | "overwrite";
  }
) {
  let accessToken =
    options.accessToken ?? (await getGithubAccessTokenForUser(userId));

  // Event may pass still-encrypted value if re-read from DB — normalize
  if (accessToken && isEncryptedToken(accessToken)) {
    accessToken = decryptToken(accessToken);
  }

  if (accessToken) {
    const valid = await tokenLooksValid(accessToken);
    if (!valid) {
      const account = await prisma.account.findFirst({
        where: { userId, provider: "github" },
        select: { id: true, refresh_token: true },
      });
      if (account?.refresh_token) {
        try {
          const refreshPlain = decryptToken(account.refresh_token);
          if (!refreshPlain) {
            accessToken = null;
          } else {
            accessToken = await refreshGithubAccessToken(
              account.id,
              refreshPlain
            );
          }
        } catch {
          accessToken = null;
        }
      } else {
        accessToken = null;
      }
    }
  }

  // Sem token válido: cai no perfil público (username + GITHUB_TOKEN se existir)
  const insight = await analyzeGithubDeveloperProfile({
    accessToken,
    username: options.username,
  });

  if (!insight) return null;

  const current = await prisma.user.findUnique({ where: { id: userId } });
  if (!current) return null;

  const overwrite = options.mode === "overwrite";

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      githubUsername: insight.githubUsername,
      name: current.name ?? insight.name ?? insight.githubUsername,
      image: current.image ?? insight.image ?? undefined,
      bio:
        overwrite || !current.bio ? insight.bio ?? current.bio : current.bio,
      languages:
        overwrite || current.languages.length === 0
          ? insight.languages
          : current.languages,
      interestTags:
        overwrite || current.interestTags.length === 0
          ? insight.interestTags
          : current.interestTags,
      experienceLevel:
        overwrite || current.languages.length === 0
          ? insight.experienceLevel
          : current.experienceLevel,
      lastLoginAt: new Date(),
    },
  });

  return {
    user: updated,
    insight,
    usedPublicFallback: !accessToken,
  };
}
