import { setRequestLocale } from "next-intl/server";
import { getGithubPublishAccess } from "@/app/actions";
import { NewProjectForms } from "@/components/new-project-forms";
import { requireUser } from "@/lib/session";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function NewProjectPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  await requireUser();
  const access = await getGithubPublishAccess();

  return (
    <NewProjectForms
      githubConnected={access.connected}
      hasRepoScope={access.hasRepoScope}
    />
  );
}
