import "server-only";

import { getSupabaseConfig, type SupabaseConfig } from "@/lib/server/config";

export class StorageUnavailableError extends Error {
  constructor(message = "storage_unavailable") {
    super(message);
    this.name = "StorageUnavailableError";
  }
}

export class DatabaseError extends Error {
  constructor(
    readonly code: string,
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "DatabaseError";
  }
}

const REQUEST_TIMEOUT_MS = 8000;

export function requireSupabase(): SupabaseConfig {
  const config = getSupabaseConfig();
  if (!config) throw new StorageUnavailableError("supabase_not_configured");
  return config;
}

async function timedFetch(url: string, init: RequestInit) {
  try {
    return await fetch(url, { ...init, cache: "no-store", signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  } catch {
    throw new StorageUnavailableError("supabase_unreachable");
  }
}

type PostgrestError = { code?: string; message?: string; details?: string; hint?: string };

async function parseError(response: Response) {
  const body = (await response.json().catch(() => ({}))) as PostgrestError;
  // Custom exceptions in the migration raise short machine-readable messages such as "not_found".
  return new DatabaseError(body.code ?? String(response.status), response.status, body.message ?? "database_error");
}

function userHeaders(config: SupabaseConfig, accessToken: string) {
  return {
    apikey: config.anonKey,
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
}

/** Reads through PostgREST as the signed-in user; row level security applies. */
export async function selectAsUser<T>(accessToken: string, path: string): Promise<T> {
  const config = requireSupabase();
  const response = await timedFetch(`${config.url}/rest/v1/${path}`, {
    method: "GET",
    headers: userHeaders(config, accessToken),
  });
  if (response.status >= 500) throw new StorageUnavailableError(`supabase_${response.status}`);
  if (!response.ok) throw await parseError(response);
  return (await response.json()) as T;
}

/** Calls a write function as the signed-in user. */
export async function rpcAsUser<T>(accessToken: string, fn: string, args: Record<string, unknown>): Promise<T> {
  const config = requireSupabase();
  const response = await timedFetch(`${config.url}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: userHeaders(config, accessToken),
    body: JSON.stringify(args),
  });
  if (response.status >= 500 && response.status !== 503) {
    const error = await parseError(response);
    if (error.code.startsWith("P0") || error.code.startsWith("22") || error.code === "42501" || error.code === "40001") throw error;
    throw new StorageUnavailableError(`supabase_${response.status}`);
  }
  if (response.status === 503) throw new StorageUnavailableError("supabase_503");
  if (!response.ok) throw await parseError(response);
  const textBody = await response.text();
  return (textBody ? JSON.parse(textBody) : null) as T;
}

/** Server-only inserts with the service role (submissions, usage accounting). */
export async function insertAsService(
  table: string,
  row: Record<string, unknown>,
  options: { onConflict?: string } = {},
): Promise<"inserted" | "duplicate"> {
  const config = requireSupabase();
  if (!config.serviceRoleKey) throw new StorageUnavailableError("service_role_not_configured");
  const query = options.onConflict ? `?on_conflict=${encodeURIComponent(options.onConflict)}` : "";
  const response = await timedFetch(`${config.url}/rest/v1/${table}${query}`, {
    method: "POST",
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: options.onConflict ? "return=representation,resolution=ignore-duplicates" : "return=minimal",
    },
    body: JSON.stringify(row),
  });
  if (response.status >= 500) throw new StorageUnavailableError(`supabase_${response.status}`);
  if (!response.ok) throw await parseError(response);
  if (options.onConflict) {
    const rows = (await response.json().catch(() => [])) as unknown[];
    return Array.isArray(rows) && rows.length === 0 ? "duplicate" : "inserted";
  }
  return "inserted";
}

export async function countAsService(table: string, filter: string): Promise<number> {
  const config = requireSupabase();
  if (!config.serviceRoleKey) throw new StorageUnavailableError("service_role_not_configured");
  const response = await timedFetch(`${config.url}/rest/v1/${table}?select=id&${filter}`, {
    method: "HEAD",
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      Prefer: "count=exact",
    },
  });
  if (!response.ok) throw new StorageUnavailableError(`supabase_${response.status}`);
  const range = response.headers.get("content-range") ?? "*/0";
  return Number.parseInt(range.split("/")[1] ?? "0", 10) || 0;
}

// ---------------------------------------------------------------------------------------------
// Auth (GoTrue) — email one-time codes
// ---------------------------------------------------------------------------------------------

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
};

export type AuthUser = {
  id: string;
  email: string;
  aal?: string;
};

type GoTrueSession = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  user?: { id?: string; email?: string };
};

function toSession(body: GoTrueSession): AuthSession | null {
  if (!body.access_token || !body.refresh_token || !body.user?.id) return null;
  return {
    accessToken: body.access_token,
    refreshToken: body.refresh_token,
    expiresIn: body.expires_in ?? 3600,
    user: { id: body.user.id, email: body.user.email ?? "" },
  };
}

export type OtpRequestResult = "sent" | "rate_limited" | "invalid" | "unavailable";

export async function requestEmailCode(email: string): Promise<OtpRequestResult> {
  const config = requireSupabase();
  const response = await timedFetch(`${config.url}/auth/v1/otp`, {
    method: "POST",
    headers: { apikey: config.anonKey, "Content-Type": "application/json" },
    body: JSON.stringify({ email, create_user: true }),
  });
  if (response.ok) return "sent";
  if (response.status === 429) return "rate_limited";
  if (response.status === 400 || response.status === 422) return "invalid";
  return "unavailable";
}

export async function verifyEmailCode(email: string, token: string): Promise<AuthSession | "invalid" | "rate_limited"> {
  const config = requireSupabase();
  const response = await timedFetch(`${config.url}/auth/v1/verify`, {
    method: "POST",
    headers: { apikey: config.anonKey, "Content-Type": "application/json" },
    body: JSON.stringify({ type: "email", email, token }),
  });
  if (response.status === 429) return "rate_limited";
  if (response.status >= 500) throw new StorageUnavailableError(`auth_${response.status}`);
  if (!response.ok) return "invalid";
  return toSession((await response.json()) as GoTrueSession) ?? "invalid";
}

export async function refreshSession(refreshToken: string): Promise<AuthSession | null> {
  const config = requireSupabase();
  const response = await timedFetch(`${config.url}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: { apikey: config.anonKey, "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (response.status >= 500) throw new StorageUnavailableError(`auth_${response.status}`);
  if (!response.ok) return null;
  return toSession((await response.json()) as GoTrueSession);
}

/** Verifies the access token with the auth server (authoritative, honours revoked sessions). */
export async function fetchUser(accessToken: string): Promise<AuthUser | null> {
  const config = requireSupabase();
  const response = await timedFetch(`${config.url}/auth/v1/user`, {
    method: "GET",
    headers: { apikey: config.anonKey, Authorization: `Bearer ${accessToken}` },
  });
  if (response.status >= 500) throw new StorageUnavailableError(`auth_${response.status}`);
  if (!response.ok) return null;
  const body = (await response.json()) as { id?: string; email?: string };
  if (!body.id) return null;
  return { id: body.id, email: body.email ?? "" };
}

export async function signOutSession(accessToken: string, scope: "local" | "global") {
  const config = getSupabaseConfig();
  if (!config) return;
  await timedFetch(`${config.url}/auth/v1/logout?scope=${scope}`, {
    method: "POST",
    headers: { apikey: config.anonKey, Authorization: `Bearer ${accessToken}` },
  }).catch(() => undefined);
}
