import { Container } from "@/components/Container";
import { FadeIn } from "@/components/Animated";

const bullets = [
  "Не длинная программа обучения и не марафон с домашними заданиями.",
  "Практические заготовки, которые можно открыть и сразу адаптировать под бизнес.",
  "Фокус на упаковке, контенте, офферах и сборе заявок без лишней терминологии.",
];

export function NotACourse() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <FadeIn>
          <div className="grid gap-8 rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-glow backdrop-blur-xl md:grid-cols-[0.8fr_1.2fr] md:p-10">
            <div className="flex items-start gap-4">
              <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl border border-violet-300/30 bg-violet-300/10 text-violet-100">
                <span className="h-5 w-5 rounded-full border border-violet-200/60" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">Важно</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                  Это не курс. Это рабочий комплект.
                </h2>
              </div>
            </div>

            <div className="space-y-4 text-slate-300">
              <p>
                Продукт задуман как практический набор документов, промптов и шаблонов, который помогает
                собрать базовую систему продвижения без агентства и сложной подготовки.
              </p>
              <ul className="space-y-3">
                {bullets.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-px w-5 shrink-0 bg-cyan-200" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
