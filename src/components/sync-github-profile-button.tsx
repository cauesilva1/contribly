"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { syncProfileFromGithub } from "@/app/actions";
import { Button } from "@/components/ui/button";

export function SyncGithubProfileButton() {
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
            const langs = insight.languages.join(", ") || "nenhuma";
            toast.success(
              `Perfil atualizado (${insight.stats.reposAnalyzed} repos). Linguagens: ${langs}`
            );
          } catch (error) {
            toast.error(
              error instanceof Error
                ? error.message
                : "Falha ao sincronizar com o GitHub"
            );
          }
        });
      }}
    >
      {pending ? "Analisando GitHub..." : "Sincronizar do GitHub"}
    </Button>
  );
}
