"use client";

import Link from "next/link";
import { markNotificationRead } from "@/app/actions";

export function NotificationLink({
  notificationId,
  href,
  children,
}: {
  notificationId: string;
  href: string;
  children: React.ReactNode;
}) {
  const isExternal = href.startsWith("http");

  async function onClick() {
    try {
      await markNotificationRead(notificationId);
    } catch {
      // ignore — navegação ainda deve acontecer
    }
  }

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="mt-2 inline-block text-sm text-[#0969da] hover:underline"
        onClick={() => {
          void onClick();
        }}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className="mt-2 inline-block text-sm text-[#0969da] hover:underline"
      onClick={() => {
        void onClick();
      }}
    >
      {children}
    </Link>
  );
}
