import { NextResponse } from "next/server";

const DEV_FALLBACK_CODE = "change-me-before-production";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { code?: unknown };
  const code = typeof body.code === "string" ? body.code.trim() : "";
  const configuredCode =
    process.env.PRO_ACCESS_CODE ?? (process.env.NODE_ENV === "production" ? undefined : DEV_FALLBACK_CODE);

  if (!configuredCode) {
    return NextResponse.json({ success: false }, { status: 503 });
  }

  return NextResponse.json({ success: code === configuredCode });
}
