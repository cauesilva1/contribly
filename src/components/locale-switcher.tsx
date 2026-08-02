"use client";

/**
 * Unused while the app is English-only.
 * Re-enable with PT in src/i18n/routing.ts + site-header-client.tsx.
 */
import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";

export function LocaleSwitcher() {
  const t = useTranslations("locale");
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();

  // Aquece o outro idioma assim que o header monta
  useEffect(() => {
    for (const code of routing.locales) {
      if (code !== locale) {
        router.prefetch(pathname, { locale: code });
      }
    }
  }, [locale, pathname, router]);

  return (
    <div
      className="inline-flex items-center rounded-md border border-[#d0d7de] bg-white/70 p-0.5 text-xs"
      role="group"
      aria-label={t("label")}
    >
      {routing.locales.map((code) => {
        const active = code === locale;
        return (
          <Link
            key={code}
            href={pathname}
            locale={code}
            prefetch
            className={`rounded px-2 py-1 transition-colors ${
              active
                ? "bg-[#24292f] font-medium text-white"
                : "text-[#57606a] hover:text-[#0d1117]"
            }`}
            aria-current={active ? "true" : undefined}
          >
            {t(code)}
          </Link>
        );
      })}
    </div>
  );
}
