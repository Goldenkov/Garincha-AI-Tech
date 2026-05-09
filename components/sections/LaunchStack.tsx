import { FadeIn } from "@/components/Animated";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { launchStackItems } from "@/lib/content";

export function LaunchStack() {
  return (
    <section className="py-16 sm:py-24" aria-labelledby="launch-stack-heading">
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 shadow-glow backdrop-blur-2xl sm:p-8 lg:p-10">
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(34,211,238,0.08),transparent_36%),radial-gradient(circle_at_86%_16%,rgba(168,85,247,0.16),transparent_34%)]" />
          <div className="relative z-10">
            <SectionHeading
              id="launch-stack-heading"
              eyebrow="Первый поток"
              title="Что покупатель ждёт не как обучение, а как готовую рабочую основу"
              description="В MVP мы продаём не обещание результата, а структурированный набор материалов, который сокращает путь от “надо продвигаться” до “есть что тестировать”."
            />

            <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {launchStackItems.map((item, index) => (
                <FadeIn key={item.title} delay={index * 0.04}>
                  <div className="h-full rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-5 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/25 hover:bg-white/[0.065]">
                    <div className="mb-8 flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
                        {(index + 1).toString().padStart(2, "0")}
                      </span>
                      <span className="h-px w-10 bg-gradient-to-r from-cyan-200/60 to-transparent" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-400">{item.description}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
