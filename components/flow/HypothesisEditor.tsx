"use client";

import { Field } from "@/components/ui/Field";
import { businessModelIds, businessModels, validationMethodLabels, validationMethods } from "@/lib/domain/business-models";
import { requiredFieldLabels, type HypothesisFields, type RequiredField } from "@/lib/domain/hypothesis";

type Props = {
  value: HypothesisFields;
  onChange: (next: HypothesisFields) => void;
  missing?: RequiredField[];
  disabled?: boolean;
};

function lines(list: string[]) {
  return list.join("\n");
}

function fromLines(text: string) {
  return text.split("\n").map((line) => line.replace(/^\s*[-•–]\s*/u, "")).slice(0, 12);
}

/** Editable hypothesis card. Lists are one item per line so they work with any keyboard and screen reader. */
export function HypothesisEditor({ value, onChange, missing = [], disabled }: Props) {
  const set = <K extends keyof HypothesisFields>(key: K, next: HypothesisFields[K]) => onChange({ ...value, [key]: next });
  const plan = value.validationPlan;
  const setPlan = (patch: Partial<HypothesisFields["validationPlan"]>) => set("validationPlan", { ...plan, ...patch });
  const err = (field: RequiredField) => (missing.includes(field) ? `Заполните поле «${requiredFieldLabels[field]}».` : null);

  return (
    <fieldset disabled={disabled} className="space-y-10">
      <section aria-labelledby="hx-model" className="space-y-4">
        <h3 id="hx-model" className="font-display text-xl font-medium">
          Модель заработка
        </h3>
        <div role="radiogroup" aria-label="Модель заработка" className="grid gap-3 sm:grid-cols-3">
          {businessModelIds.map((id) => (
            <label
              key={id}
              className="flex cursor-pointer flex-col gap-1 rounded-md border border-rule bg-paper-raised p-4 transition-colors has-[:checked]:border-teal has-[:checked]:bg-teal-soft has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-teal"
            >
              <span className="flex items-center gap-2 font-semibold">
                <input
                  type="radio"
                  name="businessModel"
                  value={id}
                  className="check"
                  checked={value.businessModel === id}
                  onChange={() => set("businessModel", id)}
                />
                {businessModels[id].title}
              </span>
              <span className="text-sm text-muted">{businessModels[id].short}</span>
            </label>
          ))}
        </div>
        {err("businessModel") ? <p className="field-error">{err("businessModel")}</p> : null}
      </section>

      <section aria-labelledby="hx-core" className="space-y-6">
        <h3 id="hx-core" className="font-display text-xl font-medium">
          Клиент и ценность
        </h3>
        <Field label="Для кого" hint="Конкретный человек или компания, а не «все»." error={err("targetCustomer")}>
          <textarea className="control" rows={2} maxLength={1000} value={value.targetCustomer} onChange={(event) => set("targetCustomer", event.target.value)} />
        </Field>
        <Field label="Какую задачу решаем" hint="Что у клиента не получается сейчас." error={err("customerProblem")}>
          <textarea className="control" rows={2} maxLength={1000} value={value.customerProblem} onChange={(event) => set("customerProblem", event.target.value)} />
        </Field>
        <Field label="Ценность для клиента" hint="Почему он выберет вас, а не привычный способ." error={err("proposedValue")}>
          <textarea className="control" rows={2} maxLength={1000} value={value.proposedValue} onChange={(event) => set("proposedValue", event.target.value)} />
        </Field>
        <Field label="Как зарабатываем" hint="За что и как платит клиент." error={err("revenueModel")}>
          <textarea className="control" rows={2} maxLength={1000} value={value.revenueModel} onChange={(event) => set("revenueModel", event.target.value)} />
        </Field>
      </section>

      <section aria-labelledby="hx-risk" className="space-y-6">
        <h3 id="hx-risk" className="font-display text-xl font-medium">
          Предположения и риски
        </h3>
        <Field
          label="Непроверенные предположения"
          hint="На чём держится идея. Каждое — с новой строки. Первое будем проверять в первую очередь."
          error={err("keyAssumptions")}
        >
          <textarea className="control" rows={3} value={lines(value.keyAssumptions)} onChange={(event) => set("keyAssumptions", fromLines(event.target.value))} />
        </Field>
        <Field label="Риски" hint="Что может пойти не так. Каждый — с новой строки." optional>
          <textarea className="control" rows={3} value={lines(value.keyRisks)} onChange={(event) => set("keyRisks", fromLines(event.target.value))} />
        </Field>
        <Field label="Ограничения" hint="Бюджет, время, правила отрасли." optional>
          <textarea className="control" rows={2} maxLength={1000} value={value.constraints} onChange={(event) => set("constraints", event.target.value)} />
        </Field>
      </section>

      <section aria-labelledby="hx-plan" className="space-y-6">
        <h3 id="hx-plan" className="font-display text-xl font-medium">
          План первой проверки
        </h3>
        <div className="grid gap-6 md:grid-cols-2">
          <Field label="Способ проверки" error={err("validationPlan.method")}>
            <select
              className="control"
              value={plan.method}
              onChange={(event) => setPlan({ method: event.target.value as HypothesisFields["validationPlan"]["method"] })}
            >
              <option value="">Выберите</option>
              {validationMethods.map((method) => (
                <option key={method} value={method}>
                  {validationMethodLabels[method]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Сколько контактов" error={err("validationPlan.targetCount")}>
            <input
              className="control"
              inputMode="numeric"
              value={plan.targetCount ?? ""}
              onChange={(event) => {
                const digits = event.target.value.replace(/[^\d]/gu, "").slice(0, 4);
                setPlan({ targetCount: digits ? Number(digits) : null });
              }}
            />
          </Field>
        </div>
        <Field label="Кого спрашиваем" hint="Где найдёте этих людей." error={err("validationPlan.audience")}>
          <input className="control" maxLength={300} value={plan.audience} onChange={(event) => setPlan({ audience: event.target.value })} />
        </Field>
        <Field label="Что считаем сигналом продолжать" hint="Заранее, до проверки. Например: «2 из 5 просят расчёт»." error={err("validationPlan.successSignal")}>
          <input className="control" maxLength={300} value={plan.successSignal} onChange={(event) => setPlan({ successSignal: event.target.value })} />
        </Field>
        <div className="grid gap-6 md:grid-cols-2">
          <Field label="Когда останавливаемся" optional>
            <input className="control" maxLength={300} value={plan.stopSignal} onChange={(event) => setPlan({ stopSignal: event.target.value })} />
          </Field>
          <Field label="Срок, дней" optional>
            <input
              className="control"
              inputMode="numeric"
              value={plan.deadlineDays ?? ""}
              onChange={(event) => {
                const digits = event.target.value.replace(/[^\d]/gu, "").slice(0, 3);
                setPlan({ deadlineDays: digits ? Number(digits) : null });
              }}
            />
          </Field>
        </div>
      </section>
    </fieldset>
  );
}

/** Normalises list fields before sending (trailing empty lines are kept while typing). */
export function cleanHypothesis(value: HypothesisFields): HypothesisFields {
  return {
    ...value,
    keyAssumptions: value.keyAssumptions.map((item) => item.trim()).filter(Boolean),
    keyRisks: value.keyRisks.map((item) => item.trim()).filter(Boolean),
  };
}
