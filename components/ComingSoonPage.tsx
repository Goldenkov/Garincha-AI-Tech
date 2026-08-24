import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/Container";
import { siteConfig } from "@/lib/content";

type ComingSoonPageProps = {
  variant: "main" | "partners";
};

export function ComingSoonPage({ variant }: ComingSoonPageProps) {
  const isPartners = variant === "partners";

  return (
    <main className="relative overflow-hidden">
      <section className="min-h-[calc(100vh-8rem)] py-24 sm:py-28">
        <Container className="grid min-h-[560px] place-items-center">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 inline-flex rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-100">
              {siteConfig.brand}
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-6xl">
              {isPartners ? "English partner page is coming soon" : "English version is coming soon"}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              We are preparing the English page for {siteConfig.product}. For now, you can explore the Russian
              landing page or leave a request through the main form.
            </p>
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/">Open Russian landing</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={isPartners ? "/partners" : "/#lead"}>Go to request form</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
