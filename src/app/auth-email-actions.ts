"use server";

import type { ContributorRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { getLocale } from "next-intl/server";
import { ActionError, withActionError } from "@/lib/action-error";
import { redirect } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { createAuthJsDatabaseSession } from "@/lib/supabase/bridge-session";

const ROLES: ContributorRole[] = [
  "developer",
  "designer",
  "docs",
  "community",
  "other",
];

function parseRole(value: FormDataEntryValue | null): ContributorRole {
  const raw = typeof value === "string" ? value : "developer";
  return ROLES.includes(raw as ContributorRole)
    ? (raw as ContributorRole)
    : "developer";
}

export async function signUpWithEmail(formData: FormData) {
  return withActionError(async () => {
    const email = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();
    const password = String(formData.get("password") ?? "");
    const name = String(formData.get("name") ?? "").trim();
    const role = parseRole(formData.get("role"));

    if (!email || !email.includes("@")) {
      throw new ActionError("Informe um e-mail válido.");
    }
    if (password.length < 8) {
      throw new ActionError("A senha precisa ter pelo menos 8 caracteres.");
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing?.passwordHash) {
      throw new ActionError("Já existe uma conta com este e-mail. Faça login.");
    }
    if (existing?.githubId) {
      throw new ActionError(
        "Este e-mail já está ligado a uma conta GitHub. Use Continuar com GitHub."
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const displayName = name || email.split("@")[0];

    const user = existing
      ? await prisma.user.update({
          where: { id: existing.id },
          data: {
            passwordHash,
            name: existing.name || displayName,
            role,
            lastLoginAt: new Date(),
          },
        })
      : await prisma.user.create({
          data: {
            email,
            name: displayName,
            passwordHash,
            role,
            lastLoginAt: new Date(),
          },
        });

    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: "credentials",
          providerAccountId: user.id,
        },
      },
      create: {
        userId: user.id,
        type: "credentials",
        provider: "credentials",
        providerAccountId: user.id,
      },
      update: { userId: user.id },
    });

    await createAuthJsDatabaseSession(user.id);
    redirect({ href: "/onboarding", locale: await getLocale() });
  });
}

export async function signInWithEmail(formData: FormData) {
  return withActionError(async () => {
    const email = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      throw new ActionError("Informe e-mail e senha.");
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash) {
      throw new ActionError("E-mail ou senha incorretos.");
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw new ActionError("E-mail ou senha incorretos.");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await createAuthJsDatabaseSession(user.id);
    redirect({ href: "/for-you", locale: await getLocale() });
  });
}
