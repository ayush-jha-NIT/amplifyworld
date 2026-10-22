import Image from "next/image";
import Link from "next/link";
import { getOfficialWhatsAppHref, WhatsAppCta } from "./whatsapp-cta";

const socialLinks = [
  {
    name: "Instagram",
    handle: "@amplifyworld.official",
    href: "https://www.instagram.com/amplifyworld.official",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle className="footer-social-icon-fill" cx="18" cy="6" r="1" />
      </svg>
    )
  },
  {
    name: "Facebook",
    handle: "View on Facebook",
    href: "https://www.facebook.com/share/p/1Ba7V3X2Gx/",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14 21v-8h3l.5-4H14V7c0-1.2.4-2 2-2h2V1.4c-.4-.1-1.6-.2-3-.2-3 0-5 1.8-5 5.2V9H7v4h3v8h4Z" />
      </svg>
    )
  },
  {
    name: "LinkedIn",
    handle: "Profile coming soon",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5.2 3.5a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4ZM3.3 9.5h3.8V21H3.3V9.5Zm6.2 0h3.6v1.6h.1a4 4 0 0 1 3.6-2c3.8 0 4.5 2.5 4.5 5.7V21h-3.8v-5.5c0-1.3 0-3-1.9-3s-2.2 1.4-2.2 2.9V21H9.5V9.5Z" />
      </svg>
    )
  }
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="content-shell">
        <section className="footer-invitation" aria-labelledby="footer-invitation-title">
          <p className="eyebrow">Ready for what&apos;s next?</p>
          <h2 id="footer-invitation-title">
            Build What&apos;s Next. <span className="gradient-text">Amplify What Matters.</span>
          </h2>
          <p>Let&apos;s connect strategy, creativity and technology to your business goals.</p>
          <WhatsAppCta label="Talk to Amplify World" />
          {!getOfficialWhatsAppHref(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER) && (
            <p className="footer-configuration">WhatsApp contact will be enabled once our verified number is configured.</p>
          )}
        </section>
        <div className="footer-grid">
          <div className="footer-brand">
            <Link className="footer-brand-logo" href="/" aria-label="AmplifyWorld homepage">
              <Image className="footer-logo" src="/design/brand/logo-compact.webp" alt="" width={1200} height={253} sizes="240px" />
            </Link>
            <p>A modern growth agency helping ambitious businesses scale through strategy, creativity, technology and automation.</p>
          </div>
          <nav className="footer-navigation" aria-label="Footer navigation">
            <h2>Quick Links</h2>
            <div className="footer-link-columns">
              <div>
                <Link href="/">Home</Link>
                <Link href="/about">About</Link>
                <Link href="/services">Services</Link>
                <Link href="/portfolio">Work</Link>
              </div>
              <div>
                <Link href="/#process">Process</Link>
                <Link href="/contact">Pricing</Link>
                <Link href="/blog">Blog</Link>
                <Link href="/contact">Contact</Link>
              </div>
            </div>
          </nav>
          <div className="footer-services">
            <h2>Our Services</h2>
            <ul>
              <li>Performance Marketing</li>
              <li>Social Media</li>
              <li>Website Development</li>
              <li>Google Business Profile</li>
              <li>SEO &amp; GEO</li>
              <li>Growth Strategy</li>
              <li>AI Solutions</li>
              <li>Brand Development</li>
            </ul>
          </div>
          <nav className="footer-social" aria-label="Social media">
            <h2>Stay Connected</h2>
            {socialLinks.map((social) => (
              social.href ? (
                <a key={social.name} href={social.href} target="_blank" rel="noreferrer" aria-label={`${social.name}: ${social.handle} (opens in a new tab)`}>
                  {social.icon}
                </a>
              ) : (
                <span key={social.name} className="footer-social-pending" role="img" aria-label={`${social.name} profile coming soon`} title={`${social.name} profile coming soon`}>
                  {social.icon}
                </span>
              )
            ))}
          </nav>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} AmplifyWorld. All rights reserved.</span>
          <div className="footer-legal">
            <span>Privacy Policy</span>
            <span aria-hidden="true">|</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
