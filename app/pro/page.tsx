import type { Metadata } from "next";
import Link from "next/link";

import { PublicForm } from "@/components/forms/PublicForm";
import { Container } from "@/components/site/Container";
import { PageIntro } from "@/components/site/PageIntro";
import { formGoalOptions, proIncluded, proNotIncluded } from "@/lib/content";
import { stepDefinitions } from "@/lib/steps";

export const metadata: Metadata = {
  title: "PRO-доступ",
  description: "Миссии запуска после первой проверки спроса: оффер, контент, скрипты, возражения, квиз, страница и пакет запуска.",
};

export default function ProPage() {
  return (
    <main>
      <PageIntro
        eyebrow="PRO-доступ"
        title="Когда первая проверка пройдена — собираем запуск"
        lede="Бесплатно: карточка гипотезы, проверка спроса и разведка рынка. PRO открывает следующие миссии и пакет первого запуска для вашего проекта."
      >
        <div className="mt-8 flex flex-wrap gap-4">
          <a href="#request" className="btn btn-primary btn-lg">
            Запросить доступ
          </a>
          <Link href="/account" className="btn btn-secondary btn-lg">
            У меня есть код
          </Link>
        </div>
      </PageIntro>

      <section id="inside" aria-labelledby="inside-title" className="border-t border-rule py-16">
        <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 id="inside-title" className="title">
              Что внутри
            </h2>
            <ul className="prose-body mt-6 space-y-3">
              {proIncluded.map((item) => (
                <li key={item} className="flex gap-3">
                  <span aria-hidden="true" className="text-teal">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <h3 className="mt-10 font-display text-lg font-medium">Чего нет</h3>
            <ul className="prose-body mt-3 space-y-2">
              {proNotIncluded.map((item) => (
                <li key={item} className="flex gap-3">
                  <span aria-hidden="true" className="text-muted">
                    —
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <ol className="divide-y divide-rule border-y border-rule">
            {stepDefinitions.map((step) => (
              <li key={step.id} className="flex items-baseline justify-between gap-4 py-4">
                <span>
                  <span className="mr-3 font-display text-teal">{step.stage + 1}</span>
                  {step.title}
                </span>
                <span className={step.requiresPro ? "chip" : "chip chip-teal"}>{step.requiresPro ? "PRO" : "Бесплатно"}</span>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section id="request" aria-labelledby="request-title" className="border-t border-rule py-16">
        <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 id="request-title" className="title">
              Запросить доступ
            </h2>
            <p className="prose-body mt-4 max-w-[40ch]">
              Оплата на сайте пока не подключена. Оставьте заявку — пришлём условия и персональный код. Код активируется в вашем аккаунте и
              работает только для вас.
            </p>
          </div>
          <div className="max-w-[40rem]">
            <PublicForm
              endpoint="/api/leads"
              successHref="/thanks?type=lead"
              submitLabel="Отправить заявку"
              fields={[
                { name: "name", label: "Имя", type: "text", required: true, autoComplete: "name", maxLength: 120 },
                { name: "email", label: "Email", type: "email", required: true, autoComplete: "email", maxLength: 254 },
                { name: "telegram", label: "Telegram", type: "text", maxLength: 64, hint: "Если удобнее общаться там" },
                { name: "businessNiche", label: "Направление или идея", type: "text", required: true, maxLength: 300 },
                { name: "mainGoal", label: "Главная цель", type: "select", required: true, options: formGoalOptions },
              ]}
            />
          </div>
        </Container>
      </section>
    </main>
  );
}
