"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formGoalOptions } from "@/lib/content";
import { submitLeadForm } from "@/lib/form-submit";
import { FormField } from "./FormField";

export function LeadForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    if (!form.reportValidity()) {
      return;
    }

    const data = new FormData(form);
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const result = await submitLeadForm({
        name: String(data.get("name") ?? ""),
        email: String(data.get("email") ?? ""),
        telegram: String(data.get("telegram") ?? ""),
        businessNiche: String(data.get("businessNiche") ?? ""),
        mainGoal: String(data.get("mainGoal") ?? ""),
        consent: data.get("consent") === "on",
      });
      if (!result.ok) {
        setSubmitError(result.error ?? "Не удалось отправить заявку. Попробуйте позже.");
        return;
      }
      router.push("/thanks");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="lead" className="py-20 sm:py-28">
      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">
            Ранний доступ
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Оставьте заявку на первый поток
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-300">
            Мы свяжемся с вами, отправим детали по составу комплекта и условиям предзаказа. Оплата на
            первом этапе не подключена.
          </p>
          <div className="mt-6 rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5 text-sm leading-6 text-cyan-50">
            Форма уже подготовлена под будущую интеграцию с API route, Supabase, n8n webhook,
            Telegram bot или CRM.
          </div>
        </div>

        <Card className="p-5 sm:p-7">
          <form className="grid gap-5" onSubmit={onSubmit}>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Имя" id="lead-name" required>
                <Input id="lead-name" name="name" placeholder="Иван" autoComplete="name" required />
              </FormField>
              <FormField label="Email" id="lead-email" required>
                <Input
                  id="lead-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </FormField>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Telegram" id="lead-telegram">
                <Input id="lead-telegram" name="telegram" placeholder="@username" autoComplete="off" />
              </FormField>
              <FormField label="Ниша бизнеса" id="lead-niche" required>
                <Input
                  id="lead-niche"
                  name="businessNiche"
                  placeholder="Например: салон, ремонт, консультации"
                  required
                />
              </FormField>
            </div>

            <FormField label="Главная цель" id="lead-goal" required>
              <Select id="lead-goal" name="mainGoal" defaultValue="" required>
                <option value="" disabled>
                  Выберите цель
                </option>
                {formGoalOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </FormField>

            <label className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-slate-300">
              <Checkbox name="consent" required aria-label="Согласие на обработку персональных данных" />
              <span>
                Я согласен с{" "}
                <Link href="/privacy" className="text-cyan-200 underline-offset-4 hover:underline">
                  политикой конфиденциальности
                </Link>{" "}
                и условиями предзаказа.
              </span>
            </label>

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span
                    className="mr-2 inline-block size-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950"
                    aria-hidden="true"
                  />
                  Отправляем
                </>
              ) : (
                "Оставить заявку"
              )}
            </Button>

            {submitError ? (
              <div className="rounded-2xl border border-red-300/20 bg-red-300/[0.08] p-4 text-sm text-red-100">
                {submitError}
              </div>
            ) : null}

            <p className="text-xs leading-6 text-slate-500">
              Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности и даёте согласие на
              обработку персональных данных для связи по заявке и отправки материалов продукта.
            </p>
          </form>
        </Card>
      </div>
    </section>
  );
}
