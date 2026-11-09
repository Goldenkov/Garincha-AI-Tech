import { parseProfile } from "@/lib/domain/profile";
import { adviseWithAi } from "@/lib/server/ai-advisor";
import { withViewer } from "@/lib/server/api";
import { errorJson, json, readJson } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";

/** Optional AI advisor. Runs only on an explicit request from a signed-in user. */
export async function POST(request: Request) {
  return withViewer(
    request,
    async (viewer) => {
      const minute = rateLimit(`advisor:${viewer.user.id}`, 3, 60_000);
      if (!minute.ok) return errorJson(429, "rate_limited", "Подождите минуту перед новым подбором.");
      const body = (await readJson(request)) as { profile?: unknown };
      const result = await adviseWithAi(parseProfile(body?.profile), viewer.user.id);
      return json({ success: true, result });
    },
    { limit: 10 },
  );
}
