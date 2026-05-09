import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/Animated";
import { ProductBoxVisual } from "@/components/ProductBoxVisual";
import { heroMetrics, siteConfig } from "@/lib/content";

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-16 pt-10 sm:pt-16 lg:pb-24 lg:pt-20">
      <div className="absolute inset-0 -z-10 bg-radial-premium" aria-hidden="true" />
      <div
        className="absolute inset-0 -z-10 bg-hero-grid bg-[length:42px_42px] [mask-image:radial-gradient(circle_at_center,black,transparent_74%)]"
        aria-hidden="true"
      />
      <Container className="grid items-center gap-10 xl:grid-cols-[minmax(0,1.02fr)_minmax(430px,0.98fr)] xl:gap-12">
        <FadeIn className="max-w-3xl xl:max-w-none">
          <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-cyan-100">
            <span className="h-px w-6 bg-gradient-to-r from-transparent to-cyan-200" aria-hidden="true" />
            {siteConfig.fullProductName}
          </div>

          <h1 className="max-w-4xl text-balance text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl xl:text-7xl">
            Соберите основу продвижения бизнеса с помощью ИИ за 1–2 вечера
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-base leading-8 text-slate-300 sm:text-lg">
            Готовый цифровой набор для владельцев малого бизнеса и самозанятых: промпты,
            контент-план, офферы, скрипты продаж, квизы, таблицы и структура лендинга —
            без агентства, сложной теории и лишних расходов.
          </p>

          <div className="mt-8 grid gap-3 sm:flex sm:items-center">
            <ButtonLink
              href="#lead"
              size="lg"
              className="group relative w-full overflow-hidden px-5 py-4 text-base shadow-[0_0_42px_rgba(103,232,249,0.42)] sm:w-auto sm:px-6"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition duration-700 group-hover:translate-x-full" />
              <span className="relative flex w-full items-center justify-center">
                <span className="hidden sm:inline">{siteConfig.preorderCta}</span>
                <span className="sm:hidden">Забронировать за {siteConfig.price}</span>
                <span className="ml-2 transition group-hover:translate-x-0.5" aria-hidden="true">
                  →
                </span>
              </span>
            </ButtonLink>
            <ButtonLink href="#inside" variant="secondary" className="w-full sm:w-auto">
              Посмотреть, что внутри
              <span className="ml-2" aria-hidden="true">
                ↓
              </span>
            </ButtonLink>
          </div>

          <div className="mt-4 flex max-w-xl items-start gap-2 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] px-4 py-3 text-sm leading-6 text-cyan-50/90 sm:inline-flex">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-200 shadow-[0_0_18px_rgba(103,232,249,0.8)]" aria-hidden="true" />
            <span>
              Без оплаты сейчас: заявка фиксирует интерес к раннему доступу и запусковой цене {siteConfig.price}.
            </span>
          </div>

          <div className="mt-8 grid max-w-2xl grid-cols-3 overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.035] backdrop-blur-xl">
            {heroMetrics.map((metric) => (
              <div key={metric.label} className="border-r border-white/10 px-4 py-4 last:border-r-0 sm:px-5">
                <p className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{metric.value}</p>
                <p className="mt-1 text-[0.68rem] uppercase tracking-[0.18em] text-slate-500 sm:text-xs">
                  {metric.label}
                </p>
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.15} className="w-full min-w-0 xl:justify-self-end">
          <ProductBoxVisual />
        </FadeIn>
      </Container>
    </section>
  );
}
