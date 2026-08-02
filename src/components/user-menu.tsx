"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Link } from "@/i18n/navigation";
import { ChevronDown, DoorOpen } from "lucide-react";
import { logout } from "@/app/auth-actions";
import { useTranslations } from "next-intl";

type UserMenuProps = {
  name: string;
  image: string | null;
  githubUsername: string | null;
};

export function UserMenu({ name, image, githubUsername }: UserMenuProps) {
  const t = useTranslations("common");
  const tMenu = useTranslations("userMenu");
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  function onLogout() {
    startTransition(async () => {
      await logout();
    });
  }

  const displayName = name || githubUsername || t("account");
  const subtitle = githubUsername ? `@${githubUsername}` : null;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex cursor-pointer items-center gap-2 rounded-full border border-[#d0d7de] bg-white/80 py-1 pl-1 pr-2 text-left transition-colors hover:border-[#afb8c1] hover:bg-white"
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#24292f] text-xs font-medium text-white">
            {displayName.slice(0, 1).toUpperCase()}
          </span>
        )}
        <span className="hidden min-w-0 sm:block">
          <span className="block max-w-[9rem] truncate text-sm font-medium leading-tight text-[#0d1117]">
            {displayName}
          </span>
          {subtitle ? (
            <span className="block max-w-[9rem] truncate text-xs leading-tight text-[#57606a]">
              {subtitle}
            </span>
          ) : null}
        </span>
        <ChevronDown
          className={`ml-0.5 h-4 w-4 shrink-0 text-[#57606a] transition-transform ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-[#d0d7de] bg-white shadow-[0_18px_40px_rgba(13,17,23,0.12)]"
        >
          <div className="border-b border-[#d0d7de] px-3 py-3">
            <p className="truncate text-sm font-medium text-[#0d1117]">
              {displayName}
            </p>
            {subtitle ? (
              <p className="truncate text-xs text-[#57606a]">{subtitle}</p>
            ) : null}
          </div>

          <ul className="py-1.5">
            <li>
              <Link
                href="/profile"
                role="menuitem"
                className="flex cursor-pointer items-center px-3 py-2 text-sm text-[#0d1117] transition-colors hover:bg-[#f6f8fa]"
                onClick={() => setOpen(false)}
              >
                {tMenu("profile")}
              </Link>
            </li>
            <li>
              <a
                href={
                  githubUsername
                    ? `https://github.com/${githubUsername}`
                    : "https://github.com"
                }
                target="_blank"
                rel="noreferrer"
                role="menuitem"
                className="flex cursor-pointer items-center px-3 py-2 text-sm text-[#0d1117] transition-colors hover:bg-[#f6f8fa]"
                onClick={() => setOpen(false)}
              >
                {tMenu("viewOnGithub")}
              </a>
            </li>
          </ul>

          <div className="border-t border-[#d0d7de] p-1.5">
            <button
              type="button"
              role="menuitem"
              disabled={pending}
              onClick={onLogout}
              className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-[#cf222e] transition-colors hover:bg-[#ffebe9] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <DoorOpen className="h-4 w-4 shrink-0" strokeWidth={2} />
              {pending ? tMenu("signingOut") : tMenu("signOut")}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
