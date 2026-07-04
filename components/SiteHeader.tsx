"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  businessRebootConfig,
  dashboardNav,
  primaryHeaderNav,
  secondaryHeaderNav,
} from "@/lib/business-reboot-content";
import { cn } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/Container";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/72 shadow-[0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-200/35 to-transparent" />
      <Container className="flex h-[4.25rem] items-center justify-between gap-4">
        <Link href="/" className="group inline-flex min-w-0 items-center gap-3" aria-label="Бизнес Перезагрузка с AI home">
          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/40 bg-cyan-300/10 shadow-glow transition duration-300 group-hover:-translate-y-0.5 group-hover:border-cyan-200/70">
            <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-300/20 via-transparent to-violet-400/20" />
            <span className="relative text-xs font-black tracking-tight text-cyan-100">AI</span>
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold tracking-[0.08em] text-white sm:text-base">
              {businessRebootConfig.publicName}
            </span>
            <span className="mt-0.5 hidden text-[0.65rem] uppercase tracking-[0.24em] text-slate-500 sm:block">
              premium business cockpit
            </span>
          </span>
        </Link>

        <nav
          className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.045] p-1 shadow-[0_18px_60px_rgba(2,6,23,0.28)] backdrop-blur-xl lg:flex"
          aria-label="Primary navigation"
        >
          {primaryHeaderNav.map((item) => (
            <HeaderNavLink key={item.href} item={item} active={isActivePath(pathname, item.href)} />
          ))}
          <div className="group relative">
            <button
              type="button"
              className="rounded-full px-3 py-2 text-sm font-medium text-slate-300 transition duration-200 hover:bg-white/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              Ещё
            </button>
            <div className="invisible absolute right-0 top-full z-50 mt-3 w-60 translate-y-2 rounded-3xl border border-white/10 bg-slate-950/95 p-2 opacity-0 shadow-[0_28px_90px_rgba(2,6,23,0.5)] backdrop-blur-2xl transition duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
              {secondaryHeaderNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block rounded-2xl px-4 py-3 text-sm transition hover:bg-white/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300",
                    isActivePath(pathname, item.href) ? "bg-cyan-300/[0.10] text-cyan-100" : "text-slate-300",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="/access"
            className="rounded-full border border-emerald-300/15 bg-emerald-300/[0.06] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100 transition hover:border-emerald-200/40 hover:bg-emerald-300/[0.10]"
          >
            PRO вход
          </Link>
          <ButtonLink href="/#lead" size="sm" className="px-4">
            {businessRebootConfig.primaryCta}
          </ButtonLink>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <Link href="/access" className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-semibold text-cyan-100">
            PRO
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="relative h-4 w-5" aria-hidden="true">
              <span
                className={cn(
                  "absolute left-0 top-1/2 h-px w-full bg-current transition",
                  open ? "rotate-45" : "-translate-y-1.5",
                )}
              />
              <span
                className={cn(
                  "absolute left-0 top-1/2 h-px w-full bg-current transition",
                  open ? "-rotate-45" : "translate-y-1.5",
                )}
              />
            </span>
          </button>
        </div>
      </Container>

      <div
        className={cn(
          "grid border-t border-white/10 bg-slate-950/95 shadow-[0_28px_90px_rgba(2,6,23,0.4)] transition-all duration-300 lg:hidden",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <Container className="py-4">
            <div className="mb-4 rounded-3xl border border-cyan-300/15 bg-cyan-300/[0.06] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">PRO cockpit</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                AI-карта, пакет запуска и рабочие миссии под нишу — после ввода кода доступа.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {dashboardNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-2xl border border-white/10 px-4 py-3 text-sm transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300",
                  isActivePath(pathname, item.href) ? "bg-cyan-300/[0.10] text-cyan-100" : "bg-white/[0.035] text-slate-200",
                )}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
              ))}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-[auto_1fr]">
              <ButtonLink href="/demo" variant="secondary" onClick={() => setOpen(false)}>
                Демо
              </ButtonLink>
              <ButtonLink href="/#lead" onClick={() => setOpen(false)}>
                {businessRebootConfig.primaryCta}
              </ButtonLink>
            </div>
          </Container>
        </div>
      </div>
    </header>
  );
}

function HeaderNavLink({
  item,
  active,
}: {
  item: { label: string; href: string };
  active: boolean;
}) {
  return (
    <Link
      href={item.href}
      className={cn(
        "rounded-full px-3 py-2 text-sm font-medium transition duration-200 hover:-translate-y-0.5 hover:bg-white/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300",
        active ? "bg-cyan-300/[0.12] text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.14)]" : "text-slate-300",
      )}
    >
      {item.label}
    </Link>
  );
}

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
