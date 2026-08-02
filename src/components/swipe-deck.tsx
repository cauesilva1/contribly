"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { expressInterest } from "@/app/actions";
import { Button } from "@/components/ui/button";
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
  const [feedback, setFeedback] = useState<"pass" | "like" | null>(null);
  const current = projects[index];

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
    if (pending) return;
    setFeedback(interested ? "like" : "pass");

    startTransition(async () => {
      try {
        await expressInterest(current.id, interested);
        toast.success(
          interested
            ? "Interesse enviado ao mantenedor"
            : "Projeto pulado"
        );
        setTimeout(() => {
          setFeedback(null);
          setIndex((value) => value + 1);
        }, 220);
      } catch (error) {
        setFeedback(null);
        toast.error(
          error instanceof Error ? error.message : "Não foi possível registrar"
        );
      }
    });
  }

  return (
    <div className="mx-auto max-w-xl">
      <article
        className={`rounded-2xl border bg-white p-6 shadow-[0_20px_50px_rgba(13,17,23,0.08)] transition-all duration-200 ${
          feedback === "like"
            ? "border-[#1f883d] -rotate-1 scale-[1.01]"
            : feedback === "pass"
              ? "border-[#cf222e] rotate-1 opacity-80"
              : "border-[#d0d7de]"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.2em] text-[#57606a]">
            {index + 1} / {projects.length}
          </p>
          <div className="flex items-center gap-2">
            {typeof current.score === "number" && (
              <span className="rounded-md bg-[#dafbe1] px-2 py-1 text-xs font-semibold text-[#1a7f37]">
                match {current.score}
              </span>
            )}
            {feedback && (
              <span
                className={`rounded-md px-2 py-1 text-xs font-semibold ${
                  feedback === "like"
                    ? "bg-[#dafbe1] text-[#1a7f37]"
                    : "bg-[#ffebe9] text-[#cf222e]"
                }`}
              >
                {feedback === "like" ? "INTERESSE" : "PASSOU"}
              </span>
            )}
          </div>
        </div>
        <h2 className="mt-3 font-display text-3xl text-[#0d1117]">{current.title}</h2>
        <p className="mt-3 text-[#57606a]">{current.description}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {current.languages.map((lang) => (
            <span
              key={lang}
              className="rounded-md bg-[#ddf4ff] px-2 py-1 text-xs text-[#0969da]"
            >
              {lang}
            </span>
          ))}
          {current.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-[#f6f8fa] px-2 py-1 text-xs text-[#57606a]"
            >
              #{tag}
            </span>
          ))}
        </div>

        {current.lookingFor.length > 0 && (
          <p className="mt-4 text-sm text-[#0d1117]">
            Buscando: {current.lookingFor.join(", ")}
          </p>
        )}

        <p className="mt-4 text-sm text-[#57606a]">
          Mantenedor:{" "}
          {current.owner.githubUsername
            ? `@${current.owner.githubUsername}`
            : current.owner.name ?? "Anônimo"}
        </p>

        <Link
          href={`/projects/${current.id}`}
          className="mt-4 inline-block text-sm text-[#0969da] hover:underline"
        >
          Ver detalhes
        </Link>
      </article>

      <div className="mt-6 flex items-center justify-center gap-3">
        <Button
          variant="outline"
          size="lg"
          disabled={pending}
          onClick={() => decide(false)}
        >
          Passar
        </Button>
        <Button
          variant="primary"
          size="lg"
          disabled={pending}
          onClick={() => decide(true)}
        >
          {pending ? "Salvando..." : "Tenho interesse"}
        </Button>
      </div>
    </div>
  );
}
