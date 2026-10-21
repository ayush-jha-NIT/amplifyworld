"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getOfficialWhatsAppHref, WhatsAppCta } from "./whatsapp-cta";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/#services", label: "Services" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" }
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    const closeOnOutside = (event: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOnOutside);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOnOutside);
    };
  }, [menuOpen]);

  return (
    <header className="site-header" ref={headerRef}>
      <div className="nav-shell">
        <Link href="/" className="site-brand" aria-label="AmplifyWorld homepage" onClick={() => setMenuOpen(false)}>
          <Image
            className="brand-image"
            src="/design/brand/logo-compact.webp"
            alt=""
            width={1200}
            height={253}
            sizes="(max-width: 639px) 160px, (max-width: 1099px) 190px, 222px"
            priority
          />
        </Link>

        <nav
          aria-label="Primary navigation"
          id="primary-navigation"
          className={`nav-links ${menuOpen ? "is-open" : ""}`}
        >
          {links.map((item) => {
            const current = !item.href.includes("#") && pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={current ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="mobile-contact">
            <WhatsAppCta label="Let's Grow" />
            {!getOfficialWhatsAppHref(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER) && (
              <p className="contact-pending">WhatsApp contact is currently unavailable.</p>
            )}
          </div>
        </nav>

        <div className="desktop-contact">
          <WhatsAppCta label="Let's Grow" variant="small" />
        </div>
        <button
          ref={menuButtonRef}
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <Image
            src={menuOpen ? "/design/icons/close.svg" : "/design/icons/menu.svg"}
            alt=""
            aria-hidden="true"
            width={23}
            height={23}
          />
        </button>
      </div>
    </header>
  );
}
