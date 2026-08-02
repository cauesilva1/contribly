"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export type MaintainerNotifyOptions = {
  inviteUrl: string;
  githubIssueUrl: string | null;
  email: {
    status: "deferred";
  };
};

export function NotifyMaintainerPanel({
  options,
}: {
  options: MaintainerNotifyOptions;
}) {
  const [copied, setCopied] = useState(false);

  async function copyInvite() {
    try {
      await navigator.clipboard.writeText(options.inviteUrl);
      setCopied(true);
      toast.success("Link de convite copiado");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar");
    }
  }

  return (
    <section className="surface-card mt-6 p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-[#0969da]">
        Avisar o mantenedor
      </p>
      <h2 className="mt-2 font-display text-2xl text-[#0d1117]">
        Duas formas de ele saber do seu interesse
      </h2>
      <p className="mt-2 text-sm text-[#57606a]">
        Se a pessoa ainda não entra no Contribly, abra uma issue no GitHub ou
        envie o link mágico. E-mail automático fica para quando houver domínio
        verificado.
      </p>

      <ol className="mt-5 space-y-4">
        <li className="rounded-lg border border-[#d0d7de] p-4">
          <p className="text-sm font-medium text-[#0d1117]">
            1. Issue no GitHub
          </p>
          <p className="mt-1 text-sm text-[#57606a]">
            Abre o formulário de nova issue já preenchido no repositório (você
            revisa e publica).
          </p>
          {options.githubIssueUrl ? (
            <Button asChild variant="outline" size="sm" className="mt-3">
              <a
                href={options.githubIssueUrl}
                target="_blank"
                rel="noreferrer"
              >
                Abrir issue pré-preenchida
              </a>
            </Button>
          ) : (
            <p className="mt-2 text-xs text-[#57606a]">
              Link GitHub do projeto inválido.
            </p>
          )}
        </li>

        <li className="rounded-lg border border-[#d0d7de] p-4">
          <p className="text-sm font-medium text-[#0d1117]">
            2. Link de convite
          </p>
          <p className="mt-1 text-sm text-[#57606a]">
            Envie por Discord, e-mail ou DM. O mantenedor entra com GitHub e vê
            o interesse.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" variant="primary" size="sm" onClick={copyInvite}>
              {copied ? "Copiado" : "Copiar link"}
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href={options.inviteUrl} target="_blank" rel="noreferrer">
                Abrir convite
              </a>
            </Button>
          </div>
          <p className="mt-2 break-all text-xs text-[#6e7681]">
            {options.inviteUrl}
          </p>
        </li>
      </ol>
    </section>
  );
}
