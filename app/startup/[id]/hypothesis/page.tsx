import type { Metadata } from "next";
import Link from "next/link";

import { HypothesisWorkspace } from "@/components/app/HypothesisWorkspace";
import { StorageDown } from "@/components/app/StorageDown";
import { Container } from "@/components/site/Container";
import { loadProjectPage } from "@/lib/server/page-guards";

export const metadata: Metadata = { title: "Карточка гипотезы", robots: { index: false } };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> };

export default async function HypothesisPage({ params, searchParams }: Props) {
  const { id } = await params;
  const loaded = await loadProjectPage(id, `/startup/${id}/hypothesis`);
  if (!loaded.ok) return <StorageDown />;
  const { project } = loaded;
  const created = (await searchParams).created === "1";
  const startedSteps = project.progress.filter((row) => row.status !== "locked").length;

  return (
    <main>
      <Container className="pb-8 pt-8 sm:pt-12">
        <Link href={`/startup/${project.startup.id}`} className="link text-sm text-muted">
          ← {project.startup.title}
        </Link>
        <p className="eyebrow mt-5">Карточка гипотезы</p>
        <h1 className="title mt-2">Что именно мы проверяем</h1>
      </Container>
      <Container>
        <HypothesisWorkspace
          key={project.current?.id ?? "new"}
          startupId={project.startup.id}
          current={project.current}
          approved={project.approved}
          history={project.hypotheses}
          flaggableSteps={startedSteps}
          justCreated={created}
        />
      </Container>
    </main>
  );
}
