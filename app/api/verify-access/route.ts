import { NextResponse } from "next/server";

const DEV_FALLBACK_CODE = "change-me-before-production";
const COOKIE_NAME = process.env.PRO_ACCESS_COOKIE_NAME ?? "business-reboot-pro-access";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 14;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { code?: unknown };
  const code = typeof body.code === "string" ? body.code.trim() : "";
  const configuredCode =
    process.env.PRO_ACCESS_CODE ?? (process.env.NODE_ENV === "production" ? undefined : DEV_FALLBACK_CODE);

  if (!configuredCode) {
    return NextResponse.json({ success: false }, { status: 503 });
  }

  if (code !== configuredCode) {
    return NextResponse.json({ success: false });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, "granted", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  return response;
}
