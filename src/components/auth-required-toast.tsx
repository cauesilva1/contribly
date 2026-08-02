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
    if (searchParams.get("deleted") === "1") {
      toast.success("Conta excluída. Seus dados foram removidos.");
    }
  }, [searchParams]);

  return null;
}
