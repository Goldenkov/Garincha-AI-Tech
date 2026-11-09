import type { Metadata, Viewport } from "next";
import { Golos_Text, Literata } from "next/font/google";
import type { PropsWithChildren } from "react";

import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { brand } from "@/lib/brand";
import { siteUrl } from "@/lib/site";

import "./globals.css";

const literata = Literata({
  subsets: ["latin", "cyrillic"],
  axes: ["opsz"],
  variable: "--font-literata",
  display: "swap",
});

const golos = Golos_Text({
  subsets: ["latin", "cyrillic"],
  variable: "--font-golos",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f4f1ea",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: brand.product,
  title: {
    default: `${brand.product} — от идеи к первому реальному шагу`,
    template: `%s — ${brand.product}`,
  },
  description: brand.description,
  openGraph: {
    title: brand.product,
    description: brand.description,
    siteName: brand.product,
    type: "website",
    locale: "ru_RU",
  },
  twitter: { card: "summary_large_image", title: brand.product, description: brand.description },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: brand.product,
  url: siteUrl,
  description: brand.description,
  inLanguage: "ru-RU",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="ru" className={`${literata.variable} ${golos.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-paper"
        >
          Перейти к содержанию
        </a>
        <SiteHeader />
        <div id="content" tabIndex={-1} className="flex-1 scroll-mt-[var(--header-h)] outline-none">
          {children}
        </div>
        <SiteFooter />
      </body>
    </html>
  );
}
