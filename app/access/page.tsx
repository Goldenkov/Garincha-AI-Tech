import type { Metadata } from "next";
import { Suspense } from "react";

import { AccessForm } from "@/components/access/AccessForm";

export const metadata: Metadata = {
  title: "Вход в PRO",
  description: "Введите код доступа к PRO-зоне Бизнес Перезагрузка с AI.",
};

export default function AccessPage() {
  return (
    <Suspense fallback={<AccessFallback />}>
      <AccessForm />
    </Suspense>
  );
}

function AccessFallback() {
  return (
    <main className="gg-gutter grid min-h-[calc(100dvh-10rem)] place-items-center py-10">
      <section className="w-full max-w-xl rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-5 shadow-glow backdrop-blur-xl sm:rounded-[2rem] sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">Вход в PRO</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.045em] text-white">Загружаем форму доступа</h1>
      </section>
    </main>
  );
}
