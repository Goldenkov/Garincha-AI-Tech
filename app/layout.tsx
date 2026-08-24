import type { Metadata, Viewport } from "next";
import type { PropsWithChildren } from "react";

import { MobileStickyCTA } from "@/components/MobileStickyCTA";
import { PremiumBackground } from "@/components/PremiumBackground";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { businessRebootConfig } from "@/lib/business-reboot-content";
import { siteUrl } from "@/lib/site";

import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#020617",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: businessRebootConfig.publicName,
  title: {
    default: `${businessRebootConfig.publicName} | AI-комплект для бизнеса`,
    template: `%s | ${businessRebootConfig.publicName}`,
  },
  description: businessRebootConfig.description,
  openGraph: {
    title: businessRebootConfig.publicName,
    description: businessRebootConfig.description,
    siteName: businessRebootConfig.publicName,
    type: "website",
    locale: "ru_RU",
  },
  twitter: {
    card: "summary_large_image",
    title: businessRebootConfig.publicName,
    description: businessRebootConfig.description,
  },
  robots: {
    index: true,
    follow: true,
  },
  formatDetection: {
    telephone: false,
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: businessRebootConfig.publicName,
  url: siteUrl,
  description: businessRebootConfig.description,
  inLanguage: "ru-RU",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="ru" className="dark scroll-smooth">
      <body className="min-h-dvh bg-slate-950 font-sans text-slate-100 antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-cyan-300 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-slate-950"
        >
          Перейти к содержанию
        </a>
        <PremiumBackground />
        <SiteHeader />
        <div id="content">{children}</div>
        <SiteFooter />
        <MobileStickyCTA />
      </body>
    </html>
  );
}
