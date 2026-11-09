import { InputError } from "@/lib/domain/hypothesis";
import { withViewer } from "@/lib/server/api";
import { errorJson, json, readJson } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";
import { redeemAccessCode } from "@/lib/server/projects";

export async function POST(request: Request) {
  return withViewer(
    request,
    async (viewer) => {
      const attempts = rateLimit(`redeem:${viewer.user.id}`, 5, 15 * 60 * 1000);
      if (!attempts.ok) return errorJson(429, "rate_limited", "Слишком много попыток. Попробуйте через 15 минут.");
      const body = (await readJson(request)) as { code?: unknown };
      const code = typeof body?.code === "string" ? body.code.trim() : "";
      if (code.length < 8 || code.length > 128) throw new InputError("Проверьте код доступа.", "code");
      const result = await redeemAccessCode(viewer.accessToken, code);
      return json({ success: true, status: result.status, expiresAt: result.expires_at });
    },
    { limit: 10 },
  );
}
