"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

const HINT_COOKIE = "br_signed_in=1";

function subscribe() {
  return () => {};
}

/**
 * Shows "Мои проекты" when a non-sensitive hint cookie says the visitor is signed in.
 * The hint only changes the label; every private page and API checks the real session.
 */
export function AccountLink() {
  const signedIn = useSyncExternalStore(
    subscribe,
    () => document.cookie.split("; ").includes(HINT_COOKIE),
    () => false,
  );
  return signedIn ? (
    <Link href="/projects" className="rounded px-1.5 py-2 font-medium text-ink hover:text-teal min-[400px]:px-2">
      <span className="max-[399.98px]:hidden">Мои проекты</span>
      <span className="min-[400px]:hidden">Проекты</span>
    </Link>
  ) : (
    <Link href="/login" className="rounded px-1.5 py-2 text-ink hover:text-teal min-[400px]:px-2">
      Войти
    </Link>
  );
}
