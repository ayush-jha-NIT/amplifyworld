import Link from "next/link";

export default function NotFound() {
  return (
    <main className="content-shell">
      <section className="hero">
        <p className="eyebrow">404 · Page not found</p>
        <h1>A Different <span className="gradient-text">Direction.</span></h1>
        <p className="lead">This page could not be found. Return to AmplifyWorld to discover our services.</p>
        <Link className="action" href="/">Back to Home</Link>
      </section>
    </main>
  );
}
