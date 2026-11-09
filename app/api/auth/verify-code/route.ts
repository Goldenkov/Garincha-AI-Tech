import { InputError } from "@/lib/domain/hypothesis";
import { sanitizeNextPath } from "@/lib/safe-redirect";
import { errorJson, handleRouteError, json, readJson, rejectCrossSite } from "@/lib/server/http";
import { clientKey, rateLimit } from "@/lib/server/rate-limit";
import { writeSessionCookies } from "@/lib/server/session";
import { verifyEmailCode } from "@/lib/server/supabase";
import { isEmail } from "@/lib/server/submissions";

const WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: Request) {
  const rejected = rejectCrossSite(request);
  if (rejected) return rejected;

  try {
    const body = (await readJson(request)) as { email?: unknown; code?: unknown; next?: unknown };
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const code = typeof body?.code === "string" ? body.code.replace(/\s/gu, "") : "";
    if (!isEmail(email)) throw new InputError("Введите корректный email.", "email");
    if (!/^\d{6}$/u.test(code)) throw new InputError("Код состоит из 6 цифр.", "code");

    const byIp = rateLimit(`verify-ip:${clientKey(request)}`, 20, WINDOW_MS);
    const byEmail = rateLimit(`verify-email:${email}`, 8, WINDOW_MS);
    if (!byIp.ok || !byEmail.ok) {
      return errorJson(429, "rate_limited", "Слишком много попыток. Запросите новый код через 15 минут.");
    }

    const result = await verifyEmailCode(email, code);
    if (result === "rate_limited") return errorJson(429, "rate_limited", "Слишком много попыток. Подождите и попробуйте снова.");
    if (result === "invalid") return errorJson(400, "invalid_code", "Код не подошёл или устарел. Запросите новый.", { field: "code" });

    const response = json({ success: true, next: sanitizeNextPath(typeof body.next === "string" ? body.next : null) });
    writeSessionCookies(response.cookies, result);
    return response;
  } catch (error) {
    return handleRouteError(error);
  }
}
