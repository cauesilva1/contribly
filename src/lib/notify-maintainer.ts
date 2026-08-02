import { randomBytes } from "node:crypto";
import { parseGithubOwnerRepo } from "@/lib/github-url";
import { getSiteUrl } from "@/lib/site-url";

export type EmailNotifyResult =
  | { status: "sent"; to: string }
  | { status: "skipped_no_email" }
  | { status: "skipped_no_provider" }
  | { status: "failed"; error: string };

export function buildGithubInterestIssueUrl(input: {
  githubLink: string;
  projectTitle: string;
  contributorName: string;
  contributorGithub?: string | null;
  inviteUrl: string;
  siteUrl?: string;
}) {
  const parsed = parseGithubOwnerRepo(input.githubLink);
  if (!parsed) return null;

  const site = input.siteUrl ?? getSiteUrl();
  const handle = input.contributorGithub
    ? `@${input.contributorGithub}`
    : input.contributorName;

  const title = `[Contribly] Interesse em contribuir — ${input.projectTitle}`;
  const body = [
    `Olá!`,
    ``,
    `${handle} demonstrou interesse em contribuir com **${input.projectTitle}** pelo [Contribly](${site}).`,
    ``,
    `Link do convite (entrar com GitHub para ver o interesse):`,
    input.inviteUrl,
    ``,
    `Se não for relevante, pode fechar esta issue.`,
    ``,
    `—`,
    `Enviado via Contribly (matchmaking open source).`,
  ].join("\n");

  const url = new URL(
    `https://github.com/${parsed.owner}/${parsed.repo}/issues/new`
  );
  url.searchParams.set("title", title);
  url.searchParams.set("body", body);
  return url.toString();
}

export async function sendMaintainerInterestEmail(input: {
  to: string;
  projectTitle: string;
  contributorName: string;
  dashboardUrl: string;
  inviteUrl: string;
}): Promise<EmailNotifyResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.EMAIL_FROM?.trim() || "Contribly <onboarding@resend.dev>";

  if (!apiKey) {
    return { status: "skipped_no_provider" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: `Novo interesse em ${input.projectTitle} · Contribly`,
        html: `
          <p>Olá,</p>
          <p><strong>${escapeHtml(input.contributorName)}</strong> demonstrou interesse em contribuir com <strong>${escapeHtml(input.projectTitle)}</strong> no Contribly.</p>
          <p><a href="${input.dashboardUrl}">Abrir painel</a> · <a href="${input.inviteUrl}">Link do convite</a></p>
          <p style="color:#57606a;font-size:12px">Se você não esperava este e-mail, pode ignorar.</p>
        `,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return { status: "failed", error: text.slice(0, 200) };
    }

    return { status: "sent", to: input.to };
  } catch (error) {
    return {
      status: "failed",
      error: error instanceof Error ? error.message : "erro desconhecido",
    };
  }
}

export async function fetchGithubPublicEmail(
  username: string
): Promise<string | null> {
  try {
    const response = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "contribly",
        ...(process.env.GITHUB_TOKEN
          ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
          : {}),
      },
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { email?: string | null };
    const email = data.email?.trim();
    if (!email || email.endsWith("@users.noreply.github.com")) return null;
    return email;
  } catch {
    return null;
  }
}

export function newInviteToken() {
  return randomBytes(24).toString("hex");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
