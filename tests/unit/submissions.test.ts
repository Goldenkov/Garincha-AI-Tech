import { beforeEach, describe, expect, it, vi } from "vitest";

import { resetRateLimits } from "@/lib/server/rate-limit";
import { handleSubmission, resetDeliveryLedger, submissionReference } from "@/lib/server/submissions";

const realFetch = globalThis.fetch;

type TelegramReply = () => Response | Promise<Response>;

/** Telegram is mocked; every other request (the database) goes over the real network stack. */
function mockTelegram(replies: TelegramReply[]) {
  const sent: string[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (!String(input).startsWith("https://api.telegram.org/")) return realFetch(input, init);
      sent.push((JSON.parse(String(init?.body)) as { text: string }).text);
      const reply = replies[Math.min(sent.length, replies.length) - 1];
      return reply();
    }),
  );
  return sent;
}

const accepted = () => new Response('{"ok":true}', { status: 200 });
const timeout = () => Promise.reject(new DOMException("The operation was aborted due to timeout", "TimeoutError"));

const submit = (idempotencyKey: string, forwardedFor = "203.0.113.7") =>
  handleSubmission(
    new Request("http://app.test/api/leads", {
      method: "POST",
      headers: { origin: "http://app.test", host: "app.test", "content-type": "application/json", "x-forwarded-for": forwardedFor },
      body: JSON.stringify({ idempotencyKey, name: "Анна" }),
    }),
    "leads",
    () => ({ row: { name: "Анна" }, title: "Новая заявка", lines: ["Имя: Анна"] }),
  );

describe.each([
  ["Telegram only (no database configured)", { SUPABASE_URL: "", SUPABASE_ANON_KEY: "", SUPABASE_SERVICE_ROLE_KEY: "" }],
  // Port 9 on loopback is closed: the insert fails with a real connection error.
  ["database configured but unreachable", { SUPABASE_URL: "http://127.0.0.1:9", SUPABASE_ANON_KEY: "anon", SUPABASE_SERVICE_ROLE_KEY: "service" }],
])("form delivery retries — %s", (_name, env) => {
  beforeEach(() => {
    resetRateLimits();
    resetDeliveryLedger();
    for (const [name, value] of Object.entries(env)) vi.stubEnv(name, value);
    vi.stubEnv("TELEGRAM_BOT_TOKEN", "test-token");
    vi.stubEnv("TELEGRAM_LEADS_CHAT_ID", "1");
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("a retry with the same key after a confirmed send does not notify again", async () => {
    const sent = mockTelegram([accepted]);
    const key = crypto.randomUUID();
    expect((await submit(key)).status).toBe(200);
    expect((await submit(key)).status).toBe(200);
    expect((await submit(key)).status).toBe(200);
    expect(sent).toHaveLength(1);
    expect(sent[0]).toContain(`Номер заявки: ${submissionReference(key)}`);
  });

  it("parallel requests with the same key share one send", async () => {
    const sent = mockTelegram([async () => {
      await new Promise((resolve) => setTimeout(resolve, 30));
      return accepted();
    }]);
    const key = crypto.randomUUID();
    const responses = await Promise.all([submit(key), submit(key), submit(key)]);
    expect(responses.map((response) => response.status)).toEqual([200, 200, 200]);
    expect(sent).toHaveLength(1);
  });

  it("does not claim success after a timeout, and marks the retry as a possible duplicate", async () => {
    const sent = mockTelegram([timeout, accepted]);
    const key = crypto.randomUUID();

    const first = await submit(key);
    expect(first.status).toBe(503);
    const body = (await first.json()) as { error: string; message: string };
    expect(body.error).toBe("delivery_unconfirmed");
    expect(body.message).toContain(submissionReference(key));

    expect((await submit(key)).status).toBe(200);
    expect(sent).toHaveLength(2);
    expect(sent[1].split("\n")[0]).toMatch(/возможен дубль/u);
    expect(sent[1]).toContain(`Номер заявки: ${submissionReference(key)}`);

    expect((await submit(key)).status).toBe(200);
    expect(sent).toHaveLength(2);
  });

  it("treats a Telegram 5xx as unconfirmed", async () => {
    mockTelegram([() => new Response("bad gateway", { status: 502 })]);
    const response = await submit(crypto.randomUUID());
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ error: "delivery_unconfirmed" });
  });

  it("a refused message is a plain failure and the retry is not marked as a duplicate", async () => {
    const sent = mockTelegram([() => new Response('{"ok":false}', { status: 400 }), accepted]);
    const key = crypto.randomUUID();
    const first = await submit(key);
    expect(first.status).toBe(503);
    expect(await first.json()).toMatchObject({ error: "delivery_failed" });
    expect((await submit(key)).status).toBe(200);
    expect(sent).toHaveLength(2);
    expect(sent[1]).not.toMatch(/возможен дубль/u);
  });

  it("different keys are different submissions", async () => {
    const sent = mockTelegram([accepted]);
    await submit(crypto.randomUUID());
    await submit(crypto.randomUUID());
    expect(sent).toHaveLength(2);
  });
});
