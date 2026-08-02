import type { ExperienceLevel } from "@prisma/client";

export function normalizeSkill(value: string) {
  return value.trim().toLowerCase();
}

type ScoreProjectInput = {
  languages: string[];
  tags: string[];
  lookingFor: string[];
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

type ScoreHistoryInput = {
  likedTags: string[];
  rejectedProjectIds: Set<string>;
};

export type MatchScoreBreakdown = {
  score: number;
  languageOverlap: number;
  tagOverlap: number;
  lookingForOverlap: number;
  historyBoost: number;
  issuesBoost: number;
  experienceBoost: number;
};

export function scoreProjectForUser(
  user: ScoreUserInput,
  project: ScoreProjectInput,
  history?: ScoreHistoryInput,
  projectId?: string
): MatchScoreBreakdown {
  const userSkills = new Set(user.languages.map(normalizeSkill).filter(Boolean));
  const userTags = new Set(user.interestTags.map(normalizeSkill).filter(Boolean));

  if (userSkills.size === 0 && userTags.size === 0) {
    return {
      score: 0,
      languageOverlap: 0,
      tagOverlap: 0,
      lookingForOverlap: 0,
      historyBoost: 0,
      issuesBoost: 0,
      experienceBoost: 0,
    };
  }

  if (projectId && history?.rejectedProjectIds.has(projectId)) {
    return {
      score: 0,
      languageOverlap: 0,
      tagOverlap: 0,
      lookingForOverlap: 0,
      historyBoost: 0,
      issuesBoost: 0,
      experienceBoost: 0,
    };
  }

  const languageOverlap = project.languages.filter((lang) =>
    userSkills.has(normalizeSkill(lang))
  ).length;

  const tagOverlap = project.tags.filter(
    (tag) => userSkills.has(normalizeSkill(tag)) || userTags.has(normalizeSkill(tag))
  ).length;

  const lookingForOverlap = project.lookingFor.filter(
    (item) =>
      userSkills.has(normalizeSkill(item)) || userTags.has(normalizeSkill(item))
  ).length;

  const liked = new Set((history?.likedTags ?? []).map(normalizeSkill));
  const historyBoost = project.tags.filter((tag) =>
    liked.has(normalizeSkill(tag))
  ).length;

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

  const score =
    languageOverlap * 15 +
    tagOverlap * 8 +
    lookingForOverlap * 12 +
    historyBoost * 5 +
    issuesBoost +
    experienceBoost;

  return {
    score,
    languageOverlap,
    tagOverlap,
    lookingForOverlap,
    historyBoost,
    issuesBoost,
    experienceBoost,
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
  project: { languages: string[]; tags: string[]; lookingFor: string[] },
  candidates: T[]
) {
  return candidates
    .filter((candidate) => candidate.openToInvites)
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
