import Link from "next/link";

import { AccountLink } from "@/components/site/AccountLink";
import { Container } from "@/components/site/Container";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-paper/95 pt-[env(safe-area-inset-top)] backdrop-blur-[2px] supports-[backdrop-filter]:bg-paper/85">
      <Container className="flex h-[var(--header-h)] items-center justify-between gap-2 border-b border-rule max-[359.98px]:pl-[max(1rem,env(safe-area-inset-left))] max-[359.98px]:pr-[max(0.5rem,env(safe-area-inset-right))] min-[400px]:gap-4">
        <Link
          href="/"
          className="shrink-0 text-[0.74rem] font-semibold uppercase tracking-[0.1em] text-ink min-[360px]:text-[0.78rem] min-[360px]:tracking-[0.14em] min-[400px]:text-[0.82rem] min-[400px]:tracking-[0.2em] sm:text-[0.9rem]"
          aria-label="Garincha AI-Tech — на главную"
        >
          Garincha AI-Tech
        </Link>
        <nav aria-label="Основная навигация" className="flex items-center text-[0.88rem] min-[360px]:text-[0.92rem] min-[400px]:gap-1 sm:gap-5 sm:text-[0.95rem]">
          <Link href="/#how" className="hidden rounded px-2 py-2 text-ink hover:text-teal md:inline-block">
            Как это работает
          </Link>
          <Link href="/niches" className="rounded px-1.5 py-2 text-ink hover:text-teal min-[400px]:px-2">
            Каталог
          </Link>
          <AccountLink />
        </nav>
      </Container>
    </header>
  );
}
