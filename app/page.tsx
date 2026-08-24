import dynamic from "next/dynamic";
import Link from "next/link";

import { Container } from "@/components/Container";
import { BeforeAfter } from "@/components/product/BeforeAfter";
import { HeroSection } from "@/components/product/HeroSection";
import { NicheRoutes } from "@/components/product/NicheRoutes";
import { PageLinkGrid } from "@/components/product/PageLinkGrid";
import { ProAccessSteps } from "@/components/product/ProAccessSteps";
import { ProExpectations } from "@/components/product/ProExpectations";
import { ToolGrid } from "@/components/product/ToolGrid";
import { ButtonLink } from "@/components/ui/button";
import { businessRebootConfig, dashboardFaq, landingPillars, routeModes } from "@/lib/business-reboot-content";

const RouteSelector = dynamic(() =>
  import("@/components/product/RouteSelector").then((mod) => mod.RouteSelector),
);

const LeadForm = dynamic(() => import("@/components/forms/LeadForm").then((mod) => mod.LeadForm));

export default function HomePage() {
  return (
    <>
      <HeroSection />

      <section className="py-12 sm:py-16 lg:py-24">
        <Container>
          <div className="grid gap-4 lg:grid-cols-3">
            {landingPillars.map((item) => (
              <article key={item.title} className="rounded-[1.5rem] border border-white/10 bg-[#0b1020] p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">{item.label}</p>
                <h2 className="mt-5 text-2xl font-semibold tracking-tight text-white">{item.title}</h2>
                <p className="mt-4 text-sm leading-7 text-slate-400">{item.description}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <BeforeAfter />

      <section className="py-12 sm:py-16 lg:py-24" id="inside">
        <Container>
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">Инструменты</p>
              <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                Не читать простыню текста — открывать нужный блок и делать шаг
              </h2>
            </div>
            <ButtonLink href="/tools" variant="outline" className="w-full sm:w-auto">
              Все инструменты
            </ButtonLink>
          </div>
          <ToolGrid limit={4} />
        </Container>
      </section>

      <section className="py-12 sm:py-16 lg:py-24">
        <Container>
          <RouteSelector />
        </Container>
      </section>

      <section className="py-12 sm:py-16 lg:py-24" id="dashboard-preview">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">
                Demo preview
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                PRO ощущается как рабочий cockpit, а не как папка с документами
              </h2>
              <p className="mt-5 text-base leading-8 text-slate-300">
                Внутри — маршруты, прогресс, карточки инструментов, нишевые подсказки и следующий
                рекомендуемый шаг. Закрытые Google Drive материалы не публикуются в открытом доступе.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/demo" size="lg">
                  Открыть демо
                </ButtonLink>
                <ButtonLink href="/quick-start" variant="secondary" size="lg">
                  Начать за 60 минут
                </ButtonLink>
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-[#0b1020] p-5">
              {routeModes.map((route, index) => (
                <div key={route.name} className="border-b border-white/10 py-5 last:border-b-0">
                  <div className="flex items-start justify-between gap-3 sm:items-center sm:gap-4">
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        {(index + 1).toString().padStart(2, "0")} / маршрут
                      </p>
                      <h3 className="mt-2 text-xl font-semibold text-white">{route.name}</h3>
                    </div>
                    <span className="shrink-0 rounded-full border border-cyan-300/20 bg-cyan-300/[0.08] px-3 py-1 text-xs text-cyan-100">
                      {route.duration}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{route.description}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="py-12 sm:py-16 lg:py-24" id="audience">
        <Container>
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">Нишевые маршруты</p>
              <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                Быстрее найти свой путь, если начать с похожей бизнес-модели
              </h2>
            </div>
            <ButtonLink href="/niches" variant="outline" className="w-full sm:w-auto">
              Все ниши
            </ButtonLink>
          </div>
          <NicheRoutes limit={3} />
        </Container>
      </section>

      <ProExpectations />

      <section className="py-12 sm:py-16 lg:py-24" id="price">
        <Container>
          <div className="relative overflow-hidden rounded-[1.5rem] border border-cyan-300/20 bg-[#0b1020] p-5 sm:rounded-[2rem] sm:p-8 lg:p-12">
            <div className="grid gap-6 sm:gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200 sm:tracking-[0.26em]">PRO на первом запуске</p>
                <p className="mt-4 text-7xl font-black tracking-tight text-white">{businessRebootConfig.price}</p>
              </div>
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-white">
                  Практический интерфейс поверх базы знаний: маршрут, инструменты и первые действия.
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  Это не обещание гарантированного дохода. Это способ быстрее навести порядок в продвижении
                  и подготовить материалы для проверки спроса.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <ButtonLink href="#lead" size="lg">{businessRebootConfig.primaryCta}</ButtonLink>
                  <ButtonLink href="/free" variant="secondary" size="lg">Получить бесплатный маршрут</ButtonLink>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <ProAccessSteps />

      <Container>
        <LeadForm />
      </Container>

      <section className="py-12 sm:py-16 lg:py-24" id="faq">
        <Container>
          <div className="mx-auto max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">FAQ</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              Важные уточнения без инфобизнесового шума
            </h2>
            <div className="mt-8 grid gap-4">
              {dashboardFaq.map((item) => (
                <details key={item.question} className="rounded-2xl border border-white/10 bg-[#0b1020] p-4 sm:rounded-3xl sm:p-6">
                  <summary className="cursor-pointer text-left text-base font-semibold text-white sm:text-lg">{item.question}</summary>
                  <p className="mt-4 text-sm leading-7 text-slate-400">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="py-12 sm:py-16 lg:py-24">
        <Container>
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">Навигация</p>
              <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                Все страницы продукта в одном месте
              </h2>
            </div>
            <ButtonLink href="/site-map" variant="outline" className="w-full sm:w-auto">
              Полная карта сайта
            </ButtonLink>
          </div>
          <PageLinkGrid compact />
        </Container>
      </section>

      <section className="py-12 sm:py-16 lg:py-20">
        <Container>
          <div className="rounded-[1.5rem] border border-white/10 bg-[#0b1020] p-5 text-center sm:rounded-[2rem] sm:p-8 lg:p-12">
            <h2 className="mx-auto max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              Начните не с длинного курса, а с понятного следующего действия
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-400">
              Откройте демо, выберите маршрут и посмотрите, как продукт будет работать как интерфейс
              над вашей базой знаний.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink href="/dashboard" size="lg">Открыть PRO dashboard</ButtonLink>
              <Link href="/feedback" className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-slate-300 hover:text-white">
                Оставить обратную связь
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
