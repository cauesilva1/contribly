import { updateProfile } from "@/app/actions";
import { requireUser } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { DeleteAccountButton } from "@/components/delete-account-button";
import { SyncGithubProfileButton } from "@/components/sync-github-profile-button";

export default async function ProfilePage() {
  const user = await requireUser(true);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#d0d7de] pb-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#0969da]">
            Conta
          </p>
          <h1 className="mt-2 font-display text-3xl text-[#0d1117]">
            Seu perfil
          </h1>
          <p className="mt-2 text-[#57606a]">
            No login a gente tenta preencher com o GitHub. Use o sync para
            atualizar a qualquer momento.
          </p>
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
              {user.email ?? "sem e-mail"}
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.15em] text-[#0969da]">
              {user.experienceLevel}
            </p>
          </div>
        </div>

        <form action={updateProfile}>
          <div className="field">
            <label htmlFor="email">
              E-mail {!user.email ? "(obrigatório)" : ""}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required={!user.email}
              defaultValue={user.email ?? ""}
              placeholder="seu@email.com"
            />
            <p className="mt-1 text-xs text-[#57606a]">
              {user.email
                ? "Vindo do GitHub quando disponível. Você pode atualizar."
                : "O GitHub não enviou e-mail. Informe um para contato e avisos."}
            </p>
          </div>
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
          <label className="checkbox-row text-sm">
            <input
              type="checkbox"
              name="openToInvites"
              defaultChecked={user.openToInvites}
            />
            Aberto a receber convites de mantenedores
          </label>
          <Button type="submit" variant="primary">
            Salvar perfil
          </Button>
        </form>
      </div>

      <div className="surface-card mt-4 p-5">
        <h2 className="font-display text-xl text-[#0d1117]">Zona de risco</h2>
        <p className="mt-1 text-sm text-[#57606a]">
          Excluir a conta remove seus dados do OpenMatch (LGPD / direito de
          apagar). Projetos que você publicou também saem.
        </p>
        <div className="mt-4">
          <DeleteAccountButton />
        </div>
      </div>
    </div>
  );
}
