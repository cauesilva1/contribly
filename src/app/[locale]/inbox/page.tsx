import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  getInboxData,
  markNotificationsRead,
} from "@/app/actions";
import { Button } from "@/components/ui/button";
import { InterestActions, InviteActions } from "@/components/inbox-actions";
import { NotificationLink } from "@/components/notification-link";

function InboxSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="surface-card p-4">
      <h2 className="font-display text-xl text-[#0d1117]">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function InboxPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("inbox");
  const tCommon = await getTranslations("common");

  const data = await getInboxData();

  return (
    <div className="mx-auto max-w-4xl space-y-4 px-4 py-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#d0d7de] pb-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#0969da]">
            {t("eyebrow")}
          </p>
          <h1 className="mt-2 font-display text-3xl text-[#0d1117]">
            {t("title")}
          </h1>
          <p className="mt-2 text-[#57606a]">{t("subtitle")}</p>
        </div>
        <form action={markNotificationsRead}>
          <Button type="submit" variant="outline" size="sm">
            {t("markRead")}
          </Button>
        </form>
      </div>

      <InboxSection title={t("interestsTitle")}>
        {data.interests.length === 0 ? (
          <p className="text-sm text-[#57606a]">{t("interestsEmpty")}</p>
        ) : (
          <ul className="space-y-3">
            {data.interests.map((interest) => (
              <li
                key={interest.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#d0d7de] bg-[#fbfcfd] p-4"
              >
                <div>
                  <p className="font-medium text-[#0d1117]">
                    {interest.user.name ?? interest.user.githubUsername}
                  </p>
                  <p className="text-sm text-[#57606a]">
                    {t("wantsToContribute", { title: interest.project.title })}
                  </p>
                </div>
                <InterestActions interestId={interest.id} />
              </li>
            ))}
          </ul>
        )}
      </InboxSection>

      <InboxSection title={t("invitesTitle")}>
        {data.invites.length === 0 ? (
          <p className="text-sm text-[#57606a]">{t("invitesEmpty")}</p>
        ) : (
          <ul className="space-y-3">
            {data.invites.map((invite) => (
              <li
                key={invite.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#d0d7de] bg-[#fbfcfd] p-4"
              >
                <div>
                  <p className="font-medium text-[#0d1117]">
                    {t("invitedYouTo", {
                      name:
                        invite.fromUser.name ??
                        invite.fromUser.githubUsername ??
                        "",
                      title: invite.project.title,
                    })}
                  </p>
                  {invite.issueTitle && (
                    <p className="mt-1 text-sm text-[#0969da]">
                      {t("issueLabel", {
                        number: invite.issueNumber ?? "",
                        title: invite.issueTitle,
                      })}
                      {invite.issueUrl ? (
                        <>
                          {" · "}
                          <a
                            href={invite.issueUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="cursor-pointer hover:underline"
                          >
                            {t("openIssue")}
                          </a>
                        </>
                      ) : null}
                    </p>
                  )}
                  {invite.message && (
                    <p className="mt-1 text-sm text-[#57606a]">{invite.message}</p>
                  )}
                </div>
                <InviteActions inviteId={invite.id} />
              </li>
            ))}
          </ul>
        )}
      </InboxSection>

      <InboxSection title={t("notificationsTitle")}>
        {data.notifications.length === 0 ? (
          <p className="text-sm text-[#57606a]">{t("notificationsEmpty")}</p>
        ) : (
          <ul className="space-y-3">
            {data.notifications.map((notification) => (
              <li
                key={notification.id}
                className={`rounded-xl border p-4 ${
                  notification.read
                    ? "border-[#d0d7de] bg-white"
                    : "border-[#54aeff66] bg-[#ddf4ff]"
                }`}
              >
                <p className="font-medium text-[#0d1117]">{notification.title}</p>
                <p className="mt-1 text-sm text-[#57606a]">{notification.body}</p>
                {notification.href && (
                  <NotificationLink
                    notificationId={notification.id}
                    href={notification.href}
                  >
                    {tCommon("open")}
                  </NotificationLink>
                )}
              </li>
            ))}
          </ul>
        )}
      </InboxSection>
    </div>
  );
}
