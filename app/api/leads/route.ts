import { asTrimmedString, handleSubmission, isEmail } from "@/lib/server/submissions";

export async function POST(request: Request) {
  return handleSubmission(request, "leads", (payload) => {
    const lead = {
      name: asTrimmedString(payload.name, 120),
      email: asTrimmedString(payload.email, 254).toLowerCase(),
      telegram: asTrimmedString(payload.telegram, 64),
      businessNiche: asTrimmedString(payload.businessNiche, 300),
      mainGoal: asTrimmedString(payload.mainGoal, 300),
      consent: payload.consent === true,
    };
    if (!lead.name) return { error: "Введите имя.", field: "name" };
    if (!isEmail(lead.email)) return { error: "Введите корректный email.", field: "email" };
    if (!lead.businessNiche) return { error: "Укажите направление.", field: "businessNiche" };
    if (!lead.mainGoal) return { error: "Выберите главную цель.", field: "mainGoal" };
    if (!lead.consent) return { error: "Нужно согласие на обработку данных.", field: "consent" };

    return {
      title: "Новая заявка — Бизнес Перезагрузка с AI",
      row: {
        name: lead.name,
        email: lead.email,
        telegram: lead.telegram || null,
        business_niche: lead.businessNiche,
        main_goal: lead.mainGoal,
        consent: true,
        source: "website",
        status: "new",
      },
      lines: [
        `Имя: ${lead.name}`,
        `Email: ${lead.email}`,
        `Telegram: ${lead.telegram || "не указан"}`,
        `Направление: ${lead.businessNiche}`,
        `Цель: ${lead.mainGoal}`,
      ],
    };
  });
}
