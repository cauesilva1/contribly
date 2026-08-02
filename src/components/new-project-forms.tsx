"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createProject, importGithubProject } from "@/app/actions";
import { Button } from "@/components/ui/button";

export function NewProjectForms() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onCreate(formData: FormData) {
    startTransition(async () => {
      try {
        const id = await createProject(formData);
        toast.success("Projeto publicado");
        router.push(`/projects/${id}`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Falha ao publicar");
      }
    });
  }

  function onImport(formData: FormData) {
    startTransition(async () => {
      try {
        const id = await importGithubProject(formData);
        toast.success("Repositório importado");
        router.push(`/projects/${id}`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Falha ao importar");
      }
    });
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 md:grid-cols-2">
      <section className="rounded-xl border border-[#d0d7de] bg-white p-6">
        <h1 className="font-display text-3xl text-[#0d1117]">Publicar projeto</h1>
        <p className="mt-2 text-sm text-[#57606a]">
          Cadastro manual com os dados que você quiser destacar.
        </p>
        <form action={onCreate} className="mt-6">
          <div className="field">
            <label htmlFor="title">Título</label>
            <input id="title" name="title" required minLength={3} />
          </div>
          <div className="field">
            <label htmlFor="description">Descrição</label>
            <textarea id="description" name="description" rows={4} required minLength={10} />
          </div>
          <div className="field">
            <label htmlFor="githubLink">Link do GitHub</label>
            <input
              id="githubLink"
              name="githubLink"
              placeholder="https://github.com/org/repo"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="languages">Linguagens (vírgula)</label>
            <input id="languages" name="languages" placeholder="TypeScript, Go" />
          </div>
          <div className="field">
            <label htmlFor="tags">Tags (vírgula)</label>
            <input id="tags" name="tags" placeholder="docs, good-first-issue" />
          </div>
          <div className="field">
            <label htmlFor="lookingFor">Buscando (vírgula)</label>
            <input
              id="lookingFor"
              name="lookingFor"
              placeholder="frontend, docs, design"
            />
          </div>
          <Button type="submit" variant="primary" disabled={pending}>
            {pending ? "Salvando..." : "Publicar"}
          </Button>
        </form>
      </section>

      <section className="rounded-xl border border-[#d0d7de] bg-white p-6">
        <h2 className="font-display text-3xl text-[#0d1117]">Importar do GitHub</h2>
        <p className="mt-2 text-sm text-[#57606a]">
          Cole a URL do repositório. Repos já cadastrados são bloqueados (dedupe).
        </p>
        <form action={onImport} className="mt-6">
          <div className="field">
            <label htmlFor="githubUrl">URL do repositório</label>
            <input
              id="githubUrl"
              name="githubUrl"
              placeholder="https://github.com/vercel/next.js"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="lookingForImport">Buscando (vírgula)</label>
            <input
              id="lookingForImport"
              name="lookingFor"
              placeholder="contributors, docs"
            />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Importando..." : "Importar"}
          </Button>
        </form>
      </section>
    </div>
  );
}
