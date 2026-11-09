"use client";

import { useRef, useState, type FormEvent } from "react";

import { Field } from "@/components/ui/Field";
import { apiRequest } from "@/lib/client/api";

export function LoginForm({ next }: { next: string }) {
  const [stage, setStage] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<{ field?: string; message: string } | null>(null);
  const codeRef = useRef<HTMLInputElement>(null);

  async function requestCode(event?: FormEvent) {
    event?.preventDefault();
    setPending(true);
    setError(null);
    const result = await apiRequest("/api/auth/request-code", { body: { email } });
    setPending(false);
    if (!result.ok) {
      setError({ field: result.field, message: result.message });
      return;
    }
    setStage("code");
    requestAnimationFrame(() => codeRef.current?.focus());
  }

  async function verify(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const result = await apiRequest<{ next: string }>("/api/auth/verify-code", { body: { email, code, next } });
    if (!result.ok) {
      setPending(false);
      setError({ field: result.field, message: result.message });
      return;
    }
    window.location.assign(result.next);
  }

  return stage === "email" ? (
    <form onSubmit={requestCode} className="space-y-6" aria-busy={pending}>
      <Field label="Email" hint="Пришлём код из 6 цифр. Пароль не нужен." error={error?.field === "email" ? error.message : null}>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          maxLength={254}
          className="control"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </Field>
      {error && error.field !== "email" ? (
        <p className="notice notice-danger" role="alert">
          {error.message}
        </p>
      ) : null}
      <button type="submit" className="btn btn-primary btn-lg w-full sm:w-auto" disabled={pending}>
        {pending ? "Отправляем…" : "Получить код"}
      </button>
    </form>
  ) : (
    <form onSubmit={verify} className="appear space-y-6" aria-busy={pending}>
      <p className="notice" role="status">
        Код отправлен на <strong>{email}</strong>. Он действует 15 минут. Проверьте папку «Спам», если письма нет.
      </p>
      <Field label="Код из письма" error={error?.field === "code" ? error.message : null}>
        <input
          ref={codeRef}
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d{6}"
          maxLength={6}
          required
          className="control max-w-[12rem] text-center font-mono text-xl tracking-[0.4em]"
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/gu, "").slice(0, 6))}
        />
      </Field>
      {error && error.field !== "code" ? (
        <p className="notice notice-danger" role="alert">
          {error.message}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="btn btn-primary btn-lg" disabled={pending || code.length !== 6}>
          {pending ? "Проверяем…" : "Войти"}
        </button>
        <button type="button" className="btn btn-quiet" onClick={() => requestCode()} disabled={pending}>
          Отправить код ещё раз
        </button>
        <button
          type="button"
          className="btn btn-quiet"
          onClick={() => {
            setStage("email");
            setCode("");
            setError(null);
          }}
        >
          Другой email
        </button>
      </div>
    </form>
  );
}
