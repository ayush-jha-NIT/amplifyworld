# Module 15: SEO/GEO, accessibility and performance tuning

## Goals and decisions

- Build accurate crawlable metadata only for verified, approved pages. No invented rankings, reviews, address, organization identifiers, authors or publication dates.
- Guard the production canonical origin with NEXT_PUBLIC_SITE_URL (absolute HTTPS root URL) and SITE_INDEXING_ENABLED=true, disallowing Vercel preview/development.
- Until BOTH are set, the site sends noindex and nofollow metadata; /robots.txt disallows all; /sitemap.xml advertises no URLs and structured marketing JSON-LD is omitted.
- Once verified and enabled, /, /about, and /contact have canonical absolute links, route-specific titles/descriptions, Open Graph/Twitter metadata, and an explicit sitemap.
- /admin, /portfolio, /blog and same-page /blog?article=slug demonstration remain noindex. Do not mark editorial samples as BlogPosting or create counterfeit project Review or Organization rating snippets.
- Structured data: Organization and WebSite identities on home, WebPage on home/about/contact. First-party URL/logo only; no unverifiable claims. JSON is escaped for HTML parsing.
- Original Earth illustration reused as a social sharing image; no new stock content, external trackers or heavy analytics.

## Accessibility

- Existing landmarks/headings, labels, real contact validation, meaningful image alt, keyboard navigation and skip link preserved.
- Added focused outline for links and controls, Windows forced-colors focus visibility, meaningful 404 message and noindex.
- Corrected SectionReveal GSAP/IntersectionObserver cleanup: old context callbacks did not guarantee observer or matchMedia disposal; cleanup now happens directly and honors reduced-motion changes.
- Chromium checks for preview robots, noindex/canonicals, semantic headings, keyboard skip link, 404 and axe checks on approved marketing pages.

## Performance

- Portfolio decorative background frames are lazy-loaded; only foreground art is priority.
- WebGL/R3F remains dynamically imported with existing reduced-motion, save-data and viewport-pausing fallbacks; no homepage visual restructuring.
- Existing Next.js local font swap, original optimized artwork and dynamic import boundaries are retained.
- No fabricated Lighthouse score or Core Web Vitals. Real LCP, INP and CLS field measurements must be taken after actual deployment. Module 16 performs cross-device regression QA.

## Operator-only release gates

1. Deploy to your verified official HTTPS production domain; set NEXT_PUBLIC_SITE_URL=https://YOUR_VERIFIED_DOMAIN/ and SITE_INDEXING_ENABLED=true only on that production deployment.
2. Keep preview or development deployments unindexed; never copy production indexing flags blindly into previews.
3. Approve the real /about and /contact descriptions. Replace disclosed sample Blog and Portfolio content with real reviewed CMS publications in the later rollout, then separately enable their indexing and sitemap URLs.
4. Review search console property ownership, robots/sitemap, structured data and canonical results on live production. Check with external validation tools after DNS works.
5. Measure mobile CWV via Lighthouse and real-user diagnostics; compare before/after under equivalent device/network conditions.

## Verification

CI must pass frozen install, Next/API production builds, Prisma schema, TypeScript, lint, unit tests, PostgreSQL integration and Chromium browser/accessibility checks. Final merge commit and CI evidence will be recorded after verification.

Modules 16–18 remain: cross-device audit, verified deployment and final handover.