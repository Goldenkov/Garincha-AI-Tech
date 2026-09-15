import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";
import { niches, missions } from "@/lib/journey";

type LockedProScreenProps = {
  mode?: "journey" | "launch-kit" | "dashboard";
};

export function LockedProScreen({ mode = "journey" }: LockedProScreenProps) {
  const showDemo = mode === "journey";

  return (
    <main className="py-10 sm:py-14">
      <div className="gg-gutter mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="rounded-[1.5rem] border border-white/10 bg-[#0b1020] p-5 sm:rounded-[2rem] sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">PRO-зона</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-[-0.045em] text-white sm:text-6xl">
            Это PRO-зона. После оплаты вы получите код доступа.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">
            В открытом доступе можно посмотреть демо-структуру продукта. Полная AI-карта запуска,
            сохранение результатов и пакет первого запуска открываются по коду.
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            На первом запуске доступ выдаётся вручную после оплаты. Закрытые рабочие папки и editable-документы
            не публикуются на сайте.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/#lead" size="lg">Получить PRO-доступ</ButtonLink>
            <ButtonLink href={`/access?next=${mode === "launch-kit" ? "/launch-kit" : mode === "dashboard" ? "/dashboard" : "/journey"}`} variant="secondary" size="lg">
              У меня уже есть код
            </ButtonLink>
            <ButtonLink href={showDemo ? "#demo" : "/demo"} variant="outline" size="lg">
              Посмотреть демо
            </ButtonLink>
          </div>
        </section>

        {showDemo ? <JourneyDemoPreview /> : null}
      </div>
    </main>
  );
}

function JourneyDemoPreview() {
  return (
    <section id="demo" className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-[2rem] border border-white/10 bg-[#0b1020] p-5 sm:p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">Demo mode</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Ниши доступны для предпросмотра</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {niches.map((niche) => (
            <div key={niche.id} className="rounded-2xl border border-white/10 bg-[#080d1a] p-4">
              <p className="font-semibold text-white">{niche.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">{niche.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-[#0b1020] p-5 sm:p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">Mission preview</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Можно увидеть первую миссию</h2>
        <div className="mt-5 grid gap-3">
          {missions.slice(0, 4).map((mission, index) => (
            <div
              key={mission.id}
              className={`rounded-2xl border p-4 ${
                index === 0
                  ? "border-cyan-300/35 bg-cyan-300/[0.08]"
                  : "border-white/10 bg-[#080d1a] opacity-70"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <p className="font-semibold text-white">{mission.title}</p>
                <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  {index === 0 ? "preview" : "locked"}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {index === 0 ? mission.description : "Доступно в PRO"}
              </p>
            </div>
          ))}
        </div>
        <Link href="/access?next=/journey" className="mt-5 inline-flex text-sm font-semibold text-cyan-200 hover:text-white">
          Ввести код доступа →
        </Link>
      </div>
    </section>
  );
}
