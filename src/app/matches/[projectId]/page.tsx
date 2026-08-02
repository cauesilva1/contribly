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
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[#57606a]">
          Thread do match
        </p>
        <h1 className="mt-2 font-display text-3xl text-[#0d1117]">
          {project.title}
        </h1>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <a
            href={project.githubLink}
            target="_blank"
            rel="noreferrer"
            className="text-[#0969da] hover:underline"
          >
            Abrir repositório
          </a>
          <Link href={`/projects/${project.id}`} className="text-[#0969da] hover:underline">
            Ver projeto
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-[#d0d7de] bg-white p-4">
        <ul className="max-h-[480px] space-y-3 overflow-y-auto">
          {messages.length === 0 ? (
            <li className="text-sm text-[#57606a]">
              Nenhuma mensagem ainda. Combine a primeira issue ou o próximo passo.
            </li>
          ) : (
            messages.map((message) => {
              const mine = message.senderId === currentUserId;
              return (
                <li
                  key={message.id}
                  className={`rounded-lg border p-3 ${
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
          <label htmlFor="body">Mensagem</label>
          <textarea
            id="body"
            name="body"
            rows={3}
            required
            placeholder="Ex.: posso pegar a issue #12 de docs?"
          />
          <div className="mt-3">
            <Button type="submit" variant="primary">
              Enviar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
