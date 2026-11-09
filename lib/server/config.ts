import "server-only";

export type SupabaseConfig = {
  url: string;
  anonKey: string;
  serviceRoleKey: string | null;
};

export const isProduction = process.env.NODE_ENV === "production";

function clean(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/** Supabase connection for the signed-in user flows. Returns null when not configured. */
export function getSupabaseConfig(): SupabaseConfig | null {
  const url = clean(process.env.SUPABASE_URL) ?? clean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = clean(process.env.SUPABASE_ANON_KEY) ?? clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (!url || !anonKey) return null;
  if (isProduction && !url.startsWith("https://")) return null;
  return { url: url.replace(/\/+$/u, ""), anonKey, serviceRoleKey: clean(process.env.SUPABASE_SERVICE_ROLE_KEY) };
}

export function getTelegramConfig() {
  const botToken = clean(process.env.TELEGRAM_BOT_TOKEN);
  const chatId = clean(process.env.TELEGRAM_LEADS_CHAT_ID);
  if (!botToken || !chatId) return null;
  return { botToken, chatId };
}

export type AiConfig = {
  baseUrl: string;
  apiKey: string;
  model: string;
  maxOutputTokens: number;
  timeoutMs: number;
  dailyPerUser: number;
  dailyGlobal: number;
};

function positiveInt(value: string | undefined, fallback: number, max: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, max);
}

/**
 * AI advisor is opt-in: it stays disabled until a provider, key, model and an explicit
 * daily budget are configured. Without it the rule-based matcher is used.
 */
export function getAiConfig(): AiConfig | null {
  const baseUrl = clean(process.env.AI_BASE_URL);
  const apiKey = clean(process.env.AI_API_KEY);
  const model = clean(process.env.AI_MODEL);
  const dailyGlobal = positiveInt(process.env.AI_DAILY_GLOBAL_LIMIT, 0, 10_000);
  if (!baseUrl || !apiKey || !model || dailyGlobal === 0) return null;
  if (isProduction && !baseUrl.startsWith("https://")) return null;
  return {
    baseUrl: baseUrl.replace(/\/+$/u, ""),
    apiKey,
    model,
    maxOutputTokens: positiveInt(process.env.AI_MAX_OUTPUT_TOKENS, 900, 2000),
    timeoutMs: positiveInt(process.env.AI_TIMEOUT_MS, 15_000, 30_000),
    dailyPerUser: positiveInt(process.env.AI_DAILY_LIMIT_PER_USER, 5, 50),
    dailyGlobal,
  };
}

/**
 * Number of reverse proxies in front of the app that write X-Forwarded-For. 0 (the default) means
 * the header is ignored: without a proxy it is written by the client.
 */
export function getTrustedProxyHops() {
  const parsed = Number.parseInt(process.env.TRUSTED_PROXY_HOPS ?? "", 10);
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= 5 ? parsed : 0;
}

export const sessionCookieNames = {
  access: "br_session",
  refresh: "br_refresh",
} as const;

export const REFRESH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;
