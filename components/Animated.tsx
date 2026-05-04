"use client";

import { motion } from "framer-motion";
import type { PropsWithChildren } from "react";

type AnimatedProps = PropsWithChildren<{
  className?: string;
  delay?: number;
}>;

export function FadeIn({ children, className, delay = 0 }: AnimatedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
