import type { Metadata } from "next";
import Link from "next/link";

import { LogoutButtons, RedeemForm } from "@/components/app/AccountPanel";
import { StorageDown } from "@/components/app/StorageDown";
import { Container } from "@/components/site/Container";
import { requireViewer } from "@/lib/server/page-guards";
import { getProStatus } from "@/lib/server/projects";
import { StorageUnavailableError } from "@/lib/server/supabase";

export const metadata: Metadata = { title: "Аккаунт", robots: { index: false } };

const dateFormat = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" });

export default async function AccountPage() {
  const viewer = await requireViewer("/account");
  let pro;
  try {
    pro = await getProStatus(viewer.accessToken);
  } catch (error) {
    if (error instanceof StorageUnavailableError) return <StorageDown />;
    throw error;
  }

  return (
    <main>
      <Container className="pb-8 pt-10 sm:pt-14">
        <Link href="/projects" className="link text-sm text-muted">
          ← Мои проекты
        </Link>
        <h1 className="title mt-5">Аккаунт</h1>
        <p className="mt-3 text-muted">{viewer.user.email}</p>
      </Container>
      <Container className="grid max-w-[60rem] gap-12 md:grid-cols-2">
        <section aria-labelledby="pro-title" className="space-y-4">
          <h2 id="pro-title" className="subtitle">
            PRO-доступ
          </h2>
          {pro.active ? (
            <p className="chip chip-teal">Активен{pro.expiresAt ? ` до ${dateFormat.format(new Date(pro.expiresAt))}` : " бессрочно"}</p>
          ) : (
            <p className="text-ink-soft">
              Не активен.{" "}
              <Link href="/pro" className="link">
                Что даёт PRO
              </Link>
            </p>
          )}
          <RedeemForm />
        </section>
        <section aria-labelledby="session-title" className="space-y-4">
          <h2 id="session-title" className="subtitle">
            Вход
          </h2>
          <p className="prose-body">Вход по коду из письма, без пароля. Сессия действует до 30 дней без активности.</p>
          <LogoutButtons />
          <p className="text-sm text-muted">
            Выгрузка или удаление данных —{" "}
            <Link href="/feedback" className="link">
              через форму обратной связи
            </Link>
            .
          </p>
        </section>
      </Container>
    </main>
  );
}
