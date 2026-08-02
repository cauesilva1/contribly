import { prisma } from "@/lib/prisma";
import { analyzeGithubDeveloperProfile } from "@/lib/github-profile";

type GithubTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  refresh_token_expires_in?: number;
  error?: string;
  error_description?: string;
};

async function refreshGithubAccessToken(accountId: string, refreshToken: string) {
  const body = new URLSearchParams({
    client_id: process.env.AUTH_GITHUB_ID ?? "",
    client_secret: process.env.AUTH_GITHUB_SECRET ?? "",
    grant_type: "refresh_token",
    refresh_token: refreshToken,
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
      access_token: data.access_token,
      refresh_token: data.refresh_token ?? refreshToken,
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

  const now = Math.floor(Date.now() / 1000);
  const expired =
    typeof account.expires_at === "number" && account.expires_at <= now + 60;

  if (account.access_token && !expired) {
    return account.access_token;
  }

  if (account.refresh_token) {
    try {
      return await refreshGithubAccessToken(account.id, account.refresh_token);
    } catch (error) {
      console.error("GitHub token refresh failed:", error);
      return account.access_token;
    }
  }

  return account.access_token;
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
  let accessToken = options.accessToken ?? (await getGithubAccessTokenForUser(userId));

  if (accessToken) {
    const valid = await tokenLooksValid(accessToken);
    if (!valid) {
      const account = await prisma.account.findFirst({
        where: { userId, provider: "github" },
        select: { id: true, refresh_token: true },
      });
      if (account?.refresh_token) {
        try {
          accessToken = await refreshGithubAccessToken(
            account.id,
            account.refresh_token
          );
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
