import type { Metadata } from "next";

import { Container } from "@/components/Container";
import { DashboardPreview } from "@/components/product/HeroSection";
import { ProAccessSteps } from "@/components/product/ProAccessSteps";
import { ProExpectations } from "@/components/product/ProExpectations";
import { RouteSelector } from "@/components/product/RouteSelector";
import { ToolGrid } from "@/components/product/ToolGrid";
import { ButtonLink } from "@/components/ui/button";
import { businessRebootConfig } from "@/lib/business-reboot-content";

export const metadata: Metadata = {
  title: "PRO Overview",
  description: "Что входит в PRO-доступ Бизнес Перезагрузка с AI.",
};

export default function ProPage() {
  return (
    <main className="py-12 sm:py-16">
      <Container className="space-y-12">
        <section className="grid items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">PRO overview</p>
            <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-white sm:text-6xl">
              PRO — это интерфейс для сборки основы продвижения
            </h1>
            <p className="mt-5 text-base leading-8 text-slate-300">
              Внутри — маршруты, карточки инструментов, прогресс, нишевые подсказки и структура действий.
              Не обещаем гарантированный доход; даём понятный способ подготовить первые материалы.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/demo" size="lg">Открыть демо</ButtonLink>
              <ButtonLink href="/#lead" variant="secondary" size="lg">{businessRebootConfig.primaryCta}</ButtonLink>
            </div>
          </div>
          <DashboardPreview />
        </section>

        <RouteSelector />

        <section className="space-y-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">PRO tools</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Основные блоки внутри</h2>
          </div>
          <ToolGrid limit={4} />
        </section>

        <ProExpectations />

        <ProAccessSteps compact />
      </Container>
    </main>
  );
}
