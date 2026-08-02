import { Suspense } from "react";
import Link from "next/link";
import { signIn } from "@/auth";
import { AuthForm } from "@/components/auth-form";
import { BrandMark } from "@/components/brand-mark";
import { isSupabaseAuthConfigured } from "@/lib/supabase/server";

export const metadata = {
  title: "Entrar",
  description: "Entre com GitHub ou e-mail no Contribly.",
};

export default function AuthPage() {
  const supabaseConfigured = isSupabaseAuthConfigured();

  async function githubAction() {
    "use server";
    await signIn("github", { redirectTo: "/onboarding" });
  }

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(31,111,235,0.16),transparent_40%),radial-gradient(circle_at_90%_0%,rgba(9,105,218,0.1),transparent_35%)]" />
      <div className="relative mx-auto grid max-w-5xl gap-10 px-4 py-10 md:grid-cols-[1fr_1.1fr] md:items-center md:py-16">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5 text-[#0d1117]">
            <BrandMark className="h-8 w-8 text-[#0969da]" />
            <span className="font-display text-3xl tracking-tight">Contribly</span>
          </Link>
          <p className="mt-6 text-xs uppercase tracking-[0.28em] text-[#57606a]">
            Open source matchmaking
          </p>
          <h2 className="mt-3 max-w-md font-display text-4xl leading-tight text-[#0d1117]">
            Uma porta de entrada para quem quer contribuir.
          </h2>
          <p className="mt-4 max-w-md text-[#57606a]">
            Dev, design, docs ou community — escolha GitHub ou e-mail. Sem poluir
            o resto do app.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="surface-card h-80 animate-pulse p-6 md:p-8" />
          }
        >
          <AuthForm
            githubAction={githubAction}
            supabaseConfigured={supabaseConfigured}
          />
        </Suspense>
      </div>
    </div>
  );
}
