import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { WhatsAppCta } from "@/components/whatsapp-cta";
import { PortfolioGallery } from "@/components/portfolio/portfolio-gallery";
import { SectionReveal } from "@/components/home/section-reveal";

export const metadata: Metadata = {
  title: "Our Portfolio",
  description: "Explore illustrative growth website, performance marketing and local discovery concepts from AmplifyWorld. These are design studies, not verified client engagements.",
  robots: { index: false, follow: true }
};

const process = [
  { label: "Discover", icon: "discover", detail: "Understand your business, goals and opportunities." },
  { label: "Strategize", icon: "strategy", detail: "Create a clear plan around your priorities." },
  { label: "Execute", icon: "execute", detail: "Design, build and launch thoughtful solutions." },
  { label: "Grow", icon: "growth", detail: "Review, refine and build on what works." }
];

export default function PortfolioPage() {
  return (
    <main className="portfolio-page">
      <section className="portfolio-hero" aria-labelledby="portfolio-hero-heading">
        <div className="content-shell portfolio-hero-layout">
          <div className="portfolio-hero-copy">
            <p className="eyebrow">Our work | Design concepts</p>
            <h1 id="portfolio-hero-heading">
              Our Portfolio <span className="gradient-text">Projects That Move Brands Forward.</span>
            </h1>
            <p>Explore the possibilities of connected strategy, websites and digital experiences. Every example shown here is an original, illustrative design concept.</p>
            <div className="portfolio-hero-actions">
              <Link className="portfolio-primary-action" href="/contact">Start Your Project <span aria-hidden="true">↗</span></Link>
              <Link className="portfolio-secondary-action" href="#projects">Explore Concepts <span aria-hidden="true">↓</span></Link>
            </div>
          </div>
          <div className="portfolio-hero-stack" aria-hidden="true">
            <div className="portfolio-hero-frame portfolio-hero-frame-back"><Image src="/design/templates/project-local.svg" alt="" width={1200} height={800} loading="lazy" /></div>
            <div className="portfolio-hero-frame portfolio-hero-frame-middle"><Image src="/design/templates/project-campaign.svg" alt="" width={1200} height={800} loading="lazy" /></div>
            <div className="portfolio-hero-frame portfolio-hero-frame-front"><Image src="/design/templates/project-website.svg" alt="" width={1200} height={800} priority /></div>
          </div>
        </div>
      </section>

      <PortfolioGallery />

      <div className="content-shell">
        <SectionReveal>
          <section className="portfolio-process" aria-labelledby="portfolio-process-title">
            <div data-reveal>
              <p className="eyebrow">From thinking to doing</p>
              <h2 id="portfolio-process-title">From Strategy to <span className="gradient-text">Thoughtful Execution.</span></h2>
            </div>
            <ol className="portfolio-process-grid">
              {process.map((step, index) => (
                <li key={step.label} data-reveal>
                  <span className="portfolio-process-icon"><Image src={`/design/icons/${step.icon}.svg`} alt="" width={30} height={30} /></span>
                  <h3>{String(index + 1).padStart(2, "0")}. {step.label}</h3>
                  <p>{step.detail}</p>
                </li>
              ))}
            </ol>
          </section>
        </SectionReveal>

        <section className="portfolio-final-cta" aria-labelledby="portfolio-final-title">
          <p className="eyebrow">Your next chapter</p>
          <h2 id="portfolio-final-title">Ready to <span className="gradient-text">Amplify</span> Your Business?</h2>
          <p>Bring your goals to the conversation. We can explore the right creative, marketing and technology approach together.</p>
          <div className="portfolio-final-actions">
            <WhatsAppCta label="Talk to Amplify World" />
            <Link className="portfolio-secondary-action" href="/contact">Contact AmplifyWorld <span aria-hidden="true">↗</span></Link>
          </div>
        </section>
      </div>
    </main>
  );
}
