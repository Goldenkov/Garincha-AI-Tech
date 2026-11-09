import { Container } from "@/components/site/Container";
import { PageIntro } from "@/components/site/PageIntro";

export function LegalPage({ title, lede, sections }: { title: string; lede: string; sections: { title: string; body: string }[] }) {
  return (
    <main>
      <PageIntro eyebrow="Документ" title={title} lede={lede} />
      <Container>
        <div className="max-w-[44rem] divide-y divide-rule border-y border-rule">
          {sections.map((section) => (
            <section key={section.title} className="py-6">
              <h2 className="font-display text-xl font-medium">{section.title}</h2>
              <p className="prose-body mt-2">{section.body}</p>
            </section>
          ))}
        </div>
      </Container>
    </main>
  );
}
