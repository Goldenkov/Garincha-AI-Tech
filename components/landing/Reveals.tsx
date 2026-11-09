"use client";

import { useEffect } from "react";

/**
 * One-shot reveals for below-the-fold landing sections. Content is visible in the server markup;
 * the hidden start state is applied by GSAP only after it loads, and never with reduced motion.
 */
export function Reveals() {
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
          const kind = element.dataset.reveal;
          const from =
            kind === "mask"
              ? { clipPath: "inset(0% 0% 100% 0%)", y: 14 }
              : kind === "scale"
                ? { autoAlpha: 0, scale: 0.96 }
                : { autoAlpha: 0, y: 16 };
          gsap.from(element, {
            ...from,
            duration: kind === "mask" ? 0.7 : 0.55,
            ease: "power3.out",
            clearProps: "clipPath,transform,opacity,visibility",
            scrollTrigger: { trigger: element, start: "top 88%", once: true },
          });
        });
      });
      cleanup = () => mm.revert();
    });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);
  return null;
}
