import type { PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

type AnimatedProps = PropsWithChildren<{
  className?: string;
  delay?: number;
}>;

export function FadeIn({ children, className, delay = 0 }: AnimatedProps) {
  return (
    <div
      className={cn("gg-fade-in", className)}
      style={delay ? { animationDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}
