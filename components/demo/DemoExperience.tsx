"use client";

import { useMemo, useState } from "react";

import { ButtonLink } from "@/components/ui/button";
import { businessRebootConfig } from "@/lib/business-reboot-content";
import { launchKitSections } from "@/lib/launch-kit";
import { missions, niches, type Niche, type NicheId } from "@/lib/journey";

const previewMission = missions[0];
const lockedMissions = missions.slice(1, 5);

export function DemoExperience() {
  const [selectedNicheId, setSelectedNicheId] = useState<NicheId>("climate");
  const selectedNiche = niches.find((niche) => niche.id === selectedNicheId) ?? niches[0];
  const demoPrompt = useMemo(
    () => previewMission.promptTemplate.split("[ниша]").join(selectedNiche.title),
    [selectedNiche.title],
  );

  return (
    <main className="py-8 sm:py-12">
      <div className="gg-gutter mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0b1020] p-4 sm:rounded-[2rem] sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">Demo preview</p>
              <h1 className="mt-3 max-w-5xl text-4xl font-black tracking-[-0.045em] text-white sm:text-6xl">
                Посмотрите, как AI-карта собирает пакет запуска
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">
                Выберите нишу, откройте первую миссию и увидьте, как результат превращается в
                структурированный пакет. Полная карта, сохранение и все миссии доступны в PRO.
              </p>
            </div>
            <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.08] p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-100">Открыто в демо</p>
              <p className="mt-3 text-3xl font-black text-white">1 из 9 миссий</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Достаточно, чтобы понять механику: ниша → миссия → результат → пакет.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <NicheDemoSelector selectedNiche={selectedNiche} onSelect={setSelectedNicheId} />
          <MissionDemoPanel selectedNiche={selectedNiche} demoPrompt={demoPrompt} />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <LockedPathPreview />
          <LaunchKitPreview selectedNiche={selectedNiche} />
        </section>

        <section className="rounded-[2rem] border border-cyan-300/20 bg-[#0b1020] p-6 text-center sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">Следующий шаг</p>
          <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Откройте полный маршрут и собирайте свой пакет первого запуска
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            В PRO доступны все миссии, сохранение результатов, readiness score и итоговый Launch Kit.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/#lead" size="lg">
              {businessRebootConfig.primaryCta}
            </ButtonLink>
            <ButtonLink href="/access?next=/journey" variant="secondary" size="lg">
              У меня уже есть код
            </ButtonLink>
          </div>
        </section>
      </div>
    </main>
  );
}

function NicheDemoSelector({
  selectedNiche,
  onSelect,
}: {
  selectedNiche: Niche;
  onSelect: (nicheId: NicheId) => void;
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-[#0b1020] p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">01 / Ниша</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Выберите бизнес-модель</h2>
        </div>
        <p className="text-sm text-slate-500">Демо меняет оффер, квиз, контент и prompt preview.</p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {niches.map((niche) => {
          const active = selectedNiche.id === niche.id;
          return (
            <button
              key={niche.id}
              type="button"
              onClick={() => onSelect(niche.id)}
              className={`rounded-2xl border p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${
                active
                  ? "border-cyan-300/45 bg-cyan-300/[0.10]"
                  : "border-white/10 bg-[#080d1a] hover:border-cyan-300/25"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold text-white">{niche.title}</p>
                <span className="rounded-full border border-white/10 bg-[#050713] px-2 py-1 text-[0.65rem] text-slate-400">
                  {niche.estimatedTime}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-500">{niche.description}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function MissionDemoPanel({ selectedNiche, demoPrompt }: { selectedNiche: Niche; demoPrompt: string }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-[#0b1020] p-5 sm:p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">02 / Первая миссия открыта</p>
      <div className="mt-4 rounded-3xl border border-cyan-300/30 bg-cyan-300/[0.08] p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">preview mission</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{previewMission.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">{previewMission.goal}</p>
          </div>
          <span className="rounded-full border border-white/10 bg-[#080d1a] px-3 py-1 text-xs text-cyan-100">
            {previewMission.time}
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-[#080d1a] p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Пример под нишу</p>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            <span className="text-cyan-100">Оффер:</span> {selectedNiche.offerExample}
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            <span className="text-cyan-100">Квиз:</span> {selectedNiche.quiz.join(", ")}
          </p>
        </div>

        <div className="rounded-3xl border border-cyan-300/15 bg-cyan-300/[0.06] p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Prompt preview</p>
          <p className="mt-3 text-sm leading-7 text-slate-200">{demoPrompt}</p>
          <div className="mt-4 rounded-2xl border border-white/10 bg-[#050713] px-4 py-3 text-xs text-slate-400">
            Полные промпты, сохранение результатов и следующие миссии — в PRO.
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-emerald-300/15 bg-emerald-300/[0.06] p-5">
        <p className="text-xs uppercase tracking-[0.22em] text-emerald-200">После миссии</p>
        <p className="mt-2 text-sm leading-6 text-slate-200">{previewMission.expectedResult}</p>
      </div>
    </section>
  );
}

function LockedPathPreview() {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-[#0b1020] p-5 sm:p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">03 / Маршрут PRO</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Следующие миссии заблокированы</h2>
      <div className="mt-5 grid gap-3">
        {lockedMissions.map((mission, index) => (
          <div key={mission.id} className="rounded-2xl border border-white/10 bg-[#080d1a] p-4">
            <div className="flex items-center justify-between gap-4">
              <p className={index === 0 ? "font-semibold text-slate-200" : "font-semibold text-slate-500"}>
                {mission.title}
              </p>
              <span className="rounded-full border border-white/10 bg-[#050713] px-3 py-1 text-xs text-slate-500">
                locked
              </span>
            </div>
            <p className={index === 0 ? "mt-2 text-sm leading-6 text-slate-500" : "mt-2 text-sm leading-6 text-slate-600"}>
              {mission.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function LaunchKitPreview({ selectedNiche }: { selectedNiche: Niche }) {
  const previewSections = launchKitSections.slice(0, 5);

  return (
    <section className="rounded-[2rem] border border-white/10 bg-[#0b1020] p-5 sm:p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">04 / Preview Launch Kit</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Итог собирается в пакет запуска</h2>
      <p className="mt-3 text-sm leading-7 text-slate-400">
        Ниша: <span className="text-cyan-100">{selectedNiche.title}</span>. В PRO каждый сохранённый результат
        попадает в структурированный workspace.
      </p>
      <div className="mt-5 grid gap-3">
        {previewSections.map((section, index) => (
          <div key={section.missionId} className="rounded-2xl border border-white/10 bg-[#080d1a] p-4">
            <div className="flex items-center justify-between gap-4">
              <p className="font-semibold text-white">{section.title}</p>
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                {index === 0 ? "demo" : "pro"}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {index === 0 ? selectedNiche.offerExample : "Заполняется после прохождения миссии."}
            </p>
          </div>
        ))}
      </div>
      <ButtonLink href="/#lead" className="mt-5 w-full">
        Получить PRO-доступ
      </ButtonLink>
    </section>
  );
}
