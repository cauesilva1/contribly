import Link from "next/link";
import { signUpWithEmail } from "@/app/auth-email-actions";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { isSupabaseAuthConfigured } from "@/lib/supabase/server";

export const metadata = {
  title: "Criar conta",
};

export default function SignUpPage() {
  const configured = isSupabaseAuthConfigured();

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="mb-6 flex items-center gap-2">
        <BrandMark className="h-7 w-7 text-[#0969da]" />
        <span className="font-display text-2xl text-[#0d1117]">Contribly</span>
      </div>

      <h1 className="font-display text-3xl text-[#0d1117]">Criar conta</h1>
      <p className="mt-2 text-sm text-[#57606a]">
        Para contribuidores sem GitHub — design, docs, community e mais. Você
        recebe um e-mail para confirmar o endereço.
      </p>

      {!configured ? (
        <p className="mt-6 rounded-md border border-[#fff8c5] bg-[#fff8c5]/60 px-3 py-2 text-sm text-[#9a6700]">
          Configure <code>NEXT_PUBLIC_SUPABASE_URL</code> e{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> para ativar este fluxo. Veja{" "}
          <code>docs/AUTH_EMAIL.md</code>.
        </p>
      ) : (
        <form action={signUpWithEmail} className="mt-6 space-y-4">
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
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              className="mt-1"
            />
          </div>
          <div>
            <label htmlFor="role" className="text-sm text-[#0d1117]">
              Como você contribui?
            </label>
            <select id="role" name="role" defaultValue="developer" className="mt-1">
              <option value="developer">Desenvolvimento</option>
              <option value="designer">Design / UX</option>
              <option value="docs">Documentação</option>
              <option value="community">Community / suporte</option>
              <option value="other">Outro</option>
            </select>
          </div>
          <Button type="submit" variant="primary" size="lg" className="w-full">
            Criar conta e enviar e-mail
          </Button>
        </form>
      )}

      <p className="mt-6 text-sm text-[#57606a]">
        Já tem conta?{" "}
        <Link href="/auth/login" className="text-[#0969da] hover:underline">
          Entrar
        </Link>
        {" · "}
        <Link href="/" className="text-[#0969da] hover:underline">
          GitHub
        </Link>
      </p>
    </div>
  );
}
