"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteAccount } from "@/app/auth-actions";
import { Button } from "@/components/ui/button";

export function DeleteAccountButton() {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  function onDelete() {
    startTransition(async () => {
      try {
        await deleteAccount();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Não foi possível excluir a conta"
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
        Excluir minha conta
      </Button>
    );
  }

  return (
    <div className="rounded-xl border border-[#ffc1c0] bg-[#fff8f8] p-4">
      <p className="text-sm font-medium text-[#cf222e]">Tem certeza?</p>
      <p className="mt-1 text-sm text-[#57606a]">
        Isso apaga seu perfil, interesses, convites, mensagens e projetos que você
        publicou. Não dá para desfazer.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="danger"
          disabled={pending}
          onClick={onDelete}
        >
          {pending ? "Excluindo..." : "Sim, excluir tudo"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => setConfirming(false)}
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
}
