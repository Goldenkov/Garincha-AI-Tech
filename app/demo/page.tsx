import type { Metadata } from "next";

import { DemoExperience } from "@/components/demo/DemoExperience";

export const metadata: Metadata = {
  title: "Демо AI-карты запуска",
  description: "Публичный предпросмотр PRO AI-карты запуска.",
};

export default function DemoPage() {
  return <DemoExperience />;
}
