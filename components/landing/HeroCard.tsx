import { exampleHypothesis } from "@/lib/example";

/** Static "paper" card from the approved reference. Content is the labelled demo example. */
export function HeroCard() {
  const rows = [
    { label: "Для кого", text: exampleHypothesis.targetCustomer },
    { label: "Какую задачу решаем", text: exampleHypothesis.customerProblem },
    { label: "Что проверяем первым", text: exampleHypothesis.firstCheck },
  ];
  return (
    <figure
      className="paper relative mx-auto w-full max-w-[27rem] rotate-[1.6deg] rounded-[3px] px-6 pb-6 pt-7 sm:px-8 sm:pt-8 lg:mx-0 lg:ml-auto"
      aria-label="Пример карточки гипотезы"
    >
      <figcaption>
        <p className="font-display text-[1.35rem] font-medium leading-tight">Карточка гипотезы</p>
        <p className="mt-1 text-sm text-muted">Демонстрационный пример</p>
      </figcaption>
      <hr className="rule mt-4 border-t" />
      <p className="mt-4 font-display text-[clamp(1.7rem,1.2rem+1.6vw,2.2rem)] font-medium leading-tight tracking-[-0.01em]">
        {exampleHypothesis.title}
      </p>
      <dl className="mt-4 divide-y divide-rule border-y border-rule">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[7.5rem_1fr] gap-4 py-3.5 text-[0.92rem] leading-snug max-[380px]:grid-cols-1 max-[380px]:gap-1">
            <dt className="font-display font-medium">{row.label}</dt>
            <dd className="text-ink-soft">{row.text}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="inline-flex items-center gap-2 text-sm text-muted">
          <span aria-hidden="true" className="inline-block size-3 rounded-full border border-muted" />
          Спрос ещё не проверен
        </p>
        <p className="rounded-[3px] bg-teal px-4 py-2 text-sm font-semibold text-white">Первый тест: {exampleHypothesis.testLabel}</p>
      </div>
    </figure>
  );
}
