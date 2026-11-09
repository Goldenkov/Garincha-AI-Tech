import Link from "next/link";

import { Container } from "@/components/site/Container";

export function ComingSoonPage({ variant }: { variant: "main" | "partners" }) {
  const partners = variant === "partners";
  return (
    <main lang="en">
      <Container className="py-20 sm:py-28">
        <p className="eyebrow">Garincha AI-Tech</p>
        <h1 className="title mt-3">{partners ? "English partner page is coming soon" : "English version is coming soon"}</h1>
        <p className="lede mt-5 max-w-[46ch]">
          The product currently works in Russian. It helps you turn a small-business idea into a hypothesis and test demand before investing.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href={partners ? "/partners" : "/"} className="btn btn-primary" hrefLang="ru">
            {partners ? "Open the Russian partner page" : "Open the Russian version"}
          </Link>
        </div>
      </Container>
    </main>
  );
}
