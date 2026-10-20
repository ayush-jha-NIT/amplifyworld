# Module 16: Cross-device visual, accessibility and interaction QA

## Scope

This module extends the **production Next.js web app** Playwright suite beyond the original Contact and unconfigured admin smoke checks. The original Module 2 design catalogue was independently reviewed at five reference widths; its pixel images are design goals, not executable golden snapshots of the later integrated app. **No claim of pixel identity, complete WCAG compliance, or actual real-device QA is made here.**

### Automated viewport matrix

- Production server `next start` built in CI, Chromium browser with `prefers-reduced-motion: reduce`.
- Widths **320, 375, 390, 768, 1024, 1440 px**, 900px viewport height.
- Routes **Home**, **About**, **Portfolio**, **Blog**, **Blog inline article**, **Contact**, **unconfigured Admin**: 42 independent visual/layout captures.
- Each capture checks 200 response, visible single `main h1`, footer, no HTML/body/main horizontal overflow, content-shell in viewport, no broken first-viewport images and no uncaught JavaScript errors.
- All captures write full-page PNGs plus JSON geometry measurements to the test result directory, automatically uploaded from GitHub Actions and retained for 14 days. **Actual visual reference comparison requires a human to inspect these artifacts against `design-assets/previews` and `docs/design/PAGE_DESIGN_SPEC.md`.**

### Accessibility and interaction coverage

- Automated axe-core scans on seven routes at **390 and 1440 px**; failures list rule IDs, severity and element targets.
- Mobile menu open, Escape focus restoration and route navigation.
- Portfolio arrow-key carousel, real native detail modal, Escape, focus return, filtering, empty state and reset.
- Inline Blog query navigation, deep link, reading region, article TOC, browser Back/Forward, unavailable article, search and clear.
- Skip link and reduced-motion Home: confirm still fallback, no WebGL canvas when motion is reduced, no spinning controls.
- Contact form validation, conservative no-delivery message without configured API, input preservation and no network POST.
- Contact reflow at CSS viewport widths **320 and 720 px**, equivalent to 200% browser zoom from 640 and 1440 physical CSS pixels. Chromium headless does not provide a reliable native zoom API; this is a layout reflow approximation, **not equivalent to real OS/browser zoom, screen-reader testing, or cross-engine coverage**.
- Existing browser suite also covers Contact at six widths, admin noindex, preview SEO, 404, no-JavaScript form safety and browser keyboard requirements.

### Capture and review workflow

1. Find the latest successful [Actions > CI](https://github.com/ayush-jha-NIT/amplifyworld/actions/workflows/ci.yml) run for the exact commit.
2. Download `module-16-cross-device-evidence` and inspect `matrix-*` case folders containing route/viewport PNG + JSON measurements. Contact captures and Playwright HTML report are included.
3. Compare the 1440 / 1024 / 768 / 390 / 375 visual states to the corresponding approved design catalogue references, noting deliberate changes already approved (no fake partners, stats or client campaigns).
4. Inspect typography, brand artwork, whitespace, clip edges, controls and readability; sign off any discrepancies in a review record. CI verifies layout geometry and browser automation, **not human visual taste**.
5. Re-run QA at the actual Vercel origin and on at least one real iOS Safari and Android Chrome device after Module 17 deployment, with real OIDC/Neon/Resend test accounts. No live credentials are supplied to this module's CI.

### Security and operational notes

CI uses unconfigured contact/email/admin, so it **cannot confirm** live Resend mail delivery, production Neon migrations, CMS OIDC authorization in a real provider, or WebGL under actual handset GPU drivers. These are release gates for Modules 17–18.

No third-party analytics, invented business identity, fake page URLs or approval data are introduced.

### CI acceptance

The feature branch must pass frozen dependency install, shared/API/web builds, Prisma validation, TypeScript, lint, Node unit tests, isolated PostgreSQL migrations and integration tests, and the full Chromium browser suite. The final merged `main` SHA must also be green. The corresponding run IDs and discovered fixes will be recorded once validated.
