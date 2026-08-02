/**
 * Best-effort in-memory rate limit for auth actions.
 * On multi-instance Vercel each isolate has its own map — use Upstash if abuse appears.
 */

type Bucket = { timestamps: number[] };

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function prune(bucket: Bucket, now: number) {
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < WINDOW_MS);
}

export function checkAuthRateLimit(key: string): {
  ok: boolean;
  retryAfterSec: number;
} {
  const now = Date.now();
  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { timestamps: [] };
    buckets.set(key, bucket);
  }
  prune(bucket, now);

  if (bucket.timestamps.length >= MAX_ATTEMPTS) {
    const oldest = bucket.timestamps[0] ?? now;
    const retryAfterSec = Math.max(
      1,
      Math.ceil((WINDOW_MS - (now - oldest)) / 1000)
    );
    return { ok: false, retryAfterSec };
  }

  bucket.timestamps.push(now);
  return { ok: true, retryAfterSec: 0 };
}

/** Stable key from headers (best-effort behind proxies). */
export function authRateLimitKey(
  action: "signin" | "signup" | "verify",
  email: string,
  headers?: Headers | null
) {
  const forwarded = headers?.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || headers?.get("x-real-ip") || "unknown";
  return `${action}:${ip}:${email.toLowerCase()}`;
}
