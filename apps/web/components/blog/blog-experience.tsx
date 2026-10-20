"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { articles, blogCategories, findArticle, getRelatedArticles } from "./blog-data";
import type { BlogArticle, BlogCategory } from "./blog-data";

function articleUrl(slug: string | null): string {
  if (!slug) return "/blog";
  const params = new URLSearchParams({ article: slug });
  return "/blog?" + params.toString();
}

function reduceMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function ArticleReader({
  article,
  onClose,
  onRelated,
  titleRef
}: {
  article: BlogArticle;
  onClose: () => void;
  onRelated: (slug: string) => void;
  titleRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const bodyRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const [copyStatus, setCopyStatus] = useState("");

  useEffect(() => {
    const calculate = () => {
      const body = bodyRef.current;
      if (!body) return;
      const rect = body.getBoundingClientRect();
      const available = Math.max(1, rect.height - window.innerHeight);
      const value = Math.max(0, Math.min(100, Math.round((-rect.top / available) * 100)));
      setProgress(value);
    };
    calculate();
    window.addEventListener("scroll", calculate, { passive: true });
    window.addEventListener("resize", calculate);
    return () => {
      window.removeEventListener("scroll", calculate);
      window.removeEventListener("resize", calculate);
    };
  }, [article.slug]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(new URL(articleUrl(article.slug), window.location.origin).href);
      setCopyStatus("Article link copied.");
    } catch {
      setCopyStatus("Copy the URL from the address bar.");
    }
  };

  return (
    <section className="blog-reader" id="reader" aria-label="Inline article reader" data-article-slug={article.slug}>
      <div className="blog-reader-toolbar">
        <div className="blog-reader-toolbar-left">
          <span className="eyebrow">Reading on this page</span>
          <button type="button" onClick={onClose} className="blog-back-button">
            <span aria-hidden="true">←</span> Back to articles
          </button>
        </div>
        <div className="blog-reading-meter">
          <label htmlFor="blog-reading-progress">Reading progress {progress}%</label>
          <progress id="blog-reading-progress" value={progress} max="100" />
        </div>
      </div>
      <div className="blog-reader-columns">
        <nav className="blog-reader-toc" aria-label="In this article">
          <h3>In This Article</h3>
          <ol>
            {article.sections.map((section, index) => (
              <li key={section.slug}>
                <a href={"#article-section-" + article.slug + "-" + section.slug}>
                  <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span> {section.title}
                </a>
              </li>
            ))}
          </ol>
          <button type="button" className="blog-copy-link" onClick={() => void copyLink()}>
            <Image src="/design/icons/link.svg" width={17} height={17} alt="" aria-hidden="true" />
            Copy article link
          </button>
          <span className="blog-copy-status" role="status" aria-live="polite">{copyStatus}</span>
        </nav>
        <article className="blog-article" ref={bodyRef} aria-labelledby="blog-article-title">
          <span className="blog-topic-pill">{article.category}</span>
          <h2 id="blog-article-title" tabIndex={-1} ref={titleRef}>{article.title}</h2>
          <p className="blog-article-meta">Editorial sample · {article.minutes} min read</p>
          <p className="blog-article-intro">{article.description}</p>
          <div className="blog-article-cover">
            <Image src={article.cover} alt={article.alt} width={1200} height={800} sizes="(max-width: 850px) 88vw, 680px" />
          </div>
          <p className="blog-sample-explanation">
            This original sample demonstrates the complete reading experience. It is not a published client
            case study, a performance promise or an article with verified author and publication metadata.
          </p>
          {article.sections.map((section, index) => (
            <section key={section.slug} className="blog-article-section">
              <h3 id={"article-section-" + article.slug + "-" + section.slug}>
                {index + 1}. {section.title}
              </h3>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </section>
          ))}
          <aside className="blog-article-note">
            <strong>Editorial note:</strong> Replace this example with reviewed original content and authentic
            publication metadata before treating it as a published agency article.
          </aside>
          <section className="blog-related" aria-labelledby="blog-related-title">
            <h3 id="blog-related-title">More ideas to explore</h3>
            <div className="blog-related-links">
              {getRelatedArticles(article.slug).map((related) => (
                <button type="button" key={related.slug} onClick={() => onRelated(related.slug)}>
                  <span>{related.category}</span>
                  <strong>{related.title}</strong>
                  <span aria-hidden="true">↗</span>
                </button>
              ))}
            </div>
          </section>
        </article>
      </div>
    </section>
  );
}

export function BlogExperience({ initialSlug }: { initialSlug: string | null }) {
  const [category, setCategory] = useState<BlogCategory>("All");
  const [search, setSearch] = useState("");
  const [activeSlug, setActiveSlug] = useState<string | null>(initialSlug);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const listTitleRef = useRef<HTMLHeadingElement>(null);
  const initiatorRef = useRef<HTMLButtonElement | null>(null);
  const listScrollRef = useRef(0);
  const navigationRef = useRef<"list" | "article" | null>(null);

  const filtered = articles.filter((item) => {
    if (category !== "All" && item.category !== category) return false;
    if (!search.trim()) return true;
    const query = search.toLocaleLowerCase().trim();
    return [item.title, item.category, item.excerpt, item.description]
      .join(" ").toLocaleLowerCase().includes(query);
  });
  const activeArticle = findArticle(activeSlug);

  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      const next = new URLSearchParams(window.location.search).get("article");
      const oldPosition = event.state?.blogListScroll;
      if (typeof oldPosition === "number") listScrollRef.current = oldPosition;
      navigationRef.current = next ? "article" : "list";
      setActiveSlug(next);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    const intent = navigationRef.current;
    navigationRef.current = null;
    if (!intent) return;
    const animation = window.requestAnimationFrame(() => {
      if (intent === "article") {
        titleRef.current?.focus({ preventScroll: true });
        document.getElementById("reader")?.scrollIntoView({
          behavior: reduceMotion() ? "instant" : "smooth",
          block: "start"
        });
      } else {
        window.scrollTo({ top: listScrollRef.current, behavior: "instant" });
        if (initiatorRef.current?.isConnected) initiatorRef.current.focus({ preventScroll: true });
        else listTitleRef.current?.focus({ preventScroll: true });
      }
    });
    return () => window.cancelAnimationFrame(animation);
  }, [activeSlug]);

  function openArticle(slug: string, initiator?: HTMLButtonElement) {
    if (!findArticle(slug)) return;
    if (!activeSlug) {
      listScrollRef.current = window.scrollY;
      const state = { ...(window.history.state ?? {}), blogListScroll: listScrollRef.current };
      window.history.replaceState(state, "", window.location.href);
    }
    if (initiator) initiatorRef.current = initiator;
    window.history.pushState({ blogFromList: true, blogListScroll: listScrollRef.current },
      "", articleUrl(slug));
    navigationRef.current = "article";
    setActiveSlug(slug);
  }

  function closeArticle() {
    const state = window.history.state;
    if (state?.blogFromList && typeof state.blogListScroll === "number") {
      window.history.back();
    } else {
      window.history.replaceState({ ...(state ?? {}), blogFromList: false }, "", articleUrl(null));
      navigationRef.current = "list";
      setActiveSlug(null);
    }
  }

  function resetFilters() {
    setCategory("All");
    setSearch("");
  }

  return (
    <section className="blog-browser content-shell" id="articles" aria-labelledby="blog-list-title">
      <div className="blog-filters" aria-label="Browse articles">
        <div className="blog-filter-chips" role="group" aria-label="Article categories">
          {blogCategories.map((item) => (
            <button type="button" key={item}
              className={"blog-filter-chip" + (category === item ? " is-active" : "")}
              aria-pressed={category === item}
              onClick={() => setCategory(item)}>
              {item}
            </button>
          ))}
        </div>
        <label className="blog-search-box">
          <Image src="/design/icons/search.svg" width={18} height={18} alt="" aria-hidden="true" />
          <span className="sr-only">Search articles</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search insights"
            aria-label="Search articles"
          />
        </label>
      </div>
      <div className="blog-list-heading">
        <div>
          <p className="eyebrow">Ideas worth exploring</p>
          <h2 id="blog-list-title" ref={listTitleRef} tabIndex={-1}>Featured <span className="gradient-text">Articles</span></h2>
        </div>
        <p>Choose an article. Read the full content right here.</p>
      </div>
      <p className="blog-count" role="status" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "article" : "articles"} found
      </p>
      {filtered.length > 0 ? (
        <div className="blog-article-grid">
          {filtered.map((item) => (
            <button
              className={"blog-card" + (activeSlug === item.slug ? " is-selected" : "")}
              type="button"
              key={item.slug}
              aria-controls="reader"
              aria-expanded={activeSlug === item.slug}
              onClick={(event) => openArticle(item.slug, event.currentTarget)}
            >
              <div className="blog-card-image">
                <Image src={item.artwork} alt={item.alt} width={640} height={427}
                  sizes="(max-width: 639px) 90vw, (max-width: 1099px) 43vw, 24vw" />
              </div>
              <div className="blog-card-body">
                <span className="blog-topic-pill">{item.category}</span>
                <h3>{item.title}</h3>
                <p>{item.excerpt}</p>
                <div className="blog-card-footer">
                  <span>Editorial sample · {item.minutes} min read</span>
                  <span className="blog-text-link">Read on this page <span aria-hidden="true">↓</span></span>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="blog-empty" role="status">
          <Image src="/design/icons/empty.svg" alt="" width={46} height={46} />
          <h3>No matching articles</h3>
          <p>Try a different topic or clear your search.</p>
          <button type="button" className="blog-outline-action" onClick={resetFilters}>Clear filters</button>
        </div>
      )}
      {activeArticle ? (
        <ArticleReader key={activeArticle.slug} article={activeArticle} onClose={closeArticle}
          onRelated={(slug) => openArticle(slug)} titleRef={titleRef} />
      ) : activeSlug ? (
        <section className="blog-unavailable" id="reader" role="status" aria-labelledby="article-unavailable">
          <h2 id="article-unavailable">Article unavailable</h2>
          <p>That article has not been published or is not part of this editorial sample collection.</p>
          <button type="button" className="blog-outline-action" onClick={closeArticle}>Back to articles</button>
        </section>
      ) : (
        <div id="reader" className="blog-reader-placeholder" aria-hidden="true" />
      )}
    </section>
  );
}
