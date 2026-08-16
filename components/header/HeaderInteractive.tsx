"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/Container";
import {
  businessRebootConfig,
  dashboardNav,
  primaryHeaderNav,
  secondaryHeaderNav,
} from "@/lib/business-reboot-content";
import { isActivePath } from "@/lib/nav";
import { cn } from "@/lib/utils";

type HeaderInteractiveProps = {
  brand: ReactNode;
  desktopCtas: ReactNode;
};

export function HeaderInteractive({ brand, desktopCtas }: HeaderInteractiveProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [menuPath, setMenuPath] = useState(pathname);

  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <Container className="flex h-[var(--gg-header-bar)] items-center justify-between gap-2 sm:gap-3">
        {brand}

        <nav
          className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.045] p-1 shadow-[0_18px_60px_rgba(2,6,23,0.28)] xl:flex"
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
            <div className="invisible absolute right-0 top-full z-50 mt-3 w-60 translate-y-2 rounded-3xl border border-white/10 bg-slate-950/95 p-2 opacity-0 shadow-[0_28px_90px_rgba(2,6,23,0.5)] transition duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
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

        {desktopCtas}

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 xl:hidden">
          <Link
            href="/demo"
            className="hidden min-h-10 items-center rounded-full px-3 py-2 text-xs font-semibold text-slate-400 transition hover:bg-white/[0.05] hover:text-white md:inline-flex"
          >
            Демо
          </Link>
          <Link href="/access" className="inline-flex min-h-10 items-center rounded-full border border-cyan-300/15 bg-cyan-300/[0.06] px-2.5 py-2 text-xs font-semibold text-cyan-100 sm:px-3">
            PRO
          </Link>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
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
          "grid border-t border-white/10 bg-slate-950/95 shadow-[0_28px_90px_rgba(2,6,23,0.4)] transition-all duration-300 xl:hidden",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <Container className="max-h-[min(70dvh,36rem)] overflow-y-auto overscroll-contain py-4">
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
    </>
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
