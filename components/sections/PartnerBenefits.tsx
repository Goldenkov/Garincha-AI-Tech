import { partnerBenefits } from "@/lib/content";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/Animated";
import { SectionHeading } from "@/components/SectionHeading";

export function PartnerBenefits() {
  return (
    <section className="py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Партнёрская программа"
          title="Материалы и механика для быстрого запуска"
          description="Программа рассчитана на авторов каналов, владельцев сообществ, экспертов и медиа, у которых есть аудитория малого бизнеса."
        />

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {partnerBenefits.map((benefit, index) => (
            <FadeIn key={benefit.title} delay={index * 0.04}>
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-200">
                      {(index + 1).toString().padStart(2, "0")}
                    </span>
                    <span className="h-px w-16 bg-gradient-to-r from-cyan-200/50 to-transparent" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{benefit.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{benefit.description}</p>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
