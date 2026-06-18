import type { Metadata } from "next";

import { Container } from "@/components/Container";
import { NicheRoutes } from "@/components/product/NicheRoutes";

export const metadata: Metadata = {
  title: "Нишевые комплекты",
  description: "Маршруты по нишам для Бизнес Перезагрузка с AI.",
};

export default function NichesPage() {
  return (
    <main className="py-12 sm:py-16">
      <Container>
        <div className="mb-10 max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">Ниши</p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-white sm:text-6xl">
            Выберите маршрут под бизнес-модель
          </h1>
          <p className="mt-5 text-base leading-8 text-slate-300">
            Нишевые карточки помогают быстрее понять, какие инструменты открыть первыми и в каком порядке.
          </p>
        </div>
        <NicheRoutes />
      </Container>
    </main>
  );
}
