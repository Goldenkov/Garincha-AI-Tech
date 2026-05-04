import type { Metadata } from "next";
import type { PropsWithChildren } from "react";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { siteConfig } from "@/lib/content";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://garincha.ai"),
  title: {
    default: `${siteConfig.fullProductName} | Предзаказ`,
    template: `%s | ${siteConfig.brand}`,
  },
  description:
    "Готовый цифровой набор для владельцев малого бизнеса и самозанятых: промпты, контент-план, офферы, скрипты продаж, квизы, таблицы и структура лендинга.",
  openGraph: {
    title: siteConfig.fullProductName,
    description:
      "Соберите основу продвижения бизнеса с помощью ИИ за 1–2 вечера.",
    type: "website",
    locale: "ru_RU",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="ru" className="dark scroll-smooth">
      <body className="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
