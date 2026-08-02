import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const maintainer = await prisma.user.upsert({
    where: { email: "maintainer@openmatch.demo" },
    update: {
      name: "OpenMatch Maintainer",
      githubUsername: "openmatch-demo",
      languages: ["TypeScript", "Python", "Go"],
      interestTags: ["docs", "good-first-issue", "cli"],
      experienceLevel: "advanced",
      openToInvites: false,
      bio: "Conta demo de mantenedor para o OpenMatch.",
    },
    create: {
      email: "maintainer@openmatch.demo",
      name: "OpenMatch Maintainer",
      githubUsername: "openmatch-demo",
      languages: ["TypeScript", "Python", "Go"],
      interestTags: ["docs", "good-first-issue", "cli"],
      experienceLevel: "advanced",
      openToInvites: false,
      bio: "Conta demo de mantenedor para o OpenMatch.",
    },
  });

  const contributor = await prisma.user.upsert({
    where: { email: "contributor@openmatch.demo" },
    update: {
      name: "Demo Contributor",
      githubUsername: "openmatch-contributor",
      languages: ["TypeScript", "JavaScript"],
      interestTags: ["docs", "frontend", "nextjs"],
      experienceLevel: "beginner",
      openToInvites: true,
      bio: "Contribuidor demo aberto a convites.",
    },
    create: {
      email: "contributor@openmatch.demo",
      name: "Demo Contributor",
      githubUsername: "openmatch-contributor",
      languages: ["TypeScript", "JavaScript"],
      interestTags: ["docs", "frontend", "nextjs"],
      experienceLevel: "beginner",
      openToInvites: true,
      bio: "Contribuidor demo aberto a convites.",
    },
  });

  const demos = [
    {
      title: "docs-helper",
      description:
        "Ferramenta CLI para melhorar docs de projetos open source. Buscamos ajuda com TypeScript e escrita técnica.",
      githubLink: "https://github.com/vercel/next.js",
      githubRepoId: "seed-next-docs",
      languages: ["TypeScript", "JavaScript"],
      tags: ["docs", "cli", "good-first-issue"],
      lookingFor: ["docs", "TypeScript"],
      issues: [
        {
          githubIssueId: "seed-issue-1",
          number: 101,
          title: "Improve getting started docs",
          url: "https://github.com/vercel/next.js/issues",
          labels: ["good first issue", "documentation"],
        },
        {
          githubIssueId: "seed-issue-2",
          number: 102,
          title: "Add examples for App Router",
          url: "https://github.com/vercel/next.js/issues",
          labels: ["good first issue", "example"],
        },
      ],
    },
    {
      title: "python-data-kit",
      description:
        "Biblioteca Python para limpeza de datasets. Precisamos de contribuidores iniciantes em testes e docs.",
      githubLink: "https://github.com/psf/requests",
      githubRepoId: "seed-python-kit",
      languages: ["Python"],
      tags: ["data", "testing", "docs"],
      lookingFor: ["Python", "docs"],
      issues: [
        {
          githubIssueId: "seed-issue-3",
          number: 55,
          title: "Add type hints to helpers",
          url: "https://github.com/psf/requests/issues",
          labels: ["good first issue"],
        },
      ],
    },
    {
      title: "go-observability",
      description:
        "Agente leve em Go para métricas. Bom para quem curte backend e CLI.",
      githubLink: "https://github.com/golang/go",
      githubRepoId: "seed-go-obs",
      languages: ["Go"],
      tags: ["observability", "cli", "backend"],
      lookingFor: ["Go", "backend"],
      issues: [
        {
          githubIssueId: "seed-issue-4",
          number: 12,
          title: "Document configuration flags",
          url: "https://github.com/golang/go/issues",
          labels: ["help wanted", "docs"],
        },
      ],
    },
  ];

  for (const demo of demos) {
    const existing = await prisma.project.findFirst({
      where: { githubRepoId: demo.githubRepoId },
    });

    const project =
      existing ??
      (await prisma.project.create({
        data: {
          title: demo.title,
          description: demo.description,
          githubLink: demo.githubLink,
          githubRepoId: demo.githubRepoId,
          languages: demo.languages,
          tags: demo.tags,
          lookingFor: demo.lookingFor,
          source: "manual",
          ownerId: maintainer.id,
          starsCount: 42,
          issuesSyncedAt: new Date(),
        },
      }));

    for (const issue of demo.issues) {
      await prisma.projectIssue.upsert({
        where: {
          projectId_githubIssueId: {
            projectId: project.id,
            githubIssueId: issue.githubIssueId,
          },
        },
        update: {
          title: issue.title,
          url: issue.url,
          labels: issue.labels,
          number: issue.number,
          fetchedAt: new Date(),
        },
        create: {
          projectId: project.id,
          githubIssueId: issue.githubIssueId,
          number: issue.number,
          title: issue.title,
          url: issue.url,
          labels: issue.labels,
        },
      });
    }
  }

  console.log("Seed OK");
  console.log(`Maintainer: ${maintainer.email}`);
  console.log(`Contributor demo: ${contributor.email}`);
  console.log("Projetos demo prontos para swipe / pra você / painel.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
