import Link from "next/link";

import { siteMapGroups } from "@/lib/business-reboot-content";
import { heavyPrefetchRoutes } from "@/lib/nav";

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
          className="rounded-[2rem] border border-white/10 bg-[#0b1020] p-5 sm:p-6"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">{group.title}</p>
          {!compact ? <p className="mt-3 text-sm leading-6 text-slate-400">{group.description}</p> : null}
          <div className="mt-5 grid gap-3">
            {group.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                prefetch={heavyPrefetchRoutes.has(link.href) ? false : undefined}
                className="group rounded-2xl border border-white/10 bg-[#080d1a] p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
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
