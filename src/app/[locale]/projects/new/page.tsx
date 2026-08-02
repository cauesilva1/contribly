import { setRequestLocale } from "next-intl/server";
import { requireUser } from "@/lib/session";
import { NewProjectForms } from "@/components/new-project-forms";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function NewProjectPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  await requireUser();
  return <NewProjectForms />;
}
