import { getNiche, isNicheId } from "@/lib/catalog";
import {
  businessModels,
  isBusinessModelId,
  isValidationMethod,
  type BusinessModelId,
  type ValidationMethod,
} from "@/lib/domain/business-models";

export const hypothesisStatuses = ["draft", "awaiting_confirmation", "approved_by_user", "superseded"] as const;
export type HypothesisStatus = (typeof hypothesisStatuses)[number];

export type EvidenceKind = "fact" | "assumption" | "unknown";

export type EvidenceItem = {
  kind: EvidenceKind;
  text: string;
  source: string;
  date: string;
  limitation: string;
};

export type ValidationPlan = {
  method: ValidationMethod | "";
  audience: string;
  targetCount: number | null;
  deadlineDays: number | null;
  successSignal: string;
  stopSignal: string;
};

export type HypothesisFields = {
  ideaText: string;
  nicheId: string | null;
  businessModel: BusinessModelId | null;
  targetCustomer: string;
  customerProblem: string;
  proposedValue: string;
  revenueModel: string;
  budget: { amount: number | null; currency: string | null };
  constraints: string;
  industryNotes: string;
  keyAssumptions: string[];
  keyRisks: string[];
  marketEvidence: EvidenceItem[];
  validationPlan: ValidationPlan;
};

export type Hypothesis = HypothesisFields & {
  id: string;
  startupId: string;
  version: number;
  basedOnVersion: number | null;
  status: HypothesisStatus;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export const fieldLimits = {
  ideaText: 2000,
  short: 1000,
  listItem: 300,
  listItems: 12,
  evidenceText: 500,
} as const;

export const requiredForConfirmation = [
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
] as const;

export type RequiredField = (typeof requiredForConfirmation)[number];

export const requiredFieldLabels: Record<RequiredField, string> = {
  businessModel: "Модель заработка",
  targetCustomer: "Для кого",
  customerProblem: "Какую задачу решаем",
  proposedValue: "Ценность для клиента",
  revenueModel: "Как зарабатываем",
  keyAssumptions: "Хотя бы одно непроверенное предположение",
  "validationPlan.method": "Способ проверки",
  "validationPlan.audience": "Кого спрашиваем",
  "validationPlan.targetCount": "Сколько контактов",
  "validationPlan.successSignal": "Что считаем сигналом",
};

export function emptyValidationPlan(): ValidationPlan {
  return { method: "", audience: "", targetCount: null, deadlineDays: null, successSignal: "", stopSignal: "" };
}

export function emptyHypothesisFields(): HypothesisFields {
  return {
    ideaText: "",
    nicheId: null,
    businessModel: null,
    targetCustomer: "",
    customerProblem: "",
    proposedValue: "",
    revenueModel: "",
    budget: { amount: null, currency: null },
    constraints: "",
    industryNotes: "",
    keyAssumptions: [],
    keyRisks: [],
    marketEvidence: [],
    validationPlan: emptyValidationPlan(),
  };
}

export class InputError extends Error {
  constructor(
    message: string,
    readonly field?: string,
  ) {
    super(message);
    this.name = "InputError";
  }
}

function text(value: unknown, field: string, max: number) {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string") throw new InputError("Ожидался текст.", field);
  const trimmed = value.replace(/\u0000/g, "").trim();
  if (trimmed.length > max) throw new InputError(`Слишком длинный текст (максимум ${max} символов).`, field);
  return trimmed;
}

function textList(value: unknown, field: string) {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) throw new InputError("Ожидался список.", field);
  if (value.length > fieldLimits.listItems) throw new InputError(`Не больше ${fieldLimits.listItems} пунктов.`, field);
  return value
    .map((item, index) => text(item, `${field}.${index}`, fieldLimits.listItem))
    .filter((item) => item.length > 0);
}

function positiveIntOrNull(value: unknown, field: string, max: number) {
  if (value === undefined || value === null || value === "") return null;
  const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed < 1 || parsed > max) {
    throw new InputError(`Укажите целое число от 1 до ${max}.`, field);
  }
  return parsed;
}

export function parseBudget(value: unknown): HypothesisFields["budget"] {
  if (!value || typeof value !== "object") return { amount: null, currency: null };
  const record = value as Record<string, unknown>;
  let amount: number | null = null;
  if (record.amount !== undefined && record.amount !== null && record.amount !== "") {
    const parsed = typeof record.amount === "number" ? record.amount : Number(String(record.amount).replace(/\s/g, "").replace(",", "."));
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1e12) throw new InputError("Некорректная сумма бюджета.", "budget.amount");
    amount = Math.round(parsed * 100) / 100;
  }
  let currency: string | null = null;
  if (typeof record.currency === "string" && record.currency.trim()) {
    currency = record.currency.trim().toUpperCase();
    if (!/^[A-Z]{3}$/u.test(currency)) throw new InputError("Валюта — трёхбуквенный код, например RUB.", "budget.currency");
  }
  return { amount, currency };
}

function parseEvidence(value: unknown): EvidenceItem[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) throw new InputError("Ожидался список.", "marketEvidence");
  if (value.length > fieldLimits.listItems) throw new InputError("Слишком много источников.", "marketEvidence");
  return value
    .map((item, index) => {
      const record = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
      const kind: EvidenceKind = record.kind === "fact" || record.kind === "assumption" ? record.kind : "unknown";
      return {
        kind,
        text: text(record.text, `marketEvidence.${index}.text`, fieldLimits.evidenceText),
        source: text(record.source, `marketEvidence.${index}.source`, fieldLimits.listItem),
        date: text(record.date, `marketEvidence.${index}.date`, 40),
        limitation: text(record.limitation, `marketEvidence.${index}.limitation`, fieldLimits.listItem),
      };
    })
    .filter((item) => item.text.length > 0)
    .map((item) => (item.kind === "fact" && !item.source ? { ...item, kind: "unknown" as const } : item));
}

export function parseValidationPlan(value: unknown): ValidationPlan {
  if (!value || typeof value !== "object") return emptyValidationPlan();
  const record = value as Record<string, unknown>;
  const method = record.method === "" || record.method === undefined || record.method === null ? "" : record.method;
  if (method !== "" && !isValidationMethod(method)) throw new InputError("Неизвестный способ проверки.", "validationPlan.method");
  return {
    method: method as ValidationPlan["method"],
    audience: text(record.audience, "validationPlan.audience", fieldLimits.listItem),
    targetCount: positiveIntOrNull(record.targetCount, "validationPlan.targetCount", 1000),
    deadlineDays: positiveIntOrNull(record.deadlineDays, "validationPlan.deadlineDays", 365),
    successSignal: text(record.successSignal, "validationPlan.successSignal", fieldLimits.listItem),
    stopSignal: text(record.stopSignal, "validationPlan.stopSignal", fieldLimits.listItem),
  };
}

/**
 * Parses untrusted input into a partial patch. Only keys present in the input are returned,
 * so partial saves never blank out other fields.
 */
export function parseHypothesisPatch(input: unknown): Partial<HypothesisFields> {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new InputError("Некорректные данные гипотезы.");
  const record = input as Record<string, unknown>;
  const patch: Partial<HypothesisFields> = {};

  if ("ideaText" in record) patch.ideaText = text(record.ideaText, "ideaText", fieldLimits.ideaText);
  if ("nicheId" in record) {
    if (record.nicheId === null || record.nicheId === "") patch.nicheId = null;
    else if (isNicheId(record.nicheId)) patch.nicheId = record.nicheId;
    else throw new InputError("Неизвестное направление каталога.", "nicheId");
  }
  if ("businessModel" in record) {
    if (record.businessModel === null || record.businessModel === "") patch.businessModel = null;
    else if (isBusinessModelId(record.businessModel)) patch.businessModel = record.businessModel;
    else throw new InputError("Поддерживаются модели: услуги, торговля, производство на заказ.", "businessModel");
  }
  for (const key of ["targetCustomer", "customerProblem", "proposedValue", "revenueModel", "constraints"] as const) {
    if (key in record) patch[key] = text(record[key], key, fieldLimits.short);
  }
  if ("industryNotes" in record) patch.industryNotes = text(record.industryNotes, "industryNotes", fieldLimits.ideaText);
  if ("budget" in record) patch.budget = parseBudget(record.budget);
  if ("keyAssumptions" in record) patch.keyAssumptions = textList(record.keyAssumptions, "keyAssumptions");
  if ("keyRisks" in record) patch.keyRisks = textList(record.keyRisks, "keyRisks");
  if ("marketEvidence" in record) patch.marketEvidence = parseEvidence(record.marketEvidence);
  if ("validationPlan" in record) patch.validationPlan = parseValidationPlan(record.validationPlan);

  return patch;
}

export function missingForConfirmation(fields: HypothesisFields): RequiredField[] {
  const missing: RequiredField[] = [];
  if (!fields.businessModel) missing.push("businessModel");
  if (!fields.targetCustomer.trim()) missing.push("targetCustomer");
  if (!fields.customerProblem.trim()) missing.push("customerProblem");
  if (!fields.proposedValue.trim()) missing.push("proposedValue");
  if (!fields.revenueModel.trim()) missing.push("revenueModel");
  if (fields.keyAssumptions.filter((item) => item.trim()).length === 0) missing.push("keyAssumptions");
  if (!fields.validationPlan.method) missing.push("validationPlan.method");
  if (!fields.validationPlan.audience.trim()) missing.push("validationPlan.audience");
  if (!fields.validationPlan.targetCount || fields.validationPlan.targetCount <= 0) missing.push("validationPlan.targetCount");
  if (!fields.validationPlan.successSignal.trim()) missing.push("validationPlan.successSignal");
  return missing;
}

export type ChangeKind = "initial" | "material" | "validation_plan" | "minor";

/** Mirrors public._hypothesis_change_kind in the database migration. */
export function classifyChange(previous: HypothesisFields | null, next: HypothesisFields): ChangeKind {
  if (!previous) return "initial";
  const same = (a: string, b: string) => a.trim() === b.trim();
  const material =
    previous.businessModel !== next.businessModel ||
    previous.nicheId !== next.nicheId ||
    !same(previous.targetCustomer, next.targetCustomer) ||
    !same(previous.customerProblem, next.customerProblem) ||
    !same(previous.proposedValue, next.proposedValue) ||
    !same(previous.revenueModel, next.revenueModel) ||
    JSON.stringify(previous.keyAssumptions) !== JSON.stringify(next.keyAssumptions);
  if (material) return "material";
  if (JSON.stringify(previous.validationPlan) !== JSON.stringify(next.validationPlan)) return "validation_plan";
  return "minor";
}

export function applyPatch(fields: HypothesisFields, patch: Partial<HypothesisFields>): HypothesisFields {
  return { ...fields, ...patch, budget: patch.budget ?? fields.budget, validationPlan: patch.validationPlan ?? fields.validationPlan };
}

/**
 * Builds a starting point for the hypothesis card from the catalog and the chosen model.
 * Everything produced here is a template the user edits; nothing is presented as researched fact.
 */
export function suggestHypothesis({
  ideaText,
  nicheId,
  businessModel,
  budget,
  constraints,
}: {
  ideaText: string;
  nicheId: string | null;
  businessModel: BusinessModelId | null;
  budget?: HypothesisFields["budget"];
  constraints?: string;
}): HypothesisFields {
  const niche = getNiche(nicheId);
  const model = businessModel ?? niche?.models[0] ?? null;
  const modelInfo = model ? businessModels[model] : null;
  const fields = emptyHypothesisFields();

  fields.ideaText = ideaText.trim();
  fields.nicheId = niche?.id ?? null;
  fields.businessModel = model;
  fields.budget = budget ?? fields.budget;
  fields.constraints = constraints?.trim() ?? "";

  if (niche) {
    fields.targetCustomer = niche.starter.targetCustomer;
    fields.customerProblem = niche.starter.customerProblem;
    fields.proposedValue = niche.starter.proposedValue;
    fields.revenueModel = niche.models.includes(model ?? niche.models[0]) ? niche.starter.revenueModel : modelInfo?.howItEarns ?? "";
    fields.keyAssumptions = [...niche.starter.assumptions];
    fields.keyRisks = [...niche.risks];
    fields.industryNotes = niche.industryNotes;
    fields.validationPlan = {
      method: niche.validation.method,
      audience: niche.validation.audience,
      targetCount: niche.validation.targetCount,
      deadlineDays: 14,
      successSignal: niche.validation.successSignal,
      stopSignal: niche.validation.stopSignal,
    };
  } else if (modelInfo) {
    fields.revenueModel = modelInfo.revenueExamples[0];
    fields.keyAssumptions = [...modelInfo.typicalAssumptions];
    fields.keyRisks = [...modelInfo.typicalRisks];
    fields.industryNotes =
      "Для этой идеи нет отраслевого шаблона в каталоге. Проверьте лицензии, нормы и ограничения своей отрасли и региона самостоятельно.";
    fields.validationPlan = {
      method: modelInfo.defaultValidation.method,
      audience: "",
      targetCount: modelInfo.defaultValidation.targetCount,
      deadlineDays: 14,
      successSignal: modelInfo.defaultValidation.successSignal,
      stopSignal: modelInfo.defaultValidation.stopSignal,
    };
  }

  fields.marketEvidence = [
    {
      kind: "unknown",
      text: "Спрос пока не проверен. Первые данные появятся после проверочного шага.",
      source: "",
      date: "",
      limitation: "",
    },
  ];

  return fields;
}

export function hypothesisTitle(fields: Pick<HypothesisFields, "ideaText" | "nicheId">) {
  const idea = fields.ideaText.trim();
  if (idea) return idea.length > 80 ? `${idea.slice(0, 77)}…` : idea;
  return getNiche(fields.nicheId)?.title ?? "Новая гипотеза";
}
