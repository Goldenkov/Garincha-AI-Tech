import { NextResponse } from "next/server";

import { asTrimmedString, deliverSubmission, isEmail } from "@/lib/server/submissions";

type LeadPayload = {
  name?: unknown;
  email?: unknown;
  telegram?: unknown;
  businessNiche?: unknown;
  mainGoal?: unknown;
  consent?: unknown;
};

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as LeadPayload | null;

  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ success: false, error: "Некорректные данные заявки." }, { status: 400 });
  }

  const lead = {
    name: asTrimmedString(payload.name),
    email: asTrimmedString(payload.email).toLowerCase(),
    telegram: asTrimmedString(payload.telegram),
    businessNiche: asTrimmedString(payload.businessNiche),
    mainGoal: asTrimmedString(payload.mainGoal),
    consent: payload.consent === true,
    createdAt: new Date().toISOString(),
  };

  const validationError = validateLead(lead);
  if (validationError) {
    return NextResponse.json({ success: false, error: validationError }, { status: 400 });
  }

  await deliverSubmission({
    table: "leads",
    title: "Новая заявка — Бизнес Перезагрузка с AI",
    row: {
      name: lead.name,
      email: lead.email,
      telegram: lead.telegram || null,
      business_niche: lead.businessNiche,
      main_goal: lead.mainGoal,
      consent: lead.consent,
      source: "website",
      status: "new",
      created_at: lead.createdAt,
    },
    lines: [
      `Имя: ${lead.name}`,
      `Email: ${lead.email}`,
      `Telegram: ${lead.telegram || "не указан"}`,
      `Ниша: ${lead.businessNiche}`,
      `Цель: ${lead.mainGoal}`,
      `Создано: ${lead.createdAt}`,
    ],
  });

  return NextResponse.json({ success: true });
}

function validateLead(lead: {
  name: string;
  email: string;
  businessNiche: string;
  mainGoal: string;
  consent: boolean;
}) {
  if (!lead.name) return "Введите имя.";
  if (!lead.email || !isEmail(lead.email)) return "Введите корректный email.";
  if (!lead.businessNiche) return "Укажите нишу бизнеса.";
  if (!lead.mainGoal) return "Выберите главную цель.";
  if (!lead.consent) return "Нужно согласие на обработку данных.";
  return "";
}
