import type { Metadata } from "next";

import { Container } from "@/components/Container";
import { ToolGrid } from "@/components/product/ToolGrid";

export const metadata: Metadata = {
  title: "Инструменты",
  description: "Карточки AI-инструментов для оффера, контента, скриптов, квиза, лендинга и таблиц.",
};

export default function ToolsPage() {
  return (
    <main className="py-12 sm:py-16">
      <Container>
        <div className="mb-10 max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">Инструменты</p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-white sm:text-6xl">
            Карточки действий вместо длинной базы знаний
          </h1>
          <p className="mt-5 text-base leading-8 text-slate-300">
            Каждый блок показывает время, ожидаемый результат, короткое объяснение, пример промпта,
            copy prompt placeholder и кнопку старта.
          </p>
        </div>
        <ToolGrid />
      </Container>
    </main>
  );
}
