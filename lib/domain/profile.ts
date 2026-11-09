import { InputError, parseBudget } from "@/lib/domain/hypothesis";

export const profileFieldIds = ["budget", "region", "skills", "timePerWeek", "interests", "constraints", "goal"] as const;
export type ProfileFieldId = (typeof profileFieldIds)[number];

export type StartupProfile = {
  budgetAmount: number | null;
  budgetCurrency: string | null;
  region: string;
  skills: string;
  timePerWeek: string;
  interests: string;
  constraints: string;
  goal: string;
  unknownFields: ProfileFieldId[];
  confirmed: boolean;
};

export const profileFieldLabels: Record<ProfileFieldId, string> = {
  budget: "Стартовый бюджет",
  region: "Регион работы",
  skills: "Навыки и опыт",
  timePerWeek: "Время в неделю",
  interests: "Интересы",
  constraints: "Ограничения",
  goal: "Цель запуска",
};

export const timeOptions = ["до 5 часов", "5–10 часов", "10–20 часов", "20+ часов"] as const;
export const goalOptions = [
  "Дополнительный доход",
  "Основной бизнес",
  "Проверить идею перед увольнением",
  "Пока не знаю",
] as const;
export const currencyOptions = ["RUB", "KZT", "BYN", "USD", "EUR"] as const;

export function emptyProfile(): StartupProfile {
  return {
    budgetAmount: null,
    budgetCurrency: "RUB",
    region: "",
    skills: "",
    timePerWeek: "",
    interests: "",
    constraints: "",
    goal: "",
    unknownFields: [],
    confirmed: false,
  };
}

function text(value: unknown, field: string, max: number) {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string") throw new InputError("Ожидался текст.", field);
  const trimmed = value.trim();
  if (trimmed.length > max) throw new InputError(`Слишком длинный текст (максимум ${max} символов).`, field);
  return trimmed;
}

export function parseProfile(input: unknown): StartupProfile {
  if (!input || typeof input !== "object" || Array.isArray(input)) return emptyProfile();
  const record = input as Record<string, unknown>;
  const budget = parseBudget({ amount: record.budgetAmount, currency: record.budgetCurrency });
  const unknownFields = Array.isArray(record.unknownFields)
    ? record.unknownFields.filter((value): value is ProfileFieldId => (profileFieldIds as readonly string[]).includes(String(value)))
    : [];

  return {
    budgetAmount: budget.amount,
    budgetCurrency: budget.currency,
    region: text(record.region, "region", 200),
    skills: text(record.skills, "skills", 1000),
    timePerWeek: text(record.timePerWeek, "timePerWeek", 100),
    interests: text(record.interests, "interests", 1000),
    constraints: text(record.constraints, "constraints", 1000),
    goal: text(record.goal, "goal", 500),
    unknownFields: [...new Set(unknownFields)],
    confirmed: record.confirmed === true,
  };
}

export function isFieldKnown(profile: StartupProfile, field: ProfileFieldId) {
  if (profile.unknownFields.includes(field)) return false;
  if (field === "budget") return profile.budgetAmount !== null;
  return Boolean(profile[field].trim());
}

/** Fields that are neither filled nor explicitly marked as unknown. */
export function unansweredFields(profile: StartupProfile) {
  return profileFieldIds.filter((field) => !profile.unknownFields.includes(field) && !isFieldKnown(profile, field));
}

export function certaintyLevel(profile: StartupProfile): "low" | "medium" | "high" {
  const known = profileFieldIds.filter((field) => isFieldKnown(profile, field)).length;
  if (known >= 6) return "high";
  if (known >= 4) return "medium";
  return "low";
}

export function formatBudget(amount: number | null, currency: string | null) {
  if (amount === null) return "Не указан";
  const formatted = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(amount);
  return `${formatted} ${currency ?? ""}`.trim();
}
