"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { signInWithEmail, signUpWithEmail } from "@/app/auth-email-actions";
import { GithubIcon } from "@/components/github-icon";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";

type Mode = "login" | "signup";

function isNextRedirect(error: unknown) {
  return (
    typeof error === "object" &&
    error &&
    "digest" in error &&
    typeof (error as { digest?: string }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

export function AuthForm({
  githubAction,
}: {
  githubAction: () => Promise<void>;
}) {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialMode: Mode =
    searchParams.get("mode") === "signup" ? "signup" : "login";
  const [mode, setMode] = useState<Mode>(initialMode);
  const [pending, startTransition] = useTransition();

  const verifySent = searchParams.get("verify") === "sent";
  const linkRequired =
    searchParams.get("error") === "link-required" ||
    searchParams.get("error") === "OAuthAccountNotLinked";

  function switchMode(next: Mode) {
    setMode(next);
    router.replace(next === "signup" ? "/auth?mode=signup" : "/auth");
  }

  function onEmailSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      try {
        if (mode === "signup") {
          await signUpWithEmail(formData);
        } else {
          await signInWithEmail(formData);
        }
      } catch (error) {
        if (isNextRedirect(error)) throw error;
        toast.error(
          error instanceof Error ? error.message : t("genericError")
        );
      }
    });
  }

  return (
    <div className="surface-card p-4 sm:p-5">
      <div className="flex rounded-lg border border-[#d0d7de] bg-[#f6f8fa] p-0.5">
        <button
          type="button"
          onClick={() => switchMode("login")}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm transition-colors ${
            mode === "login"
              ? "bg-white font-medium text-[#0d1117] shadow-sm"
              : "text-[#57606a] hover:text-[#0d1117]"
          }`}
        >
          {t("tabLogin")}
        </button>
        <button
          type="button"
          onClick={() => switchMode("signup")}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm transition-colors ${
            mode === "signup"
              ? "bg-white font-medium text-[#0d1117] shadow-sm"
              : "text-[#57606a] hover:text-[#0d1117]"
          }`}
        >
          {t("tabSignup")}
        </button>
      </div>

      <h1 className="mt-3 font-display text-2xl text-[#0d1117]">
        {mode === "login" ? t("loginTitle") : t("signupTitle")}
      </h1>
      <p className="mt-1 text-sm text-[#57606a]">
        {mode === "login" ? t("loginHint") : t("signupHint")}
      </p>

      {verifySent ? (
        <p className="mt-3 rounded-md border border-[#dafbe1] bg-[#dafbe1]/60 px-3 py-2 text-xs text-[#1a7f37]">
          {t("verifySentBanner")}
        </p>
      ) : null}
      {linkRequired ? (
        <p className="mt-3 rounded-md border border-[#fff8c5] bg-[#fff8c5]/80 px-3 py-2 text-xs text-[#9a6700]">
          {t("linkRequiredBanner")}
        </p>
      ) : null}

      <form action={githubAction} className="mt-3">
        <Button
          type="submit"
          variant="primary"
          className="h-10 w-full"
          disabled={pending}
        >
          <GithubIcon className="h-4 w-4" />
          {t("continueGithub")}
        </Button>
      </form>

      <div className="my-3 flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-[#8b949e]">
        <span className="h-px flex-1 bg-[#d0d7de]" />
        {tCommon("orEmail")}
        <span className="h-px flex-1 bg-[#d0d7de]" />
      </div>

      <form onSubmit={onEmailSubmit} className="space-y-2.5">
        {mode === "signup" ? (
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label htmlFor="name" className="text-xs text-[#0d1117]">
                {t("name")}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder={t("namePlaceholder")}
                className="mt-0.5 !py-2"
              />
            </div>
            <div>
              <label htmlFor="role" className="text-xs text-[#0d1117]">
                {t("role")}
              </label>
              <select
                id="role"
                name="role"
                defaultValue="developer"
                className="mt-0.5 !py-2"
              >
                <option value="developer">{t("roleDeveloper")}</option>
                <option value="designer">{t("roleDesigner")}</option>
                <option value="docs">{t("roleDocs")}</option>
                <option value="community">{t("roleCommunity")}</option>
                <option value="other">{t("roleOther")}</option>
              </select>
            </div>
          </div>
        ) : null}

        <div>
          <label htmlFor="email" className="text-xs text-[#0d1117]">
            {t("email")}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder={t("emailPlaceholder")}
            className="mt-0.5 !py-2"
          />
        </div>
        <div>
          <label htmlFor="password" className="text-xs text-[#0d1117]">
            {t("password")}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete={
              mode === "signup" ? "new-password" : "current-password"
            }
            placeholder={
              mode === "signup"
                ? t("passwordSignupPlaceholder")
                : t("passwordPlaceholder")
            }
            className="mt-0.5 !py-2"
          />
        </div>

        <Button
          type="submit"
          variant="outline"
          className="h-10 w-full"
          disabled={pending}
        >
          {pending
            ? tCommon("loading")
            : mode === "signup"
              ? t("createAccount")
              : t("signInEmail")}
        </Button>
      </form>
    </div>
  );
}
