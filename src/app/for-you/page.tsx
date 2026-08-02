import { listRecommendedProjects } from "@/app/actions";
import { EmptyState } from "@/components/empty-state";
import { ProjectCard } from "@/components/project-card";

export default async function ForYouPage() {
  const projects = await listRecommendedProjects();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4 border-b border-[#d0d7de] pb-3">
        <p className="text-xs uppercase tracking-[0.25em] text-[#0969da]">
          Recomendações
        </p>
        <h1 className="mt-2 font-display text-3xl text-[#0d1117]">Pra você</h1>
        <p className="mt-2 max-w-2xl text-[#57606a]">
          Ranking com linguagens, tags, histórico de swipes, labels de issues,
          stars, frescor do sync e seu nível de experiência.
        </p>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          title="Sem recomendações ainda"
          description="Atualize linguagens/interesses no perfil ou publique/importe mais projetos."
          actionLabel="Editar perfil"
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
                issuesCount={project._count.issues}
                issuesSyncedAt={project.issuesSyncedAt}
              />
              <p className="px-1 text-xs text-[#57606a]">
                langs {project.breakdown.languageOverlap} · tags{" "}
                {project.breakdown.tagOverlap} · looking{" "}
                {project.breakdown.lookingForOverlap} · hist{" "}
                {project.breakdown.historyBoost} · issues{" "}
                {project.breakdown.issuesBoost} · labels{" "}
                {project.breakdown.labelOverlap} · stars{" "}
                {project.breakdown.starsBoost} · sync{" "}
                {project.breakdown.freshnessBoost}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
