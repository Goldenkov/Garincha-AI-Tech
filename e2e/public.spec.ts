import { expect, test } from "@playwright/test";

test("headline and primary CTA are usable immediately and work without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Большая идея. Первый реальный шаг.");
  await expect(page.getByRole("link", { name: "Выбрать идею" }).first()).toHaveAttribute("href", /\/start/u);
  await expect(page.locator("#how .stage-action")).toBeVisible();
  await context.close();
});

test("catalog works without an account and has only three business models", async ({ page }) => {
  await page.goto("/niches");
  await expect(page.getByRole("heading", { name: "Услуги" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Торговля" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Производство на заказ" })).toBeVisible();
  await page.getByRole("link", { name: /Мебель на заказ/u }).first().click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Мебель на заказ");
});

test("rules advisor offers at most three explained options without sign-in", async ({ page }) => {
  await page.goto("/start/advisor");
  await page.getByLabel("Навыки и опыт").fill("Хорошо шью, умею работать с тканями");
  await page.getByRole("button", { name: /Подобрать варианты/u }).click();
  const options = page.locator("[data-advisor-option]");
  await expect(options.first()).toBeVisible();
  expect(await options.count()).toBeLessThanOrEqual(3);
  await expect(options.first().getByText("Почему подходит")).toBeVisible();
});

test("reduced motion shows the final scene with no scroll pinning", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/");
  await page.locator("#how").scrollIntoViewIfNeeded();
  await expect(page.locator("#how")).not.toHaveAttribute("data-motion", /.+/u);
  await expect(page.locator("#how [data-layer=action]")).toBeVisible();
  await context.close();
});

test("legacy routes redirect to the new structure", async ({ page }) => {
  await page.goto("/demo");
  await expect(page).toHaveURL(/\/example$/u);
  await page.goto("/quick-start");
  await expect(page).toHaveURL(/\/free$/u);
});
