// Local read-only smoke test for the master Google Sheet.
// Never prints credentials, tokens, or key file contents.

import { google } from "googleapis";

const READONLY_SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly";

const EXPECTED_SHEETS = [
  "01_Инструкция",
  "02_Воронка_продаж",
  "03_Рекламный_бюджет",
  "04_Юнит_экономика",
  "05_План_запуска_14_дней",
  "06_KPI_панель",
];

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const accessMode = process.env.GOOGLE_SHEETS_ACCESS_MODE ?? "readonly";

if (accessMode !== "readonly") {
  fail("GOOGLE_SHEETS_ACCESS_MODE must be 'readonly'.");
}
if (!credentialsPath) {
  fail("GOOGLE_APPLICATION_CREDENTIALS is not set. Add it to .env.local (path to the service account JSON).");
}
if (!spreadsheetId) {
  fail("GOOGLE_SHEETS_SPREADSHEET_ID is not set. Add it to .env.local.");
}

try {
  const auth = new google.auth.GoogleAuth({
    keyFile: credentialsPath,
    scopes: [READONLY_SCOPE],
  });
  const sheets = google.sheets({ version: "v4", auth });

  const metadata = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "properties.title,sheets.properties.title",
  });

  const title = metadata.data.properties?.title ?? "(untitled)";
  const sheetTitles = (metadata.data.sheets ?? [])
    .map((sheet) => sheet.properties?.title ?? "")
    .filter(Boolean);

  console.log(`Spreadsheet title: ${title}`);
  console.log(`Available sheets (${sheetTitles.length}):`);
  for (const sheetTitle of sheetTitles) {
    console.log(`  - ${sheetTitle}`);
  }

  const missing = EXPECTED_SHEETS.filter((name) => !sheetTitles.includes(name));
  if (missing.length > 0) {
    fail(`Missing expected sheets: ${missing.join(", ")}`);
  }
  console.log("All 6 expected sheets exist.");

  const instruction = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "'01_Инструкция'!A1:H20",
  });
  const instructionRows = instruction.data.values ?? [];
  console.log(`'01_Инструкция'!A1:H20 -> ${instructionRows.length} rows read.`);

  const funnel = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "'02_Воронка_продаж'!A1:Z10",
  });
  const funnelRows = funnel.data.values ?? [];
  console.log(`'02_Воронка_продаж'!A1:Z10 -> ${funnelRows.length} rows read.`);

  console.log("OK: read-only access verified.");
} catch (error) {
  const status = error?.response?.status;
  if (status === 403) {
    fail("Access denied (403). Share the spreadsheet with the service account email as Viewer.");
  }
  if (status === 404) {
    fail("Spreadsheet not found (404). Check GOOGLE_SHEETS_SPREADSHEET_ID.");
  }
  fail(`Authentication or access failed${status ? ` (HTTP ${status})` : ""}.`);
}
