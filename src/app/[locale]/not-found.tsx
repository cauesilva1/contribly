import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="text-xs uppercase tracking-[0.25em] text-[#0969da]">
        {t("eyebrow")}
      </p>
      <h1 className="mt-3 font-display text-3xl text-[#0d1117]">
        {t("title")}
      </h1>
      <p className="mt-2 text-[#57606a]">{t("description")}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button asChild variant="primary">
          <Link href="/">{t("home")}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/discover">{t("discover")}</Link>
        </Button>
      </div>
    </div>
  );
}
