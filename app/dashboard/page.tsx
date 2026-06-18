import type { Metadata } from "next";

import { Container } from "@/components/Container";
import { FeedbackBlock } from "@/components/product/FeedbackBlock";
import { ProgressOverview } from "@/components/product/ProgressOverview";
import { RouteSelector } from "@/components/product/RouteSelector";
import { ToolGrid } from "@/components/product/ToolGrid";
import { NicheRoutes } from "@/components/product/NicheRoutes";
import { PageLinkGrid } from "@/components/product/PageLinkGrid";
import { ButtonLink } from "@/components/ui/button";
import { businessRebootConfig } from "@/lib/business-reboot-content";

export const metadata: Metadata = {
  title: "PRO Dashboard",
  description: "Демонстрация интерфейса Бизнес Перезагрузка с AI.",
};

export default function DashboardPage() {
  return (
    <main className="py-12 sm:py-16">
      <Container className="space-y-10">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-glow backdrop-blur-xl sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">PRO dashboard</p>
          <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="max-w-4xl text-4xl font-black tracking-[-0.04em] text-white sm:text-6xl">
                {businessRebootConfig.publicName}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">
                Соберите основу продвижения за 1–2 вечера: оффер, контент, скрипты, квиз,
                структуру лендинга и первые действия для проверки спроса.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <ButtonLink href="/quick-start" size="lg">{businessRebootConfig.startCta}</ButtonLink>
              <ButtonLink href="#routes" variant="secondary" size="lg">{businessRebootConfig.routeCta}</ButtonLink>
            </div>
          </div>
        </section>

        <ProgressOverview />
        <RouteSelector />

        <section className="space-y-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">Инструменты</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Откройте нужный блок</h2>
          </div>
          <ToolGrid limit={4} />
        </section>

        <section className="space-y-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">Ниши</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Маршруты по бизнес-модели</h2>
          </div>
          <NicheRoutes limit={3} />
        </section>

        <section className="rounded-[2rem] border border-cyan-300/20 bg-cyan-300/[0.08] p-6 shadow-cyan-glow backdrop-blur-xl sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">Следующее действие</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Начните с брифа и оффера</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Эти два блока улучшают качество контента, скриптов, квиза и структуры лендинга.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <ButtonLink href="/tools" size="lg">Перейти к инструментам</ButtonLink>
              <ButtonLink href="/launch-kit" variant="secondary" size="lg">Открыть пакет запуска</ButtonLink>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">Все разделы</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Быстрые переходы</h2>
            </div>
            <ButtonLink href="/site-map" variant="outline">Полная карта</ButtonLink>
          </div>
          <PageLinkGrid compact />
        </section>

        <FeedbackBlock />
      </Container>
    </main>
  );
}
