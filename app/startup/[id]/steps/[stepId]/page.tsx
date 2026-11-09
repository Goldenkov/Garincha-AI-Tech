import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CopyButton } from "@/components/app/CopyButton";
import { StepWorkspace } from "@/components/app/StepWorkspace";
import { StorageDown } from "@/components/app/StorageDown";
import { Container } from "@/components/site/Container";
import { getNiche } from "@/lib/catalog";
import { validationMethodLabels } from "@/lib/domain/business-models";
import { stepViews } from "@/lib/domain/journey-state";
import { loadProjectPage } from "@/lib/server/page-guards";
import { buildInterviewGuide, buildMissionPrompt, getStep, stepDefinitions } from "@/lib/steps";

export const metadata: Metadata = { title: "Шаг", robots: { index: false } };

type Props = { params: Promise<{ id: string; stepId: string }> };

export default async function StepPage({ params }: Props) {
  const { id, stepId } = await params;
  const step = getStep(stepId);
  if (!step) notFound();
  const loaded = await loadProjectPage(id, `/startup/${id}/steps/${stepId}`);
  if (!loaded.ok) return <StorageDown />;
  const { project, pro } = loaded;
  const { startup, approved } = project;
  const view = stepViews({ entryMode: startup.entryMode, hasApprovedHypothesis: Boolean(approved), hasPro: pro.active, progress: project.progress }).find(
    (item) => item.step.id === step.id,
  )!;
  const artifact = project.artifacts.find((item) => item.stepId === step.id);
  const progress = project.progress.find((item) => item.stepId === step.id);
  const index = stepDefinitions.findIndex((item) => item.id === step.id);
  const following = stepDefinitions[index + 1];
  const hypothesis = approved ?? project.current;
  const niche = getNiche(hypothesis?.nicheId ?? startup.nicheId);

  return (
    <main>
      <Container className="pb-8 pt-8 sm:pt-12">
        <Link href={`/startup/${startup.id}`} className="link text-sm text-muted">
          ← {startup.title}
        </Link>
        <p className="eyebrow mt-5">
          Шаг {step.stage + 1} из {stepDefinitions.length} · {step.time}
        </p>
        <h1 className="title mt-2">{step.title}</h1>
        <p className="lede mt-4 max-w-[52ch]">{step.description}</p>
      </Container>

      <Container>
        {view.state === "locked_hypothesis" ? (
          <div className="max-w-[40rem] space-y-4">
            <p className="notice notice-amber">Этот шаг откроется после подтверждения карточки гипотезы.</p>
            <Link href={`/startup/${startup.id}/hypothesis`} className="btn btn-primary">
              К карточке гипотезы
            </Link>
          </div>
        ) : view.state === "locked_pro" ? (
          <div className="max-w-[40rem] space-y-4">
            <p className="notice notice-amber">Шаг доступен с PRO. Первые два шага — проверка спроса и разведка — бесплатны.</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/account" className="btn btn-primary">
                Активировать код
              </Link>
              <Link href="/pro" className="btn btn-secondary">
                Что даёт PRO
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-12 lg:grid-cols-[1fr_20rem]">
            <div className="min-w-0 max-w-[44rem]">
              {view.requiresReview ? (
                <p className="notice notice-amber mb-8">
                  {view.reviewReason ?? "Гипотеза изменилась"}. Проверьте, актуален ли результат, и сохраните или завершите шаг заново.
                </p>
              ) : null}
              <StepWorkspace
                startupId={startup.id}
                step={{ id: step.id, fields: step.fields, checklist: step.checklist }}
                initialValues={artifact?.content.fields ?? {}}
                initialChecklist={artifact?.content.checklist ?? []}
                revision={artifact?.revision ?? 0}
                completed={progress?.status === "completed"}
                requiresReview={view.requiresReview}
                nextHref={following ? `/startup/${startup.id}/steps/${following.id}` : null}
              />
            </div>

            <aside className="space-y-8 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:self-start">
              {step.id === "demand-check" && hypothesis ? (
                <>
                  <section className="panel p-5" aria-labelledby="plan-title">
                    <h2 id="plan-title" className="font-display text-lg font-medium">
                      План из карточки
                    </h2>
                    <dl className="mt-3 space-y-2.5 text-[0.95rem]">
                      <div>
                        <dt className="text-sm text-muted">Проверяем</dt>
                        <dd>{hypothesis.keyAssumptions[0] ?? "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted">Способ</dt>
                        <dd>{hypothesis.validationPlan.method ? validationMethodLabels[hypothesis.validationPlan.method] : "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted">Кого и сколько</dt>
                        <dd>
                          {hypothesis.validationPlan.audience || "—"}
                          {hypothesis.validationPlan.targetCount ? ` · ${hypothesis.validationPlan.targetCount}` : ""}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted">Сигнал продолжать</dt>
                        <dd>{hypothesis.validationPlan.successSignal || "—"}</dd>
                      </div>
                      {hypothesis.validationPlan.stopSignal ? (
                        <div>
                          <dt className="text-sm text-muted">Сигнал остановиться</dt>
                          <dd>{hypothesis.validationPlan.stopSignal}</dd>
                        </div>
                      ) : null}
                    </dl>
                  </section>
                  <section aria-labelledby="guide-title">
                    <h2 id="guide-title" className="font-display text-lg font-medium">
                      Вопросы для интервью
                    </h2>
                    <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-[0.95rem] text-ink-soft">
                      {buildInterviewGuide({ customer: hypothesis.targetCustomer, problem: hypothesis.customerProblem }).map((question) => (
                        <li key={question}>{question}</li>
                      ))}
                    </ol>
                  </section>
                </>
              ) : null}
              {step.mission ? (
                <section aria-labelledby="prompt-title" className="space-y-3">
                  <h2 id="prompt-title" className="font-display text-lg font-medium">
                    Запрос для AI-чата
                  </h2>
                  <p className="text-sm text-muted">Скопируйте в любой AI-чат. Результат проверьте и запишите своими словами.</p>
                  {(() => {
                    const prompt = buildMissionPrompt(step.mission, niche?.id ?? null, {
                      idea: hypothesis?.ideaText ?? "",
                      customer: hypothesis?.targetCustomer ?? "",
                      value: hypothesis?.proposedValue ?? "",
                    });
                    return (
                      <>
                        <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-md border border-rule bg-paper-raised p-4 font-sans text-sm leading-relaxed">
                          {prompt}
                        </pre>
                        <CopyButton text={prompt} label="Скопировать запрос" />
                      </>
                    );
                  })()}
                  <p className="text-sm text-muted">
                    <span className="font-semibold text-ink">Цель: </span>
                    {step.mission.goal}
                  </p>
                </section>
              ) : null}
            </aside>
          </div>
        )}
      </Container>
    </main>
  );
}
