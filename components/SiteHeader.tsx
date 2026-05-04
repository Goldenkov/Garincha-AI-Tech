"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { navItems } from "@/lib/content";
import { cn } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/Container";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 shadow-[0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-2xl">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href="/" className="group inline-flex items-center gap-3" aria-label="Garincha AI-Tech home">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-cyan-300/40 bg-cyan-300/10 shadow-glow">
            <Image src="/garincha-mark.svg" alt="" width={26} height={26} priority />
          </span>
          <span className="text-sm font-semibold tracking-[0.24em] text-white sm:text-base">Garincha AI-Tech</span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-1 py-2 text-sm text-slate-300 transition duration-200 hover:-translate-y-0.5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/en" className="text-sm text-slate-400 transition duration-200 hover:-translate-y-0.5 hover:text-white">
            EN
          </Link>
          <ButtonLink href="/#lead" className="min-h-10 px-4 py-2">
            Оставить заявку
          </ButtonLink>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 lg:hidden"
          aria-label={open ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </Container>

      <div
        className={cn(
          "grid border-t border-white/10 bg-slate-950/95 transition-all duration-300 lg:hidden",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <Container className="flex flex-col gap-3 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="grid grid-cols-[auto_1fr] gap-3 pt-2">
              <ButtonLink href="/en" variant="secondary" onClick={() => setOpen(false)}>
                EN
              </ButtonLink>
              <ButtonLink href="/#lead" onClick={() => setOpen(false)}>
                Оставить заявку
              </ButtonLink>
            </div>
          </Container>
        </div>
      </div>
    </header>
  );
}
