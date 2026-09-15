import "server-only";

import { google, type sheets_v4 } from "googleapis";

/**
 * Server-only read access to the master spreadsheet "Таблицы_и_расчёты_для_бизнеса".
 *
 * Security controls:
 * - readonly Google API scope only;
 * - dedicated service account via GOOGLE_APPLICATION_CREDENTIALS;
 * - strict sheet allowlist;
 * - no credentials, tokens, or key paths in results or error messages.
 */

const READONLY_SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly";

export const allowedSheetNames = [
  "01_Инструкция",
  "02_Воронка_продаж",
  "03_Рекламный_бюджет",
  "04_Юнит_экономика",
  "05_План_запуска_14_дней",
  "06_KPI_панель",
] as const;

export type AllowedSheetName = (typeof allowedSheetNames)[number];

export type SheetsResult<T> = { ok: true; data: T } | { ok: false; error: string };

export type SpreadsheetMetadata = {
  title: string;
  sheetTitles: string[];
};

type SheetsConfig = {
  credentialsPath: string;
  spreadsheetId: string;
};

function getConfig(): SheetsResult<SheetsConfig> {
  const accessMode = process.env.GOOGLE_SHEETS_ACCESS_MODE ?? "readonly";
  if (accessMode !== "readonly") {
    return { ok: false, error: "Google Sheets access is restricted to readonly mode." };
  }

  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

  if (!credentialsPath || !spreadsheetId) {
    return { ok: false, error: "Google Sheets integration is not configured." };
  }

  return { ok: true, data: { credentialsPath, spreadsheetId } };
}

let cachedClient: { sheets: sheets_v4.Sheets; spreadsheetId: string } | null = null;

async function getSheetsClient(): Promise<SheetsResult<{ sheets: sheets_v4.Sheets; spreadsheetId: string }>> {
  if (cachedClient) return { ok: true, data: cachedClient };

  const config = getConfig();
  if (!config.ok) return config;

  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: config.data.credentialsPath,
      scopes: [READONLY_SCOPE],
    });
    const sheets = google.sheets({ version: "v4", auth });
    cachedClient = { sheets, spreadsheetId: config.data.spreadsheetId };
    return { ok: true, data: cachedClient };
  } catch {
    return { ok: false, error: "Failed to initialize Google Sheets client." };
  }
}

function isAllowedSheetName(name: string): name is AllowedSheetName {
  return (allowedSheetNames as readonly string[]).includes(name);
}

function extractSheetNameFromRange(range: string): string | null {
  const separatorIndex = range.indexOf("!");
  if (separatorIndex === -1) return null;

  let sheetName = range.slice(0, separatorIndex).trim();
  if (sheetName.startsWith("'") && sheetName.endsWith("'") && sheetName.length >= 2) {
    sheetName = sheetName.slice(1, -1).replace(/''/g, "'");
  }

  return sheetName || null;
}

export async function getSpreadsheetMetadata(): Promise<SheetsResult<SpreadsheetMetadata>> {
  const client = await getSheetsClient();
  if (!client.ok) return client;

  try {
    const response = await client.data.sheets.spreadsheets.get({
      spreadsheetId: client.data.spreadsheetId,
      fields: "properties.title,sheets.properties.title",
    });

    return {
      ok: true,
      data: {
        title: response.data.properties?.title ?? "",
        sheetTitles:
          response.data.sheets
            ?.map((sheet) => sheet.properties?.title ?? "")
            .filter((title) => title.length > 0) ?? [],
      },
    };
  } catch {
    return { ok: false, error: "Failed to read spreadsheet metadata." };
  }
}

export async function getSheetValues(range: string): Promise<SheetsResult<string[][]>> {
  const sheetName = extractSheetNameFromRange(range);
  if (!sheetName || !isAllowedSheetName(sheetName)) {
    return { ok: false, error: "Requested sheet is not in the allowlist." };
  }

  const client = await getSheetsClient();
  if (!client.ok) return client;

  try {
    const response = await client.data.sheets.spreadsheets.values.get({
      spreadsheetId: client.data.spreadsheetId,
      range,
    });

    return { ok: true, data: (response.data.values ?? []) as string[][] };
  } catch {
    return { ok: false, error: "Failed to read sheet values." };
  }
}

export async function getAllowedSheetValues(sheetName: AllowedSheetName): Promise<SheetsResult<string[][]>> {
  return getSheetValues(`'${sheetName}'!A:Z`);
}

export function getInstructionSheet() {
  return getAllowedSheetValues("01_Инструкция");
}

export function getSalesFunnelSheet() {
  return getAllowedSheetValues("02_Воронка_продаж");
}

export function getAdvertisingBudgetSheet() {
  return getAllowedSheetValues("03_Рекламный_бюджет");
}

export function getUnitEconomicsSheet() {
  return getAllowedSheetValues("04_Юнит_экономика");
}

export function getLaunchPlanSheet() {
  return getAllowedSheetValues("05_План_запуска_14_дней");
}

export function getKpiDashboardSheet() {
  return getAllowedSheetValues("06_KPI_панель");
}
