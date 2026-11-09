import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/site/Container";

export const metadata: Metadata = {
  title: "Получено",
  robots: { index: false },
};

const variants = {
  lead: {
    title: "Заявка получена",
    text: "Мы ответим на указанный email: расскажем об условиях PRO и пришлём персональный код доступа после оплаты.",
  },
  partner: {
    title: "Партнёрская заявка получена",
    text: "Посмотрим аудиторию и формат и свяжемся по указанным контактам.",
  },
  feedback: {
    title: "Спасибо за отзыв",
    text: "Если вы просили что-то исправить или удалить данные — ответим отдельно.",
  },
} as const;

export default async function ThanksPage({ searchParams }: { searchParams: Promise<{ type?: string | string[] }> }) {
  const params = await searchParams;
  const raw = Array.isArray(params.type) ? params.type[0] : params.type;
  const variant = variants[(raw as keyof typeof variants) ?? "lead"] ?? variants.lead;
  return (
    <main>
      <Container className="py-20 sm:py-28">
        <p className="eyebrow">Готово</p>
        <h1 className="title mt-3">{variant.title}</h1>
        <p className="lede mt-5 max-w-[46ch]">{variant.text}</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/start" className="btn btn-primary">
            Собрать гипотезу
          </Link>
          <Link href="/" className="btn btn-secondary">
            На главную
          </Link>
        </div>
      </Container>
    </main>
  );
}
