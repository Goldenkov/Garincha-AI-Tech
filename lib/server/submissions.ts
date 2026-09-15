import "server-only";

export type SubmissionTable = "leads" | "partners" | "feedback";

export type DeliveryResult = {
  delivered: boolean;
  channels: string[];
};

type SupabaseConfig = {
  url: string;
  serviceRoleKey: string;
};

type TelegramConfig = {
  botToken: string;
  chatId: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

export function asTrimmedString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function isEmail(value: string) {
  return emailPattern.test(value);
}

function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) return null;
  return { url, serviceRoleKey };
}

function getTelegramConfig(): TelegramConfig | null {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_LEADS_CHAT_ID;

  if (!botToken || !chatId) return null;
  return { botToken, chatId };
}

async function insertIntoSupabase(table: SubmissionTable, row: Record<string, unknown>) {
  const config = getSupabaseConfig();
  if (!config) return false;

  try {
    const response = await fetch(`${config.url}/rest/v1/${table}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: config.serviceRoleKey,
        Authorization: `Bearer ${config.serviceRoleKey}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(row),
    });

    if (!response.ok) {
      console.error(`[submission:${table}] supabase insert failed with status ${response.status}`);
      return false;
    }

    return true;
  } catch {
    console.error(`[submission:${table}] supabase insert threw`);
    return false;
  }
}

async function sendTelegram(title: string, lines: string[]) {
  const config = getTelegramConfig();
  if (!config) return false;

  try {
    const response = await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: config.chatId,
        text: [title, ...lines].join("\n"),
        disable_web_page_preview: true,
      }),
    });

    if (!response.ok) {
      console.error("[submission] telegram send failed");
      return false;
    }

    return true;
  } catch {
    console.error("[submission] telegram send threw");
    return false;
  }
}

export async function deliverSubmission({
  table,
  title,
  row,
  lines,
}: {
  table: SubmissionTable;
  title: string;
  row: Record<string, unknown>;
  lines: string[];
}): Promise<DeliveryResult> {
  const channels: string[] = [];

  if (await insertIntoSupabase(table, row)) channels.push("supabase");
  if (await sendTelegram(title, lines)) channels.push("telegram");

  if (channels.length === 0) {
    console.warn(`[submission:${table}] no delivery channel configured`);
    console.info(`[submission:${table}] ${title}\n${lines.join("\n")}`);
  }

  return {
    delivered: channels.length > 0,
    channels,
  };
}
