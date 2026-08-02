import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { signIn } from "@/auth";
import { claimMaintainerInvite } from "@/app/actions";
import { BrandMark } from "@/components/brand-mark";
import { GithubIcon } from "@/components/github-icon";
import { Button } from "@/components/ui/button";
import { parseGithubOwnerRepo } from "@/lib/github-url";
import { prisma } from "@/lib/prisma";
import { getOptionalUser } from "@/lib/session";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string; token: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "invite" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function MaintainerInvitePage({ params }: Props) {
  const { locale, token } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("invite");
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
          {t("eyebrow")}
        </p>
        <h1 className="mt-2 font-display text-3xl text-[#0d1117]">
          {invite.project.title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[#57606a]">
          {invite.createdBy.name ?? t("someone")}
          {invite.createdBy.githubUsername
            ? ` (@${invite.createdBy.githubUsername})`
            : ""}{" "}
          {t("wantsToContribute")}
        </p>
        <p className="mt-3 line-clamp-4 text-sm text-[#57606a]">
          {invite.project.description}
        </p>

        {expired ? (
          <p className="mt-6 rounded-md bg-[#fff8c5] px-3 py-2 text-sm text-[#9a6700]">
            {t("expired")}
          </p>
        ) : invite.claimedAt ? (
          <p className="mt-6 text-sm text-[#57606a]">
            {t("alreadyUsed")}{" "}
            <Link href="/dashboard" className="text-[#0969da] hover:underline">
              {t("goToDashboard")}
            </Link>
          </p>
        ) : (
          <div className="mt-6 space-y-3">
            {githubOwner ? (
              <p className="text-sm text-[#57606a]">
                {t("idealAccount")}{" "}
                <strong className="text-[#0d1117]">
                  {githubOwner}/{parsed?.repo}
                </strong>{" "}
                {t("orAccountThatPublished")}
              </p>
            ) : null}

            {user ? (
              <form action={claimAction}>
                <Button type="submit" variant="primary" size="lg">
                  {t("claimButton")}
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
                  {t("signInGithub")}
                </Button>
              </form>
            )}

            <a
              href={invite.project.githubLink}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-sm text-[#0969da] hover:underline"
            >
              {t("viewRepo")}
            </a>
          </div>
        )}
      </article>
    </div>
  );
}
