"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { memo, useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { getMissionResults, type MissionResult, type MissionResultsMap } from "@/lib/launch-kit";
import {
  journeyStorageKeys,
  launchReadinessLevels,
  missions,
  niches,
  type Mission,
  type MissionStatus,
  type Niche,
  type NicheId,
} from "@/lib/journey";

const MissionDrawer = dynamic(
  () => import("@/components/journey/MissionDrawer").then((mod) => mod.MissionDrawer),
  { ssr: false },
);

type JourneyState = {
  selectedNiche: NicheId;
  completedMissions: string[];
  activeMissionId: string;
};

const defaultState: JourneyState = {
  selectedNiche: "services",
  completedMissions: [],
  activeMissionId: missions[0].id,
};

function parseCompletedMissions(value: string | null) {
  if (!value) return defaultState.completedMissions;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return defaultState.completedMissions;
  }
}

export function JourneyExperience() {
  const [state, setState] = useState<JourneyState>(defaultState);
  const [drawerMissionId, setDrawerMissionId] = useState<string | null>(null);
  const [missionResults, setMissionResults] = useState<MissionResultsMap>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const selected = window.localStorage.getItem(journeyStorageKeys.selectedNiche) as NicheId | null;
    const completed = window.localStorage.getItem(journeyStorageKeys.completedMissions);
    const active = window.localStorage.getItem(journeyStorageKeys.activeMission);
    const parsedCompleted = parseCompletedMissions(completed);
    const missionFromUrl = new URLSearchParams(window.location.search).get("mission");

    // Restore client-only progress after mount so SSR HTML stays stable.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is not available during SSR
    setState({
      selectedNiche: selected && niches.some((niche) => niche.id === selected) ? selected : defaultState.selectedNiche,
      completedMissions: parsedCompleted,
      activeMissionId: active && missions.some((mission) => mission.id === active) ? active : defaultState.activeMissionId,
    });
    setMissionResults(getMissionResults());
    if (missionFromUrl && missions.some((mission) => mission.id === missionFromUrl)) {
      setDrawerMissionId(missionFromUrl);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    window.localStorage.setItem(journeyStorageKeys.selectedNiche, state.selectedNiche);
    window.localStorage.setItem(journeyStorageKeys.completedMissions, JSON.stringify(state.completedMissions));
    window.localStorage.setItem(journeyStorageKeys.activeMission, state.activeMissionId);
  }, [hydrated, state]);

  const selectedNiche = niches.find((niche) => niche.id === state.selectedNiche) ?? niches[0];
  const drawerMission = missions.find((mission) => mission.id === drawerMissionId) ?? missions[0];
  const progressPercent = Math.round((state.completedMissions.length / missions.length) * 100);
  const savedResultsCount = Object.values(missionResults).filter((result) => result.resultText.trim()).length;
  const readinessPercent = Math.round(((state.completedMissions.length + savedResultsCount) / (missions.length * 2)) * 100);
  const drawerMissionIndex = missions.findIndex((mission) => mission.id === drawerMission.id);
  const nextMission = missions.find((mission) => !state.completedMissions.includes(mission.id));

  const statusById = useMemo(() => {
    const firstIncompleteIndex = missions.findIndex((item) => !state.completedMissions.includes(item.id));
    const map: Record<string, MissionStatus> = {};

    missions.forEach((mission, index) => {
      if (state.completedMissions.includes(mission.id)) {
        map[mission.id] = "completed";
      } else if (index <= Math.max(firstIncompleteIndex, 0)) {
        map[mission.id] = "active";
      } else {
        map[mission.id] = "locked";
      }
    });

    return map;
  }, [state.completedMissions]);

  const selectNiche = useCallback((nicheId: NicheId) => {
    setState({
      selectedNiche: nicheId,
      completedMissions: [],
      activeMissionId: missions[0].id,
    });
  }, []);

  const startMission = useCallback((missionId: string) => {
    setState((current) => ({ ...current, activeMissionId: missionId }));
    setDrawerMissionId(missionId);
  }, []);

  const completeMission = useCallback((missionId: string) => {
    setState((current) => {
      const completedMissions = current.completedMissions.includes(missionId)
        ? current.completedMissions
        : [...current.completedMissions, missionId];
      const next = missions.find((mission) => !completedMissions.includes(mission.id));

      return {
        ...current,
        completedMissions,
        activeMissionId: next?.id ?? missionId,
      };
    });
  }, []);

  const resetProgress = useCallback(() => {
    setState((current) => ({
      ...current,
      completedMissions: [],
      activeMissionId: missions[0].id,
    }));
  }, []);

  const handleResultSaved = useCallback((result: MissionResult) => {
    setMissionResults((current) => ({
      ...current,
      [result.missionId]: result,
    }));
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerMissionId(null);
  }, []);

  const missingItems = useMemo(
    () =>
      missions
        .filter((mission) => !state.completedMissions.includes(mission.id))
        .slice(0, 4)
        .map((mission) => `${mission.shortTitle} не готов`),
    [state.completedMissions],
  );

  return (
    <main className="py-8 sm:py-10">
      <div className="gg-gutter mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="rounded-[1.5rem] border border-white/10 bg-[#0b1020] p-4 sm:rounded-[2rem] sm:p-7 lg:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">AI-карта запуска</p>
              <h1 className="mt-3 max-w-5xl text-4xl font-black tracking-[-0.045em] text-white sm:text-6xl">
                Выберите нишу и проходите маршрут как бизнес-миссии
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
                Премиальный cockpit для пошаговой подготовки основы продвижения: без детской игры,
                без обещаний гарантированного результата, только маршрут, прогресс и следующие действия.
              </p>
            </div>
            <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.08] p-5 text-center">
              <p className="text-4xl font-black text-white">{progressPercent}%</p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-cyan-100">готовность</p>
              <Link href="/launch-kit" className="mt-3 inline-flex text-xs font-semibold text-cyan-100 hover:text-white">
                Открыть пакет →
              </Link>
            </div>
          </div>
        </section>

        <StickyProgress
          progressPercent={progressPercent}
          completedCount={state.completedMissions.length}
          nextMission={nextMission}
        />

        <NicheSelector selectedNiche={selectedNiche} onSelect={selectNiche} />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
          <div className="space-y-6">
            <JourneyMap
              selectedNiche={selectedNiche}
              completedMissions={state.completedMissions}
              missionResults={missionResults}
              activeMissionId={state.activeMissionId}
              statusById={statusById}
              onStartMission={startMission}
              onCompleteMission={completeMission}
            />
          </div>

          <aside className="space-y-6 xl:sticky xl:top-[var(--gg-header-offset)] xl:self-start">
            <ProgressPanel
              selectedNiche={selectedNiche}
              progressPercent={progressPercent}
              savedResultsCount={savedResultsCount}
              completedCount={state.completedMissions.length}
              nextMission={nextMission}
              onReset={resetProgress}
            />
            <BadgeGrid completedMissions={state.completedMissions} />
            <LaunchReadinessScore
              progressPercent={readinessPercent}
              completedCount={state.completedMissions.length}
              savedResultsCount={savedResultsCount}
              missingItems={missingItems}
            />
          </aside>
        </div>

        {drawerMissionId ? (
          <MissionDrawer
            key={drawerMission.id}
            open
            mission={drawerMission}
            missionIndex={drawerMissionIndex}
            niche={selectedNiche}
            status={statusById[drawerMission.id] ?? "active"}
            nextMission={nextMission}
            initialResult={missionResults[drawerMission.id]}
            onClose={closeDrawer}
            onComplete={() => completeMission(drawerMission.id)}
            onNext={startMission}
            onResultSaved={handleResultSaved}
          />
        ) : null}
      </div>
    </main>
  );
}

function StickyProgress({
  progressPercent,
  completedCount,
  nextMission,
}: {
  progressPercent: number;
  completedCount: number;
  nextMission?: Mission;
}) {
  return (
    <div className="gg-sticky-under-header sticky z-30 rounded-b-[1.5rem] border border-white/10 bg-[#050713] p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Готовность к первому запуску</p>
          <p className="mt-1 truncate text-sm text-slate-200">
            {completedCount} из {missions.length} миссий · следующий шаг: {nextMission?.shortTitle ?? "финальный чек"}
          </p>
        </div>
        <p className="text-sm font-semibold text-cyan-100">{progressPercent}%</p>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-violet-400 to-pink-400 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}

function NicheSelector({ selectedNiche, onSelect }: { selectedNiche: Niche; onSelect: (nicheId: NicheId) => void }) {
  return (
    <section id="niche-selector" className="rounded-[2rem] border border-white/10 bg-[#0b1020] p-5 sm:p-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">Niche selector</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Выберите свою нишу — и получите маршрут прохождения
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-slate-400">
          Выбор меняет примеры оффера, возражений, квиза и контента внутри каждой миссии.
        </p>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {niches.map((niche) => {
          const active = selectedNiche.id === niche.id;

          return (
            <button
              key={niche.id}
              type="button"
              onClick={() => onSelect(niche.id)}
              className={`rounded-3xl border p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${
                active
                  ? "border-cyan-300/45 bg-cyan-300/[0.10]"
                  : "border-white/10 bg-[#080d1a] hover:border-cyan-300/25"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="min-w-0 text-lg font-semibold text-white">{niche.title}</h3>
                <span className="shrink-0 rounded-full border border-white/10 bg-[#050713] px-2 py-1 text-[0.65rem] uppercase tracking-[0.12em] text-slate-400">
                  {niche.estimatedTime}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-400">{niche.description}</p>
              <div className="mt-4 grid gap-2 text-xs">
                <span className="text-cyan-100">Пакет: {niche.recommendedPackage}</span>
                <span className="text-slate-500">Сложность: {niche.difficulty}</span>
              </div>
              <span className="mt-5 inline-flex text-sm font-semibold text-cyan-200">
                {active ? "Маршрут выбран" : "Выбрать маршрут"} →
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function JourneyMap({
  selectedNiche,
  completedMissions,
  missionResults,
  activeMissionId,
  statusById,
  onStartMission,
  onCompleteMission,
}: {
  selectedNiche: Niche;
  completedMissions: string[];
  missionResults: MissionResultsMap;
  activeMissionId: string;
  statusById: Record<string, MissionStatus>;
  onStartMission: (missionId: string) => void;
  onCompleteMission: (missionId: string) => void;
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-[#0b1020] p-5 sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">Mission map</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Маршрут для ниши: {selectedNiche.title}</h2>
        </div>
        <p className="text-sm text-slate-400">
          Выполнено: {completedMissions.length} из {missions.length} миссий
        </p>
      </div>

      <div className="relative mt-7 grid gap-4">
        <div className="absolute bottom-8 left-6 top-8 hidden w-px bg-gradient-to-b from-cyan-300/60 via-violet-300/30 to-transparent md:block" />
        {missions.map((mission, index) => (
          <MissionCard
            key={mission.id}
            mission={mission}
            index={index}
            status={statusById[mission.id] ?? "locked"}
            active={activeMissionId === mission.id}
            hasSavedResult={Boolean(missionResults[mission.id]?.resultText?.trim())}
            completedWithoutResult={
              completedMissions.includes(mission.id) && !missionResults[mission.id]?.resultText?.trim()
            }
            onStart={onStartMission}
            onComplete={onCompleteMission}
          />
        ))}
      </div>
    </section>
  );
}

const MissionCard = memo(function MissionCard({
  mission,
  index,
  status,
  active,
  hasSavedResult,
  completedWithoutResult,
  onStart,
  onComplete,
}: {
  mission: Mission;
  index: number;
  status: MissionStatus;
  active: boolean;
  hasSavedResult: boolean;
  completedWithoutResult: boolean;
  onStart: (missionId: string) => void;
  onComplete: (missionId: string) => void;
}) {
  const locked = status === "locked";
  const completed = status === "completed";

  return (
    <article
      className={`relative grid gap-4 rounded-[1.5rem] border p-4 md:grid-cols-[auto_1fr_auto] md:items-center ${
        completed
          ? "border-emerald-300/30 bg-emerald-950/40"
          : active
            ? "border-cyan-300/40 bg-cyan-950/35"
            : locked
              ? "border-white/8 bg-[#080d1a] opacity-65"
              : "border-white/10 bg-[#080d1a]"
      }`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/55 text-sm font-semibold text-cyan-100">
        {(index + 1).toString().padStart(2, "0")}
      </div>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold text-white">{mission.title}</h3>
          <span className="rounded-full border border-white/10 bg-[#080d1a] px-2.5 py-1 text-xs text-slate-300">
            {mission.time}
          </span>
          <span className="rounded-full border border-cyan-300/15 bg-cyan-300/[0.06] px-2.5 py-1 text-xs text-cyan-100">
            {mission.xpLabel}
          </span>
          {hasSavedResult ? (
            <span className="rounded-full border border-emerald-300/20 bg-emerald-300/[0.08] px-2.5 py-1 text-xs text-emerald-100">
              результат сохранён
            </span>
          ) : completedWithoutResult ? (
            <span className="rounded-full border border-amber-300/20 bg-amber-300/[0.08] px-2.5 py-1 text-xs text-amber-100">
              без результата
            </span>
          ) : null}
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-400">{mission.description}</p>
        <p className="mt-2 text-sm text-slate-300">Результат: {mission.expectedResult}</p>
      </div>
      <div className="grid gap-2 md:min-w-44">
        <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
          {completed ? "completed" : locked ? "locked" : "active"}
        </span>
        <Button type="button" size="sm" disabled={locked} onClick={() => onStart(mission.id)}>
          {locked ? "Доступно в PRO" : "Начать миссию"}
        </Button>
        <button
          type="button"
          disabled={locked || completed}
          onClick={() => onComplete(mission.id)}
          className="rounded-full px-3 py-2 text-xs font-semibold text-slate-300 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
        >
          {completed ? "Готово" : "Отметить как готово"}
        </button>
      </div>
    </article>
  );
});

function ProgressPanel({
  selectedNiche,
  progressPercent,
  savedResultsCount,
  completedCount,
  nextMission,
  onReset,
}: {
  selectedNiche: Niche;
  progressPercent: number;
  savedResultsCount: number;
  completedCount: number;
  nextMission?: Mission;
  onReset: () => void;
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-[#0b1020] p-5">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">Progress system</p>
      <h2 className="mt-3 text-2xl font-semibold text-white">{selectedNiche.title}</h2>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-violet-400 to-pink-400 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
          <p className="text-3xl font-black text-white">{progressPercent}%</p>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">готовность</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
          <p className="text-3xl font-black text-white">{completedCount}/{missions.length}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">миссий</p>
        </div>
      </div>
      <div className="mt-3 rounded-2xl border border-white/10 bg-slate-950/35 p-4">
        <p className="text-3xl font-black text-white">{savedResultsCount}/{missions.length}</p>
        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">сохранено результатов</p>
      </div>
      <div className="mt-5 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Следующий шаг</p>
        <p className="mt-2 text-sm text-slate-200">{nextMission?.title ?? "Финальный чек завершён"}</p>
      </div>
      <button type="button" onClick={onReset} className="mt-4 text-sm font-semibold text-slate-500 transition hover:text-white">
        Сбросить прогресс
      </button>
    </section>
  );
}

function BadgeGrid({ completedMissions }: { completedMissions: string[] }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-[#0b1020] p-5">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">Badges</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <span className="rounded-full border border-cyan-300/25 bg-cyan-300/[0.08] px-3 py-2 text-xs text-cyan-100">
          Маршрут выбран
        </span>
        {missions.map((mission) => {
          const active = completedMissions.includes(mission.id);
          return (
            <span
              key={mission.id}
              className={`rounded-full border px-3 py-2 text-xs transition ${
                active
                  ? "border-emerald-300/25 bg-emerald-300/[0.08] text-emerald-100"
                  : "border-white/10 bg-slate-950/35 text-slate-500"
              }`}
            >
              {mission.badge}
            </span>
          );
        })}
      </div>
    </section>
  );
}

function LaunchReadinessScore({
  progressPercent,
  completedCount,
  savedResultsCount,
  missingItems,
}: {
  progressPercent: number;
  completedCount: number;
  savedResultsCount: number;
  missingItems: string[];
}) {
  const level =
    launchReadinessLevels.find((item) => progressPercent >= item.min && progressPercent <= item.max) ??
    launchReadinessLevels[0];

  return (
    <section className="rounded-[2rem] border border-white/10 bg-[#0b1020] p-5">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">Launch readiness score</p>
      <h2 className="mt-3 text-2xl font-semibold text-white">Готовность к первому запуску</h2>
      <p className="mt-4 text-5xl font-black tracking-tight text-white">{progressPercent}%</p>
      <p className="mt-2 text-lg font-semibold text-cyan-100">{level.label}</p>
      <p className="mt-3 text-sm leading-6 text-slate-400">{level.description}</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Выполнено миссий</p>
          <p className="mt-2 text-2xl font-semibold text-white">{completedCount}/{missions.length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Сохранено результатов</p>
          <p className="mt-2 text-2xl font-semibold text-white">{savedResultsCount}/{missions.length}</p>
        </div>
      </div>
      <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/35 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Чего не хватает</p>
        <ul className="mt-3 grid gap-2 text-sm text-slate-300">
          {(missingItems.length ? missingItems : ["Ключевые блоки закрыты"]).map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-200" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
