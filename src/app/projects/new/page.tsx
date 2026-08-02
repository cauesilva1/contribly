import { requireUser } from "@/lib/session";
import { NewProjectForms } from "@/components/new-project-forms";

export default async function NewProjectPage() {
  await requireUser();
  return <NewProjectForms />;
}
