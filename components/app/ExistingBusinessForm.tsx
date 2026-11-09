"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Field } from "@/components/ui/Field";
import { apiRequest } from "@/lib/client/api";
import { businessModelIds, businessModels } from "@/lib/domain/business-models";

export function ExistingBusinessForm({ initiallyOpen }: { initiallyOpen: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(initiallyOpen);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setPending(true);
    setError(null);
    const model = String(data.get("model") ?? "");
    const result = await apiRequest<{ id: string }>("/api/projects", {
      body: {
        entryMode: "existing_business",
        title: String(data.get("title") ?? ""),
        hypothesis: { ideaText: String(data.get("about") ?? ""), businessModel: model || null },
      },
    });
    setPending(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    router.push(`/startup/${result.id}`);
  }

  if (!open) {
    return (
      <p className="text-[0.95rem] text-muted">
        Уже есть работающий бизнес?{" "}
        <button type="button" className="link" onClick={() => setOpen(true)}>
          Создать проект без карточки гипотезы
        </button>
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="panel appear space-y-6 p-6">
      <h3 className="font-display text-xl font-medium">Действующий бизнес</h3>
      <p className="prose-body text-[0.95rem]">Шаги запуска откроются сразу. Карточку гипотезы можно заполнить позже — для нового направления.</p>
      <Field label="Название">
        <input name="title" required maxLength={120} className="control" />
      </Field>
      <Field label="Чем занимаетесь" optional>
        <textarea name="about" maxLength={2000} rows={3} className="control" />
      </Field>
      <Field label="Модель" optional>
        <select name="model" className="control" defaultValue="">
          <option value="">Не выбрано</option>
          {businessModelIds.map((id) => (
            <option key={id} value={id}>
              {businessModels[id].title}
            </option>
          ))}
        </select>
      </Field>
      {error ? (
        <p className="notice notice-danger" role="alert">
          {error}
        </p>
      ) : null}
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Создаём…" : "Создать проект"}
      </button>
    </form>
  );
}
