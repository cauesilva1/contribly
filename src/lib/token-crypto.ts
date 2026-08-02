import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const PREFIX = "enc:v1:";

function getKey(): Buffer | null {
  const raw = process.env.TOKEN_ENCRYPTION_KEY?.trim();
  if (!raw) return null;
  try {
    const key = Buffer.from(raw, "base64");
    if (key.length !== 32) {
      console.error(
        "TOKEN_ENCRYPTION_KEY must be 32 bytes (base64-encoded)."
      );
      return null;
    }
    return key;
  } catch {
    console.error("TOKEN_ENCRYPTION_KEY is not valid base64.");
    return null;
  }
}

export function isEncryptedToken(value: string | null | undefined) {
  return Boolean(value?.startsWith(PREFIX));
}

/** Encrypts a token for DB storage. Returns plaintext if key missing (dev only). */
export function encryptToken(plain: string | null | undefined): string | null {
  if (!plain) return null;
  if (isEncryptedToken(plain)) return plain;

  const key = getKey();
  if (!key) {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "TOKEN_ENCRYPTION_KEY missing — storing GitHub token in plaintext."
      );
    }
    return plain;
  }

  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString("base64")}.${enc.toString("base64")}.${tag.toString("base64")}`;
}

export function decryptToken(payload: string | null | undefined): string | null {
  if (!payload) return null;
  if (!isEncryptedToken(payload)) return payload;

  const key = getKey();
  if (!key) {
    throw new Error(
      "TOKEN_ENCRYPTION_KEY required to decrypt stored GitHub tokens."
    );
  }

  const body = payload.slice(PREFIX.length);
  const [ivB64, encB64, tagB64] = body.split(".");
  if (!ivB64 || !encB64 || !tagB64) {
    throw new Error("Malformed encrypted token.");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(ivB64, "base64")
  );
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(encB64, "base64")),
    decipher.final(),
  ]).toString("utf8");
}
