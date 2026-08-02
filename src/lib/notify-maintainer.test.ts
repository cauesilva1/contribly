import { describe, expect, it } from "vitest";
import { buildGithubInterestIssueUrl } from "@/lib/notify-maintainer";

describe("buildGithubInterestIssueUrl", () => {
  it("builds a prefilled GitHub new-issue URL", () => {
    const url = buildGithubInterestIssueUrl({
      githubLink: "https://github.com/acme/docs-helper",
      projectTitle: "docs-helper",
      contributorName: "Caue",
      contributorGithub: "cauesilva1",
      inviteUrl: "https://contribly.vercel.app/invite/abc",
      siteUrl: "https://contribly.vercel.app",
    });

    expect(url).toBeTruthy();
    const parsed = new URL(url!);
    expect(parsed.origin + parsed.pathname).toBe(
      "https://github.com/acme/docs-helper/issues/new"
    );
    expect(parsed.searchParams.get("title")).toContain("[Contribly] Interesse");
    expect(parsed.searchParams.get("body")).toContain("@cauesilva1");
    expect(parsed.searchParams.get("body")).toContain(
      "https://contribly.vercel.app/invite/abc"
    );
  });

  it("returns null for invalid github links", () => {
    expect(
      buildGithubInterestIssueUrl({
        githubLink: "https://gitlab.com/acme/x",
        projectTitle: "x",
        contributorName: "A",
        inviteUrl: "https://example.com/invite/1",
      })
    ).toBeNull();
  });
});
