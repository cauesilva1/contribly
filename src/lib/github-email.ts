import { fetchGithubWithRetry } from "@/lib/github-fetch";

type GithubEmail = {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string | null;
};

/** Busca o melhor e-mail da conta GitHub (primary verificado). */
export async function fetchGithubPrimaryEmail(accessToken?: string | null) {
  if (!accessToken) return null;

  const response = await fetchGithubWithRetry("https://api.github.com/user/emails", {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "contribly",
      Authorization: `Bearer ${accessToken}`,
    },
    next: { revalidate: 0 },
  });

  if (!response.ok) return null;

  const emails = (await response.json()) as GithubEmail[];
  if (!Array.isArray(emails) || emails.length === 0) return null;

  const primaryVerified = emails.find((item) => item.primary && item.verified);
  if (primaryVerified) return primaryVerified.email;

  const verified = emails.find((item) => item.verified);
  if (verified) return verified.email;

  return emails[0]?.email ?? null;
}
