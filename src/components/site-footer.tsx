import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BrandMark } from "@/components/brand-mark";
import { GithubIcon } from "@/components/github-icon";

const REPO = "https://github.com/cauesilva1/contribly";

function FooterLink({
  href,
  label,
  external,
}: {
  href: string;
  label: string;
  external?: boolean;
}) {
  const className =
    "text-sm text-[#8b949e] transition-colors hover:text-[#e6edf3]";

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const tCommon = await getTranslations("common");
  const year = new Date().getFullYear();

  const productLinks = [
    { href: "/discover", label: t("discover") },
    { href: "/for-you", label: t("forYou") },
    { href: "/swipe", label: t("swipe") },
    { href: "/projects/new", label: t("publish") },
    { href: "/dashboard", label: t("dashboard") },
  ] as const;

  const communityLinks = [
    { href: REPO, label: t("code"), external: true },
    { href: `${REPO}/issues`, label: t("report"), external: true },
    {
      href: `${REPO}/blob/main/CONTRIBUTING.md`,
      label: t("contribute"),
      external: true,
    },
    {
      href: `${REPO}/blob/main/README.md`,
      label: t("docs"),
      external: true,
    },
  ] as const;

  const legalLinks = [
    {
      href: `${REPO}/blob/main/LICENSE`,
      label: t("license"),
      external: true,
    },
    { href: "/privacy", label: t("privacy") },
  ] as const;

  return (
    <footer className="mt-12 border-t border-[#d0d7de]/80 bg-[#0d1117] text-[#e6edf3]">
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-14">
        <div className="grid gap-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 text-[#e6edf3] transition-opacity hover:opacity-80"
            >
              <BrandMark className="h-7 w-7 text-[#58a6ff]" />
              <span className="font-display text-2xl tracking-tight">
                {tCommon("appName")}
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#8b949e]">
              {t("tagline")}
            </p>
            <a
              href={REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-sm text-[#8b949e] transition-colors hover:text-[#e6edf3]"
            >
              <GithubIcon className="h-4 w-4" />
              cauesilva1/contribly
            </a>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-8 md:grid-cols-3">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b949e]">
                {t("product")}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {productLinks.map((link) => (
                  <li key={link.href}>
                    <FooterLink href={link.href} label={link.label} />
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b949e]">
                {t("community")}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {communityLinks.map((link) => (
                  <li key={link.href}>
                    <FooterLink
                      href={link.href}
                      label={link.label}
                      external={link.external}
                    />
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b949e]">
                {t("legal")}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <FooterLink
                      href={link.href}
                      label={link.label}
                      external={
                        "external" in link ? Boolean(link.external) : false
                      }
                    />
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs leading-relaxed text-[#6e7681]">
                {t("loginNote")}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-[#21262d] pt-6 text-xs text-[#6e7681] sm:flex-row sm:items-center sm:justify-between">
          <p>{t("copyright", { year })}</p>
          <p className="sm:text-right">{t("madeFor")}</p>
        </div>
      </div>
    </footer>
  );
}
