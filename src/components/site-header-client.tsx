"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BrandMark } from "@/components/brand-mark";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";

const linkKeys = [
  { href: "/for-you", key: "forYou" },
  { href: "/discover", key: "discover" },
  { href: "/swipe", key: "swipe" },
  { href: "/projects/new", key: "publish" },
  { href: "/dashboard", key: "dashboard" },
  { href: "/inbox", key: "inbox" },
] as const;

export function SiteHeaderClient({
  user,
  unread,
}: {
  user: {
    name: string;
    image: string | null;
    githubUsername: string | null;
  } | null;
  unread: number;
}) {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#d0d7de]/70 bg-[#eef1f5]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-[#0d1117] transition-opacity hover:opacity-80"
          >
            <BrandMark className="h-7 w-7 text-[#0969da]" />
            <span className="font-display text-2xl tracking-tight">
              {tCommon("appName")}
            </span>
          </Link>

          <nav className="hidden items-center gap-5 text-sm text-[#57606a] md:flex">
            {user &&
              linkKeys.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="cursor-pointer rounded-md px-1 py-0.5 transition-colors hover:text-[#0d1117]"
                >
                  {t(link.key)}
                  {link.href === "/inbox" && unread > 0 ? ` (${unread})` : ""}
                </Link>
              ))}
          </nav>

          <div className="flex items-center gap-2">
            <LocaleSwitcher />
            {user ? (
              <UserMenu
                name={user.name}
                image={user.image}
                githubUsername={user.githubUsername}
              />
            ) : (
              <Button asChild variant="primary" size="sm">
                <Link href="/auth">{tCommon("join")}</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {user ? (
        <>
          <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#d0d7de]/70 bg-[#eef1f5]/90 px-2 py-2 backdrop-blur-md md:hidden">
            <ul className="mx-auto grid max-w-3xl grid-cols-6 gap-1 text-center text-[10px] text-[#57606a]">
              {linkKeys.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex min-h-12 cursor-pointer flex-col items-center justify-center rounded-md px-1 py-1 transition-colors hover:bg-[#0d1117]/[0.04] hover:text-[#0d1117]"
                  >
                    <span>
                      {t(link.key)}
                      {link.href === "/inbox" && unread > 0
                        ? ` · ${unread}`
                        : ""}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="h-20 md:hidden" aria-hidden />
        </>
      ) : null}
    </>
  );
}
