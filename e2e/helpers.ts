import { expect, type Page } from "@playwright/test";

/** Local Supabase ships Mailpit; codes are read from it, never from a real inbox. */
const mailpitUrl = process.env.E2E_MAILPIT_URL ?? "http://127.0.0.1:54324";

export function uniqueEmail(tag: string) {
  return `e2e-${tag}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
}

async function readCode(email: string) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const response = await fetch(`${mailpitUrl}/api/v1/search?query=${encodeURIComponent(`to:${email}`)}&limit=1`);
    if (response.ok) {
      const list = (await response.json()) as { messages: { ID: string }[] };
      if (list.messages.length) {
        const message = (await (await fetch(`${mailpitUrl}/api/v1/message/${list.messages[0].ID}`)).json()) as { Text: string; HTML: string };
        const code = /\b(\d{6})\b/u.exec(`${message.Text} ${message.HTML}`)?.[1];
        if (code) return code;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`No login code delivered to ${email}`);
}

/** Completes the email-code form that is currently on screen. */
export async function completeLogin(page: Page, email: string) {
  await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: "Получить код" }).click();
  const code = await readCode(email);
  await page.getByLabel("Код из письма").fill(code);
  await page.getByRole("button", { name: "Войти", exact: true }).click();
}

export async function signIn(page: Page, email: string, next = "/projects") {
  await page.goto(`/login?next=${encodeURIComponent(next)}`);
  await completeLogin(page, email);
  await expect(page).toHaveURL(new RegExp(next.replace(/[?]/gu, "\\?")));
}
