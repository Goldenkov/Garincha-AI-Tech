"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { setProAccess, verifyAccessCode } from "@/lib/access";

export function AccessForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/journey";
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const result = await verifyAccessCode(code);
    setLoading(false);

    if (!result.success) {
      setError("Код не найден. Проверьте код доступа или напишите в поддержку.");
      return;
    }

    setProAccess();
    setSuccess(true);
    window.setTimeout(() => {
      window.location.href = next;
    }, 650);
  }

  return (
    <main className="grid min-h-[calc(100vh-10rem)] place-items-center px-5 py-10 sm:px-6 lg:px-8">
      <section className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-glow backdrop-blur-xl sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">Вход в PRO</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.045em] text-white">Введите код доступа</h1>
        <p className="mt-4 text-sm leading-7 text-slate-400">
          На первом запуске доступ выдаётся вручную после оплаты. Код проверяется через server API,
          без публикации секрета на клиенте.
        </p>

        <form className="mt-6 grid gap-4" onSubmit={submit}>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-200">Код доступа</span>
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              className="h-12 rounded-2xl border border-white/10 bg-slate-950/55 px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/40"
              placeholder="Введите PRO_ACCESS_CODE"
              autoComplete="one-time-code"
              required
            />
          </label>

          {error ? (
            <div className="rounded-2xl border border-red-300/20 bg-red-300/[0.08] p-4 text-sm text-red-100">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.08] p-4 text-sm text-emerald-100">
              Доступ открыт. Перенаправляем в PRO-зону...
            </div>
          ) : null}

          <Button type="submit" size="lg" disabled={loading}>
            {loading ? "Проверяем..." : "Открыть PRO"}
          </Button>
        </form>
      </section>
    </main>
  );
}
