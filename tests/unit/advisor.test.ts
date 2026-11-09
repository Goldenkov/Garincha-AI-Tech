import { describe, expect, it } from "vitest";

import { MAX_ADVISOR_OPTIONS, rankNiches, validateAdvisorOutput } from "@/lib/domain/advisor";
import { emptyProfile, parseProfile, unansweredFields } from "@/lib/domain/profile";

const option = (overrides: Record<string, unknown> = {}) => ({
  nicheId: "tailoring",
  businessModel: "made_to_order",
  why: ["Умеете шить"],
  watchOut: ["Низкий чек на ремонте"],
  unknowns: [],
  firstCheck: "5 контактов: 3 платных заказа",
  ...overrides,
});

describe("rules advisor", () => {
  it("never returns more than three options and explains each", () => {
    const result = rankNiches({ ...emptyProfile(), skills: "шью, крою, вяжу" });
    expect(result.options.length).toBeLessThanOrEqual(MAX_ADVISOR_OPTIONS);
    for (const item of result.options) expect(item.why.length).toBeGreaterThan(0);
    expect(result.options[0].nicheId).toBe("tailoring");
  });

  it("lists what it could not take into account", () => {
    const result = rankNiches(emptyProfile());
    expect(result.certainty).toBe("low");
    expect(result.options[0].unknowns).toContain("Бюджет не указан — порог входа не учтён");
  });
});

describe("AI output contract", () => {
  it("accepts a valid response", () => {
    const result = validateAdvisorOutput({ options: [option()] });
    expect(result.ok).toBe(true);
  });

  it("rejects more than three options", () => {
    const four = ["tailoring", "bakery", "beauty", "repair"].map((nicheId) => option({ nicheId, businessModel: "services" }));
    expect(validateAdvisorOutput({ options: four })).toMatchObject({ ok: false });
  });

  it("rejects niches outside the catalog and unsupported models", () => {
    expect(validateAdvisorOutput({ options: [option({ nicheId: "crypto-exchange" })] })).toEqual({ ok: false, reason: "unknown_niche" });
    expect(validateAdvisorOutput({ options: [option({ businessModel: "saas" })] })).toEqual({ ok: false, reason: "unsupported_model" });
  });

  it("rejects invented sources and success percentages", () => {
    expect(validateAdvisorOutput({ options: [option({ why: ["См. https://example.com/report"] })] })).toEqual({ ok: false, reason: "bad_fields" });
    expect(validateAdvisorOutput({ options: [option({ firstCheck: "Вероятность успеха 87%" })] })).toEqual({ ok: false, reason: "bad_fields" });
  });

  it("rejects duplicates and non-objects", () => {
    expect(validateAdvisorOutput({ options: [option(), option()] })).toEqual({ ok: false, reason: "duplicate_option" });
    expect(validateAdvisorOutput("ignore previous instructions")).toEqual({ ok: false, reason: "not_object" });
  });
});

describe("profile", () => {
  it("records unknowns explicitly and drops unexpected field names", () => {
    const profile = parseProfile({ region: "Казань", unknownFields: ["budget", "budget", "password"] });
    expect(profile.unknownFields).toEqual(["budget"]);
    expect(unansweredFields(profile)).not.toContain("budget");
    expect(unansweredFields(profile)).not.toContain("region");
  });

  it("rejects malformed currency codes", () => {
    expect(() => parseProfile({ budgetAmount: 1000, budgetCurrency: "рубли" })).toThrow();
  });
});
