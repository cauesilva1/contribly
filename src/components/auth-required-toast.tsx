"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function AuthRequiredToast() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("auth") === "required") {
      toast.message("Faça login com GitHub para continuar.");
    }
  }, [searchParams]);

  return null;
}
