import type { Metadata } from "next";

import { LegalPage } from "@/components/LegalPage";
import { termsSections } from "@/lib/content";

export const metadata: Metadata = {
  title: "Условия предзаказа",
  description: "Шаблонная структура условий предзаказа Бизнес Перезагрузка с AI.",
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Пользовательское соглашение"
      title="Условия предзаказа"
      description="Эта страница содержит шаблонную структуру условий ранней заявки и предзаказа. Финальная редакция должна быть подготовлена с учётом юридической модели продукта."
      sections={termsSections}
    />
  );
}
