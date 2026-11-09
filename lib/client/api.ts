export type ApiResult<T> =
  | ({ ok: true; status: number } & T)
  | { ok: false; status: number; error: string; message: string; field?: string; missing?: string[] };

/**
 * JSON request helper for client components. A result is `ok` only when the server confirmed the
 * change; network failures and timeouts are reported as "not saved".
 */
export async function apiRequest<T extends object = object>(
  url: string,
  { method = "POST", body }: { method?: "POST" | "PUT" | "PATCH" | "DELETE"; body?: unknown } = {},
): Promise<ApiResult<T>> {
  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
      credentials: "same-origin",
      signal: AbortSignal.timeout(20_000),
    });
  } catch {
    return { ok: false, status: 0, error: "network", message: "Нет связи с сервером. Изменения не сохранены — проверьте интернет и повторите." };
  }
  const data = (await response.json().catch(() => null)) as (Record<string, unknown> & { success?: boolean }) | null;
  if (response.ok && data?.success) return { ok: true, status: response.status, ...(data as T) };
  if (response.status === 401 && typeof window !== "undefined") {
    const next = `${window.location.pathname}${window.location.search}`;
    window.location.assign(`/login?next=${encodeURIComponent(next)}`);
  }
  return {
    ok: false,
    status: response.status,
    error: typeof data?.error === "string" ? data.error : "unknown",
    message: typeof data?.message === "string" ? data.message : "Не удалось выполнить действие. Изменения не сохранены.",
    field: typeof data?.field === "string" ? data.field : undefined,
    missing: Array.isArray(data?.missing) ? (data.missing as string[]) : undefined,
  };
}

export function newIdempotencyKey() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "10000000-1000-4000-8000-100000000000".replace(/[018]/gu, (c) =>
        (Number(c) ^ (Math.random() * 16) >> (Number(c) / 4)).toString(16),
      );
}
