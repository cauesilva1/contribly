import Link from "next/link";
import { auth, signIn, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

const links = [
  { href: "/for-you", label: "Pra você" },
  { href: "/discover", label: "Descobrir" },
  { href: "/swipe", label: "Swipe" },
  { href: "/projects/new", label: "Publicar" },
  { href: "/dashboard", label: "Painel" },
  { href: "/inbox", label: "Inbox" },
  { href: "/profile", label: "Perfil" },
] as const;

export async function SiteHeader() {
  const session = await auth();
  const unread = session?.user?.id
    ? await prisma.notification.count({
        where: { userId: session.user.id, read: false },
      })
    : 0;

  return (
    <>
      <header className="border-b border-[#d0d7de] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="font-display text-2xl tracking-tight text-[#0d1117]">
            OpenMatch
          </Link>

          <nav className="hidden items-center gap-5 text-sm text-[#57606a] md:flex">
            {session?.user &&
              links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="hover:text-[#0d1117]"
                >
                  {link.label}
                  {link.href === "/inbox" && unread > 0 ? ` (${unread})` : ""}
                </Link>
              ))}
          </nav>

          <div className="flex items-center gap-2">
            {session?.user ? (
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <Button type="submit" variant="outline" size="sm">
                  Sair
                </Button>
              </form>
            ) : (
              <form
                action={async () => {
                  "use server";
                  await signIn("github", { redirectTo: "/onboarding" });
                }}
              >
                <Button type="submit" size="sm">
                  Entrar com GitHub
                </Button>
              </form>
            )}
          </div>
        </div>
      </header>

      {session?.user && (
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#d0d7de] bg-white/95 px-2 py-2 backdrop-blur md:hidden">
          <ul className="mx-auto grid max-w-3xl grid-cols-7 gap-1 text-center text-[10px] text-[#57606a]">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex min-h-12 flex-col items-center justify-center rounded-md px-1 py-1 hover:bg-[#f6f8fa] hover:text-[#0d1117]"
                >
                  <span>
                    {link.label}
                    {link.href === "/inbox" && unread > 0 ? ` · ${unread}` : ""}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </>
  );
}
