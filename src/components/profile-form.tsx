"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { updateProfile } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { SkillAutocomplete } from "@/components/skill-autocomplete";
import {
  INTEREST_TAG_SUGGESTIONS,
  LANGUAGE_SUGGESTIONS,
} from "@/lib/skill-suggestions";

type ProfileFormProps = {
  email: string | null;
  emailRequired: boolean;
  bio: string;
  languages: string;
  interestTags: string;
  experienceLevel: string;
  openToInvites: boolean;
  fromOnboarding?: boolean;
};

export function ProfileForm({
  email,
  emailRequired,
  bio,
  languages,
  interestTags,
  experienceLevel,
  openToInvites,
  fromOnboarding = false,
}: ProfileFormProps) {
  const t = useTranslations("profileForm");
  const [dirty, setDirty] = useState(false);
  const [pending, startTransition] = useTransition();

  function markDirty() {
    setDirty(true);
  }

  function onSubmit(formData: FormData) {
    if (!dirty && !fromOnboarding) {
      toast.message(t("nothingToSave"));
      return;
    }

    startTransition(async () => {
      try {
        await updateProfile(formData);
        if (!fromOnboarding) {
          toast.success(t("profileSaved"));
          setDirty(false);
        }
      } catch (error) {
        if (
          typeof error === "object" &&
          error &&
          "digest" in error &&
          typeof (error as { digest?: string }).digest === "string" &&
          (error as { digest: string }).digest.startsWith("NEXT_")
        ) {
          return;
        }
        toast.error(
          error instanceof Error ? error.message : t("saveError")
        );
      }
    });
  }

  return (
    <form action={onSubmit}>
      {fromOnboarding ? (
        <input type="hidden" name="fromOnboarding" value="1" />
      ) : null}

      <div className="field">
        <label htmlFor="email">
          {t("emailLabel")} {emailRequired ? t("required") : ""}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required={emailRequired}
          defaultValue={email ?? ""}
          placeholder={t("emailPlaceholder")}
          onChange={markDirty}
        />
        <p className="mt-1 text-xs text-[#57606a]">
          {email ? t("emailHintFilled") : t("emailHintEmpty")}
        </p>
      </div>

      <div className="field">
        <label htmlFor="bio">
          {t("bioLabel")}
          {fromOnboarding ? ` ${t("optional")}` : ""}
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          defaultValue={bio}
          placeholder={
            fromOnboarding
              ? t("bioPlaceholderOnboarding")
              : t("bioPlaceholderDefault")
          }
          onChange={markDirty}
        />
      </div>

      <SkillAutocomplete
        id="languages"
        name="languages"
        label={t("languagesLabel")}
        required
        defaultValue={languages}
        placeholder={t("languagesPlaceholder")}
        suggestions={LANGUAGE_SUGGESTIONS}
        hint={t("languagesHint")}
        onDirty={markDirty}
      />

      <SkillAutocomplete
        id="interestTags"
        name="interestTags"
        label={t("interestTagsLabel")}
        defaultValue={interestTags}
        placeholder={t("interestTagsPlaceholder")}
        suggestions={INTEREST_TAG_SUGGESTIONS}
        hint={t("interestTagsHint")}
        onDirty={markDirty}
      />

      <div className="field">
        <label htmlFor="experienceLevel">{t("experienceLevelLabel")}</label>
        <select
          id="experienceLevel"
          name="experienceLevel"
          defaultValue={experienceLevel}
          onChange={markDirty}
        >
          <option value="beginner">{t("levelBeginner")}</option>
          <option value="intermediate">{t("levelIntermediate")}</option>
          <option value="advanced">{t("levelAdvanced")}</option>
        </select>
      </div>

      <label className="checkbox-row text-sm">
        <input
          type="checkbox"
          name="openToInvites"
          defaultChecked={openToInvites}
          onChange={markDirty}
        />
        {t("openToInvites")}
      </label>

      <Button
        type="submit"
        variant="primary"
        disabled={pending}
        className={fromOnboarding ? "w-full" : undefined}
      >
        {pending
          ? t("saving")
          : fromOnboarding
            ? t("continueToRecommendations")
            : t("saveProfile")}
      </Button>
    </form>
  );
}
