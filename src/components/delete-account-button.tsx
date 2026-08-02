"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { deleteAccount } from "@/app/auth-actions";
import { Button } from "@/components/ui/button";

export function DeleteAccountButton() {
  const t = useTranslations("deleteAccount");
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  function onDelete() {
    startTransition(async () => {
      try {
        await deleteAccount();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : t("deleteError")
        );
        setConfirming(false);
      }
    });
  }

  if (!confirming) {
    return (
      <Button
        type="button"
        variant="outline"
        className="border-[#ffc1c0] text-[#cf222e] hover:bg-[#ffebe9]"
        onClick={() => setConfirming(true)}
      >
        {t("deleteButton")}
      </Button>
    );
  }

  return (
    <div className="rounded-xl border border-[#ffc1c0] bg-[#fff8f8] p-4">
      <p className="text-sm font-medium text-[#cf222e]">{t("confirmTitle")}</p>
      <p className="mt-1 text-sm text-[#57606a]">{t("confirmDescription")}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="danger"
          disabled={pending}
          onClick={onDelete}
        >
          {pending ? t("deleting") : t("confirmDelete")}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => setConfirming(false)}
        >
          {t("cancel")}
        </Button>
      </div>
    </div>
  );
}
