import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isProfileComplete } from "@/lib/profile";
import { redirect } from "next/navigation";

export async function requireUser(options?: { skipOnboarding?: boolean }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect("/");
  }

  if (!options?.skipOnboarding && !isProfileComplete(user)) {
    redirect("/onboarding");
  }

  return user;
}

export async function getOptionalUser() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.user.findUnique({
    where: { id: session.user.id },
  });
}
