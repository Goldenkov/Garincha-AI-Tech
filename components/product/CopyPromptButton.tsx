"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

type CopyPromptButtonProps = {
  text: string;
};

export function CopyPromptButton({ text }: CopyPromptButtonProps) {
  const [copied, setCopied] = useState(false);

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Button type="button" className="w-full" onClick={copyPrompt}>
      {copied ? "Скопировано" : "Скопировать промпт"}
    </Button>
  );
}
