import { NextResponse } from "next/server";

const COOKIE_NAME = process.env.PRO_ACCESS_COOKIE_NAME ?? "business-reboot-pro-access";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
