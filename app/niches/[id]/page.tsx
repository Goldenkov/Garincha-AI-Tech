import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/site/Container";
import { catalogNiches, entryThresholdLabels, getNiche, timeIntensityLabels } from "@/lib/catalog";
import { businessModels, isBusinessModelId, validationMethodLabels } from "@/lib/domain/business-models";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ model?: string }> };

export function generateStaticParams() {
  return catalogNiches.map((niche) => ({ id: niche.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const niche = getNiche((await params).id);
  return niche ? { title: niche.title, description: niche.summary } : {};
}

export default async function NichePage({ params, searchParams }: Props) {
  const niche = getNiche((await params).id);
  if (!niche) notFound();
  const requested = (await searchParams).model;
  const model = isBusinessModelId(requested) && niche.models.includes(requested) ? requested : niche.models[0];

  return (
    <main>
      <Container className="pb-8 pt-8 sm:pt-12">
        <nav aria-label="Навигация по разделу" className="text-sm">
          <Link href="/niches" className="link text-muted">
            ← Каталог
          </Link>
        </nav>
        <p className="eyebrow mt-6">{niche.models.map((id) => businessModels[id].title).join(" · ")}</p>
        <h1 className="title mt-3 !text-[clamp(2.1rem,1.3rem+3vw,3.4rem)]">{niche.title}</h1>
        <p className="lede mt-4 max-w-[52ch]">{niche.summary}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="chip">{entryThresholdLabels[niche.entryThreshold]}</span>
          <span className="chip">{timeIntensityLabels[niche.timeIntensity]}</span>
          <span className="chip">{niche.difficulty}</span>
        </div>
      </Container>

      <Container className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-10">
          <section aria-labelledby="starter-title">
            <h2 id="starter-title" className="subtitle">
              Стартовая гипотеза
            </h2>
            <p className="mt-1 text-sm text-muted">Шаблон для редактирования. Не проверен на вашем рынке.</p>
            <dl className="mt-4 divide-y divide-rule border-y border-rule">
              {[
                ["Для кого", niche.starter.targetCustomer],
                ["Задача клиента", niche.starter.customerProblem],
                ["Ценность", niche.starter.proposedValue],
                ["Как зарабатываем", niche.starter.revenueModel],
              ].map(([label, text]) => (
                <div key={label} className="grid gap-1 py-3.5 sm:grid-cols-[11rem_1fr] sm:gap-4">
                  <dt className="font-display font-medium">{label}</dt>
                  <dd className="text-ink-soft">{text}</dd>
                </div>
              ))}
              <div className="grid gap-1 py-3.5 sm:grid-cols-[11rem_1fr] sm:gap-4">
                <dt className="font-display font-medium">Предположения</dt>
                <dd>
                  <ul className="space-y-1 text-ink-soft">
                    {niche.starter.assumptions.map((item) => (
                      <li key={item}>
                        <span className="chip chip-amber mr-2 align-middle">не проверено</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="check-title">
            <h2 id="check-title" className="subtitle">
              Первый тест спроса
            </h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              {[
                ["Способ", validationMethodLabels[niche.validation.method]],
                ["Кого спросить", niche.validation.audience],
                ["Сколько контактов", String(niche.validation.targetCount)],
                ["Сигнал продолжать", niche.validation.successSignal],
                ["Сигнал остановиться", niche.validation.stopSignal],
              ].map(([label, text]) => (
                <div key={label} className="border-t border-rule pt-3">
                  <dt className="text-sm text-muted">{label}</dt>
                  <dd className="mt-1">{text}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <aside className="space-y-8 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:self-start">
          <div className="panel p-6">
            <h2 className="font-display text-xl font-medium">Начать с этого направления</h2>
            {niche.models.length > 1 ? (
              <p className="mt-2 text-sm text-muted">Выберите модель — от неё зависят типичные риски и способ проверки.</p>
            ) : null}
            <div className="mt-4 grid gap-3">
              {niche.models.map((id) => (
                <Link
                  key={id}
                  href={`/start/idea?niche=${niche.id}&model=${id}`}
                  className={id === model ? "btn btn-primary" : "btn btn-secondary"}
                >
                  {niche.models.length > 1 ? `Собрать гипотезу: ${businessModels[id].title.toLowerCase()}` : "Собрать гипотезу"}
                </Link>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted">Черновик собирается без регистрации и хранится в вашем браузере.</p>
          </div>
          <section aria-labelledby="needs-title">
            <h2 id="needs-title" className="font-display text-lg font-medium">
              Что понадобится
            </h2>
            <ul className="prose-body mt-3 list-disc space-y-1.5 pl-5">
              {niche.requirements.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-muted">{niche.entryNote}</p>
          </section>
          <section aria-labelledby="risks-title">
            <h2 id="risks-title" className="font-display text-lg font-medium">
              Риски
            </h2>
            <ul className="prose-body mt-3 list-disc space-y-1.5 pl-5">
              {niche.risks.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="notice notice-amber mt-4 text-sm">{niche.industryNotes}</p>
          </section>
        </aside>
      </Container>
    </main>
  );
}
