import { asTrimmedString, handleSubmission, isEmail } from "@/lib/server/submissions";

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  return handleSubmission(request, "partners", (payload) => {
    const partner = {
      name: asTrimmedString(payload.name, 120),
      email: asTrimmedString(payload.email, 254).toLowerCase(),
      telegram: asTrimmedString(payload.telegram, 64),
      channelUrl: asTrimmedString(payload.channelUrl, 500),
      audienceSize: asTrimmedString(payload.audienceSize, 100),
      cooperationFormat: asTrimmedString(payload.cooperationFormat, 200),
      consent: payload.consent === true,
    };
    if (!partner.name) return { error: "Введите имя.", field: "name" };
    if (!isEmail(partner.email)) return { error: "Введите корректный email.", field: "email" };
    if (!isHttpUrl(partner.channelUrl)) return { error: "Укажите ссылку на канал или сообщество.", field: "channelUrl" };
    if (!partner.audienceSize) return { error: "Укажите размер аудитории.", field: "audienceSize" };
    if (!partner.cooperationFormat) return { error: "Выберите формат сотрудничества.", field: "cooperationFormat" };
    if (!partner.consent) return { error: "Нужно согласие на обработку данных.", field: "consent" };

    return {
      title: "Новая партнёрская заявка — Бизнес Перезагрузка с AI",
      row: {
        name: partner.name,
        email: partner.email,
        telegram: partner.telegram || null,
        channel_url: partner.channelUrl,
        audience_size: partner.audienceSize,
        cooperation_format: partner.cooperationFormat,
        consent: true,
        source: "website",
        status: "new",
      },
      lines: [
        `Имя: ${partner.name}`,
        `Email: ${partner.email}`,
        `Telegram: ${partner.telegram || "не указан"}`,
        `Канал: ${partner.channelUrl}`,
        `Аудитория: ${partner.audienceSize}`,
        `Формат: ${partner.cooperationFormat}`,
      ],
    };
  });
}
