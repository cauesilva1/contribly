"use server";

import { redirect } from "next/navigation";
import type { ContributorRole } from "@prisma/client";
import { ActionError, withActionError } from "@/lib/action-error";
import { getSiteUrl } from "@/lib/site-url";
import { bridgeSupabaseUserToAuthJs } from "@/lib/supabase/bridge-session";
import {
  createSupabaseServerClient,
  isSupabaseAuthConfigured,
} from "@/lib/supabase/server";

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
    if (!isSupabaseAuthConfigured()) {
      throw new ActionError(
        "Login por e-mail ainda não está configurado (variáveis Supabase)."
      );
    }

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

    const supabase = await createSupabaseServerClient();
    const site = getSiteUrl();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${site}/auth/callback`,
        data: {
          name: name || email.split("@")[0],
          role,
        },
      },
    });

    if (error) {
      throw new ActionError(error.message);
    }

    // Se o projeto Supabase exige confirmação, session vem null.
    if (data.session && data.user) {
      await bridgeSupabaseUserToAuthJs({
        supabaseUserId: data.user.id,
        email: data.user.email ?? email,
        emailVerified: Boolean(data.user.email_confirmed_at),
        name: name || null,
        role,
      });
      redirect("/onboarding");
    }

    redirect(`/auth/verify?email=${encodeURIComponent(email)}`);
  });
}

export async function signInWithEmail(formData: FormData) {
  return withActionError(async () => {
    if (!isSupabaseAuthConfigured()) {
      throw new ActionError(
        "Login por e-mail ainda não está configurado (variáveis Supabase)."
      );
    }

    const email = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      throw new ActionError("Informe e-mail e senha.");
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new ActionError(error.message);
    }
    if (!data.user?.email) {
      throw new ActionError("Login inválido.");
    }

    if (!data.user.email_confirmed_at) {
      redirect(`/auth/verify?email=${encodeURIComponent(email)}`);
    }

    const meta = data.user.user_metadata as {
      name?: string;
      role?: ContributorRole;
    };

    await bridgeSupabaseUserToAuthJs({
      supabaseUserId: data.user.id,
      email: data.user.email,
      emailVerified: true,
      name: meta.name ?? null,
      role: meta.role,
    });

    redirect("/for-you");
  });
}

export async function resendVerificationEmail(formData: FormData) {
  return withActionError(async () => {
    if (!isSupabaseAuthConfigured()) {
      throw new ActionError("Supabase Auth não configurado.");
    }

    const email = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();
    if (!email) throw new ActionError("Informe o e-mail.");

    const supabase = await createSupabaseServerClient();
    const site = getSiteUrl();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${site}/auth/callback`,
      },
    });

    if (error) throw new ActionError(error.message);
    return { ok: true as const };
  });
}
