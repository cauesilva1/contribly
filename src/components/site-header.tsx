import { SiteHeaderClient } from "@/components/site-header-client";
import { getSession, getUnreadNotificationCount } from "@/lib/session";

export async function SiteHeader() {
  const session = await getSession();
  const unread = session?.user?.id
    ? await getUnreadNotificationCount(session.user.id)
    : 0;

  return (
    <SiteHeaderClient
      user={
        session?.user
          ? {
              name: session.user.name ?? "Conta",
              image: session.user.image ?? null,
              githubUsername: session.user.githubUsername ?? null,
            }
          : null
      }
      unread={unread}
    />
  );
}
