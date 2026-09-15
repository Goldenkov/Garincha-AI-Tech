import { faqs } from "@/lib/content";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";

export function FAQ() {
  return (
    <section id="faq" className="py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="FAQ"
          title="Ответы на частые вопросы"
          description="Без обещаний быстрых продаж и без сложных условий: MVP собирает заявки раннего доступа и помогает понять интерес к продукту."
        />

        <div className="mx-auto mt-10 grid max-w-4xl gap-4">
          {faqs.map((item) => (
            <details
              key={item.question}
              className="group rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-glow transition open:border-cyan-300/30 open:bg-white/[0.07]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
                {item.question}
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-white/10 text-cyan-200 transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-4 text-sm leading-7 text-slate-300">{item.answer}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
