import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { GithubIcon } from "@/components/github-icon";

const REPO = "https://github.com/cauesilva1/contribly";

const productLinks = [
  { href: "/discover", label: "Descobrir" },
  { href: "/for-you", label: "Pra você" },
  { href: "/swipe", label: "Swipe" },
  { href: "/projects/new", label: "Publicar projeto" },
  { href: "/dashboard", label: "Painel" },
] as const;

const communityLinks = [
  { href: REPO, label: "Código no GitHub", external: true },
  { href: `${REPO}/issues`, label: "Reportar problema", external: true },
  { href: `${REPO}/blob/main/CONTRIBUTING.md`, label: "Como contribuir", external: true },
  { href: `${REPO}/blob/main/README.md`, label: "Documentação", external: true },
] as const;

const legalLinks = [
  { href: `${REPO}/blob/main/LICENSE`, label: "Licença MIT", external: true },
  { href: "/privacy", label: "Privacidade" },
] as const;

function FooterLink({
  href,
  label,
  external,
}: {
  href: string;
  label: string;
  external?: boolean;
}) {
  const className =
    "text-sm text-[#8b949e] transition-colors hover:text-[#e6edf3]";

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-[#d0d7de]/80 bg-[#0d1117] text-[#e6edf3]">
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-14">
        <div className="grid gap-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 text-[#e6edf3] transition-opacity hover:opacity-80"
            >
              <BrandMark className="h-7 w-7 text-[#58a6ff]" />
              <span className="font-display text-2xl tracking-tight">
                Contribly
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#8b949e]">
              Matchmaking open source: descubra projetos, dê swipe e combine o
              próximo passo com mantenedores.
            </p>
            <a
              href={REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-sm text-[#8b949e] transition-colors hover:text-[#e6edf3]"
            >
              <GithubIcon className="h-4 w-4" />
              cauesilva1/contribly
            </a>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-8 md:grid-cols-3">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b949e]">
                Produto
              </h2>
              <ul className="mt-4 space-y-2.5">
                {productLinks.map((link) => (
                  <li key={link.href}>
                    <FooterLink href={link.href} label={link.label} />
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b949e]">
                Comunidade
              </h2>
              <ul className="mt-4 space-y-2.5">
                {communityLinks.map((link) => (
                  <li key={link.href}>
                    <FooterLink
                      href={link.href}
                      label={link.label}
                      external={link.external}
                    />
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b949e]">
                Legal
              </h2>
              <ul className="mt-4 space-y-2.5">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <FooterLink
                      href={link.href}
                      label={link.label}
                      external={"external" in link ? Boolean(link.external) : false}
                    />
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs leading-relaxed text-[#6e7681]">
                Login via GitHub. Exclusão de conta disponível no perfil.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-[#21262d] pt-6 text-xs text-[#6e7681] sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Contribly. Software livre sob licença MIT.</p>
          <p className="sm:text-right">
            Feito para contribuidores e mantenedores open source.
          </p>
        </div>
      </div>
    </footer>
  );
}
