import { getTranslations, setRequestLocale } from "next-intl/server";
import { getSwipeDeck } from "@/app/actions";
import { SwipeDeck } from "@/components/swipe-deck";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function SwipePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("swipe");

  const projects = await getSwipeDeck();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-5 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-[#0969da]">
          {t("eyebrow")}
        </p>
        <h1 className="mt-2 font-display text-3xl text-[#0d1117] md:text-4xl">
          {t("title")}
        </h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-[#57606a]">
          {t("subtitle")}
        </p>
      </div>
      <SwipeDeck projects={projects} />
    </div>
  );
}
