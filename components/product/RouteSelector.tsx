"use client";

import { useState } from "react";

import { routeModes } from "@/lib/business-reboot-content";

export function RouteSelector() {
  const [active, setActive] = useState(routeModes[0].name);
  const route = routeModes.find((item) => item.name === active) ?? routeModes[0];

  return (
    <section id="routes" className="rounded-[1.5rem] border border-white/10 bg-[#0b1020] p-4 sm:rounded-[2rem] sm:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">Маршруты</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Выберите темп прохождения</h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-slate-400">
          Один и тот же комплект можно пройти быстро, за вечер или в спокойном недельном режиме.
        </p>
      </div>

      <div className="mt-7 grid gap-3 md:grid-cols-3">
        {routeModes.map((item) => (
          <button
            key={item.name}
            type="button"
            onClick={() => setActive(item.name)}
            className={`rounded-3xl border p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${
              active === item.name
                ? "border-cyan-300/40 bg-cyan-950/40"
                : "border-white/10 bg-[#080d1a] hover:border-cyan-300/25"
            }`}
          >
            <p className="text-lg font-semibold text-white">{item.name}</p>
            <p className="mt-2 text-sm text-cyan-100">{item.duration}</p>
            <p className="mt-3 text-sm leading-6 text-slate-400">{item.description}</p>
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-3xl border border-white/10 bg-[#080d1a] p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Активный маршрут</p>
        <h3 className="mt-2 text-2xl font-semibold text-white">{route.name}</h3>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {route.steps.map((step, index) => (
            <div key={step} className="rounded-2xl border border-white/10 bg-[#0b1020] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">
                {(index + 1).toString().padStart(2, "0")}
              </p>
              <p className="mt-2 text-sm font-medium text-slate-100">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
