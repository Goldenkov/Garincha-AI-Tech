import { Container } from "@/components/Container";
import { ButtonLink } from "@/components/ui/button";
import { proAccessSteps } from "@/lib/business-reboot-content";

type ProAccessStepsProps = {
  compact?: boolean;
};

export function ProAccessSteps({ compact = false }: ProAccessStepsProps) {
  return (
    <section className={compact ? "py-10" : "py-12 sm:py-16 lg:py-24"}>
      <Container>
        <div className="rounded-[1.5rem] border border-white/10 bg-[#0b1020] p-5 sm:rounded-[2rem] sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">Как получить PRO-доступ</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                От заявки до AI-карты — без сложной оплаты на первом запуске
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-400">
                Сейчас доступ выдаётся вручную после оплаты. Это помогает быстро запустить первый поток
                и лично проверить качество продукта.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row lg:flex-col">
                <ButtonLink href="/#lead" size="lg">Оставить заявку</ButtonLink>
                <ButtonLink href="/access" variant="secondary" size="lg">У меня уже есть код</ButtonLink>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {proAccessSteps.map((step, index) => (
                <article key={step.title} className="rounded-3xl border border-white/10 bg-[#080d1a] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                    {(index + 1).toString().padStart(2, "0")}
                  </p>
                  <h3 className="mt-4 text-lg font-semibold text-white">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
