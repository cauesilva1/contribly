import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { fetchGithubPrimaryEmail } from "@/lib/github-email";
import { applyGithubProfileInsights } from "@/lib/github-sync";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          scope: "read:user user:email",
        },
      },
    }),
  ],
  session: {
    strategy: "database",
  },
  pages: {
    signIn: "/",
  },
  callbacks: {
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

      let email = user.email ?? githubProfile?.email ?? null;
      if (!email) {
        email = await fetchGithubPrimaryEmail(account?.access_token);
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          githubId: githubProfile?.id ? String(githubProfile.id) : undefined,
          githubUsername: githubProfile?.login,
          image: user.image ?? undefined,
          name: user.name ?? githubProfile?.login ?? undefined,
          ...(email ? { email } : {}),
          lastLoginAt: new Date(),
        },
      });

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
