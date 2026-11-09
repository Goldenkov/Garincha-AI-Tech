import { describe, expect, it } from "vitest";

import { catalogNiches } from "@/lib/catalog";
import { businessModelIds } from "@/lib/domain/business-models";
import {
  applyPatch,
  classifyChange,
  emptyHypothesisFields,
  InputError,
  missingForConfirmation,
  parseHypothesisPatch,
  suggestHypothesis,
} from "@/lib/domain/hypothesis";

const complete = () => suggestHypothesis({ ideaText: "Шкафы в нишу", nicheId: "custom-furniture", businessModel: "made_to_order" });

describe("business models", () => {
  it("supports exactly services, commerce and made_to_order", () => {
    expect([...businessModelIds]).toEqual(["services", "commerce", "made_to_order"]);
  });

  it("every catalog niche uses only supported models", () => {
    for (const niche of catalogNiches) {
      expect(niche.models.length).toBeGreaterThan(0);
      for (const model of niche.models) expect(businessModelIds).toContain(model);
    }
  });

  it("parser rejects any other model", () => {
    expect(() => parseHypothesisPatch({ businessModel: "saas" })).toThrow(InputError);
    expect(() => parseHypothesisPatch({ businessModel: "marketplace" })).toThrow(/услуги, торговля, производство на заказ/u);
  });
});

describe("confirmation requirements", () => {
  it("an empty card lists every required field", () => {
    expect(missingForConfirmation(emptyHypothesisFields())).toEqual([
      "businessModel",
      "targetCustomer",
      "customerProblem",
      "proposedValue",
      "revenueModel",
      "keyAssumptions",
      "validationPlan.method",
      "validationPlan.audience",
      "validationPlan.targetCount",
      "validationPlan.successSignal",
    ]);
  });

  it("a catalog starter is complete enough to confirm", () => {
    expect(missingForConfirmation(complete())).toEqual([]);
  });

  it("whitespace-only answers do not count", () => {
    const fields = applyPatch(complete(), { targetCustomer: "   ", keyAssumptions: [] });
    expect(missingForConfirmation(fields)).toEqual(["targetCustomer", "keyAssumptions"]);
  });

  it("an own idea without a niche keeps customer and problem empty instead of inventing them", () => {
    const fields = suggestHypothesis({ ideaText: "Хочу шить шторы", nicheId: null, businessModel: "made_to_order" });
    expect(fields.targetCustomer).toBe("");
    expect(fields.customerProblem).toBe("");
    expect(missingForConfirmation(fields)).toContain("targetCustomer");
  });
});

describe("change classification after approval", () => {
  it("customer, problem, value, model or assumptions are material", () => {
    const base = complete();
    expect(classifyChange(base, applyPatch(base, { targetCustomer: "Офисы" }))).toBe("material");
    expect(classifyChange(base, applyPatch(base, { businessModel: "services" }))).toBe("material");
    expect(classifyChange(base, applyPatch(base, { keyAssumptions: ["Другое допущение"] }))).toBe("material");
  });

  it("validation plan edits are classified separately", () => {
    const base = complete();
    const next = applyPatch(base, { validationPlan: { ...base.validationPlan, targetCount: 10 } });
    expect(classifyChange(base, next)).toBe("validation_plan");
  });

  it("wording-only edits to non-core fields are minor", () => {
    const base = complete();
    expect(classifyChange(base, applyPatch(base, { keyRisks: [...base.keyRisks, "Сезонность"] }))).toBe("minor");
    expect(classifyChange(base, applyPatch(base, { targetCustomer: `  ${base.targetCustomer}  ` }))).toBe("minor");
  });

  it("first version is initial", () => {
    expect(classifyChange(null, complete())).toBe("initial");
  });
});

describe("patch parsing", () => {
  it("returns only keys present in the input", () => {
    expect(parseHypothesisPatch({ proposedValue: "  Быстрее  " })).toEqual({ proposedValue: "Быстрее" });
  });

  it("rejects oversized text and unknown niches", () => {
    expect(() => parseHypothesisPatch({ targetCustomer: "x".repeat(5000) })).toThrow(InputError);
    expect(() => parseHypothesisPatch({ nicheId: "crypto" })).toThrow(InputError);
  });

  it("a fact without a source is downgraded to unknown", () => {
    const patch = parseHypothesisPatch({ marketEvidence: [{ kind: "fact", text: "Рынок растёт" }] });
    expect(patch.marketEvidence?.[0].kind).toBe("unknown");
  });

  it("validation plan counts must be positive integers", () => {
    expect(() => parseHypothesisPatch({ validationPlan: { method: "interviews", targetCount: 0 } })).toThrow(InputError);
    expect(() => parseHypothesisPatch({ validationPlan: { method: "telepathy" } })).toThrow(InputError);
  });
});
