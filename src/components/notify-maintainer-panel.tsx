"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("notifyMaintainer");
  const [copied, setCopied] = useState(false);

  async function copyInvite() {
    try {
      await navigator.clipboard.writeText(options.inviteUrl);
      setCopied(true);
      toast.success(t("copySuccess"));
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("copyError"));
    }
  }

  return (
    <section className="surface-card mt-6 p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-[#0969da]">
        {t("eyebrow")}
      </p>
      <h2 className="mt-2 font-display text-2xl text-[#0d1117]">
        {t("title")}
      </h2>
      <p className="mt-2 text-sm text-[#57606a]">{t("description")}</p>

      <ol className="mt-5 space-y-4">
        <li className="rounded-lg border border-[#d0d7de] p-4">
          <p className="text-sm font-medium text-[#0d1117]">
            {t("step1Title")}
          </p>
          <p className="mt-1 text-sm text-[#57606a]">
            {t("step1Description")}
          </p>
          {options.githubIssueUrl ? (
            <Button asChild variant="outline" size="sm" className="mt-3">
              <a
                href={options.githubIssueUrl}
                target="_blank"
                rel="noreferrer"
              >
                {t("openPrefilledIssue")}
              </a>
            </Button>
          ) : (
            <p className="mt-2 text-xs text-[#57606a]">
              {t("invalidGithubLink")}
            </p>
          )}
        </li>

        <li className="rounded-lg border border-[#d0d7de] p-4">
          <p className="text-sm font-medium text-[#0d1117]">
            {t("step2Title")}
          </p>
          <p className="mt-1 text-sm text-[#57606a]">
            {t("step2Description")}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" variant="primary" size="sm" onClick={copyInvite}>
              {copied ? t("copied") : t("copyLink")}
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href={options.inviteUrl} target="_blank" rel="noreferrer">
                {t("openInvite")}
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
