import { fetchGithubWithRetry } from "@/lib/github-fetch";

function parseGithubRepo(url: string) {
  const match = url.match(/github\.com\/([^/]+)\/([^/#?]+)/i);
  if (!match) return null;
  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/, ""),
  };
}

export type GithubIssue = {
  id: number;
  number: number;
  title: string;
  html_url: string;
  labels: Array<{ name: string } | string>;
  pull_request?: unknown;
};

export async function fetchGoodFirstIssues(githubLink: string) {
  const parsed = parseGithubRepo(githubLink);
  if (!parsed) {
    throw new Error("Link do GitHub inválido para buscar issues.");
  }

  const labels = ["good first issue", "good-first-issue", "help wanted"];
  const results: GithubIssue[] = [];
  const seen = new Set<number>();

  for (const label of labels) {
    const query = new URLSearchParams({
      state: "open",
      labels: label,
      per_page: "10",
      sort: "updated",
      direction: "desc",
    });

    const response = await fetchGithubWithRetry(
      `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/issues?${query}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "openmatch",
          ...(process.env.GITHUB_TOKEN
            ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
            : {}),
        },
        next: { revalidate: 0 },
      }
    );

    if (!response.ok) continue;

    const data = (await response.json()) as GithubIssue[];
    for (const issue of data) {
      if (issue.pull_request) continue;
      if (seen.has(issue.id)) continue;
      seen.add(issue.id);
      results.push(issue);
    }
  }

  return results.slice(0, 20);
}

export async function fetchGithubRepoMeta(githubLink: string) {
  const parsed = parseGithubRepo(githubLink);
  if (!parsed) return null;

  const response = await fetchGithubWithRetry(
    `https://api.github.com/repos/${parsed.owner}/${parsed.repo}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "openmatch",
        ...(process.env.GITHUB_TOKEN
          ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
          : {}),
      },
      next: { revalidate: 0 },
    }
  );

  if (!response.ok) return null;

  const data = (await response.json()) as {
    stargazers_count?: number;
    language?: string | null;
    topics?: string[];
    description?: string | null;
  };

  return {
    starsCount: data.stargazers_count ?? null,
    language: data.language ?? null,
    topics: data.topics ?? [],
    description: data.description ?? null,
  };
}
