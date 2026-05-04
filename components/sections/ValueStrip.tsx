import { Container } from "@/components/Container";
import { valueStripItems } from "@/lib/content";

export function ValueStrip() {
  return (
    <section aria-label="Ключевые преимущества" className="relative -mt-6 pb-14 sm:pb-20">
      <Container>
        <div className="grid gap-3 rounded-[2rem] border border-white/10 bg-white/[0.045] p-3 shadow-glow backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-4">
          {valueStripItems.map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-3xl bg-slate-950/40 px-4 py-4">
              <span className="h-px w-7 shrink-0 bg-gradient-to-r from-cyan-200 to-transparent" aria-hidden="true" />
              <span className="text-sm font-medium text-slate-100">{item}</span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
