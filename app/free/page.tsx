import type { Metadata } from "next";

import { Container } from "@/components/Container";
import { ButtonLink } from "@/components/ui/button";
import { freeLeadMagnet } from "@/lib/business-reboot-content";

export const metadata: Metadata = {
  title: "Бесплатный маршрут",
  description: "Бесплатный лид-магнит Бизнес Перезагрузка с AI.",
};

export default function FreePage() {
  return (
    <main className="py-12 sm:py-16">
      <Container className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">Free lead magnet</p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-white sm:text-6xl">
            Бесплатная версия для первого шага
          </h1>
          <p className="mt-5 text-base leading-8 text-slate-300">
            Соберите мини-черновик без оплаты: описание бизнеса, первый оффер и следующий шаг.
            Полный PRO-доступ можно подключить позже.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/#lead" size="lg">Оставить заявку</ButtonLink>
            <ButtonLink href="/pro" variant="secondary" size="lg">Сравнить с PRO</ButtonLink>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-glow backdrop-blur-xl sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">Что внутри free</p>
          <div className="mt-6 grid gap-3">
            {freeLeadMagnet.map((item, index) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                  {(index + 1).toString().padStart(2, "0")}
                </p>
                <p className="mt-2 font-medium text-white">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </main>
  );
}
