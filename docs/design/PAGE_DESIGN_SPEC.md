# Responsive page design handoff

All five page designs are editable documents in `design-assets/catalogue/`. Exported previews cover 1440, 1024, 768, 390 and 375px widths. Screenshots document the final still state; they are not production page backgrounds.

## Layout measurements

| Width | Content width | Grid / gaps | Navbar | Section spacing |
|---:|---:|---|---:|---:|
| 1440 | 1320 | 12-column concept, 24px base gap | 88 | 64px block |
| 1024 | 960 | 8-column concept, 24px gap | 76 | 48px |
| 768 | 704 | 8-column concept, 24px gap | 76 | 48px |
| 390 | 350 | 4-column concept, 16–20px gap | 72 | 40px |
| 375 | 335 | 4-column concept, 16–20px gap | 72 | 40px |

Breakpoints: 640 and 1100px, with an additional 850px layout adjustment for intermediate tablets. Typography is fluid inside these ranges. Text blocks must expand with content and user font settings; fixed dimensions apply to artwork ratios and controls, not text containers.

## Home — Modules 5–6

1. Navbar.
2. Split hero: 46.7% copy / 53.3% scene. 620px minimum desktop hero; headline left, exact required copy, primary WhatsApp and See Our Work. Both available from frame zero.
3. Services: title/intro row, six cards in 3 × 2 desktop, 2 × 3 tablet, 1 × 6 mobile. Each service stays separate.
4. Growth partner: 40/60 split between positioning and a 2 × 2 benefit set.
5. Selected concept work: three independently reusable project cards, all visibly marked as examples.
6. Four-step process: Discover → Strategize → Execute → Grow.
7. Earth-horizon CTA and footer.

Hero scene uses 1000 × 800 coordinates. Artwork scales uniformly. The mountain is a transparent raster, with distant peaks and foreground SVGs, an independent path, milestone signs and the original emblem. Scene position contract is `source/scene/scene-layout.json`; road coordinates are not hidden in a flattened image.

On mobile, copy precedes the artwork. The primary CTA occupies a full row; the secondary remains visible. Scene width is 118% of the content area with controlled clipping by the hero, not horizontal page overflow. Milestones remain inside the artwork while their order is available semantically. No mobile scroll pinning. The process uses a 2 × 2 arrangement.

Reference comparison: original image's left copy/right mountain/Earth, purple hierarchy, six cards, partner block, work strip, process and horizon CTA are retained. Unverified client strip, counters and testimonials are removed. The new mountain terrain is original artwork, not a crop of the reference.

## About — Module 7

Hero: About / AmplifyWorld; modern growth partner positioning; restrained brand-over-Earth artwork. Follow with a three-part introduction/Mission/Vision section, four values, a concise growth-partner block, six-service snapshot and CTA.

At 1024/768, introduction spans the row above two Mission/Vision cards. At 390/375, all three stack. Values become 2 columns on tablet and compact single-column icon/text cards on phones. Service snapshot becomes 3 × 2 tablet and 2 × 3 mobile. No statistics strip, repeated testimonials or extra team portraits.

Only one ambient visual; entrance motion is 12px maximum. About is intentionally calmer than Home and Portfolio.

## Portfolio — Module 8

Retain split hero and overlapping project frames. Label all preview work Concept / Placeholder. Main browsing is a featured 3D-style stack, not a static grid:

- Copy 31% / stage 69% on desktop.
- Main card 79% stage width; next at +23%, scale .90, rotateY(-24°); third at +39%, scale .80, rotateY(-30°).
- Main card z=4; adjacent z=3/2. Perspective 1300px.
- Previous/next 46px; discrete indicators; no autoplay.
- Category filters, search, selected-item count and thumbnail rail.
- Project details open in a native modal with keyboard escape, title, concept image, scope and clear sample status.

At ≤850px, selected project copy stacks above the carousel; on phones, the active card is 88% stage width and side cards are partly visible. Touch threshold 60px; buttons remain usable. The mini rail becomes compact image/text rows on phones. Filter chips wrap instead of forcing horizontal page scroll.

States: active, entering, exiting (see playbook), filtered selection, no results, loading skeleton, missing media and unavailable real-client content. The catalogue implements active/navigation/filter/empty/detail states; the component catalogue shows loading.

No fake live preview links, invented brands or results. Replacement media should use the 1200 × 800 project template and preserve the Concept badge until reviewed real content is available.

## Blog — Module 9

Split hero with original editorial artwork. Filters/search → four featured cards → inline article reader → related-topic links → CTA/footer. A card always opens its complete sample article on `blog.html?article=<id>` in the prototype; production equivalent `/blog?article=<slug>`.

Reader dimensions: 220px TOC + 40px gap + reading column capped at 68ch, within a 32px-inset panel. At 1024, TOC 175px / 24px gap. At ≤850, TOC becomes an in-flow block above the article. Body 18px desktop / 17px phone with 1.8 line height. Article title 34px desktop, 27–28px phone/tablet. Heading scroll targets clear the navbar if sticky.

Opening: remember list scroll and initiating card, push query state, reveal reader, focus its heading, scroll it into view. Back closes/restores listing; Forward reopens. Direct links render the reader without requiring an earlier card click. Unknown slug should show an honest unavailable state in production. The current catalogue only resolves known sample slugs.

TOC anchors, reading progress, copy-link control and related articles are included. Article text is semantic HTML, not drawn into an image. Copy is original sample content; no fictitious author, avatar, publication date or client result is supplied. Production Next.js must render the selected article server-side from the query, sanitize CMS HTML and preserve the same-route reading contract.

## Contact — Module 10

Retain purple split hero with Earth/envelope artwork and the two required actions. Follow with truthful contact choices, the form/next-steps split and the final CTA. Unverified email, phone, location map, opening hours and 24-hour promise from the mockup are omitted.

Desktop form/right context split approximately 57/43. Form fields use two columns for name/email and phone/company, then full-width service, project details and submit. At 1024 fields stack within the left panel; at 768 the form becomes full width with two columns; on phones all fields stack.

Next steps: review inquiry, connect, plan a growth roadmap. These are process intentions, not a guaranteed response SLA. A review-only note records pending business information. In production, reviewed privacy language replaces the preview disclaimer.

## Known, deliberate departures from the approved screenshots

| Reference content | Final design decision | Reason |
|---|---|---|
| Pricing link | Omitted | Module 0 disallows empty/unapproved destination |
| Free strategy-call CTA | Exact required WhatsApp CTA | Current brief controls CTA copy |
| Numerical outcomes, clients, ratings | Removed; concept work clearly labelled | Not verified |
| Blog authors/dates/case claims | Original sample editorial content | No real publication metadata supplied |
| Contact map/email/phone/hours | Inquiry and pending-configuration treatment | No verified business data |
| Dense neon outlines | Restrained glow, more whitespace | User's premium/uncluttered direction |
| Photoreal client/project photos | Original abstract concept templates | No permission-cleared client media |
| Full static screen image | Real editable components and artwork layers | Required interactive implementation path |
| Original unknown typeface | Bundled Plus Jakarta Sans | Reproducible licensed substitute |

These are disclosed design decisions, not hidden fidelity defects. The package preserves composition and hierarchy while respecting factual-content constraints.
