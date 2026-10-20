# Module 9 — Inline Blog and Editorial Reading Experience

The Next.js route \`/blog\` replaces the original placeholder. **The entire article is read on the same route** via \`/blog?article=<slug>\`.

## Implemented

- Premium split-hero Blog page with the design-kit editorial search and AI artwork, original typography and violet-dark palette.
- Four editorial samples: **SEO & GEO**, **Agentic AI**, **Strategy**, and **Social Media**. The examples are full, original multi-section articles, not fake client stories; no invented authors, dates, endorsements, performance figures or publication claims.
- Five topic filter options, instant text search, visible result count, selected article marker and clear-filters empty state.
- Accessible clickable article cards, editorial sample badges, reading-time estimates, and responsive four-card grid.
- Full inline article reader under the list, with semantic article sections/headings/paragraphs, cover illustration, table of contents, reading progress, copy-link feedback and related-article navigation.
- Direct links \`/blog?article=search\`, \`...=ai\`, \`...=strategy\` and \`...=social\` are **rendered with their complete text in the initial server output** through the Next.js Server Component route, which passes the requested slug to the client reading experience.
- Browser History API navigation updates \`?article=\` without leaving \`/blog\`; Back/Forward restores reader state, title focus, and the previously saved list scroll position where available. The reader does not trap focus, lock the page or open a modal.
- Unknown or unavailable article slugs show a dedicated honest unavailable state with a return control.
- Sticky-offset TOC navigation, responsive reading layout (220px TOC + 68ch content on desktop, stacked TOC on tablet/phone), progress measurement and reduced-motion-safe reader transitions.
- Blog route loading skeleton, accessible status updates, hero/footer WhatsApp integration with verified-number gating.
- Sample pages are deliberately marked \`noindex\` while sample fixture content is used. Remove or revise robots policy once real editorial material is approved and publishes through Module 14.
- The content is strictly typed and rendered as React text nodes. No raw HTML injection, unsafe \`dangerouslySetInnerHTML\`, CMS content or database writes were introduced.

## Assets

The original \`design-assets/exports/artwork/editorial-{search,ai,strategy,social}-{1200,640}.webp\` files are reused unchanged under \`apps/web/public/design/artwork/\`. Existing first-party search, empty and link SVG icons are reused.

## Checks and limitations

CI must pass: workspace install, production builds, TypeScript, lint and tests. Module 9 adds source-contract tests covering the same-route reader, history, data/semantic structure and asset availability.

The static content and accessibility behavior require additional manual browser verification, screen-reader QA, responsive screenshots and performance checks in Module 16. **This module does not imply that a real editorial CMS, database, admin panel or live published article exists.**

## Next

Module 10: Contact frontend; Modules 11–14: persistence, API, Resend and secure admin CMS.
