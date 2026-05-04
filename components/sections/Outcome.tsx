import { CheckCircle2 } from "lucide-react";

import { FadeIn } from "@/components/Animated";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { outcomes } from "@/lib/content";

export function Outcome() {
  return (
    <section className="py-20 sm:py-24" aria-labelledby="outcome-heading">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <SectionHeading
            eyebrow="Результат"
            title="Что у вас будет после работы с комплектом"
            description="Материалы помогают собрать практическую основу продвижения: от смыслов и офферов до структуры заявки и контент-плана."
            id="outcome-heading"
            align="left"
          />
          <FadeIn>
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-glow backdrop-blur-xl sm:p-7">
              <ul className="grid gap-4">
                {outcomes.map((outcome) => (
                  <li key={outcome} className="flex gap-3 rounded-2xl bg-white/[0.04] p-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-200" aria-hidden="true" />
                    <span className="text-sm leading-6 text-slate-200 sm:text-base">{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        </div>
      </Container>
    </section>
  );
}
