import type { Metadata } from "next";
import { ArrowRight, BadgePercent, Handshake } from "lucide-react";

import { Container } from "@/components/Container";
import { PartnerForm } from "@/components/forms/PartnerForm";
import { PartnerBenefits } from "@/components/sections/PartnerBenefits";
import { ButtonLink } from "@/components/ui/button";
import { siteConfig } from "@/lib/content";

export const metadata: Metadata = {
  title: "Партнёрская программа",
  description:
    "Партнёрская программа для авторов каналов, сообществ, экспертов и владельцев аудиторий малого бизнеса.",
};

export default function PartnersPage() {
  return (
    <main>
      <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
        <div className="absolute inset-0 -z-10 bg-radial-premium opacity-70" />
        <Container className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100">
              <Handshake className="size-4" aria-hidden="true" />
              Партнёрам Garincha AI-Tech
            </div>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Зарабатывайте на продвижении ИИ-Комплекта для бизнеса 2026
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Партнёрская программа для авторов каналов, сообществ, экспертов и владельцев аудиторий
              малого бизнеса.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="#partner-form" size="lg">
                Стать партнёром
                <ArrowRight className="ml-2 size-4" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="/" variant="outline" size="lg">
                Посмотреть продукт
              </ButtonLink>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-glow backdrop-blur-2xl">
            <div className="rounded-[1.5rem] border border-cyan-300/20 bg-slate-950/70 p-6">
              <BadgePercent className="size-10 text-cyan-200" aria-hidden="true" />
              <p className="mt-6 text-sm uppercase tracking-[0.3em] text-slate-500">Partner kit</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">{siteConfig.product}</h2>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                Заложены места под партнёрские метки, UTM, аналитику, отчётность и готовые промо-материалы
                после запуска программы.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-slate-300">
                {["Посты", "Креативы", "UTM", "Отчётность"].map((item) => (
                  <span key={item} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <PartnerBenefits />

      <section id="partner-form" className="scroll-mt-24 py-16 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200">Заявка</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Расскажите об аудитории
            </h2>
            <p className="mt-4 text-slate-300">
              Пока форма работает в режиме mock-submit. Контракт полей уже подготовлен для будущего
              webhook, CRM, Telegram-бота или партнёрского кабинета.
            </p>
          </div>
          <PartnerForm />
        </Container>
      </section>
    </main>
  );
}
