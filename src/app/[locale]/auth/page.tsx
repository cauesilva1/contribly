import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { signIn } from "@/auth";
import { AuthForm } from "@/components/auth-form";
import { BrandMark } from "@/components/brand-mark";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function AuthPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth");

  async function githubAction() {
    "use server";
    await signIn("github", { redirectTo: "/onboarding" });
  }

  return (
    <div className="relative h-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(31,111,235,0.16),transparent_40%),radial-gradient(circle_at_90%_0%,rgba(9,105,218,0.1),transparent_35%)]" />
      <div className="relative mx-auto grid h-full max-w-5xl items-center gap-6 px-4 py-3 md:grid-cols-[0.95fr_1.05fr] md:gap-8 md:py-4">
        <div className="hidden md:block">
          <div className="flex items-center gap-2.5 text-[#0d1117]">
            <BrandMark className="h-7 w-7 text-[#0969da]" />
            <span className="font-display text-2xl tracking-tight">
              Contribly
            </span>
          </div>
          <p className="mt-4 text-[11px] uppercase tracking-[0.28em] text-[#57606a]">
            {t("eyebrow")}
          </p>
          <h2 className="mt-2 max-w-md font-display text-3xl leading-snug text-[#0d1117] lg:text-[2.35rem]">
            {t("headline")}
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-[#57606a]">
            {t("supporting")}
          </p>
        </div>

        <div className="w-full max-w-md justify-self-center md:max-w-none md:justify-self-stretch">
          <Suspense
            fallback={
              <div className="surface-card h-72 animate-pulse p-4 sm:p-5" />
            }
          >
            <AuthForm githubAction={githubAction} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
