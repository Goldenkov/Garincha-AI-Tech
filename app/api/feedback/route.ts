import { NextResponse } from "next/server";

import { asTrimmedString, deliverSubmission } from "@/lib/server/submissions";

type FeedbackPayload = {
  name?: unknown;
  niche?: unknown;
  clear?: unknown;
  stuck?: unknown;
  result?: unknown;
  missing?: unknown;
  rating?: unknown;
};

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as FeedbackPayload | null;

  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ success: false, error: "Некорректные данные отзыва." }, { status: 400 });
  }

  const feedback = {
    name: asTrimmedString(payload.name),
    niche: asTrimmedString(payload.niche),
    clear: asTrimmedString(payload.clear),
    stuck: asTrimmedString(payload.stuck),
    result: asTrimmedString(payload.result),
    missing: asTrimmedString(payload.missing),
    rating: parseRating(payload.rating),
    createdAt: new Date().toISOString(),
  };

  const validationError = validateFeedback(feedback);
  if (validationError) {
    return NextResponse.json({ success: false, error: validationError }, { status: 400 });
  }

  await deliverSubmission({
    table: "feedback",
    title: "Новый отзыв — Бизнес Перезагрузка с AI",
    row: {
      name: feedback.name,
      niche: feedback.niche,
      clear_text: feedback.clear,
      stuck_text: feedback.stuck,
      result_text: feedback.result,
      missing_text: feedback.missing,
      rating: feedback.rating,
      status: "new",
      created_at: feedback.createdAt,
    },
    lines: [
      `Имя: ${feedback.name}`,
      `Ниша: ${feedback.niche}`,
      `Оценка: ${feedback.rating}`,
      `Понятно: ${feedback.clear}`,
      `Застряли: ${feedback.stuck}`,
      `Получилось: ${feedback.result}`,
      `Не хватило: ${feedback.missing}`,
      `Создано: ${feedback.createdAt}`,
    ],
  });

  return NextResponse.json({ success: true });
}

function parseRating(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return Math.round(value);
  if (typeof value === "string" && value.trim()) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : NaN;
  }
  return NaN;
}

function validateFeedback(feedback: {
  name: string;
  niche: string;
  clear: string;
  stuck: string;
  result: string;
  missing: string;
  rating: number;
}) {
  if (!feedback.name) return "Введите имя.";
  if (!feedback.niche) return "Укажите нишу.";
  if (!feedback.clear) return "Расскажите, что было понятно.";
  if (!feedback.stuck) return "Расскажите, где застряли.";
  if (!feedback.result) return "Расскажите, что получилось создать.";
  if (!feedback.missing) return "Расскажите, чего не хватило.";
  if (!Number.isInteger(feedback.rating) || feedback.rating < 1 || feedback.rating > 10) {
    return "Поставьте оценку от 1 до 10.";
  }
  return "";
}
