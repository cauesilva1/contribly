import { fetchGoodFirstIssues, fetchGithubRepoMeta } from "@/lib/github";
import { prisma } from "@/lib/prisma";

/** Uso interno (cron). NÃO exportar como server action. */
export async function syncAllProjectIssues(limit = 20) {
  const projects = await prisma.project.findMany({
    orderBy: [{ issuesSyncedAt: "asc" }, { updatedAt: "asc" }],
    take: limit,
    select: {
      id: true,
      githubLink: true,
      ownerId: true,
      languages: true,
      tags: true,
      starsCount: true,
    },
  });

  let synced = 0;
  const errors: string[] = [];

  for (const project of projects) {
    try {
      const [issues, meta] = await Promise.all([
        fetchGoodFirstIssues(project.githubLink),
        fetchGithubRepoMeta(project.githubLink),
      ]);

      await prisma.$transaction([
        prisma.projectIssue.deleteMany({ where: { projectId: project.id } }),
        ...issues.map((issue) =>
          prisma.projectIssue.create({
            data: {
              projectId: project.id,
              githubIssueId: String(issue.id),
              number: issue.number,
              title: issue.title,
              url: issue.html_url,
              labels: issue.labels.map((label) =>
                typeof label === "string" ? label : label.name
              ),
            },
          })
        ),
        prisma.project.update({
          where: { id: project.id },
          data: {
            issuesSyncedAt: new Date(),
            starsCount: meta?.starsCount ?? project.starsCount,
            languages:
              project.languages.length === 0 && meta?.language
                ? [meta.language]
                : project.languages,
            tags:
              project.tags.length === 0 && meta?.topics?.length
                ? meta.topics
                : project.tags,
          },
        }),
      ]);
      synced += 1;
    } catch (error) {
      errors.push(
        `${project.id}: ${error instanceof Error ? error.message : "erro"}`
      );
    }
  }

  return { synced, total: projects.length, errors };
}
