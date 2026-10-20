import Link from "next/link";
import { WhatsAppCta } from "@/components/whatsapp-cta";
import { HeroScene } from "./hero-scene";

export function HomeHero() {
  return (
    <section className="cinematic-hero" aria-labelledby="home-hero-heading">
      <div className="content-shell cinematic-hero-grid">
        <div className="cinematic-hero-copy">
          <p className="eyebrow">Strategy | Technology | Marketing</p>
          <h1 id="home-hero-heading">
            We Amplify <span className="gradient-text">Your Business Growth.</span>
          </h1>
          <p className="cinematic-hero-subheading">
            One Connected World of Growth.
          </p>
          <p className="cinematic-hero-description">
            AmplifyWorld connects strategy, performance marketing, creative branding,
            custom websites, SEO, GEO and practical AI automation to help businesses
            grow with purpose.
          </p>
          <div className="cinematic-hero-actions">
            <WhatsAppCta label="Talk to Amplify World" />
            <Link href="/portfolio" className="hero-secondary-action">
              Explore Our Work <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <p className="cinematic-hero-caption">
            Digital marketing · Web experiences · Business growth
          </p>
        </div>
        <HeroScene />
      </div>
    </section>
  );
}
