import type { Metadata } from "next";

import { RequireProAccess } from "@/components/access/RequireProAccess";
import { LaunchKitClient } from "@/components/launch-kit/LaunchKitClient";

export const metadata: Metadata = {
  title: "Пакет первого запуска",
  description: "Result workspace для рабочих результатов миссий Бизнес Перезагрузка с AI.",
};

export default function LaunchKitPage() {
  return (
    <RequireProAccess mode="launch-kit">
      <LaunchKitClient />
    </RequireProAccess>
  );
}
