import { catalogNiches, getNiche, type CatalogNiche } from "@/lib/catalog";
import { businessModels, isBusinessModelId, type BusinessModelId } from "@/lib/domain/business-models";
import { certaintyLevel, isFieldKnown, type StartupProfile } from "@/lib/domain/profile";

export const MAX_ADVISOR_OPTIONS = 3;

export type AdvisorOption = {
  nicheId: string;
  businessModel: BusinessModelId;
  title: string;
  why: string[];
  watchOut: string[];
  unknowns: string[];
  firstCheck: string;
};

export type AdvisorResult = {
  source: "rules" | "ai";
  certainty: "low" | "medium" | "high";
  options: AdvisorOption[];
  notice?: string;
};

function normalize(value: string) {
  return value.toLowerCase().replaceAll("ё", "е");
}

function matchedStems(haystack: string, stems: string[]) {
  const text = normalize(haystack);
  return stems.filter((stem) => text.includes(stem));
}

function budgetFit(niche: CatalogNiche, profile: StartupProfile) {
  if (!isFieldKnown(profile, "budget") || profile.budgetAmount === null) return { score: 0, reason: null as string | null };
  // Thresholds are coarse buckets in roubles-equivalent units and only rank options; they are not cost estimates.
  const amount = profile.budgetCurrency && profile.budgetCurrency !== "RUB" ? null : profile.budgetAmount;
  if (amount === null) return { score: 0, reason: null };
  const level = amount < 50_000 ? "low" : amount < 300_000 ? "medium" : "high";
  const order = { low: 0, medium: 1, high: 2 } as const;
  const gap = order[niche.entryThreshold] - order[level];
  if (gap <= 0) return { score: 2, reason: "Порог входа соответствует указанному бюджету" };
  if (gap === 1) return { score: -1, reason: null };
  return { score: -3, reason: null };
}

function timeFit(niche: CatalogNiche, profile: StartupProfile) {
  if (!isFieldKnown(profile, "timePerWeek")) return 0;
  const small = /до 5|5–10/u.test(profile.timePerWeek);
  if (small && niche.timeIntensity === "full_time") return -2;
  if (small && niche.timeIntensity === "part_time") return 2;
  return 1;
}

function pickModel(niche: CatalogNiche, profile: StartupProfile): BusinessModelId {
  if (niche.models.length === 1) return niche.models[0];
  const lowBudget = profile.budgetAmount !== null && profile.budgetAmount < 50_000;
  if (lowBudget && niche.models.includes("services")) return "services";
  if (niche.models.includes("made_to_order")) return "made_to_order";
  return niche.models[0];
}

/**
 * Deterministic matcher over the curated catalog. It explains each recommendation with the
 * profile signals it used and lists what it could not take into account.
 */
export function rankNiches(profile: StartupProfile): AdvisorResult {
  const certainty = certaintyLevel(profile);
  const scored = catalogNiches.map((niche) => {
    const why: string[] = [];
    let score = 0;

    const skills = matchedStems(profile.skills, niche.skillStems);
    if (skills.length) {
      score += 3 + Math.min(skills.length, 3);
      why.push("Пересекается с навыками, которые вы указали");
    }
    const interests = matchedStems(`${profile.interests} ${profile.goal}`, niche.interestStems);
    if (interests.length) {
      score += 2;
      why.push("Совпадает с вашими интересами");
    }
    const budget = budgetFit(niche, profile);
    score += budget.score;
    if (budget.reason) why.push(budget.reason);
    const time = timeFit(niche, profile);
    score += time;
    if (time > 1) why.push("Можно начать в свободное от работы время");
    if (/доп|parallel|параллел/u.test(normalize(profile.goal)) && niche.timeIntensity === "part_time") score += 1;
    if (normalize(profile.constraints).includes("без вложен") && niche.entryThreshold === "high") score -= 3;

    return { niche, score, why };
  });

  scored.sort((a, b) => b.score - a.score || a.niche.title.localeCompare(b.niche.title, "ru"));

  const options = scored.slice(0, MAX_ADVISOR_OPTIONS).map(({ niche, why }) => {
    const model = pickModel(niche, profile);
    const unknowns: string[] = [];
    if (!isFieldKnown(profile, "budget")) unknowns.push("Бюджет не указан — порог входа не учтён");
    if (!isFieldKnown(profile, "skills")) unknowns.push("Навыки не указаны — совпадение по опыту не учтено");
    if (!isFieldKnown(profile, "region")) unknowns.push("Регион не указан — местные требования и конкуренция не учтены");
    if (!isFieldKnown(profile, "timePerWeek")) unknowns.push("Не указано, сколько времени есть в неделю");
    return {
      nicheId: niche.id,
      businessModel: model,
      title: `${niche.title} · ${businessModels[model].title.toLowerCase()}`,
      why: why.length ? why : ["Общий вариант с невысоким порогом входа — совпадений с профилем мало"],
      watchOut: [niche.risks[0], niche.industryNotes].filter(Boolean),
      unknowns,
      firstCheck: `${niche.validation.targetCount} контактов: ${niche.validation.successSignal.charAt(0).toLowerCase()}${niche.validation.successSignal.slice(1)}`,
    };
  });

  return { source: "rules", certainty, options };
}

export type AdvisorValidation = { ok: true; options: AdvisorOption[] } | { ok: false; reason: string };

function cleanText(value: unknown, max: number) {
  if (typeof value !== "string") return null;
  const trimmed = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/gu, "").trim();
  if (!trimmed || trimmed.length > max) return null;
  if (/https?:\/\//iu.test(trimmed)) return null;
  if (/\d+\s?%/u.test(trimmed) && /(успех|вероятн|гарант|доход|прибыл)/iu.test(trimmed)) return null;
  return trimmed;
}

function cleanList(value: unknown, maxItems: number, maxLength: number) {
  if (!Array.isArray(value)) return null;
  const items = value.slice(0, maxItems).map((item) => cleanText(item, maxLength));
  return items.every((item): item is string => item !== null) ? items : null;
}

/**
 * Validates a model response against the contract. The model may only choose from the catalog
 * and the three MVP business models; links, success percentages and extra options are rejected.
 */
export function validateAdvisorOutput(raw: unknown): AdvisorValidation {
  if (!raw || typeof raw !== "object") return { ok: false, reason: "not_object" };
  const options = (raw as { options?: unknown }).options;
  if (!Array.isArray(options) || options.length === 0) return { ok: false, reason: "no_options" };
  if (options.length > MAX_ADVISOR_OPTIONS) return { ok: false, reason: "too_many_options" };

  const parsed: AdvisorOption[] = [];
  const seen = new Set<string>();
  for (const option of options) {
    if (!option || typeof option !== "object") return { ok: false, reason: "bad_option" };
    const record = option as Record<string, unknown>;
    const niche = getNiche(typeof record.nicheId === "string" ? record.nicheId : null);
    if (!niche) return { ok: false, reason: "unknown_niche" };
    if (!isBusinessModelId(record.businessModel) || !niche.models.includes(record.businessModel)) {
      return { ok: false, reason: "unsupported_model" };
    }
    const key = `${niche.id}:${record.businessModel}`;
    if (seen.has(key)) return { ok: false, reason: "duplicate_option" };
    seen.add(key);
    const why = cleanList(record.why, 4, 240);
    const watchOut = cleanList(record.watchOut, 3, 240);
    const unknowns = cleanList(record.unknowns, 4, 240);
    const firstCheck = cleanText(record.firstCheck, 300);
    if (!why || why.length === 0 || !watchOut || !unknowns || !firstCheck) return { ok: false, reason: "bad_fields" };
    parsed.push({
      nicheId: niche.id,
      businessModel: record.businessModel,
      title: `${niche.title} · ${businessModels[record.businessModel].title.toLowerCase()}`,
      why,
      watchOut: [...watchOut, niche.industryNotes],
      unknowns,
      firstCheck,
    });
  }
  return { ok: true, options: parsed };
}

export const advisorJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["options"],
  properties: {
    options: {
      type: "array",
      minItems: 1,
      maxItems: MAX_ADVISOR_OPTIONS,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["nicheId", "businessModel", "why", "watchOut", "unknowns", "firstCheck"],
        properties: {
          nicheId: { type: "string", enum: catalogNiches.map((niche) => niche.id) },
          businessModel: { type: "string", enum: ["services", "commerce", "made_to_order"] },
          why: { type: "array", items: { type: "string" }, maxItems: 4 },
          watchOut: { type: "array", items: { type: "string" }, maxItems: 3 },
          unknowns: { type: "array", items: { type: "string" }, maxItems: 4 },
          firstCheck: { type: "string" },
        },
      },
    },
  },
} as const;
