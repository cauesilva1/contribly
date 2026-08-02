"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { respondInterest, respondInvite } from "@/app/actions";
import { Button } from "@/components/ui/button";

export function InterestActions({ interestId }: { interestId: string }) {
  const t = useTranslations("common");
  const tToast = useTranslations("toasts");
  const [pending, startTransition] = useTransition();

  function respond(accept: boolean) {
    startTransition(async () => {
      try {
        await respondInterest(interestId, accept);
        toast.success(
          accept ? tToast("interestAccepted") : tToast("interestRejected")
        );
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : tToast("respondFailed")
        );
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
        {t("accept")}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() => respond(false)}
      >
        {t("reject")}
      </Button>
    </div>
  );
}

export function InviteActions({ inviteId }: { inviteId: string }) {
  const t = useTranslations("common");
  const tToast = useTranslations("toasts");
  const [pending, startTransition] = useTransition();

  function respond(accept: boolean) {
    startTransition(async () => {
      try {
        await respondInvite(inviteId, accept);
        toast.success(
          accept ? tToast("inviteAccepted") : tToast("inviteRejected")
        );
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : tToast("respondFailed")
        );
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
        {t("accept")}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() => respond(false)}
      >
        {t("reject")}
      </Button>
    </div>
  );
}
