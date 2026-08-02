import { describe, expect, it } from "vitest";
import { inferExperienceLevel } from "@/lib/github-profile";
import {
  collectIssueLabels,
  normalizeSkill,
  rankCandidatesForProject,
  scoreProjectForUser,
} from "@/lib/matching";
import { normalizeGithubRepoUrl } from "@/lib/github-url";

describe("normalizeSkill", () => {
  it("normaliza case e espaços", () => {
    expect(normalizeSkill("  TypeScript ")).toBe("typescript");
  });
});

describe("scoreProjectForUser", () => {
  it("ranqueia overlap de linguagens e lookingFor", () => {
    const breakdown = scoreProjectForUser(
      {
        languages: ["TypeScript", "Go"],
        interestTags: ["docs"],
        experienceLevel: "beginner",
      },
      {
        languages: ["TypeScript"],
        tags: ["docs", "cli"],
        lookingFor: ["TypeScript", "docs"],
        starsCount: 1200,
        issuesSyncedAt: new Date(),
        issueLabels: ["good first issue", "typescript"],
        _count: { issues: 3, interests: 1 },
      }
    );

    expect(breakdown.languageOverlap).toBe(1);
    expect(breakdown.tagOverlap).toBeGreaterThan(0);
    expect(breakdown.lookingForOverlap).toBeGreaterThan(0);
    expect(breakdown.issuesBoost).toBeGreaterThan(0);
    expect(breakdown.starsBoost).toBeGreaterThan(0);
    expect(breakdown.labelOverlap).toBeGreaterThan(0);
    expect(breakdown.freshnessBoost).toBeGreaterThan(0);
    expect(breakdown.score).toBeGreaterThan(20);
  });

  it("zera score para projeto rejeitado", () => {
    const breakdown = scoreProjectForUser(
      {
        languages: ["TypeScript"],
        interestTags: [],
        experienceLevel: "beginner",
      },
      {
        languages: ["TypeScript"],
        tags: [],
        lookingFor: [],
      },
      {
        likedTags: [],
        rejectedProjectIds: new Set(["p1"]),
      },
      "p1"
    );

    expect(breakdown.score).toBe(0);
  });

  it("penaliza tags parecidas com rejeições anteriores", () => {
    const withPenalty = scoreProjectForUser(
      {
        languages: ["TypeScript"],
        interestTags: ["cli"],
        experienceLevel: "intermediate",
      },
      {
        languages: ["TypeScript"],
        tags: ["cli", "docs"],
        lookingFor: [],
      },
      {
        likedTags: [],
        rejectedProjectIds: new Set(),
        rejectedTags: ["cli"],
      },
      "p2"
    );

    const withoutPenalty = scoreProjectForUser(
      {
        languages: ["TypeScript"],
        interestTags: ["cli"],
        experienceLevel: "intermediate",
      },
      {
        languages: ["TypeScript"],
        tags: ["cli", "docs"],
        lookingFor: [],
      },
      {
        likedTags: [],
        rejectedProjectIds: new Set(),
        rejectedTags: [],
      },
      "p2"
    );

    expect(withPenalty.rejectPenalty).toBeGreaterThan(0);
    expect(withPenalty.score).toBeLessThan(withoutPenalty.score);
  });
});

describe("rankCandidatesForProject", () => {
  it("exclui candidatos já engajados e ordena por score", () => {
    const ranked = rankCandidatesForProject(
      {
        languages: ["TypeScript"],
        tags: ["docs"],
        lookingFor: ["TypeScript"],
      },
      [
        {
          id: "a",
          languages: ["TypeScript"],
          interestTags: ["docs"],
          experienceLevel: "beginner",
          openToInvites: true,
        },
        {
          id: "b",
          languages: ["Python"],
          interestTags: [],
          experienceLevel: "advanced",
          openToInvites: true,
        },
        {
          id: "c",
          languages: ["TypeScript"],
          interestTags: [],
          experienceLevel: "intermediate",
          openToInvites: false,
        },
      ],
      new Set(["a"])
    );

    expect(ranked.map((c) => c.id)).not.toContain("a");
    expect(ranked.map((c) => c.id)).not.toContain("c");
  });
});

describe("collectIssueLabels", () => {
  it("deduplica labels", () => {
    expect(
      collectIssueLabels([
        { labels: ["good first issue", "docs"] },
        { labels: ["docs", "help wanted"] },
      ]).sort()
    ).toEqual(["docs", "good first issue", "help wanted"].sort());
  });
});

describe("inferExperienceLevel", () => {
  it("classifica iniciante, intermediário e avançado", () => {
    expect(
      inferExperienceLevel({
        accountAgeYears: 0.5,
        publicRepos: 2,
        totalStars: 0,
        followers: 1,
      })
    ).toBe("beginner");

    expect(
      inferExperienceLevel({
        accountAgeYears: 3,
        publicRepos: 15,
        totalStars: 40,
        followers: 20,
      })
    ).toBe("intermediate");

    expect(
      inferExperienceLevel({
        accountAgeYears: 8,
        publicRepos: 50,
        totalStars: 300,
        followers: 120,
      })
    ).toBe("advanced");
  });
});

describe("normalizeGithubRepoUrl", () => {
  it("normaliza owner/repo e remove .git", () => {
    expect(
      normalizeGithubRepoUrl("https://GitHub.com/Vercel/Next.js.git")
    ).toBe("https://github.com/vercel/next.js");
  });
});
