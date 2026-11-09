import { beforeEach, describe, expect, it, vi } from "vitest";

import { emptyProfile } from "@/lib/domain/profile";
import { adviseWithAi } from "@/lib/server/ai-advisor";

const userId = "7d3f0b2e-58a1-4c3e-9a51-0c2b9a4f6e11";
const answer = {
  options: [{ nicheId: "tailoring", businessModel: "made_to_order", why: ["Умеете шить"], watchOut: [], unknowns: [], firstCheck: "Пять разговоров" }],
};

type Route = (url: string, init?: RequestInit) => Response | Promise<Response>;

function routeFetch(routes: { reserve?: Route; finish?: Route; provider?: Route }) {
  const calls: string[] = [];
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const target = String(input);
    if (target.endsWith("/rpc/reserve_ai_call")) {
      calls.push("reserve");
      return routes.reserve!(target, init);
    }
    if (target.endsWith("/rpc/finish_ai_call")) {
      calls.push("finish");
      return routes.finish!(target, init);
    }
    calls.push("provider");
    return routes.provider!(target, init);
  });
  vi.stubGlobal("fetch", fetchMock);
  return calls;
}

const ok = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } });
const providerAnswer = () => ok({ choices: [{ message: { content: JSON.stringify(answer) } }], usage: { prompt_tokens: 10, completion_tokens: 5 } });

describe("AI advisor accounting", () => {
  beforeEach(() => {
    vi.stubEnv("SUPABASE_URL", "http://db.test");
    vi.stubEnv("SUPABASE_ANON_KEY", "anon");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service");
    vi.stubEnv("AI_BASE_URL", "http://ai.test/v1");
    vi.stubEnv("AI_API_KEY", "key");
    vi.stubEnv("AI_MODEL", "mock");
    vi.stubEnv("AI_DAILY_GLOBAL_LIMIT", "10");
  });

  it("does not call the provider when the quota cannot be reserved", async () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    const calls = routeFetch({ reserve: () => Promise.reject(new TypeError("fetch failed")), provider: providerAnswer });
    const result = await adviseWithAi(emptyProfile(), userId);
    expect(calls).toEqual(["reserve"]);
    expect(result.source).not.toBe("ai");
    expect(result.notice).toMatch(/временно недоступен/u);
    expect(errors.mock.calls.flat().join(" ")).not.toContain(userId);
  });

  it("does not call the provider when the budget is used up", async () => {
    const calls = routeFetch({ reserve: () => ok(null), provider: providerAnswer });
    const result = await adviseWithAi(emptyProfile(), userId);
    expect(calls).toEqual(["reserve"]);
    expect(result.notice).toMatch(/лимит/u);
  });

  it("keeps the answer when finalising the usage fails, and logs nothing about the user", async () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    const calls = routeFetch({ reserve: () => ok(41), provider: providerAnswer, finish: () => new Response("{}", { status: 503 }) });
    const result = await adviseWithAi(emptyProfile(), userId);
    expect(calls).toEqual(["reserve", "provider", "finish"]);
    expect(result.source).toBe("ai");
    expect(errors).toHaveBeenCalledWith("[ai] usage finalisation failed; the reservation stays counted");
    expect(errors.mock.calls.flat().join(" ")).not.toContain(userId);
  });

  it("records the outcome of a failed provider call against the reservation", async () => {
    let finished: unknown = null;
    routeFetch({
      reserve: () => ok(42),
      provider: () => new Response("upstream", { status: 502 }),
      finish: (_url, init) => {
        finished = JSON.parse(String(init?.body));
        return ok(true);
      },
    });
    const result = await adviseWithAi(emptyProfile(), userId);
    expect(result.source).not.toBe("ai");
    expect(finished).toMatchObject({ p_id: 42, p_outcome: "provider_error" });
  });
});
