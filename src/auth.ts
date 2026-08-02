import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";
import { prisma } from "@/lib/prisma";
import { fetchGithubPrimaryEmail } from "@/lib/github-email";
import { applyGithubProfileInsights } from "@/lib/github-sync";
import { encryptToken } from "@/lib/token-crypto";

function createSecureAdapter(): Adapter {
  const base = PrismaAdapter(prisma) as Adapter;

  return {
    ...base,
    async linkAccount(account) {
      if (!base.linkAccount) {
        throw new Error("Adapter linkAccount missing");
      }
      return base.linkAccount({
        ...account,
        access_token: encryptToken(account.access_token) ?? undefined,
        refresh_token: encryptToken(account.refresh_token) ?? undefined,
      });
    },
    async updateAccount(data) {
      if (!base.updateAccount) return;
      const patch = { ...data } as typeof data & {
        access_token?: string | null;
        refresh_token?: string | null;
      };
      if (typeof patch.access_token === "string") {
        patch.access_token = encryptToken(patch.access_token);
      }
      if (typeof patch.refresh_token === "string") {
        patch.refresh_token = encryptToken(patch.refresh_token);
      }
      return base.updateAccount(patch);
    },
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: createSecureAdapter(),
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
      // Never auto-link OAuth to a password account by email alone (AppSec #2)
      authorization: {
        params: {
          // repo: listar/importar públicos e privados (estilo Vercel)
          scope: "read:user user:email repo",
        },
      },
    }),
  ],
  session: {
    strategy: "database",
  },
  pages: {
    signIn: "/auth",
    error: "/auth",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "github") return true;

      const githubProfile = profile as {
        id?: number | string;
        email?: string | null;
      };

      let email = (user.email ?? githubProfile?.email ?? null)?.toLowerCase();
      if (!email && account.access_token) {
        email = (await fetchGithubPrimaryEmail(account.access_token))?.toLowerCase();
      }
      if (!email) return true;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (!existing) return true;

      const githubId = githubProfile?.id ? String(githubProfile.id) : null;
      const sameGithub =
        Boolean(githubId) && existing.githubId === githubId;

      // Password account with this email and no matching GitHub id → block silent link
      if (existing.passwordHash && !sameGithub && !existing.githubId) {
        return "/auth?error=link-required";
      }

      // Different GitHub already tied to this email row
      if (existing.githubId && githubId && existing.githubId !== githubId) {
        return "/auth?error=link-required";
      }

      return true;
    },
    async session({ session, user }) {
      if (session.user) {
        const dbUser = user as typeof user & {
          role?: import("@prisma/client").ContributorRole;
        };
        session.user.id = user.id;
        session.user.name = user.name;
        session.user.email = user.email;
        session.user.image = user.image;
        session.user.githubUsername = user.githubUsername ?? null;
        session.user.role = dbUser.role ?? "developer";
      }
      return session;
    },
  },
  events: {
    async signIn({ user, account, profile }) {
      const githubProfile = profile as {
        id?: number | string;
        login?: string;
        bio?: string | null;
        email?: string | null;
      } | undefined;

      if (!user.id) return;
      if (account?.provider !== "github") return;

      let email = user.email ?? githubProfile?.email ?? null;
      if (!email) {
        const plain = account.access_token
          ? // may still be plaintext at event time (pre-adapter persist)
            account.access_token
          : null;
        email = await fetchGithubPrimaryEmail(plain);
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          githubId: githubProfile?.id ? String(githubProfile.id) : undefined,
          githubUsername: githubProfile?.login,
          image: user.image ?? undefined,
          name: user.name ?? githubProfile?.login ?? undefined,
          ...(email ? { email } : {}),
          emailVerified: new Date(),
          lastLoginAt: new Date(),
        },
      });

      // Ensure tokens stored encrypted if adapter wrote plaintext somehow
      if (account?.providerAccountId) {
        const row = await prisma.account.findUnique({
          where: {
            provider_providerAccountId: {
              provider: "github",
              providerAccountId: account.providerAccountId,
            },
          },
          select: { id: true, access_token: true, refresh_token: true },
        });
        if (row) {
          const { encryptToken, isEncryptedToken } = await import(
            "@/lib/token-crypto"
          );
          const nextAccess =
            row.access_token && !isEncryptedToken(row.access_token)
              ? encryptToken(row.access_token)
              : null;
          const nextRefresh =
            row.refresh_token && !isEncryptedToken(row.refresh_token)
              ? encryptToken(row.refresh_token)
              : null;
          if (nextAccess || nextRefresh) {
            await prisma.account.update({
              where: { id: row.id },
              data: {
                ...(nextAccess ? { access_token: nextAccess } : {}),
                ...(nextRefresh ? { refresh_token: nextRefresh } : {}),
              },
            });
          }
        }
      }

      try {
        await applyGithubProfileInsights(user.id, {
          accessToken: account?.access_token,
          username: githubProfile?.login,
          mode: "fill-empty",
        });
      } catch (error) {
        console.error("Falha ao analisar perfil GitHub no login:", error);
      }
    },
  },
  trustHost: true,
});
