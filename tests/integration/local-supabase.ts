/** Shared helpers for tests that run against a local Supabase stack only. */
import { randomBytes } from "node:crypto";

export const url = (process.env.SUPABASE_URL ?? "").replace(/\/+$/u, "");
export const anonKey = process.env.SUPABASE_ANON_KEY ?? "";
export const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
export const isLocal = /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/u.test(url) && Boolean(anonKey && serviceKey);


export type Session = { userId: string; token: string };

export async function admin(path: string, init: RequestInit = {}) {
  const response = await fetch(`${url}${path}`, {
    ...init,
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json", Prefer: "return=representation", ...init.headers },
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`${path} → ${response.status} ${text}`);
  return text ? JSON.parse(text) : null;
}

export async function createUser(tag: string): Promise<Session> {
  const email = `int-${tag}-${Date.now()}-${randomBytes(3).toString("hex")}@example.com`;
  const password = randomBytes(18).toString("base64url");
  const user = await admin("/auth/v1/admin/users", { method: "POST", body: JSON.stringify({ email, password, email_confirm: true }) });
  const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: anonKey, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const session = (await response.json()) as { access_token: string };
  return { userId: user.id, token: session.access_token };
}

export async function rest(token: string | null, path: string, init: RequestInit = {}) {
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${token ?? anonKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...init.headers,
    },
  });
  const text = await response.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { status: response.status, body: body as Record<string, unknown> & Record<string, unknown>[] };
}

export const rpc = (token: string | null, name: string, args: Record<string, unknown>) => rest(token, `rpc/${name}`, { method: "POST", body: JSON.stringify(args) });

