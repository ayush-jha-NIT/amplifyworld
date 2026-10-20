# Module 8: Interactive Portfolio

The production route `/portfolio` now implements the approved portfolio direction with original design-kit illustrations and no false client claims.

## Implemented

- Responsive premium split hero with genuinely independent stacked visual layers.
- Interactive 3D-style **CSS-transformed** carousel with perspective 1300px, active/next/previous depth states and a 620ms easing transition. **No autoplay.** Buttons, selection indicators, accessible keyboard left/right navigation, and mobile swipe threshold of 60px.
- Five working category chips: All, Web Development, SEO & GEO, Performance Marketing and Social Media. Social Media returns a deliberate honest empty state until there is an authorized concept or published project.
- Debounce-free immediate text search of project title, category, scope, and synopsis. Visible filtered count and reset controls.
- Miniature project-selection rail with selection state.
- Native modal detail views with title, concept artwork, objectives, scope, creative approach, backdrop click to dismiss, Escape behavior handled by the browser and keyboard focus returned to the initiating control on close.
- Route loading skeleton and artwork onError fallback.
- Discover / Strategize / Execute / Grow sequence and final WhatsApp + Contact CTA, with business-number gating unchanged.
- Reduced-motion and mobile responsive treatment preserving regular vertical scrolling and usable controls.

## Content validity

The only gallery items are **three concept templates** already in the brand kit: Website, Campaign and Local Discovery. Every item is visibly marked **Concept / Placeholder** in summary, thumbnails, expanded details, and disclosure. They are not client results, verified case studies, live websites or performance outcomes. Replace with permission-cleared, published project records when Module 14 CMS functionality becomes available. No fictitious metrics or clients.

## Responsive and performance intent

Desktop split heading (31/69-style), 3D active 79% / adjacent next +23%, scale .9 / third +39%, scale .8; tablet collapses copy above stage at 850px; phone uses 88%-wide active card and partially visible adjacent cards. Controls are at least 46px; carousel uses `touch-action: pan-y`. Layout transitions are CSS-only to avoid further dependencies and preserve layering clarity.

## Test acceptance

- GitHub Actions: pnpm install, Next.js+Express builds, TypeScript, lint, tests. Source-level tests verify filters/controls/dialog/content assets.
- Live browser screenshot fidelity, keyboard/screen reader observation, low-end mobile swipe QA and real-device GPU performance remain Module 16 audit unless separately executed.

## Boundaries

No backend database or admin logic (Modules 11–14). Blog inline article reading is Module 9. Contact form is Module 10. Deployment is Module 17.
