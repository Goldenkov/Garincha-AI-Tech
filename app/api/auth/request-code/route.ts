import { InputError } from "@/lib/domain/hypothesis";
import { errorJson, handleRouteError, json, readJson, rejectCrossSite } from "@/lib/server/http";
import { clientKey, rateLimit } from "@/lib/server/rate-limit";
import { maskEmail } from "@/lib/server/session";
import { requestEmailCode } from "@/lib/server/supabase";
import { isEmail } from "@/lib/server/submissions";

const WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: Request) {
  const rejected = rejectCrossSite(request);
  if (rejected) return rejected;

  try {
    const body = (await readJson(request)) as { email?: unknown };
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!isEmail(email) || email.length > 254) throw new InputError("Введите корректный email.", "email");

    const byIp = rateLimit(`otp-ip:${clientKey(request)}`, 10, WINDOW_MS);
    const byEmail = rateLimit(`otp-email:${email}`, 4, WINDOW_MS);
    const limited = !byIp.ok ? byIp : !byEmail.ok ? byEmail : null;
    if (limited) {
      return errorJson(429, "rate_limited", `Слишком много запросов. Попробуйте через ${Math.ceil(limited.retryAfterSeconds / 60)} мин.`, {
        retryAfterSeconds: limited.retryAfterSeconds,
      });
    }

    const result = await requestEmailCode(email);
    if (result === "sent") return json({ success: true });
    if (result === "rate_limited") {
      return errorJson(429, "rate_limited", "Код уже отправлен недавно. Подождите минуту и попробуйте снова.");
    }
    if (result === "invalid") return errorJson(400, "invalid_input", "Не удалось отправить код на этот адрес.", { field: "email" });
    console.error(`[auth] code delivery failed for ${maskEmail(email)}`);
    return errorJson(503, "delivery_failed", "Не получилось отправить письмо. Попробуйте ещё раз через пару минут.");
  } catch (error) {
    return handleRouteError(error);
  }
}
