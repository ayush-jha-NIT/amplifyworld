import { SERVICES } from "@amplifyworld/shared";
import { HomeHero } from "@/components/home/home-hero";

const process = [
  { step: "01", title: "Discover", description: "Understand your business, audience and goals." },
  { step: "02", title: "Strategize", description: "Shape a focused, measurable path forward." },
  { step: "03", title: "Execute", description: "Bring the right channels and technology together." },
  { step: "04", title: "Grow", description: "Review progress, refine and build sustainably." }
];

export default function Home() {
  return (
    <main>
      <HomeHero />
      <div className="content-shell">
        <section className="stack" id="services" aria-labelledby="services-title">
          <p className="eyebrow">Our services</p>
          <h2 id="services-title">
            Growth Services Built for <span className="gradient-text">Modern Businesses</span>
          </h2>
          <div className="services">
            {SERVICES.map((service) => (
              <article className="service" key={service.id}><h3>{service.title}</h3></article>
            ))}
          </div>
        </section>
        <section className="stack" id="process" aria-labelledby="process-title">
          <p className="eyebrow">Our approach</p>
          <h2 id="process-title">From ambition to <span className="gradient-text">action.</span></h2>
          <ol className="process-grid">
            {process.map((item) => (
              <li key={item.step}>
                <span className="step-number" aria-hidden="true">{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  );
}
