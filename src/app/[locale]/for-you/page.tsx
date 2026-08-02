import { getTranslations, setRequestLocale } from "next-intl/server";
import { listRecommendedProjects } from "@/app/actions";
import { EmptyState } from "@/components/empty-state";
import { ProjectCard } from "@/components/project-card";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ForYouPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("forYou");

  const projects = await listRecommendedProjects();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4 border-b border-[#d0d7de] pb-3">
        <p className="text-xs uppercase tracking-[0.25em] text-[#0969da]">
          {t("eyebrow")}
        </p>
        <h1 className="mt-2 font-display text-3xl text-[#0d1117]">
          {t("title")}
        </h1>
        <p className="mt-2 max-w-2xl text-[#57606a]">{t("subtitle")}</p>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          title={t("emptyTitle")}
          description={t("emptyDescription")}
          actionLabel={t("editProfile")}
          actionHref="/profile"
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div key={project.id} className="space-y-2">
              <ProjectCard
                id={project.id}
                title={project.title}
                description={project.description}
                languages={project.languages}
                tags={project.tags}
                githubLink={project.githubLink}
                ownerName={project.owner.name}
                score={project.score}
                starsCount={project.starsCount}
                isPrivate={project.isPrivate}
                issuesCount={project._count.issues}
                issuesSyncedAt={project.issuesSyncedAt}
              />
              <p className="px-1 text-xs text-[#57606a]">
                {t("breakdownLangs")} {project.breakdown.languageOverlap} ·{" "}
                {t("breakdownTags")} {project.breakdown.tagOverlap} ·{" "}
                {t("breakdownLooking")} {project.breakdown.lookingForOverlap} ·{" "}
                {t("breakdownHist")} {project.breakdown.historyBoost} ·{" "}
                {t("breakdownIssues")} {project.breakdown.issuesBoost} ·{" "}
                {t("breakdownLabels")} {project.breakdown.labelOverlap} ·{" "}
                {t("breakdownStars")} {project.breakdown.starsBoost} ·{" "}
                {t("breakdownSync")} {project.breakdown.freshnessBoost}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
