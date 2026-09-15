import { NextRequest, NextResponse } from "next/server";

import { verifyProAccessToken } from "@/lib/pro-access-token";

const COOKIE_NAME = process.env.PRO_ACCESS_COOKIE_NAME ?? "business-reboot-pro-access";
const DEV_FALLBACK_SECRET = "change-me-before-production-secret";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const accessSecret =
    process.env.PRO_ACCESS_SECRET ?? (process.env.NODE_ENV === "production" ? undefined : DEV_FALLBACK_SECRET);
  const hasValidAccess = await verifyProAccessToken(token, accessSecret);

  if (hasValidAccess) {
    return NextResponse.next();
  }

  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  const accessUrl = new URL("/access", request.url);
  accessUrl.searchParams.set("next", nextPath);

  return NextResponse.redirect(accessUrl);
}

export const config = {
  matcher: ["/journey/:path*", "/launch-kit/:path*", "/dashboard/:path*"],
};
