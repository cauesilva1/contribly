import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { requireUser } from "@/lib/session";
import { isProfileComplete } from "@/lib/profile";
import { ProfileForm } from "@/components/profile-form";
import { SyncGithubProfileButton } from "@/components/sync-github-profile-button";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function OnboardingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("onboarding");

  const user = await requireUser(true);

  if (isProfileComplete(user)) {
    redirect({ href: "/for-you", locale });
  }

  const hasGithub = Boolean(user.githubId);
  const role = user.role;
  const description =
    !hasGithub && role === "designer"
      ? t("descriptionDesigner")
      : !hasGithub && role === "docs"
        ? t("descriptionDocs")
        : !hasGithub
          ? t("descriptionNoGithub")
          : t("description");

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <p className="text-xs uppercase tracking-[0.25em] text-[#0969da]">
        {t("step")}
      </p>
      <h1 className="mt-3 font-display text-3xl text-[#0d1117]">
        {t("title")}
      </h1>
      <p className="mt-2 text-[#57606a]">{description}</p>

      {hasGithub ? (
        <div className="mt-5">
          <SyncGithubProfileButton />
        </div>
      ) : null}

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
          hasGithub={hasGithub}
          role={role}
        />
      </div>
    </div>
  );
}
