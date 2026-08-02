import Link from "next/link";
import { resendVerificationEmail } from "@/app/auth-email-actions";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Verifique seu e-mail",
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; resent?: string }>;
}) {
  const { email, resent } = await searchParams;

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(31,111,235,0.16),transparent_40%),radial-gradient(circle_at_90%_0%,rgba(9,105,218,0.1),transparent_35%)]" />
      <div className="relative mx-auto max-w-lg px-4 py-12">
        <Link href="/" className="inline-flex items-center gap-2.5 text-[#0d1117]">
          <BrandMark className="h-7 w-7 text-[#0969da]" />
          <span className="font-display text-2xl">Contribly</span>
        </Link>

        <article className="surface-card mt-8 p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.25em] text-[#0969da]">
            Open source matchmaking
          </p>
          <h1 className="mt-2 font-display text-3xl text-[#0d1117]">
            Verifique seu e-mail
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#57606a]">
            Enviamos um link de confirmação
            {email ? (
              <>
                {" "}
                para <strong className="text-[#0d1117]">{email}</strong>
              </>
            ) : null}
            . Abra a mensagem e continue no Contribly.
          </p>

          {resent === "1" ? (
            <p className="mt-4 rounded-md bg-[#ddf4ff] px-3 py-2 text-sm text-[#0969da]">
              E-mail reenviado (se a conta existir e ainda não estiver confirmada).
            </p>
          ) : null}

          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-[#57606a]">
            <li>Confira spam / promoções</li>
            <li>O link autentica só a sua conta — não compartilhe</li>
          </ul>

          {email ? (
            <form action={resendVerificationEmail} className="mt-6">
              <input type="hidden" name="email" value={email} />
              <Button type="submit" variant="outline" size="sm">
                Reenviar e-mail
              </Button>
            </form>
          ) : null}

          <p className="mt-8 text-sm text-[#57606a]">
            Já confirmou?{" "}
            <Link href="/auth" className="text-[#0969da] hover:underline">
              Entrar
            </Link>
          </p>
        </article>
      </div>
    </div>
  );
}
