import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** Repos OSS reais para popular descoberta / swipe / pra você. */
const REAL_REPOS = [
  "facebook/react",
  "vercel/next.js",
  "vuejs/core",
  "angular/angular",
  "microsoft/TypeScript",
  "microsoft/vscode",
  "tailwindlabs/tailwindcss",
  "prisma/prisma",
  "nodejs/node",
  "denoland/deno",
  "rust-lang/rust",
  "golang/go",
  "psf/requests",
  "django/django",
  "pallets/flask",
  "fastapi/fastapi",
  "tensorflow/tensorflow",
  "pytorch/pytorch",
  "kubernetes/kubernetes",
  "hashicorp/terraform",
  "docker/cli",
  "excalidraw/excalidraw",
  "freeCodeCamp/freeCodeCamp",
  "jestjs/jest",
  "neovim/neovim",
  "Homebrew/brew",
  "ohmyzsh/ohmyzsh",
  "axios/axios",
  "remix-run/remix",
  "sveltejs/svelte",
  "langchain-ai/langchain",
] as const;

type GithubRepo = {
  id: number;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  topics?: string[];
  stargazers_count?: number;
};

type GithubIssue = {
  id: number;
  number: number;
  title: string;
  html_url: string;
  labels: Array<{ name: string } | string>;
  pull_request?: unknown;
};

function githubHeaders() {
  return {
    Accept: "application/vnd.github+json",
    "User-Agent": "openmatch-seed",
    ...(process.env.GITHUB_TOKEN
      ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
      : {}),
  };
}

async function fetchRepo(fullName: string): Promise<GithubRepo | null> {
  const response = await fetch(`https://api.github.com/repos/${fullName}`, {
    headers: githubHeaders(),
  });
  if (!response.ok) {
    console.warn(`Repo ${fullName}: HTTP ${response.status}`);
    return null;
  }
  return (await response.json()) as GithubRepo;
}

async function fetchGoodFirstIssues(fullName: string): Promise<GithubIssue[]> {
  const query = new URLSearchParams({
    state: "open",
    labels: "good first issue",
    per_page: "3",
    sort: "updated",
    direction: "desc",
  });
  const response = await fetch(
    `https://api.github.com/repos/${fullName}/issues?${query}`,
    { headers: githubHeaders() }
  );
  if (!response.ok) return [];
  const data = (await response.json()) as GithubIssue[];
  return data.filter((issue) => !issue.pull_request).slice(0, 3);
}

async function fetchLanguages(fullName: string): Promise<string[]> {
  const response = await fetch(
    `https://api.github.com/repos/${fullName}/languages`,
    { headers: githubHeaders() }
  );
  if (!response.ok) return [];
  const map = (await response.json()) as Record<string, number>;
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name)
    .slice(0, 6);
}

function lookingForFrom(repo: GithubRepo, languages: string[]) {
  const topics = (repo.topics ?? []).slice(0, 4);
  const primary = languages[0] ?? repo.language;
  return Array.from(
    new Set([...(primary ? [primary] : []), ...topics, "docs"].filter(Boolean))
  ).slice(0, 6);
}

async function main() {
  const maintainer = await prisma.user.upsert({
    where: { email: "maintainer@openmatch.demo" },
    update: {
      name: "OpenMatch Maintainer",
      githubUsername: "openmatch-demo",
      languages: ["TypeScript", "Python", "Go", "Rust"],
      interestTags: ["docs", "good-first-issue", "cli", "frontend"],
      experienceLevel: "advanced",
      openToInvites: false,
      bio: "Conta demo de mantenedor para o OpenMatch.",
    },
    create: {
      email: "maintainer@openmatch.demo",
      name: "OpenMatch Maintainer",
      githubUsername: "openmatch-demo",
      languages: ["TypeScript", "Python", "Go", "Rust"],
      interestTags: ["docs", "good-first-issue", "cli", "frontend"],
      experienceLevel: "advanced",
      openToInvites: false,
      bio: "Conta demo de mantenedor para o OpenMatch.",
    },
  });

  await prisma.user.upsert({
    where: { email: "contributor@openmatch.demo" },
    update: {
      name: "Demo Contributor",
      githubUsername: "openmatch-contributor",
      languages: ["TypeScript", "JavaScript", "Python"],
      interestTags: ["docs", "frontend", "nextjs", "good-first-issue"],
      experienceLevel: "beginner",
      openToInvites: true,
      bio: "Contribuidor demo aberto a convites.",
    },
    create: {
      email: "contributor@openmatch.demo",
      name: "Demo Contributor",
      githubUsername: "openmatch-contributor",
      languages: ["TypeScript", "JavaScript", "Python"],
      interestTags: ["docs", "frontend", "nextjs", "good-first-issue"],
      experienceLevel: "beginner",
      openToInvites: true,
      bio: "Contribuidor demo aberto a convites.",
    },
  });

  if (!process.env.GITHUB_TOKEN) {
    console.warn(
      "Sem GITHUB_TOKEN: a API pública tem rate limit baixo. Prefira token no .env."
    );
  }

  let created = 0;
  let skipped = 0;

  for (const fullName of REAL_REPOS) {
    const repo = await fetchRepo(fullName);
    if (!repo) {
      skipped += 1;
      continue;
    }

    const githubRepoId = String(repo.id);
    const existing = await prisma.project.findFirst({
      where: {
        OR: [
          { githubRepoId },
          { githubLink: repo.html_url.replace(/\/$/, "") },
        ],
      },
    });

    const languages = await fetchLanguages(fullName);
    const langs =
      languages.length > 0
        ? languages
        : repo.language
          ? [repo.language]
          : [];
    const tags = (repo.topics ?? []).slice(0, 8);
    const lookingFor = lookingForFrom(repo, langs);

    const project =
      existing ??
      (await prisma.project.create({
        data: {
          title: repo.full_name,
          description:
            repo.description?.trim() ||
            `Repositório open source ${repo.full_name}`,
          githubLink: repo.html_url.replace(/\/$/, ""),
          githubRepoId,
          languages: langs,
          tags,
          lookingFor,
          source: "github_import",
          ownerId: maintainer.id,
          starsCount: repo.stargazers_count ?? null,
          issuesSyncedAt: new Date(),
        },
      }));

    if (!existing) created += 1;

    const issues = await fetchGoodFirstIssues(fullName);
    for (const issue of issues) {
      await prisma.projectIssue.upsert({
        where: {
          projectId_githubIssueId: {
            projectId: project.id,
            githubIssueId: String(issue.id),
          },
        },
        update: {
          title: issue.title,
          url: issue.html_url,
          labels: issue.labels.map((label) =>
            typeof label === "string" ? label : label.name
          ),
          number: issue.number,
          fetchedAt: new Date(),
        },
        create: {
          projectId: project.id,
          githubIssueId: String(issue.id),
          number: issue.number,
          title: issue.title,
          url: issue.html_url,
          labels: issue.labels.map((label) =>
            typeof label === "string" ? label : label.name
          ),
        },
      });
    }

    // Evita estourar rate limit na API pública
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  const total = await prisma.project.count();
  console.log("Seed OK");
  console.log(`Projetos novos: ${created} · pulados/falha: ${skipped}`);
  console.log(`Total de projetos no banco: ${total}`);
  console.log("Maintainer demo: maintainer@openmatch.demo");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
