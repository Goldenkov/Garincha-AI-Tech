import { audienceItems } from "@/lib/content";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/Animated";
import { SectionHeading } from "@/components/SectionHeading";

export function Audience() {
  return (
    <section id="audience" className="py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Кому подойдёт"
          title="Для предпринимателей, которым нужна рабочая основа продвижения"
          description="Комплект рассчитан на практическое применение в небольших командах и у специалистов, которые продают свои услуги напрямую."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {audienceItems.map((item, index) => (
            <FadeIn key={item.title} delay={index * 0.04}>
              <Card className="h-full p-5">
                <item.icon className="mb-5 size-7 text-cyan-200" aria-hidden="true" />
                <h3 className="text-base font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{item.description}</p>
              </Card>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
