import Link from "next/link";

import { Container } from "@/components/Container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Заявка получена | Бизнес Перезагрузка с AI",
};

type ThanksPageProps = {
  searchParams: Promise<{ type?: string | string[] }>;
};

export default async function ThanksPage({ searchParams }: ThanksPageProps) {
  const params = await searchParams;
  const type = Array.isArray(params.type) ? params.type[0] : params.type;
  const isPartner = type === "partner";

  return (
    <main>
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 -z-10 bg-radial-premium opacity-80" />
        <Container className="mx-auto max-w-3xl text-center">
          <Card className="p-8 sm:p-12">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl border border-cyan-300/30 bg-cyan-300/10 text-cyan-200 shadow-cyan-glow">
              <span className="h-2.5 w-8 rounded-full bg-cyan-200 shadow-cyan-glow" aria-hidden="true" />
            </div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200">
              {isPartner ? "Заявка партнёра принята" : "Заявка принята"}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              {isPartner ? "Спасибо! Мы получили партнёрскую заявку." : "Спасибо! Мы зафиксировали ваш интерес."}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-300">
              {isPartner
                ? "Следующий шаг — мы посмотрим аудиторию и формат сотрудничества, затем свяжемся по указанным контактам."
                : "Следующий шаг — мы свяжемся с вами, отправим условия первого запуска и инструкцию, как получить код доступа к PRO-зоне после оплаты."}
            </p>
            <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
              {(isPartner ? partnerSteps : leadSteps).map((step, index) => (
                <div key={step.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                    {(index + 1).toString().padStart(2, "0")}
                  </p>
                  <p className="text-sm font-semibold text-white">{step.title}</p>
                  <p className="mt-1 text-sm text-slate-400">{step.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild>
                <Link href={isPartner ? "/" : "/demo"}>{isPartner ? "Посмотреть продукт" : "Посмотреть демо"}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/access">У меня уже есть код</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">Вернуться на главную</Link>
              </Button>
            </div>
          </Card>
        </Container>
      </section>
    </main>
  );
}

const leadSteps = [
  {
    title: "Проверим заявку",
    description: "Посмотрим нишу и главную цель, чтобы отправить релевантные условия доступа.",
  },
  {
    title: "Отправим оплату",
    description: "На первом запуске доступ выдаётся вручную: без сложной корзины и лишнего шума.",
  },
  {
    title: "Выдадим PRO-код",
    description: "После оплаты вы сможете открыть AI-карту, миссии и пакет первого запуска.",
  },
];

const partnerSteps = [
  {
    title: "Посмотрим аудиторию",
    description: "Проверим канал, размер аудитории и насколько формат подходит продукту.",
  },
  {
    title: "Уточним формат",
    description: "Свяжемся и согласуем, как лучше рассказать аудитории о комплекте.",
  },
  {
    title: "Отправим материалы",
    description: "После согласования передадим описание продукта и партнёрские формулировки.",
  },
];
