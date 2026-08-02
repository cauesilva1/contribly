import { getTranslations, setRequestLocale } from "next-intl/server";
import { VerifyEmailClient } from "@/components/verify-email-client";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ email?: string; token?: string }>;
};

export default async function VerifyEmailPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth");
  const query = await searchParams;

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-md flex-col justify-center px-4 py-10">
      <div className="surface-card p-5 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-[#0969da]">
          {t("verifyEyebrow")}
        </p>
        <h1 className="mt-2 font-display text-2xl text-[#0d1117]">
          {t("verifyTitle")}
        </h1>
        <p className="mt-2 text-sm text-[#57606a]">{t("verifyHint")}</p>
        <VerifyEmailClient
          email={query.email ?? ""}
          token={query.token ?? ""}
        />
      </div>
    </div>
  );
}
