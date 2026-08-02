"use server";

import { signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function logout() {
  await signOut({ redirectTo: "/" });
}

/** Reautoriza GitHub com scope repo (listar públicos + privados). */
export async function connectGithubForPublish() {
  const { signIn } = await import("@/auth");
  await signIn("github", { redirectTo: "/projects/new" });
}

/** Apaga a conta e dados associados (cascade no Prisma). */
export async function deleteAccount() {
  const user = await requireUser(true);

  await prisma.user.delete({
    where: { id: user.id },
  });

  await signOut({ redirectTo: "/?deleted=1" });
}
