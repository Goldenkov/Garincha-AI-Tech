"use client";

import { Field } from "@/components/ui/Field";
import {
  currencyOptions,
  goalOptions,
  profileFieldLabels,
  timeOptions,
  type ProfileFieldId,
  type StartupProfile,
} from "@/lib/domain/profile";

type Props = {
  value: StartupProfile;
  onChange: (next: StartupProfile) => void;
};

const hints: Partial<Record<ProfileFieldId, string>> = {
  budget: "Сколько готовы вложить в первые 3 месяца, включая проверку.",
  region: "Город или регион, где будут клиенты. Для онлайн-формата — «онлайн».",
  skills: "Что умеете делать руками или головой — работа, хобби, опыт.",
  interests: "Что нравится, с какими людьми или темами хотите работать.",
  constraints: "Например: без аренды, только вечером, без найма, без кредитов.",
};

/** Minimal profile. Every field can be marked «Пока не знаю» — unknowns are recorded, not guessed. */
export function ProfileForm({ value, onChange }: Props) {
  const isUnknown = (field: ProfileFieldId) => value.unknownFields.includes(field);
  const toggleUnknown = (field: ProfileFieldId, unknown: boolean) => {
    const unknownFields = unknown ? [...new Set([...value.unknownFields, field])] : value.unknownFields.filter((item) => item !== field);
    onChange({ ...value, unknownFields });
  };
  const set = <K extends keyof StartupProfile>(key: K, next: StartupProfile[K]) => onChange({ ...value, [key]: next });

  const unknownToggle = (field: ProfileFieldId) => (
    <label className="mt-2 inline-flex items-center gap-2 text-sm text-muted">
      <input type="checkbox" className="check !size-4" checked={isUnknown(field)} onChange={(event) => toggleUnknown(field, event.target.checked)} />
      Пока не знаю
    </label>
  );

  return (
    <div className="grid gap-7 md:grid-cols-2">
      <div className="md:col-span-2">
        <fieldset disabled={isUnknown("budget")} className="disabled:opacity-50">
          <legend className="field-label">{profileFieldLabels.budget}</legend>
          <p className="field-hint mt-1">{hints.budget}</p>
          <div className="mt-2 flex max-w-sm gap-2">
            <label className="sr-only" htmlFor="profile-budget">
              Сумма
            </label>
            <input
              id="profile-budget"
              className="control"
              inputMode="numeric"
              placeholder="Например, 100 000"
              value={value.budgetAmount ?? ""}
              onChange={(event) => {
                const digits = event.target.value.replace(/[^\d]/gu, "").slice(0, 12);
                set("budgetAmount", digits ? Number(digits) : null);
              }}
            />
            <label className="sr-only" htmlFor="profile-currency">
              Валюта
            </label>
            <select
              id="profile-currency"
              className="control !w-28"
              value={value.budgetCurrency ?? "RUB"}
              onChange={(event) => set("budgetCurrency", event.target.value)}
            >
              {currencyOptions.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>
        </fieldset>
        {unknownToggle("budget")}
      </div>

      {(["region", "skills", "interests", "constraints"] as const).map((field) => (
        <div key={field}>
          <Field label={profileFieldLabels[field]} hint={hints[field]}>
            {field === "region" ? (
              <input className="control" value={value[field]} maxLength={200} disabled={isUnknown(field)} onChange={(event) => set(field, event.target.value)} />
            ) : (
              <textarea
                className="control !min-h-[4.5rem]"
                rows={2}
                maxLength={1000}
                value={value[field]}
                disabled={isUnknown(field)}
                onChange={(event) => set(field, event.target.value)}
              />
            )}
          </Field>
          {unknownToggle(field)}
        </div>
      ))}

      <div>
        <Field label={profileFieldLabels.timePerWeek}>
          <select className="control" value={value.timePerWeek} disabled={isUnknown("timePerWeek")} onChange={(event) => set("timePerWeek", event.target.value)}>
            <option value="">Выберите</option>
            {timeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
        {unknownToggle("timePerWeek")}
      </div>

      <div>
        <Field label={profileFieldLabels.goal}>
          <select className="control" value={value.goal} disabled={isUnknown("goal")} onChange={(event) => set("goal", event.target.value)}>
            <option value="">Выберите</option>
            {goalOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
        {unknownToggle("goal")}
      </div>
    </div>
  );
}
