import { DefaultSession } from "next-auth";
import type { ContributorRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      githubUsername?: string | null;
      role?: ContributorRole;
    } & DefaultSession["user"];
  }

  interface User {
    githubUsername?: string | null;
    role?: ContributorRole;
  }
}
