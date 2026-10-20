import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SERVICES } from "@amplifyworld/shared";
import { SectionReveal } from "@/components/home/section-reveal";
import { serviceDetails } from "@/components/home/home-content";
import { WhatsAppCta } from "@/components/whatsapp-cta";

export const metadata: Metadata = {
  title: "About Us",
  description: "Meet AmplifyWorld, a growth-focused agency connecting strategy, technology, performance marketing, websites, SEO, GEO and creative execution."
};

const values = [
  {
    icon: "results",
    title: "Results-Driven",
    description: "Focus on the business outcomes and decisions that matter."
  },
  {
    icon: "innovation",
    title: "Innovation",
    description: "Explore useful ideas and purposeful technology."
  },
  {
    icon: "transparency",
    title: "Transparency",
    description: "Communicate openly and explain decisions clearly."
  },
  {
    icon: "partnership",
    title: "Long-Term Partnerships",
    description: "Build relationships around shared goals and mutual progress."
  }
] as const;

const advantages = [
  {
    icon: "strategy",
    title: "Purposeful strategy",
    description: "A direction shaped around your business goals."
  },
  {
    icon: "partnership",
    title: "Connected expertise",
    description: "Marketing, creativity and technology working together."
  },
  {
    icon: "execute",
    title: "Thoughtful execution",
    description: "Useful tools and focused delivery instead of complexity for its own sake."
  },
  {
    icon: "transparency",
    title: "Transparent collaboration",
    description: "Clear conversations, shared priorities and room to improve."
  }
] as const;

function AboutIcon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span className={`about-icon ${className}`}>
      <Image
        src={`/design/icons/${name}.svg`}
        width={28}
        height={28}
        alt=""
        aria-hidden="true"
      />
    </span>
  );
}

export default function AboutPage() {
  return (
    <main className="about-page">
      <section className="about-hero" aria-labelledby="about-page-title">
        <div className="content-shell about-hero-grid">
          <div className="about-hero-copy">
            <p className="eyebrow">Our story | Our purpose</p>
            <p className="about-kicker">About AmplifyWorld</p>
            <h1 id="about-page-title">
              A Modern <span className="gradient-text">Growth Partner</span> for Ambitious Businesses.
            </h1>
            <p className="about-hero-description">
              We bring strategic marketing, technology and creative execution together
              to help businesses build a stronger future.
            </p>
            <div className="about-hero-actions">
              <WhatsAppCta label="Talk to Amplify World" />
              <Link href="/#services" className="about-secondary-action">
                See Our Services <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
          <div className="about-hero-art" aria-hidden="true">
            <div className="about-hero-orbit about-hero-orbit-outer" />
            <div className="about-hero-orbit about-hero-orbit-inner" />
            <div className="about-hero-planet">
              <Image
                src="/design/about/earth-beauty-1200.webp"
                alt=""
                fill
                sizes="(max-width: 639px) 300px, (max-width: 1099px) 440px, 610px"
                priority
                className="about-planet-image"
              />
            </div>
            <div className="about-hero-brand">
              <Image
                src="/design/brand/logo-emblem.webp"
                alt=""
                fill
                sizes="(max-width: 639px) 105px, 180px"
                className="about-emblem-image"
              />
            </div>
            <span className="about-orbit-point about-orbit-point-one" />
            <span className="about-orbit-point about-orbit-point-two" />
            <p className="about-art-caption">Strategy <span>·</span> Technology <span>·</span> Marketing</p>
          </div>
        </div>
      </section>

      <div className="content-shell">
        <SectionReveal>
          <section className="about-section about-story" aria-labelledby="about-story-title">
            <div className="about-story-intro" data-reveal>
              <p className="eyebrow">Who we are</p>
              <h2 id="about-story-title">We Build Brands <span className="gradient-text">That Scale.</span></h2>
              <p>
                Business growth takes more than isolated campaigns. We connect strategy,
                creative thinking and technology to build a clear path from ambition to action.
              </p>
            </div>
            <article className="about-purpose-card" data-reveal>
              <AboutIcon name="mission" />
              <h3>Our Mission</h3>
              <p>
                To empower ambitious businesses with strategic marketing, thoughtful
                technology and creative solutions that support meaningful growth.
              </p>
            </article>
            <article className="about-purpose-card" data-reveal>
              <AboutIcon name="vision" />
              <h3>Our Vision</h3>
              <p>
                To become a trusted growth partner for businesses building
                stronger brands and a brighter future.
              </p>
            </article>
          </section>
        </SectionReveal>

        <SectionReveal>
          <section className="about-section about-values" aria-labelledby="about-values-title">
            <div className="about-section-heading" data-reveal>
              <p className="eyebrow">Our values</p>
              <h2 id="about-values-title">The Principles <span className="gradient-text">That Drive Us.</span></h2>
              <p>How we think, how we collaborate and how we approach the work.</p>
            </div>
            <div className="about-values-grid">
              {values.map((value) => (
                <article className="about-value" key={value.title} data-reveal>
                  <AboutIcon name={value.icon} />
                  <h3>{value.title}</h3>
                  <p>{value.description}</p>
                </article>
              ))}
            </div>
          </section>
        </SectionReveal>

        <SectionReveal>
          <section className="about-section about-partner" aria-labelledby="about-partner-title">
            <div className="about-partner-copy" data-reveal>
              <p className="eyebrow">Why businesses choose AmplifyWorld</p>
              <h2 id="about-partner-title">
                More Than a Service Provider. <span className="gradient-text">Your Growth Partner.</span>
              </h2>
              <p>
                We connect the work across disciplines, so each decision
                can support the wider business direction.
              </p>
              <Link href="/contact" className="about-secondary-action">
                Start a Conversation <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <div className="about-partner-list">
              {advantages.map((item) => (
                <article className="about-partner-item" key={item.title} data-reveal>
                  <AboutIcon name={item.icon} />
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </SectionReveal>

        <SectionReveal>
          <section className="about-section about-expertise" aria-labelledby="about-expertise-title">
            <div className="about-section-heading" data-reveal>
              <p className="eyebrow">Our expertise</p>
              <h2 id="about-expertise-title">
                Everything You Need to <span className="gradient-text">Grow in One Place.</span>
              </h2>
              <p>Six connected disciplines, shaped around the needs of modern businesses.</p>
            </div>
            <div className="about-expertise-grid">
              {SERVICES.map((service) => (
                <Link href="/#services" key={service.id} data-reveal className="about-expertise-item">
                  <AboutIcon name={serviceDetails[service.id].icon} />
                  <span>{service.title}</span>
                  <span aria-hidden="true" className="about-expertise-arrow">↗</span>
                </Link>
              ))}
            </div>
          </section>
        </SectionReveal>

        <SectionReveal>
          <section className="about-final-cta" aria-labelledby="about-final-title" data-reveal>
            <p className="eyebrow">Let's build what comes next</p>
            <h2 id="about-final-title">Ready to <span className="gradient-text">Amplify</span> Your Business?</h2>
            <p>
              Let&apos;s talk about your goals and build a thoughtful path to growth
              through strategy, technology and marketing.
            </p>
            <div className="about-final-actions">
              <WhatsAppCta label="Talk to Amplify World" />
              <Link href="/portfolio" className="about-secondary-action">
                Explore Our Work <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </section>
        </SectionReveal>
      </div>
    </main>
  );
}
