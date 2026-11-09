import type { Metadata } from "next";

import { Advisor } from "@/components/flow/Advisor";
import { Container } from "@/components/site/Container";
import { PageIntro } from "@/components/site/PageIntro";
import { isAiAdvisorEnabled } from "@/lib/server/ai-advisor";
import { latestConfirmedProfile } from "@/lib/server/projects";
import { getViewer } from "@/lib/server/session";

export const metadata: Metadata = {
  title: "Помогите выбрать",
  description: "Короткий профиль — до трёх направлений с объяснением, рисками и первым тестом спроса.",
};

export default async function AdvisorPage() {
  const viewer = await getViewer();
  const knownProfile = viewer ? await latestConfirmedProfile(viewer.accessToken).catch(() => null) : null;
  return (
    <main>
      <PageIntro
        eyebrow="Помогите выбрать"
        title="До трёх направлений — с объяснением, а не наугад"
        lede="Подбор идёт только по каталогу и трём моделям: услуги, торговля, производство на заказ. Никаких процентов успеха — только причины, риски и первый тест."
      />
      <Container>
        <Advisor aiEnabled={isAiAdvisorEnabled()} signedIn={Boolean(viewer)} knownProfile={knownProfile} />
      </Container>
    </main>
  );
}
