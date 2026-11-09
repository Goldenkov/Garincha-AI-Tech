import "server-only";

import { randomUUID } from "node:crypto";

import { getSupabaseConfig, getTelegramConfig } from "@/lib/server/config";
import { errorJson, handleRouteError, json, readJson, rejectCrossSite } from "@/lib/server/http";
import { clientKey, rateLimit } from "@/lib/server/rate-limit";
import { insertAsService } from "@/lib/server/supabase";

export type SubmissionTable = "leads" | "partners" | "feedback";

export type DeliveryResult = {
  delivered: boolean;
  duplicate: boolean;
  channels: string[];
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu;

export function asTrimmedString(value: unknown, max = 2000) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function isEmail(value: string) {
  return value.length <= 254 && emailPattern.test(value);
}

async function sendTelegram(title: string, lines: string[]) {
  const config = getTelegramConfig();
  if (!config) return false;
  try {
    const response = await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(8000),
      body: JSON.stringify({ chat_id: config.chatId, text: [title, ...lines].join("\n"), disable_web_page_preview: true }),
    });
    if (!response.ok) console.error(`[submission] telegram responded ${response.status}`);
    return response.ok;
  } catch {
    console.error("[submission] telegram unreachable");
    return false;
  }
}

/**
 * Stores the submission and notifies the team. Success means at least one channel confirmed
 * receipt. A retry with the same idempotency key is acknowledged without a second notification.
 * Payloads are never written to logs.
 */
export async function deliverSubmission({
  table,
  idempotencyKey,
  title,
  row,
  lines,
}: {
  table: SubmissionTable;
  idempotencyKey: string;
  title: string;
  row: Record<string, unknown>;
  lines: string[];
}): Promise<DeliveryResult> {
  const channels: string[] = [];
  let duplicate = false;

  if (getSupabaseConfig()?.serviceRoleKey) {
    try {
      const stored = await insertAsService(table, { ...row, idempotency_key: idempotencyKey }, { onConflict: "idempotency_key" });
      duplicate = stored === "duplicate";
      channels.push("database");
    } catch (error) {
      console.error(`[submission:${table}] database insert failed (${error instanceof Error ? error.message : "unknown"})`);
    }
  }

  if (!duplicate && (await sendTelegram(title, lines))) channels.push("telegram");

  if (channels.length === 0) console.error(`[submission:${table}] not delivered: no channel accepted the submission`);
  return { delivered: channels.length > 0, duplicate, channels };
}

type Prepared = { row: Record<string, unknown>; title: string; lines: string[] } | { error: string; field?: string };

/** Shared request handling for the public forms: same-origin JSON, honeypot, limits, idempotency. */
export async function handleSubmission(request: Request, table: SubmissionTable, prepare: (payload: Record<string, unknown>) => Prepared) {
  const rejected = rejectCrossSite(request);
  if (rejected) return rejected;
  try {
    const payload = (await readJson(request)) as Record<string, unknown>;
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return errorJson(400, "invalid_input", "Некорректные данные формы.");
    }
    // Hidden field that people never see; automated submissions that fill it are dropped silently.
    if (asTrimmedString(payload.website)) return json({ success: true });

    const limit = rateLimit(`submit:${table}:${clientKey(request)}`, 5, 10 * 60 * 1000);
    if (!limit.ok) return errorJson(429, "rate_limited", "Слишком много отправок. Попробуйте через несколько минут.");

    const prepared = prepare(payload);
    if ("error" in prepared) return errorJson(400, "invalid_input", prepared.error, { field: prepared.field });

    const key = typeof payload.idempotencyKey === "string" && uuidPattern.test(payload.idempotencyKey) ? payload.idempotencyKey : randomUUID();
    const result = await deliverSubmission({ table, idempotencyKey: key, ...prepared });
    if (!result.delivered) {
      return errorJson(503, "delivery_failed", "Не удалось отправить. Данные не сохранены — попробуйте ещё раз позже или напишите нам напрямую.");
    }
    return json({ success: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
