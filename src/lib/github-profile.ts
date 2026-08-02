type GithubRepo = {
  name: string;
  fork: boolean;
  language: string | null;
  stargazers_count: number;
  topics?: string[];
  owner?: { login?: string };
};

type GithubUser = {
  login: string;
  bio: string | null;
  name: string | null;
  avatar_url: string;
  public_repos: number;
  followers: number;
  created_at: string;
};

export type GithubProfileInsight = {
  githubUsername: string;
  name: string | null;
  bio: string | null;
  image: string | null;
  languages: string[];
  interestTags: string[];
  experienceLevel: "beginner" | "intermediate" | "advanced";
  stats: {
    reposAnalyzed: number;
    publicRepos: number;
    followers: number;
    topLanguages: Array<{ language: string; repos: number; stars: number }>;
  };
};

function githubHeaders(accessToken?: string | null) {
  return {
    Accept: "application/vnd.github+json",
    "User-Agent": "openmatch",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(process.env.GITHUB_TOKEN && !accessToken
      ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
      : {}),
  };
}

export function inferExperienceLevel(input: {
  accountAgeYears: number;
  publicRepos: number;
  totalStars: number;
  followers: number;
}) {
  const score =
    input.accountAgeYears * 2 +
    Math.min(input.publicRepos, 40) * 0.4 +
    Math.min(input.totalStars, 200) * 0.05 +
    Math.min(input.followers, 100) * 0.1;

  if (score >= 20) return "advanced" as const;
  if (score >= 8) return "intermediate" as const;
  return "beginner" as const;
}

export async function analyzeGithubDeveloperProfile(options: {
  accessToken?: string | null;
  username?: string | null;
}): Promise<GithubProfileInsight | null> {
  const headers = githubHeaders(options.accessToken);

  let user: GithubUser | null = null;

  if (options.accessToken) {
    const meRes = await fetch("https://api.github.com/user", {
      headers,
      next: { revalidate: 0 },
    });
    if (meRes.ok) {
      user = (await meRes.json()) as GithubUser;
    }
  }

  const username = user?.login ?? options.username;
  if (!username) return null;

  if (!user) {
    const userRes = await fetch(`https://api.github.com/users/${username}`, {
      headers,
      next: { revalidate: 0 },
    });
    if (!userRes.ok) return null;
    user = (await userRes.json()) as GithubUser;
  }

  const reposUrl = options.accessToken
    ? "https://api.github.com/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator"
    : `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`;

  const reposRes = await fetch(reposUrl, {
    headers,
    next: { revalidate: 0 },
  });

  if (!reposRes.ok) {
    return {
      githubUsername: user.login,
      name: user.name,
      bio: user.bio,
      image: user.avatar_url,
      languages: [],
      interestTags: [],
      experienceLevel: "beginner",
      stats: {
        reposAnalyzed: 0,
        publicRepos: user.public_repos,
        followers: user.followers,
        topLanguages: [],
      },
    };
  }

  const repos = ((await reposRes.json()) as GithubRepo[]).filter(
    (repo) => !repo.fork
  );

  const languageStats = new Map<string, { repos: number; stars: number }>();
  const topicStats = new Map<string, number>();

  for (const repo of repos) {
    if (repo.language) {
      const current = languageStats.get(repo.language) ?? { repos: 0, stars: 0 };
      current.repos += 1;
      current.stars += repo.stargazers_count ?? 0;
      languageStats.set(repo.language, current);
    }

    for (const topic of repo.topics ?? []) {
      topicStats.set(topic, (topicStats.get(topic) ?? 0) + 1);
    }
  }

  const topLanguages = [...languageStats.entries()]
    .map(([language, stats]) => ({
      language,
      repos: stats.repos,
      stars: stats.stars,
      weight: stats.repos * 3 + Math.min(stats.stars, 50),
    }))
    .sort((a, b) => b.weight - a.weight);

  const interestTags = [...topicStats.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([topic]) => topic);

  const totalStars = topLanguages.reduce((sum, item) => sum + item.stars, 0);
  const accountAgeYears =
    (Date.now() - new Date(user.created_at).getTime()) /
    (1000 * 60 * 60 * 24 * 365);

  return {
    githubUsername: user.login,
    name: user.name,
    bio: user.bio,
    image: user.avatar_url,
    languages: topLanguages.slice(0, 8).map((item) => item.language),
    interestTags,
    experienceLevel: inferExperienceLevel({
      accountAgeYears,
      publicRepos: user.public_repos,
      totalStars,
      followers: user.followers,
    }),
    stats: {
      reposAnalyzed: repos.length,
      publicRepos: user.public_repos,
      followers: user.followers,
      topLanguages: topLanguages.slice(0, 8).map(({ language, repos, stars }) => ({
        language,
        repos,
        stars,
      })),
    },
  };
}
