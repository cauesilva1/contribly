import { auth } from "@/auth";
import { NextResponse } from "next/server";

/** Use in Route Handlers under app/api/* — never trust middleware cookie alone. */
export async function requireApiUser() {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    } as const;
  }
  return { userId: session.user.id, session } as const;
}
