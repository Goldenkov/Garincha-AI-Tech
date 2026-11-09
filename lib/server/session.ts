import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";

import { isProduction, REFRESH_COOKIE_MAX_AGE, sessionCookieNames } from "@/lib/server/config";
import { fetchUser, type AuthSession, type AuthUser } from "@/lib/server/supabase";
import { getSupabaseConfig } from "@/lib/server/config";

export type ViewerSession = {
  user: AuthUser;
  accessToken: string;
};

export function sessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

type CookieWriter = { set: (name: string, value: string, options: ReturnType<typeof sessionCookieOptions>) => unknown };

export function writeSessionCookies(target: CookieWriter, session: AuthSession) {
  target.set(sessionCookieNames.access, session.accessToken, sessionCookieOptions(Math.max(60, session.expiresIn)));
  target.set(sessionCookieNames.refresh, session.refreshToken, sessionCookieOptions(REFRESH_COOKIE_MAX_AGE));
}

export function clearSessionCookies(target: CookieWriter) {
  target.set(sessionCookieNames.access, "", sessionCookieOptions(0));
  target.set(sessionCookieNames.refresh, "", sessionCookieOptions(0));
}

/**
 * Returns the verified viewer or null. Verification is done by the auth server on each request
 * (cached per render), so a revoked or expired token is never trusted from the cookie alone.
 */
export const getViewer = cache(async (): Promise<ViewerSession | null> => {
  if (!getSupabaseConfig()) return null;
  const store = await cookies();
  const accessToken = store.get(sessionCookieNames.access)?.value;
  if (!accessToken) return null;
  try {
    const user = await fetchUser(accessToken);
    return user ? { user, accessToken } : null;
  } catch {
    return null;
  }
});

export async function hasSessionCookie() {
  const store = await cookies();
  return Boolean(store.get(sessionCookieNames.access)?.value || store.get(sessionCookieNames.refresh)?.value);
}

export function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!name || !domain) return "***";
  return `${name.slice(0, 2)}***@${domain}`;
}
