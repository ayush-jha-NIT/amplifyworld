import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "AmplifyWorld | Business Growth", template: "%s | AmplifyWorld" },
  description: "Strategy, performance marketing, SEO, websites and AI-powered solutions for sustainable business growth."
};

const routes = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" }
];

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="nav-shell">
            <Link href="/" className="brand" aria-label="AmplifyWorld homepage">Amplify<span>World</span></Link>
            <nav className="nav-links" aria-label="Main navigation">
              {routes.map((route) => <Link href={route.href} key={route.href}>{route.label}</Link>)}
            </nav>
          </div>
        </header>
        {children}
        <footer className="site-footer">
          <div className="content-shell">© {new Date().getFullYear()} AmplifyWorld · Strategy | Technology | Marketing</div>
        </footer>
      </body>
    </html>
  );
}
