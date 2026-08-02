import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="text-xs uppercase tracking-[0.25em] text-[#0969da]">404</p>
      <h1 className="mt-3 font-display text-3xl text-[#0d1117]">
        Página não encontrada
      </h1>
      <p className="mt-2 text-[#57606a]">
        Esse link não existe ou o projeto foi removido.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button asChild variant="primary">
          <Link href="/">Ir para o início</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/discover">Descobrir projetos</Link>
        </Button>
      </div>
    </div>
  );
}
