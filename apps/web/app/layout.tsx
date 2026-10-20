import type { Metadata } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageTransition } from "@/components/page-transition";
import "./globals.css";

const jakarta = localFont({
  src: "../public/design/fonts/PlusJakartaSans-Variable.ttf",
  weight: "200 800",
  style: "normal",
  variable: "--font-jakarta",
  display: "swap"
});

export const metadata: Metadata = {
  title: { default: "AmplifyWorld | Business Growth", template: "%s | AmplifyWorld" },
  description: "AmplifyWorld helps businesses grow with marketing, SEO, GEO, custom websites and AI-powered solutions."
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
