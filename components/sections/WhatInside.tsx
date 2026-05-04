import { FadeIn } from "@/components/Animated";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { Card, CardContent } from "@/components/ui/card";
import { insideItems } from "@/lib/content";

export function WhatInside() {
  return (
    <section id="inside" className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Что внутри"
          title="Практический набор, который закрывает базовую упаковку и продвижение"
          description="Каждый блок можно применять отдельно или собрать в единую систему: от идеи оффера до структуры лендинга и обработки заявок."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {insideItems.map((item, index) => (
            <FadeIn key={item.title} delay={index * 0.04}>
              <Card className="group h-full overflow-hidden">
                <CardContent className="relative flex h-full flex-col gap-5 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-200/25 bg-cyan-300/10 text-xs font-semibold tracking-[0.22em] text-cyan-100">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div className="mt-4 h-px w-16 bg-gradient-to-r from-cyan-200/60 to-transparent transition group-hover:w-24" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-400">{item.description}</p>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
