import { FadeIn } from "@/components/Animated";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { processSteps } from "@/lib/content";

export function Process() {
  return (
    <section id="process" className="scroll-mt-24 py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Как работает"
          title="Из разрозненных задач — в понятную систему запуска"
          description="Комплект помогает пройти путь от хаотичных идей к собранной основе: офферу, контенту, заявке, странице и первому плану действий."
        />

        <div className="mt-12 grid gap-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-stretch">
          <FadeIn>
            <div className="relative h-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-glow backdrop-blur-xl sm:p-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_12%,rgba(34,211,238,0.18),transparent_34%),radial-gradient(circle_at_88%_82%,rgba(168,85,247,0.16),transparent_32%)]" />
              <div className="relative z-10">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200">
                  Garincha method
                </p>
                <h3 className="mt-5 max-w-lg text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Сначала смысл. Потом контент. Затем заявка.
                </h3>
                <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                  Такой порядок снижает хаос: вы не начинаете с постов ради постов, а собираете линию
                  продвижения вокруг предложения, аудитории и следующего действия клиента.
                </p>

                <div className="mt-8 grid grid-cols-3 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/45 text-center">
                  {["Оффер", "Контент", "Заявка"].map((item) => (
                    <div key={item} className="border-r border-white/10 px-3 py-4 last:border-r-0">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>

          <div className="grid gap-4">
            {processSteps.map((step, index) => (
              <FadeIn key={step.title} delay={index * 0.04}>
                <div className="group grid gap-4 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-white/[0.06] sm:grid-cols-[auto_1fr] sm:p-6">
                  <div className="flex h-12 w-16 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.08] text-sm font-semibold tracking-[0.22em] text-cyan-100">
                    {step.label}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{step.description}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
