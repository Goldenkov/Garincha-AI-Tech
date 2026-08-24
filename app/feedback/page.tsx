import type { Metadata } from "next";

import { Container } from "@/components/Container";
import { FeedbackBlock } from "@/components/product/FeedbackBlock";

export const metadata: Metadata = {
  title: "Обратная связь",
  description: "Форма обратной связи по Бизнес Перезагрузка с AI.",
};

export default function FeedbackPage() {
  return (
    <main className="py-12 sm:py-16">
      <Container>
        <FeedbackBlock />
      </Container>
    </main>
  );
}
