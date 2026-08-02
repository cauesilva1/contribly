import { cache } from "react";
import { unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isProfileComplete } from "@/lib/profile";

/** Deduplica auth() no mesmo request (layout + page). */
export const getSession = cache(async () => auth());

export const getUnreadNotificationCount = cache(async (userId: string) => {
  return unstable_cache(
    async () =>
      prisma.notification.count({
        where: { userId, read: false },
      }),
    [`unread-count-${userId}`],
    { revalidate: 20, tags: [`unread-${userId}`] }
  )();
});

/** Passe `true` para pular o redirect de onboarding. */
export const requireUser = cache(async (skipOnboarding = false) => {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect("/");
  }

  if (!skipOnboarding && !isProfileComplete(user)) {
    redirect("/onboarding");
  }

  return user;
});

export const getOptionalUser = cache(async () => {
  const session = await getSession();
  if (!session?.user?.id) return null;

  return prisma.user.findUnique({
    where: { id: session.user.id },
  });
});
