import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
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
          // public repos + perfil são suficientes para analisar stack
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
        session.user.id = user.id;
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
      } | undefined;

      if (!user.id) return;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          githubId: githubProfile?.id ? String(githubProfile.id) : undefined,
          githubUsername: githubProfile?.login,
          image: user.image ?? undefined,
          name: user.name ?? githubProfile?.login ?? undefined,
          lastLoginAt: new Date(),
        },
      });

      // Preenche stack/interesses/experiência a partir dos repos (sem sobrescrever o que o user já editou)
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
