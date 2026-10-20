import type { Metadata } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageTransition } from "@/components/page-transition";
import { siteOrigin } from "@/lib/site";
import "./globals.css";

const jakarta = localFont({
  src: "../public/design/fonts/PlusJakartaSans-Variable.ttf",
  weight: "200 800",
  style: "normal",
  variable: "--font-jakarta",
  display: "swap"
});

const origin = siteOrigin();
export const metadata: Metadata = {
  title: { default: "AmplifyWorld | Business Growth", template: "%s | AmplifyWorld" },
  description: "AmplifyWorld helps businesses grow with marketing, SEO, GEO, custom websites and AI-powered solutions.",
  metadataBase: origin ?? undefined,
  robots: { index: Boolean(origin), follow: Boolean(origin) },
  ...(origin ? {
    openGraph: {
      siteName: "AmplifyWorld", locale: "en_US", type: "website" as const,
      images: [{ url: new URL("/design/about/earth-beauty-1200.webp", origin).href,
        width: 1200, height: 800, alt: "AmplifyWorld original Earth and violet brand illustration" }]
    },
    twitter: { card: "summary_large_image" as const }
  } : {})
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className={jakarta.variable}>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <SiteHeader />
        <PageTransition>{children}</PageTransition>
        <SiteFooter />
      </body>
    </html>
  );
}
