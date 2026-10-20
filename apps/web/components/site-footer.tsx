import Image from "next/image";
import Link from "next/link";
import { SERVICES } from "@amplifyworld/shared";
import { WhatsAppCta } from "./whatsapp-cta";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="content-shell">
        <section className="footer-invitation" aria-labelledby="footer-invitation-title">
          <p className="eyebrow">Ready for what's next?</p>
          <h2 id="footer-invitation-title">
            Build What&apos;s Next. <span className="gradient-text">Amplify What Matters.</span>
          </h2>
          <p>Let's connect strategy, creativity and technology to your business goals.</p>
          <WhatsAppCta label="Talk to Amplify World" />
          {!process.env.NEXT_PUBLIC_WHATSAPP_NUMBER && (
            <p className="footer-configuration">WhatsApp contact will be enabled once our verified number is configured.</p>
          )}
        </section>
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" aria-label="AmplifyWorld homepage">
              <Image
                className="footer-logo"
                src="/design/brand/logo-compact.webp"
                alt=""
                width={1200}
                height={253}
                sizes="200px"
              />
            </Link>
            <p>Strategy | Technology | Marketing</p>
            <p>One connected partner for modern business growth.</p>
          </div>
          <nav className="footer-navigation" aria-label="Footer navigation">
            <h3>Explore</h3>
            <Link href="/">Home</Link>
            <Link href="/about">About</Link>
            <Link href="/portfolio">Our Work</Link>
            <Link href="/blog">Insights</Link>
            <Link href="/contact">Contact</Link>
          </nav>
          <div className="footer-services">
            <h3>Growth services</h3>
            <ul>
              {SERVICES.map((service) => <li key={service.id}>{service.title}</li>)}
            </ul>
            <Link href="/#services" className="footer-services-link">Explore our expertise <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} AmplifyWorld. All rights reserved.</span>
          <Link href="/#process">Our process <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
    </footer>
  );
}
