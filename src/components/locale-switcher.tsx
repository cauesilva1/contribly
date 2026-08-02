"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";

export function LocaleSwitcher() {
  const t = useTranslations("locale");
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(next: AppLocale) {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  }

  return (
    <div
      className="inline-flex items-center rounded-md border border-[#d0d7de] bg-white/70 p-0.5 text-xs"
      role="group"
      aria-label={t("label")}
    >
      {routing.locales.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => switchTo(code)}
          className={`rounded px-2 py-1 transition-colors ${
            code === locale
              ? "bg-[#24292f] font-medium text-white"
              : "text-[#57606a] hover:text-[#0d1117]"
          }`}
        >
          {t(code)}
        </button>
      ))}
    </div>
  );
}
