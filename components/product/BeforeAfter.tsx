import { Container } from "@/components/Container";
import { beforeAfterItems } from "@/lib/business-reboot-content";

export function BeforeAfter() {
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <div className="mb-10 max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">До / После</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Из хаоса идей — в пакет первого запуска
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-300">
            Ценность продукта не в наборе текстов, а в переходе от разрозненных AI-черновиков
            к понятной системе действий.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {beforeAfterItems.map((item, index) => (
            <article key={item.before} className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-5">
              <div className="mb-5 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  {(index + 1).toString().padStart(2, "0")}
                </span>
                <span className="h-px w-16 bg-gradient-to-r from-cyan-200/60 to-transparent" aria-hidden="true" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-red-300/15 bg-red-300/[0.05] p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-red-200/80">До</p>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{item.before}</p>
                </div>
                <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.06] p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-emerald-200">После</p>
                  <p className="mt-3 text-sm leading-6 text-slate-200">{item.after}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
