import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getPlatformMetrics, canViewMetrics } from "@/lib/metrics";
import { requireUser } from "@/lib/session";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metrics" });
  return { title: t("title") };
}

export default async function MetricsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("metrics");

  const user = await requireUser(true);
  if (!canViewMetrics(user)) notFound();

  const m = await getPlatformMetrics();

  const cards = [
    { label: t("signups"), value: m.signups },
    { label: t("signups7d"), value: m.signupsLast7Days },
    { label: t("projects"), value: m.projects },
    { label: t("swipes"), value: m.interestSwipes },
    { label: t("pending"), value: m.pendingInterests },
    { label: t("matches"), value: m.matches },
    { label: t("participations"), value: m.participations },
  ] as const;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <p className="text-xs uppercase tracking-[0.25em] text-[#0969da]">
        {t("eyebrow")}
      </p>
      <h1 className="mt-2 font-display text-3xl text-[#0d1117]">{t("title")}</h1>
      <p className="mt-2 text-sm text-[#57606a]">{t("subtitle")}</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="surface-card p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-[#57606a]">
              {card.label}
            </p>
            <p className="mt-2 font-display text-3xl text-[#0d1117]">
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
