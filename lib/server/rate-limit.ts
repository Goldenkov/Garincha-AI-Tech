import "server-only";

import { createHash } from "node:crypto";
import { isIP } from "node:net";

import { getTrustedProxyHops, isProduction } from "@/lib/server/config";

type Bucket = { hits: number[] };

const buckets = new Map<string, Bucket>();
const MAX_KEYS = 20_000;

/**
 * Sliding-window limiter kept in process memory. It protects a single-instance deployment
 * (docker-compose.production.yml runs one container); a multi-instance deployment needs a shared
 * store — see docs/OPERATIONS.md.
 */
export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()) {
  const bucket = buckets.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((timestamp) => now - timestamp < windowMs);
  if (bucket.hits.length >= limit) {
    buckets.set(key, bucket);
    const retryAfterMs = windowMs - (now - bucket.hits[0]);
    return { ok: false as const, retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)) };
  }
  bucket.hits.push(now);
  buckets.set(key, bucket);
  if (buckets.size > MAX_KEYS) {
    const oldest = buckets.keys().next().value;
    if (oldest) buckets.delete(oldest);
  }
  return { ok: true as const, remaining: limit - bucket.hits.length };
}

export function resetRateLimits() {
  buckets.clear();
}

function ipv6Prefix64(address: string) {
  const [head, tail] = address.includes("::") ? address.split("::") : [address, null];
  const groups = (part: string | null) => (part ? part.split(":") : []);
  const width = (parts: string[]) => parts.reduce((sum, part) => sum + (part.includes(".") ? 2 : 1), 0);
  const left = groups(head);
  const right = groups(tail);
  const full = tail === null ? left : [...left, ...Array<string>(Math.max(0, 8 - width(left) - width(right))).fill("0"), ...right];
  return `${full
    .slice(0, 4)
    .map((part) => Number.parseInt(part, 16).toString(16))
    .join(":")}::/64`;
}

/** Canonical rate-limit identity for an address; one IPv6 /64 is one client. */
export function normaliseAddress(raw: string) {
  const value = raw.trim().replace(/^\[|\]$/gu, "").replace(/%.*$/u, "");
  const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/iu.exec(value);
  if (mapped && isIP(mapped[1]) === 4) return mapped[1];
  const family = isIP(value);
  if (family === 4) return value;
  if (family === 6) return ipv6Prefix64(value.toLowerCase());
  return null;
}

/**
 * Client address as seen by the outermost trusted proxy. Each trusted proxy appends the address
 * it received the connection from, so the client is `hops` entries from the right; anything to
 * the left of that is client-supplied. X-Real-IP is never read. Returns null when the address
 * cannot be trusted (no trusted proxy configured, short or malformed chain).
 */
export function clientAddress(request: Request, hops = getTrustedProxyHops()) {
  if (hops === 0) return null;
  const chain = (request.headers.get("x-forwarded-for") ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  if (chain.length < hops) return null;
  return normaliseAddress(chain[chain.length - hops]);
}

let warnedUntrusted = false;

/**
 * Rate-limit key per client. Requests whose address cannot be trusted share one bucket, so
 * rotating a spoofed header never yields a fresh limit.
 */
export function clientKey(request: Request) {
  const address = clientAddress(request);
  if (!address && isProduction && !warnedUntrusted) {
    warnedUntrusted = true;
    console.warn("[rate-limit] client address not trusted (check TRUSTED_PROXY_HOPS and the proxy); per-client limits are shared");
  }
  return createHash("sha256")
    .update(address ?? "untrusted")
    .digest("hex")
    .slice(0, 24);
}
