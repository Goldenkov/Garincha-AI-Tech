"use client";

import { useSyncExternalStore, type ReactNode } from "react";

import { LockedProScreen } from "@/components/access/LockedProScreen";
import { clearProAccess, hasProAccess, subscribeToProAccess } from "@/lib/access";

type RequireProAccessProps = {
  children: ReactNode;
  mode?: "journey" | "launch-kit" | "dashboard";
};

export function RequireProAccess({ children, mode = "journey" }: RequireProAccessProps) {
  const unlocked = useSyncExternalStore(subscribeToProAccess, hasProAccess, () => false);

  if (!unlocked) {
    return <LockedProScreen mode={mode} />;
  }

  return (
    <>
      <ProAccessActions />
      {children}
    </>
  );
}

function ProAccessActions() {
  function logout() {
    clearProAccess();
  }

  return (
    <div className="fixed right-4 top-20 z-50 hidden rounded-full border border-white/10 bg-slate-950/80 px-3 py-2 text-xs text-slate-400 shadow-glow backdrop-blur-xl lg:block">
      <span className="mr-3 text-emerald-200">PRO unlocked</span>
      <button type="button" onClick={logout} className="font-semibold transition hover:text-white">
        Выйти из PRO
      </button>
    </div>
  );
}
