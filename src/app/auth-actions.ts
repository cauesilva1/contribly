"use server";

import { signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function logout() {
  await signOut({ redirectTo: "/" });
}

/** Apaga a conta e dados associados (cascade no Prisma). */
export async function deleteAccount() {
  const user = await requireUser(true);

  await prisma.user.delete({
    where: { id: user.id },
  });

  await signOut({ redirectTo: "/?deleted=1" });
}
