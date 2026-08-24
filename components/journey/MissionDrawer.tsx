"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  getMissionResults,
  missionResultPlaceholders,
  saveMissionResult,
  type MissionResult,
} from "@/lib/launch-kit";
import { type Mission, type MissionStatus, type Niche } from "@/lib/journey";

type MissionDrawerProps = {
  open: boolean;
  mission: Mission;
  missionIndex: number;
  niche: Niche;
  status: MissionStatus;
  nextMission?: Mission;
  initialResult?: MissionResult;
  onClose: () => void;
  onComplete: () => void;
  onNext: (missionId: string) => void;
  onResultSaved: (result: MissionResult) => void;
};

export function MissionDrawer({
  open,
  mission,
  missionIndex,
  niche,
  status,
  nextMission,
  initialResult,
  onClose,
  onComplete,
  onNext,
  onResultSaved,
}: MissionDrawerProps) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [resultText, setResultText] = useState(() => initialResult?.resultText ?? getMissionResults()[mission.id]?.resultText ?? "");
  const [resultSaved, setResultSaved] = useState(Boolean(initialResult?.resultText));
  const [success, setSuccess] = useState(false);

  const prompt = useMemo(() => buildPrompt(mission, niche), [mission, niche]);
  const example = useMemo(() => buildNicheExample(mission, niche), [mission, niche]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  async function copyPrompt() {
    try {
      if (!navigator.clipboard) return;
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  function toggleChecklist(item: string) {
    setCheckedItems((current) =>
      current.includes(item) ? current.filter((value) => value !== item) : [...current, item],
    );
  }

  function complete() {
    onComplete();
    setSuccess(true);
  }

  function saveResult() {
    const result: MissionResult = {
      missionId: mission.id,
      nicheId: niche.id,
      title: mission.title,
      resultText,
      updatedAt: new Date().toISOString(),
    };
    saveMissionResult(result);
    onResultSaved(result);
    setResultSaved(true);
  }

  function goNext() {
    if (!nextMission) return;
    onNext(nextMission.id);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-slate-950/80" role="dialog" aria-modal="true">
      <button className="absolute inset-0 cursor-default" type="button" aria-label="Закрыть миссию" onClick={onClose} />
      <aside className="absolute inset-y-0 right-0 flex h-dvh w-full max-w-3xl flex-col border-l border-white/10 bg-[#050713] shadow-[0_0_40px_rgba(2,6,23,0.6)]">
        <header className="sticky top-0 z-10 border-b border-white/10 bg-[#050713] px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] sm:p-5 sm:pt-[max(1.25rem,env(safe-area-inset-top))]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
                Миссия {(missionIndex + 1).toString().padStart(2, "0")} · {niche.title}
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{mission.title}</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 bg-[#080d1a] px-3 py-1 text-xs uppercase tracking-[0.16em] text-slate-300">
                  {status}
                </span>
                <span className="rounded-full border border-cyan-300/15 bg-cyan-300/[0.06] px-3 py-1 text-xs text-cyan-100">
                  {mission.time}
                </span>
                <span className="rounded-full border border-violet-300/15 bg-violet-300/[0.08] px-3 py-1 text-xs text-violet-100">
                  {mission.xpLabel}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/10 bg-[#080d1a] px-3 py-2 text-sm text-slate-300 transition hover:text-white"
            >
              Закрыть
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          {success ? (
            <MissionSuccess mission={mission} nextMission={nextMission} onNext={goNext} />
          ) : (
            <div className="grid gap-4">
              <MissionBlock label="Goal" title="Цель миссии">
                <p className="text-sm leading-7 text-slate-300">{mission.goal}</p>
              </MissionBlock>

              <MissionBlock label="Inputs" title="Заполните вводные">
                <div className="grid gap-3 sm:grid-cols-2">
                  {mission.inputs.map((input) => (
                    <label key={input} className="grid gap-2">
                      <span className="text-sm text-slate-300">{input}</span>
                      <input
                        value={inputs[input] ?? ""}
                        onChange={(event) => setInputs((current) => ({ ...current, [input]: event.target.value }))}
                        className="h-12 w-full rounded-2xl border border-white/10 bg-[#080d1a] px-4 text-base text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/40 md:text-sm"
                        placeholder="Заполните коротко"
                      />
                    </label>
                  ))}
                </div>
              </MissionBlock>

              <PromptPreview prompt={prompt} copied={copied} onCopy={copyPrompt} />

              <MissionBlock label="Niche example" title="Пример под выбранную нишу">
                <div className="grid gap-3 text-sm leading-7 text-slate-300">
                  <p>{example}</p>
                  <div className="grid gap-2 rounded-2xl border border-white/10 bg-[#080d1a] p-4">
                    <p>
                      <span className="text-slate-500">Возражения:</span> {niche.objections.join(", ")}
                    </p>
                    <p>
                      <span className="text-slate-500">Квиз:</span> {niche.quiz.join(", ")}
                    </p>
                    <p>
                      <span className="text-slate-500">Контент:</span> {niche.content.join(", ")}
                    </p>
                  </div>
                </div>
              </MissionBlock>

              <MissionResultEditor
                mission={mission}
                resultText={resultText}
                resultSaved={resultSaved}
                onChange={setResultText}
                onSave={saveResult}
              />

              <MissionBlock label="Expected output" title="После миссии у вас должно быть">
                <div className="grid gap-3 text-sm leading-7 text-slate-300">
                  <p>
                    <span className="text-emerald-200">Deliverable:</span> {mission.expectedResult}
                  </p>
                  <p>
                    <span className="text-cyan-200">Где использовать:</span> в посте, переписке, квизе, лендинге
                    или первом тесте спроса.
                  </p>
                  <p>
                    <span className="text-violet-200">Следующее действие:</span>{" "}
                    {nextMission ? `перейти к миссии «${nextMission.title}».` : "провести финальный запуск-чек."}
                  </p>
                </div>
              </MissionBlock>

              <MissionChecklist
                items={mission.checklist}
                checkedItems={checkedItems}
                onToggle={toggleChecklist}
              />
            </div>
          )}
        </div>

        <footer className="sticky bottom-0 z-10 border-t border-white/10 bg-[#050713] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:px-5 sm:pt-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-slate-500">
              MVP: вводные хранятся только в состоянии панели. Прогресс миссии сохраняется в localStorage.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              {success ? (
                <Button type="button" onClick={goNext} disabled={!nextMission}>
                  {nextMission ? "Перейти к следующей миссии" : "Маршрут завершён"}
                </Button>
              ) : (
                <Button type="button" onClick={complete} disabled={status === "completed"}>
                  {status === "completed" ? "Миссия уже готова" : "Отметить миссию готовой"}
                </Button>
              )}
              <Button type="button" variant="secondary" onClick={onClose}>
                Вернуться к карте
              </Button>
            </div>
          </div>
        </footer>
      </aside>
    </div>
  );
}

function MissionBlock({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-[#0b1020] p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <h3 className="mt-2 text-lg font-semibold text-white">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function PromptPreview({ prompt, copied, onCopy }: { prompt: string; copied: boolean; onCopy: () => void }) {
  return (
    <MissionBlock label="Prompt preview" title="Промпт для AI">
      <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] p-4">
        <p className="text-sm leading-7 text-slate-200">{prompt}</p>
      </div>
      <Button type="button" className="mt-3" onClick={onCopy}>
        {copied ? "Промпт скопирован" : "Скопировать промпт"}
      </Button>
    </MissionBlock>
  );
}

function MissionChecklist({
  items,
  checkedItems,
  onToggle,
}: {
  items: string[];
  checkedItems: string[];
  onToggle: (item: string) => void;
}) {
  return (
    <MissionBlock label="Checklist" title="Проверьте готовность">
      <div className="grid gap-2">
        {items.map((item) => {
          const checked = checkedItems.includes(item);
          return (
            <button
              key={item}
              type="button"
              onClick={() => onToggle(item)}
              className={`flex items-center gap-3 rounded-2xl border p-3 text-left text-sm transition ${
                checked
                  ? "border-emerald-300/25 bg-emerald-300/[0.08] text-emerald-100"
                  : "border-white/10 bg-slate-950/35 text-slate-300 hover:border-cyan-300/25"
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                  checked ? "border-emerald-300 bg-emerald-300 text-slate-950" : "border-white/20"
                }`}
                aria-hidden="true"
              >
                {checked ? "✓" : ""}
              </span>
              {item}
            </button>
          );
        })}
      </div>
    </MissionBlock>
  );
}

function MissionResultEditor({
  mission,
  resultText,
  resultSaved,
  onChange,
  onSave,
}: {
  mission: Mission;
  resultText: string;
  resultSaved: boolean;
  onChange: (value: string) => void;
  onSave: () => void;
}) {
  return (
    <MissionBlock label="Mission output" title="Ваш результат по миссии">
      <textarea
        value={resultText}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-28 w-full resize-y rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-base leading-6 text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/40 md:text-sm"
        placeholder={missionResultPlaceholders[mission.id] ?? "Вставьте результат миссии..."}
      />
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className={resultSaved ? "text-sm text-emerald-200" : "text-sm text-slate-500"}>
          {resultSaved ? "Результат сохранён в пакет запуска" : "Можно завершить миссию без текста, но пакет запуска будет полнее с результатом."}
        </p>
        <Button type="button" variant="secondary" onClick={onSave}>
          Сохранить результат
        </Button>
      </div>
    </MissionBlock>
  );
}

function MissionSuccess({
  mission,
  nextMission,
  onNext,
}: {
  mission: Mission;
  nextMission?: Mission;
  onNext: () => void;
}) {
  return (
    <div className="grid min-h-[42vh] place-items-center rounded-[2rem] border border-emerald-300/20 bg-emerald-300/[0.07] p-6 text-center">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-200">Миссия выполнена</p>
        <h3 className="mt-3 text-3xl font-semibold tracking-tight text-white">{mission.title}</h3>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-slate-300">
          Следующий шаг: {nextMission ? nextMission.title : "провести финальный чек готовности запуска"}.
        </p>
        <Button type="button" className="mt-6" onClick={onNext} disabled={!nextMission}>
          {nextMission ? "Перейти к следующей миссии" : "Маршрут завершён"}
        </Button>
      </div>
    </div>
  );
}

function buildPrompt(mission: Mission, niche: Niche) {
  return mission.promptTemplate
    .split("[ниша]")
    .join(niche.title)
    .split("[возражения]")
    .join(niche.objections.join(", "))
    .split("[quiz-поля]")
    .join(niche.quiz.join(", "));
}

function buildNicheExample(mission: Mission, niche: Niche) {
  if (mission.id === "offer-packaging") return `Оффер: ${niche.offerExample}`;
  if (mission.id === "objection-battle") return `Разберите возражения: ${niche.objections.join(", ")}.`;
  if (mission.id === "quiz-lead") return `Вопросы квиза: ${niche.quiz.join(", ")}.`;
  if (mission.id === "content-boost") return `Контент-темы: ${niche.content.join(", ")}.`;
  if (mission.id === "landing-route") return `Лендинг строится вокруг оффера: ${niche.offerExample}`;
  if (mission.id === "market-signals") return "Сигналы рынка: ответы, вопросы, заявки, сохранения, переходы и запросы цены.";
  return `Ниша: ${niche.title}. Рекомендуемый пакет: ${niche.recommendedPackage}.`;
}
