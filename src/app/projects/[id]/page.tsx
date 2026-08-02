import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProject,
  markNotificationsByHref,
  sendInvite,
  syncProjectIssues,
} from "@/app/actions";
import { InterestActions } from "@/components/inbox-actions";
import { getOptionalUser } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  const user = await getOptionalUser();
  if (user) {
    await markNotificationsByHref(`/projects/${id}`);
  }
  const isOwner = user?.id === project.ownerId;
  const isParticipant =
    !!user &&
    (isOwner ||
      project.participations.some((p) => p.userId === user.id) ||
      project.interests.some(
        (interest) => interest.userId === user.id && interest.status === "accepted"
      ));
  const pendingInterests = project.interests.filter((i) => i.status === "pending");
  const openContributors = isOwner
    ? await prisma.user.findMany({
        where: {
          openToInvites: true,
          id: { not: project.ownerId },
        },
        take: 12,
        orderBy: { updatedAt: "desc" },
      })
    : [];

  async function syncAction() {
    "use server";
    await syncProjectIssues(id);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <article className="surface-card p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-[#57606a]">
          {project.source === "github_import" ? "Importado do GitHub" : "Cadastro manual"}
        </p>
        <h1 className="mt-2 font-display text-3xl text-[#0d1117] md:text-5xl">
          {project.title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-[#57606a]">{project.description}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {project.languages.map((lang) => (
            <span
              key={lang}
              className="rounded-md bg-[#ddf4ff] px-2 py-1 text-xs text-[#0969da]"
            >
              {lang}
            </span>
          ))}
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-[#f6f8fa] px-2 py-1 text-xs text-[#57606a]"
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={project.githubLink}
            target="_blank"
            rel="noreferrer"
            className="cursor-pointer rounded-md bg-[#24292f] px-4 py-2 text-sm text-white transition-colors hover:bg-[#1b1f23]"
          >
            Abrir no GitHub
          </a>
          <Link
            href="/swipe"
            className="cursor-pointer rounded-md border border-[#d0d7de] px-4 py-2 text-sm transition-colors hover:bg-[#f6f8fa]"
          >
            Ir para swipe
          </Link>
          {isParticipant && (
            <Link
              href={`/matches/${project.id}`}
              className="cursor-pointer rounded-md border border-[#1f6feb] px-4 py-2 text-sm text-[#0969da] transition-colors hover:bg-[#ddf4ff]"
            >
              Abrir thread do match
            </Link>
          )}
        </div>

        <p className="mt-6 text-sm text-[#57606a]">
          Mantenedor: {project.owner.name ?? project.owner.githubUsername ?? "Anônimo"}
        </p>
      </article>

      <section className="mt-8 rounded-xl border border-[#d0d7de] bg-white p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl">Good first issues</h2>
            <p className="mt-1 text-sm text-[#57606a]">
              Issues abertas com labels como good first issue / help wanted.
            </p>
          </div>
          {isOwner && (
            <form action={syncAction}>
              <Button type="submit" variant="outline" size="sm">
                Sincronizar do GitHub
              </Button>
            </form>
          )}
        </div>

        {project.issues.length === 0 ? (
          <p className="mt-4 text-sm text-[#57606a]">
            Nenhuma issue sincronizada ainda.
            {isOwner
              ? " Clique em sincronizar para buscar no repositório."
              : ""}
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {project.issues.map((issue) => (
              <li
                key={issue.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#d0d7de] p-3"
              >
                <div>
                  <p className="font-medium">
                    #{issue.number} {issue.title}
                  </p>
                  <p className="text-xs text-[#57606a]">
                    {issue.labels.join(", ") || "sem labels"}
                  </p>
                </div>
                <a
                  href={issue.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-[#0969da] hover:underline"
                >
                  Abrir issue
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {isOwner && (
        <section className="mt-5 space-y-4">
          <div className="rounded-xl border border-[#d0d7de] bg-white p-6">
            <h2 className="font-display text-2xl">Interesses pendentes</h2>
            {pendingInterests.length === 0 ? (
              <p className="mt-3 text-sm text-[#57606a]">Nenhum interesse pendente.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {pendingInterests.map((interest) => (
                  <li
                    key={interest.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#d0d7de] p-3"
                  >
                    <div>
                      <p className="font-medium">
                        {interest.user.name ?? interest.user.githubUsername}
                      </p>
                      <p className="text-sm text-[#57606a]">
                        {interest.user.languages.join(", ") || "Sem linguagens"}
                      </p>
                    </div>
                    <InterestActions interestId={interest.id} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-[#d0d7de] bg-white p-6">
            <h2 className="font-display text-2xl">Convidar contribuidores</h2>
            <p className="mt-2 text-sm text-[#57606a]">
              Opcionalmente amarre o convite a uma issue sincronizada.
            </p>
            <ul className="mt-4 space-y-3">
              {openContributors.map((contributor) => (
                <li
                  key={contributor.id}
                  className="rounded-lg border border-[#d0d7de] p-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">
                        {contributor.name ?? contributor.githubUsername}
                      </p>
                      <p className="text-sm text-[#57606a]">
                        {contributor.bio || "Sem bio"}
                      </p>
                    </div>
                    <form action={sendInvite} className="flex min-w-[260px] flex-col gap-2">
                      <input type="hidden" name="projectId" value={project.id} />
                      <input type="hidden" name="toUserId" value={contributor.id} />
                      <IssueInviteFields issues={project.issues} />
                      <select name="issueNumber" defaultValue="" className="text-sm">
                        <option value="">Sem issue específica</option>
                        {project.issues.map((issue) => (
                          <option key={issue.id} value={issue.number}>
                            #{issue.number} {issue.title}
                          </option>
                        ))}
                      </select>
                      <input name="message" placeholder="Mensagem opcional" />
                      <Button type="submit" size="sm">
                        Convidar
                      </Button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {project.participations.length > 0 && (
        <section className="mt-8 rounded-xl border border-[#d0d7de] bg-white p-6">
          <h2 className="font-display text-2xl">Participantes</h2>
          <ul className="mt-4 space-y-2 text-sm text-[#57606a]">
            {project.participations.map((participation) => (
              <li key={participation.id}>
                {participation.user.name ?? participation.user.githubUsername}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function IssueInviteFields({
  issues,
}: {
  issues: Array<{ number: number; url: string; title: string }>;
}) {
  // Server component helper: encode selected issue via paired hidden fields resolved in action
  // We keep a compact select that the action reads, then map number -> url/title in action.
  return (
    <>
      {issues.map((issue) => (
        <input
          key={issue.number}
          type="hidden"
          name={`issue_${issue.number}_url`}
          value={issue.url}
        />
      ))}
      {issues.map((issue) => (
        <input
          key={`${issue.number}-title`}
          type="hidden"
          name={`issue_${issue.number}_title`}
          value={issue.title}
        />
      ))}
    </>
  );
}
