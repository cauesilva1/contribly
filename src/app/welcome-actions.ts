"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession, requireUser } from "@/lib/session";

export async function getWelcomeState() {
  const session = await getSession();
  if (!session?.user?.id) {
    return { show: false as const, name: null as string | null };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      githubUsername: true,
      welcomeSeenAt: true,
    },
  });

  if (!user || user.welcomeSeenAt) {
    return { show: false as const, name: null as string | null };
  }

  return {
    show: true as const,
    name: user.name ?? user.githubUsername ?? session.user.name ?? "dev",
  };
}

export async function markWelcomeSeen() {
  const user = await requireUser(true);
  await prisma.user.update({
    where: { id: user.id },
    data: { welcomeSeenAt: new Date() },
  });
  revalidatePath("/");
}
