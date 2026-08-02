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
          "User-Agent": "contribly",
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

  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "contribly",
    ...(process.env.GITHUB_TOKEN
      ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
      : {}),
  };

  const response = await fetchGithubWithRetry(
    `https://api.github.com/repos/${parsed.owner}/${parsed.repo}`,
    {
      headers,
      next: { revalidate: 0 },
    }
  );

  if (!response.ok) return null;

  const data = (await response.json()) as {
    id: number;
    name?: string;
    full_name?: string;
    html_url?: string;
    stargazers_count?: number;
    language?: string | null;
    topics?: string[];
    description?: string | null;
  };

  let languages: string[] = data.language ? [data.language] : [];
  const languagesResponse = await fetchGithubWithRetry(
    `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/languages`,
    {
      headers,
      next: { revalidate: 0 },
    }
  );

  if (languagesResponse.ok) {
    const languageMap = (await languagesResponse.json()) as Record<string, number>;
    languages = Object.entries(languageMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name)
      .slice(0, 8);
    if (languages.length === 0 && data.language) {
      languages = [data.language];
    }
  }

  return {
    githubRepoId: String(data.id),
    title: data.full_name ?? `${parsed.owner}/${parsed.repo}`,
    githubLink: normalizeGithubUrl(data.html_url, parsed),
    starsCount: data.stargazers_count ?? null,
    language: data.language ?? null,
    languages,
    topics: data.topics ?? [],
    description:
      data.description?.trim() ||
      `Repositório ${data.full_name ?? `${parsed.owner}/${parsed.repo}`}`,
  };
}

/** Confirma se o token do usuário tem admin/maintain no repo (claim de ownership). */
export async function userCanAdminGithubRepo(
  githubLink: string,
  accessToken: string
) {
  const parsed = parseGithubRepo(githubLink);
  if (!parsed) return false;

  const response = await fetchGithubWithRetry(
    `https://api.github.com/repos/${parsed.owner}/${parsed.repo}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "contribly",
        Authorization: `Bearer ${accessToken}`,
      },
      next: { revalidate: 0 },
    }
  );

  if (!response.ok) return false;

  const data = (await response.json()) as {
    permissions?: { admin?: boolean; maintain?: boolean };
  };

  return Boolean(data.permissions?.admin || data.permissions?.maintain);
}

function normalizeGithubUrl(
  htmlUrl: string | undefined,
  parsed: { owner: string; repo: string }
) {
  if (htmlUrl) return htmlUrl.replace(/\/$/, "");
  return `https://github.com/${parsed.owner}/${parsed.repo}`;
}
