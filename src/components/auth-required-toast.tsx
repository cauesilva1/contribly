"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

export function AuthRequiredToast() {
  const t = useTranslations("toasts");
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("auth") === "required") {
      toast.message(t("authRequired"));
    }
    if (searchParams.get("deleted") === "1") {
      toast.success(t("accountDeleted"));
    }
  }, [searchParams, t]);

  return null;
}
