"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Field } from "@/components/ui/Field";
import { apiRequest, newIdempotencyKey } from "@/lib/client/api";

export type PublicFormField = {
  name: string;
  label: string;
  type: "text" | "email" | "url" | "textarea" | "select" | "rating";
  required?: boolean;
  hint?: string;
  options?: string[];
  autoComplete?: string;
  maxLength?: number;
};

type PublicFormProps = {
  endpoint: string;
  fields: PublicFormField[];
  submitLabel: string;
  successHref: string;
  consent?: boolean;
};

/**
 * Public submission form. Shows success only after the server confirmed delivery; a retry reuses
 * the same idempotency key so a double click never creates two submissions.
 */
export function PublicForm({ endpoint, fields, submitLabel, successHref, consent = true }: PublicFormProps) {
  const router = useRouter();
  const [key, setKey] = useState(newIdempotencyKey);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<{ field: string; message: string } | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const payload: Record<string, unknown> = { idempotencyKey: key, website: data.get("website") ?? "" };
    for (const field of fields) payload[field.name] = String(data.get(field.name) ?? "");
    if (consent) payload.consent = data.get("consent") === "on";

    setPending(true);
    setError(null);
    setFieldError(null);
    const result = await apiRequest(endpoint, { body: payload });
    setPending(false);
    if (result.ok) {
      setKey(newIdempotencyKey());
      router.push(successHref);
      return;
    }
    if (result.field) setFieldError({ field: result.field, message: result.message });
    else setError(result.message);
  }

  return (
    <form onSubmit={onSubmit} noValidate={false} className="space-y-6" aria-busy={pending}>
      {fields.map((field) => {
        const errorText = fieldError?.field === field.name ? fieldError.message : null;
        return (
          <Field key={field.name} label={field.label} hint={field.hint} error={errorText} optional={!field.required}>
            {field.type === "textarea" ? (
              <textarea name={field.name} required={field.required} maxLength={field.maxLength ?? 2000} className="control" rows={4} />
            ) : field.type === "select" ? (
              <select name={field.name} required={field.required} className="control" defaultValue="">
                <option value="" disabled>
                  Выберите вариант
                </option>
                {field.options?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : field.type === "rating" ? (
              <select name={field.name} required={field.required} className="control max-w-[10rem]" defaultValue="">
                <option value="" disabled>
                  Оценка
                </option>
                {Array.from({ length: 10 }, (_, index) => String(index + 1)).map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            ) : (
              <input
                name={field.name}
                type={field.type}
                required={field.required}
                autoComplete={field.autoComplete}
                maxLength={field.maxLength ?? 300}
                className="control"
              />
            )}
          </Field>
        );
      })}

      <div className="hidden" aria-hidden="true">
        <label>
          Не заполняйте это поле
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {consent ? (
        <div>
          <label className="flex items-start gap-3 text-[0.95rem] leading-snug">
            <input type="checkbox" name="consent" required className="check mt-0.5" />
            <span>
              Согласен на обработку указанных данных для ответа на заявку. Подробнее —{" "}
              <Link href="/privacy" className="link">
                политика конфиденциальности
              </Link>
              .
            </span>
          </label>
          {fieldError?.field === "consent" ? <p className="field-error mt-1.5">{fieldError.message}</p> : null}
        </div>
      ) : null}

      {error ? (
        <p className="notice notice-danger" role="alert">
          {error}
        </p>
      ) : null}

      <button type="submit" className="btn btn-primary btn-lg" disabled={pending}>
        {pending ? "Отправляем…" : submitLabel}
      </button>
    </form>
  );
}
