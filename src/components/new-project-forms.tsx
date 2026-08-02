"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createProject, previewGithubRepo } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { GithubIcon } from "@/components/github-icon";
import { SkillAutocomplete } from "@/components/skill-autocomplete";
import {
  INTEREST_TAG_SUGGESTIONS,
  LANGUAGE_SUGGESTIONS,
} from "@/lib/skill-suggestions";

type FormState = {
  githubLink: string;
  githubRepoId: string;
  title: string;
  description: string;
  languages: string;
  tags: string;
  lookingFor: string;
  starsCount: number | null;
};

const emptyForm: FormState = {
  githubLink: "",
  githubRepoId: "",
  title: "",
  description: "",
  languages: "",
  tags: "",
  lookingFor: "",
  starsCount: null,
};

function looksLikeGithubRepo(url: string) {
  return /github\.com\/[^/\s]+\/[^/\s#?]+/i.test(url.trim());
}

export function NewProjectForms() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [fetching, setFetching] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [skillsKey, setSkillsKey] = useState(0);
  const lastFetchedUrl = useRef("");

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function pullFromGithub(url: string) {
    const normalized = url.trim();
    if (!looksLikeGithubRepo(normalized)) return;
    if (
      normalized === lastFetchedUrl.current ||
      normalized.replace(/\/$/, "").toLowerCase() ===
        lastFetchedUrl.current.replace(/\/$/, "").toLowerCase()
    ) {
      return;
    }

    setFetching(true);
    try {
      const preview = await previewGithubRepo(normalized);
      lastFetchedUrl.current = preview.githubLink;
      setForm((current) => ({
        ...current,
        githubLink: preview.githubLink,
        githubRepoId: preview.githubRepoId,
        title: preview.title,
        description: preview.description,
        languages: preview.languages,
        tags: preview.tags,
        starsCount: preview.starsCount ?? null,
      }));
      setSkillsKey((value) => value + 1);
      setFetched(true);
      toast.success(
        preview.starsCount
          ? `Dados puxados do GitHub · ${preview.starsCount} stars`
          : "Dados puxados do GitHub"
      );
    } catch (error) {
      lastFetchedUrl.current = "";
      setFetched(false);
      setForm((current) => ({
        ...current,
        githubRepoId: "",
        starsCount: null,
      }));
      toast.error(
        error instanceof Error ? error.message : "Falha ao ler o repositório"
      );
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    if (!looksLikeGithubRepo(form.githubLink)) return;
    const timer = window.setTimeout(() => {
      void pullFromGithub(form.githubLink);
    }, 550);
    return () => window.clearTimeout(timer);
  }, [form.githubLink]);

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        const id = await createProject(formData);
        toast.success("Projeto publicado · issues sincronizadas quando possível");
        router.push(`/projects/${id}`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Falha ao publicar");
      }
    });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <section className="surface-card p-5">
        <p className="text-xs uppercase tracking-[0.25em] text-[#0969da]">
          Publicar
        </p>
        <h1 className="mt-2 font-display text-3xl text-[#0d1117]">
          Publicar projeto
        </h1>
        <p className="mt-2 text-sm text-[#57606a]">
          Cole o link do GitHub — a gente preenche título, descrição, linguagens
          e tags. Edite só o que quiser.
        </p>

        <form action={onSubmit} className="mt-5">
          <input type="hidden" name="githubRepoId" value={form.githubRepoId} />
          <input
            type="hidden"
            name="starsCount"
            value={form.starsCount ?? ""}
          />

          <div className="field">
            <label htmlFor="githubLink">Link do GitHub</label>
            <div className="relative">
              <input
                id="githubLink"
                name="githubLink"
                value={form.githubLink}
                onChange={(event) => {
                  setFetched(false);
                  updateField("githubLink", event.target.value);
                }}
                onBlur={() => {
                  void pullFromGithub(form.githubLink);
                }}
                placeholder="https://github.com/org/repo"
                required
              />
              {fetching ? (
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#57606a]">
                  Buscando...
                </span>
              ) : null}
            </div>
            {fetched ? (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[#1a7f37]">
                <GithubIcon className="h-3.5 w-3.5" />
                Preenchido a partir do GitHub — ajuste abaixo se precisar
              </p>
            ) : null}
          </div>

          <div className="field">
            <label htmlFor="title">Título</label>
            <input
              id="title"
              name="title"
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              required
              minLength={3}
              placeholder="Preenchido ao colar o link"
            />
          </div>

          <div className="field">
            <label htmlFor="description">Descrição</label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              required
              minLength={10}
              placeholder="Preenchida ao colar o link"
            />
          </div>

          <SkillAutocomplete
            key={`languages-${skillsKey}`}
            id="languages"
            name="languages"
            label="Linguagens"
            defaultValue={form.languages}
            placeholder="Digite para buscar…"
            suggestions={LANGUAGE_SUGGESTIONS}
            hint="Sugestões ao digitar. Enter adiciona."
          />

          <SkillAutocomplete
            key={`tags-${skillsKey}`}
            id="tags"
            name="tags"
            label="Tags"
            defaultValue={form.tags}
            placeholder="Digite para buscar…"
            suggestions={INTEREST_TAG_SUGGESTIONS}
          />

          <SkillAutocomplete
            key={`lookingFor-${skillsKey}`}
            id="lookingFor"
            name="lookingFor"
            label="Buscando"
            defaultValue={form.lookingFor}
            placeholder="Digite para buscar…"
            suggestions={[...LANGUAGE_SUGGESTIONS, ...INTEREST_TAG_SUGGESTIONS]}
            hint="Skills ou temas que o projeto precisa."
          />

          <Button type="submit" variant="primary" disabled={pending || fetching}>
            {pending ? "Publicando..." : "Publicar"}
          </Button>
        </form>
      </section>
    </div>
  );
}
