"use client";

import { motion } from "framer-motion";
import { Bot, Layers3, Sparkles } from "lucide-react";

import { productBoxTags, siteConfig } from "@/lib/content";

const cardPositions = [
  "left-2 top-6 rotate-[-8deg]",
  "right-0 top-10 rotate-[7deg]",
  "left-0 top-32 rotate-[5deg]",
  "right-3 top-36 rotate-[-6deg]",
  "left-6 bottom-16 rotate-[-4deg]",
  "right-8 bottom-12 rotate-[5deg]",
  "left-1/2 top-2 -translate-x-1/2 rotate-[2deg]",
];

export function ProductBoxVisual() {
  return (
    <div className="relative mx-auto min-h-[420px] w-full max-w-[520px]" aria-label="Визуал цифрового комплекта">
      <div className="absolute inset-0 rounded-[48px] bg-cyan-400/10 blur-3xl" aria-hidden="true" />
      <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/20 bg-cyan-300/5 blur-sm" />

      {productBoxTags.map((tag, index) => (
        <motion.div
          key={tag}
          initial={{ opacity: 0, scale: 0.85, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.12 * index, duration: 0.45, ease: "easeOut" }}
          className={`absolute z-20 rounded-2xl border border-white/15 bg-white/[0.08] px-3 py-2 text-xs font-semibold text-cyan-50 shadow-cyan-glow backdrop-blur-xl ${cardPositions[index]}`}
        >
          {tag}
        </motion.div>
      ))}

      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ repeat: Infinity, duration: 5.4, ease: "easeInOut" }}
        className="absolute left-1/2 top-1/2 z-10 h-[270px] w-[220px] -translate-x-1/2 -translate-y-1/2"
      >
        <div className="absolute inset-0 skew-y-[-8deg] rounded-[28px] border border-cyan-200/40 bg-gradient-to-br from-slate-800 via-slate-950 to-cyan-950 shadow-[0_0_70px_rgba(34,211,238,0.32)]" />
        <div className="absolute -right-9 top-8 h-[238px] w-16 skew-y-[28deg] rounded-r-[24px] border border-cyan-200/25 bg-gradient-to-b from-cyan-900/70 to-slate-950" />
        <div className="absolute -top-6 left-8 h-12 w-[190px] skew-x-[-42deg] rounded-t-[22px] border border-cyan-200/25 bg-gradient-to-r from-cyan-700/50 to-slate-900" />

        <div className="absolute inset-0 flex flex-col justify-between p-7">
          <div>
            <div className="mb-5 inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 p-3 text-cyan-200">
              <Bot className="h-7 w-7" aria-hidden="true" />
            </div>
            <p className="text-xs uppercase tracking-[0.34em] text-cyan-200/80">Digital Kit</p>
            <h3 className="mt-2 text-2xl font-black leading-tight text-white">{siteConfig.product}</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Layers3 className="h-4 w-4 text-cyan-200" aria-hidden="true" />
              Prompts + templates
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Sparkles className="h-4 w-4 text-fuchsia-200" aria-hidden="true" />
              2026 AI workflow
            </div>
          </div>
        </div>

        <div className="absolute inset-x-8 top-24 h-px bg-gradient-to-r from-transparent via-cyan-200/70 to-transparent" />
        <div className="absolute bottom-8 left-7 right-7 h-1.5 rounded-full bg-gradient-to-r from-cyan-300 via-blue-400 to-fuchsia-400" />
      </motion.div>

      <div className="absolute bottom-6 left-1/2 h-12 w-64 -translate-x-1/2 rounded-full bg-cyan-300/20 blur-2xl" />
      <div className="sr-only">Placeholder can be replaced with a future SplineScene component.</div>
    </div>
  );
}
