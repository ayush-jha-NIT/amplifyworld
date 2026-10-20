import Link from "next/link";

type Props = { eyebrow: string; title: string; description: string };

export function PageFrame({ eyebrow, title, description }: Props) {
  return (
    <main className="content-shell">
      <section className="hero">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="lead">{description}</p>
        <Link className="action" href="/">Back to homepage</Link>
      </section>
    </main>
  );
}
