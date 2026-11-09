import { beforeEach, describe, expect, it, vi } from "vitest";

import { sanitizeNextPath } from "@/lib/safe-redirect";
import { rejectCrossSite } from "@/lib/server/http";
import { rateLimit, resetRateLimits } from "@/lib/server/rate-limit";
import { deliverSubmission, handleSubmission, resetDeliveryLedger } from "@/lib/server/submissions";

describe("post-login redirect", () => {
  it.each([
    ["https://evil.example/projects", "/projects"],
    ["//evil.example/projects", "/projects"],
    ["/\\evil.example", "/projects"],
    ["/admin", "/projects"],
    ["/startupx", "/projects"],
    [null, "/projects"],
    ["/startup/abc?tab=1", "/startup/abc?tab=1"],
    ["/start/idea?resume=1", "/start/idea?resume=1"],
    ["/account", "/account"],
  ])("%s → %s", (input, expected) => {
    expect(sanitizeNextPath(input)).toBe(expected);
  });
});

describe("rate limit", () => {
  beforeEach(() => resetRateLimits());

  it("blocks after the limit and recovers after the window", () => {
    const now = 1_000_000;
    for (let i = 0; i < 3; i += 1) expect(rateLimit("k", 3, 60_000, now + i).ok).toBe(true);
    const blocked = rateLimit("k", 3, 60_000, now + 10);
    expect(blocked.ok).toBe(false);
    expect(rateLimit("k", 3, 60_000, now + 60_001).ok).toBe(true);
  });
});

describe("same-origin JSON guard", () => {
  const request = (headers: Record<string, string>) => new Request("http://app.test/api/x", { method: "POST", headers });

  it("rejects cross-site origins and non-JSON bodies", () => {
    expect(rejectCrossSite(request({ origin: "https://evil.example", host: "app.test", "content-type": "application/json" }))?.status).toBe(403);
    expect(rejectCrossSite(request({ origin: "http://app.test", host: "app.test", "content-type": "text/plain" }))?.status).toBe(415);
    expect(rejectCrossSite(request({ origin: "http://app.test", host: "app.test", "content-type": "application/json" }))).toBeNull();
  });
});

describe("form delivery", () => {
  beforeEach(() => {
    resetRateLimits();
    resetDeliveryLedger();
    vi.stubEnv("SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_ANON_KEY", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    vi.stubEnv("TELEGRAM_BOT_TOKEN", "");
    vi.stubEnv("TELEGRAM_LEADS_CHAT_ID", "");
  });

  const submit = (body: Record<string, unknown>) =>
    handleSubmission(
      new Request("http://app.test/api/leads", {
        method: "POST",
        headers: { origin: "http://app.test", host: "app.test", "content-type": "application/json", "x-forwarded-for": "203.0.113.7" },
        body: JSON.stringify(body),
      }),
      "leads",
      () => ({ row: { name: "Анна" }, title: "Новая заявка", lines: ["Анна"] }),
    );

  it("does not report success when no channel accepted the submission", async () => {
    const response = await submit({ name: "Анна" });
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ error: "delivery_failed" });
  });

  it("reports success only after the channel confirms", async () => {
    vi.stubEnv("TELEGRAM_BOT_TOKEN", "test-token");
    vi.stubEnv("TELEGRAM_LEADS_CHAT_ID", "1");
    const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const response = await submit({ name: "Анна" });
    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("a failing channel is a failure, not a success", async () => {
    vi.stubEnv("TELEGRAM_BOT_TOKEN", "test-token");
    vi.stubEnv("TELEGRAM_LEADS_CHAT_ID", "1");
    vi.stubGlobal("fetch", vi.fn(async () => new Response("bad", { status: 400 })));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const result = await deliverSubmission({ table: "leads", idempotencyKey: crypto.randomUUID(), title: "t", row: {}, lines: [] });
    expect(result).toEqual({ delivered: false, duplicate: false, channels: [], unconfirmed: false });
  });

  it("honeypot submissions are dropped without delivery", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const response = await submit({ name: "bot", website: "http://spam" });
    expect(response.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("limits repeated submissions from one client", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    for (let i = 0; i < 5; i += 1) await submit({ name: "Анна" });
    expect((await submit({ name: "Анна" })).status).toBe(429);
  });
});
