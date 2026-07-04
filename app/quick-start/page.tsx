import type { Metadata } from "next";

import { Container } from "@/components/Container";
import { QuickStartTimeline } from "@/components/product/QuickStartTimeline";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Быстрый результат за 60 минут",
  description: "60-минутный маршрут Бизнес Перезагрузка с AI.",
};

export default function QuickStartPage() {
  return (
    <main className="py-12 sm:py-16">
      <Container className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
        <section className="lg:sticky lg:top-24">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">Быстрый старт</p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-white sm:text-6xl">
            Быстрый результат за 60 минут
          </h1>
          <p className="mt-5 text-base leading-8 text-slate-300">
            Короткий маршрут для первого рабочего черновика: описание бизнеса, оффер, 7 тем контента,
            первый скрипт и следующий шаг для проверки спроса.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:flex-col">
            <ButtonLink href="/tools" size="lg">Открыть инструменты</ButtonLink>
            <ButtonLink href="/dashboard" variant="secondary" size="lg">Открыть PRO dashboard</ButtonLink>
          </div>
        </section>
        <QuickStartTimeline />
      </Container>
    </main>
  );
}
