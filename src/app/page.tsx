import Link from "next/link";
import { Suspense } from "react";
import { signIn } from "@/auth";
import { listProjects } from "@/app/actions";
import { AuthRequiredToast } from "@/components/auth-required-toast";
import { BrandMark } from "@/components/brand-mark";
import { EmptyState } from "@/components/empty-state";
import { GithubIcon } from "@/components/github-icon";
import { HeroCodePanel } from "@/components/hero-code-panel";
import { ProjectCard } from "@/components/project-card";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/session";

export default async function HomePage() {
  const session = await getSession();
  const projects = await listProjects();
  const highlights = projects.slice(0, 3);

  return (
    <div>
      <Suspense fallback={null}>
        <AuthRequiredToast />
      </Suspense>

      <section className="relative overflow-hidden border-b border-[#d0d7de]/60">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(31,111,235,0.16),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(9,105,218,0.1),transparent_35%)]" />
        <div className="relative mx-auto grid min-h-[auto] max-w-6xl items-center gap-8 px-4 py-6 md:grid-cols-2 md:gap-8 md:py-12">
          <div>
            <div className="flex items-center gap-3">
              <BrandMark className="h-8 w-8 text-[#0969da]" />
              <p className="text-xs uppercase tracking-[0.28em] text-[#57606a]">
                Open source matchmaking
              </p>
            </div>
            <h1 className="mt-3 max-w-xl font-display text-5xl leading-[0.95] text-[#0d1117] sm:text-6xl">
              Contribly
            </h1>
            <p className="mt-4 max-w-md text-base text-[#57606a] md:text-lg">
              Encontre projetos para contribuir. Filtre, dê swipe e receba
              convites de mantenedores.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {session?.user ? (
                <>
                  <Button asChild variant="primary" size="lg">
                    <Link href="/for-you">Ver recomendações</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/swipe">Abrir swipe</Link>
                  </Button>
                </>
              ) : (
                <form
                  action={async () => {
                    "use server";
                    await signIn("github", { redirectTo: "/onboarding" });
                  }}
                >
                  <Button type="submit" variant="primary" size="lg">
                    <GithubIcon className="h-[1.1rem] w-[1.1rem]" />
                    Entrar com GitHub
                  </Button>
                </form>
              )}
            </div>
          </div>

          <HeroCodePanel />
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <section className="grid gap-5 md:grid-cols-3">
          {[
            ["1", "Perfil pelo GitHub", "Sincronizamos linguagens e interesses a partir dos seus repos."],
            ["2", "Descubra e dê swipe", "Filtre projetos ou use o deck de interesse."],
            ["3", "Combine o próximo passo", "Aceite, convite e fale na thread do match."],
          ].map(([step, title, text]) => (
            <div key={step} className="border-t border-[#d0d7de] pt-3">
              <p className="text-xs uppercase tracking-[0.2em] text-[#0969da]">
                Passo {step}
              </p>
              <h2 className="mt-2 font-display text-xl text-[#0d1117]">{title}</h2>
              <p className="mt-1.5 text-sm text-[#57606a]">{text}</p>
            </div>
          ))}
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl text-[#0d1117]">Destaques</h2>
              <p className="text-sm text-[#57606a]">Projetos recentes na plataforma</p>
            </div>
            <Link
              href="/discover"
              className="cursor-pointer text-sm text-[#0969da] hover:underline"
            >
              Ver todos
            </Link>
          </div>

          {highlights.length === 0 ? (
            <EmptyState
              title="Ainda sem destaques"
              description="Faça login, monte seu perfil e publique ou importe o primeiro projeto open source."
              actionLabel={session?.user ? "Publicar projeto" : undefined}
              actionHref={session?.user ? "/projects/new" : undefined}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {highlights.map((project) => (
                <ProjectCard
                  key={project.id}
                  id={project.id}
                  title={project.title}
                  description={project.description}
                  languages={project.languages}
                  tags={project.tags}
                  githubLink={project.githubLink}
                  ownerName={project.owner.name}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
