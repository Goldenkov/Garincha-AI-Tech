import { NextResponse } from "next/server";

type LeadPayload = {
  name?: unknown;
  email?: unknown;
  telegram?: unknown;
  businessNiche?: unknown;
  mainGoal?: unknown;
  consent?: unknown;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as LeadPayload;
  const lead = normalizeLead(payload);
  const validationError = validateLead(lead);

  if (validationError) {
    return NextResponse.json({ success: false, error: validationError }, { status: 400 });
  }

  const supabaseResult = await insertLeadIntoSupabase(lead);
  if (!supabaseResult.success) {
    return NextResponse.json({ success: false, error: supabaseResult.error }, { status: 500 });
  }

  await sendTelegramNotification(lead);

  return NextResponse.json({ success: true });
}

function normalizeLead(payload: LeadPayload) {
  return {
    name: typeof payload.name === "string" ? payload.name.trim() : "",
    email: typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "",
    telegram: typeof payload.telegram === "string" ? payload.telegram.trim() : "",
    businessNiche: typeof payload.businessNiche === "string" ? payload.businessNiche.trim() : "",
    mainGoal: typeof payload.mainGoal === "string" ? payload.mainGoal.trim() : "",
    consent: payload.consent === true,
    createdAt: new Date().toISOString(),
  };
}

function validateLead(lead: ReturnType<typeof normalizeLead>) {
  if (!lead.name) return "Введите имя.";
  if (!lead.email || !emailPattern.test(lead.email)) return "Введите корректный email.";
  if (!lead.businessNiche) return "Укажите нишу бизнеса.";
  if (!lead.mainGoal) return "Выберите главную цель.";
  if (!lead.consent) return "Нужно согласие на обработку данных.";
  return "";
}

async function insertLeadIntoSupabase(lead: ReturnType<typeof normalizeLead>) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const configured = Boolean(supabaseUrl && supabaseAnonKey && serviceRoleKey);

  if (!configured) {
    // TODO: Configure Supabase env vars in production. In development, keep the form usable
    // so the MVP can be tested without a database.
    return process.env.NODE_ENV === "production"
      ? { success: false, error: "Lead storage is not configured." }
      : { success: true };
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/leads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceRoleKey!,
      Authorization: `Bearer ${serviceRoleKey}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      name: lead.name,
      email: lead.email,
      telegram: lead.telegram || null,
      business_niche: lead.businessNiche,
      main_goal: lead.mainGoal,
      consent: lead.consent,
      source: "website",
      status: "new",
      created_at: lead.createdAt,
    }),
  });

  if (!response.ok) {
    return { success: false, error: "Не удалось сохранить заявку. Попробуйте позже." };
  }

  return { success: true };
}

async function sendTelegramNotification(lead: ReturnType<typeof normalizeLead>) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_LEADS_CHAT_ID;

  if (!botToken || !chatId) return;

  const message = [
    "Новая заявка — Бизнес Перезагрузка с AI",
    `Имя: ${lead.name}`,
    `Email: ${lead.email}`,
    `Telegram: ${lead.telegram || "не указан"}`,
    `Ниша: ${lead.businessNiche}`,
    `Цель: ${lead.mainGoal}`,
    `Создано: ${lead.createdAt}`,
  ].join("\n");

  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      disable_web_page_preview: true,
    }),
  }).catch(() => undefined);
}
