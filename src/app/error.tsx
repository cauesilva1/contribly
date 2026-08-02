"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="text-xs uppercase tracking-[0.25em] text-[#cf222e]">Erro</p>
      <h1 className="mt-3 font-display text-3xl text-[#0d1117]">
        Algo deu errado
      </h1>
      <p className="mt-2 text-[#57606a]">
        Tente de novo. Se continuar, volte ao início e repita a ação.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button type="button" variant="primary" onClick={reset}>
          Tentar novamente
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Início</Link>
        </Button>
      </div>
    </div>
  );
}
