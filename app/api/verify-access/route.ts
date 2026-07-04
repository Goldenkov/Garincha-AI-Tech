import { NextResponse } from "next/server";

import { createProAccessPayload, signProAccessToken } from "@/lib/pro-access-token";

const DEV_FALLBACK_CODE = "change-me-before-production";
const DEV_FALLBACK_SECRET = "change-me-before-production-secret";
const COOKIE_NAME = process.env.PRO_ACCESS_COOKIE_NAME ?? "business-reboot-pro-access";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 14;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { code?: unknown };
  const code = typeof body.code === "string" ? body.code.trim() : "";
  const configuredCode =
    process.env.PRO_ACCESS_CODE ?? (process.env.NODE_ENV === "production" ? undefined : DEV_FALLBACK_CODE);
  const accessSecret =
    process.env.PRO_ACCESS_SECRET ?? (process.env.NODE_ENV === "production" ? undefined : DEV_FALLBACK_SECRET);

  if (!configuredCode || !accessSecret) {
    return NextResponse.json({ success: false }, { status: 503 });
  }

  if (code !== configuredCode) {
    return NextResponse.json({ success: false });
  }

  const token = await signProAccessToken(createProAccessPayload(COOKIE_MAX_AGE), accessSecret);
  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  return response;
}
