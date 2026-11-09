import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/flow/LoginForm";
import { Container } from "@/components/site/Container";
import { sanitizeNextPath } from "@/lib/safe-redirect";
import { getSupabaseConfig } from "@/lib/server/config";
import { getViewer } from "@/lib/server/session";

export const metadata: Metadata = {
  title: "Вход",
  robots: { index: false },
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = sanitizeNextPath((await searchParams).next);
  if (await getViewer()) redirect(next);
  const configured = Boolean(getSupabaseConfig());

  return (
    <main>
      <Container className="grid gap-12 py-12 sm:py-16 lg:grid-cols-[1fr_1fr]">
        <div>
          <p className="eyebrow">Вход</p>
          <h1 className="title mt-3">Сохраните проект и продолжайте с любого устройства</h1>
          <p className="lede mt-5 max-w-[40ch]">Вход по коду из письма. Проекты видите только вы.</p>
        </div>
        <div className="max-w-[28rem]">
          {configured ? (
            <LoginForm next={next} />
          ) : (
            <p className="notice notice-amber" role="status">
              Вход временно недоступен: сервер хранения не настроен. Каталог и черновик идеи работают без входа.
            </p>
          )}
          <p className="mt-8 text-sm text-muted">
            Продолжая, вы соглашаетесь с{" "}
            <Link href="/terms" className="link">
              условиями
            </Link>{" "}
            и{" "}
            <Link href="/privacy" className="link">
              политикой конфиденциальности
            </Link>
            .
          </p>
        </div>
      </Container>
    </main>
  );
}
