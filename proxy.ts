import { NextResponse, type NextRequest } from "next/server";

const ACCESS_COOKIE = "br_session";
const REFRESH_COOKIE = "br_refresh";
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;
const PROTECTED_PREFIXES = ["/projects", "/startup", "/account"];

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

/** Reads `exp` without verifying the signature: only used to decide whether to refresh early. */
function expiresSoon(token: string) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]?.replace(/-/gu, "+").replace(/_/gu, "/") ?? "")) as { exp?: number };
    return typeof payload.exp !== "number" || payload.exp * 1000 - Date.now() < 30_000;
  } catch {
    return true;
  }
}

type Refreshed = { access: string; refresh: string; expiresIn: number } | "invalid" | "unavailable";

async function refresh(refreshToken: string): Promise<Refreshed> {
  const url = (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/+$/u, "");
  const anonKey = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return "unavailable";
  try {
    const response = await fetch(`${url}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: { apikey: anonKey, "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
      signal: AbortSignal.timeout(6000),
      cache: "no-store",
    });
    if (response.status >= 500) return "unavailable";
    if (!response.ok) return "invalid";
    const body = (await response.json()) as { access_token?: string; refresh_token?: string; expires_in?: number };
    if (!body.access_token || !body.refresh_token) return "invalid";
    return { access: body.access_token, refresh: body.refresh_token, expiresIn: body.expires_in ?? 3600 };
  } catch {
    return "unavailable";
  }
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  const access = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  let response: NextResponse | null = null;
  let hasSession = Boolean(access && !expiresSoon(access));

  if (!hasSession && refreshToken) {
    const result = await refresh(refreshToken);
    if (typeof result === "object") {
      request.cookies.set(ACCESS_COOKIE, result.access);
      request.cookies.set(REFRESH_COOKIE, result.refresh);
      response = NextResponse.next({ request: { headers: request.headers } });
      response.cookies.set(ACCESS_COOKIE, result.access, cookieOptions(Math.max(60, result.expiresIn)));
      response.cookies.set(REFRESH_COOKIE, result.refresh, cookieOptions(REFRESH_MAX_AGE));
      hasSession = true;
    } else if (result === "invalid") {
      request.cookies.delete(ACCESS_COOKIE);
      request.cookies.delete(REFRESH_COOKIE);
      response = NextResponse.next({ request: { headers: request.headers } });
      response.cookies.set(ACCESS_COOKIE, "", cookieOptions(0));
      response.cookies.set(REFRESH_COOKIE, "", cookieOptions(0));
      response.cookies.set("br_signed_in", "", { ...cookieOptions(0), httpOnly: false });
    } else {
      // Auth server unreachable: let the page render its own "storage unavailable" state.
      hasSession = Boolean(access);
    }
  }

  if (isProtected && !hasSession) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", `${pathname}${search}`);
    const redirect = NextResponse.redirect(login);
    if (response) {
      for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
    }
    return redirect;
  }

  return response ?? NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|opengraph-image|robots.txt|sitemap.xml|fonts/).*)"],
};
