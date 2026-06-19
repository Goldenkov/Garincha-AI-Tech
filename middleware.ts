import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = process.env.PRO_ACCESS_COOKIE_NAME ?? "business-reboot-pro-access";

export function middleware(request: NextRequest) {
  const hasAccessCookie = Boolean(request.cookies.get(COOKIE_NAME)?.value);

  if (hasAccessCookie) {
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
