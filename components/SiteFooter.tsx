import Link from "next/link";

import { Container } from "@/components/Container";
import { businessRebootConfig, siteMapGroups } from "@/lib/business-reboot-content";
import { heavyPrefetchRoutes } from "@/lib/nav";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/80 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-10">
      <Container className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="max-w-xl">
          <p className="text-sm font-semibold text-white">{businessRebootConfig.publicName}</p>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Premium MVP-интерфейс для AI-комплекта. Закрытые рабочие материалы и внутренние папки не публикуются на сайте.
          </p>
          <Link href="/site-map" className="mt-4 inline-flex text-sm font-medium text-cyan-200 transition hover:text-white">
            Открыть карту сайта →
          </Link>
        </div>

        <nav aria-label="Footer navigation" className="grid gap-6 sm:grid-cols-3">
          {siteMapGroups.map((group) => (
            <div key={group.title}>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{group.title}</p>
              <div className="mt-3 grid gap-2">
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    prefetch={heavyPrefetchRoutes.has(link.href) ? false : undefined}
                    className="text-sm text-slate-400 transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </Container>
    </footer>
  );
}
