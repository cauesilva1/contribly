import type { ExperienceLevel } from "@prisma/client";

export function normalizeSkill(value: string) {
  return value.trim().toLowerCase();
}

function overlapCount(values: string[], haystack: Set<string>) {
  return values.filter((value) => haystack.has(normalizeSkill(value))).length;
}

type ScoreProjectInput = {
  languages: string[];
  tags: string[];
  lookingFor: string[];
  starsCount?: number | null;
  issuesSyncedAt?: Date | null;
  issueLabels?: string[];
  _count?: {
    issues?: number;
    interests?: number;
  };
};

type ScoreUserInput = {
  languages: string[];
  interestTags: string[];
  experienceLevel: ExperienceLevel;
};

export type ScoreHistoryInput = {
  likedTags: string[];
  likedLookingFor?: string[];
  rejectedProjectIds: Set<string>;
  rejectedTags?: string[];
};

export type MatchScoreBreakdown = {
  score: number;
  languageOverlap: number;
  tagOverlap: number;
  lookingForOverlap: number;
  historyBoost: number;
  issuesBoost: number;
  experienceBoost: number;
  starsBoost: number;
  labelOverlap: number;
  freshnessBoost: number;
  rejectPenalty: number;
};

export function scoreProjectForUser(
  user: ScoreUserInput,
  project: ScoreProjectInput,
  history?: ScoreHistoryInput,
  projectId?: string
): MatchScoreBreakdown {
  const empty: MatchScoreBreakdown = {
    score: 0,
    languageOverlap: 0,
    tagOverlap: 0,
    lookingForOverlap: 0,
    historyBoost: 0,
    issuesBoost: 0,
    experienceBoost: 0,
    starsBoost: 0,
    labelOverlap: 0,
    freshnessBoost: 0,
    rejectPenalty: 0,
  };

  const userSkills = new Set(user.languages.map(normalizeSkill).filter(Boolean));
  const userTags = new Set(user.interestTags.map(normalizeSkill).filter(Boolean));

  if (userSkills.size === 0 && userTags.size === 0) {
    return empty;
  }

  if (projectId && history?.rejectedProjectIds.has(projectId)) {
    return empty;
  }

  const languageOverlap = overlapCount(project.languages, userSkills);

  const tagOverlap = project.tags.filter(
    (tag) => userSkills.has(normalizeSkill(tag)) || userTags.has(normalizeSkill(tag))
  ).length;

  const lookingForOverlap = project.lookingFor.filter(
    (item) =>
      userSkills.has(normalizeSkill(item)) || userTags.has(normalizeSkill(item))
  ).length;

  const liked = new Set(
    [
      ...(history?.likedTags ?? []),
      ...(history?.likedLookingFor ?? []),
    ].map(normalizeSkill)
  );
  const historyBoost =
    project.tags.filter((tag) => liked.has(normalizeSkill(tag))).length +
    project.lookingFor.filter((item) => liked.has(normalizeSkill(item))).length;

  const issueCount = project._count?.issues ?? 0;
  const issuesBoost =
    user.experienceLevel === "beginner"
      ? Math.min(issueCount, 5) * 3
      : Math.min(issueCount, 3) * 1;

  const experienceBoost =
    user.experienceLevel === "beginner" && issueCount > 0
      ? 8
      : user.experienceLevel === "advanced" && (project._count?.interests ?? 0) > 3
        ? 4
        : user.experienceLevel === "intermediate"
          ? 2
          : 0;

  const stars = project.starsCount ?? 0;
  const starsBoost =
    stars >= 5000 ? 8 : stars >= 1000 ? 5 : stars >= 100 ? 3 : stars >= 10 ? 1 : 0;

  const labelOverlap = (project.issueLabels ?? []).filter(
    (label) =>
      userSkills.has(normalizeSkill(label)) || userTags.has(normalizeSkill(label))
  ).length;

  let freshnessBoost = 0;
  if (project.issuesSyncedAt) {
    const ageDays =
      (Date.now() - project.issuesSyncedAt.getTime()) / (1000 * 60 * 60 * 24);
    freshnessBoost = ageDays <= 7 ? 4 : ageDays <= 30 ? 2 : 0;
  }

  const rejectedTags = new Set(
    (history?.rejectedTags ?? []).map(normalizeSkill).filter(Boolean)
  );
  const rejectPenalty = project.tags.filter((tag) =>
    rejectedTags.has(normalizeSkill(tag))
  ).length;

  const score = Math.max(
    0,
    languageOverlap * 15 +
      tagOverlap * 8 +
      lookingForOverlap * 12 +
      historyBoost * 4 +
      issuesBoost +
      experienceBoost +
      starsBoost +
      labelOverlap * 6 +
      freshnessBoost -
      rejectPenalty * 3
  );

  return {
    score,
    languageOverlap,
    tagOverlap,
    lookingForOverlap,
    historyBoost,
    issuesBoost,
    experienceBoost,
    starsBoost,
    labelOverlap,
    freshnessBoost,
    rejectPenalty,
  };
}

export function rankCandidatesForProject<
  T extends {
    id: string;
    languages: string[];
    interestTags: string[];
    experienceLevel: ExperienceLevel;
    openToInvites: boolean;
  },
>(
  project: {
    languages: string[];
    tags: string[];
    lookingFor: string[];
    starsCount?: number | null;
    issuesSyncedAt?: Date | null;
    issueLabels?: string[];
    _count?: { issues?: number; interests?: number };
  },
  candidates: T[],
  excludeIds?: Set<string>
) {
  return candidates
    .filter(
      (candidate) =>
        candidate.openToInvites && !(excludeIds?.has(candidate.id) ?? false)
    )
    .map((candidate) => {
      const breakdown = scoreProjectForUser(
        {
          languages: candidate.languages,
          interestTags: candidate.interestTags,
          experienceLevel: candidate.experienceLevel,
        },
        project
      );

      return {
        ...candidate,
        breakdown,
        score: breakdown.score,
      };
    })
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score);
}

export function collectIssueLabels(
  issues: Array<{ labels: string[] }> | undefined
) {
  if (!issues?.length) return [] as string[];
  const labels = new Set<string>();
  for (const issue of issues) {
    for (const label of issue.labels) {
      const normalized = normalizeSkill(label);
      if (normalized) labels.add(label);
    }
  }
  return [...labels];
}
