"use client";

import { useEffect, useState } from "react";

import { MissionDrawer } from "@/components/journey/MissionDrawer";
import { Button } from "@/components/ui/button";
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
  const [state, setState] = useState<JourneyState>(() => {
    if (typeof window === "undefined") return defaultState;

    const selected = window.localStorage.getItem(journeyStorageKeys.selectedNiche) as NicheId | null;
    const completed = window.localStorage.getItem(journeyStorageKeys.completedMissions);
    const active = window.localStorage.getItem(journeyStorageKeys.activeMission);
    const parsedCompleted = parseCompletedMissions(completed);

    return {
      selectedNiche: selected && niches.some((niche) => niche.id === selected) ? selected : defaultState.selectedNiche,
      completedMissions: parsedCompleted,
      activeMissionId: active && missions.some((mission) => mission.id === active) ? active : defaultState.activeMissionId,
    };
  });
  const [drawerMissionId, setDrawerMissionId] = useState<string | null>(null);

  useEffect(() => {
    window.localStorage.setItem(journeyStorageKeys.selectedNiche, state.selectedNiche);
    window.localStorage.setItem(journeyStorageKeys.completedMissions, JSON.stringify(state.completedMissions));
    window.localStorage.setItem(journeyStorageKeys.activeMission, state.activeMissionId);
  }, [state]);

  const selectedNiche = niches.find((niche) => niche.id === state.selectedNiche) ?? niches[0];
  const drawerMission = missions.find((mission) => mission.id === drawerMissionId) ?? missions[0];
  const progressPercent = Math.round((state.completedMissions.length / missions.length) * 100);
  const drawerMissionIndex = missions.findIndex((mission) => mission.id === drawerMission.id);
  const nextMission = missions.find((mission) => !state.completedMissions.includes(mission.id));

  function selectNiche(nicheId: NicheId) {
    setState({
      selectedNiche: nicheId,
      completedMissions: [],
      activeMissionId: missions[0].id,
    });
  }

  function startMission(missionId: string) {
    setState((current) => ({ ...current, activeMissionId: missionId }));
    setDrawerMissionId(missionId);
  }

  function completeMission(missionId: string) {
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
  }

  function resetProgress() {
    setState((current) => ({
      ...current,
      completedMissions: [],
      activeMissionId: missions[0].id,
    }));
  }

  function statusFor(mission: Mission): MissionStatus {
    if (state.completedMissions.includes(mission.id)) return "completed";
    const firstIncompleteIndex = missions.findIndex((item) => !state.completedMissions.includes(item.id));
    const missionIndex = missions.findIndex((item) => item.id === mission.id);
    if (missionIndex <= Math.max(firstIncompleteIndex, 0)) return "active";
    return "locked";
  }

  const missingItems = missions
    .filter((mission) => !state.completedMissions.includes(mission.id))
    .slice(0, 4)
    .map((mission) => `${mission.shortTitle} не готов`);

  return (
    <main className="py-8 sm:py-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-glow backdrop-blur-xl sm:p-7 lg:p-8">
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
              activeMissionId={state.activeMissionId}
              statusFor={statusFor}
              onStartMission={startMission}
              onCompleteMission={completeMission}
            />
          </div>

          <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
            <ProgressPanel
              selectedNiche={selectedNiche}
              progressPercent={progressPercent}
              completedCount={state.completedMissions.length}
              nextMission={nextMission}
              onReset={resetProgress}
            />
            <BadgeGrid completedMissions={state.completedMissions} />
            <LaunchReadinessScore progressPercent={progressPercent} missingItems={missingItems} />
          </aside>
        </div>

        <MissionDrawer
          key={`${selectedNiche.id}-${drawerMission.id}`}
          open={drawerMissionId !== null}
          mission={drawerMission}
          missionIndex={drawerMissionIndex}
          niche={selectedNiche}
          status={statusFor(drawerMission)}
          nextMission={nextMission}
          onClose={() => setDrawerMissionId(null)}
          onComplete={() => completeMission(drawerMission.id)}
          onNext={startMission}
        />
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
    <div className="sticky top-16 z-30 rounded-b-[1.5rem] border border-white/10 bg-slate-950/78 p-3 shadow-[0_18px_70px_rgba(2,6,23,0.45)] backdrop-blur-2xl">
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
    <section id="niche-selector" className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-glow backdrop-blur-xl sm:p-7">
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
              className={`rounded-3xl border p-4 text-left transition duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${
                active
                  ? "border-cyan-300/45 bg-cyan-300/[0.10] shadow-cyan-glow"
                  : "border-white/10 bg-slate-950/35 hover:border-cyan-300/25 hover:bg-white/[0.06]"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg font-semibold text-white">{niche.title}</h3>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[0.65rem] uppercase tracking-[0.16em] text-slate-400">
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
  activeMissionId,
  statusFor,
  onStartMission,
  onCompleteMission,
}: {
  selectedNiche: Niche;
  completedMissions: string[];
  activeMissionId: string;
  statusFor: (mission: Mission) => MissionStatus;
  onStartMission: (missionId: string) => void;
  onCompleteMission: (missionId: string) => void;
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-glow backdrop-blur-xl sm:p-7">
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
            status={statusFor(mission)}
            active={activeMissionId === mission.id}
            onStart={() => onStartMission(mission.id)}
            onComplete={() => onCompleteMission(mission.id)}
          />
        ))}
      </div>
    </section>
  );
}

function MissionCard({
  mission,
  index,
  status,
  active,
  onStart,
  onComplete,
}: {
  mission: Mission;
  index: number;
  status: MissionStatus;
  active: boolean;
  onStart: () => void;
  onComplete: () => void;
}) {
  const locked = status === "locked";
  const completed = status === "completed";

  return (
    <article
      className={`relative grid gap-4 rounded-[1.5rem] border p-4 transition duration-300 md:grid-cols-[auto_1fr_auto] md:items-center ${
        completed
          ? "border-emerald-300/30 bg-emerald-300/[0.07]"
          : active
            ? "border-cyan-300/40 bg-cyan-300/[0.09] shadow-cyan-glow"
            : locked
              ? "border-white/8 bg-slate-950/25 opacity-65"
              : "border-white/10 bg-slate-950/35 hover:border-cyan-300/25 hover:bg-white/[0.055]"
      }`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/55 text-sm font-semibold text-cyan-100">
        {(index + 1).toString().padStart(2, "0")}
      </div>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold text-white">{mission.title}</h3>
          <span className="rounded-full border border-white/10 bg-white/[0.045] px-2.5 py-1 text-xs text-slate-300">
            {mission.time}
          </span>
          <span className="rounded-full border border-cyan-300/15 bg-cyan-300/[0.06] px-2.5 py-1 text-xs text-cyan-100">
            {mission.xpLabel}
          </span>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-400">{mission.description}</p>
        <p className="mt-2 text-sm text-slate-300">Результат: {mission.expectedResult}</p>
      </div>
      <div className="grid gap-2 md:min-w-44">
        <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
          {completed ? "completed" : locked ? "locked" : "active"}
        </span>
        <Button type="button" size="sm" disabled={locked} onClick={onStart}>
          {locked ? "Доступно в PRO" : "Начать миссию"}
        </Button>
        <button
          type="button"
          disabled={locked || completed}
          onClick={onComplete}
          className="rounded-full px-3 py-2 text-xs font-semibold text-slate-300 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
        >
          {completed ? "Готово" : "Отметить как готово"}
        </button>
      </div>
    </article>
  );
}

function ProgressPanel({
  selectedNiche,
  progressPercent,
  completedCount,
  nextMission,
  onReset,
}: {
  selectedNiche: Niche;
  progressPercent: number;
  completedCount: number;
  nextMission?: Mission;
  onReset: () => void;
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-glow backdrop-blur-xl">
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
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-glow backdrop-blur-xl">
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

function LaunchReadinessScore({ progressPercent, missingItems }: { progressPercent: number; missingItems: string[] }) {
  const level =
    launchReadinessLevels.find((item) => progressPercent >= item.min && progressPercent <= item.max) ??
    launchReadinessLevels[0];

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-glow backdrop-blur-xl">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">Launch readiness score</p>
      <h2 className="mt-3 text-2xl font-semibold text-white">Готовность к первому запуску</h2>
      <p className="mt-4 text-5xl font-black tracking-tight text-white">{progressPercent}%</p>
      <p className="mt-2 text-lg font-semibold text-cyan-100">{level.label}</p>
      <p className="mt-3 text-sm leading-6 text-slate-400">{level.description}</p>
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
