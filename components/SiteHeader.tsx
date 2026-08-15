import Link from "next/link";

import { HeaderInteractive } from "@/components/header/HeaderInteractive";
import { businessRebootConfig } from "@/lib/business-reboot-content";

export function SiteHeader() {
  return (
    <header className="gg-header sticky top-0 z-50">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-200/35 to-transparent" />
      <HeaderInteractive brand={<BrandLockup />} desktopCtas={<DesktopCtas />} />
    </header>
  );
}

function BrandLockup() {
  return (
    <Link href="/" className="group inline-flex min-w-0 shrink-0 items-center gap-3" aria-label="Бизнес Перезагрузка с AI home">
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/40 bg-cyan-300/10 shadow-glow transition duration-300 group-hover:-translate-y-0.5 group-hover:border-cyan-200/70">
        <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-300/20 via-transparent to-violet-400/20" />
        <span className="relative text-xs font-black tracking-tight text-cyan-100">AI</span>
      </span>
      <span className="min-w-0 whitespace-nowrap">
        <span className="hidden text-sm font-semibold tracking-[0.06em] text-white sm:block sm:text-base">
          {businessRebootConfig.publicName}
        </span>
        <span className="block text-sm font-semibold tracking-[0.04em] text-white sm:hidden">
          Перезагрузка AI
        </span>
        <span className="mt-0.5 hidden text-[0.62rem] uppercase tracking-[0.22em] text-slate-500 md:block">
          premium business cockpit
        </span>
      </span>
    </Link>
  );
}

function DesktopCtas() {
  return (
    <div className="hidden items-center gap-2 xl:flex">
      <Link
        href="/demo"
        className="rounded-full px-3 py-2 text-xs font-semibold text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
      >
        Демо
      </Link>
      <Link
        href="/access"
        className="rounded-full border border-emerald-300/15 bg-emerald-300/[0.06] px-3 py-2 text-xs font-semibold text-emerald-100 transition hover:border-emerald-200/40 hover:bg-emerald-300/[0.10]"
      >
        PRO вход
      </Link>
      <Link
        href="/#lead"
        className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-full border border-cyan-200/40 bg-gradient-to-r from-cyan-300 to-blue-400 px-4 text-xs font-bold text-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.3)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_42px_rgba(34,211,238,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
      >
        Получить PRO
      </Link>
    </div>
  );
}
