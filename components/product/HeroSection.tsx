import { ButtonLink } from "@/components/ui/button";
import { HeroSpotlight } from "@/components/effects/HeroSpotlight";
import { businessRebootConfig, heroStats } from "@/lib/business-reboot-content";

export function HeroSection() {
  return (
    <section className="gg-gutter relative overflow-hidden py-12 sm:py-16 lg:py-24">
      <HeroSpotlight />
      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 xl:grid-cols-[1fr_0.95fr] xl:gap-12">
        <div className="min-w-0">
          <div className="mb-5 inline-flex max-w-full rounded-full border border-white/10 bg-[#0b1020] px-3 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-cyan-100 sm:mb-6 sm:px-4 sm:text-xs sm:tracking-[0.24em]">
            Premium AI toolkit
          </div>
          <h1 className="max-w-5xl text-balance text-5xl font-black tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl">
            {businessRebootConfig.publicName}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:mt-6 sm:text-lg sm:leading-8">
            Соберите основу продвижения за 1–2 вечера: оффер, контент, скрипты, квиз,
            структуру лендинга и первые действия для проверки спроса.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row">
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

          <div className="mt-8 grid max-w-3xl grid-cols-2 gap-2.5 sm:mt-10 sm:grid-cols-4 sm:gap-3">
            {heroStats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/10 bg-[#0b1020] p-3 sm:rounded-3xl sm:p-4">
                <p className="text-xl font-semibold tracking-tight text-white sm:text-2xl">{stat.value}</p>
                <p className="mt-1 text-[0.65rem] uppercase tracking-[0.14em] text-slate-500 sm:text-xs sm:tracking-[0.18em]">
                  {stat.label}
                </p>
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
      <div className="relative overflow-hidden rounded-[1.5rem] border border-white/12 bg-[#0b1020] p-3 sm:rounded-[2rem] sm:p-4">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#080d1a] px-3 py-3 sm:rounded-3xl sm:px-4">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Dashboard</p>
            <p className="mt-1 font-semibold text-white">Маршрут первого запуска</p>
          </div>
          <span className="shrink-0 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-100">
            38%
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {["Бриф", "Оффер", "Контент", "Скрипт"].map((item, index) => (
            <div key={item} className="rounded-3xl border border-white/10 bg-[#080d1a] p-4">
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
  );
}
