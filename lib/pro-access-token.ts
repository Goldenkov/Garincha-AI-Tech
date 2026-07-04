export type ProAccessTokenPayload = {
  access: "pro";
  issuedAt: number;
  expiresAt: number;
};

const TOKEN_SEPARATOR = ".";

function base64UrlEncode(value: string | ArrayBuffer) {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : new Uint8Array(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/u, "");
}

function base64UrlDecode(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function getSigningKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function signProAccessToken(payload: ProAccessTokenPayload, secret: string) {
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const key = await getSigningKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(encodedPayload));
  return `${encodedPayload}${TOKEN_SEPARATOR}${base64UrlEncode(signature)}`;
}

export async function verifyProAccessToken(token: string | undefined, secret: string | undefined) {
  if (!token || !secret) return false;

  const [encodedPayload, encodedSignature] = token.split(TOKEN_SEPARATOR);
  if (!encodedPayload || !encodedSignature) return false;

  try {
    const key = await getSigningKey(secret);
    const expectedSignature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(encodedPayload));
    const expectedEncodedSignature = base64UrlEncode(expectedSignature);

    if (expectedEncodedSignature !== encodedSignature) return false;

    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as Partial<ProAccessTokenPayload>;
    return payload.access === "pro" && typeof payload.expiresAt === "number" && payload.expiresAt > Date.now();
  } catch {
    return false;
  }
}

export function createProAccessPayload(maxAgeSeconds: number): ProAccessTokenPayload {
  const issuedAt = Date.now();
  return {
    access: "pro",
    issuedAt,
    expiresAt: issuedAt + maxAgeSeconds * 1000,
  };
}
