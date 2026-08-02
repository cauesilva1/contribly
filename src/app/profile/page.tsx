import { updateProfile } from "@/app/actions";
import { requireUser } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { SyncGithubProfileButton } from "@/components/sync-github-profile-button";

export default async function ProfilePage() {
  const user = await requireUser({ skipOnboarding: true });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl text-[#0d1117]">Seu perfil</h1>
          <p className="mt-2 text-[#57606a]">
            No login a gente já tenta preencher com suas tecnologias do GitHub.
            Use o sync para atualizar a qualquer momento.
          </p>
        </div>
        <SyncGithubProfileButton />
      </div>

      <div className="mt-6 rounded-xl border border-[#d0d7de] bg-white p-6">
        <div className="mb-6 flex items-center gap-4">
          {user.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt=""
              className="h-14 w-14 rounded-full border border-[#d0d7de]"
            />
          )}
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-[#57606a]">
              {user.githubUsername ? `@${user.githubUsername}` : user.email}
            </p>
          </div>
        </div>

        <form action={updateProfile}>
          <div className="field">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              defaultValue={user.bio ?? ""}
              placeholder="O que você gosta de construir e como pode ajudar"
            />
          </div>
          <div className="field">
            <label htmlFor="languages">Linguagens / skills (obrigatório)</label>
            <input
              id="languages"
              name="languages"
              required
              defaultValue={user.languages.join(", ")}
              placeholder="TypeScript, Python, Go"
            />
          </div>
          <div className="field">
            <label htmlFor="interestTags">Interesses / tags</label>
            <input
              id="interestTags"
              name="interestTags"
              defaultValue={user.interestTags.join(", ")}
              placeholder="docs, cli, good-first-issue, design"
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
          <label className="mb-6 flex items-center gap-2 text-sm text-[#0d1117]">
            <input
              type="checkbox"
              name="openToInvites"
              defaultChecked={user.openToInvites}
              className="h-4 w-4 w-auto"
            />
            Aberto a receber convites de mantenedores
          </label>
          <Button type="submit" variant="primary">
            Salvar perfil
          </Button>
        </form>
      </div>
    </div>
  );
}
