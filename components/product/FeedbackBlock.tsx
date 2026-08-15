"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitFeedbackForm } from "@/lib/form-submit";

const fields = [
  { name: "name", label: "Имя", placeholder: "Как к вам обращаться" },
  { name: "niche", label: "Ниша", placeholder: "Например: услуги, бьюти, ремонт" },
  { name: "clear", label: "Что было понятно", placeholder: "Какие блоки помогли быстрее разобраться" },
  { name: "stuck", label: "Где застряли", placeholder: "Что было сложно или непонятно" },
  { name: "result", label: "Что получилось создать", placeholder: "Оффер, контент, скрипт, квиз..." },
  { name: "missing", label: "Чего не хватило", placeholder: "Что добавить в следующую версию" },
] as const;

export function FeedbackBlock() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const result = await submitFeedbackForm({
        name: String(data.name ?? ""),
        niche: String(data.niche ?? ""),
        clear: String(data.clear ?? ""),
        stuck: String(data.stuck ?? ""),
        result: String(data.result ?? ""),
        missing: String(data.missing ?? ""),
        rating: String(data.rating ?? ""),
      });

      if (!result.ok) {
        setSubmitError(result.error ?? "Не удалось отправить отзыв. Попробуйте позже.");
        return;
      }

      form.reset();
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-glow backdrop-blur-xl sm:p-7">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">Обратная связь</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Помогите улучшить комплект</h2>
          <p className="mt-4 text-sm leading-7 text-slate-400">
            Отзыв уходит напрямую команде продукта. Мы читаем каждое сообщение и используем его,
            чтобы уточнять миссии, промпты и нишевые примеры.
          </p>
          {submitted ? (
            <div className="mt-6 rounded-3xl border border-emerald-300/20 bg-emerald-300/[0.08] p-4 text-sm text-emerald-100">
              Спасибо! Отзыв отправлен — он поможет сделать следующую версию точнее.
            </div>
          ) : null}
        </div>

        <form className="grid gap-4" onSubmit={submit}>
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <label key={field.name} className="space-y-2">
                <span className="text-sm font-medium text-slate-100">{field.label}</span>
                <Input name={field.name} placeholder={field.placeholder} required />
              </label>
            ))}
          </div>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-100">Оценка 1–10</span>
            <Input name="rating" type="number" min={1} max={10} placeholder="8" required />
          </label>
          <Button type="submit" size="lg" className="w-full sm:w-fit" disabled={isSubmitting}>
            {isSubmitting ? "Отправляем..." : "Отправить отзыв"}
          </Button>
          {submitError ? (
            <div className="rounded-2xl border border-red-300/20 bg-red-300/[0.08] p-4 text-sm text-red-100">
              {submitError}
            </div>
          ) : null}
        </form>
      </div>
    </section>
  );
}
