import Link from "next/link";

import { siteMapGroups } from "@/lib/business-reboot-content";

type PageLinkGridProps = {
  groups?: typeof siteMapGroups;
  compact?: boolean;
};

export function PageLinkGrid({ groups = siteMapGroups, compact = false }: PageLinkGridProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {groups.map((group) => (
        <section
          key={group.title}
          className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-glow backdrop-blur-xl sm:p-6"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">{group.title}</p>
          {!compact ? <p className="mt-3 text-sm leading-6 text-slate-400">{group.description}</p> : null}
          <div className="mt-5 grid gap-3">
            {group.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group rounded-2xl border border-white/10 bg-slate-950/35 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
              >
                <span className="flex items-center justify-between gap-4">
                  <span className="font-medium text-white">{link.label}</span>
                  <span className="text-sm text-cyan-200 transition group-hover:translate-x-0.5" aria-hidden="true">
                    →
                  </span>
                </span>
                {!compact ? <span className="mt-2 block text-sm leading-6 text-slate-500">{link.description}</span> : null}
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
