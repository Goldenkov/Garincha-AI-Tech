"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Field } from "@/components/ui/Field";
import { apiRequest } from "@/lib/client/api";
import type { StepDefinition } from "@/lib/steps";

type Props = {
  startupId: string;
  step: Pick<StepDefinition, "id" | "fields" | "checklist">;
  initialValues: Record<string, string | number>;
  initialChecklist: string[];
  revision: number;
  completed: boolean;
  requiresReview: boolean;
  nextHref: string | null;
};

const timeFormat = new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit" });

export function StepWorkspace({ startupId, step, initialValues, initialChecklist, revision: initialRevision, completed, requiresReview, nextHref }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(step.fields.map((field) => [field.id, initialValues[field.id] === undefined ? "" : String(initialValues[field.id])])),
  );
  const [checklist, setChecklist] = useState<string[]>(initialChecklist);
  const [revision, setRevision] = useState(initialRevision);
  const [baseline, setBaseline] = useState(() => JSON.stringify({ values, checklist: initialChecklist }));
  const [pending, setPending] = useState<null | "save" | "complete">(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [missing, setMissing] = useState<string[]>([]);
  const [done, setDone] = useState(completed && !requiresReview);

  const dirty = JSON.stringify({ values, checklist }) !== baseline;

  async function save() {
    setPending("save");
    setError(null);
    setFieldError(null);
    const result = await apiRequest<{ revision: number }>(`/api/projects/${startupId}/steps/${step.id}`, {
      method: "PUT",
      body: { values, checklist, expectedRevision: revision },
    });
    setPending(null);
    if (!result.ok) {
      setError(result.message);
      setFieldError(result.field ?? null);
      return false;
    }
    setRevision(result.revision);
    setBaseline(JSON.stringify({ values, checklist }));
    setSavedAt(timeFormat.format(new Date()));
    setDone(false);
    return true;
  }

  async function complete() {
    if (dirty && !(await save())) return;
    setPending("complete");
    setError(null);
    const result = await apiRequest(`/api/projects/${startupId}/steps/${step.id}/complete`);
    setPending(null);
    if (!result.ok) {
      setError(result.message);
      setMissing(result.missing ?? []);
      return;
    }
    setMissing([]);
    setDone(true);
    router.refresh();
  }

  return (
    <div className="space-y-8">
      {step.fields.map((field) => {
        const value = values[field.id] ?? "";
        const onChange = (next: string) => setValues((current) => ({ ...current, [field.id]: next }));
        const errorText = fieldError === field.id ? error : missing.includes(field.id) ? "Заполните это поле." : null;
        return (
          <Field key={field.id} label={field.label} hint={field.hint} error={errorText} optional={!field.required}>
            {field.kind === "textarea" ? (
              <textarea className="control" rows={5} maxLength={6000} value={value} onChange={(event) => onChange(event.target.value)} />
            ) : field.kind === "choice" ? (
              <select className="control" value={value} onChange={(event) => onChange(event.target.value)}>
                <option value="">Выберите</option>
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : field.kind === "number" ? (
              <input className="control max-w-[10rem]" inputMode="numeric" value={value} onChange={(event) => onChange(event.target.value.replace(/[^\d]/gu, "").slice(0, 6))} />
            ) : (
              <input className="control" maxLength={500} value={value} onChange={(event) => onChange(event.target.value)} />
            )}
          </Field>
        );
      })}

      {step.checklist.length ? (
        <fieldset>
          <legend className="field-label">Самопроверка</legend>
          <div className="mt-3 space-y-2">
            {step.checklist.map((item) => (
              <label key={item} className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="check mt-0.5"
                  checked={checklist.includes(item)}
                  onChange={(event) => setChecklist((current) => (event.target.checked ? [...current, item] : current.filter((entry) => entry !== item)))}
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      <div className="sticky bottom-0 z-10 -mx-5 border-t border-rule bg-paper/95 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0">
        {error && !fieldError ? (
          <p className="notice notice-danger mb-4" role="alert">
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="btn btn-secondary" onClick={save} disabled={!dirty || pending !== null}>
            {pending === "save" ? "Сохраняем…" : "Сохранить"}
          </button>
          <button type="button" className="btn btn-primary" onClick={complete} disabled={pending !== null}>
            {pending === "complete" ? "Проверяем…" : done ? "Шаг завершён ✓" : "Завершить шаг"}
          </button>
          <span className="text-sm text-muted" aria-live="polite">
            {dirty ? "Есть несохранённые изменения" : savedAt ? `Сохранено на сервере в ${savedAt}` : ""}
          </span>
        </div>
        {done ? (
          <p className="notice appear mt-4" role="status">
            Шаг отмечен как завершённый.{" "}
            {nextHref ? (
              <Link href={nextHref} className="link font-medium">
                Перейти к следующему
              </Link>
            ) : (
              <Link href={`/startup/${startupId}`} className="link font-medium">
                Вернуться к проекту
              </Link>
            )}
          </p>
        ) : null}
      </div>
    </div>
  );
}
