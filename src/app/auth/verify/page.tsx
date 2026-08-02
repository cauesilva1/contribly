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
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="mb-6 flex items-center gap-2">
        <BrandMark className="h-7 w-7 text-[#0969da]" />
        <span className="font-display text-2xl text-[#0d1117]">Contribly</span>
      </div>

      <h1 className="font-display text-3xl text-[#0d1117]">
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
        . Abra a mensagem e clique em <em>Confirm your email</em> para ativar a
        conta. Depois disso você já entra no Contribly.
      </p>

      <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-[#57606a]">
        <li>Confira a pasta de spam / promoções</li>
        <li>O link expira (padrão Supabase: algumas horas)</li>
        <li>Não compartilhe o link — ele autentica a sua conta</li>
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
        <Link href="/auth/login" className="text-[#0969da] hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
