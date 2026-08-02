import { describe, expect, it } from "vitest";
import { inferExperienceLevel } from "@/lib/github-profile";
import { normalizeSkill, scoreProjectForUser } from "@/lib/matching";
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
        _count: { issues: 3, interests: 1 },
      }
    );

    expect(breakdown.languageOverlap).toBe(1);
    expect(breakdown.tagOverlap).toBeGreaterThan(0);
    expect(breakdown.lookingForOverlap).toBeGreaterThan(0);
    expect(breakdown.issuesBoost).toBeGreaterThan(0);
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
