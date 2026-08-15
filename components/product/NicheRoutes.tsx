import { nicheRoutes } from "@/lib/business-reboot-content";

type NicheRoutesProps = {
  limit?: number;
};

export function NicheRoutes({ limit }: NicheRoutesProps) {
  const niches = typeof limit === "number" ? nicheRoutes.slice(0, limit) : nicheRoutes;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {niches.map((niche, index) => (
        <article
          key={niche.id}
          className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-5 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/25 hover:bg-white/[0.065]"
        >
          <div className="mb-5 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
              {(index + 1).toString().padStart(2, "0")}
            </span>
            <span className="h-px w-12 bg-gradient-to-r from-cyan-200/60 to-transparent" aria-hidden="true" />
          </div>
          <h3 className="text-xl font-semibold text-white">{niche.title}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-400">{niche.description}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {niche.recommendedTools.map((tool) => (
              <span
                key={tool}
                className="rounded-full border border-white/10 bg-slate-950/35 px-3 py-1 text-xs text-slate-300"
              >
                {tool}
              </span>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
