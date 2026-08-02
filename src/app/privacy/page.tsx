import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Privacidade",
  description:
    "Como o Contribly trata dados pessoais, autenticação GitHub e exclusão de conta.",
};

const sections = [
  {
    title: "O que coletamos",
    body: [
      "Dados da conta GitHub usados no login (nome, e-mail quando disponível, foto e nome de usuário).",
      "Informações que você preenche no perfil (bio, linguagens, tags de interesse, nível e preferência de convites).",
      "Atividade na plataforma: projetos publicados, swipes, interesses, convites, participações e mensagens de match.",
      "Metadados públicos de repositórios importados (stars, issues com labels como good first issue / help wanted), sincronizados periodicamente.",
    ],
  },
  {
    title: "Para que usamos",
    body: [
      "Autenticar você e manter a sessão.",
      "Recomendar projetos e candidatos (matching).",
      "Permitir interesse, aceite, convite e conversa entre contribuidor e mantenedor.",
      "Sincronizar perfil e issues com a API do GitHub, quando houver permissão ou token configurado.",
    ],
  },
  {
    title: "Onde fica armazenado",
    body: [
      "Aplicação hospedada na Vercel.",
      "Banco PostgreSQL no Supabase.",
      "Autenticação via Auth.js com provedor GitHub OAuth.",
    ],
  },
  {
    title: "Compartilhamento",
    body: [
      "Não vendemos dados pessoais.",
      "Conteúdo que você publica (projetos, interesses aceitos, mensagens de match) fica visível para as partes envolvidas no fluxo do produto.",
      "Provedores de infraestrutura (Vercel, Supabase, GitHub) processam dados necessários para operar o serviço.",
    ],
  },
  {
    title: "Seus direitos",
    body: [
      "Você pode editar o perfil a qualquer momento.",
      "Pode excluir a conta em Perfil → Zona de risco. Isso remove seus dados do Contribly (incluindo projetos que você publicou).",
      "O código é open source sob licença MIT; audite o que o app faz no repositório.",
    ],
  },
] as const;

export default function PrivacyPage() {
  return (
    <div>
      <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
        <p className="text-xs uppercase tracking-[0.25em] text-[#0969da]">
          Legal
        </p>
        <h1 className="mt-2 font-display text-4xl text-[#0d1117]">
          Privacidade
        </h1>
        <p className="mt-3 text-[#57606a]">
          Resumo claro do que o Contribly faz com dados. Última atualização:{" "}
          agosto de 2026.
        </p>

        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <section
              key={section.title}
              className="border-t border-[#d0d7de] pt-5"
            >
              <h2 className="font-display text-2xl text-[#0d1117]">
                {section.title}
              </h2>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[#57606a]">
                {section.body.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#0969da]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <p className="mt-10 text-sm text-[#57606a]">
          Dúvidas ou pedidos sobre dados: abra uma issue no{" "}
          <a
            href="https://github.com/cauesilva1/contribly/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0969da] hover:underline"
          >
            GitHub
          </a>{" "}
          ou gerencie a conta em{" "}
          <Link href="/profile" className="text-[#0969da] hover:underline">
            Perfil
          </Link>
          .
        </p>
      </div>

      <SiteFooter />
    </div>
  );
}
