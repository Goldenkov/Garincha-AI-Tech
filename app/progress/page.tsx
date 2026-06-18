import type { Metadata } from "next";

import { Container } from "@/components/Container";
import { ProgressOverview } from "@/components/product/ProgressOverview";

export const metadata: Metadata = {
  title: "Прогресс",
  description: "Визуальная карта прохождения Бизнес Перезагрузка с AI.",
};

export default function ProgressPage() {
  return (
    <main className="py-12 sm:py-16">
      <Container className="space-y-8">
        <div className="max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">Progress tracker</p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-white sm:text-6xl">
            Визуальная карта прохождения
          </h1>
          <p className="mt-5 text-base leading-8 text-slate-300">
            Для MVP используется local React state. Позже этот прогресс можно связать с аккаунтом пользователя.
          </p>
        </div>
        <ProgressOverview />
      </Container>
    </main>
  );
}
