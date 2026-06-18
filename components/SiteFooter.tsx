import Link from "next/link";

import { Container } from "@/components/Container";
import { businessRebootConfig } from "@/lib/business-reboot-content";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/tools", label: "Инструменты" },
  { href: "/feedback", label: "Feedback" },
  { href: "/privacy", label: "Политика конфиденциальности" },
  { href: "/terms", label: "Условия предзаказа" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/80 py-10">
      <Container className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-white">{businessRebootConfig.publicName}</p>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Premium MVP-интерфейс для AI-комплекта. Закрытые рабочие материалы и внутренние папки не публикуются на сайте.
          </p>
        </div>
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-3 text-sm text-slate-400">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>
      </Container>
    </footer>
  );
}
