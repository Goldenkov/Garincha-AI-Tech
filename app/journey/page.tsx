import type { Metadata } from "next";

import { RequireProAccess } from "@/components/access/RequireProAccess";
import { JourneyExperience } from "@/components/journey/JourneyExperience";

export const metadata: Metadata = {
  title: "AI-карта запуска",
  description: "Геймифицированный маршрут по нишам для Бизнес Перезагрузка с AI.",
};

export default function JourneyPage() {
  return (
    <RequireProAccess mode="journey">
      <JourneyExperience />
    </RequireProAccess>
  );
}
