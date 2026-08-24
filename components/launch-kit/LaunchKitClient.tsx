"use client";

import Link from "next/link";
import { memo, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  buildLaunchKitText,
  getMissionResults,
  launchKitSections,
  missionResultsStorageKey,
  type MissionResultsMap,
} from "@/lib/launch-kit";
import { journeyStorageKeys, launchReadinessLevels, missions, niches, type NicheId } from "@/lib/journey";

type LaunchKitState = {
  selectedNiche: NicheId;
  completedMissions: string[];
  results: MissionResultsMap;
};

const defaultState: LaunchKitState = {
  selectedNiche: "services",
  completedMissions: [],
  results: {},
};

function readLaunchKitState(): LaunchKitState {
  if (typeof window === "undefined") return defaultState;

  const selected = window.localStorage.getItem(journeyStorageKeys.selectedNiche) as NicheId | null;
  const completedRaw = window.localStorage.getItem(journeyStorageKeys.completedMissions);

  return {
    selectedNiche: selected && niches.some((niche) => niche.id === selected) ? selected : defaultState.selectedNiche,
    completedMissions: parseCompleted(completedRaw),
    results: getMissionResults(),
  };
}

export function LaunchKitClient() {
  const [state, setState] = useState<LaunchKitState>(defaultState);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Restore client-only progress after mount so SSR HTML stays stable.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is not available during SSR
    setState(readLaunchKitState());
  }, []);

  useEffect(() => {
    function syncResults(event: StorageEvent) {
      if (event.key === missionResultsStorageKey || event.key === journeyStorageKeys.completedMissions) {
        setState((current) => ({
          ...current,
          completedMissions: parseCompleted(window.localStorage.getItem(journeyStorageKeys.completedMissions)),
          results: getMissionResults(),
        }));
      }
    }

    window.addEventListener("storage", syncResults);
    return () => window.removeEventListener("storage", syncResults);
  }, []);

  const selectedNiche = niches.find((niche) => niche.id === state.selectedNiche) ?? niches[0];
  const savedResultsCount = Object.values(state.results).filter((result) => result.resultText.trim()).length;
  const readinessPercent = Math.round(((state.completedMissions.length + savedResultsCount) / (missions.length * 2)) * 100);
  const readinessLevel =
    launchReadinessLevels.find((level) => readinessPercent >= level.min && readinessPercent <= level.max) ??
    launchReadinessLevels[0];

  const launchKitText = useMemo(
    () => buildLaunchKitText({ selectedNiche: state.selectedNiche, results: state.results }),
    [state.selectedNiche, state.results],
  );

  async function copyLaunchKit() {
    try {
      await navigator.clipboard.writeText(launchKitText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className="py-8 sm:py-10">
      <div className="gg-gutter mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="rounded-[1.5rem] border border-white/10 bg-[#0b1020] p-4 sm:rounded-[2rem] sm:p-7">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">Launch kit workspace</p>
              <h1 className="mt-3 text-4xl font-black tracking-[-0.045em] text-white sm:text-6xl">
                Пакет первого запуска
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
                Здесь собираются ваши рабочие результаты по миссиям: оффер, контент, скрипты,
                квиз, лендинг и первые действия.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[24rem]">
              <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.08] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-100">Ниша</p>
                <p className="mt-2 text-xl font-semibold text-white">{selectedNiche.title}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-[#080d1a] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Готовность</p>
                <p className="mt-2 text-xl font-semibold text-white">{readinessPercent}% · {readinessLevel.label}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="gg-sticky-under-header sticky z-30 rounded-[1.5rem] border border-white/10 bg-[#050713] p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <SummaryPill label="Выполнено миссий" value={`${state.completedMissions.length}/${missions.length}`} />
              <SummaryPill label="Сохранено результатов" value={`${savedResultsCount}/${missions.length}`} />
              <SummaryPill label="Статус" value={readinessLevel.label} />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="button" onClick={copyLaunchKit}>
                {copied ? "Пакет скопирован" : "Скопировать пакет запуска"}
              </Button>
              <Button type="button" variant="outline" disabled>
                Экспорт в PDF — скоро
              </Button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          {launchKitSections.map((section, index) => (
            <LaunchKitSection
              key={section.missionId}
              index={index}
              title={section.title}
              empty={section.empty}
              missionId={section.missionId}
              resultText={state.results[section.missionId]?.resultText}
            />
          ))}
        </section>
      </div>
    </main>
  );
}

function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#080d1a] px-4 py-3">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

const LaunchKitSection = memo(function LaunchKitSection({
  index,
  title,
  empty,
  missionId,
  resultText,
}: {
  index: number;
  title: string;
  empty: string;
  missionId: string;
  resultText?: string;
}) {
  const filled = Boolean(resultText?.trim());

  return (
    <article className="rounded-[1.5rem] border border-white/10 bg-[#0b1020] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
            {(index + 1).toString().padStart(2, "0")}
          </p>
          <h2 className="mt-3 text-xl font-semibold text-white">{title}</h2>
        </div>
        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-xs ${
            filled
              ? "border-emerald-300/20 bg-emerald-950/40 text-emerald-100"
              : "border-white/10 bg-[#080d1a] text-slate-500"
          }`}
        >
          {filled ? "готово" : "не заполнено"}
        </span>
      </div>
      <div className="mt-4 min-h-28 rounded-2xl border border-white/10 bg-[#080d1a] p-4">
        {filled ? (
          <p className="whitespace-pre-wrap text-sm leading-7 text-slate-200">{resultText}</p>
        ) : (
          <p className="text-sm leading-7 text-slate-500">{empty}</p>
        )}
      </div>
      <Link
        href={`/journey?mission=${missionId}`}
        className="mt-4 inline-flex text-sm font-semibold text-cyan-200 transition hover:text-white"
      >
        Открыть миссию →
      </Link>
    </article>
  );
});

function parseCompleted(value: string | null) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}
