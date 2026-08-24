import { Container } from "@/components/Container";
import { proIncluded, proNotIncluded } from "@/lib/business-reboot-content";

export function ProExpectations() {
  return (
    <section className="py-12 sm:py-16 lg:py-24" id="expectations">
      <Container>
        <div className="mb-10 max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">Честные ожидания</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Что вы получаете в PRO — и чего здесь нет
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-300">
            Мы хотим, чтобы покупка совпадала с ожиданиями. Поэтому говорим прямо: это рабочий
            инструмент, а не волшебная кнопка.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-[2rem] border border-emerald-300/20 bg-emerald-300/[0.05] p-6 sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200">Входит в PRO</p>
            <ul className="mt-5 grid gap-3">
              {proIncluded.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-slate-200">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-[2rem] border border-white/10 bg-[#0b1020] p-6 sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Не входит в PRO</p>
            <ul className="mt-5 grid gap-3">
              {proNotIncluded.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-slate-400">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-500" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-6 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] p-4 text-sm leading-6 text-cyan-50/90">
              Если после списка выше продукт вам не подходит — лучше не покупать. Так мы бережём
              и ваше время, и доверие к продукту.
            </p>
          </article>
        </div>
      </Container>
    </section>
  );
}
