"use client";

import { usePathname } from "next/navigation";
import { type ReactNode } from "react";

import { logoutProAccess } from "@/lib/access";

type RequireProAccessProps = {
  children: ReactNode;
  mode?: "journey" | "launch-kit" | "dashboard";
};

export function RequireProAccess({ children, mode = "journey" }: RequireProAccessProps) {
  return (
    <>
      <ProAccessActions mode={mode} />
      {children}
    </>
  );
}

function ProAccessActions({ mode }: { mode: "journey" | "launch-kit" | "dashboard" }) {
  const pathname = usePathname();

  async function logout() {
    await logoutProAccess();
    window.location.href = `/access?next=${encodeURIComponent(pathname || `/${mode}`)}`;
  }

  return (
    <div className="fixed right-4 top-20 z-50 hidden rounded-full border border-white/10 bg-[#050713] px-3 py-2 text-xs text-slate-400 lg:block">
      <span className="mr-3 text-emerald-200">PRO unlocked</span>
      <button type="button" onClick={logout} className="font-semibold transition hover:text-white">
        Выйти из PRO
      </button>
    </div>
  );
}
