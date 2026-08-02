/** Normaliza AUTH_URL / site URL (aceita host sem protocolo). */
export function getSiteUrl() {
  const raw = (process.env.AUTH_URL ?? "http://localhost:3000").trim();
  if (!raw) return "http://localhost:3000";
  if (/^https?:\/\//i.test(raw)) return raw.replace(/\/$/, "");
  return `https://${raw.replace(/\/$/, "")}`;
}
