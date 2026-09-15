import Link from "next/link";
import type { ReactNode } from "react";

import { Container } from "@/components/Container";
import { Button } from "@/components/ui/button";

type LegalPageProps = {
  eyebrow?: string;
  title: string;
  intro?: string;
  description?: string;
  sections: Array<{
    title?: string;
    heading?: string;
    body: ReactNode;
  }>;
};

export function LegalPage({ eyebrow = "Документ MVP", title, intro, description, sections }: LegalPageProps) {
  const lead = intro ?? description;

  return (
    <main className="py-16 sm:py-24">
      <Container className="max-w-4xl">
        <div className="mb-10 rounded-[2rem] border border-white/10 bg-[#0b1020] p-6 sm:p-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.26em] text-cyan-200">{eyebrow}</p>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">{title}</h1>
          {lead ? <p className="mt-5 text-base leading-8 text-slate-300 sm:text-lg">{lead}</p> : null}
        </div>

        <div className="space-y-5">
          {sections.map((section) => {
            const heading = section.heading ?? section.title ?? "";

            return (
              <section key={heading} className="rounded-[1.5rem] border border-white/10 bg-[#080d1a] p-6">
                <h2 className="text-xl font-semibold text-white">{heading}</h2>
                <div className="mt-3 text-sm leading-7 text-slate-300">{section.body}</div>
              </section>
            );
          })}
        </div>

        <div className="mt-10">
          <Button asChild variant="outline">
            <Link href="/">Вернуться на главную</Link>
          </Button>
        </div>
      </Container>
    </main>
  );
}
