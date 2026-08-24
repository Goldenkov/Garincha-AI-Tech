import type { Metadata } from "next";

import { Container } from "@/components/Container";
import { ButtonLink } from "@/components/ui/button";
import { freeMiniRoute } from "@/lib/business-reboot-content";

export const metadata: Metadata = {
  title: "Бесплатный маршрут",
  description: "Бесплатный мини-маршрут Бизнес Перезагрузка с AI: без оплаты и без регистрации.",
};

export default function FreePage() {
  return (
    <main className="py-12 sm:py-16">
      <Container className="space-y-10">
        <section className="max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">Free мини-маршрут</p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-white sm:text-6xl">
            Соберите первый оффер за 20 минут — бесплатно
          </h1>
          <p className="mt-5 text-base leading-8 text-slate-300">
            Всё уже на этой странице: без оплаты, без регистрации и без ожидания письма.
            Пройдите 4 шага — и у вас будет первый оффер и понятное следующее действие.
          </p>
        </section>

        <section className="grid gap-4">
          {freeMiniRoute.map((step, index) => (
            <article
              key={step.title}
              className="rounded-[2rem] border border-white/10 bg-[#0b1020] p-5 sm:p-7"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-300/25 bg-cyan-300/[0.08] text-sm font-semibold text-cyan-100">
                  {(index + 1).toString().padStart(2, "0")}
                </span>
                <h2 className="text-xl font-semibold text-white sm:text-2xl">{step.title}</h2>
                <span className="rounded-full border border-white/10 bg-[#080d1a] px-3 py-1 text-xs text-slate-400">
                  {step.time}
                </span>
              </div>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400">{step.instruction}</p>
              <div className="mt-4 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Шаблон</p>
                <p className="mt-2 text-sm leading-7 text-slate-200">{step.template}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-[2rem] border border-cyan-300/20 bg-[#0b1020] p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">Понравился формат?</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                В PRO — полный маршрут из 9 миссий под вашу нишу
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                Контент, скрипты, возражения, квиз, структура лендинга, сохранение результатов
                и пакет первого запуска.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <ButtonLink href="/#lead" size="lg">Получить PRO-доступ</ButtonLink>
              <ButtonLink href="/demo" variant="secondary" size="lg">Посмотреть демо</ButtonLink>
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}
