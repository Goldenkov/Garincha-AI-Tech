import type { Metadata } from "next";
import type { PropsWithChildren } from "react";

import { MobileStickyCTA } from "@/components/MobileStickyCTA";
import { PremiumBackground } from "@/components/PremiumBackground";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { businessRebootConfig } from "@/lib/business-reboot-content";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://garincha-ai-tech.vercel.app"),
  title: {
    default: `${businessRebootConfig.publicName} | AI-комплект для бизнеса`,
    template: `%s | ${businessRebootConfig.publicName}`,
  },
  description: businessRebootConfig.description,
  openGraph: {
    title: businessRebootConfig.publicName,
    description: businessRebootConfig.description,
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
      <body className="min-h-screen bg-slate-950 pb-24 font-sans text-slate-100 antialiased sm:pb-0">
        <PremiumBackground />
        <SiteHeader />
        {children}
        <SiteFooter />
        <MobileStickyCTA />
      </body>
    </html>
  );
}
