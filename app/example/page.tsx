import type { Metadata } from "next";
import Link from "next/link";

import { HeroCard } from "@/components/landing/HeroCard";
import { Container } from "@/components/site/Container";
import { businessModels, validationMethodLabels } from "@/lib/domain/business-models";
import { exampleHypothesis as ex } from "@/lib/example";

export const metadata: Metadata = {
  title: "Пример карточки гипотезы",
  description: "Демонстрационный пример: как выглядит карточка гипотезы и план первой проверки спроса для мебели на заказ.",
};

export default function ExamplePage() {
  return (
    <main>
      <Container className="grid items-start gap-12 pb-12 pt-10 sm:pt-14 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <p className="eyebrow">Демонстрационный пример</p>
          <h1 className="title mt-3 !text-[clamp(2.1rem,1.3rem+3vw,3.4rem)]">Как выглядит путь от идеи до первого теста</h1>
          <p className="lede mt-5 max-w-[46ch]">
            Вымышленный проект «{ex.title}». Цифры — критерии проверки, а не данные рынка: их задаёт сам предприниматель до интервью.
          </p>
        </div>
        <HeroCard />
      </Container>

      <Container className="max-w-[52rem]">
        <ol className="space-y-14">
          <li>
            <p className="eyebrow">1 · Идея</p>
            <p className="mt-3 font-display text-2xl italic leading-snug text-ink-soft">«{ex.ideaNote}»</p>
          </li>
          <li>
            <p className="eyebrow">2 · Карточка гипотезы</p>
            <dl className="mt-4 divide-y divide-rule border-y border-rule">
              {[
                ["Модель", businessModels.made_to_order.title],
                ["Для кого", ex.targetCustomer],
                ["Задача клиента", ex.customerProblem],
                ["Ценность", ex.proposedValue],
                ["Как зарабатываем", ex.revenueModel],
              ].map(([label, text]) => (
                <div key={label} className="grid gap-1 py-3.5 sm:grid-cols-[11rem_1fr] sm:gap-4">
                  <dt className="font-display font-medium">{label}</dt>
                  <dd className="text-ink-soft">{text}</dd>
                </div>
              ))}
              <div className="grid gap-1 py-3.5 sm:grid-cols-[11rem_1fr] sm:gap-4">
                <dt className="font-display font-medium">Предположения</dt>
                <dd className="space-y-1 text-ink-soft">
                  {ex.assumptions.map((item) => (
                    <p key={item}>
                      <span className="chip chip-amber mr-2 align-middle">не проверено</span>
                      {item}
                    </p>
                  ))}
                </dd>
              </div>
              <div className="grid gap-1 py-3.5 sm:grid-cols-[11rem_1fr] sm:gap-4">
                <dt className="font-display font-medium">Риски</dt>
                <dd className="text-ink-soft">{ex.risks.join("; ")}</dd>
              </div>
            </dl>
          </li>
          <li>
            <p className="eyebrow">3 · Подтверждение</p>
            <p className="prose-body mt-3">
              Предприниматель читает карточку и подтверждает: «Это гипотеза для проверки, а не подтверждённый спрос». Только после этого открывается первый
              шаг.
            </p>
          </li>
          <li>
            <p className="eyebrow">4 · Первая проверка спроса</p>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              {[
                ["Способ", validationMethodLabels.interviews],
                ["Кого спросить", ex.validation.audience],
                ["Сколько", `${ex.validation.count} человек за 14 дней`],
                ["Сигнал продолжать", ex.validation.successSignal],
                ["Сигнал остановиться", ex.validation.stopSignal],
              ].map(([label, text]) => (
                <div key={label} className="border-t border-rule pt-3">
                  <dt className="text-sm text-muted">{label}</dt>
                  <dd className="mt-1">{text}</dd>
                </div>
              ))}
            </dl>
          </li>
          <li>
            <p className="eyebrow">5 · Решение</p>
            <p className="prose-body mt-3">
              После интервью — одно из трёх: продолжать и переходить к упаковке предложения, изменить гипотезу (новая версия, старая сохраняется в истории) или
              остановиться без потерь на запуск.
            </p>
          </li>
        </ol>
        <div className="mt-14 flex flex-wrap gap-4 border-t border-rule pt-10">
          <Link href="/start" className="btn btn-primary btn-lg">
            Собрать свою карточку
          </Link>
          <Link href="/niches" className="btn btn-secondary btn-lg">
            Открыть каталог
          </Link>
        </div>
      </Container>
    </main>
  );
}
