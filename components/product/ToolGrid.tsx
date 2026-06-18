"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { toolCards } from "@/lib/business-reboot-content";

type ToolGridProps = {
  limit?: number;
};

export function ToolGrid({ limit }: ToolGridProps) {
  const tools = typeof limit === "number" ? toolCards.slice(0, limit) : toolCards;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {tools.map((tool, index) => (
        <ToolCard key={tool.id} tool={tool} index={index} />
      ))}
    </div>
  );
}

type ToolCardProps = {
  tool: (typeof toolCards)[number];
  index: number;
};

export function ToolCard({ tool, index }: ToolCardProps) {
  const [copied, setCopied] = useState(false);

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(tool.example);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article className="group flex h-full flex-col rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-cyan-300/25 hover:bg-white/[0.065]">
      <div className="mb-6 flex items-start justify-between gap-4">
        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
          {(index + 1).toString().padStart(2, "0")}
        </span>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">
          {tool.time}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-white">{tool.title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-400">{tool.description}</p>
      <div className="mt-5 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Результат</p>
        <p className="mt-2 text-sm text-slate-200">{tool.result}</p>
      </div>
      <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/45 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Prompt preview</p>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-300">{tool.example}</p>
      </div>
      <div className="mt-auto grid gap-2 pt-5">
        <Button type="button" className="w-full" onClick={copyPrompt}>
          {copied ? "Скопировано" : "Скопировать промпт"}
        </Button>
        <Button type="button" variant="outline" className="w-full">
          {tool.cta}
        </Button>
      </div>
    </article>
  );
}
