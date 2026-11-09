import type { ReactNode } from "react";

import { Container } from "@/components/site/Container";

export function PageIntro({ eyebrow, title, lede, children }: { eyebrow?: string; title: ReactNode; lede?: ReactNode; children?: ReactNode }) {
  return (
    <Container className="pb-10 pt-10 sm:pt-14">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h1 className="title mt-3 max-w-[22ch] !text-[clamp(2.1rem,1.3rem+3vw,3.4rem)]">{title}</h1>
      {lede ? <div className="lede mt-5 max-w-[52ch]">{lede}</div> : null}
      {children}
    </Container>
  );
}
