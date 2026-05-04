import Link from "next/link";

import { Container } from "@/components/Container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Заявка получена | Garincha AI-Tech",
};

export default function ThanksPage() {
  return (
    <main>
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 -z-10 bg-radial-premium opacity-80" />
        <Container className="mx-auto max-w-3xl text-center">
          <Card className="p-8 sm:p-12">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl border border-cyan-300/30 bg-cyan-300/10 text-cyan-200 shadow-cyan-glow">
              <span className="h-2.5 w-8 rounded-full bg-cyan-200 shadow-cyan-glow" aria-hidden="true" />
            </div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200">
              Заявка принята
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              Спасибо! Мы зафиксировали ваш интерес.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-300">
              Это MVP-форма без реальной отправки данных. При подключении API, Supabase,
              n8n webhook или Telegram bot здесь можно будет показывать следующий шаг,
              ссылку на оплату или материалы раннего доступа.
            </p>
            <div className="mt-8 grid gap-3 text-left sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">Email</p>
                <p className="text-sm font-semibold text-white">Проверьте email</p>
                <p className="mt-1 text-sm text-slate-400">
                  После реальной интеграции письмо или уведомление можно отправлять автоматически.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">Telegram</p>
                <p className="text-sm font-semibold text-white">Telegram для связи</p>
                <p className="mt-1 text-sm text-slate-400">
                  Поле Telegram уже есть в формах для быстрого контакта с заявкой.
                </p>
              </div>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild>
                <Link href="/">Вернуться на главную</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/partners">Партнёрская программа</Link>
              </Button>
            </div>
          </Card>
        </Container>
      </section>
    </main>
  );
}
