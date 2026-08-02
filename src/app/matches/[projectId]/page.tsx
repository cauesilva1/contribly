import Link from "next/link";
import { getMatchThread, markNotificationsByHref, sendMatchMessage } from "@/app/actions";
import { Button } from "@/components/ui/button";

export default async function MatchThreadPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const { project, messages, currentUserId } = await getMatchThread(projectId);
  await markNotificationsByHref(`/matches/${projectId}`);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-6 border-b border-[#d0d7de] pb-3">
        <p className="text-xs uppercase tracking-[0.25em] text-[#0969da]">
          Thread do match
        </p>
        <h1 className="mt-2 font-display text-3xl text-[#0d1117] md:text-4xl">
          {project.title}
        </h1>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <a
            href={project.githubLink}
            target="_blank"
            rel="noreferrer"
            className="cursor-pointer text-[#0969da] hover:underline"
          >
            Abrir repositório
          </a>
          <Link
            href={`/projects/${project.id}`}
            className="cursor-pointer text-[#0969da] hover:underline"
          >
            Ver projeto
          </Link>
        </div>
      </div>

      <div className="surface-card p-4 md:p-6">
        <ul className="max-h-[480px] space-y-3 overflow-y-auto">
          {messages.length === 0 ? (
            <li className="rounded-xl bg-[#f6f8fa] p-4 text-sm text-[#57606a]">
              Nenhuma mensagem ainda. Combine a primeira issue ou o próximo passo.
            </li>
          ) : (
            messages.map((message) => {
              const mine = message.senderId === currentUserId;
              return (
                <li
                  key={message.id}
                  className={`rounded-xl border p-3 ${
                    mine
                      ? "border-[#54aeff66] bg-[#ddf4ff]"
                      : "border-[#d0d7de] bg-[#f6f8fa]"
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between gap-2 text-xs text-[#57606a]">
                    <span>
                      {message.sender.name ??
                        message.sender.githubUsername ??
                        "Usuário"}
                    </span>
                    <time dateTime={message.createdAt.toISOString()}>
                      {message.createdAt.toLocaleString("pt-BR")}
                    </time>
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-[#0d1117]">
                    {message.body}
                  </p>
                </li>
              );
            })
          )}
        </ul>

        <form action={sendMatchMessage} className="mt-4 border-t border-[#d0d7de] pt-4">
          <input type="hidden" name="projectId" value={project.id} />
          <div className="field">
            <label htmlFor="body">Mensagem</label>
            <textarea
              id="body"
              name="body"
              rows={3}
              required
              placeholder="Ex.: posso pegar a issue #12 de docs?"
            />
          </div>
          <div className="mt-1">
            <Button type="submit" variant="primary">
              Enviar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
