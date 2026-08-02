import Link from "next/link";
import {
  getMaintainerDashboard,
  markNotificationsByHref,
  syncProjectIssues,
} from "@/app/actions";
import { InterestActions } from "@/components/inbox-actions";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";

export default async function DashboardPage() {
  const { stats, projects } = await getMaintainerDashboard();
  await markNotificationsByHref("/dashboard");

  if (projects.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="font-display text-4xl text-[#0d1117]">Painel do mantenedor</h1>
        <div className="mt-8">
          <EmptyState
            title="Você ainda não publicou projetos"
            description="Publique ou importe um repositório para ver candidatos, interesses e analytics."
            actionLabel="Publicar projeto"
            actionHref="/projects/new"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <div>
        <h1 className="font-display text-4xl text-[#0d1117]">Painel do mantenedor</h1>
        <p className="mt-2 text-[#57606a]">
          Analytics, interesses pendentes e candidatos sugeridos pelo matchmaking.
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ["Projetos", stats.projects],
          ["Interesses pendentes", stats.pendingInterests],
          ["Aceitos", stats.acceptedInterests],
          ["Recusados", stats.rejectedInterests],
          ["Issues abertas sync", stats.openIssues],
          ["Participantes ativos", stats.activeParticipants],
        ].map(([label, value]) => (
          <div
            key={label as string}
            className="rounded-xl border border-[#d0d7de] bg-white p-4"
          >
            <p className="text-xs uppercase tracking-[0.15em] text-[#57606a]">
              {label}
            </p>
            <p className="mt-2 font-display text-3xl text-[#0d1117]">{value}</p>
          </div>
        ))}
      </section>

      {projects.map((project) => (
        <section
          key={project.id}
          className="rounded-xl border border-[#d0d7de] bg-white p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl text-[#0d1117]">{project.title}</h2>
              <p className="mt-1 text-sm text-[#57606a]">
                {project._count.interests} interesses · {project._count.issues} issues ·{" "}
                {project._count.participations} participantes
                {project.issuesSyncedAt
                  ? ` · sync ${project.issuesSyncedAt.toLocaleString("pt-BR")}`
                  : " · nunca sincronizado"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/projects/${project.id}`}
                className="rounded-md border border-[#d0d7de] px-3 py-2 text-sm"
              >
                Abrir projeto
              </Link>
              <form
                action={async () => {
                  "use server";
                  await syncProjectIssues(project.id);
                }}
              >
                <Button type="submit" size="sm" variant="outline">
                  Sync issues
                </Button>
              </form>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="font-medium text-[#0d1117]">Interesses pendentes</h3>
              {project.interests.length === 0 ? (
                <p className="mt-2 text-sm text-[#57606a]">Nenhum pendente.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {project.interests.map((interest) => (
                    <li
                      key={interest.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#d0d7de] p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {interest.user.name ?? interest.user.githubUsername}
                        </p>
                        <p className="text-xs text-[#57606a]">
                          {interest.user.experienceLevel} ·{" "}
                          {interest.user.languages.join(", ") || "sem langs"}
                        </p>
                      </div>
                      <InterestActions interestId={interest.id} />
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h3 className="font-medium text-[#0d1117]">Candidatos sugeridos</h3>
              {project.suggestedCandidates.length === 0 ? (
                <p className="mt-2 text-sm text-[#57606a]">
                  Sem candidatos com overlap suficiente.
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {project.suggestedCandidates.map((candidate) => (
                    <li
                      key={candidate.id}
                      className="rounded-lg border border-[#d0d7de] p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">
                          {candidate.name ?? candidate.githubUsername}
                        </p>
                        <span className="rounded-md bg-[#dafbe1] px-2 py-1 text-xs text-[#1a7f37]">
                          score {candidate.score}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[#57606a]">
                        {candidate.experienceLevel} ·{" "}
                        {candidate.languages.join(", ") || "sem langs"}
                      </p>
                      <Link
                        href={`/projects/${project.id}`}
                        className="mt-2 inline-block text-xs text-[#0969da] hover:underline"
                      >
                        Convidar no projeto
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
