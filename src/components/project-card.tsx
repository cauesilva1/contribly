import Link from "next/link";

type ProjectCardProps = {
  id: string;
  title: string;
  description: string;
  languages: string[];
  tags: string[];
  githubLink: string;
  ownerName?: string | null;
  score?: number;
};

export function ProjectCard({
  id,
  title,
  description,
  languages,
  tags,
  githubLink,
  ownerName,
  score,
}: ProjectCardProps) {
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
            score {score}
          </span>
        )}
      </div>
      <p className="mt-1.5 line-clamp-3 flex-1 text-sm text-[#57606a]">
        {description}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
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
        <p className="mt-2 text-xs text-[#57606a]">por {ownerName}</p>
      )}
      <div className="mt-3 flex gap-2">
        <Link
          href={`/projects/${id}`}
          className="cursor-pointer rounded-md bg-[#24292f] px-3 py-1.5 text-xs text-white transition-colors hover:bg-[#1b1f23]"
        >
          Ver detalhes
        </Link>
        <a
          href={githubLink}
          target="_blank"
          rel="noreferrer"
          className="cursor-pointer rounded-md border border-[#d0d7de] px-3 py-1.5 text-xs text-[#24292f] transition-colors hover:bg-[#f6f8fa]"
        >
          GitHub
        </a>
      </div>
    </article>
  );
}
