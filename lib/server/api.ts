import "server-only";

import { errorJson, handleRouteError, rejectCrossSite } from "@/lib/server/http";
import { clientKey, rateLimit } from "@/lib/server/rate-limit";
import { getViewer, type ViewerSession } from "@/lib/server/session";
import { StorageUnavailableError } from "@/lib/server/supabase";
import { getSupabaseConfig } from "@/lib/server/config";

type Handler = (viewer: ViewerSession) => Promise<Response>;

/**
 * Wraps a mutating endpoint: same-origin JSON only, a verified session, a per-user write limit,
 * and one error mapping so nothing reports success unless the database accepted the change.
 */
export async function withViewer(request: Request, handler: Handler, options: { limit?: number } = {}) {
  const rejected = request.method === "GET" ? null : rejectCrossSite(request);
  if (rejected) return rejected;
  try {
    if (!getSupabaseConfig()) throw new StorageUnavailableError("supabase_not_configured");
    const viewer = await getViewer();
    if (!viewer) return errorJson(401, "not_authenticated", "Войдите, чтобы продолжить.");
    if (request.method !== "GET") {
      const limit = rateLimit(`write:${viewer.user.id}`, options.limit ?? 120, 60_000);
      const ipLimit = rateLimit(`write-ip:${clientKey(request)}`, 300, 60_000);
      if (!limit.ok || !ipLimit.ok) return errorJson(429, "rate_limited", "Слишком много запросов. Подождите минуту.");
    }
    return await handler(viewer);
  } catch (error) {
    return handleRouteError(error);
  }
}
