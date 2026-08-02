import { redirect } from "next/navigation";
import { updateProfile } from "@/app/actions";
import { requireUser } from "@/lib/session";
import { isProfileComplete } from "@/lib/profile";
import { Button } from "@/components/ui/button";
import { SyncGithubProfileButton } from "@/components/sync-github-profile-button";

export default async function OnboardingPage() {
  const user = await requireUser({ skipOnboarding: true });

  if (isProfileComplete(user)) {
    redirect("/for-you");
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <p className="text-sm uppercase tracking-[0.2em] text-[#57606a]">
        Passo 1 de 1
      </p>
      <h1 className="mt-3 font-display text-4xl text-[#0d1117]">
        Monte seu perfil
      </h1>
      <p className="mt-2 text-[#57606a]">
        Se o GitHub já preencheu suas linguagens, revise e continue. Caso
        contrário, sincronize ou edite manualmente.
      </p>

      <div className="mt-4">
        <SyncGithubProfileButton />
      </div>

      <form action={updateProfile} className="mt-6 rounded-xl border border-[#d0d7de] bg-white p-6">
        <input type="hidden" name="fromOnboarding" value="1" />
        <div className="field">
          <label htmlFor="languages">Linguagens / skills (obrigatório)</label>
          <input
            id="languages"
            name="languages"
            required
            placeholder="TypeScript, Python, Go"
            defaultValue={user.languages.join(", ")}
          />
        </div>
        <div className="field">
          <label htmlFor="interestTags">Interesses / tags</label>
          <input
            id="interestTags"
            name="interestTags"
            placeholder="docs, frontend, cli"
            defaultValue={user.interestTags.join(", ")}
          />
        </div>
        <div className="field">
          <label htmlFor="experienceLevel">Experiência em open source</label>
          <select
            id="experienceLevel"
            name="experienceLevel"
            defaultValue={user.experienceLevel}
          >
            <option value="beginner">Iniciante</option>
            <option value="intermediate">Intermediário</option>
            <option value="advanced">Avançado</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="bio">Bio (opcional)</label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            defaultValue={user.bio ?? ""}
            placeholder="Ex.: gosto de docs, bugs iniciantes e front-end"
          />
        </div>
        <label className="mb-6 flex items-center gap-2 text-sm text-[#0d1117]">
          <input
            type="checkbox"
            name="openToInvites"
            defaultChecked={user.openToInvites}
            className="h-4 w-4 w-auto"
          />
          Estou aberto a receber convites
        </label>
        <Button type="submit" variant="primary" className="w-full">
          Continuar para recomendações
        </Button>
      </form>
    </div>
  );
}
