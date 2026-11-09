import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/site/Container";
import { PageIntro } from "@/components/site/PageIntro";
import { freeMiniRoute } from "@/lib/content";

export const metadata: Metadata = {
  title: "Бесплатный мини-маршрут",
  description: "Четыре коротких шага, чтобы найти главное предположение идеи и подготовить первую проверку. Без регистрации.",
};

export default function FreePage() {
  return (
    <main>
      <PageIntro
        eyebrow="Бесплатно, без регистрации"
        title="Мини-маршрут: от идеи к первому вопросу клиенту"
        lede="Четыре шага на 20 минут. Подойдёт, если хотите попробовать подход до того, как заводить проект."
      />
      <Container>
        <ol className="max-w-[48rem] divide-y divide-rule border-y border-rule">
          {freeMiniRoute.map((step, index) => (
            <li key={step.title} className="grid gap-4 py-8 sm:grid-cols-[3rem_1fr]">
              <span className="font-display text-2xl text-teal">{index + 1}</span>
              <div>
                <h2 className="font-display text-xl font-medium">
                  {step.title} <span className="ml-2 align-middle text-sm font-sans font-normal text-muted">{step.time}</span>
                </h2>
                <p className="prose-body mt-2">{step.instruction}</p>
                <p className="mt-4 rounded-md border border-rule bg-paper-raised p-4 text-[0.95rem] leading-relaxed">{step.template}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-12 max-w-[48rem]">
          <h2 className="subtitle">Хотите сохранить результат и получить план проверки?</h2>
          <p className="prose-body mt-3">Соберите карточку гипотезы — черновик работает без регистрации.</p>
          <Link href="/start" className="btn btn-primary mt-6">
            Собрать гипотезу
          </Link>
        </div>
      </Container>
    </main>
  );
}
