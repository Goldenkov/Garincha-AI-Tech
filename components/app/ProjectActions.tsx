"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";

import { apiRequest } from "@/lib/client/api";

export function ProjectActions({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState<"rename" | "archive">("rename");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const open = (next: "rename" | "archive") => {
    setMode(next);
    setError(null);
    dialogRef.current?.showModal();
  };

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const result =
      mode === "rename"
        ? await apiRequest(`/api/projects/${id}`, { method: "PATCH", body: { title: String(new FormData(event.currentTarget).get("title") ?? "") } })
        : await apiRequest(`/api/projects/${id}`, { method: "DELETE" });
    setPending(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    dialogRef.current?.close();
    if (mode === "archive") router.push("/projects");
    else router.refresh();
  }

  return (
    <div className="flex gap-2">
      <button type="button" className="btn btn-quiet btn-sm" onClick={() => open("rename")}>
        Переименовать
      </button>
      <button type="button" className="btn btn-quiet btn-sm" onClick={() => open("archive")}>
        В архив
      </button>
      <dialog ref={dialogRef} className="m-auto w-[min(92vw,28rem)] rounded-md border border-rule bg-paper-raised p-0 text-ink backdrop:bg-ink/40">
        <form onSubmit={onSubmit} className="space-y-5 p-6">
          <h2 className="font-display text-xl font-medium">{mode === "rename" ? "Название проекта" : "Отправить проект в архив?"}</h2>
          {mode === "rename" ? (
            <div>
              <label htmlFor="rename-title" className="field-label">
                Название
              </label>
              <input id="rename-title" name="title" defaultValue={title} required maxLength={120} className="control mt-2" />
            </div>
          ) : (
            <p className="prose-body">Проект исчезнет из списка. Данные сохранятся — их можно восстановить по запросу в поддержку.</p>
          )}
          {error ? (
            <p className="notice notice-danger" role="alert">
              {error}
            </p>
          ) : null}
          <div className="flex justify-end gap-3">
            <button type="button" className="btn btn-quiet" onClick={() => dialogRef.current?.close()}>
              Отмена
            </button>
            <button type="submit" className="btn btn-primary" disabled={pending}>
              {pending ? "Сохраняем…" : mode === "rename" ? "Сохранить" : "В архив"}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
