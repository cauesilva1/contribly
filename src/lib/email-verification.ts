import { createHash, randomBytes } from "node:crypto";
import { getSiteUrl } from "@/lib/site-url";
import { prisma } from "@/lib/prisma";

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;
const IDENTIFIER_PREFIX = "email-verify:";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function verificationIdentifier(email: string) {
  return `${IDENTIFIER_PREFIX}${email.trim().toLowerCase()}`;
}

/** Cria token de verificação (retorna o token em claro só para o e-mail). */
export async function createEmailVerificationToken(email: string) {
  const normalized = email.trim().toLowerCase();
  const identifier = verificationIdentifier(normalized);
  const rawToken = randomBytes(32).toString("hex");
  const token = hashToken(rawToken);
  const expires = new Date(Date.now() + VERIFY_TTL_MS);

  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({
    data: { identifier, token, expires },
  });

  return rawToken;
}

export async function consumeEmailVerificationToken(
  email: string,
  rawToken: string
): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  const identifier = verificationIdentifier(normalized);
  const token = hashToken(rawToken);

  const row = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!row || row.identifier !== identifier) return false;
  if (row.expires.getTime() < Date.now()) {
    await prisma.verificationToken.delete({ where: { token } }).catch(() => {});
    return false;
  }

  await prisma.verificationToken.delete({ where: { token } }).catch(() => {});
  return true;
}

export function buildEmailVerifyUrl(email: string, rawToken: string) {
  const url = new URL("/auth/verify", getSiteUrl());
  url.searchParams.set("email", email.trim().toLowerCase());
  url.searchParams.set("token", rawToken);
  return url.toString();
}

export function isEmailDeliveryConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export async function sendSignupVerificationEmail(input: {
  to: string;
  name: string;
  verifyUrl: string;
}): Promise<"sent" | "skipped_no_provider" | "failed"> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.EMAIL_FROM?.trim() || "Contribly <onboarding@resend.dev>";

  if (!apiKey) {
    return "skipped_no_provider";
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
        subject: "Confirm your email · Contribly",
        html: `
          <p>Hi ${escapeHtml(input.name)},</p>
          <p>Confirm your email to finish joining Contribly:</p>
          <p><a href="${input.verifyUrl}">Confirm email</a></p>
          <p style="color:#57606a;font-size:12px">This link expires in 24 hours. If you did not sign up, ignore this message.</p>
        `,
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error("Resend verify email failed:", response.status, text);
      return "failed";
    }
    return "sent";
  } catch (error) {
    console.error("Resend verify email error:", error);
    return "failed";
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
