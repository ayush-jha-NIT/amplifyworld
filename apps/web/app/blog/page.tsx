import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { WhatsAppCta } from "@/components/whatsapp-cta";
import { BlogExperience } from "@/components/blog/blog-experience";
import { findArticle } from "@/components/blog/blog-data";

type BlogPageProps = {
  searchParams: Promise<{ article?: string | string[] }>;
};

export async function generateMetadata({ searchParams }: BlogPageProps): Promise<Metadata> {
  const params = await searchParams;
  const slug = typeof params.article === "string" ? params.article : null;
  const article = findArticle(slug);

  return {
    title: article ? article.title : "Insights & Ideas",
    description: article ? article.description :
      "Explore original sample insights about SEO, GEO, strategic marketing, AI and social media management from AmplifyWorld.",
    // These are explicitly editorial demonstration articles, not published agency posts.
    // Allow normal indexing once real verified, approved editorial content replaces fixtures.
    robots: { index: false, follow: true }
  };
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const slug = typeof params.article === "string" ? params.article : null;

  return (
    <main className="blog-page">
      <section className="blog-hero" aria-labelledby="blog-hero-heading">
        <div className="content-shell blog-hero-grid">
          <div className="blog-hero-copy">
            <p className="eyebrow">Blog | Ideas | Perspectives</p>
            <h1 id="blog-hero-heading">
              Insights That <span className="gradient-text">Amplify Growth.</span>
            </h1>
            <p>
              A place for ideas on marketing, technology and business growth.
              Explore the full reading experience with clearly marked original sample articles.
            </p>
            <div className="blog-hero-actions">
              <Link className="blog-primary-action" href="#articles">
                Explore Articles <span aria-hidden="true">↓</span>
              </Link>
              <WhatsAppCta label="Talk to Amplify World" />
            </div>
          </div>
          <div className="blog-hero-art" aria-hidden="true">
            <div className="blog-art-main">
              <Image src="/design/artwork/editorial-search-1200.webp" alt=""
                width={1200} height={800} priority sizes="(max-width: 639px) 95vw, (max-width: 1099px) 50vw, 620px" />
            </div>
            <div className="blog-art-secondary">
              <Image src="/design/artwork/editorial-ai-640.webp" alt=""
                width={640} height={427} sizes="(max-width: 639px) 40vw, 240px" />
            </div>
          </div>
        </div>
      </section>
      <BlogExperience initialSlug={slug} />
      <div className="content-shell">
        <section className="blog-final-cta" aria-labelledby="blog-final-title">
          <p className="eyebrow">A good idea starts a conversation</p>
          <h2 id="blog-final-title">Bring Your Next <span className="gradient-text">Idea to Life.</span></h2>
          <p>Explore a thoughtful path to growth through strategy, marketing and technology.</p>
          <div className="blog-final-actions">
            <WhatsAppCta label="Talk to Amplify World" />
            <Link href="/contact" className="blog-outline-action">Contact Us <span aria-hidden="true">↗</span></Link>
          </div>
        </section>
      </div>
    </main>
  );
}
