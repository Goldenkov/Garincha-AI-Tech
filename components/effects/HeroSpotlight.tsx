"use client";

import { motion, useReducedMotion } from "framer-motion";

export function HeroSpotlight() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <motion.div
        className="absolute -left-32 top-0 h-[32rem] w-[32rem] rounded-full bg-cyan-300/[0.09] blur-[110px]"
        animate={
          reduceMotion
            ? undefined
            : {
                x: [0, 48, 12, 0],
                y: [0, 26, 54, 0],
                scale: [1, 1.08, 0.96, 1],
              }
        }
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-28 top-8 h-[28rem] w-[28rem] rounded-full bg-violet-500/[0.10] blur-[115px]"
        animate={
          reduceMotion
            ? undefined
            : {
                x: [0, -36, -12, 0],
                y: [0, 42, 18, 0],
                scale: [1, 0.94, 1.06, 1],
              }
        }
        transition={{ duration: 19, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
