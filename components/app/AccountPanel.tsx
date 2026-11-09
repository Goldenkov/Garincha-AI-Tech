"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Field } from "@/components/ui/Field";
import { apiRequest } from "@/lib/client/api";

const dateFormat = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" });

export function RedeemForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    const result = await apiRequest<{ status: string; expiresAt: string | null }>("/api/pro/redeem", { body: { code } });
    setPending(false);
    if (!result.ok) {
      setMessage({ kind: "error", text: result.message });
      return;
    }
    setCode("");
    setMessage({
      kind: "ok",
      text:
        result.status === "already_redeemed"
          ? "Этот код уже активирован в вашем аккаунте."
          : `PRO активирован${result.expiresAt ? ` до ${dateFormat.format(new Date(result.expiresAt))}` : ""}.`,
    });
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Код доступа" hint="Персональный код из письма. Работает только в одном аккаунте.">
        <input
          className="control max-w-[22rem] font-mono uppercase"
          autoComplete="off"
          spellCheck={false}
          required
          minLength={8}
          maxLength={128}
          value={code}
          onChange={(event) => setCode(event.target.value)}
        />
      </Field>
      {message ? (
        <p className={message.kind === "ok" ? "notice" : "notice notice-danger"} role={message.kind === "ok" ? "status" : "alert"}>
          {message.text}
        </p>
      ) : null}
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Проверяем…" : "Активировать"}
      </button>
    </form>
  );
}

export function LogoutButtons() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const logout = async (everywhere: boolean) => {
    setPending(true);
    const result = await apiRequest("/api/auth/logout", { body: { everywhere } });
    if (!result.ok) {
      setPending(false);
      setError(result.message);
      return;
    }
    window.location.assign("/");
  };
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <button type="button" className="btn btn-secondary" onClick={() => logout(false)} disabled={pending}>
          Выйти
        </button>
        <button type="button" className="btn btn-quiet" onClick={() => logout(true)} disabled={pending}>
          Выйти на всех устройствах
        </button>
      </div>
      {error ? (
        <p className="notice notice-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
