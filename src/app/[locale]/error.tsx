"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="text-xs uppercase tracking-[0.25em] text-[#cf222e]">
        {t("label")}
      </p>
      <h1 className="mt-3 font-display text-3xl text-[#0d1117]">
        {t("title")}
      </h1>
      <p className="mt-2 text-[#57606a]">{t("description")}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button type="button" variant="primary" onClick={reset}>
          {t("retry")}
        </Button>
        <Button asChild variant="outline">
          <Link href="/">{t("home")}</Link>
        </Button>
      </div>
    </div>
  );
}
