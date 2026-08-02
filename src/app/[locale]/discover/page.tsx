import { getTranslations, setRequestLocale } from "next-intl/server";
import { listProjects } from "@/app/actions";
import { EmptyState } from "@/components/empty-state";
import { ProjectCard } from "@/components/project-card";
import { requireUser } from "@/lib/session";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; language?: string }>;
};

export default async function DiscoverPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("discover");
  const tCommon = await getTranslations("common");

  await requireUser();
  const query = await searchParams;
  const projects = await listProjects({
    q: query.q,
    language: query.language,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4">
        <h1 className="font-display text-3xl text-[#0d1117]">{t("title")}</h1>
        <p className="mt-2 text-[#57606a]">{t("subtitle")}</p>
      </div>

      <form className="mb-4 grid gap-3 rounded-xl border border-[#d0d7de] bg-white/90 p-4 shadow-[0_12px_30px_rgba(13,17,23,0.04)] md:grid-cols-[1fr_200px_auto]">
        <div>
          <label htmlFor="q">{t("searchLabel")}</label>
          <input
            id="q"
            name="q"
            defaultValue={query.q ?? ""}
            placeholder={t("searchPlaceholder")}
          />
        </div>
        <div>
          <label htmlFor="language">{t("languageLabel")}</label>
          <input
            id="language"
            name="language"
            defaultValue={query.language ?? ""}
            placeholder={t("languagePlaceholder")}
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            className="h-10 w-full cursor-pointer rounded-md bg-[#24292f] px-4 text-sm text-white transition-colors hover:bg-[#1b1f23]"
          >
            {t("filter")}
          </button>
        </div>
      </form>

      {projects.length === 0 ? (
        <EmptyState
          title={
            query.q || query.language
              ? t("emptyFilteredTitle")
              : t("emptyTitle")
          }
          description={
            query.q || query.language
              ? t("emptyFilteredDescription")
              : t("emptyDescription")
          }
          actionLabel={tCommon("publishProject")}
          actionHref="/projects/new"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              title={project.title}
              description={project.description}
              languages={project.languages}
              tags={project.tags}
              githubLink={project.githubLink}
              ownerName={project.owner.name}
              score={project.score}
              starsCount={project.starsCount}
              issuesCount={project._count.issues}
              issuesSyncedAt={project.issuesSyncedAt}
            />
          ))}
        </div>
      )}
    </div>
  );
}
