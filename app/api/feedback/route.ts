import { asTrimmedString, handleSubmission } from "@/lib/server/submissions";

function parseRating(value: unknown) {
  const parsed = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 10 ? parsed : null;
}

export async function POST(request: Request) {
  return handleSubmission(request, "feedback", (payload) => {
    const feedback = {
      name: asTrimmedString(payload.name, 120),
      niche: asTrimmedString(payload.niche, 200),
      clear: asTrimmedString(payload.clear),
      stuck: asTrimmedString(payload.stuck),
      result: asTrimmedString(payload.result),
      missing: asTrimmedString(payload.missing),
      rating: parseRating(payload.rating),
    };
    if (!feedback.rating) return { error: "Поставьте оценку от 1 до 10.", field: "rating" };
    if (!feedback.clear && !feedback.stuck && !feedback.result && !feedback.missing) {
      return { error: "Напишите хотя бы один ответ.", field: "clear" };
    }

    return {
      title: "Новый отзыв — Бизнес Перезагрузка с AI",
      row: {
        name: feedback.name || null,
        niche: feedback.niche || null,
        clear_text: feedback.clear || null,
        stuck_text: feedback.stuck || null,
        result_text: feedback.result || null,
        missing_text: feedback.missing || null,
        rating: feedback.rating,
        status: "new",
      },
      lines: [
        `Имя: ${feedback.name || "не указано"}`,
        `Направление: ${feedback.niche || "не указано"}`,
        `Оценка: ${feedback.rating}`,
        `Понятно: ${feedback.clear}`,
        `Застряли: ${feedback.stuck}`,
        `Получилось: ${feedback.result}`,
        `Не хватило: ${feedback.missing}`,
      ],
    };
  });
}
