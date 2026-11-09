import type { Metadata } from "next";

import { IdeaWizard } from "@/components/flow/IdeaWizard";
import { Container } from "@/components/site/Container";
import { getNiche } from "@/lib/catalog";
import { isBusinessModelId } from "@/lib/domain/business-models";
import { latestConfirmedProfile } from "@/lib/server/projects";
import { getViewer } from "@/lib/server/session";

export const metadata: Metadata = {
  title: "Карточка гипотезы",
  description: "Опишите идею своими словами — соберём карточку гипотезы и план первой проверки спроса.",
};

type Props = { searchParams: Promise<{ niche?: string; model?: string; from?: string; resume?: string }> };

export default async function IdeaPage({ searchParams }: Props) {
  const params = await searchParams;
  const niche = getNiche(params.niche ?? null);
  const model = isBusinessModelId(params.model) && (!niche || niche.models.includes(params.model)) ? params.model : (niche?.models[0] ?? null);
  const viewer = await getViewer();
  const knownProfile = viewer ? await latestConfirmedProfile(viewer.accessToken).catch(() => null) : null;

  return (
    <main>
      <Container className="pb-4 pt-10 sm:pt-14">
        <p className="eyebrow">{niche ? "Из каталога" : params.from === "advisor" ? "По подбору" : "Своя идея"}</p>
        <h1 className="sr-only">Карточка гипотезы</h1>
      </Container>
      <Container className="pt-4">
        <IdeaWizard
          initialNiche={niche?.id ?? null}
          initialModel={model}
          initialMode={params.from === "advisor" && niche ? "advisor" : niche ? "catalog" : "own_idea"}
          signedIn={Boolean(viewer)}
          knownProfile={knownProfile}
          resume={params.resume === "1"}
        />
      </Container>
    </main>
  );
}
