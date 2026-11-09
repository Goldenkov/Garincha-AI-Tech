import "server-only";

import type { BusinessModelId } from "@/lib/domain/business-models";
import {
  emptyValidationPlan,
  type EvidenceItem,
  type Hypothesis,
  type HypothesisFields,
  type HypothesisStatus,
  type ValidationPlan,
} from "@/lib/domain/hypothesis";
import type { ProfileFieldId, StartupProfile } from "@/lib/domain/profile";
import { rpcAsUser, selectAsUser } from "@/lib/server/supabase";

export type EntryMode = "own_idea" | "catalog" | "advisor" | "existing_business";

export type StartupSummary = {
  id: string;
  title: string;
  entryMode: EntryMode;
  nicheId: string | null;
  businessModel: BusinessModelId | null;
  status: "active" | "archived";
  createdAt: string;
  updatedAt: string;
};

export type StepProgress = {
  stepId: string;
  status: "locked" | "active" | "submitted" | "needs_revision" | "completed";
  hypothesisVersion: number | null;
  requiresReview: boolean;
  reviewReason: string | null;
  missingFields: string[];
  confirmedAt: string | null;
  updatedAt: string;
};

export type Artifact = {
  id: string;
  stepId: string;
  content: { fields?: Record<string, string | number>; checklist?: string[] };
  revision: number;
  hypothesisVersion: number | null;
  reviewStatus: "current" | "requires_review";
  updatedAt: string;
};

export type ProjectBundle = {
  startup: StartupSummary;
  profile: StartupProfile | null;
  hypotheses: Hypothesis[];
  current: Hypothesis | null;
  approved: Hypothesis | null;
  open: Hypothesis | null;
  progress: StepProgress[];
  artifacts: Artifact[];
};

type StartupRow = {
  id: string;
  title: string;
  entry_mode: EntryMode;
  niche_id: string | null;
  business_model: BusinessModelId | null;
  status: "active" | "archived";
  created_at: string;
  updated_at: string;
};

type ProfileRow = {
  budget_amount: number | string | null;
  budget_currency: string | null;
  region: string;
  skills: string;
  time_per_week: string;
  interests: string;
  constraints: string;
  goal: string;
  unknown_fields: string[];
  confirmed_at: string | null;
};

export type HypothesisRow = {
  id: string;
  startup_id: string;
  version: number;
  status: HypothesisStatus;
  based_on_version: number | null;
  idea_text: string;
  niche_id: string | null;
  business_model: BusinessModelId | null;
  target_customer: string;
  customer_problem: string;
  proposed_value: string;
  revenue_model: string;
  startup_budget_amount: number | string | null;
  startup_budget_currency: string | null;
  constraints: string;
  industry_notes: string;
  key_assumptions: unknown;
  key_risks: unknown;
  market_evidence: unknown;
  validation_plan: unknown;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
};

type ProgressRow = {
  step_id: string;
  status: StepProgress["status"];
  hypothesis_version: number | null;
  requires_review: boolean;
  review_reason: string | null;
  missing_fields: string[];
  confirmed_by_user_at: string | null;
  updated_at: string;
};

type ArtifactRow = {
  id: string;
  step_id: string;
  content: Artifact["content"];
  revision: number;
  hypothesis_version: number | null;
  review_status: Artifact["reviewStatus"];
  updated_at: string;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && uuidPattern.test(value);
}

function toStartup(row: StartupRow): StartupSummary {
  return {
    id: row.id,
    title: row.title,
    entryMode: row.entry_mode,
    nicheId: row.niche_id,
    businessModel: row.business_model,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toNumber(value: number | string | null) {
  if (value === null || value === undefined) return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function stringList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function evidenceList(value: unknown): EvidenceItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item) => ({
      kind: item.kind === "fact" || item.kind === "assumption" ? item.kind : "unknown",
      text: String(item.text ?? ""),
      source: String(item.source ?? ""),
      date: String(item.date ?? ""),
      limitation: String(item.limitation ?? ""),
    }));
}

function validationPlan(value: unknown): ValidationPlan {
  if (!value || typeof value !== "object") return emptyValidationPlan();
  const record = value as Record<string, unknown>;
  const num = (input: unknown) => (typeof input === "number" && Number.isFinite(input) ? input : null);
  return {
    method: (typeof record.method === "string" ? record.method : "") as ValidationPlan["method"],
    audience: String(record.audience ?? ""),
    targetCount: num(record.targetCount),
    deadlineDays: num(record.deadlineDays),
    successSignal: String(record.successSignal ?? ""),
    stopSignal: String(record.stopSignal ?? ""),
  };
}

export function toHypothesis(row: HypothesisRow): Hypothesis {
  return {
    id: row.id,
    startupId: row.startup_id,
    version: row.version,
    basedOnVersion: row.based_on_version,
    status: row.status,
    approvedAt: row.approved_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ideaText: row.idea_text,
    nicheId: row.niche_id,
    businessModel: row.business_model,
    targetCustomer: row.target_customer,
    customerProblem: row.customer_problem,
    proposedValue: row.proposed_value,
    revenueModel: row.revenue_model,
    budget: { amount: toNumber(row.startup_budget_amount), currency: row.startup_budget_currency },
    constraints: row.constraints,
    industryNotes: row.industry_notes,
    keyAssumptions: stringList(row.key_assumptions),
    keyRisks: stringList(row.key_risks),
    marketEvidence: evidenceList(row.market_evidence),
    validationPlan: validationPlan(row.validation_plan),
  };
}

function toProfile(row: ProfileRow): StartupProfile {
  return {
    budgetAmount: toNumber(row.budget_amount),
    budgetCurrency: row.budget_currency,
    region: row.region,
    skills: row.skills,
    timePerWeek: row.time_per_week,
    interests: row.interests,
    constraints: row.constraints,
    goal: row.goal,
    unknownFields: row.unknown_fields as ProfileFieldId[],
    confirmed: Boolean(row.confirmed_at),
  };
}

export function hypothesisToDbFields(fields: Partial<HypothesisFields>) {
  return fields;
}

export async function listStartups(accessToken: string) {
  const rows = await selectAsUser<StartupRow[]>(
    accessToken,
    "startups?select=id,title,entry_mode,niche_id,business_model,status,created_at,updated_at&status=eq.active&order=updated_at.desc",
  );
  return rows.map(toStartup);
}

export async function latestConfirmedProfile(accessToken: string): Promise<StartupProfile | null> {
  const rows = await selectAsUser<ProfileRow[]>(
    accessToken,
    "startup_profiles?select=budget_amount,budget_currency,region,skills,time_per_week,interests,constraints,goal,unknown_fields,confirmed_at&confirmed_at=not.is.null&order=updated_at.desc&limit=1",
  );
  return rows[0] ? toProfile(rows[0]) : null;
}

/**
 * Loads a project the viewer owns. Row level security returns nothing for someone else's id,
 * which callers turn into a 404 — the same answer as for an id that does not exist.
 */
export async function getProject(accessToken: string, startupId: string): Promise<ProjectBundle | null> {
  if (!isUuid(startupId)) return null;
  const id = encodeURIComponent(startupId);
  const [startups, profiles, hypotheses, progress, artifacts] = await Promise.all([
    selectAsUser<StartupRow[]>(accessToken, `startups?select=id,title,entry_mode,niche_id,business_model,status,created_at,updated_at&id=eq.${id}&status=eq.active`),
    selectAsUser<ProfileRow[]>(accessToken, `startup_profiles?select=budget_amount,budget_currency,region,skills,time_per_week,interests,constraints,goal,unknown_fields,confirmed_at&startup_id=eq.${id}`),
    selectAsUser<HypothesisRow[]>(accessToken, `startup_hypotheses?select=*&startup_id=eq.${id}&order=version.desc`),
    selectAsUser<ProgressRow[]>(accessToken, `startup_step_progress?select=step_id,status,hypothesis_version,requires_review,review_reason,missing_fields,confirmed_by_user_at,updated_at&startup_id=eq.${id}`),
    selectAsUser<ArtifactRow[]>(accessToken, `startup_artifacts?select=id,step_id,content,revision,hypothesis_version,review_status,updated_at&startup_id=eq.${id}`),
  ]);
  if (!startups[0]) return null;
  const list = hypotheses.map(toHypothesis);
  const approved = list.find((item) => item.status === "approved_by_user") ?? null;
  const open = list.find((item) => item.status === "draft" || item.status === "awaiting_confirmation") ?? null;
  return {
    startup: toStartup(startups[0]),
    profile: profiles[0] ? toProfile(profiles[0]) : null,
    hypotheses: list,
    approved,
    open,
    current: open ?? approved,
    progress: progress.map((row) => ({
      stepId: row.step_id,
      status: row.status,
      hypothesisVersion: row.hypothesis_version,
      requiresReview: row.requires_review,
      reviewReason: row.review_reason,
      missingFields: row.missing_fields,
      confirmedAt: row.confirmed_by_user_at,
      updatedAt: row.updated_at,
    })),
    artifacts: artifacts.map((row) => ({
      id: row.id,
      stepId: row.step_id,
      content: row.content ?? {},
      revision: row.revision,
      hypothesisVersion: row.hypothesis_version,
      reviewStatus: row.review_status,
      updatedAt: row.updated_at,
    })),
  };
}

export async function getProStatus(accessToken: string) {
  const result = await rpcAsUser<{ active: boolean; expires_at: string | null }>(accessToken, "my_pro_status", {});
  return { active: Boolean(result?.active), expiresAt: result?.expires_at ?? null };
}

export function createStartup(
  accessToken: string,
  input: { title: string; entryMode: EntryMode; profile: StartupProfile; hypothesis: Partial<HypothesisFields> },
) {
  return rpcAsUser<string>(accessToken, "create_startup", {
    p_title: input.title,
    p_entry_mode: input.entryMode,
    p_profile: input.profile,
    p_hypothesis: input.hypothesis,
  });
}

export async function saveHypothesisDraft(
  accessToken: string,
  startupId: string,
  patch: Partial<HypothesisFields>,
  expectedUpdatedAt: string | null,
) {
  const row = await rpcAsUser<HypothesisRow>(accessToken, "save_hypothesis_draft", {
    p_startup_id: startupId,
    p_fields: patch,
    p_expected_updated_at: expectedUpdatedAt,
  });
  return toHypothesis(row);
}

export function requestConfirmation(accessToken: string, hypothesisId: string) {
  return rpcAsUser<string[]>(accessToken, "request_hypothesis_confirmation", { p_hypothesis_id: hypothesisId });
}

export function approveHypothesis(accessToken: string, hypothesisId: string) {
  return rpcAsUser<{ version: number; change: string; flagged_artifacts: number }>(accessToken, "approve_hypothesis", {
    p_hypothesis_id: hypothesisId,
  });
}

export function discardRevision(accessToken: string, startupId: string) {
  return rpcAsUser<null>(accessToken, "discard_hypothesis_revision", { p_startup_id: startupId });
}

export function updateProfile(accessToken: string, startupId: string, profile: StartupProfile) {
  return rpcAsUser<null>(accessToken, "update_startup_profile", { p_startup_id: startupId, p_profile: profile });
}

export function saveStepResult(
  accessToken: string,
  startupId: string,
  stepId: string,
  content: Artifact["content"],
  expectedRevision: number | null,
) {
  return rpcAsUser<ArtifactRow>(accessToken, "save_step_result", {
    p_startup_id: startupId,
    p_step_id: stepId,
    p_content: content,
    p_expected_revision: expectedRevision,
  });
}

export function completeStep(accessToken: string, startupId: string, stepId: string) {
  return rpcAsUser<{ status: "completed" | "needs_revision"; missing: string[] }>(accessToken, "complete_step", {
    p_startup_id: startupId,
    p_step_id: stepId,
  });
}

export function archiveStartup(accessToken: string, startupId: string) {
  return rpcAsUser<null>(accessToken, "archive_startup", { p_startup_id: startupId });
}

export function renameStartup(accessToken: string, startupId: string, title: string) {
  return rpcAsUser<null>(accessToken, "rename_startup", { p_startup_id: startupId, p_title: title });
}

export function redeemAccessCode(accessToken: string, code: string) {
  return rpcAsUser<{ status: "granted" | "already_redeemed"; expires_at: string | null }>(accessToken, "redeem_access_code", {
    p_code: code,
  });
}
