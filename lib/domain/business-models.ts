export const businessModelIds = ["services", "commerce", "made_to_order"] as const;

export type BusinessModelId = (typeof businessModelIds)[number];

export type BusinessModel = {
  id: BusinessModelId;
  title: string;
  short: string;
  howItEarns: string;
  revenueExamples: string[];
  typicalAssumptions: string[];
  typicalRisks: string[];
  defaultValidation: {
    method: ValidationMethod;
    targetCount: number;
    successSignal: string;
    stopSignal: string;
  };
};

export const validationMethods = ["interviews", "landing", "preorder", "pilot", "other"] as const;
export type ValidationMethod = (typeof validationMethods)[number];

export const validationMethodLabels: Record<ValidationMethod, string> = {
  interviews: "Интервью с потенциальными клиентами",
  landing: "Страница или пост с предложением",
  preorder: "Предзаказ или заявка на расчёт",
  pilot: "Пробная услуга или пилотный заказ",
  other: "Другой способ",
};

export const businessModels: Record<BusinessModelId, BusinessModel> = {
  services: {
    id: "services",
    title: "Услуги",
    short: "Вы продаёте своё время, навык или результат работы.",
    howItEarns: "Оплата за услугу, час работы или пакет услуг.",
    revenueExamples: ["Фиксированная цена за услугу", "Почасовая оплата", "Пакет из нескольких встреч"],
    typicalAssumptions: [
      "Клиенты сталкиваются с этой задачей достаточно часто",
      "Клиенты готовы платить специалисту, а не решать задачу сами",
      "Первых клиентов можно найти через знакомых и локальные каналы",
    ],
    typicalRisks: [
      "Доход ограничен вашим временем",
      "Без отзывов первым клиентам сложно довериться",
      "Цена может оказаться ниже затрат времени",
    ],
    defaultValidation: {
      method: "interviews",
      targetCount: 5,
      successSignal: "Минимум 2 человека из 5 описывают задачу как свою и соглашаются обсудить цену",
      stopSignal: "Никто из опрошенных не сталкивался с задачей за последние полгода",
    },
  },
  commerce: {
    id: "commerce",
    title: "Торговля",
    short: "Вы закупаете или производите товар и продаёте его с наценкой.",
    howItEarns: "Разница между закупочной и продажной ценой.",
    revenueExamples: ["Наценка на товар", "Комплекты и подборки", "Повторные покупки расходников"],
    typicalAssumptions: [
      "Покупателям важен именно этот товар или подборка",
      "Можно закупать по цене, которая оставляет наценку",
      "Есть канал, где покупатели уже ищут такой товар",
    ],
    typicalRisks: [
      "Остатки товара замораживают бюджет",
      "Конкуренция с крупными площадками по цене",
      "Доставка и возвраты съедают маржу",
    ],
    defaultValidation: {
      method: "preorder",
      targetCount: 20,
      successSignal: "Хотя бы 3 предзаказа или заявки до закупки товара",
      stopSignal: "Ни одной заявки после показа предложения 20 потенциальным покупателям",
    },
  },
  made_to_order: {
    id: "made_to_order",
    title: "Производство на заказ",
    short: "Вы изготавливаете изделие под конкретного клиента после заказа.",
    howItEarns: "Цена заказа минус материалы и время; обычно с предоплатой.",
    revenueExamples: ["Цена за изделие по расчёту", "Предоплата 30–50% до начала работ", "Доплата за срочность"],
    typicalAssumptions: [
      "Клиенты готовы ждать изготовления ради подходящего изделия",
      "Клиенты согласны вносить предоплату",
      "Материалы можно закупать небольшими партиями под заказ",
    ],
    typicalRisks: [
      "Ошибка в замерах или ожиданиях клиента дорого обходится",
      "Сроки срываются из-за поставщиков материалов",
      "Сложно показать результат до первого заказа",
    ],
    defaultValidation: {
      method: "interviews",
      targetCount: 5,
      successSignal: "Хотя бы 2 человека из 5 просят расчёт под свою задачу",
      stopSignal: "Опрошенные предпочитают готовые изделия и не готовы ждать заказа",
    },
  },
};

export function isBusinessModelId(value: unknown): value is BusinessModelId {
  return typeof value === "string" && (businessModelIds as readonly string[]).includes(value);
}

export function isValidationMethod(value: unknown): value is ValidationMethod {
  return typeof value === "string" && (validationMethods as readonly string[]).includes(value);
}
