import { ArrowRight, Sparkles } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/Animated";
import { siteConfig } from "@/lib/content";

export function Price() {
  return (
    <section id="price" className="py-16 sm:py-24">
      <Container>
        <FadeIn>
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.22),transparent_36%),radial-gradient(circle_at_88%_80%,rgba(168,85,247,0.16),transparent_34%)]" />
            <CardContent className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-100">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  Цена первого потока
                </div>
                <p className="text-6xl font-black tracking-tight text-white sm:text-7xl">{siteConfig.price}</p>
                <p className="mt-3 text-sm uppercase tracking-[0.32em] text-slate-400">запусковая стоимость</p>
              </div>

              <div className="flex flex-col justify-center">
                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Войдите в ранний список и получите условия запуска первыми.
                </h2>
                <p className="mt-4 text-base leading-8 text-slate-300">
                  Запусковая цена действует на этапе первого потока. После добавления новых нишевых
                  комплектов, видеоинструкций и PRO-блока стоимость будет повышена.
                </p>
                <div className="mt-7">
                  <ButtonLink href="#lead" className="w-full sm:w-auto">
                    Оставить заявку
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </ButtonLink>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </Container>
    </section>
  );
}
