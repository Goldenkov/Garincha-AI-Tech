import type { Metadata } from "next";
import Link from "next/link";

import { PrintButton } from "@/components/app/PrintButton";
import { StorageDown } from "@/components/app/StorageDown";
import { Container } from "@/components/site/Container";
import { businessModels, validationMethodLabels } from "@/lib/domain/business-models";
import { loadProjectPage } from "@/lib/server/page-guards";
import { stepDefinitions } from "@/lib/steps";

export const metadata: Metadata = { title: "Пакет первого запуска", robots: { index: false } };

export default async function LaunchKitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const loaded = await loadProjectPage(id, `/startup/${id}/launch-kit`);
  if (!loaded.ok) return <StorageDown />;
  const { project, pro } = loaded;
  const { startup, approved } = project;
  const hypothesis = approved ?? project.current;

  if (!pro.active) {
    return (
      <main>
        <Container className="py-12">
          <Link href={`/startup/${startup.id}`} className="link text-sm text-muted">
            ← {startup.title}
          </Link>
          <h1 className="title mt-5">Пакет первого запуска</h1>
          <p className="notice notice-amber mt-6 max-w-[40rem]">Пакет доступен с PRO.</p>
          <Link href="/account" className="btn btn-primary mt-6">
            Активировать код
          </Link>
        </Container>
      </main>
    );
  }

  const completed = new Set(project.progress.filter((row) => row.status === "completed").map((row) => row.stepId));

  return (
    <main>
      <Container className="pb-8 pt-8 sm:pt-12">
        <div className="no-print flex flex-wrap items-center justify-between gap-4">
          <Link href={`/startup/${startup.id}`} className="link text-sm text-muted">
            ← {startup.title}
          </Link>
          <PrintButton />
        </div>
        <p className="eyebrow mt-5">Пакет первого запуска</p>
        <h1 className="title mt-2">{startup.title}</h1>
        <p className="mt-3 text-sm text-muted">
          Готово шагов: {completed.size} из {stepDefinitions.length}. Гипотеза {approved ? `подтверждена, версия ${approved.version}` : "не подтверждена"}.
        </p>
      </Container>
      <Container className="max-w-[52rem] space-y-10">
        {hypothesis ? (
          <section aria-labelledby="kit-hx">
            <h2 id="kit-hx" className="subtitle">
              Гипотеза
            </h2>
            <dl className="mt-4 divide-y divide-rule border-y border-rule">
              {[
                ["Модель", hypothesis.businessModel ? businessModels[hypothesis.businessModel].title : "—"],
                ["Для кого", hypothesis.targetCustomer],
                ["Задача клиента", hypothesis.customerProblem],
                ["Ценность", hypothesis.proposedValue],
                ["Как зарабатываем", hypothesis.revenueModel],
                ["Предположения", hypothesis.keyAssumptions.join("; ")],
                [
                  "План проверки",
                  `${hypothesis.validationPlan.method ? validationMethodLabels[hypothesis.validationPlan.method] : "—"}, ${hypothesis.validationPlan.targetCount ?? "—"} · сигнал: ${hypothesis.validationPlan.successSignal || "—"}`,
                ],
              ].map(([label, text]) => (
                <div key={label} className="grid gap-1 py-3 sm:grid-cols-[11rem_1fr] sm:gap-4">
                  <dt className="font-display font-medium">{label}</dt>
                  <dd className="text-ink-soft">{text || "—"}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}
        {stepDefinitions.map((step) => {
          const artifact = project.artifacts.find((item) => item.stepId === step.id);
          const fields = artifact?.content.fields ?? {};
          const filled = step.fields.filter((field) => fields[field.id] !== undefined && String(fields[field.id]).trim());
          return (
            <section key={step.id} aria-labelledby={`kit-${step.id}`} className="break-inside-avoid">
              <h2 id={`kit-${step.id}`} className="font-display text-xl font-medium">
                {step.stage + 1}. {step.title}{" "}
                {completed.has(step.id) ? <span className="chip chip-success ml-2 align-middle">готово</span> : null}
                {artifact?.reviewStatus === "requires_review" ? <span className="chip chip-amber ml-2 align-middle">проверить</span> : null}
              </h2>
              {filled.length ? (
                <dl className="mt-3 space-y-3">
                  {filled.map((field) => (
                    <div key={field.id}>
                      <dt className="text-sm text-muted">{field.label}</dt>
                      <dd className="whitespace-pre-wrap">
                        {field.options?.find((option) => option.value === fields[field.id])?.label ?? String(fields[field.id])}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="mt-2 text-sm text-muted">Пока не заполнено.</p>
              )}
            </section>
          );
        })}
      </Container>
    </main>
  );
}
