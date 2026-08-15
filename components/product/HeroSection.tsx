import { ButtonLink } from "@/components/ui/button";
import { HeroSpotlight } from "@/components/effects/HeroSpotlight";
import { businessRebootConfig, heroStats } from "@/lib/business-reboot-content";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
      <HeroSpotlight />
      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 xl:grid-cols-[1fr_0.95fr]">
        <div>
          <div className="mb-6 inline-flex rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100">
            Premium AI toolkit
          </div>
          <h1 className="max-w-5xl text-balance text-5xl font-black tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl">
            {businessRebootConfig.publicName}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Соберите основу продвижения за 1–2 вечера: оффер, контент, скрипты, квиз,
            структуру лендинга и первые действия для проверки спроса.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/quick-start" size="lg" className="w-full sm:w-auto">
              {businessRebootConfig.startCta}
            </ButtonLink>
            <ButtonLink href="/dashboard#routes" variant="secondary" size="lg" className="w-full sm:w-auto">
              Выбрать маршрут в PRO
            </ButtonLink>
          </div>
          <p className="mt-5 max-w-xl text-sm leading-6 text-slate-500">
            Без обещаний гарантированных продаж: комплект помогает быстрее подготовить первые рабочие
            черновики и понятный маршрут действий.
          </p>

          <div className="mt-10 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
            {heroStats.map((stat) => (
              <div key={stat.label} className="rounded-3xl border border-white/10 bg-white/[0.045] p-4">
                <p className="text-2xl font-semibold tracking-tight text-white">{stat.value}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <DashboardPreview />
      </div>
    </section>
  );
}

export function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="absolute -inset-8 rounded-[3rem] bg-[radial-gradient(circle,rgba(103,232,249,0.16)_0%,transparent_70%)]" />
      <div className="gg-animated-border relative rounded-[2rem] p-px shadow-[0_40px_120px_rgba(8,145,178,0.25)]">
        <span className="gg-animated-border-spin" aria-hidden="true" />
        <div className="relative overflow-hidden rounded-[calc(2rem-1px)] border border-white/12 bg-slate-950/90 p-4">
        <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/[0.04] px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Dashboard</p>
            <p className="mt-1 font-semibold text-white">Маршрут первого запуска</p>
          </div>
          <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-100">
            38%
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {["Бриф", "Оффер", "Контент", "Скрипт"].map((item, index) => (
            <div key={item} className="rounded-3xl border border-white/10 bg-white/[0.045] p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">{item}</span>
                <span className="text-xs text-cyan-200">0{index + 1}</span>
              </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-violet-400 to-pink-400"
                  style={{ width: `${35 + index * 14}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.07] p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">Next action</p>
          <p className="mt-2 text-sm leading-6 text-slate-200">
            Выберите маршрут и начните с брифа — это улучшает качество всех следующих AI-черновиков.
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
