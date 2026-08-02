import { listRecommendedProjects } from "@/app/actions";
import { EmptyState } from "@/components/empty-state";
import { ProjectCard } from "@/components/project-card";

export default async function ForYouPage() {
  const projects = await listRecommendedProjects();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display text-4xl text-[#0d1117]">Pra você</h1>
        <p className="mt-2 text-[#57606a]">
          Ranking com overlap de linguagens, tags de interesse, histórico de
          swipes, good first issues e seu nível de experiência.
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
              />
              <p className="px-1 text-xs text-[#57606a]">
                langs {project.breakdown.languageOverlap} · tags{" "}
                {project.breakdown.tagOverlap} · lookingFor{" "}
                {project.breakdown.lookingForOverlap} · histórico{" "}
                {project.breakdown.historyBoost} · issues{" "}
                {project.breakdown.issuesBoost} · exp{" "}
                {project.breakdown.experienceBoost}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
