import { cookies } from "next/headers";

import { sessionCookieNames } from "@/lib/server/config";
import { json, readJson, rejectCrossSite } from "@/lib/server/http";
import { clearSessionCookies } from "@/lib/server/session";
import { signOutSession } from "@/lib/server/supabase";

export async function POST(request: Request) {
  const rejected = rejectCrossSite(request);
  if (rejected) return rejected;

  const body = (await readJson(request).catch(() => ({}))) as { everywhere?: unknown };
  const store = await cookies();
  const accessToken = store.get(sessionCookieNames.access)?.value;
  if (accessToken) await signOutSession(accessToken, body?.everywhere === true ? "global" : "local");

  const response = json({ success: true });
  clearSessionCookies(response.cookies);
  return response;
}
