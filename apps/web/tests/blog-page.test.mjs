import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (name) => readFileSync(new URL(name, root), "utf8");

test("blog uses Next.js server searchParams, same-route article query and honest metadata", () => {
  const page = read("app/blog/page.tsx");
  for (const token of [
    "searchParams: Promise", "await searchParams", "generateMetadata",
    "findArticle(slug)", "<BlogExperience initialSlug={slug} />",
    'index: false', 'src="/design/artwork/editorial-search-1200.webp"'
  ]) assert.ok(page.includes(token), token);
  assert.ok(!page.includes("PageFrame"));
  assert.ok(!page.includes('href="/blog/'));
});

test("blog has all required categories, explicit samples and original article section copy", () => {
  const data = read("components/blog/blog-data.ts");
  for (const token of ['"SEO & GEO"', '"Agentic AI"', '"Strategy"', '"Social Media"',
    'slug: "search"', 'slug: "ai"', 'slug: "strategy"', 'slug: "social"',
    "Editorial sample", "findArticle", "getRelatedArticles"]) assert.ok(data.includes(token), token);
  assert.match(data, /paragraphs: \[/);
  assert.ok(!data.includes("fake-author"));
});

test("reader is full inline semantic content with TOC, related posts, link and progress", () => {
  const body = read("components/blog/blog-experience.tsx");
  for (const token of [
    'id="reader"', "<article", "article.sections.map", "In This Article",
    "blog-reading-progress", 'value={progress}', "onRelated",
    "navigator.clipboard.writeText", "Copy article link", "aria-live", "tabIndex={-1}"
  ]) assert.ok(body.includes(token), token);
  assert.ok(!body.includes("dangerouslySetInnerHTML"));
  assert.ok(!body.includes("<dialog"));
});

test("article navigation uses URL history and handles previous list scroll and focus", () => {
  const body = read("components/blog/blog-experience.tsx");
  for (const token of [
    "history.pushState", "history.replaceState", "history.back",
    'addEventListener("popstate"', "new URLSearchParams(window.location.search)",
    "listScrollRef", "focus({ preventScroll: true })", "scrollIntoView",
    "setActiveSlug", "Article unavailable", "Clear filters"
  ]) assert.ok(body.includes(token), token);
});

test("approved editorial artwork and link icons exist in public directory", () => {
  for (const name of ["search", "ai", "strategy", "social"]) {
    for (const size of ["1200", "640"]) {
      assert.ok(existsSync(new URL("public/design/artwork/editorial-" + name + "-" + size + ".webp", root)));
    }
  }
  assert.ok(existsSync(new URL("public/design/icons/link.svg", root)));
});

test("responsive reader and explicit reduced-motion/sticky-header behavior exist", () => {
  const css = read("app/globals.css");
  for (const token of [
    ".blog-reader-columns", ".blog-reader-toc", ".blog-article-section",
    ".blog-article-grid", ".blog-empty", ".blog-unavailable",
    "scroll-margin-top", "@media (max-width: 850px)", "@media (max-width: 639px)",
    "@media (prefers-reduced-motion: reduce)"
  ]) assert.ok(css.includes(token), token);
  assert.ok(existsSync(new URL("app/blog/loading.tsx", root)));
});
