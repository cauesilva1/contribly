import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import type { ContributorRole, User } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const SESSION_DAYS = 30;

function sessionCookieName() {
  return process.env.NODE_ENV === "production"
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";
}

/** Cria User+Account Prisma a partir do usuário Supabase Auth e abre sessão Auth.js (database). */
export async function bridgeSupabaseUserToAuthJs(input: {
  supabaseUserId: string;
  email: string;
  emailVerified: boolean;
  name?: string | null;
  role?: ContributorRole;
}): Promise<User> {
  const email = input.email.trim().toLowerCase();

  let user = await prisma.user.findFirst({
    where: {
      OR: [{ supabaseUserId: input.supabaseUserId }, { email }],
    },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: input.name?.trim() || email.split("@")[0],
        emailVerified: input.emailVerified ? new Date() : null,
        supabaseUserId: input.supabaseUserId,
        role: input.role ?? "developer",
        lastLoginAt: new Date(),
      },
    });
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        email,
        supabaseUserId: user.supabaseUserId ?? input.supabaseUserId,
        emailVerified: input.emailVerified
          ? user.emailVerified ?? new Date()
          : user.emailVerified,
        ...(input.name?.trim() && !user.name ? { name: input.name.trim() } : {}),
        ...(input.role && user.role === "developer" && input.role !== "developer"
          ? { role: input.role }
          : {}),
        lastLoginAt: new Date(),
      },
    });
  }

  await prisma.account.upsert({
    where: {
      provider_providerAccountId: {
        provider: "supabase",
        providerAccountId: input.supabaseUserId,
      },
    },
    create: {
      userId: user.id,
      type: "credentials",
      provider: "supabase",
      providerAccountId: input.supabaseUserId,
    },
    update: {
      userId: user.id,
    },
  });

  await createAuthJsDatabaseSession(user.id);
  return user;
}

export async function createAuthJsDatabaseSession(userId: string) {
  const sessionToken = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      sessionToken,
      userId,
      expires,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName(), sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    expires,
  });

  return sessionToken;
}
