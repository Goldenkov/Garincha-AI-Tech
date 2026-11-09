"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import { ProfileForm } from "@/components/flow/ProfileForm";
import { apiRequest } from "@/lib/client/api";
import { rankNiches, type AdvisorResult } from "@/lib/domain/advisor";
import { emptyProfile, type StartupProfile } from "@/lib/domain/profile";

const certaintyLabels = {
  low: "Данных мало — подбор приблизительный",
  medium: "Данных достаточно для первого выбора",
  high: "Профиль заполнен подробно",
} as const;

type Props = { aiEnabled: boolean; signedIn: boolean; knownProfile: StartupProfile | null };

/**
 * Up to three explained options. Rules run locally on an explicit click; AI is a separate,
 * optional button, and any AI failure falls back to the rules without blocking the user.
 */
export function Advisor({ aiEnabled, signedIn, knownProfile }: Props) {
  const [profile, setProfile] = useState<StartupProfile>(knownProfile ?? emptyProfile());
  const [result, setResult] = useState<AdvisorResult | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLHeadingElement>(null);

  const show = (next: AdvisorResult) => {
    setResult(next);
    requestAnimationFrame(() => resultsRef.current?.focus());
  };

  const runAi = async () => {
    setPending(true);
    setError(null);
    const response = await apiRequest<{ result: AdvisorResult }>("/api/advisor", { body: { profile } });
    setPending(false);
    if (response.ok) show(response.result);
    else {
      setError(`${response.message} Показаны варианты по правилам каталога.`);
      show(rankNiches(profile));
    }
  };

  return (
    <div className="space-y-12">
      <section aria-labelledby="advisor-profile" className="max-w-[46rem]">
        <h2 id="advisor-profile" className="subtitle">
          Коротко о вас
        </h2>
        <p className="prose-body mt-2">Все поля необязательные. Чем больше известно, тем точнее подбор — неизвестное мы так и отметим.</p>
        <div className="mt-6">
          <ProfileForm value={profile} onChange={setProfile} />
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button type="button" className="btn btn-primary btn-lg" onClick={() => show(rankNiches(profile))}>
            Подобрать варианты
          </button>
          {aiEnabled ? (
            signedIn ? (
              <button type="button" className="btn btn-secondary btn-lg" onClick={runAi} disabled={pending}>
                {pending ? "AI думает…" : "Спросить AI"}
              </button>
            ) : (
              <Link href="/login?next=%2Fstart%2Fadvisor" className="link">
                Войдите, чтобы спросить AI
              </Link>
            )
          ) : null}
        </div>
        {error ? (
          <p className="notice notice-amber mt-4" role="status">
            {error}
          </p>
        ) : null}
      </section>

      {result ? (
        <section aria-labelledby="advisor-results" className="appear">
          <h2 id="advisor-results" ref={resultsRef} tabIndex={-1} className="subtitle outline-none">
            {result.options.length === 1 ? "Один вариант" : `${result.options.length} варианта`} для старта
          </h2>
          <p className="mt-2 text-sm text-muted">
            {result.source === "ai" ? "Предложено AI и проверено по каталогу." : "Подобрано по правилам каталога."} {certaintyLabels[result.certainty]}.
          </p>
          {result.notice ? <p className="notice notice-amber mt-4">{result.notice}</p> : null}
          <ol className="mt-6 grid gap-6 lg:grid-cols-3">
            {result.options.map((option, index) => (
              <li key={`${option.nicheId}-${option.businessModel}`} data-advisor-option className="panel flex flex-col p-6">
                <p className="text-sm text-muted">Вариант {index + 1}</p>
                <h3 className="mt-1 font-display text-xl font-medium">{option.title}</h3>
                <p className="mt-4 text-sm font-semibold">Почему подходит</p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-[0.95rem] text-ink-soft">
                  {option.why.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="mt-4 text-sm font-semibold">На что обратить внимание</p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-[0.95rem] text-ink-soft">
                  {option.watchOut.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                {option.unknowns.length ? (
                  <>
                    <p className="mt-4 text-sm font-semibold">Не учтено</p>
                    <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted">
                      {option.unknowns.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </>
                ) : null}
                <p className="mt-4 text-sm">
                  <span className="font-semibold">Первый тест: </span>
                  {option.firstCheck}
                </p>
                <div className="mt-auto flex flex-wrap gap-3 pt-6">
                  <Link href={`/start/idea?niche=${option.nicheId}&model=${option.businessModel}&from=advisor`} className="btn btn-primary btn-sm">
                    Выбрать
                  </Link>
                  <Link href={`/niches/${option.nicheId}?model=${option.businessModel}`} className="btn btn-quiet btn-sm">
                    Подробнее
                  </Link>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </div>
  );
}
