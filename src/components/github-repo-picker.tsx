"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { listMyGithubRepos } from "@/app/actions";
import { connectGithubForPublish } from "@/app/auth-actions";
import { GithubIcon } from "@/components/github-icon";
import { Button } from "@/components/ui/button";

export type PickedGithubRepo = {
  id: string;
  fullName: string;
  htmlUrl: string;
  description: string | null;
  language: string | null;
  starsCount: number;
  isPrivate: boolean;
};

type Props = {
  connected: boolean;
  hasRepoScope: boolean;
  onPick: (repo: PickedGithubRepo) => void;
  selectedUrl?: string;
};

export function GithubRepoPicker({
  connected,
  hasRepoScope,
  onPick,
  selectedUrl,
}: Props) {
  const t = useTranslations("newProject");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [repos, setRepos] = useState<PickedGithubRepo[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [pending, startTransition] = useTransition();

  function needsReconnect() {
    return !connected || !hasRepoScope;
  }

  function loadRepos(search?: string) {
    startTransition(async () => {
      try {
        const items = await listMyGithubRepos(search);
        setRepos(items);
        setLoaded(true);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : t("exploreFailed");
        if (message === "GITHUB_CONNECT_REQUIRED") {
          toast.error(t("connectGithubRequired"));
          return;
        }
        toast.error(message);
      }
    });
  }

  useEffect(() => {
    if (!open || needsReconnect()) return;
    if (!loaded) loadRepos();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once when opened
  }, [open, connected, hasRepoScope]);

  useEffect(() => {
    if (!open || needsReconnect() || !loaded) return;
    const timer = window.setTimeout(() => {
      loadRepos(query);
    }, 280);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const emptyLabel = useMemo(() => {
    if (pending && !loaded) return t("exploreLoading");
    if (!repos.length) return t("exploreEmpty");
    return null;
  }, [pending, loaded, repos.length, t]);

  return (
    <div className="mb-4">
      <div className="flex flex-wrap items-center gap-2">
        {needsReconnect() ? (
          <form action={connectGithubForPublish}>
            <Button type="submit" variant="outline">
              <GithubIcon className="mr-1.5 h-4 w-4" />
              {t("connectGithubExplore")}
            </Button>
          </form>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen((value) => !value)}
          >
            <GithubIcon className="mr-1.5 h-4 w-4" />
            {open ? t("exploreHide") : t("exploreGithub")}
          </Button>
        )}
        <span className="text-xs text-[#57606a]">{t("exploreHint")}</span>
      </div>

      {open && !needsReconnect() ? (
        <div className="mt-3 overflow-hidden rounded-lg border border-[#d0d7de] bg-[#f6f8fa]">
          <div className="border-b border-[#d0d7de] bg-white p-2">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("exploreSearchPlaceholder")}
              className="w-full rounded-md border border-[#d0d7de] bg-white px-3 py-2 text-sm outline-none focus:border-[#0969da]"
              autoFocus
            />
          </div>
          <ul className="max-h-64 overflow-y-auto">
            {emptyLabel ? (
              <li className="px-3 py-6 text-center text-sm text-[#57606a]">
                {emptyLabel}
              </li>
            ) : (
              repos.map((repo) => {
                const selected =
                  selectedUrl?.replace(/\/$/, "").toLowerCase() ===
                  repo.htmlUrl.replace(/\/$/, "").toLowerCase();
                return (
                  <li key={repo.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onPick(repo);
                        setOpen(false);
                      }}
                      className={`flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-[#ddf4ff] ${
                        selected ? "bg-[#ddf4ff]" : "bg-white"
                      }`}
                    >
                      <GithubIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#24292f]" />
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-1.5">
                          <span className="truncate text-sm font-medium text-[#0d1117]">
                            {repo.fullName}
                          </span>
                          {repo.isPrivate ? (
                            <span className="rounded bg-[#fff8c5] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#9a6700]">
                              {t("privateBadge")}
                            </span>
                          ) : null}
                        </span>
                        {repo.description ? (
                          <span className="mt-0.5 line-clamp-1 block text-xs text-[#57606a]">
                            {repo.description}
                          </span>
                        ) : null}
                      </span>
                      {repo.language ? (
                        <span className="shrink-0 text-xs text-[#57606a]">
                          {repo.language}
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
