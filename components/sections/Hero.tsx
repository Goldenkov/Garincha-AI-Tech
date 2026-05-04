import { ArrowRight, ChevronDown, Sparkles } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/Animated";
import { ProductBoxVisual } from "@/components/ProductBoxVisual";
import { siteConfig } from "@/lib/content";

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-16 pt-10 sm:pt-16 lg:pb-24 lg:pt-20">
      <div className="absolute inset-0 -z-10 bg-radial-premium" aria-hidden="true" />
      <div
        className="absolute inset-0 -z-10 bg-hero-grid bg-[length:42px_42px] [mask-image:radial-gradient(circle_at_center,black,transparent_74%)]"
        aria-hidden="true"
      />
      <Container className="grid items-center gap-12 lg:grid-cols-[1.02fr_0.98fr]">
        <FadeIn className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-cyan-100">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {siteConfig.fullProductName}
          </div>

          <h1 className="max-w-4xl text-balance text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl lg:text-7xl">
            Соберите основу продвижения бизнеса с помощью ИИ за 1–2 вечера
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-base leading-8 text-slate-300 sm:text-lg">
            Готовый цифровой набор для владельцев малого бизнеса и самозанятых: промпты,
            контент-план, офферы, скрипты продаж, квизы, таблицы и структура лендинга —
            без агентства, сложной теории и лишних расходов.
          </p>

          <div className="mt-8 grid gap-3 sm:flex">
            <ButtonLink href="#lead" className="w-full sm:w-auto">
              {siteConfig.preorderCta}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </ButtonLink>
            <ButtonLink href="#inside" variant="secondary" className="w-full sm:w-auto">
              Посмотреть, что внутри
              <ChevronDown className="ml-2 h-4 w-4" aria-hidden="true" />
            </ButtonLink>
          </div>

          <p className="mt-5 max-w-xl text-sm text-slate-500">
            Без подключения оплаты на первом этапе: заявка фиксирует интерес к раннему доступу
            и запусковой цене.
          </p>
        </FadeIn>

        <FadeIn delay={0.15} className="lg:justify-self-end">
          <ProductBoxVisual />
        </FadeIn>
      </Container>
    </section>
  );
}
