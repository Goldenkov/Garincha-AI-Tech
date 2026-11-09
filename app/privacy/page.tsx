import type { Metadata } from "next";

import { LegalPage } from "@/components/site/LegalPage";
import { privacySections } from "@/lib/content";

export const metadata: Metadata = {
  title: "Политика конфиденциальности",
  description: "Какие данные обрабатывает сервис Бизнес Перезагрузка с AI, где они хранятся и как ими управлять.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Политика конфиденциальности"
      lede="Коротко и по делу: что мы храним, зачем и кто это видит. Рабочая редакция до проверки юристом."
      sections={privacySections}
    />
  );
}
