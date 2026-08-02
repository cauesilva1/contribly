import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteFooter } from "@/components/site-footer";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

type PrivacySection = {
  title: string;
  body: string[];
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("privacy");
  const sections = t.raw("sections") as PrivacySection[];

  return (
    <div>
      <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
        <p className="text-xs uppercase tracking-[0.25em] text-[#0969da]">
          {t("eyebrow")}
        </p>
        <h1 className="mt-2 font-display text-4xl text-[#0d1117]">
          {t("title")}
        </h1>
        <p className="mt-3 text-[#57606a]">{t("intro")}</p>

        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <section
              key={section.title}
              className="border-t border-[#d0d7de] pt-5"
            >
              <h2 className="font-display text-2xl text-[#0d1117]">
                {section.title}
              </h2>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[#57606a]">
                {section.body.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#0969da]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <p className="mt-10 text-sm text-[#57606a]">
          {t("contactPrefix")}{" "}
          <a
            href="https://github.com/cauesilva1/contribly/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0969da] hover:underline"
          >
            {t("githubLink")}
          </a>{" "}
          {t("orManage")}{" "}
          <Link href="/profile" className="text-[#0969da] hover:underline">
            {t("profileLink")}
          </Link>
          .
        </p>
      </div>

      <SiteFooter />
    </div>
  );
}
