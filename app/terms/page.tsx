import type { Metadata } from "next";

import { LegalPage } from "@/components/site/LegalPage";
import { termsSections } from "@/lib/content";

export const metadata: Metadata = {
  title: "Условия использования",
  description: "Условия использования сервиса Бизнес Перезагрузка с AI.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Условия использования"
      lede="Что сервис делает и чего не обещает. Рабочая редакция до проверки юристом."
      sections={termsSections}
    />
  );
}
