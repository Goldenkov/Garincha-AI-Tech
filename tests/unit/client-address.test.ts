import { beforeEach, describe, expect, it, vi } from "vitest";

import { clientAddress, clientKey, normaliseAddress, resetRateLimits } from "@/lib/server/rate-limit";
import { handleSubmission, resetDeliveryLedger } from "@/lib/server/submissions";

const request = (headers: Record<string, string>) => new Request("http://app.test/api/leads", { headers });

describe("client address behind trusted proxies", () => {
  it("ignores forwarding headers when no proxy is trusted", () => {
    expect(clientAddress(request({ "x-forwarded-for": "198.51.100.1" }), 0)).toBeNull();
    expect(clientAddress(request({ "x-real-ip": "198.51.100.1" }), 0)).toBeNull();
  });

  it("takes the entry written by the trusted proxy, not the client-supplied ones", () => {
    expect(clientAddress(request({ "x-forwarded-for": "10.0.0.1, 192.0.2.44, 203.0.113.9" }), 1)).toBe("203.0.113.9");
    expect(clientAddress(request({ "x-forwarded-for": "10.0.0.1, 203.0.113.9, 192.0.2.1" }), 2)).toBe("203.0.113.9");
  });

  it("never reads X-Real-IP", () => {
    expect(clientAddress(request({ "x-real-ip": "198.51.100.1" }), 1)).toBeNull();
  });

  it("rejects short and malformed chains", () => {
    expect(clientAddress(request({ "x-forwarded-for": "203.0.113.9" }), 2)).toBeNull();
    expect(clientAddress(request({ "x-forwarded-for": "not-an-ip" }), 1)).toBeNull();
    expect(clientAddress(request({ "x-forwarded-for": "203.0.113.9:443" }), 1)).toBeNull();
  });

  it("normalises IPv4-mapped IPv6 and groups IPv6 by /64", () => {
    expect(normaliseAddress("::ffff:203.0.113.9")).toBe("203.0.113.9");
    expect(normaliseAddress("2001:db8:1:2:aaaa::1")).toBe(normaliseAddress("2001:0db8:0001:0002:bbbb:cccc:dddd:eeee"));
    expect(normaliseAddress("2001:db8:1:2::1")).not.toBe(normaliseAddress("2001:db8:1:3::1"));
    expect(normaliseAddress("[2001:db8::1]")).toBe("2001:db8:0:0::/64");
    expect(normaliseAddress("fe80::1%eth0")).toBe("fe80:0:0:0::/64");
  });

  it("gives every untrusted request the same key", () => {
    vi.stubEnv("TRUSTED_PROXY_HOPS", "0");
    expect(clientKey(request({ "x-forwarded-for": "198.51.100.1" }))).toBe(clientKey(request({ "x-forwarded-for": "198.51.100.2" })));
  });
});

describe("rate limits cannot be bypassed by spoofing X-Forwarded-For", () => {
  beforeEach(() => {
    resetRateLimits();
    resetDeliveryLedger();
    for (const name of ["SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY", "TELEGRAM_BOT_TOKEN", "TELEGRAM_LEADS_CHAT_ID"]) vi.stubEnv(name, "");
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  const submit = (headers: Record<string, string>) =>
    handleSubmission(
      new Request("http://app.test/api/leads", {
        method: "POST",
        headers: { origin: "http://app.test", host: "app.test", "content-type": "application/json", ...headers },
        body: JSON.stringify({ name: "Анна" }),
      }),
      "leads",
      () => ({ row: {}, title: "t", lines: [] }),
    );

  it.each([
    ["no trusted proxy", "0", (i: number) => ({ "x-forwarded-for": `198.51.100.${i}`, "x-real-ip": `198.51.100.${i}` })],
    ["one trusted proxy", "1", (i: number) => ({ "x-forwarded-for": `198.51.100.${i}, 203.0.113.9`, "x-real-ip": `198.51.100.${i}` })],
  ])("%s", async (_name, hops, headersFor) => {
    vi.stubEnv("TRUSTED_PROXY_HOPS", hops);
    const statuses: number[] = [];
    for (let i = 1; i <= 6; i += 1) statuses.push((await submit(headersFor(i))).status);
    expect(statuses.slice(0, 5).every((status) => status !== 429)).toBe(true);
    expect(statuses[5]).toBe(429);
  });

  it("separates real clients seen by the trusted proxy", async () => {
    vi.stubEnv("TRUSTED_PROXY_HOPS", "1");
    for (let i = 0; i < 5; i += 1) await submit({ "x-forwarded-for": "203.0.113.9" });
    expect((await submit({ "x-forwarded-for": "203.0.113.9" })).status).toBe(429);
    expect((await submit({ "x-forwarded-for": "203.0.113.10" })).status).not.toBe(429);
  });
});
