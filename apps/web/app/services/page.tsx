/* AmplifyWorld Services page: standalone, local-first route. */
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SERVICES, type ServiceId } from "@amplifyworld/shared";
import { StructuredData } from "@/components/structured-data";
import { growthProcess, serviceDetails } from "@/components/home/home-content";
import { WhatsAppCta } from "@/components/whatsapp-cta";
import { absolutePublicUrl, marketingWebPage } from "@/lib/site";
import "./services.css";

const description =
  "Explore AmplifyWorld's performance marketing, Google Business Profile, web development, SEO, GEO, AI and social media services.";
const canonical = absolutePublicUrl("/services");
export const metadata: Metadata = {
  title: "Our Services",
  description,
  ...(canonical ? {
    alternates: { canonical },
    openGraph: { title: "Our Services | AmplifyWorld", description, url: canonical },
    twitter: { title: "Our Services | AmplifyWorld", description }
  } : {})
};

type Offering = {
  eyebrow: string;
  introduction: string;
  capabilities: readonly string[];
  focus: string;
};

const offerings: Record<ServiceId, Offering> = {
  performance: {
    eyebrow: "Paid media & acquisition",
    introduction: "Reach relevant audiences with campaigns shaped around real business priorities, clear creative and useful measurement.",
    capabilities: ["Meta Ads campaign planning", "Audience and creative testing", "Conversion tracking setup", "Performance review and optimization"],
    focus: "A measured approach to turning visibility into meaningful customer actions."
  },
  local: {
    eyebrow: "Local visibility",
    introduction: "Help people in your area find accurate, useful information about your business when they are ready to explore their options.",
    capabilities: ["Google Business Profile optimization", "Business information consistency", "Local visibility recommendations", "Profile content and review guidance"],
    focus: "A clearer and more consistent presence for nearby customers."
  },
  website: {
    eyebrow: "Digital experiences",
    introduction: "Create a distinctive website that communicates your offer clearly and helps visitors take the next step.",
    capabilities: ["Custom responsive web design", "Clear information architecture", "Accessible user experiences", "Performance-conscious development"],
    focus: "A website that supports your business, rather than just looking good in a screenshot."
  },
  "seo-geo": {
    eyebrow: "Organic & AI search",
    introduction: "Structure helpful content and technical foundations for traditional search and emerging AI-powered discovery.",
    capabilities: ["Technical and on-page SEO", "Search-intent content planning", "GEO and AEO content structure", "Internal linking and structured information"],
    focus: "Better-organized information that people and search systems can understand."
  },
  "agentic-ai": {
    eyebrow: "Useful automation",
    introduction: "Build focused AI experiences and practical workflows that assist visitors and teams without losing the human handoff.",
    capabilities: ["AI website assistant planning", "Workflow automation", "Knowledge-backed answers", "Escalation and human handoff design"],
    focus: "Thoughtful automation around specific, useful jobs to be done."
  },
  social: {
    eyebrow: "Creative & community",
    introduction: "Keep your brand's story consistent across social channels with thoughtful planning, production and day-to-day coordination.",
    capabilities: ["Content strategy and calendars", "Creative direction and video production", "Social media publishing support", "Audience engagement planning"],
    focus: "A recognizable voice and a more intentional social presence."
  }
};

const questions = [
  {
    question: "Can I choose just one service?",
    answer: "Yes. We can discuss a focused need, such as a website or Google Business Profile, or explore how several services can work together."
  },
  {
    question: "How does a new project begin?",
    answer: "We start by understanding your business, the audience you want to reach, the work involved and your priorities before proposing an approach."
  },
  {
    question: "Do you work with businesses in Prayagraj?",
    answer: "AmplifyWorld is based in Prayagraj. Contact us to discuss the type of collaboration and delivery your project needs."
  },
  {
    question: "How can I discuss pricing?",
    answer: "Scope and pricing depend on the services, deliverables and ongoing work needed. Share your requirements to start a direct conversation."
  }
] as const;

export default function ServicesPage() {
  return (
    <main className="services-page" id="main-content">
      <StructuredData data={marketingWebPage("/services", "Our Services | AmplifyWorld", description)} />
      <section className="services-hero" aria-labelledby="services-page-title">
        <div className="content-shell services-hero-grid">
          <div className="services-hero-copy">
            <p className="eyebrow">Digital growth, connected</p>
            <h1 id="services-page-title">Our Services. <span className="gradient-text">Built Around Your Growth.</span></h1>
            <p className="services-hero-description">
              Strategy, creativity and technology should move in the same direction.
              Explore six connected services built to support the next stage of your business.
            </p>
            <div className="services-actions">
              <Link className="services-button services-button-primary" href="#all-services">
                Explore Our Services <span aria-hidden="true">↘</span>
              </Link>
              <Link className="services-button services-button-outline" href="/contact">
                Discuss Your Project <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <div className="services-hero-highlights" aria-label="Our approach">
              <span>Purposeful strategy</span>
              <span>Connected execution</span>
              <span>Clear collaboration</span>
            </div>
          </div>
          <div className="services-hero-visual" aria-hidden="true">
            <div className="services-orbit services-orbit-outer" />
            <div className="services-orbit services-orbit-inner" />
            <Image src="/design/about/earth-beauty-1200.webp" alt="" className="services-earth"
              width={1200} height={1200} priority sizes="(max-width: 760px) 86vw, 48vw" />
            <span className="services-orbit-label services-label-one">STRATEGY</span>
            <span className="services-orbit-label services-label-two">CREATIVITY</span>
            <span className="services-orbit-label services-label-three">TECHNOLOGY</span>
          </div>
        </div>
      </section>

      <section className="content-shell services-offerings" id="all-services" aria-labelledby="services-offerings-title">
        <div className="services-section-heading">
          <div>
            <p className="eyebrow">What we do</p>
            <h2 id="services-offerings-title">The Right Expertise. <span className="gradient-text">In One Place.</span></h2>
          </div>
          <p>Choose a focused service or build a connected plan. Each engagement starts with your actual goals, not a one-size-fits-all package.</p>
        </div>
        <div className="services-offerings-grid">
          {SERVICES.map((service, index) => {
            const content = offerings[service.id];
            return (
              <article className="services-offer-card" id={service.id} key={service.id} aria-labelledby={`service-title-${service.id}`}>
                <div className="services-card-top">
                  <span className="services-card-number">{String(index + 1).padStart(2, "0")}</span>
                  <span className="services-card-icon">
                    <Image src={`/design/icons/${serviceDetails[service.id].icon}.svg`} alt="" width={30} height={30} />
                  </span>
                </div>
                <p className="services-card-eyebrow">{content.eyebrow}</p>
                <h3 id={`service-title-${service.id}`}>{service.title}</h3>
                <p className="services-card-introduction">{content.introduction}</p>
                <h4>What we can help with</h4>
                <ul className="services-capabilities">
                  {content.capabilities.map(item => <li key={item}>{item}</li>)}
                </ul>
                <p className="services-card-focus">{content.focus}</p>
                <Link className="services-card-link" href="/contact" aria-label={`Discuss ${service.title}`}>
                  Discuss this service <span aria-hidden="true">↗</span>
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="services-process" aria-labelledby="services-process-title">
        <div className="content-shell">
          <div className="services-section-heading">
            <div>
              <p className="eyebrow">How we collaborate</p>
              <h2 id="services-process-title">A Practical Process. <span className="gradient-text">No Guesswork.</span></h2>
            </div>
            <p>A clear journey from understanding your challenge to reviewing the work and deciding what should happen next.</p>
          </div>
          <ol className="services-process-grid">
            {growthProcess.map(step => (
              <li className="services-process-step" key={step.id}>
                <span className="services-process-number">{step.number}</span>
                <span className="services-process-icon" aria-hidden="true">
                  <Image src={`/design/icons/${step.icon}.svg`} alt="" width={25} height={25} />
                </span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="content-shell services-faq" aria-labelledby="services-faq-title">
        <div className="services-section-heading">
          <div>
            <p className="eyebrow">Good to know</p>
            <h2 id="services-faq-title">Questions Before <span className="gradient-text">We Begin?</span></h2>
          </div>
          <p>Some useful details before starting a conversation with the AmplifyWorld team.</p>
        </div>
        <div className="services-faq-list">
          {questions.map(item => (
            <details className="services-faq-item" key={item.question}>
              <summary>{item.question}<span aria-hidden="true">+</span></summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="content-shell services-ending-wrap">
        <div className="services-ending" aria-labelledby="services-ending-title">
          <p className="eyebrow">Your next step</p>
          <h2 id="services-ending-title">Ready to Build <span className="gradient-text">What&apos;s Next?</span></h2>
          <p>Tell us what you are building and what you want to improve. We can explore a direction that makes sense for your business.</p>
          <div className="services-ending-actions">
            <WhatsAppCta label="Talk to Amplify World" />
            <Link href="/portfolio" className="services-button services-button-outline">Explore Our Work <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
