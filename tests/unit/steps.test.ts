import { describe, expect, it } from "vitest";

import { nextStep, stepViews } from "@/lib/domain/journey-state";
import { demandCheckStep, missingStepFields, parseStepValues, stepCompletionProblems, StepInputError, stepDefinitions } from "@/lib/steps";

describe("step gate", () => {
  const base = { entryMode: "own_idea", hasPro: false, progress: [] };

  it("locks every step until the hypothesis is approved", () => {
    const views = stepViews({ ...base, hasApprovedHypothesis: false });
    expect(views.every((view) => view.state === "locked_hypothesis")).toBe(true);
    expect(nextStep(views)).toBeNull();
  });

  it("after approval opens the free steps and keeps PRO steps locked", () => {
    const views = stepViews({ ...base, hasApprovedHypothesis: true });
    expect(views[0]).toMatchObject({ state: "available" });
    expect(views[0].step.id).toBe("demand-check");
    const free = views.filter((view) => !view.step.requiresPro).map((view) => view.step.id);
    expect(free).toEqual(["demand-check", "business-recon"]);
    expect(views.filter((view) => view.step.requiresPro).every((view) => view.state === "locked_pro")).toBe(true);
  });

  it("an existing business skips the hypothesis gate", () => {
    const views = stepViews({ ...base, entryMode: "existing_business", hasApprovedHypothesis: false });
    expect(views[0].state).toBe("available");
  });

  it("results flagged for review come first", () => {
    const views = stepViews({
      ...base,
      hasApprovedHypothesis: true,
      progress: [
        { stepId: "demand-check", status: "completed", requiresReview: true, reviewReason: "Гипотеза изменилась" },
      ],
    });
    expect(nextStep(views)?.step.id).toBe("demand-check");
  });

  it("has unique step ids", () => {
    const ids = stepDefinitions.map((step) => step.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("step values", () => {
  it("parses numbers and validates choices", () => {
    const values = parseStepValues(demandCheckStep, { method: "interviews", plannedCount: "5", conductedCount: 3, ignored: "x" });
    expect(values).toEqual({ method: "interviews", plannedCount: 5, conductedCount: 3 });
    expect(() => parseStepValues(demandCheckStep, { method: "guessing" })).toThrow(StepInputError);
    expect(() => parseStepValues(demandCheckStep, { plannedCount: "-1" })).toThrow(StepInputError);
  });

  it("reports missing required fields", () => {
    expect(missingStepFields(demandCheckStep, { method: "interviews" })).toEqual(["plannedCount", "conductedCount", "signals", "decision"]);
  });

  it("a demand check with zero conversations is not complete", () => {
    expect(stepCompletionProblems(demandCheckStep, { conductedCount: 0 })).toHaveLength(1);
    expect(stepCompletionProblems(demandCheckStep, { conductedCount: 2 })).toHaveLength(0);
  });
});
