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
    <Link href="/projects" className="rounded px-2 py-2 font-medium text-ink hover:text-teal">
      Мои проекты
    </Link>
  ) : (
    <Link href="/login" className="rounded px-2 py-2 text-ink hover:text-teal">
      Войти
    </Link>
  );
}
