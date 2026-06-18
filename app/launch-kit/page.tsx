import type { Metadata } from "next";

import { LaunchKitClient } from "@/components/launch-kit/LaunchKitClient";

export const metadata: Metadata = {
  title: "Пакет первого запуска",
  description: "Result workspace для рабочих результатов миссий Бизнес Перезагрузка с AI.",
};

export default function LaunchKitPage() {
  return <LaunchKitClient />;
}
