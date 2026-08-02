import Link from "next/link";
import { signInWithEmail } from "@/app/auth-email-actions";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { isSupabaseAuthConfigured } from "@/lib/supabase/server";

export const metadata = {
  title: "Entrar com e-mail",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const configured = isSupabaseAuthConfigured();

  const errorMessage =
    error === "verify_failed"
      ? "Não foi possível confirmar o e-mail. Tente de novo ou peça um novo link."
      : error === "missing_code"
        ? "Link de verificação incompleto."
        : null;

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="mb-6 flex items-center gap-2">
        <BrandMark className="h-7 w-7 text-[#0969da]" />
        <span className="font-display text-2xl text-[#0d1117]">Contribly</span>
      </div>

      <h1 className="font-display text-3xl text-[#0d1117]">Entrar com e-mail</h1>
      <p className="mt-2 text-sm text-[#57606a]">
        Para contas criadas sem GitHub. Desenvolvedores podem continuar entrando
        com GitHub na home.
      </p>

      {errorMessage ? (
        <p className="mt-4 rounded-md border border-[#ffd7d5] bg-[#ffebe9] px-3 py-2 text-sm text-[#cf222e]">
          {errorMessage}
        </p>
      ) : null}

      {!configured ? (
        <p className="mt-6 rounded-md border border-[#fff8c5] bg-[#fff8c5]/60 px-3 py-2 text-sm text-[#9a6700]">
          Configure as variáveis Supabase para ativar. Veja{" "}
          <code>docs/AUTH_EMAIL.md</code>.
        </p>
      ) : (
        <form action={signInWithEmail} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="text-sm text-[#0d1117]">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-1"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm text-[#0d1117]">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-1"
            />
          </div>
          <Button type="submit" variant="primary" size="lg" className="w-full">
            Entrar
          </Button>
        </form>
      )}

      <p className="mt-6 text-sm text-[#57606a]">
        Não tem conta?{" "}
        <Link href="/auth/signup" className="text-[#0969da] hover:underline">
          Criar conta
        </Link>
        {" · "}
        <Link href="/" className="text-[#0969da] hover:underline">
          Entrar com GitHub
        </Link>
      </p>
    </div>
  );
}
