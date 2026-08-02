import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  getMaintainerDashboard,
  markNotificationsByHref,
  syncProjectIssues,
} from "@/app/actions";
import { InterestActions } from "@/components/inbox-actions";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("dashboard");
  const { stats, projects } = await getMaintainerDashboard();
  await markNotificationsByHref("/dashboard");

  const dateLocale = "en-US"; // locale === "pt" ? "pt-BR" : "en-US";

  if (projects.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6">
        <p className="text-xs uppercase tracking-[0.25em] text-[#0969da]">
          {t("eyebrow")}
        </p>
        <h1 className="mt-2 font-display text-3xl text-[#0d1117]">
          {t("title")}
        </h1>
        <div className="mt-4">
          <EmptyState
            title={t("emptyTitle")}
            description={t("emptyDescription")}
            actionLabel={t("publishProject")}
            actionHref="/projects/new"
          />
        </div>
      </div>
    );
  }

  const statEntries: Array<[string, string | number]> = [
    [t("statsProjects"), stats.projects],
    [t("statsPending"), stats.pendingInterests],
    [t("statsAccepted"), stats.acceptedInterests],
    [t("statsAcceptanceRate"), `${stats.acceptanceRate}%`],
    [t("statsRejected"), stats.rejectedInterests],
    [t("statsIssuesSync"), stats.openIssues],
    [t("statsParticipants"), stats.activeParticipants],
    [t("statsTotalStars"), stats.totalStars],
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-6">
      <div className="border-b border-[#d0d7de] pb-3">
        <p className="text-xs uppercase tracking-[0.25em] text-[#0969da]">
          {t("eyebrow")}
        </p>
        <h1 className="mt-2 font-display text-3xl text-[#0d1117]">
          {t("title")}
        </h1>
        <p className="mt-2 text-[#57606a]">{t("subtitle")}</p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {statEntries.map(([label, value]) => (
          <div key={label} className="surface-card p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-[#57606a]">
              {label}
            </p>
            <p className="mt-2 font-display text-3xl text-[#0d1117]">{value}</p>
          </div>
        ))}
      </section>

      {projects.map((project) => (
        <section key={project.id} className="surface-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl text-[#0d1117]">{project.title}</h2>
              <p className="mt-1 text-sm text-[#57606a]">
                {typeof project.starsCount === "number"
                  ? `★ ${project.starsCount} · `
                  : null}
                {t("interestsCount", { count: project._count.interests })} ·{" "}
                {t("issuesCount", { count: project._count.issues })} ·{" "}
                {t("participantsCount", { count: project._count.participations })}
                {project.issuesSyncedAt
                  ? ` · ${t("syncedAt", {
                      date: project.issuesSyncedAt.toLocaleString(dateLocale),
                    })}`
                  : ` · ${t("neverSynced")}`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/projects/${project.id}`}
                className="cursor-pointer rounded-md border border-[#d0d7de] px-3 py-2 text-sm transition hover:border-[#0969da] hover:text-[#0969da]"
              >
                {t("openProject")}
              </Link>
              <form
                action={async () => {
                  "use server";
                  await syncProjectIssues(project.id);
                }}
              >
                <Button type="submit" size="sm" variant="outline">
                  {t("syncIssues")}
                </Button>
              </form>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="font-medium text-[#0d1117]">
                {t("pendingInterestsTitle")}
              </h3>
              {project.interests.length === 0 ? (
                <p className="mt-2 text-sm text-[#57606a]">{t("noPending")}</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {project.interests.map((interest) => (
                    <li
                      key={interest.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#d0d7de] bg-[#fbfcfd] p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {interest.user.name ?? interest.user.githubUsername}
                        </p>
                        <p className="text-xs text-[#57606a]">
                          {interest.user.experienceLevel} ·{" "}
                          {interest.user.languages.join(", ") || t("noLangs")}
                          {interest.user.interestTags.length
                            ? ` · #${interest.user.interestTags.slice(0, 3).join(" #")}`
                            : null}
                        </p>
                      </div>
                      <InterestActions interestId={interest.id} />
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h3 className="font-medium text-[#0d1117]">
                {t("suggestedCandidatesTitle")}
              </h3>
              {project.suggestedCandidates.length === 0 ? (
                <p className="mt-2 text-sm text-[#57606a]">{t("noCandidates")}</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {project.suggestedCandidates.map((candidate) => (
                    <li
                      key={candidate.id}
                      className="rounded-xl border border-[#d0d7de] bg-[#fbfcfd] p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">
                          {candidate.name ?? candidate.githubUsername}
                        </p>
                        <span className="rounded-md bg-[#dafbe1] px-2 py-1 text-xs text-[#1a7f37]">
                          {t("score", { score: candidate.score })}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[#57606a]">
                        {candidate.experienceLevel} ·{" "}
                        {candidate.languages.join(", ") || t("noLangs")}
                      </p>
                      {candidate.interestTags.length > 0 && (
                        <p className="mt-1 text-xs text-[#57606a]">
                          #{candidate.interestTags.slice(0, 4).join(" #")}
                        </p>
                      )}
                      <p className="mt-1 text-[11px] text-[#8c959f]">
                        {t("breakdown", {
                          langs: candidate.breakdown.languageOverlap,
                          tags: candidate.breakdown.tagOverlap,
                          looking: candidate.breakdown.lookingForOverlap,
                        })}
                      </p>
                      <Link
                        href={`/projects/${project.id}#invite-${candidate.id}`}
                        className="mt-2 inline-block cursor-pointer text-xs text-[#0969da] hover:underline"
                      >
                        {t("inviteInProject")}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
