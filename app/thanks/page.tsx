import Link from "next/link";

import { Container } from "@/components/Container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Заявка получена | Бизнес Перезагрузка с AI",
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
              Следующий шаг — мы свяжемся с вами, отправим условия первого запуска и инструкцию,
              как получить код доступа к PRO-зоне после оплаты.
            </p>
            <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">01</p>
                <p className="text-sm font-semibold text-white">Проверим заявку</p>
                <p className="mt-1 text-sm text-slate-400">
                  Посмотрим нишу и главную цель, чтобы отправить релевантные условия доступа.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">02</p>
                <p className="text-sm font-semibold text-white">Отправим оплату</p>
                <p className="mt-1 text-sm text-slate-400">
                  На первом запуске доступ выдаётся вручную: без сложной корзины и лишнего шума.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">03</p>
                <p className="text-sm font-semibold text-white">Выдадим PRO-код</p>
                <p className="mt-1 text-sm text-slate-400">
                  После оплаты вы сможете открыть AI-карту, миссии и пакет первого запуска.
                </p>
              </div>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild>
                <Link href="/demo">Посмотреть демо</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/access">У меня уже есть код</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">Вернуться на главную</Link>
              </Button>
            </div>
          </Card>
        </Container>
      </section>
    </main>
  );
}
