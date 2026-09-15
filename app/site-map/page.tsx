import type { Metadata } from "next";

import { Container } from "@/components/Container";
import { PageLinkGrid } from "@/components/product/PageLinkGrid";

export const metadata: Metadata = {
  title: "Карта сайта",
  description: "Все страницы Бизнес Перезагрузка с AI и ссылки на них.",
};

export default function SiteMapPage() {
  return (
    <main className="py-12 sm:py-16">
      <Container>
        <div className="mb-10 max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">Карта сайта</p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-white sm:text-6xl">
            Все страницы и быстрые переходы
          </h1>
          <p className="mt-5 text-base leading-8 text-slate-300">
            Единая навигация по публичным страницам, product interface, юридическим шаблонам и языковым заглушкам.
          </p>
        </div>
        <PageLinkGrid />
      </Container>
    </main>
  );
}
