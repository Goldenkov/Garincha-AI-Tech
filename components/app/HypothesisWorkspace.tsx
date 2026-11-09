"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { cleanHypothesis, HypothesisEditor } from "@/components/flow/HypothesisEditor";
import { apiRequest } from "@/lib/client/api";
import { businessModels, validationMethodLabels } from "@/lib/domain/business-models";
import {
  classifyChange,
  emptyHypothesisFields,
  missingForConfirmation,
  requiredFieldLabels,
  type Hypothesis,
  type HypothesisFields,
  type RequiredField,
} from "@/lib/domain/hypothesis";

type Props = {
  startupId: string;
  current: Hypothesis | null;
  approved: Hypothesis | null;
  history: Hypothesis[];
  flaggableSteps: number;
  justCreated: boolean;
};

const fieldKeys: (keyof HypothesisFields)[] = [
  "ideaText",
  "nicheId",
  "businessModel",
  "targetCustomer",
  "customerProblem",
  "proposedValue",
  "revenueModel",
  "budget",
  "constraints",
  "industryNotes",
  "keyAssumptions",
  "keyRisks",
  "marketEvidence",
  "validationPlan",
];

function pickFields(source: Hypothesis | null): HypothesisFields {
  const empty = emptyHypothesisFields();
  if (!source) return empty;
  return Object.fromEntries(fieldKeys.map((key) => [key, source[key]])) as HypothesisFields;
}

const statusLabels = {
  draft: "Черновик",
  awaiting_confirmation: "Ждёт подтверждения",
  approved_by_user: "Подтверждена",
  superseded: "Заменена новой версией",
} as const;

const timeFormat = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export function HypothesisWorkspace({ startupId, current, approved, history, flaggableSteps, justCreated }: Props) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [fields, setFields] = useState<HypothesisFields>(() => pickFields(current));
  const [baseline, setBaseline] = useState(() => JSON.stringify(cleanHypothesis(pickFields(current))));
  const [updatedAt, setUpdatedAt] = useState(current?.updatedAt ?? null);
  const [openId, setOpenId] = useState(current && current.status !== "approved_by_user" ? current.id : null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [pending, setPending] = useState<null | "save" | "confirm" | "approve" | "discard">(null);
  const [error, setError] = useState<string | null>(null);
  const [missing, setMissing] = useState<RequiredField[]>([]);
  const [acknowledged, setAcknowledged] = useState(false);
  const [approvedNotice, setApprovedNotice] = useState<string | null>(null);

  const dirty = JSON.stringify(cleanHypothesis(fields)) !== baseline;
  const isRevision = Boolean(approved);
  const change = approved ? classifyChange(pickFields(approved), cleanHypothesis(fields)) : "initial";

  async function save(): Promise<{ ok: boolean; id: string | null }> {
    setPending("save");
    setError(null);
    // A new revision of an approved card is guarded by the one-open-draft index, not by a timestamp.
    const body = { fields: cleanHypothesis(fields), expectedUpdatedAt: openId ? updatedAt : null };
    const result = await apiRequest<{ hypothesis: Hypothesis }>(`/api/projects/${startupId}/hypothesis`, { method: "PATCH", body });
    setPending(null);
    if (!result.ok) {
      setError(result.message);
      return { ok: false, id: null };
    }
    setBaseline(JSON.stringify(cleanHypothesis(pickFields(result.hypothesis))));
    setUpdatedAt(result.hypothesis.updatedAt);
    setOpenId(result.hypothesis.id);
    setSavedAt(timeFormat.format(new Date()));
    return { ok: true, id: result.hypothesis.id };
  }

  async function startConfirmation() {
    const localMissing = missingForConfirmation(cleanHypothesis(fields));
    if (localMissing.length) {
      setMissing(localMissing);
      setError("Заполните обязательные поля — они отмечены ниже.");
      return;
    }
    let id = openId;
    if (dirty || !id) {
      const saved = await save();
      if (!saved.ok) return;
      id = saved.id;
    }
    if (!id) {
      setError("Нет изменений для подтверждения.");
      return;
    }
    setPending("confirm");
    const result = await apiRequest<{ ready: boolean; missing: RequiredField[] }>(`/api/projects/${startupId}/hypothesis/confirm`, { body: { hypothesisId: id } });
    setPending(null);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    if (!result.ready) {
      setMissing(result.missing);
      setError("Заполните обязательные поля — они отмечены ниже.");
      return;
    }
    setMissing([]);
    setAcknowledged(false);
    dialogRef.current?.showModal();
  }

  async function approve() {
    if (!openId || !acknowledged) return;
    setPending("approve");
    const result = await apiRequest<{ version: number; change: string; flagged_artifacts: number }>(`/api/projects/${startupId}/hypothesis/approve`, {
      body: { hypothesisId: openId, acknowledged: true },
    });
    setPending(null);
    if (!result.ok) {
      setError(result.message);
      dialogRef.current?.close();
      return;
    }
    dialogRef.current?.close();
    setOpenId(null);
    setApprovedNotice(
      result.flagged_artifacts > 0
        ? `Версия ${result.version} подтверждена. Результаты шагов (${result.flagged_artifacts}) помечены для проверки — они опирались на прошлую версию.`
        : `Версия ${result.version} подтверждена. Открыт шаг «Первая проверка спроса».`,
    );
    router.refresh();
  }

  async function discard() {
    setPending("discard");
    const result = await apiRequest(`/api/projects/${startupId}/hypothesis/discard`);
    setPending(null);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setFields(pickFields(approved));
    setBaseline(JSON.stringify(cleanHypothesis(pickFields(approved))));
    setUpdatedAt(approved?.updatedAt ?? null);
    setOpenId(null);
    setSavedAt(null);
    router.refresh();
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_17rem]">
      <div className="min-w-0 max-w-[46rem] space-y-8">
        {justCreated && !approvedNotice ? (
          <p className="notice" role="status">
            Проект сохранён в аккаунте. Проверьте карточку и подтвердите её — тогда откроется первый шаг проверки спроса.
          </p>
        ) : null}
        {approvedNotice ? (
          <div className="notice appear" role="status">
            <p>{approvedNotice}</p>
            <Link href={`/startup/${startupId}/steps/demand-check`} className="btn btn-primary btn-sm mt-3">
              К проверке спроса
            </Link>
          </div>
        ) : null}
        {isRevision ? (
          <p className="notice notice-amber">
            Подтверждённая версия {approved?.version} остаётся в силе, пока вы не подтвердите изменения. Сохранение создаёт новую версию-черновик.
          </p>
        ) : null}

        <HypothesisEditor value={fields} onChange={setFields} missing={missing} />

        <section aria-labelledby="evidence-title" className="space-y-3">
          <h3 id="evidence-title" className="font-display text-xl font-medium">
            Что известно о спросе
          </h3>
          {fields.marketEvidence.length ? (
            <ul className="space-y-2">
              {fields.marketEvidence.map((item, index) => (
                <li key={index} className="flex gap-3 text-[0.95rem]">
                  <span className={item.kind === "fact" ? "chip chip-success" : item.kind === "assumption" ? "chip chip-amber" : "chip"}>
                    {item.kind === "fact" ? "Факт" : item.kind === "assumption" ? "Предположение" : "Неизвестно"}
                  </span>
                  <span>
                    {item.text}
                    {item.source ? <span className="block text-sm text-muted">Источник: {item.source}</span> : null}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">Пока ничего. Первые данные появятся после проверки спроса.</p>
          )}
        </section>
      </div>

      <aside className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:self-start">
        <div className="panel space-y-4 p-5">
          <p className="text-sm" aria-live="polite">
            {pending === "save"
              ? "Сохраняем…"
              : dirty
                ? "Есть несохранённые изменения"
                : savedAt
                  ? `Сохранено на сервере в ${savedAt}`
                  : current
                    ? `${statusLabels[current.status]} · версия ${current.version}`
                    : "Новая карточка"}
          </p>
          {error ? (
            <p className="notice notice-danger text-sm" role="alert">
              {error}
            </p>
          ) : null}
          <button type="button" className="btn btn-secondary w-full" onClick={save} disabled={!dirty || pending !== null}>
            Сохранить черновик
          </button>
          <button type="button" className="btn btn-primary w-full" onClick={startConfirmation} disabled={pending !== null || (!dirty && !openId)}>
            {pending === "confirm" ? "Проверяем…" : "Подтвердить гипотезу"}
          </button>
          {isRevision && openId ? (
            <button type="button" className="btn btn-quiet w-full" onClick={discard} disabled={pending !== null}>
              Отменить изменения
            </button>
          ) : null}
        </div>

        {history.length ? (
          <section aria-labelledby="history-title" className="mt-8">
            <h3 id="history-title" className="font-display text-lg font-medium">
              История версий
            </h3>
            <ol className="mt-3 divide-y divide-rule border-y border-rule text-sm">
              {history.map((item) => (
                <li key={item.id} className="py-3">
                  <details>
                    <summary className="cursor-pointer">
                      Версия {item.version} · {statusLabels[item.status]}
                      <span className="block text-muted">
                        {timeFormat.format(new Date(item.approvedAt ?? item.updatedAt))}
                      </span>
                    </summary>
                    <dl className="mt-2 space-y-1.5 text-ink-soft">
                      <div>
                        <dt className="text-muted">Модель</dt>
                        <dd>{item.businessModel ? businessModels[item.businessModel].title : "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-muted">Для кого</dt>
                        <dd>{item.targetCustomer || "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-muted">Проверка</dt>
                        <dd>
                          {item.validationPlan.method ? validationMethodLabels[item.validationPlan.method] : "—"}
                          {item.validationPlan.targetCount ? `, ${item.validationPlan.targetCount} контактов` : ""}
                        </dd>
                      </div>
                    </dl>
                  </details>
                </li>
              ))}
            </ol>
          </section>
        ) : null}
      </aside>

      <dialog ref={dialogRef} aria-labelledby="confirm-title" className="m-auto w-[min(92vw,34rem)] rounded-md border border-rule bg-paper-raised p-0 text-ink backdrop:bg-ink/40">
        <div className="space-y-5 p-6">
          <h2 id="confirm-title" className="font-display text-2xl font-medium">
            Подтвердить гипотезу?
          </h2>
          <p className="prose-body">
            Вы фиксируете, что будете проверять именно эту версию. Это не доказательство спроса — его покажет следующий шаг.
          </p>
          {change === "material" && flaggableSteps > 0 ? (
            <p className="notice notice-amber text-sm">
              Изменение существенное (клиент, задача, ценность, модель или предположения). Результаты уже начатых шагов будут помечены «проверить».
            </p>
          ) : change === "validation_plan" ? (
            <p className="notice text-sm">Изменился план проверки — результат проверки спроса будет помечен «проверить».</p>
          ) : null}
          <label className="flex items-start gap-3">
            <input type="checkbox" className="check mt-0.5" checked={acknowledged} onChange={(event) => setAcknowledged(event.target.checked)} />
            <span>Понимаю: это гипотеза для проверки, а не подтверждённый спрос.</span>
          </label>
          <div className="flex justify-end gap-3">
            <button type="button" className="btn btn-quiet" onClick={() => dialogRef.current?.close()}>
              Отмена
            </button>
            <button type="button" className="btn btn-primary" onClick={approve} disabled={!acknowledged || pending !== null}>
              {pending === "approve" ? "Подтверждаем…" : "Подтвердить"}
            </button>
          </div>
        </div>
      </dialog>
      {missing.length ? (
        <p className="sr-only" role="alert">
          Не заполнено: {missing.map((field) => requiredFieldLabels[field]).join(", ")}
        </p>
      ) : null}
    </div>
  );
}
