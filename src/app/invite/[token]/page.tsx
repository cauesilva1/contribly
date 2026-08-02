import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { signIn } from "@/auth";
import { claimMaintainerInvite } from "@/app/actions";
import { BrandMark } from "@/components/brand-mark";
import { GithubIcon } from "@/components/github-icon";
import { Button } from "@/components/ui/button";
import { parseGithubOwnerRepo } from "@/lib/github-url";
import { prisma } from "@/lib/prisma";
import { getOptionalUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Convite do mantenedor",
  description: "Alguém quer contribuir com o seu projeto no Contribly.",
};

export default async function MaintainerInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invite = await prisma.maintainerInvite.findUnique({
    where: { token },
    include: {
      project: {
        select: {
          id: true,
          title: true,
          description: true,
          githubLink: true,
          ownerId: true,
        },
      },
      createdBy: {
        select: { name: true, githubUsername: true, image: true },
      },
    },
  });

  if (!invite) notFound();

  const expired = invite.expiresAt.getTime() < Date.now();
  const user = await getOptionalUser();
  const parsed = parseGithubOwnerRepo(invite.project.githubLink);
  const githubOwner = parsed?.owner ?? null;

  async function claimAction() {
    "use server";
    await claimMaintainerInvite(token);
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <div className="mb-6 flex items-center gap-2 text-[#0d1117]">
        <BrandMark className="h-7 w-7 text-[#0969da]" />
        <span className="font-display text-2xl">Contribly</span>
      </div>

      <article className="surface-card p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[#0969da]">
          Convite
        </p>
        <h1 className="mt-2 font-display text-3xl text-[#0d1117]">
          {invite.project.title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[#57606a]">
          {invite.createdBy.name ?? "Alguém"}
          {invite.createdBy.githubUsername
            ? ` (@${invite.createdBy.githubUsername})`
            : ""}{" "}
          quer contribuir com este projeto e deixou um interesse no Contribly.
        </p>
        <p className="mt-3 line-clamp-4 text-sm text-[#57606a]">
          {invite.project.description}
        </p>

        {expired ? (
          <p className="mt-6 rounded-md bg-[#fff8c5] px-3 py-2 text-sm text-[#9a6700]">
            Este convite expirou. Peça um novo link a quem demonstrou interesse.
          </p>
        ) : invite.claimedAt ? (
          <p className="mt-6 text-sm text-[#57606a]">
            Convite já utilizado.{" "}
            <Link href="/dashboard" className="text-[#0969da] hover:underline">
              Ir ao painel
            </Link>
          </p>
        ) : (
          <div className="mt-6 space-y-3">
            {githubOwner ? (
              <p className="text-sm text-[#57606a]">
                Ideal entrar com uma conta GitHub que administre{" "}
                <strong className="text-[#0d1117]">
                  {githubOwner}/{parsed?.repo}
                </strong>{" "}
                ou com a conta que publicou o projeto no Contribly.
              </p>
            ) : null}

            {user ? (
              <form action={claimAction}>
                <Button type="submit" variant="primary" size="lg">
                  Sou o mantenedor — ver interesse
                </Button>
              </form>
            ) : (
              <form
                action={async () => {
                  "use server";
                  await signIn("github", {
                    redirectTo: `/invite/${token}`,
                  });
                }}
              >
                <Button type="submit" variant="primary" size="lg">
                  <GithubIcon className="h-[1.1rem] w-[1.1rem]" />
                  Entrar com GitHub
                </Button>
              </form>
            )}

            <a
              href={invite.project.githubLink}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-sm text-[#0969da] hover:underline"
            >
              Ver repositório no GitHub
            </a>
          </div>
        )}
      </article>
    </div>
  );
}
