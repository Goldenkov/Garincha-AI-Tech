import { expect, test } from "@playwright/test";

import { completeLogin, signIn, uniqueEmail } from "./helpers";

test("anonymous draft → sign in → consent to save → confirm hypothesis → demand check", async ({ page }) => {
  await page.goto("/niches");
  await page.getByRole("link", { name: /Мебель на заказ/u }).first().click();
  await page.getByRole("link", { name: "Собрать гипотезу" }).first().click();
  await expect(page).toHaveURL(/\/start\/idea/u);

  await page.getByLabel("Что хотите добавить к направлению").fill("Шкафы-купе в ниши для новостроек");
  await page.getByRole("button", { name: "Дальше" }).click();

  await page.getByLabel("Регион работы").fill("Казань");
  await page.getByRole("button", { name: "Собрать карточку" }).click();
  await expect(page.getByRole("heading", { level: 2, name: "Карточка гипотезы" })).toBeVisible();
  await expect(page.getByText("спрос ещё не проверен", { exact: false })).toBeVisible();

  // Nothing is saved on the server before the visitor signs in and agrees.
  await page.getByRole("link", { name: "Войти и сохранить" }).click();
  await expect(page).toHaveURL(/\/login/u);
  await completeLogin(page, uniqueEmail("journey"));

  await expect(page).toHaveURL(/\/start\/idea\?resume=1/u);
  await expect(page.getByRole("heading", { name: "Перенести черновик в аккаунт?" })).toBeVisible();
  await page.getByRole("button", { name: "Сохранить в аккаунт" }).click();

  await expect(page).toHaveURL(/\/startup\/[0-9a-f-]{36}\/hypothesis\?created=1/u);
  await expect(page.getByText("Проект сохранён в аккаунте")).toBeVisible();

  const projectUrl = page.url().replace(/\/hypothesis.*$/u, "");
  await page.goto(`${projectUrl}/steps/demand-check`);
  await expect(page.getByText("Этот шаг откроется после подтверждения карточки гипотезы.")).toBeVisible();
  await page.goBack();

  await page.getByRole("button", { name: "Подтвердить гипотезу" }).click();
  const dialog = page.getByRole("dialog", { name: "Подтвердить гипотезу?" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Подтвердить" })).toBeDisabled();
  await dialog.getByLabel(/это гипотеза для проверки/u).check();
  await dialog.getByRole("button", { name: "Подтвердить" }).click();

  await expect(page.getByText(/Версия 1 подтверждена/u)).toBeVisible();
  await page.getByRole("link", { name: "К проверке спроса" }).click();
  await expect(page.getByRole("heading", { name: "Первая проверка спроса" })).toBeVisible();

  await page.getByLabel("Как проверяли").selectOption("interviews");
  await page.getByLabel("Сколько контактов планировали").fill("5");
  await page.getByLabel("Сколько контактов состоялось").fill("3");
  await page.getByRole("button", { name: "Сохранить", exact: true }).click();
  await expect(page.getByText(/Сохранено на сервере в/u)).toBeVisible();

  await page.getByRole("button", { name: "Завершить шаг" }).click();
  await expect(page.getByText("Заполните это поле.").first()).toBeVisible();

  await page.getByLabel("Что услышали и увидели").fill("2 человека попросили расчёт под свой размер");
  await page.getByLabel("Решение после проверки").selectOption("continue");
  await page.getByRole("button", { name: "Завершить шаг" }).click();
  await expect(page.getByText("Шаг отмечен как завершённый.")).toBeVisible();

  await page.reload();
  await expect(page.getByLabel("Сколько контактов состоялось")).toHaveValue("3");
});

test("material edit after approval creates a new version and flags dependent results", async ({ page }) => {
  await signIn(page, uniqueEmail("revise"), "/start/idea?niche=custom-furniture");
  await page.getByRole("button", { name: "Дальше" }).click();
  await page.getByRole("button", { name: "Собрать карточку" }).click();
  await page.getByRole("button", { name: "Сохранить в аккаунт" }).click();
  await expect(page).toHaveURL(/\/hypothesis\?created=1/u);

  await page.getByRole("button", { name: "Подтвердить гипотезу" }).click();
  await page.getByRole("dialog").getByLabel(/это гипотеза для проверки/u).check();
  await page.getByRole("dialog").getByRole("button", { name: "Подтвердить" }).click();
  await page.getByRole("link", { name: "К проверке спроса" }).click();
  await page.getByLabel("Как проверяли").selectOption("interviews");
  await page.getByRole("button", { name: "Сохранить", exact: true }).click();
  await expect(page.getByText(/Сохранено на сервере в/u)).toBeVisible();

  const projectUrl = page.url().replace(/\/steps.*$/u, "");
  await page.goto(`${projectUrl}/hypothesis`);
  await page.getByLabel("Для кого").fill("Семьи, которые делают ремонт в новостройке");
  await page.getByRole("button", { name: "Подтвердить гипотезу" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText(/Изменение существенное/u)).toBeVisible();
  await dialog.getByLabel(/это гипотеза для проверки/u).check();
  await dialog.getByRole("button", { name: "Подтвердить" }).click();
  await expect(page.getByText(/Версия 2 подтверждена\. Результаты шагов \(1\) помечены/u)).toBeVisible();

  await page.getByText(/Версия 1 · Заменена новой версией/u).click();
  await page.goto(`${projectUrl}/steps/demand-check`);
  await expect(page.getByText(/Проверьте, актуален ли результат/u)).toBeVisible();
});

test("private pages require sign-in and another user's project is a 404", async ({ page, browser }) => {
  await page.goto("/projects");
  await expect(page).toHaveURL(/\/login\?next=%2Fprojects/u);

  await signIn(page, uniqueEmail("owner"), "/start/idea?niche=custom-furniture");
  await page.getByRole("button", { name: "Дальше" }).click();
  await page.getByRole("button", { name: "Собрать карточку" }).click();
  await page.getByRole("button", { name: "Сохранить в аккаунт" }).click();
  await expect(page).toHaveURL(/\/hypothesis\?created=1/u);
  const projectPath = new URL(page.url()).pathname.replace(/\/hypothesis$/u, "");
  const projectId = projectPath.split("/").pop()!;

  const other = await browser.newContext();
  const intruder = await other.newPage();
  await signIn(intruder, uniqueEmail("intruder"));
  const pageResponse = await intruder.goto(projectPath);
  expect(pageResponse?.status()).toBe(404);
  const apiResponse = await intruder.request.patch(`/api/projects/${projectId}`, {
    data: { title: "hijack" },
    headers: { origin: new URL(intruder.url()).origin },
  });
  expect(apiResponse.status()).toBe(404);
  await other.close();
});
