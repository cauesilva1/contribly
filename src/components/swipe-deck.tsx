"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Heart, X } from "lucide-react";
import { toast } from "sonner";
import { expressInterest } from "@/app/actions";
import { EmptyState } from "@/components/empty-state";

type SwipeProject = {
  id: string;
  title: string;
  description: string;
  languages: string[];
  tags: string[];
  lookingFor: string[];
  githubLink: string;
  score?: number;
  owner: {
    name: string | null;
    githubUsername: string | null;
  };
};

export function SwipeDeck({ projects }: { projects: SwipeProject[] }) {
  const [index, setIndex] = useState(0);
  const [pending, startTransition] = useTransition();
  const [exit, setExit] = useState<"left" | "right" | null>(null);
  const current = projects[index];
  const next = projects[index + 1];

  if (!current) {
    return (
      <EmptyState
        title="Deck vazio"
        description="Você já viu os projetos disponíveis. Publique um repo ou volte depois para novos matches."
        actionLabel="Publicar projeto"
        actionHref="/projects/new"
      />
    );
  }

  function decide(interested: boolean) {
    if (pending || exit) return;
    const direction = interested ? "right" : "left";
    setExit(direction);

    startTransition(async () => {
      try {
        await Promise.all([
          expressInterest(current.id, interested),
          new Promise((resolve) => window.setTimeout(resolve, 420)),
        ]);
        setExit(null);
        setIndex((value) => value + 1);
        toast.success(
          interested ? "Interesse enviado ao mantenedor" : "Projeto pulado"
        );
      } catch (error) {
        setExit(null);
        toast.error(
          error instanceof Error ? error.message : "Não foi possível registrar"
        );
      }
    });
  }

  const busy = pending || Boolean(exit);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="flex items-center gap-2 sm:gap-4 md:gap-5">
        <button
          type="button"
          aria-label="Passar"
          disabled={busy}
          onClick={() => decide(false)}
          className="flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-[#ffc1c0] bg-white text-[#cf222e] shadow-[0_10px_24px_rgba(207,34,46,0.12)] transition hover:scale-105 hover:bg-[#ffebe9] disabled:cursor-not-allowed disabled:opacity-50 sm:h-16 sm:w-16"
        >
          <X className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={2.5} />
        </button>

        <div className="relative h-[min(52vh,440px)] min-w-0 flex-1">
          {next ? (
            <article className="absolute inset-0 scale-[0.96] rounded-2xl border border-[#d0d7de] bg-white/80 p-5 opacity-70 shadow-[0_12px_30px_rgba(13,17,23,0.06)] sm:p-6 md:p-7">
              <p className="text-xs uppercase tracking-[0.2em] text-[#57606a]">
                {index + 2} / {projects.length}
              </p>
              <h2 className="mt-3 font-display text-2xl text-[#0d1117]">
                {next.title}
              </h2>
            </article>
          ) : null}

          <article
            key={current.id}
            className={`absolute inset-0 flex flex-col overflow-hidden rounded-2xl border border-[#d0d7de] bg-white p-5 shadow-[0_24px_60px_rgba(13,17,23,0.12)] sm:p-6 md:p-7 ${
              exit === "right"
                ? "swipe-exit-right"
                : exit === "left"
                  ? "swipe-exit-left"
                  : ""
            }`}
          >
            {exit === "right" ? (
              <span className="swipe-stamp swipe-stamp-like">MATCH</span>
            ) : null}
            {exit === "left" ? (
              <span className="swipe-stamp swipe-stamp-nope">PASS</span>
            ) : null}

            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.2em] text-[#57606a]">
                {index + 1} / {projects.length}
              </p>
              {typeof current.score === "number" ? (
                <span className="rounded-md bg-[#dafbe1] px-2 py-1 text-xs font-semibold text-[#1a7f37]">
                  match {current.score}
                </span>
              ) : null}
            </div>

            <h2 className="mt-4 font-display text-2xl leading-tight text-[#0d1117] sm:text-3xl">
              {current.title}
            </h2>
            <p className="mt-3 line-clamp-5 flex-1 text-sm leading-relaxed text-[#57606a] sm:text-base">
              {current.description}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {current.languages.map((lang) => (
                <span
                  key={lang}
                  className="rounded-md bg-[#ddf4ff] px-2 py-1 text-xs text-[#0969da]"
                >
                  {lang}
                </span>
              ))}
              {current.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-[#f6f8fa] px-2 py-1 text-xs text-[#57606a]"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {current.lookingFor.length > 0 ? (
              <p className="mt-4 rounded-lg bg-[#f6f8fa] px-3 py-2 text-sm text-[#0d1117]">
                Buscando: {current.lookingFor.join(", ")}
              </p>
            ) : null}

            <p className="mt-3 text-sm text-[#57606a]">
              Mantenedor:{" "}
              {current.owner.githubUsername
                ? `@${current.owner.githubUsername}`
                : current.owner.name ?? "Anônimo"}
            </p>

            <Link
              href={`/projects/${current.id}`}
              className="mt-3 inline-block cursor-pointer text-sm text-[#0969da] hover:underline"
              onClick={(event) => {
                if (exit) event.preventDefault();
              }}
            >
              Ver detalhes
            </Link>
          </article>
        </div>

        <button
          type="button"
          aria-label="Tenho interesse"
          disabled={busy}
          onClick={() => decide(true)}
          className="flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-[#a7f0ba] bg-white text-[#1a7f37] shadow-[0_10px_24px_rgba(26,127,55,0.14)] transition hover:scale-105 hover:bg-[#dafbe1] disabled:cursor-not-allowed disabled:opacity-50 sm:h-16 sm:w-16"
        >
          <Heart
            className="h-7 w-7 sm:h-8 sm:w-8"
            fill="currentColor"
            strokeWidth={2}
          />
        </button>
      </div>
    </div>
  );
}
