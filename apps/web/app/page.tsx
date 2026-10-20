import Link from "next/link";
import { SERVICES } from "@amplifyworld/shared";

export default function Home() {
  return (
    <main className="content-shell">
      <section className="hero">
        <p className="eyebrow">Strategy | Technology | Marketing</p>
        <h1>We Amplify <span className="gradient-text">Your Business Growth.</span></h1>
        <p className="lead">AmplifyWorld helps businesses grow through strategic marketing, technology, branding, custom websites, SEO, GEO and AI automation.</p>
        <Link className="action" href="/contact">Explore working together</Link>
      </section>
      <section className="stack" id="services" aria-labelledby="services-title">
        <p className="eyebrow">Our services</p>
        <h2 id="services-title">Growth Services Built for <span className="gradient-text">Modern Businesses</span></h2>
        <div className="services">
          {SERVICES.map((service) => (
            <article className="service" key={service.id}><h3>{service.title}</h3></article>
          ))}
        </div>
      </section>
    </main>
  );
}
