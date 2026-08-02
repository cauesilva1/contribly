import { NextResponse } from "next/server";
import { bridgeSupabaseUserToAuthJs } from "@/lib/supabase/bridge-session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ContributorRole } from "@prisma/client";

/**
 * Callback após o usuário clicar no link de verificação do e-mail (Supabase).
 * Troca o code PKCE por sessão Supabase e cria sessão Auth.js no Prisma.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/onboarding";

  if (!code) {
    return NextResponse.redirect(`${origin}/auth?error=missing_code`);
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.user?.email) {
      return NextResponse.redirect(`${origin}/auth?error=verify_failed`);
    }

    const meta = data.user.user_metadata as {
      name?: string;
      role?: ContributorRole;
    };

    await bridgeSupabaseUserToAuthJs({
      supabaseUserId: data.user.id,
      email: data.user.email,
      emailVerified: Boolean(data.user.email_confirmed_at),
      name: meta.name ?? null,
      role: meta.role,
    });

    return NextResponse.redirect(`${origin}${next.startsWith("/") ? next : "/onboarding"}`);
  } catch {
    return NextResponse.redirect(`${origin}/auth?error=verify_failed`);
  }
}
