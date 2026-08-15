import { NextResponse } from "next/server";

import { asTrimmedString, deliverSubmission, isEmail } from "@/lib/server/submissions";

type PartnerPayload = {
  name?: unknown;
  email?: unknown;
  telegram?: unknown;
  channelUrl?: unknown;
  audienceSize?: unknown;
  cooperationFormat?: unknown;
  consent?: unknown;
};

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as PartnerPayload | null;

  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ success: false, error: "Некорректные данные заявки." }, { status: 400 });
  }

  const partner = {
    name: asTrimmedString(payload.name),
    email: asTrimmedString(payload.email).toLowerCase(),
    telegram: asTrimmedString(payload.telegram),
    channelUrl: asTrimmedString(payload.channelUrl),
    audienceSize: asTrimmedString(payload.audienceSize),
    cooperationFormat: asTrimmedString(payload.cooperationFormat),
    consent: payload.consent === true,
    createdAt: new Date().toISOString(),
  };

  const validationError = validatePartner(partner);
  if (validationError) {
    return NextResponse.json({ success: false, error: validationError }, { status: 400 });
  }

  await deliverSubmission({
    table: "partners",
    title: "Новая партнёрская заявка — Бизнес Перезагрузка с AI",
    row: {
      name: partner.name,
      email: partner.email,
      telegram: partner.telegram || null,
      channel_url: partner.channelUrl,
      audience_size: partner.audienceSize,
      cooperation_format: partner.cooperationFormat,
      consent: partner.consent,
      source: "website",
      status: "new",
      created_at: partner.createdAt,
    },
    lines: [
      `Имя: ${partner.name}`,
      `Email: ${partner.email}`,
      `Telegram: ${partner.telegram || "не указан"}`,
      `Канал: ${partner.channelUrl}`,
      `Аудитория: ${partner.audienceSize}`,
      `Формат: ${partner.cooperationFormat}`,
      `Создано: ${partner.createdAt}`,
    ],
  });

  return NextResponse.json({ success: true });
}

function validatePartner(partner: {
  name: string;
  email: string;
  channelUrl: string;
  audienceSize: string;
  cooperationFormat: string;
  consent: boolean;
}) {
  if (!partner.name) return "Введите имя.";
  if (!partner.email || !isEmail(partner.email)) return "Введите корректный email.";
  if (!partner.channelUrl || !isHttpUrl(partner.channelUrl)) return "Укажите ссылку на канал или сообщество.";
  if (!partner.audienceSize) return "Укажите размер аудитории.";
  if (!partner.cooperationFormat) return "Выберите формат сотрудничества.";
  if (!partner.consent) return "Нужно согласие на обработку данных.";
  return "";
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
