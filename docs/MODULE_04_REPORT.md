# Module 4 — Global Layout and Navigation

**Scope:** Integration of the Modules 2–3 design tokens and authentic brand assets into the **live Next.js app**. This is a shared layout integration, not the final cinematic homepage/portfolio/blog/contact experience.

## Implemented

- Actual owned logo derivative (`design/brand/logo-compact.webp`) in accessible, responsive header and footer.
- Self-hosted licensed Plus Jakarta Sans variable font and original brand colors from `design-assets/source/tokens.json`.
- Tailwind CSS v3 mapping and PostCSS pipeline; bespoke global component styles closely follow `COMPONENT_SPEC.md`.
- Sticky responsive navbar at 88px desktop, 76px tablet and 72px phone.
- Primary routes: Home, About, Services, Work, Process, Blog and Contact. Services/Process resolve to **real homepage anchors**.
- Active page indicator, mobile navigation disclosure (44px minimum), Escape-to-toggle focus restoration, closing on outside click and route change.
- Skip link, visible focus outlines, page content region and lightweight 240ms composited entrance.
- Respect `prefers-reduced-motion`; navigation remains immediately usable.
- WhatsApp CTAs: **Let's Grow** in navbar; **Talk to Amplify World** in footer. Strict international number validation; disabled honest state when unconfigured.
- Footer with actual route links and shared agency service names; custom 404 page.
- Minimal process section anchors as navigation support. Its completed visual layout is reserved for Module 6.

## Installed assets (original Git blobs reused)

- `apps/web/public/design/brand/logo-compact.webp`
- `apps/web/public/design/fonts/PlusJakartaSans-Variable.ttf` and license
- `apps/web/public/design/icons/{whatsapp,menu,close,arrow}.svg`

Full design source package remains under `design-assets/`. Use the authoritative original and manifest for future page assets.

## Configuration

Optional public build variable: `NEXT_PUBLIC_WHATSAPP_NUMBER`, in E.164 format with country code (optional leading `+`). If unset or malformed, the CTA is **disabled**, and no WhatsApp link is constructed. It does not claim a successful chat. Provide a verified number before launch. Do not embed personal or placeholder numbers.

## Testing and review

The existing repo CI validates install, Next.js/Express production builds, typecheck, lint and Node tests. Module 4 adds source-contract tests for navigation semantics, brand setup, correct anchors and WhatsApp safety.

The design kit contains isolated screenshot references at 1440/1024/768/390/375. **Live Next.js screenshot comparison and screen-reader test coverage are pending** until an app-browser QA run; do not treat asset catalogue tests as proof that the production page matches screenshots.

## Module boundaries

- **5** — Animated mountain path, ordered milestones, logo-to-rotating-Earth hero.
- **6** — Remaining full homepage visual experience.
- **7–10** — Final About, Portfolio, inline Blog and Contact implementations.
- **11–14** — Database, API, Resend and admin.

Do not describe any Module 5–10 animation or backend form submission as implemented merely because the design catalogue demonstrates it.
