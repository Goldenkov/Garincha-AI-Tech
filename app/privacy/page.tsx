import { LegalPage } from "@/components/LegalPage";
import { privacySections } from "@/lib/content";

export const metadata = {
  title: "Политика конфиденциальности",
  description: "Шаблонная структура политики конфиденциальности для Бизнес Перезагрузка с AI.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Шаблон документа"
      title="Политика конфиденциальности"
      description="Эта страница содержит рабочую структуру документа для MVP и не является юридической консультацией. Перед публичным запуском текст нужно проверить с профильным специалистом."
      sections={privacySections}
    />
  );
}
