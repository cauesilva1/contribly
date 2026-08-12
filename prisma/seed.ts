import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Curadoria: OSS populares da comunidade (produtos reais, não listas/tutoriais).
 * Complementada em runtime pela busca na API do GitHub.
 */
const CURATED_REPOS = [
  "freeCodeCamp/freeCodeCamp",
  "facebook/react",
  "tensorflow/tensorflow",
  "ohmyzsh/ohmyzsh",
  "microsoft/vscode",
  "flutter/flutter",
  "huggingface/transformers",
  "langgenius/dify",
  "langchain-ai/langchain",
  "vercel/next.js",
  "golang/go",
  "excalidraw/excalidraw",
  "facebook/react-native",
  "kubernetes/kubernetes",
  "electron/electron",
  "ggml-org/llama.cpp",
  "shadcn-ui/ui",
  "nodejs/node",
  "godotengine/godot",
  "rust-lang/rust",
  "microsoft/TypeScript",
  "axios/axios",
  "denoland/deno",
  "supabase/supabase",
  "microsoft/terminal",
  "pytorch/pytorch",
  "neovim/neovim",
  "fastapi/fastapi",
  "angular/angular",
  "tailwindlabs/tailwindcss",
  "puppeteer/puppeteer",
  "oven-sh/bun",
  "microsoft/playwright",
  "storybookjs/storybook",
  "louislam/uptime-kuma",
  "home-assistant/core",
  "mermaid-js/mermaid",
  "vllm-project/vllm",
  "django/django",
  "sveltejs/svelte",
  "OpenHands/OpenHands",
  "vitejs/vite",
  "elastic/elasticsearch",
  "nestjs/nest",
  "grafana/grafana",
  "redis/redis",
  "AppFlowy-IO/AppFlowy",
  "caddyserver/caddy",
  "obsproject/obs-studio",
  "strapi/strapi",
  "pallets/flask",
  "moby/moby",
  "ansible/ansible",
  "expressjs/express",
  "webpack/webpack",
  "prometheus/prometheus",
  "nocodb/nocodb",
  "traefik/traefik",
  "scrapy/scrapy",
  "tldr-pages/tldr",
  "git/git",
  "withastro/astro",
  "nuxt/nuxt",
  "rclone/rclone",
  "meilisearch/meilisearch",
  "appwrite/appwrite",
  "remix-run/react-router",
  "gatsbyjs/gatsby",
  "firstcontributions/first-contributions",
  "twentyhq/twenty",
  "psf/requests",
  "vuejs/core",
  "prettier/prettier",
  "cypress-io/cypress",
  "TanStack/query",
  "pandas-dev/pandas",
  "hashicorp/terraform",
  "ClickHouse/ClickHouse",
  "Homebrew/brew",
  "metabase/metabase",
  "prisma/prisma",
  "serverless/serverless",
  "apache/airflow",
  "usebruno/bruno",
  "milvus-io/milvus",
  "jestjs/jest",
  "logseq/logseq",
  "payloadcms/payload",
  "parcel-bundler/parcel",
  "colinhacks/zod",
  "HeyPuter/puter",
  "trpc/trpc",
  "directus/directus",
  "pnpm/pnpm",
  "remix-run/remix",
  "SigNoz/signoz",
  "grafana/loki",
  "tailwindlabs/headlessui",
  "TanStack/table",
  "eslint/eslint",
  "biomejs/biome",
  "responsively-org/responsively-app",
  "darkreader/darkreader",
  "radix-ui/primitives",
  "vitest-dev/vitest",
  "bluewave-labs/Checkmate",
  "up-for-grabs/up-for-grabs.net",
  // Pending / next seed pass (rate limit)
  "calcom/cal.com",
  "TryGhost/Ghost",
  "duckdb/duckdb",
  "rails/rails",
  "laravel/framework",
  "spring-projects/spring-boot",
  "helm/helm",
  "cli/cli",
  "BurntSushi/ripgrep",
  "fastify/fastify",
  "honojs/hono",
  "drizzle-team/drizzle-orm",
  "mui/material-ui",
  "ant-design/ant-design",
] as const;

/** Listas / tutoriais que não são bons “projetos para fazer match”. */
const SKIP_REPOS = new Set([
  "practical-tutorials/project-based-learning",
  "ytdl-org/youtube-dl",
  "thinkswell/javascript-mini-projects",
  "sindresorhus/awesome",
  "public-apis/public-apis",
]);

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
    "User-Agent": "contribly-seed",
    ...(process.env.GITHUB_TOKEN
      ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
      : {}),
  };
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
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

async function searchFriendlyRepos(limit = 40): Promise<string[]> {
  const queries = [
    "good-first-issues:>5 stars:>3000 is:public",
    "topic:good-first-issue stars:>2000 is:public",
  ];
  const found = new Set<string>();

  for (const q of queries) {
    const params = new URLSearchParams({
      q,
      sort: "stars",
      order: "desc",
      per_page: "30",
    });
    const response = await fetch(
      `https://api.github.com/search/repositories?${params}`,
      { headers: githubHeaders() }
    );
    if (!response.ok) {
      console.warn(`GitHub search failed (${response.status}): ${q}`);
      await sleep(1500);
      continue;
    }
    const data = (await response.json()) as {
      items?: Array<{ full_name: string }>;
    };
    for (const item of data.items ?? []) {
      if (!SKIP_REPOS.has(item.full_name)) {
        found.add(item.full_name);
      }
    }
    await sleep(1200);
  }

  return Array.from(found).slice(0, limit);
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
    where: { email: "maintainer@contribly.demo" },
    update: {
      name: "Contribly Maintainer",
      githubUsername: "contribly-demo",
      languages: ["TypeScript", "Python", "Go", "Rust"],
      interestTags: ["docs", "good-first-issue", "cli", "frontend"],
      experienceLevel: "advanced",
      openToInvites: false,
      bio: "Conta demo de mantenedor para o Contribly.",
    },
    create: {
      email: "maintainer@contribly.demo",
      name: "Contribly Maintainer",
      githubUsername: "contribly-demo",
      languages: ["TypeScript", "Python", "Go", "Rust"],
      interestTags: ["docs", "good-first-issue", "cli", "frontend"],
      experienceLevel: "advanced",
      openToInvites: false,
      bio: "Conta demo de mantenedor para o Contribly.",
    },
  });

  await prisma.user.upsert({
    where: { email: "contributor@contribly.demo" },
    update: {
      name: "Demo Contributor",
      githubUsername: "contribly-contributor",
      languages: ["TypeScript", "JavaScript", "Python"],
      interestTags: ["docs", "frontend", "nextjs", "good-first-issue"],
      experienceLevel: "beginner",
      openToInvites: true,
      bio: "Contribuidor demo aberto a convites.",
    },
    create: {
      email: "contributor@contribly.demo",
      name: "Demo Contributor",
      githubUsername: "contribly-contributor",
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

  console.log("Buscando projetos no GitHub…");
  const searched = await searchFriendlyRepos(35);
  const repoNames = Array.from(
    new Set([...CURATED_REPOS, ...searched].filter((n) => !SKIP_REPOS.has(n)))
  );
  console.log(
    `Lista final: ${repoNames.length} repos (${CURATED_REPOS.length} curados + busca)`
  );

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const fullName of repoNames) {
    const repo = await fetchRepo(fullName);
    if (!repo) {
      skipped += 1;
      await sleep(250);
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

    if (existing) {
      await prisma.project.update({
        where: { id: existing.id },
        data: {
          description:
            repo.description?.trim() ||
            existing.description ||
            `Repositório open source ${repo.full_name}`,
          languages: langs.length ? langs : existing.languages,
          tags: tags.length ? tags : existing.tags,
          lookingFor: lookingFor.length ? lookingFor : existing.lookingFor,
          starsCount: repo.stargazers_count ?? existing.starsCount,
          githubRepoId: existing.githubRepoId ?? githubRepoId,
          title: existing.source === "manual" ? existing.title : repo.full_name,
        },
      });
      updated += 1;
    } else {
      created += 1;
    }

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
    await sleep(280);
  }

  const total = await prisma.project.count();
  console.log("Seed OK");
  console.log(
    `Novos: ${created} · atualizados: ${updated} · falha/skip: ${skipped}`
  );
  console.log(`Total de projetos no banco: ${total}`);
  console.log("Maintainer demo: maintainer@contribly.demo");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
