"use client";

import { useEffect, useRef, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { verifyEmailAndSignIn } from "@/app/auth-email-actions";
import { Link } from "@/i18n/navigation";

export function VerifyEmailClient({
  email,
  token,
}: {
  email: string;
  token: string;
}) {
  const t = useTranslations("auth");
  const [pending, startTransition] = useTransition();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    if (!email || !token) return;
    started.current = true;
    startTransition(async () => {
      try {
        await verifyEmailAndSignIn(email, token);
      } catch (error) {
        if (
          typeof error === "object" &&
          error &&
          "digest" in error &&
          typeof (error as { digest?: string }).digest === "string" &&
          (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
        ) {
          throw error;
        }
        toast.error(
          error instanceof Error ? error.message : t("genericError")
        );
      }
    });
  }, [email, token, t]);

  if (!email || !token) {
    return (
      <div className="mt-4 space-y-3 text-sm text-[#57606a]">
        <p>{t("verifyInvalid")}</p>
        <Link href="/auth?mode=signup" className="text-[#0969da] underline">
          {t("tabSignup")}
        </Link>
      </div>
    );
  }

  return (
    <p className="mt-4 text-sm text-[#57606a]">
      {pending ? t("verifyPending") : t("verifyPending")}
    </p>
  );
}
