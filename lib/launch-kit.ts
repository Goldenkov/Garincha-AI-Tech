import { businessRebootConfig } from "@/lib/business-reboot-content";
import { missions, niches, type NicheId } from "@/lib/journey";

export type MissionResult = {
  missionId: string;
  nicheId: NicheId;
  title: string;
  resultText: string;
  updatedAt: string;
};

export type MissionResultsMap = Record<string, MissionResult>;

export const missionResultsStorageKey = "business-reboot:mission-results";

export const missionResultPlaceholders: Record<string, string> = {
  "business-recon": "Коротко опишите бизнес, аудиторию и задачу...",
  "offer-packaging": "Вставьте 1–2 версии оффера...",
  "content-boost": "Вставьте 7 идей публикаций...",
  "contact-scripts": "Вставьте первый скрипт ответа клиенту...",
  "objection-battle": "Вставьте ответы на частые сомнения...",
  "quiz-lead": "Вставьте вопросы квиза...",
  "landing-route": "Вставьте структуру страницы...",
  "market-signals": "Вставьте действия, которые сделаете сегодня...",
  "launch-check": "Что готово, что нужно доработать...",
};

export const launchKitSections = [
  { missionId: "business-recon", title: "Описание бизнеса", empty: "Пока не заполнено. Вернитесь к миссии Разведка бизнеса." },
  { missionId: "offer-packaging", title: "Оффер", empty: "Пока не заполнено. Вернитесь к миссии Упаковка оффера." },
  { missionId: "content-boost", title: "Контент-план", empty: "Пока не заполнено. Вернитесь к миссии Контент-ускорение." },
  { missionId: "contact-scripts", title: "Скрипт продаж", empty: "Пока не заполнено. Вернитесь к миссии Скрипты контакта." },
  { missionId: "objection-battle", title: "Возражения", empty: "Пока не заполнено. Вернитесь к миссии Битва с возражениями." },
  { missionId: "quiz-lead", title: "Квиз", empty: "Пока не заполнено. Вернитесь к миссии Квиз-заявка." },
  { missionId: "landing-route", title: "Структура лендинга", empty: "Пока не заполнено. Вернитесь к миссии Лендинг-маршрут." },
  { missionId: "market-signals", title: "Первые сигналы рынка", empty: "Пока не заполнено. Вернитесь к миссии Первые сигналы рынка." },
  { missionId: "launch-check", title: "Финальный чек запуска", empty: "Пока не заполнено. Вернитесь к миссии Финальный чек перед запуском." },
];

export function getMissionResults(): MissionResultsMap {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(missionResultsStorageKey);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function saveMissionResult(result: MissionResult) {
  if (typeof window === "undefined") return;
  const current = getMissionResults();
  window.localStorage.setItem(
    missionResultsStorageKey,
    JSON.stringify({
      ...current,
      [result.missionId]: result,
    }),
  );
}

export function clearMissionResult(missionId: string) {
  if (typeof window === "undefined") return;
  const current = getMissionResults();
  delete current[missionId];
  window.localStorage.setItem(missionResultsStorageKey, JSON.stringify(current));
}

export function buildLaunchKitText({
  selectedNiche,
  results,
}: {
  selectedNiche: NicheId;
  results: MissionResultsMap;
}) {
  const niche = niches.find((item) => item.id === selectedNiche);
  const lines = [
    `Пакет первого запуска — ${businessRebootConfig.publicName}`,
    "",
    `Ниша: ${niche?.title ?? "Не выбрана"}`,
    "",
  ];

  launchKitSections.forEach((section, index) => {
    lines.push(`${index + 1}. ${section.title}`);
    lines.push(results[section.missionId]?.resultText?.trim() || "[не заполнено]");
    lines.push("");
  });

  return lines.join("\n").trim();
}

export function missionTitleById(missionId: string) {
  return missions.find((mission) => mission.id === missionId)?.title ?? missionId;
}
