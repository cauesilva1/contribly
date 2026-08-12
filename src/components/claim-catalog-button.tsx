"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { claimCatalogProject } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";

export function ClaimCatalogButton({ projectId }: { projectId: string }) {
  const t = useTranslations("projects");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          try {
            await claimCatalogProject(projectId);
            toast.success(t("claimSuccess"));
            router.refresh();
          } catch (error) {
            toast.error(
              error instanceof Error ? error.message : t("claimFailed")
            );
          }
        });
      }}
    >
      {pending ? t("claiming") : t("claimButton")}
    </Button>
  );
}
