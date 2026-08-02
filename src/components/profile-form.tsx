"use client";

import { useState, useTransition } from "react";
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
  const [dirty, setDirty] = useState(false);
  const [pending, startTransition] = useTransition();

  function markDirty() {
    setDirty(true);
  }

  function onSubmit(formData: FormData) {
    if (!dirty && !fromOnboarding) {
      toast.message("Nada novo para salvar.");
      return;
    }

    startTransition(async () => {
      try {
        await updateProfile(formData);
        if (!fromOnboarding) {
          toast.success("Perfil salvo.");
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
          error instanceof Error ? error.message : "Não foi possível salvar o perfil"
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
        <label htmlFor="email">E-mail {emailRequired ? "(obrigatório)" : ""}</label>
        <input
          id="email"
          name="email"
          type="email"
          required={emailRequired}
          defaultValue={email ?? ""}
          placeholder="seu@email.com"
          onChange={markDirty}
        />
        <p className="mt-1 text-xs text-[#57606a]">
          {email
            ? "Vindo do GitHub quando disponível. Você pode atualizar."
            : "O GitHub não enviou e-mail. Informe um para contato e avisos."}
        </p>
      </div>

      <div className="field">
        <label htmlFor="bio">Bio{fromOnboarding ? " (opcional)" : ""}</label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          defaultValue={bio}
          placeholder={
            fromOnboarding
              ? "Ex.: gosto de docs, bugs iniciantes e front-end"
              : "O que você gosta de construir e como pode ajudar"
          }
          onChange={markDirty}
        />
      </div>

      <SkillAutocomplete
        id="languages"
        name="languages"
        label="Linguagens / skills (obrigatório)"
        required
        defaultValue={languages}
        placeholder="Digite para buscar, ex.: Type…"
        suggestions={LANGUAGE_SUGGESTIONS}
        hint="Digite para ver sugestões. Enter ou vírgula adiciona."
        onDirty={markDirty}
      />

      <SkillAutocomplete
        id="interestTags"
        name="interestTags"
        label="Interesses / tags"
        defaultValue={interestTags}
        placeholder="Digite para buscar, ex.: docs…"
        suggestions={INTEREST_TAG_SUGGESTIONS}
        hint="Sugestões de tags comuns. Você também pode criar a sua."
        onDirty={markDirty}
      />

      <div className="field">
        <label htmlFor="experienceLevel">Experiência em open source</label>
        <select
          id="experienceLevel"
          name="experienceLevel"
          defaultValue={experienceLevel}
          onChange={markDirty}
        >
          <option value="beginner">Iniciante</option>
          <option value="intermediate">Intermediário</option>
          <option value="advanced">Avançado</option>
        </select>
      </div>

      <label className="checkbox-row text-sm">
        <input
          type="checkbox"
          name="openToInvites"
          defaultChecked={openToInvites}
          onChange={markDirty}
        />
        Aberto a receber convites de mantenedores
      </label>

      <Button
        type="submit"
        variant="primary"
        disabled={pending}
        className={fromOnboarding ? "w-full" : undefined}
      >
        {pending
          ? "Salvando..."
          : fromOnboarding
            ? "Continuar para recomendações"
            : "Salvar perfil"}
      </Button>
    </form>
  );
}
