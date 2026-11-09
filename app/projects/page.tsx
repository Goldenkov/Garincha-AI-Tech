import type { Metadata } from "next";
import Link from "next/link";

import { ExistingBusinessForm } from "@/components/app/ExistingBusinessForm";
import { StorageDown } from "@/components/app/StorageDown";
import { Container } from "@/components/site/Container";
import { EntryRows } from "@/components/start/EntryRows";
import { getNiche } from "@/lib/catalog";
import { businessModels } from "@/lib/domain/business-models";
import { requireViewer } from "@/lib/server/page-guards";
import { listStartups } from "@/lib/server/projects";
import { maskEmail } from "@/lib/server/session";
import { StorageUnavailableError } from "@/lib/server/supabase";

export const metadata: Metadata = { title: "Мои проекты", robots: { index: false } };

const dateFormat = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" });

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  const viewer = await requireViewer("/projects");
  const params = await searchParams;
  let projects;
  try {
    projects = await listStartups(viewer.accessToken);
  } catch (error) {
    if (error instanceof StorageUnavailableError) return <StorageDown />;
    throw error;
  }

  return (
    <main>
      <Container className="pb-6 pt-10 sm:pt-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Личный кабинет</p>
            <h1 className="title mt-3">Мои проекты</h1>
          </div>
          <Link href="/account" className="text-sm text-muted hover:text-teal">
            {maskEmail(viewer.user.email)} · Аккаунт и PRO
          </Link>
        </div>
      </Container>
      <Container>
        {projects.length ? (
          <ul className="divide-y divide-rule border-y border-rule">
            {projects.map((project) => (
              <li key={project.id}>
                <Link href={`/startup/${project.id}`} className="group grid gap-2 py-5 sm:grid-cols-[1fr_auto] sm:items-center">
                  <span>
                    <span className="block font-display text-xl font-medium group-hover:text-teal">{project.title}</span>
                    <span className="mt-1 block text-sm text-muted">
                      {[
                        project.entryMode === "existing_business" ? "Действующий бизнес" : null,
                        getNiche(project.nicheId)?.title,
                        project.businessModel ? businessModels[project.businessModel].title : null,
                      ]
                        .filter(Boolean)
                        .join(" · ") || "Модель не выбрана"}
                    </span>
                  </span>
                  <span className="text-sm text-muted">Обновлён {dateFormat.format(new Date(project.updatedAt))}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="max-w-[46rem]">
            <p className="lede">Пока ни одного проекта. Начните с идеи, каталога или подбора.</p>
          </div>
        )}

        <section aria-labelledby="new-title" className="mt-14">
          <h2 id="new-title" className="subtitle">
            Новый проект
          </h2>
          <EntryRows className="mt-4" />
          <div className="mt-8 max-w-[40rem]">
            <ExistingBusinessForm initiallyOpen={params.new === "existing"} />
          </div>
        </section>
      </Container>
    </main>
  );
}
