import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { isProfileComplete } from "@/lib/profile";
import { ProfileForm } from "@/components/profile-form";
import { SyncGithubProfileButton } from "@/components/sync-github-profile-button";

export default async function OnboardingPage() {
  const user = await requireUser(true);

  if (isProfileComplete(user)) {
    redirect("/for-you");
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <p className="text-xs uppercase tracking-[0.25em] text-[#0969da]">
        Passo 1 de 1
      </p>
      <h1 className="mt-3 font-display text-3xl text-[#0d1117]">
        Monte seu perfil
      </h1>
      <p className="mt-2 text-[#57606a]">
        Se o GitHub já preencheu suas linguagens, revise e continue. Caso
        contrário, sincronize ou edite manualmente.
      </p>

      <div className="mt-5">
        <SyncGithubProfileButton />
      </div>

      <div className="surface-card mt-4 p-5">
        <ProfileForm
          email={user.email}
          emailRequired={!user.email}
          bio={user.bio ?? ""}
          languages={user.languages.join(", ")}
          interestTags={user.interestTags.join(", ")}
          experienceLevel={user.experienceLevel}
          openToInvites={user.openToInvites}
          fromOnboarding
        />
      </div>
    </div>
  );
}
