import { missions, type Mission } from "@/lib/journey";
import { getNiche } from "@/lib/catalog";

export type StepField = {
  id: string;
  label: string;
  kind: "text" | "textarea" | "number" | "choice";
  hint?: string;
  options?: { value: string; label: string }[];
  required: boolean;
};

export type StepDefinition = {
  id: string;
  stage: number;
  title: string;
  shortTitle: string;
  description: string;
  time: string;
  expectedResult: string;
  requiresPro: boolean;
  fields: StepField[];
  checklist: string[];
  mission?: Mission;
};

export const demandCheckStep: StepDefinition = {
  id: "demand-check",
  stage: 0,
  title: "Первая проверка спроса",
  shortTitle: "Проверка спроса",
  description:
    "Поговорите с реальными людьми из целевой аудитории до вложений. Запишите, что услышали, — результат может как поддержать гипотезу, так и опровергнуть её.",
  time: "3–14 дней",
  expectedResult: "Записанные сигналы и решение: продолжать, изменить гипотезу или остановиться.",
  requiresPro: false,
  fields: [
    {
      id: "method",
      label: "Как проверяли",
      kind: "choice",
      required: true,
      options: [
        { value: "interviews", label: "Интервью" },
        { value: "landing", label: "Страница или пост" },
        { value: "preorder", label: "Предзаказ / заявка на расчёт" },
        { value: "pilot", label: "Пробная услуга" },
        { value: "other", label: "Другое" },
      ],
    },
    { id: "plannedCount", label: "Сколько контактов планировали", kind: "number", required: true },
    { id: "conductedCount", label: "Сколько контактов состоялось", kind: "number", required: true, hint: "Записывайте фактическое число, даже если оно меньше плана." },
    {
      id: "signals",
      label: "Что услышали и увидели",
      kind: "textarea",
      required: true,
      hint: "Факты, а не впечатления: кто, что сказал, что сделал. Например: «2 человека попросили расчёт».",
    },
    {
      id: "decision",
      label: "Решение после проверки",
      kind: "choice",
      required: true,
      options: [
        { value: "continue", label: "Продолжать — сигналы есть" },
        { value: "revise", label: "Изменить гипотезу" },
        { value: "stop", label: "Остановиться и выбрать другое" },
      ],
    },
    { id: "notes", label: "Почему такое решение", kind: "textarea", required: false },
  ],
  checklist: [
    "Я спрашивал о прошлом опыте, а не «купили бы вы»",
    "Я не продавал во время интервью",
    "Я записал ответы сразу после разговора",
  ],
};

function missionToStep(mission: Mission): StepDefinition {
  return {
    id: mission.id,
    stage: mission.stage,
    title: mission.title,
    shortTitle: mission.shortTitle,
    description: mission.description,
    time: mission.time,
    expectedResult: mission.expectedResult,
    requiresPro: mission.stage > 1,
    fields: [
      ...mission.inputs.map((input, index) => ({
        id: `input${index + 1}`,
        label: input,
        kind: "text" as const,
        required: false,
      })),
      {
        id: "result",
        label: "Результат миссии",
        kind: "textarea" as const,
        required: true,
        hint: mission.expectedResult,
      },
    ],
    checklist: mission.checklist,
    mission,
  };
}

export const stepDefinitions: StepDefinition[] = [demandCheckStep, ...missions.map(missionToStep)];

export function getStep(id: string) {
  return stepDefinitions.find((step) => step.id === id);
}

export function missingStepFields(step: StepDefinition, values: Record<string, unknown>) {
  return step.fields
    .filter((field) => field.required)
    .filter((field) => {
      const value = values[field.id];
      if (field.kind === "number") return typeof value !== "number" || !Number.isFinite(value);
      return typeof value !== "string" || !value.trim();
    })
    .map((field) => field.id);
}

export function parseStepValues(step: StepDefinition, input: unknown): Record<string, string | number> {
  const record = input && typeof input === "object" && !Array.isArray(input) ? (input as Record<string, unknown>) : {};
  const values: Record<string, string | number> = {};
  for (const field of step.fields) {
    const raw = record[field.id];
    if (raw === undefined || raw === null || raw === "") continue;
    if (field.kind === "number") {
      const parsed = typeof raw === "number" ? raw : Number(raw);
      if (!Number.isInteger(parsed) || parsed < 0 || parsed > 100000) {
        throw new StepInputError(`«${field.label}»: укажите целое число.`, field.id);
      }
      values[field.id] = parsed;
      continue;
    }
    if (typeof raw !== "string") throw new StepInputError(`«${field.label}»: ожидался текст.`, field.id);
    const trimmed = raw.trim();
    const max = field.kind === "textarea" ? 6000 : 500;
    if (trimmed.length > max) throw new StepInputError(`«${field.label}»: максимум ${max} символов.`, field.id);
    if (field.kind === "choice" && !field.options?.some((option) => option.value === trimmed)) {
      throw new StepInputError(`«${field.label}»: выберите вариант из списка.`, field.id);
    }
    values[field.id] = trimmed;
  }
  return values;
}

/** Extra semantic rules the generic required-field check cannot express. */
export function stepCompletionProblems(step: StepDefinition, values: Record<string, string | number>) {
  const problems: string[] = [];
  if (step.id === demandCheckStep.id) {
    const conducted = values.conductedCount;
    if (typeof conducted === "number" && conducted < 1) {
      problems.push("Проверка считается проведённой, когда состоялся хотя бы один контакт.");
    }
  }
  return problems;
}

export class StepInputError extends Error {
  constructor(
    message: string,
    readonly field: string,
  ) {
    super(message);
    this.name = "StepInputError";
  }
}

export function buildMissionPrompt(mission: Mission, nicheId: string | null, context: { idea: string; customer: string; value: string }) {
  const niche = getNiche(nicheId);
  const nicheTitle = niche?.title ?? "моя ниша";
  return [
    mission.promptTemplate
      .replaceAll("[ниша]", nicheTitle)
      .replaceAll("[возражения]", niche?.journey.objections.join(", ") ?? "типовые сомнения клиентов")
      .replaceAll("[quiz-поля]", niche?.journey.quiz.join(", ") ?? "задача, сроки, бюджет"),
    "",
    "Контекст проекта:",
    `— Идея: ${context.idea || "не указана"}`,
    `— Клиент: ${context.customer || "не указан"}`,
    `— Ценность: ${context.value || "не указана"}`,
    "",
    "Не обещай гарантированный результат и не выдумывай цифры рынка. Если данных не хватает — задай уточняющие вопросы.",
  ].join("\n");
}

function asClause(text: string) {
  const trimmed = text.trim().replace(/[.!?…]+$/u, "");
  // Keep acronyms («IT», «ИП») intact; lower-case only an ordinary capitalised first word.
  return /^[A-ZА-ЯЁ][a-zа-яё]/u.test(trimmed) ? trimmed.charAt(0).toLowerCase() + trimmed.slice(1) : trimmed;
}

export function buildInterviewGuide(context: { customer: string; problem: string }) {
  return [
    `Когда вы в последний раз сталкивались с тем, что ${context.problem ? asClause(context.problem) : "[задача клиента]"}? Расскажите, как это было.`,
    "Как вы решали эту задачу? Что получилось, а что нет?",
    "Сколько времени и денег это заняло?",
    "Что было самым неудобным?",
    "Искали ли вы другие варианты? Почему остановились на выбранном?",
    `Кого ещё стоит спросить? Подойдут ${context.customer ? asClause(context.customer) : "люди в похожей ситуации"}.`,
  ];
}
