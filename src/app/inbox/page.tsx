import {
  getInboxData,
  markNotificationsRead,
} from "@/app/actions";
import { Button } from "@/components/ui/button";
import { InterestActions, InviteActions } from "@/components/inbox-actions";
import { NotificationLink } from "@/components/notification-link";

export default async function InboxPage() {
  const data = await getInboxData();

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-[#0d1117]">Inbox</h1>
          <p className="mt-2 text-[#57606a]">
            Interesses, convites e notificações do seu matchmaking.
          </p>
        </div>
        <form action={markNotificationsRead}>
          <Button type="submit" variant="outline" size="sm">
            Marcar notificações como lidas
          </Button>
        </form>
      </div>

      <section className="rounded-xl border border-[#d0d7de] bg-white p-6">
        <h2 className="font-display text-2xl">Interesses nos seus projetos</h2>
        {data.interests.length === 0 ? (
          <p className="mt-3 text-sm text-[#57606a]">
            Nada pendente. Quando alguém der swipe de interesse, aparece aqui.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {data.interests.map((interest) => (
              <li
                key={interest.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#d0d7de] p-3"
              >
                <div>
                  <p className="font-medium">
                    {interest.user.name ?? interest.user.githubUsername} →{" "}
                    {interest.project.title}
                  </p>
                </div>
                <InterestActions interestId={interest.id} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-[#d0d7de] bg-white p-6">
        <h2 className="font-display text-2xl">Convites recebidos</h2>
        {data.invites.length === 0 ? (
          <p className="mt-3 text-sm text-[#57606a]">
            Nenhum convite no momento. Mantenha o perfil aberto a convites.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {data.invites.map((invite) => (
              <li
                key={invite.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#d0d7de] p-3"
              >
                <div>
                  <p className="font-medium">
                    {invite.fromUser.name ?? invite.fromUser.githubUsername}{" "}
                    convidou você para {invite.project.title}
                  </p>
                  {invite.issueTitle && (
                    <p className="text-sm text-[#0969da]">
                      Issue #{invite.issueNumber}: {invite.issueTitle}
                      {invite.issueUrl ? (
                        <>
                          {" · "}
                          <a
                            href={invite.issueUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline"
                          >
                            abrir
                          </a>
                        </>
                      ) : null}
                    </p>
                  )}
                  {invite.message && (
                    <p className="text-sm text-[#57606a]">{invite.message}</p>
                  )}
                </div>
                <InviteActions inviteId={invite.id} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-[#d0d7de] bg-white p-6">
        <h2 className="font-display text-2xl">Notificações</h2>
        {data.notifications.length === 0 ? (
          <p className="mt-3 text-sm text-[#57606a]">
            Sem notificações ainda. Aceites e convites geram alertas aqui.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {data.notifications.map((notification) => (
              <li
                key={notification.id}
                className={`rounded-lg border p-3 ${
                  notification.read
                    ? "border-[#d0d7de] bg-white"
                    : "border-[#54aeff66] bg-[#ddf4ff]"
                }`}
              >
                <p className="font-medium">{notification.title}</p>
                <p className="text-sm text-[#57606a]">{notification.body}</p>
                {notification.href && (
                  <NotificationLink
                    notificationId={notification.id}
                    href={notification.href}
                  >
                    Abrir
                  </NotificationLink>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
