import Link from "next/link";
import { Suspense } from "react";
import { auth, signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { listProjects } from "@/app/actions";
import { AuthRequiredToast } from "@/components/auth-required-toast";
import { EmptyState } from "@/components/empty-state";
import { ProjectCard } from "@/components/project-card";

export default async function HomePage() {
  const session = await auth();
  const projects = await listProjects();
  const highlights = projects.slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-10">
      <Suspense fallback={null}>
        <AuthRequiredToast />
      </Suspense>
      <section className="grid items-center gap-10 md:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-[#57606a]">
            Matchmaking open source
          </p>
          <h1 className="mt-4 font-display text-5xl leading-tight text-[#0d1117] md:text-6xl">
            OpenMatch
          </h1>
          <p className="mt-4 max-w-xl text-lg text-[#57606a]">
            Encontre projetos para contribuir com filtros e swipe. Mantenedores
            aceitam interesses e enviam convites para quem está disponível.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {session?.user ? (
              <>
                <Button asChild variant="primary" size="lg">
                  <Link href="/discover">Começar a descobrir</Link>
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
                  Entrar com GitHub
                </Button>
              </form>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-[#d0d7de] bg-white/80 p-6 shadow-[0_30px_80px_rgba(13,17,23,0.08)]">
          <h2 className="font-display text-2xl">Como funciona</h2>
          <ol className="mt-4 space-y-3 text-sm text-[#57606a]">
            <li>1. Entre com GitHub e monte seu perfil (linguagens + disponibilidade).</li>
            <li>2. Descubra projetos cadastrados ou importados do GitHub.</li>
            <li>3. Dê swipe de interesse e aguarde o aceite do mantenedor.</li>
            <li>4. Receba convites se estiver aberto a contribuir.</li>
          </ol>
        </div>
      </section>

      <section className="mt-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl text-[#0d1117]">Destaques</h2>
            <p className="text-[#57606a]">Projetos recentes na plataforma</p>
          </div>
          <Link href="/discover" className="text-sm text-[#0969da] hover:underline">
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
  );
}
