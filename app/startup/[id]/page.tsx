import type { Metadata } from "next";
import Link from "next/link";

import { ProjectActions } from "@/components/app/ProjectActions";
import { StorageDown } from "@/components/app/StorageDown";
import { Container } from "@/components/site/Container";
import { getNiche } from "@/lib/catalog";
import { businessModels } from "@/lib/domain/business-models";
import { nextStep, stepStateLabels, stepViews, type StepView } from "@/lib/domain/journey-state";
import { loadProjectPage } from "@/lib/server/page-guards";

export const metadata: Metadata = { title: "Проект", robots: { index: false } };

const chipClass: Record<StepView["state"], string> = {
  completed: "chip chip-success",
  in_progress: "chip chip-teal",
  needs_revision: "chip chip-amber",
  available: "chip",
  locked_hypothesis: "chip",
  locked_pro: "chip",
};

const decisionLabels: Record<string, string> = {
  continue: "Продолжать — сигналы есть",
  revise: "Изменить гипотезу",
  stop: "Остановиться",
};

export default async function StartupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const loaded = await loadProjectPage(id, `/startup/${id}`);
  if (!loaded.ok) return <StorageDown />;
  const { project, pro } = loaded;
  const { startup, approved, open } = project;
  const existing = startup.entryMode === "existing_business";
  const views = stepViews({ entryMode: startup.entryMode, hasApprovedHypothesis: Boolean(approved), hasPro: pro.active, progress: project.progress });
  const next = nextStep(views);
  const demand = project.artifacts.find((artifact) => artifact.stepId === "demand-check");
  const demandDone = project.progress.find((row) => row.stepId === "demand-check")?.status === "completed";
  const decision = demandDone ? String(demand?.content.fields?.decision ?? "") : "";

  return (
    <main>
      <Container className="pb-6 pt-8 sm:pt-12">
        <Link href="/projects" className="link text-sm text-muted">
          ← Мои проекты
        </Link>
        <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="eyebrow">
              {[existing ? "Действующий бизнес" : null, getNiche(startup.nicheId)?.title, startup.businessModel ? businessModels[startup.businessModel].title : null]
                .filter(Boolean)
                .join(" · ") || "Проект"}
            </p>
            <h1 className="title mt-2 break-words">{startup.title}</h1>
          </div>
          <ProjectActions id={startup.id} title={startup.title} />
        </div>
      </Container>

      <Container className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-10">
          {next ? (
            <section aria-labelledby="next-title" className="rounded-md bg-ink p-6 text-paper sm:p-8">
              <p id="next-title" className="text-sm font-semibold uppercase tracking-[0.14em] text-paper/70">
                Следующий шаг
              </p>
              <p className="mt-2 font-display text-2xl font-medium">{next.step.title}</p>
              <p className="mt-2 max-w-[48ch] text-paper/80">{next.requiresReview ? `Проверьте результат: ${next.reviewReason ?? "гипотеза изменилась"}.` : next.step.description}</p>
              <Link href={`/startup/${startup.id}/steps/${next.step.id}`} className="btn mt-6 bg-paper text-ink hover:bg-white">
                Открыть шаг
              </Link>
            </section>
          ) : !approved && !existing ? (
            <section aria-labelledby="next-title" className="rounded-md bg-ink p-6 text-paper sm:p-8">
              <p id="next-title" className="text-sm font-semibold uppercase tracking-[0.14em] text-paper/70">
                Следующий шаг
              </p>
              <p className="mt-2 font-display text-2xl font-medium">Проверьте и подтвердите карточку гипотезы</p>
              <p className="mt-2 max-w-[48ch] text-paper/80">После подтверждения откроется первый шаг — проверка спроса.</p>
              <Link href={`/startup/${startup.id}/hypothesis`} className="btn mt-6 bg-paper text-ink hover:bg-white">
                Открыть карточку
              </Link>
            </section>
          ) : null}

          <section aria-labelledby="steps-title">
            <h2 id="steps-title" className="subtitle">
              Шаги
            </h2>
            <ol className="mt-4 divide-y divide-rule border-y border-rule">
              {views.map((view) => {
                const locked = view.state === "locked_hypothesis" || view.state === "locked_pro";
                const content = (
                  <>
                    <span className="min-w-0">
                      <span className="mr-3 font-display text-teal">{view.step.stage + 1}</span>
                      <span className={locked ? "text-muted" : ""}>{view.step.title}</span>
                      {view.requiresReview && !locked ? <span className="chip chip-amber ml-3 align-middle">Проверить после изменения гипотезы</span> : null}
                    </span>
                    <span className={chipClass[view.state]}>{stepStateLabels[view.state]}</span>
                  </>
                );
                return (
                  <li key={view.step.id}>
                    {locked ? (
                      <div className="flex items-center justify-between gap-4 py-4">{content}</div>
                    ) : (
                      <Link href={`/startup/${startup.id}/steps/${view.step.id}`} className="flex items-center justify-between gap-4 py-4 hover:text-teal">
                        {content}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
            {!pro.active ? (
              <p className="mt-4 text-sm text-muted">
                Шаги 3–10 открываются с PRO.{" "}
                <Link href="/account" className="link">
                  Активировать код
                </Link>{" "}
                или{" "}
                <Link href="/pro" className="link">
                  узнать о PRO
                </Link>
                .
              </p>
            ) : null}
          </section>
        </div>

        <aside className="space-y-8">
          <section aria-labelledby="hx-title" className="panel p-6">
            <h2 id="hx-title" className="font-display text-xl font-medium">
              Карточка гипотезы
            </h2>
            {approved ? (
              <p className="mt-2 text-sm">
                <span className="chip chip-teal">Подтверждена · версия {approved.version}</span>
              </p>
            ) : open ? (
              <p className="mt-2 text-sm">
                <span className="chip chip-amber">{open.status === "awaiting_confirmation" ? "Ждёт подтверждения" : "Черновик"}</span>
              </p>
            ) : (
              <p className="mt-2 text-sm text-muted">Не заполнена</p>
            )}
            {approved && open ? <p className="mt-3 text-sm text-amber">Есть неподтверждённые изменения (версия {open.version}).</p> : null}
            {project.current ? (
              <dl className="mt-4 space-y-3 text-[0.95rem]">
                <div>
                  <dt className="text-sm text-muted">Для кого</dt>
                  <dd>{project.current.targetCustomer || "—"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted">Что проверяем первым</dt>
                  <dd>{project.current.keyAssumptions[0] ?? "—"}</dd>
                </div>
              </dl>
            ) : null}
            <p className="mt-4 flex items-center gap-2 text-sm">
              {demandDone ? (
                <span className="chip chip-success">Проверка проведена: {decisionLabels[decision] ?? "решение записано"}</span>
              ) : (
                <span className="text-muted">○ Спрос ещё не проверен</span>
              )}
            </p>
            <Link href={`/startup/${startup.id}/hypothesis`} className="btn btn-secondary btn-sm mt-5">
              {approved || open ? "Открыть карточку" : "Заполнить"}
            </Link>
          </section>

          <section aria-labelledby="kit-title" className="panel p-6">
            <h2 id="kit-title" className="font-display text-xl font-medium">
              Пакет первого запуска
            </h2>
            <p className="mt-2 text-sm text-ink-soft">Всё, что вы собрали по шагам, — на одной странице для печати.</p>
            {pro.active ? (
              <Link href={`/startup/${startup.id}/launch-kit`} className="btn btn-secondary btn-sm mt-4">
                Открыть пакет
              </Link>
            ) : (
              <p className="mt-3 text-sm text-muted">Доступно с PRO.</p>
            )}
          </section>
        </aside>
      </Container>
    </main>
  );
}
