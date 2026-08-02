import { prisma } from "@/lib/prisma";

export function normalizeGithubRepoUrl(url: string) {
  const match = url.trim().match(/github\.com\/([^/]+)\/([^/#?]+)/i);
  if (!match) return url.trim().replace(/\/$/, "");
  const owner = match[1].toLowerCase();
  const repo = match[2].replace(/\.git$/i, "").toLowerCase();
  return `https://github.com/${owner}/${repo}`;
}

export async function findExistingProjectByGithub(options: {
  githubLink?: string;
  githubRepoId?: string | null;
}) {
  const normalized = options.githubLink
    ? normalizeGithubRepoUrl(options.githubLink)
    : null;

  if (options.githubRepoId) {
    const byId = await prisma.project.findFirst({
      where: { githubRepoId: options.githubRepoId },
      select: { id: true, title: true },
    });
    if (byId) return byId;
  }

  if (!normalized) return null;

  const candidates = await prisma.project.findMany({
    select: { id: true, title: true, githubLink: true },
  });

  return (
    candidates.find(
      (project) => normalizeGithubRepoUrl(project.githubLink) === normalized
    ) ?? null
  );
}
