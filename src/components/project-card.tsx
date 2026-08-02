import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type ProjectCardProps = {
  id: string;
  title: string;
  description: string;
  languages: string[];
  tags: string[];
  githubLink: string;
  ownerName?: string | null;
  score?: number;
  starsCount?: number | null;
  issuesCount?: number;
  issuesSyncedAt?: Date | string | null;
  showJoinCta?: boolean;
};

function formatStars(count: number) {
  if (count >= 1000) return `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}k`;
  return String(count);
}

export async function ProjectCard({
  id,
  title,
  description,
  languages,
  tags,
  githubLink,
  ownerName,
  score,
  starsCount,
  issuesCount,
  issuesSyncedAt,
  showJoinCta = false,
}: ProjectCardProps) {
  const t = await getTranslations("projectCard");

  function formatSync(value: Date | string | null | undefined) {
    if (!value) return null;
    const date = typeof value === "string" ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) return null;
    const ageDays = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
    if (ageDays < 1) return t("syncToday");
    if (ageDays < 7) return t("syncDaysAgo", { days: Math.floor(ageDays) });
    return t("syncDate", { date: date.toLocaleDateString("en-US") });
  }

  const syncLabel = formatSync(issuesSyncedAt);

  return (
    <article className="surface-card surface-card-interactive flex h-full flex-col p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-lg text-[#0d1117]">
          <Link
            href={`/projects/${id}`}
            className="cursor-pointer transition-colors hover:text-[#0969da]"
          >
            {title}
          </Link>
        </h3>
        {typeof score === "number" && (
          <span className="shrink-0 rounded-md bg-[#dafbe1] px-2 py-1 text-xs font-semibold text-[#1a7f37]">
            {t("score", { score })}
          </span>
        )}
      </div>
      <p className="mt-1.5 line-clamp-3 flex-1 text-sm text-[#57606a]">
        {description}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {typeof starsCount === "number" && starsCount > 0 && (
          <span className="rounded-md bg-[#fff8c5] px-2 py-0.5 text-xs text-[#9a6700]">
            ★ {formatStars(starsCount)}
          </span>
        )}
        {typeof issuesCount === "number" && issuesCount > 0 && (
          <span className="rounded-md bg-[#ddf4ff] px-2 py-0.5 text-xs text-[#0969da]">
            {t("issuesCount", { count: issuesCount })}
          </span>
        )}
        {syncLabel && (
          <span className="rounded-md bg-[#f6f8fa] px-2 py-0.5 text-xs text-[#57606a]">
            {syncLabel}
          </span>
        )}
        {languages.slice(0, 4).map((lang) => (
          <span
            key={lang}
            className="rounded-md bg-[#ddf4ff] px-2 py-0.5 text-xs text-[#0969da]"
          >
            {lang}
          </span>
        ))}
        {tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-[#f6f8fa] px-2 py-0.5 text-xs text-[#57606a]"
          >
            #{tag}
          </span>
        ))}
      </div>
      {ownerName && (
        <p className="mt-2 text-xs text-[#57606a]">{t("by", { name: ownerName })}</p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href={`/projects/${id}`}
          className="cursor-pointer rounded-md bg-[#24292f] px-3 py-1.5 text-xs text-white transition-colors hover:bg-[#1b1f23]"
        >
          {t("viewDetails")}
        </Link>
        {showJoinCta ? (
          <Link
            href="/auth"
            className="cursor-pointer rounded-md border border-[#0969da] bg-[#ddf4ff] px-3 py-1.5 text-xs text-[#0969da] transition-colors hover:bg-[#b6e3ff]"
          >
            {t("wantToJoin")}
          </Link>
        ) : null}
        <a
          href={githubLink}
          target="_blank"
          rel="noreferrer"
          className="cursor-pointer rounded-md border border-[#d0d7de] px-3 py-1.5 text-xs text-[#24292f] transition-colors hover:bg-[#f6f8fa]"
        >
          {t("github")}
        </a>
      </div>
    </article>
  );
}
