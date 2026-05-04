"use client";

import { motion } from "framer-motion";

import { productBoxTags, siteConfig } from "@/lib/content";

const floatingCards = [
  {
    label: productBoxTags[0],
    detail: "AI prompts",
    position: "left-0 top-9 rotate-[-8deg] sm:left-1",
    accent: "from-cyan-300 to-blue-400",
  },
  {
    label: productBoxTags[1],
    detail: "30 дней",
    position: "right-0 top-12 rotate-[7deg]",
    accent: "from-blue-300 to-violet-400",
  },
  {
    label: productBoxTags[2],
    detail: "offers",
    position: "left-1 top-[8.8rem] rotate-[5deg]",
    accent: "from-fuchsia-300 to-cyan-300",
  },
  {
    label: productBoxTags[3],
    detail: "sales flow",
    position: "right-2 top-[9.8rem] rotate-[-6deg]",
    accent: "from-cyan-200 to-emerald-300",
  },
  {
    label: productBoxTags[4],
    detail: "лиды",
    position: "left-4 bottom-24 rotate-[-4deg]",
    accent: "from-amber-200 to-cyan-300",
  },
  {
    label: productBoxTags[5],
    detail: "финансы",
    position: "right-5 bottom-20 rotate-[5deg]",
    accent: "from-sky-300 to-indigo-300",
  },
  {
    label: productBoxTags[6],
    detail: "структура",
    position: "left-1/2 top-1 -translate-x-1/2 rotate-[2deg]",
    accent: "from-violet-300 to-cyan-300",
  },
];

export function ProductBoxVisual() {
  return (
    <div
      className="relative mx-auto min-h-[360px] w-full max-w-[min(100%,34rem)] scale-[0.92] sm:min-h-[430px] sm:scale-95 xl:min-h-[470px] xl:scale-100"
      aria-label="Визуал цифрового комплекта"
    >
      <div className="absolute inset-6 rounded-[54px] bg-cyan-400/10 blur-3xl" aria-hidden="true" />
      <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/15 bg-cyan-300/5 blur-sm sm:h-96 sm:w-96" />
      <div className="absolute left-1/2 top-1/2 h-[21rem] w-[21rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 opacity-70 [mask-image:linear-gradient(to_bottom,transparent,black,transparent)] sm:h-[27rem] sm:w-[27rem]" />
      <div className="absolute left-1/2 top-1/2 h-56 w-[min(26rem,82vw)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/15 opacity-70 [transform:rotateX(66deg)]" />

      {floatingCards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, scale: 0.86, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.12 * index, duration: 0.45, ease: "easeOut" }}
          className={`absolute z-30 min-w-28 rounded-2xl border border-white/15 bg-slate-950/55 p-2.5 text-xs text-cyan-50 shadow-cyan-glow backdrop-blur-2xl sm:min-w-32 sm:p-3 ${card.position}`}
        >
          <div className="flex items-center gap-2">
            <span className={`h-8 w-1.5 rounded-full bg-gradient-to-b ${card.accent}`} aria-hidden="true" />
            <span>
              <span className="block font-semibold leading-none text-white">{card.label}</span>
              <span className="mt-1 block text-[0.65rem] uppercase tracking-[0.16em] text-slate-400">
                {card.detail}
              </span>
            </span>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
            <div className={`h-full rounded-full bg-gradient-to-r ${card.accent}`} style={{ width: `${58 + index * 5}%` }} />
          </div>
        </motion.div>
      ))}

      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ repeat: Infinity, duration: 5.4, ease: "easeInOut" }}
        className="absolute left-1/2 top-1/2 z-20 h-[255px] w-[210px] -translate-x-1/2 -translate-y-1/2 [perspective:1100px] sm:h-[310px] sm:w-[248px]"
      >
        <div className="absolute -inset-12 rounded-full bg-cyan-300/15 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-12 left-1/2 h-16 w-72 -translate-x-1/2 rounded-full bg-cyan-300/20 blur-2xl" />

        <div className="absolute inset-0 [transform:rotateY(-18deg)_rotateX(6deg)] [transform-style:preserve-3d]">
          <div className="absolute -left-5 top-5 h-full w-full rounded-[30px] border border-cyan-200/10 bg-cyan-950/20 blur-sm" />
          <div className="absolute inset-0 rounded-[30px] border border-cyan-200/45 bg-[linear-gradient(145deg,rgba(51,65,85,0.98),rgba(2,6,23,0.98)_45%,rgba(8,47,73,0.96))] shadow-[0_32px_90px_rgba(8,145,178,0.34)]" />
          <div className="absolute -right-10 top-8 h-[calc(100%-34px)] w-14 skew-y-[25deg] rounded-r-[24px] border border-cyan-200/25 bg-[linear-gradient(160deg,rgba(14,116,144,0.82),rgba(2,6,23,0.96))] shadow-[18px_26px_60px_rgba(0,0,0,0.45)] sm:-right-12 sm:w-16" />
          <div className="absolute -top-7 left-8 h-12 w-[calc(100%-18px)] skew-x-[-42deg] rounded-t-[22px] border border-cyan-200/25 bg-[linear-gradient(90deg,rgba(34,211,238,0.42),rgba(15,23,42,0.98))]" />
          <div className="absolute inset-0 rounded-[30px] bg-[radial-gradient(circle_at_28%_18%,rgba(125,211,252,0.38),transparent_24%),linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.12)_46%,transparent_54%)]" />
          <div className="absolute inset-[1px] rounded-[29px] border border-white/10" />
        </div>

        <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-7">
          <div>
            <div className="mb-5 inline-flex rounded-2xl border border-cyan-300/35 bg-cyan-300/10 p-3 text-cyan-200 shadow-cyan-glow">
              <span className="text-sm font-black tracking-[-0.04em] text-cyan-50 sm:text-base">AI</span>
            </div>
            <p className="text-[0.65rem] uppercase tracking-[0.34em] text-cyan-200/80 sm:text-xs">Digital Kit</p>
            <h3 className="mt-2 text-[1.7rem] font-black leading-[0.95] tracking-[-0.06em] text-white sm:text-3xl">
              {siteConfig.product}
            </h3>
          </div>

          <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.045] p-3 backdrop-blur">
            <div className="flex items-center justify-between gap-3 text-xs text-slate-300 sm:text-sm">
              <span>Prompts + templates</span>
              <span className="text-cyan-200">7 блоков</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-cyan-300 via-blue-400 to-fuchsia-400" />
            </div>
            <div className="text-xs text-slate-300 sm:text-sm">2026 AI workflow</div>
          </div>
        </div>

        <div className="absolute inset-x-8 top-24 h-px bg-gradient-to-r from-transparent via-cyan-200/70 to-transparent" />
        <div className="absolute bottom-7 left-7 right-7 h-1 rounded-full bg-gradient-to-r from-cyan-300 via-blue-400 to-fuchsia-400" />
      </motion.div>

      <div className="absolute bottom-4 left-1/2 h-12 w-72 -translate-x-1/2 rounded-full bg-cyan-300/20 blur-2xl" />
      <div className="sr-only">Placeholder can be replaced with a future SplineScene component.</div>
    </div>
  );
}
