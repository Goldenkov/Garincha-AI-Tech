import { CheckCircle2 } from "lucide-react";

import { Container } from "@/components/Container";
import { valueStripItems } from "@/lib/content";

export function ValueStrip() {
  return (
    <section aria-label="Ключевые преимущества" className="relative -mt-6 pb-14 sm:pb-20">
      <Container>
        <div className="grid gap-3 rounded-[2rem] border border-white/10 bg-white/[0.045] p-3 shadow-glow backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-4">
          {valueStripItems.map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-3xl bg-slate-950/40 px-4 py-4">
              <CheckCircle2 className="size-5 shrink-0 text-cyan-200" aria-hidden="true" />
              <span className="text-sm font-medium text-slate-100">{item}</span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
