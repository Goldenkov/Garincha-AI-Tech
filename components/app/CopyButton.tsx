"use client";

import { useState } from "react";

export function CopyButton({ text, label = "Скопировать" }: { text: string; label?: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  return (
    <button
      type="button"
      className="btn btn-secondary btn-sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setState("copied");
        } catch {
          setState("failed");
        }
        window.setTimeout(() => setState("idle"), 2000);
      }}
    >
      <span aria-live="polite">{state === "copied" ? "Скопировано" : state === "failed" ? "Не удалось — выделите текст вручную" : label}</span>
    </button>
  );
}
