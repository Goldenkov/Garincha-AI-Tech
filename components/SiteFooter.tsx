import Link from "next/link";

import { Container } from "@/components/Container";

const links = [
  { href: "/privacy", label: "Политика конфиденциальности" },
  { href: "/terms", label: "Условия предзаказа" },
  { href: "/partners", label: "Партнерам" },
  { href: "/en", label: "EN" }
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/80 py-10">
      <Container className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-white">Garincha AI-Tech</p>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            MVP-лендинг цифрового продукта. Материалы и юридические документы будут уточняться перед публичным запуском.
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
