import "server-only";

import { NextResponse } from "next/server";

import { InputError } from "@/lib/domain/hypothesis";
import { StepInputError } from "@/lib/steps";
import { DatabaseError, StorageUnavailableError } from "@/lib/server/supabase";

export const MAX_JSON_BYTES = 64 * 1024;

export function json(body: unknown, status = 200, headers?: Record<string, string>) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

export function errorJson(status: number, error: string, message: string, extra?: Record<string, unknown>) {
  return json({ success: false, error, message, ...extra }, status);
}

/**
 * Mutating endpoints accept only same-origin JSON. SameSite=Lax cookies plus the JSON content
 * type already block classic CSRF; the Origin check is an additional explicit guard.
 */
export function rejectCrossSite(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) {
        return errorJson(403, "cross_site", "Запрос отклонён.");
      }
    } catch {
      return errorJson(403, "cross_site", "Запрос отклонён.");
    }
  }
  const type = request.headers.get("content-type") ?? "";
  if (!type.toLowerCase().startsWith("application/json")) {
    return errorJson(415, "unsupported_media_type", "Ожидается JSON.");
  }
  return null;
}

export async function readJson(request: Request): Promise<unknown> {
  const length = Number(request.headers.get("content-length") ?? "0");
  if (length > MAX_JSON_BYTES) throw new InputError("Слишком большой запрос.");
  const raw = await request.text();
  if (raw.length > MAX_JSON_BYTES) throw new InputError("Слишком большой запрос.");
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    throw new InputError("Некорректный JSON.");
  }
}

const databaseMessages: Record<string, [number, string]> = {
  not_found: [404, "Проект не найден или недоступен."],
  not_authenticated: [401, "Войдите, чтобы продолжить."],
  conflict: [409, "Данные изменились в другой вкладке. Обновите страницу, чтобы не потерять изменения."],
  hypothesis_not_approved: [409, "Сначала подтвердите гипотезу."],
  pro_required: [402, "Этот шаг доступен с PRO-доступом."],
  incomplete_hypothesis: [422, "Заполните обязательные поля гипотезы."],
  invalid_status: [409, "Эта версия гипотезы уже подтверждена или заменена."],
  invalid_code: [400, "Код не подошёл. Проверьте написание или напишите в поддержку."],
  too_many_projects: [429, "Достигнут лимит активных проектов. Архивируйте ненужные."],
  no_hypothesis: [404, "Гипотеза не найдена."],
  nothing_to_discard: [409, "Нет неподтверждённых изменений."],
  unknown_step: [404, "Шаг не найден."],
};

export function handleRouteError(error: unknown) {
  if (error instanceof InputError || error instanceof StepInputError) {
    return errorJson(400, "invalid_input", error.message, { field: error.field });
  }
  if (error instanceof StorageUnavailableError) {
    console.error(`[api] storage unavailable: ${error.message}`);
    return errorJson(503, "storage_unavailable", "Хранилище временно недоступно. Изменения не сохранены — попробуйте ещё раз.");
  }
  if (error instanceof DatabaseError) {
    const key = Object.keys(databaseMessages).find((name) => error.message === name || error.message.startsWith(`${name}:`));
    if (key) {
      const [status, message] = databaseMessages[key];
      return errorJson(status, key, message);
    }
    if (error.message.startsWith("field_too_long") || error.message.startsWith("too_many_items") || error.message.startsWith("invalid_")) {
      return errorJson(400, "invalid_input", "Проверьте длину и формат полей.");
    }
    console.error(`[api] database error ${error.code} (${error.status})`);
    return errorJson(500, "database_error", "Не удалось выполнить действие. Изменения не сохранены.");
  }
  console.error("[api] unexpected error", error instanceof Error ? error.name : typeof error);
  return errorJson(500, "unexpected", "Что-то пошло не так. Изменения не сохранены.");
}
