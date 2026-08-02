import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { listProjects } from "@/app/actions";
import { AuthRequiredToast } from "@/components/auth-required-toast";
import { BrandMark } from "@/components/brand-mark";
import { EmptyState } from "@/components/empty-state";
import { HeroCodePanel } from "@/components/hero-code-panel";
import { ProjectCard } from "@/components/project-card";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getSession } from "@/lib/session";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const session = await getSession();
  const projects = await listProjects();
  const highlights = projects.slice(0, 3);

  const steps = [
    ["1", t("step1Title"), t("step1Text")],
    ["2", t("step2Title"), t("step2Text")],
    ["3", t("step3Title"), t("step3Text")],
  ] as const;

  return (
    <div>
      <Suspense fallback={null}>
        <AuthRequiredToast />
      </Suspense>

      <section className="relative overflow-hidden border-b border-[#d0d7de]/60">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(31,111,235,0.16),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(9,105,218,0.1),transparent_35%)]" />
        <div className="relative mx-auto grid min-h-[auto] max-w-6xl items-center gap-8 px-4 py-6 md:grid-cols-2 md:gap-8 md:py-12">
          <div>
            <div className="flex items-center gap-3">
              <BrandMark className="h-8 w-8 text-[#0969da]" />
              <p className="text-xs uppercase tracking-[0.28em] text-[#57606a]">
                {t("eyebrow")}
              </p>
            </div>
            <h1 className="mt-3 max-w-xl font-display text-5xl leading-[0.95] text-[#0d1117] sm:text-6xl">
              {t("headline")}
            </h1>
            <p className="mt-4 max-w-md text-base text-[#57606a] md:text-lg">
              {t("subtitle")}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {session?.user ? (
                <>
                  <Button asChild variant="primary" size="lg">
                    <Link href="/for-you">{t("ctaRecommendations")}</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/swipe">{t("ctaSwipe")}</Link>
                  </Button>
                </>
              ) : (
                <Button asChild variant="primary" size="lg">
                  <Link href="/auth">{t("ctaJoin")}</Link>
                </Button>
              )}
            </div>
          </div>

          <HeroCodePanel />
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <section className="grid gap-5 md:grid-cols-3">
          {steps.map(([step, title, text]) => (
            <div key={step} className="border-t border-[#d0d7de] pt-3">
              <p className="text-xs uppercase tracking-[0.2em] text-[#0969da]">
                {t("stepLabel", { step })}
              </p>
              <h2 className="mt-2 font-display text-xl text-[#0d1117]">
                {title}
              </h2>
              <p className="mt-1.5 text-sm text-[#57606a]">{text}</p>
            </div>
          ))}
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl text-[#0d1117]">
                {t("highlightsTitle")}
              </h2>
              <p className="text-sm text-[#57606a]">{t("highlightsSubtitle")}</p>
            </div>
            <Link
              href="/discover"
              className="cursor-pointer text-sm text-[#0969da] hover:underline"
            >
              {t("viewAll")}
            </Link>
          </div>

          {highlights.length === 0 ? (
            <EmptyState
              title={t("emptyTitle")}
              description={t("emptyDescription")}
              actionLabel={session?.user ? t("emptyAction") : undefined}
              actionHref={session?.user ? "/projects/new" : undefined}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {highlights.map((project) => (
                <ProjectCard
                  key={project.id}
                  id={project.id}
                  title={project.title}
                  description={project.description}
                  languages={project.languages}
                  tags={project.tags}
                  githubLink={project.githubLink}
                  ownerName={project.owner.name}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <SiteFooter />
    </div>
  );
}
