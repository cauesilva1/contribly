"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { signInWithEmail, signUpWithEmail } from "@/app/auth-email-actions";
import { GithubIcon } from "@/components/github-icon";
import { Button } from "@/components/ui/button";

type Mode = "login" | "signup";

function isNextRedirect(error: unknown) {
  return (
    typeof error === "object" &&
    error &&
    "digest" in error &&
    typeof (error as { digest?: string }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

export function AuthForm({
  githubAction,
  supabaseConfigured,
}: {
  githubAction: () => Promise<void>;
  supabaseConfigured: boolean;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialMode: Mode =
    searchParams.get("mode") === "signup" ? "signup" : "login";
  const [mode, setMode] = useState<Mode>(initialMode);
  const [pending, startTransition] = useTransition();
  const urlError = searchParams.get("error");

  const title = useMemo(
    () => (mode === "login" ? "Entrar no Contribly" : "Criar conta"),
    [mode]
  );

  const bannerError =
    urlError === "verify_failed"
      ? "Não foi possível confirmar o e-mail. Tente de novo."
      : urlError === "missing_code"
        ? "Link de verificação incompleto."
        : null;

  function switchMode(next: Mode) {
    setMode(next);
    const url = next === "signup" ? "/auth?mode=signup" : "/auth";
    router.replace(url);
  }

  function onEmailSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      try {
        if (mode === "signup") {
          await signUpWithEmail(formData);
        } else {
          await signInWithEmail(formData);
        }
      } catch (error) {
        if (isNextRedirect(error)) throw error;
        toast.error(
          error instanceof Error ? error.message : "Não foi possível continuar"
        );
      }
    });
  }

  return (
    <div className="surface-card p-6 md:p-8">
      <div className="flex rounded-lg border border-[#d0d7de] bg-[#f6f8fa] p-1">
        <button
          type="button"
          onClick={() => switchMode("login")}
          className={`flex-1 rounded-md px-3 py-2 text-sm transition-colors ${
            mode === "login"
              ? "bg-white font-medium text-[#0d1117] shadow-sm"
              : "text-[#57606a] hover:text-[#0d1117]"
          }`}
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => switchMode("signup")}
          className={`flex-1 rounded-md px-3 py-2 text-sm transition-colors ${
            mode === "signup"
              ? "bg-white font-medium text-[#0d1117] shadow-sm"
              : "text-[#57606a] hover:text-[#0d1117]"
          }`}
        >
          Criar conta
        </button>
      </div>

      <h1 className="mt-6 font-display text-3xl text-[#0d1117]">{title}</h1>
      <p className="mt-2 text-sm text-[#57606a]">
        {mode === "login"
          ? "GitHub para devs, ou e-mail se você contribui com design, docs e outras áreas."
          : "Crie com e-mail (vamos enviar um link de confirmação) ou use o GitHub."}
      </p>

      {bannerError ? (
        <p className="mt-4 rounded-md border border-[#ffd7d5] bg-[#ffebe9] px-3 py-2 text-sm text-[#cf222e]">
          {bannerError}
        </p>
      ) : null}

      <form action={githubAction} className="mt-6">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={pending}
        >
          <GithubIcon className="h-[1.1rem] w-[1.1rem]" />
          Continuar com GitHub
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-[#8b949e]">
        <span className="h-px flex-1 bg-[#d0d7de]" />
        ou e-mail
        <span className="h-px flex-1 bg-[#d0d7de]" />
      </div>

      {!supabaseConfigured ? (
        <p className="rounded-md border border-[#fff8c5] bg-[#fff8c5]/70 px-3 py-2 text-sm text-[#9a6700]">
          Login por e-mail ainda precisa das variáveis Supabase. Enquanto isso,
          use o GitHub acima.
        </p>
      ) : (
        <form onSubmit={onEmailSubmit} className="space-y-4">
          {mode === "signup" ? (
            <>
              <div>
                <label htmlFor="name" className="text-sm text-[#0d1117]">
                  Nome
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Como quer aparecer"
                  className="mt-1"
                />
              </div>
              <div>
                <label htmlFor="role" className="text-sm text-[#0d1117]">
                  Como você contribui?
                </label>
                <select
                  id="role"
                  name="role"
                  defaultValue="developer"
                  className="mt-1"
                >
                  <option value="developer">Desenvolvimento</option>
                  <option value="designer">Design / UX</option>
                  <option value="docs">Documentação</option>
                  <option value="community">Community / suporte</option>
                  <option value="other">Outro</option>
                </select>
              </div>
            </>
          ) : null}

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
              placeholder="voce@email.com"
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
              minLength={8}
              autoComplete={
                mode === "signup" ? "new-password" : "current-password"
              }
              placeholder={
                mode === "signup" ? "Mínimo 8 caracteres" : "Sua senha"
              }
              className="mt-1"
            />
          </div>

          <Button
            type="submit"
            variant="outline"
            size="lg"
            className="w-full"
            disabled={pending}
          >
            {pending
              ? "Aguarde…"
              : mode === "signup"
                ? "Criar conta e verificar e-mail"
                : "Entrar com e-mail"}
          </Button>
        </form>
      )}
    </div>
  );
}
