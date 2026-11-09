"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { cleanHypothesis, HypothesisEditor } from "@/components/flow/HypothesisEditor";
import { ProfileForm } from "@/components/flow/ProfileForm";
import { Field } from "@/components/ui/Field";
import { getNiche } from "@/lib/catalog";
import { apiRequest } from "@/lib/client/api";
import { businessModelIds, businessModels, type BusinessModelId } from "@/lib/domain/business-models";
import { suggestHypothesis, type HypothesisFields } from "@/lib/domain/hypothesis";
import { emptyProfile, formatBudget, isFieldKnown, profileFieldIds, profileFieldLabels, type StartupProfile } from "@/lib/domain/profile";

type EntryMode = "own_idea" | "catalog" | "advisor";

type Draft = {
  version: 1;
  entryMode: EntryMode;
  stage: 1 | 2 | 3;
  idea: string;
  nicheId: string | null;
  model: BusinessModelId | null;
  profile: StartupProfile;
  hypothesis: HypothesisFields | null;
  basis: string;
  savedAt: string;
};

export const DRAFT_KEY = "br_public_draft_v1";

function readDraft(): Draft | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    const parsed = raw ? (JSON.parse(raw) as Draft) : null;
    return parsed?.version === 1 ? parsed : null;
  } catch {
    return null;
  }
}

type Props = {
  initialNiche: string | null;
  initialModel: BusinessModelId | null;
  initialMode: EntryMode;
  signedIn: boolean;
  knownProfile: StartupProfile | null;
  resume: boolean;
};

export function IdeaWizard({ initialNiche, initialModel, initialMode, signedIn, knownProfile, resume }: Props) {
  const router = useRouter();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [ready, setReady] = useState(false);
  const [draft, setDraft] = useState<Draft>(() => ({
    version: 1,
    entryMode: initialMode,
    stage: 1,
    idea: "",
    nicheId: initialNiche,
    model: initialModel,
    profile: knownProfile ?? emptyProfile(),
    hypothesis: null,
    basis: "",
    savedAt: "",
  }));
  const [editProfile, setEditProfile] = useState(!knownProfile);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const stored = readDraft();
    const queryConflicts = initialNiche && stored && stored.nicheId !== initialNiche;
    // Restoring from browser storage is a sync with an external system after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored && !queryConflicts) setDraft(knownProfile && !stored.profile.region && !stored.profile.skills ? { ...stored, profile: knownProfile } : stored);
    setReady(true);
  }, [initialNiche, knownProfile]);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...draft, savedAt: new Date().toISOString() }));
    } catch {
      // Storage can be unavailable (private mode); the wizard keeps working in memory.
    }
  }, [draft, ready]);

  const niche = getNiche(draft.nicheId);
  const update = (patch: Partial<Draft>) => setDraft((current) => ({ ...current, ...patch }));

  const goTo = (stage: Draft["stage"]) => {
    setError(null);
    update({ stage });
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const toProfile = () => {
    if (!draft.idea.trim() && !niche) {
      setError("Опишите идею хотя бы одной фразой или выберите направление в каталоге.");
      return;
    }
    if (!draft.model) {
      setError("Выберите модель заработка — от неё зависит план проверки.");
      return;
    }
    goTo(2);
  };

  const toHypothesis = () => {
    const basis = `${draft.idea}|${draft.nicheId}|${draft.model}`;
    if (!draft.hypothesis || draft.basis !== basis) {
      const suggested = suggestHypothesis({
        ideaText: draft.idea,
        nicheId: draft.nicheId,
        businessModel: draft.model,
        budget: { amount: draft.profile.budgetAmount, currency: draft.profile.budgetCurrency },
        constraints: draft.profile.constraints,
      });
      update({ hypothesis: suggested, basis, profile: { ...draft.profile, confirmed: true } });
    } else {
      update({ profile: { ...draft.profile, confirmed: true } });
    }
    goTo(3);
  };

  const save = async () => {
    if (!draft.hypothesis) return;
    setPending(true);
    setError(null);
    const result = await apiRequest<{ id: string }>("/api/projects", {
      body: {
        entryMode: draft.entryMode,
        profile: { ...draft.profile, confirmed: true },
        hypothesis: { ...cleanHypothesis(draft.hypothesis), ideaText: draft.idea || draft.hypothesis.ideaText },
      },
    });
    setPending(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    window.localStorage.removeItem(DRAFT_KEY);
    router.push(`/startup/${result.id}/hypothesis?created=1`);
  };

  const discard = () => {
    window.localStorage.removeItem(DRAFT_KEY);
    setDraft({ ...draft, stage: 1, idea: "", hypothesis: null, basis: "", profile: knownProfile ?? emptyProfile() });
  };

  const stageTitles = { 1: "Идея", 2: "Немного о вас", 3: "Карточка гипотезы" } as const;

  return (
    <div className="grid gap-10 lg:grid-cols-[13rem_1fr]">
      <nav aria-label="Шаги" className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:self-start">
        <ol className="flex gap-2 lg:flex-col lg:gap-0 lg:border-l lg:border-rule">
          {([1, 2, 3] as const).map((stage) => {
            const current = draft.stage === stage;
            const reachable = stage < draft.stage;
            return (
              <li key={stage} className="flex-1 lg:flex-none">
                <button
                  type="button"
                  onClick={() => reachable && goTo(stage)}
                  disabled={!reachable && !current}
                  aria-current={current ? "step" : undefined}
                  className={`w-full border-t-2 pt-2 text-left text-sm lg:-ml-px lg:border-l-2 lg:border-t-0 lg:py-2 lg:pl-4 lg:pt-2 ${
                    current ? "border-teal font-semibold text-ink" : reachable ? "border-rule-strong text-ink-soft hover:text-teal" : "border-rule text-subtle"
                  }`}
                >
                  <span className="block text-xs text-muted">Шаг {stage} из 3</span>
                  {stageTitles[stage]}
                </button>
              </li>
            );
          })}
        </ol>
        <p className="mt-6 hidden text-sm text-muted lg:block">Черновик сохраняется только в этом браузере, пока вы сами не перенесёте его в аккаунт.</p>
      </nav>

      <div key={draft.stage} className="appear min-w-0 max-w-[46rem]">
        <h2 ref={headingRef} tabIndex={-1} className="title !text-[clamp(1.7rem,1.3rem+1.5vw,2.3rem)] outline-none">
          {draft.stage === 1 ? "С чего начинаем" : draft.stage === 2 ? "Немного о вас" : "Карточка гипотезы"}
        </h2>

        {draft.stage === 1 ? (
          <div className="mt-8 space-y-8">
            {niche ? (
              <div className="notice">
                Направление из каталога: <strong>{niche.title}</strong>.{" "}
                <button type="button" className="link" onClick={() => update({ nicheId: null, entryMode: "own_idea" })}>
                  Убрать
                </button>
              </div>
            ) : null}
            <Field
              label={niche ? "Что хотите добавить к направлению" : "Ваша идея"}
              hint="Своими словами, как рассказали бы другу. Например: «Хочу шить шторы на заказ для соседей»."
              optional={Boolean(niche)}
            >
              <textarea className="control" rows={4} maxLength={2000} value={draft.idea} onChange={(event) => update({ idea: event.target.value })} />
            </Field>
            <fieldset>
              <legend className="field-label">Как будете зарабатывать</legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {businessModelIds
                  .filter((id) => !niche || niche.models.includes(id))
                  .map((id) => (
                    <label
                      key={id}
                      className="flex cursor-pointer flex-col gap-1 rounded-md border border-rule bg-paper-raised p-4 transition-colors has-[:checked]:border-teal has-[:checked]:bg-teal-soft has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-teal"
                    >
                      <span className="flex items-center gap-2 font-semibold">
                        <input type="radio" name="model" className="check" checked={draft.model === id} onChange={() => update({ model: id })} />
                        {businessModels[id].title}
                      </span>
                      <span className="text-sm text-muted">{businessModels[id].short}</span>
                    </label>
                  ))}
              </div>
            </fieldset>
            {error ? (
              <p className="notice notice-danger" role="alert">
                {error}
              </p>
            ) : null}
            <button type="button" className="btn btn-primary btn-lg" onClick={toProfile}>
              Дальше
            </button>
          </div>
        ) : null}

        {draft.stage === 2 ? (
          <div className="mt-6 space-y-8">
            <p className="prose-body">
              Это помогает подобрать риски и план проверки. Если чего-то не знаете — отметьте «Пока не знаю», мы так и запишем.
            </p>
            {!editProfile ? (
              <div className="panel p-5">
                <p className="font-semibold">Используем то, что вы уже указали раньше</p>
                <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                  {profileFieldIds.map((field) => (
                    <div key={field}>
                      <dt className="text-muted">{profileFieldLabels[field]}</dt>
                      <dd>
                        {field === "budget"
                          ? isFieldKnown(draft.profile, field)
                            ? formatBudget(draft.profile.budgetAmount, draft.profile.budgetCurrency)
                            : "Не знаю"
                          : isFieldKnown(draft.profile, field)
                            ? draft.profile[field]
                            : "Не знаю"}
                      </dd>
                    </div>
                  ))}
                </dl>
                <button type="button" className="btn btn-secondary btn-sm mt-4" onClick={() => setEditProfile(true)}>
                  Изменить
                </button>
              </div>
            ) : (
              <ProfileForm value={draft.profile} onChange={(profile) => update({ profile })} />
            )}
            <div className="flex flex-wrap gap-4">
              <button type="button" className="btn btn-primary btn-lg" onClick={toHypothesis}>
                Собрать карточку
              </button>
              <button type="button" className="btn btn-quiet" onClick={() => goTo(1)}>
                Назад
              </button>
            </div>
          </div>
        ) : null}

        {draft.stage === 3 && draft.hypothesis ? (
          <div className="mt-6 space-y-8">
            <p className="notice notice-amber">
              Это черновик на основе {niche ? "шаблона направления" : "типовых рисков выбранной модели"}. Всё здесь — предположения: спрос ещё не
              проверен. Отредактируйте под себя.
            </p>
            <HypothesisEditor value={draft.hypothesis} onChange={(hypothesis) => update({ hypothesis })} />
            <div className="panel space-y-4 p-6">
              {signedIn ? (
                <>
                  <h3 className="font-display text-xl font-medium">{resume ? "Перенести черновик в аккаунт?" : "Сохранить проект"}</h3>
                  <p className="prose-body">
                    Проект сохранится на сервере и будет доступен только вам. После сохранения вы проверите карточку и подтвердите её — тогда откроется первый
                    шаг проверки спроса.
                  </p>
                  {error ? (
                    <p className="notice notice-danger" role="alert">
                      {error}
                    </p>
                  ) : null}
                  <div className="flex flex-wrap gap-4">
                    <button type="button" className="btn btn-primary btn-lg" onClick={save} disabled={pending}>
                      {pending ? "Сохраняем…" : "Сохранить в аккаунт"}
                    </button>
                    <button type="button" className="btn btn-quiet" onClick={discard}>
                      Удалить черновик
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="font-display text-xl font-medium">Сохранить и продолжить</h3>
                  <p className="prose-body">
                    Войдите по email — без пароля, кодом из письма. Черновик останется в этом браузере, и после входа вы сами решите, переносить ли его в
                    аккаунт.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link href={`/login?next=${encodeURIComponent("/start/idea?resume=1")}`} className="btn btn-primary btn-lg">
                      Войти и сохранить
                    </Link>
                    <button type="button" className="btn btn-quiet" onClick={discard}>
                      Удалить черновик
                    </button>
                  </div>
                </>
              )}
            </div>
            <button type="button" className="btn btn-quiet" onClick={() => goTo(2)}>
              Назад
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
