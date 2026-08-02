import { listProjects } from "@/app/actions";
import { EmptyState } from "@/components/empty-state";
import { ProjectCard } from "@/components/project-card";
import { requireUser } from "@/lib/session";

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; language?: string }>;
}) {
  await requireUser();
  const params = await searchParams;
  const projects = await listProjects({
    q: params.q,
    language: params.language,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4">
        <h1 className="font-display text-3xl text-[#0d1117]">Descobrir projetos</h1>
        <p className="mt-2 text-[#57606a]">
          Filtre por linguagem ou busque por título, descrição e tags.
        </p>
      </div>

      <form className="mb-4 grid gap-3 rounded-xl border border-[#d0d7de] bg-white/90 p-4 shadow-[0_12px_30px_rgba(13,17,23,0.04)] md:grid-cols-[1fr_200px_auto]">
        <div>
          <label htmlFor="q">Busca</label>
          <input
            id="q"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="ex: docs, cli, nextjs"
          />
        </div>
        <div>
          <label htmlFor="language">Linguagem</label>
          <input
            id="language"
            name="language"
            defaultValue={params.language ?? ""}
            placeholder="TypeScript"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            className="h-10 w-full cursor-pointer rounded-md bg-[#24292f] px-4 text-sm text-white transition-colors hover:bg-[#1b1f23]"
          >
            Filtrar
          </button>
        </div>
      </form>

      {projects.length === 0 ? (
        <EmptyState
          title={params.q || params.language ? "Nada por aqui" : "Ainda sem projetos"}
          description={
            params.q || params.language
              ? "Nenhum projeto bate com esses filtros. Tente outra linguagem ou limpe a busca."
              : "Seja o primeiro: publique um projeto ou importe um repositório do GitHub."
          }
          actionLabel="Publicar projeto"
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
            />
          ))}
        </div>
      )}
    </div>
  );
}
