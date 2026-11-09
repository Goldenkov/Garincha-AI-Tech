import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/site/Container";
import { PageIntro } from "@/components/site/PageIntro";
import { catalogNiches, entryThresholdLabels } from "@/lib/catalog";
import { businessModelIds, businessModels } from "@/lib/domain/business-models";

export const metadata: Metadata = {
  title: "Каталог направлений",
  description: "Направления малого бизнеса с порогом входа, рисками и первым тестом спроса. Без регистрации.",
};

export default function NichesPage() {
  return (
    <main>
      <PageIntro
        eyebrow="Каталог · без регистрации"
        title="Направления, которые можно проверить до вложений"
        lede="У каждого направления — модель заработка, порог входа, риски и первый тест спроса. Это стартовые шаблоны, а не исследования рынка: всё проверяется на ваших клиентах."
      />
      <Container>
        {businessModelIds.map((modelId) => {
          const niches = catalogNiches.filter((niche) => niche.models.includes(modelId));
          return (
            <section key={modelId} aria-labelledby={`model-${modelId}`} className="mb-14">
              <div className="flex flex-wrap items-baseline justify-between gap-3 border-b-2 border-ink pb-3">
                <h2 id={`model-${modelId}`} className="subtitle">
                  {businessModels[modelId].title}
                </h2>
                <p className="text-sm text-muted">{businessModels[modelId].short}</p>
              </div>
              <ul className="grid gap-x-10 sm:grid-cols-2">
                {niches.map((niche) => (
                  <li key={niche.id} className="border-b border-rule">
                    <Link href={`/niches/${niche.id}?model=${modelId}`} className="group block py-5">
                      <span className="flex items-baseline justify-between gap-4">
                        <span className="font-display text-xl font-medium group-hover:text-teal">{niche.title}</span>
                        <span className="text-teal transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">
                          →
                        </span>
                      </span>
                      <span className="mt-1.5 block text-[0.95rem] leading-relaxed text-ink-soft">{niche.summary}</span>
                      <span className="mt-3 flex flex-wrap gap-2">
                        <span className="chip">{entryThresholdLabels[niche.entryThreshold]}</span>
                        <span className="chip">{niche.difficulty}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
        <div className="notice max-w-[48rem]">
          Не нашли своё направление? <Link href="/start/idea" className="link font-medium">Опишите свою идею</Link> — карточка гипотезы
          соберётся на основе выбранной модели.
        </div>
      </Container>
    </main>
  );
}
