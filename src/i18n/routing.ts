import { defineRouting } from "next-intl/routing";

/**
 * English-only for launch (global OSS audience).
 *
 * To bring Portuguese back later:
 * 1. Uncomment "pt" in `locales` below (and set defaultLocale if desired)
 * 2. Keep using messages/pt.json (file is preserved)
 * 3. Re-enable <LocaleSwitcher /> in site-header-client.tsx
 * 4. Allow /pt in middleware matcher if needed
 */
export const routing = defineRouting({
  locales: [
    "en",
    // "pt",
  ],
  defaultLocale: "en",
  localePrefix: "as-needed",
});

export type AppLocale = (typeof routing.locales)[number];
