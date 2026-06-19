import type { Metadata } from "next";

import { LockedProScreen } from "@/components/access/LockedProScreen";

export const metadata: Metadata = {
  title: "Демо AI-карты запуска",
  description: "Публичный предпросмотр PRO AI-карты запуска.",
};

export default function DemoPage() {
  return <LockedProScreen mode="journey" />;
}
