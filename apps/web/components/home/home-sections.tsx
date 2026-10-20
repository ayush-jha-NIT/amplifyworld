import Image from "next/image";
import Link from "next/link";
import { SERVICES } from "@amplifyworld/shared";
import { WhatsAppCta } from "@/components/whatsapp-cta";
import { benefits, conceptProjects, growthProcess, serviceDetails } from "./home-content";
import { SectionReveal } from "./section-reveal";

function Icon({ name }: { name: string }) {
  return <Image src={`/design/icons/${name}.svg`} width={30} height={30} alt="" aria-hidden="true" />;
}

export function HomeSections() {
  return (
    <div className="home-sections content-shell">
      <SectionReveal>
        <section className="home-section home-services" id="services" aria-labelledby="services-title">
          <div className="home-section-header" data-reveal>
            <div>
              <p className="eyebrow">Our solutions</p>
              <h2 id="services-title">Growth Services Built <span className="gradient-text">for Modern Businesses.</span></h2>
            </div>
            <p className="home-section-intro">
              From first impressions to long-term visibility, we connect strategy and execution
              with services shaped around your business.
            </p>
          </div>
          <div className="home-service-grid">
            {SERVICES.map((service) => {
              const detail = serviceDetails[service.id];
              return (
                <article className="home-service-card" data-reveal key={service.id}>
                  <div className="home-icon-box"><Icon name={detail.icon} /></div>
                  <div className="home-service-card-copy">
                    <h3>{service.title}</h3>
                    <p>{detail.description}</p>
                    <Link
                      className="home-card-arrow"
                      href="/contact"
                      aria-label={`Discuss ${service.title} with AmplifyWorld`}
                    >
                      <span aria-hidden="true">↗</span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </SectionReveal>

      <SectionReveal>
        <section className="home-section home-partner" id="why-us" aria-labelledby="partner-title">
          <div className="home-partner-copy" data-reveal>
            <p className="eyebrow">Why AmplifyWorld</p>
            <h2 id="partner-title">More Than a Service Partner. Your <span className="gradient-text">Growth Team.</span></h2>
            <p>
              Strategy, technology and creative execution should work together, not compete
              for your attention. We focus on an approach that feels connected from idea to launch.
            </p>
            <Link href="/about" className="home-outline-action">
              Learn About Us <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <div className="home-benefit-grid">
            {benefits.map((benefit) => (
              <article key={benefit.id} className="home-benefit-card" data-reveal>
                <div className="home-icon-box"><Icon name={benefit.icon} /></div>
                <div>
                  <h3>{benefit.title}</h3>
                  <p>{benefit.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </SectionReveal>

      <SectionReveal>
        <section className="home-section home-work" id="featured-work" aria-labelledby="work-title">
          <div className="home-section-header" data-reveal>
            <div>
              <p className="eyebrow">Explore the possibilities</p>
              <h2 id="work-title">Ideas Built to <span className="gradient-text">Move You Forward.</span></h2>
            </div>
            <div className="home-section-aside">
              <p>These are visual concepts, not client projects or performance claims.</p>
              <Link href="/portfolio" className="home-outline-action">
                Explore Our Work <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
          <div className="home-work-grid">
            {conceptProjects.map((project) => (
              <article className="home-work-card" data-reveal key={project.id}>
                <div className="home-work-visual">
                  <Image
                    src={`/design/templates/${project.image}`}
                    width={1200}
                    height={800}
                    alt={`${project.title}, illustrative artwork rather than real client work`}
                    sizes="(max-width: 639px) calc(100vw - 40px), (max-width: 1099px) 46vw, 29vw"
                    loading="lazy"
                  />
                </div>
                <div className="home-work-body">
                  <p className="home-concept-label">Concept / Placeholder</p>
                  <h3>{project.title}</h3>
                  <p className="home-work-description">{project.description}</p>
                  <div className="home-work-bottom">
                    <span className="home-category-badge">{project.category}</span>
                    <Link href="/portfolio" className="home-work-link" aria-label={`View portfolio for ${project.title}`}>View portfolio <span aria-hidden="true">↗</span></Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </SectionReveal>

      <SectionReveal>
        <section className="home-section home-process" id="process" aria-labelledby="process-title">
          <div className="home-section-header" data-reveal>
            <div>
              <p className="eyebrow">Our simple process</p>
              <h2 id="process-title">A Clear Process. <span className="gradient-text">A Shared Direction.</span></h2>
            </div>
            <p className="home-section-intro">A practical path from understanding your goals to improving the work over time.</p>
          </div>
          <ol className="home-process-list">
            {growthProcess.map((step) => (
              <li key={step.id} data-reveal>
                <span className="home-process-icon"><Icon name={step.icon} /></span>
                <h3><span className="home-step-number">{step.number}.</span> {step.title}</h3>
                <p>{step.description}</p>
              </li>
            ))}
          </ol>
        </section>
      </SectionReveal>

      <SectionReveal>
        <section className="home-horizon-cta" aria-labelledby="home-final-cta">
          <div className="home-horizon-inner" data-reveal>
            <p className="eyebrow">Your next chapter</p>
            <h2 id="home-final-cta">Ready to <span className="gradient-text">Amplify</span> Your Business?</h2>
            <p>
              Tell us where you want to go. We&apos;ll explore how strategy, technology
              and marketing can help you get there.
            </p>
            <div className="home-horizon-actions">
              <WhatsAppCta label="Talk to Amplify World" />
              <Link href="/contact" className="home-outline-action">
                Contact Us <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </section>
      </SectionReveal>
    </div>
  );
}
