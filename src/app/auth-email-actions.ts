"use server";

import type { ContributorRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { getLocale } from "next-intl/server";
import { ActionError, withActionError } from "@/lib/action-error";
import {
  authRateLimitKey,
  checkAuthRateLimit,
} from "@/lib/auth-rate-limit";
import {
  buildEmailVerifyUrl,
  createEmailVerificationToken,
  consumeEmailVerificationToken,
  sendSignupVerificationEmail,
} from "@/lib/email-verification";
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
    const hdrs = await headers();

    if (!email || !email.includes("@")) {
      throw new ActionError("Informe um e-mail válido.");
    }
    if (password.length < 8) {
      throw new ActionError("A senha precisa ter pelo menos 8 caracteres.");
    }

    const limit = checkAuthRateLimit(authRateLimitKey("signup", email, hdrs));
    if (!limit.ok) {
      throw new ActionError(
        "Too many attempts. Try again in a few minutes."
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });

    // Anti-enumeration: same UX whether account already exists
    if (existing?.passwordHash || existing?.githubId) {
      redirect({
        href: `/auth?mode=login&verify=sent`,
        locale: await getLocale(),
      });
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
            emailVerified: null,
          },
        })
      : await prisma.user.create({
          data: {
            email,
            name: displayName,
            passwordHash,
            role,
            emailVerified: null,
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

    const rawToken = await createEmailVerificationToken(email);
    const verifyUrl = buildEmailVerifyUrl(email, rawToken);
    const sendResult = await sendSignupVerificationEmail({
      to: email,
      name: displayName,
      verifyUrl,
    });

    if (sendResult === "skipped_no_provider") {
      throw new ActionError(
        "Email delivery is not configured (RESEND_API_KEY). Cannot complete signup."
      );
    }
    if (sendResult === "failed") {
      throw new ActionError(
        "Could not send the confirmation email. Try again shortly."
      );
    }

    // No session until email is verified
    redirect({
      href: `/auth?mode=login&verify=sent`,
      locale: await getLocale(),
    });
  });
}

export async function signInWithEmail(formData: FormData) {
  return withActionError(async () => {
    const email = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();
    const password = String(formData.get("password") ?? "");
    const hdrs = await headers();

    if (!email || !password) {
      throw new ActionError("Informe e-mail e senha.");
    }

    const limit = checkAuthRateLimit(authRateLimitKey("signin", email, hdrs));
    if (!limit.ok) {
      throw new ActionError(
        "Too many attempts. Try again in a few minutes."
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash) {
      throw new ActionError("E-mail ou senha incorretos.");
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw new ActionError("E-mail ou senha incorretos.");
    }

    if (!user.emailVerified) {
      const rawToken = await createEmailVerificationToken(email);
      const verifyUrl = buildEmailVerifyUrl(email, rawToken);
      await sendSignupVerificationEmail({
        to: email,
        name: user.name || email.split("@")[0],
        verifyUrl,
      });
      throw new ActionError(
        "Confirm your email before signing in. We sent a new confirmation link."
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await createAuthJsDatabaseSession(user.id);
    redirect({ href: "/for-you", locale: await getLocale() });
  });
}

export async function verifyEmailAndSignIn(email: string, rawToken: string) {
  return withActionError(async () => {
    const normalized = email.trim().toLowerCase();
    const hdrs = await headers();

    if (!normalized || !rawToken) {
      throw new ActionError("Invalid confirmation link.");
    }

    const limit = checkAuthRateLimit(
      authRateLimitKey("verify", normalized, hdrs)
    );
    if (!limit.ok) {
      throw new ActionError(
        "Too many attempts. Try again in a few minutes."
      );
    }

    const valid = await consumeEmailVerificationToken(normalized, rawToken);
    if (!valid) {
      throw new ActionError(
        "This confirmation link is invalid or expired. Sign up again."
      );
    }

    const user = await prisma.user.findUnique({ where: { email: normalized } });
    if (!user?.passwordHash) {
      throw new ActionError("Account not found.");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        lastLoginAt: new Date(),
      },
    });

    await createAuthJsDatabaseSession(user.id);
    redirect({ href: "/onboarding", locale: await getLocale() });
  });
}
