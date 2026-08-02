"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { syncProfileFromGithub } from "@/app/actions";
import { Button } from "@/components/ui/button";

export function SyncGithubProfileButton() {
  const t = useTranslations("syncGithub");
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          try {
            const insight = await syncProfileFromGithub();
            const langs = insight.languages.join(", ") || t("noneLangs");
            toast.success(
              t("syncSuccess", {
                repos: insight.stats.reposAnalyzed,
                langs,
              })
            );
          } catch (error) {
            toast.error(
              error instanceof Error ? error.message : t("syncError")
            );
          }
        });
      }}
    >
      {pending ? t("syncing") : t("syncButton")}
    </Button>
  );
}
