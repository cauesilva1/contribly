import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requireUser } from "@/lib/session";
import { DeleteAccountButton } from "@/components/delete-account-button";
import { ProfileForm } from "@/components/profile-form";
import { SyncGithubProfileButton } from "@/components/sync-github-profile-button";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ProfilePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("profile");
  const tCommon = await getTranslations("common");

  const user = await requireUser(true);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#d0d7de] pb-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#0969da]">
            {t("eyebrow")}
          </p>
          <h1 className="mt-2 font-display text-3xl text-[#0d1117]">
            {t("title")}
          </h1>
          <p className="mt-2 text-[#57606a]">{t("description")}</p>
        </div>
        <SyncGithubProfileButton />
      </div>

      <div className="surface-card mt-4 p-5">
        <div className="mb-5 flex items-center gap-3">
          {user.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt=""
              className="h-16 w-16 rounded-full border border-[#d0d7de] object-cover"
            />
          )}
          <div>
            <p className="text-lg font-medium text-[#0d1117]">{user.name}</p>
            <p className="text-sm text-[#57606a]">
              {user.githubUsername ? `@${user.githubUsername}` : null}
              {user.githubUsername && user.email ? " · " : null}
              {user.email ?? tCommon("noEmail")}
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.15em] text-[#0969da]">
              {user.experienceLevel}
            </p>
          </div>
        </div>

        <ProfileForm
          email={user.email}
          emailRequired={!user.email}
          bio={user.bio ?? ""}
          languages={user.languages.join(", ")}
          interestTags={user.interestTags.join(", ")}
          experienceLevel={user.experienceLevel}
          openToInvites={user.openToInvites}
        />
      </div>

      <div className="surface-card mt-4 p-5">
        <h2 className="font-display text-xl text-[#0d1117]">
          {t("dangerZoneTitle")}
        </h2>
        <p className="mt-1 text-sm text-[#57606a]">
          {t.rich("dangerZoneDescription", {
            privacyLink: (chunks) => (
              <Link href="/privacy" className="text-[#0969da] hover:underline">
                {chunks}
              </Link>
            ),
          })}
        </p>
        <div className="mt-4">
          <DeleteAccountButton />
        </div>
      </div>
    </div>
  );
}
