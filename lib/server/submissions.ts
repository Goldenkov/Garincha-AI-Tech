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
  /** Telegram may or may not have accepted the message (timeout, network error, 5xx). */
  unconfirmed: boolean;
};

type TelegramOutcome = "sent" | "rejected" | "unconfirmed";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu;

export function asTrimmedString(value: unknown, max = 2000) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function isEmail(value: string) {
  return value.length <= 254 && emailPattern.test(value);
}

/**
 * A 2xx means Telegram posted the message and a 4xx means it refused it. A timeout, a network
 * error or a 5xx can happen after the message was already posted, so those stay "unconfirmed".
 */
async function sendTelegram(text: string): Promise<TelegramOutcome | null> {
  const config = getTelegramConfig();
  if (!config) return null;
  try {
    const response = await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(8000),
      body: JSON.stringify({ chat_id: config.chatId, text, disable_web_page_preview: true }),
    });
    if (response.ok) return "sent";
    console.error(`[submission] telegram responded ${response.status}`);
    return response.status >= 500 ? "unconfirmed" : "rejected";
  } catch (error) {
    console.error(`[submission] telegram ${error instanceof Error && error.name === "TimeoutError" ? "timed out" : "unreachable"}`);
    return "unconfirmed";
  }
}

// Telegram has no idempotency of its own, so the outcome per idempotency key is remembered here.
// Process memory matches the single-container deployment; after a restart or across several
// instances a retry may notify twice (see docs/OPERATIONS.md). The database stays authoritative.
const LEDGER_TTL_MS = 24 * 60 * 60 * 1000;
const LEDGER_MAX_KEYS = 20_000;
const telegramLedger = new Map<string, { outcome: "sent" | "unconfirmed"; at: number }>();
const inFlight = new Map<string, Promise<DeliveryResult>>();

function readLedger(key: string, now: number) {
  const entry = telegramLedger.get(key);
  if (entry && now - entry.at > LEDGER_TTL_MS) {
    telegramLedger.delete(key);
    return null;
  }
  return entry ?? null;
}

function writeLedger(key: string, outcome: "sent" | "unconfirmed", now: number) {
  telegramLedger.delete(key);
  telegramLedger.set(key, { outcome, at: now });
  if (telegramLedger.size > LEDGER_MAX_KEYS) {
    const oldest = telegramLedger.keys().next().value;
    if (oldest) telegramLedger.delete(oldest);
  }
}

export function resetDeliveryLedger() {
  telegramLedger.clear();
  inFlight.clear();
}

export function submissionReference(idempotencyKey: string) {
  return idempotencyKey.replace(/-/gu, "").slice(0, 8).toUpperCase();
}

type DeliveryInput = {
  table: SubmissionTable;
  idempotencyKey: string;
  title: string;
  row: Record<string, unknown>;
  lines: string[];
};

/**
 * Stores the submission and notifies the team. Success means at least one channel confirmed
 * receipt. Concurrent requests with one idempotency key share a single attempt; a confirmed
 * Telegram notification is never repeated for that key. Delivery to Telegram is at-least-once:
 * after an unconfirmed attempt a retry sends again, marked as a possible duplicate, and every
 * message carries the submission reference so copies can be matched. Payloads are never logged.
 */
export function deliverSubmission(input: DeliveryInput): Promise<DeliveryResult> {
  const key = `${input.table}:${input.idempotencyKey}`;
  const running = inFlight.get(key);
  if (running) return running;
  const attempt = deliverOnce(input, key).finally(() => inFlight.delete(key));
  inFlight.set(key, attempt);
  return attempt;
}

async function deliverOnce({ table, idempotencyKey, title, row, lines }: DeliveryInput, ledgerKey: string): Promise<DeliveryResult> {
  const channels: string[] = [];
  let duplicate = false;
  let unconfirmed = false;

  if (getSupabaseConfig()?.serviceRoleKey) {
    try {
      const stored = await insertAsService(table, { ...row, idempotency_key: idempotencyKey }, { onConflict: "idempotency_key" });
      duplicate = stored === "duplicate";
      channels.push("database");
    } catch (error) {
      console.error(`[submission:${table}] database insert failed (${error instanceof Error ? error.message : "unknown"})`);
    }
  }

  const previous = readLedger(ledgerKey, Date.now());
  if (previous?.outcome === "sent") {
    duplicate = true;
    channels.push("telegram");
  } else if (!duplicate) {
    const header = previous?.outcome === "unconfirmed" ? ["Повторная отправка: прошлая попытка не подтвердилась, возможен дубль.", title] : [title];
    const outcome = await sendTelegram([...header, ...lines, `Номер заявки: ${submissionReference(idempotencyKey)}`].join("\n"));
    if (outcome === "sent") {
      channels.push("telegram");
      writeLedger(ledgerKey, "sent", Date.now());
    } else if (outcome === "unconfirmed") {
      unconfirmed = true;
      writeLedger(ledgerKey, "unconfirmed", Date.now());
    }
  }

  const delivered = channels.length > 0;
  if (!delivered) console.error(`[submission:${table}] not delivered: no channel confirmed the submission`);
  return { delivered, duplicate, channels, unconfirmed: !delivered && unconfirmed };
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
    if (result.unconfirmed) {
      return errorJson(
        503,
        "delivery_unconfirmed",
        `Не удалось подтвердить, что заявка дошла. Можно отправить ещё раз: если первая попытка всё же дошла, мы получим две копии с номером ${submissionReference(key)} и учтём заявку один раз.`,
      );
    }
    if (!result.delivered) {
      return errorJson(503, "delivery_failed", "Не удалось отправить. Данные не сохранены — попробуйте ещё раз позже или напишите нам напрямую.");
    }
    return json({ success: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
