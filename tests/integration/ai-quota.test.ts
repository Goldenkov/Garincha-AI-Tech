/**
 * AI budget under concurrency, against the local Supabase stack and a local mock provider.
 * The provider must be called at most as many times as the budget allows, however many requests
 * arrive at once.
 */
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { emptyProfile } from "@/lib/domain/profile";
import { adviseWithAi } from "@/lib/server/ai-advisor";

import { admin, createUser, isLocal, rest, rpc, serviceKey, url } from "./local-supabase";

const serviceRpc = (name: string, args: Record<string, unknown>) =>
  fetch(`${url}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(args),
  }).then(async (response) => ({ status: response.status, body: (await response.json()) as unknown }));

async function usedToday() {
  const dayStart = new Date();
  dayStart.setUTCHours(0, 0, 0, 0);
  const response = await fetch(`${url}/rest/v1/ai_usage?select=id&created_at=gte.${encodeURIComponent(dayStart.toISOString())}`, {
    method: "HEAD",
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, Prefer: "count=exact" },
  });
  return Number.parseInt((response.headers.get("content-range") ?? "*/0").split("/")[1] ?? "0", 10);
}

const validAnswer = {
  options: [
    {
      nicheId: "tailoring",
      businessModel: "made_to_order",
      why: ["Умеете шить"],
      watchOut: ["Сезонность"],
      unknowns: [],
      firstCheck: "Пять разговоров с заказчиками",
    },
  ],
};

describe.skipIf(!isLocal)("AI quota reservation (local Supabase)", () => {
  let provider: Server;
  let providerCalls = 0;

  beforeAll(async () => {
    provider = createServer((request, response) => {
      providerCalls += 1;
      request.resume();
      setTimeout(() => {
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(
          JSON.stringify({
            choices: [{ message: { content: JSON.stringify(validAnswer) } }],
            usage: { prompt_tokens: 321, completion_tokens: 54 },
          }),
        );
      }, 150);
    });
    await new Promise<void>((resolve) => provider.listen(0, "127.0.0.1", resolve));
  });

  afterAll(async () => {
    vi.unstubAllEnvs();
    await new Promise((resolve) => provider.close(resolve));
  });

  it("is not callable by visitors or signed-in users", async () => {
    const user = await createUser("ai-guard");
    const args = { p_user_id: user.userId, p_kind: "advisor", p_daily_per_user: 50, p_daily_global: 10000 };
    expect((await rpc(null, "reserve_ai_call", args)).status).toBeGreaterThanOrEqual(400);
    expect((await rpc(user.token, "reserve_ai_call", args)).status).toBeGreaterThanOrEqual(400);
    expect((await rest(user.token, "ai_usage?select=id")).status).toBeGreaterThanOrEqual(400);
  });

  it("grants exactly one of four parallel reservations when the per-user limit is 1", async () => {
    const user = await createUser("ai-user-limit");
    const results = await Promise.all(
      Array.from({ length: 4 }, () =>
        serviceRpc("reserve_ai_call", { p_user_id: user.userId, p_kind: "advisor", p_daily_per_user: 1, p_daily_global: 10000 }),
      ),
    );
    expect(results.every((result) => result.status === 200)).toBe(true);
    expect(results.filter((result) => typeof result.body === "number")).toHaveLength(1);
  });

  it("grants exactly one of four parallel reservations when one global unit is left", async () => {
    const users = await Promise.all(Array.from({ length: 4 }, (_, index) => createUser(`ai-global-${index}`)));
    const globalLimit = (await usedToday()) + 1;
    const results = await Promise.all(
      users.map((user) =>
        serviceRpc("reserve_ai_call", { p_user_id: user.userId, p_kind: "advisor", p_daily_per_user: 50, p_daily_global: globalLimit }),
      ),
    );
    expect(results.filter((result) => typeof result.body === "number")).toHaveLength(1);
  });

  it("finishes a reservation once and never resets it to unused", async () => {
    const user = await createUser("ai-finish");
    const reserved = await serviceRpc("reserve_ai_call", { p_user_id: user.userId, p_kind: "advisor", p_daily_per_user: 5, p_daily_global: 10000 });
    const id = reserved.body as number;
    expect((await serviceRpc("finish_ai_call", { p_id: id, p_outcome: "timeout", p_input_tokens: 10, p_output_tokens: 0 })).body).toBe(true);
    expect((await serviceRpc("finish_ai_call", { p_id: id, p_outcome: "ok", p_input_tokens: 0, p_output_tokens: 0 })).body).toBe(false);
    expect((await serviceRpc("finish_ai_call", { p_id: id, p_outcome: "reserved", p_input_tokens: 0, p_output_tokens: 0 })).status).toBe(400);
    const rows = await admin(`/rest/v1/ai_usage?id=eq.${id}&select=outcome,input_tokens`);
    expect(rows).toEqual([{ outcome: "timeout", input_tokens: 10 }]);
  });

  it("calls the provider once for four parallel advisor requests with a per-user limit of 1", async () => {
    vi.stubEnv("AI_BASE_URL", `http://127.0.0.1:${(provider.address() as AddressInfo).port}`);
    vi.stubEnv("AI_API_KEY", "test-key");
    vi.stubEnv("AI_MODEL", "mock");
    vi.stubEnv("AI_DAILY_GLOBAL_LIMIT", "10000");
    vi.stubEnv("AI_DAILY_LIMIT_PER_USER", "1");
    providerCalls = 0;
    const user = await createUser("ai-advisor");

    const results = await Promise.all(Array.from({ length: 4 }, () => adviseWithAi(emptyProfile(), user.userId)));

    expect(providerCalls).toBe(1);
    expect(results.filter((result) => result.source === "ai")).toHaveLength(1);
    const refused = results.filter((result) => result.source !== "ai");
    expect(refused).toHaveLength(3);
    for (const result of refused) expect(result.notice).toMatch(/лимит/u);

    const rows = await admin(`/rest/v1/ai_usage?user_id=eq.${user.userId}&select=outcome,input_tokens,output_tokens,finished_at`);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ outcome: "ok", input_tokens: 321, output_tokens: 54 });
    expect(rows[0].finished_at).not.toBeNull();
  });
});
