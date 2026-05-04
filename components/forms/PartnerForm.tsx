"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Send } from "lucide-react";

import { submitPartnerForm } from "@/lib/form-submit";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/forms/FormField";
import { partnerFormatOptions } from "@/lib/content";

export function PartnerForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    if (!form.reportValidity()) {
      return;
    }

    const formData = new FormData(form);
    setIsSubmitting(true);

    try {
      await submitPartnerForm({
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        telegram: String(formData.get("telegram") ?? ""),
        channelUrl: String(formData.get("channelUrl") ?? ""),
        audienceSize: String(formData.get("audienceSize") ?? ""),
        cooperationFormat: String(formData.get("cooperationFormat") ?? ""),
        consent: formData.get("consent") === "on",
      });
      router.push("/thanks?type=partner");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <div className="grid gap-5 md:grid-cols-2">
        <FormField id="partner-name" label="Имя" required>
          <Input id="partner-name" name="name" autoComplete="name" required placeholder="Как к вам обращаться" />
        </FormField>
        <FormField id="partner-email" label="Email" required>
          <Input id="partner-email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
        </FormField>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <FormField id="partner-telegram" label="Telegram">
          <Input id="partner-telegram" name="telegram" placeholder="@username" />
        </FormField>
        <FormField id="channel-url" label="Ссылка на канал / сообщество" required>
          <Input id="channel-url" name="channelUrl" type="url" required placeholder="https://..." />
        </FormField>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <FormField id="audience-size" label="Размер аудитории" required>
          <Input id="audience-size" name="audienceSize" required placeholder="Например: 5 000 подписчиков" />
        </FormField>
        <FormField id="cooperation-format" label="Формат сотрудничества" required>
          <Select id="cooperation-format" name="cooperationFormat" required defaultValue="">
            <option value="" disabled>
              Выберите формат
            </option>
            {partnerFormatOptions.map((option) => (
              <option key={option} value={option} className="bg-slate-950">
                {option}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
        <Checkbox name="consent" required aria-label="Согласие на обработку персональных данных" />
        <span>
          Я согласен(на) с политикой конфиденциальности и обработкой данных для связи по партнёрской программе.
        </span>
      </label>

      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-fit">
        {isSubmitting ? "Отправляем..." : "Отправить заявку партнёра"}
        <Send className="ml-2 h-4 w-4" aria-hidden="true" />
      </Button>
    </form>
  );
}
