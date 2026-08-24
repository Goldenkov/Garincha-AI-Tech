"use client";

import { useMemo, useState } from "react";

import { progressItems } from "@/lib/business-reboot-content";

export function ProgressOverview() {
  const [done, setDone] = useState<string[]>(progressItems.slice(0, 3));
  const percent = useMemo(() => Math.round((done.length / progressItems.length) * 100), [done.length]);

  function toggle(item: string) {
    setDone((current) =>
      current.includes(item) ? current.filter((value) => value !== item) : [...current, item],
    );
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-[#0b1020] p-5 sm:p-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">Прогресс</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Карта прохождения</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Для MVP прогресс хранится в состоянии страницы. Позже его можно перенести в Supabase или личный кабинет.
          </p>
        </div>
        <div className="min-w-32 rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.08] p-5 text-center">
          <p className="text-4xl font-black text-white">{percent}%</p>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-cyan-100">готово</p>
        </div>
      </div>

      <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-violet-400 to-pink-400 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {progressItems.map((item, index) => {
          const active = done.includes(item);

          return (
            <button
              key={item}
              type="button"
              onClick={() => toggle(item)}
              className="rounded-2xl border border-white/10 bg-[#080d1a] p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                {(index + 1).toString().padStart(2, "0")}
              </span>
              <span className="mt-2 block text-sm font-medium text-white">{item}</span>
              <span className={active ? "mt-3 block text-xs text-emerald-300" : "mt-3 block text-xs text-slate-500"}>
                {active ? "Завершено" : "Открыть"}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
