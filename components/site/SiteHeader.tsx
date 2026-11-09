import Link from "next/link";

import { AccountLink } from "@/components/site/AccountLink";
import { Container } from "@/components/site/Container";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-paper/95 pt-[env(safe-area-inset-top)] backdrop-blur-[2px] supports-[backdrop-filter]:bg-paper/85">
      <Container className="flex h-[var(--header-h)] items-center justify-between gap-4 border-b border-rule">
        <Link
          href="/"
          className="shrink-0 text-[0.82rem] font-semibold uppercase tracking-[0.2em] text-ink sm:text-[0.9rem]"
          aria-label="Garincha AI-Tech — на главную"
        >
          Garincha AI-Tech
        </Link>
        <nav aria-label="Основная навигация" className="flex items-center gap-1 text-[0.95rem] sm:gap-5">
          <Link href="/#how" className="hidden rounded px-2 py-2 text-ink hover:text-teal md:inline-block">
            Как это работает
          </Link>
          <Link href="/niches" className="rounded px-2 py-2 text-ink hover:text-teal">
            Каталог
          </Link>
          <AccountLink />
        </nav>
      </Container>
    </header>
  );
}
