import Link from "next/link";
import { signIn } from "@/auth";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { GithubIcon } from "@/components/github-icon";
import { UserMenu } from "@/components/user-menu";
import { getSession, getUnreadNotificationCount } from "@/lib/session";

const links = [
  { href: "/for-you", label: "Pra você" },
  { href: "/discover", label: "Descobrir" },
  { href: "/swipe", label: "Swipe" },
  { href: "/projects/new", label: "Publicar" },
  { href: "/dashboard", label: "Painel" },
  { href: "/inbox", label: "Inbox" },
] as const;

export async function SiteHeader() {
  const session = await getSession();
  const unread = session?.user?.id
    ? await getUnreadNotificationCount(session.user.id)
    : 0;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#d0d7de]/70 bg-[#eef1f5]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-[#0d1117] transition-opacity hover:opacity-80"
          >
            <BrandMark className="h-7 w-7 text-[#0969da]" />
            <span className="font-display text-2xl tracking-tight">Contribly</span>
          </Link>

          <nav className="hidden items-center gap-5 text-sm text-[#57606a] md:flex">
            {session?.user &&
              links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="cursor-pointer rounded-md px-1 py-0.5 transition-colors hover:text-[#0d1117]"
                >
                  {link.label}
                  {link.href === "/inbox" && unread > 0 ? ` (${unread})` : ""}
                </Link>
              ))}
          </nav>

          <div className="flex items-center gap-2">
            {session?.user ? (
              <UserMenu
                name={session.user.name ?? "Conta"}
                image={session.user.image ?? null}
                githubUsername={session.user.githubUsername ?? null}
              />
            ) : (
              <form
                action={async () => {
                  "use server";
                  await signIn("github", { redirectTo: "/onboarding" });
                }}
              >
                <Button type="submit" variant="primary" size="sm">
                  <GithubIcon className="h-4 w-4" />
                  Entrar com GitHub
                </Button>
              </form>
            )}
          </div>
        </div>
      </header>

      {session?.user && (
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#d0d7de]/70 bg-[#eef1f5]/90 px-2 py-2 backdrop-blur-md md:hidden">
          <ul className="mx-auto grid max-w-3xl grid-cols-6 gap-1 text-center text-[10px] text-[#57606a]">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex min-h-12 cursor-pointer flex-col items-center justify-center rounded-md px-1 py-1 transition-colors hover:bg-[#0d1117]/[0.04] hover:text-[#0d1117]"
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
