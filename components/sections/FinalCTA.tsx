import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/Container";
import { siteConfig } from "@/lib/content";

export function FinalCTA() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-cyan-300/[0.08] p-8 shadow-cyan-glow sm:p-12 lg:p-14">
          <div className="absolute inset-0 bg-radial-premium opacity-70" aria-hidden="true" />
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200">Ранний доступ</p>
              <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Соберите основу продвижения бизнеса с помощью ИИ за 1–2 вечера
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                Оставьте заявку на запусковую цену {siteConfig.price} и получите информацию о составе первого потока,
                когда комплект будет готов к выдаче.
              </p>
            </div>
            <ButtonLink href="/#lead" className="w-full gap-2 sm:w-auto">
              Оставить заявку
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
