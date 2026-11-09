import { stepDefinitions, type StepDefinition } from "@/lib/steps";

export type StepView = {
  step: StepDefinition;
  state: "completed" | "in_progress" | "needs_revision" | "available" | "locked_hypothesis" | "locked_pro";
  requiresReview: boolean;
  reviewReason: string | null;
};

type Input = {
  entryMode: string;
  hasApprovedHypothesis: boolean;
  hasPro: boolean;
  progress: { stepId: string; status: string; requiresReview: boolean; reviewReason: string | null }[];
};

/** Mirrors the database gate (public._step_gate) for display; the database remains authoritative. */
export function stepViews({ entryMode, hasApprovedHypothesis, hasPro, progress }: Input): StepView[] {
  return stepDefinitions.map((step) => {
    const row = progress.find((item) => item.stepId === step.id);
    const base = { step, requiresReview: Boolean(row?.requiresReview), reviewReason: row?.reviewReason ?? null };
    if (!hasApprovedHypothesis && entryMode !== "existing_business") return { ...base, state: "locked_hypothesis" };
    if (step.requiresPro && !hasPro) return { ...base, state: "locked_pro" };
    if (row?.status === "completed") return { ...base, state: "completed" };
    if (row?.status === "needs_revision") return { ...base, state: "needs_revision" };
    if (row?.status === "active" || row?.status === "submitted") return { ...base, state: "in_progress" };
    return { ...base, state: "available" };
  });
}

export function nextStep(views: StepView[]) {
  return views.find((view) => view.requiresReview && view.state !== "locked_pro" && view.state !== "locked_hypothesis")
    ?? views.find((view) => view.state === "needs_revision" || view.state === "in_progress" || view.state === "available")
    ?? null;
}

export const stepStateLabels: Record<StepView["state"], string> = {
  completed: "Готово",
  in_progress: "В работе",
  needs_revision: "Нужно дополнить",
  available: "Доступно",
  locked_hypothesis: "После подтверждения гипотезы",
  locked_pro: "PRO",
};
