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
    <article className="flex h-full flex-col rounded-xl border border-[#d0d7de] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-xl text-[#0d1117]">{title}</h3>
        {typeof score === "number" && (
          <span className="shrink-0 rounded-md bg-[#dafbe1] px-2 py-1 text-xs font-semibold text-[#1a7f37]">
            score {score}
          </span>
        )}
      </div>
      <p className="mt-2 line-clamp-3 flex-1 text-sm text-[#57606a]">
        {description}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {languages.slice(0, 4).map((lang) => (
          <span
            key={lang}
            className="rounded-md bg-[#ddf4ff] px-2 py-1 text-xs text-[#0969da]"
          >
            {lang}
          </span>
        ))}
        {tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-[#f6f8fa] px-2 py-1 text-xs text-[#57606a]"
          >
            #{tag}
          </span>
        ))}
      </div>
      {ownerName && (
        <p className="mt-3 text-xs text-[#57606a]">por {ownerName}</p>
      )}
      <div className="mt-4 flex gap-2">
        <Link
          href={`/projects/${id}`}
          className="rounded-md bg-[#24292f] px-3 py-2 text-xs text-white hover:bg-[#1b1f23]"
        >
          Ver detalhes
        </Link>
        <a
          href={githubLink}
          target="_blank"
          rel="noreferrer"
          className="rounded-md border border-[#d0d7de] px-3 py-2 text-xs text-[#24292f] hover:bg-[#f6f8fa]"
        >
          GitHub
        </a>
      </div>
    </article>
  );
}
