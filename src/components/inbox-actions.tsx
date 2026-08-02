"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { respondInterest, respondInvite } from "@/app/actions";
import { Button } from "@/components/ui/button";

export function InterestActions({ interestId }: { interestId: string }) {
  const [pending, startTransition] = useTransition();

  function respond(accept: boolean) {
    startTransition(async () => {
      try {
        await respondInterest(interestId, accept);
        toast.success(accept ? "Interesse aceito" : "Interesse recusado");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Falha ao responder");
      }
    });
  }

  return (
    <div className="flex gap-2">
      <Button
        type="button"
        variant="primary"
        size="sm"
        disabled={pending}
        onClick={() => respond(true)}
      >
        Aceitar
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() => respond(false)}
      >
        Recusar
      </Button>
    </div>
  );
}

export function InviteActions({ inviteId }: { inviteId: string }) {
  const [pending, startTransition] = useTransition();

  function respond(accept: boolean) {
    startTransition(async () => {
      try {
        await respondInvite(inviteId, accept);
        toast.success(accept ? "Convite aceito" : "Convite recusado");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Falha ao responder");
      }
    });
  }

  return (
    <div className="flex gap-2">
      <Button
        type="button"
        variant="primary"
        size="sm"
        disabled={pending}
        onClick={() => respond(true)}
      >
        Aceitar
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() => respond(false)}
      >
        Recusar
      </Button>
    </div>
  );
}
