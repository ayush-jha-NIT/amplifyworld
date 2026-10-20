# AmplifyWorld — Modules 0–18 Roadmap

**Rule:** Progress sequentially. Do not mark a module complete until its acceptance gates pass. Preserve work already committed.

| Module | Deliverable | Required acceptance |
| --- | --- | --- |
| 0 | Requirements, design, architecture, asset inventory | Reviewed project specification in GitHub |
| 1 | pnpm monorepo, Next.js + Express TypeScript starter, CI | Web/API boot, lint and typecheck, clean builds |
| 2 | Brand design system, reusable layout and components | Tokens, responsive navbar/footer, accessibility basics |
| 3 | Asset production pipeline and optimized originals | Approved brand graphics, custom scene layers, asset attribution |
| 4 | Global navigation, layout transitions and WhatsApp CTAs | No broken links; responsive and reduced motion |
| 5 | Cinematic home hero with mountain-road milestones and Earth | Correct reveal order, performant continuously rotating globe |
| 6 | Remaining homepage sections and transitions | Faithful services, portfolio preview, process and CTA |
| 7 | Clean animated About page | Accurate copy, responsive and uncluttered |
| 8 | Animated Portfolio + detail interactions | Working filters, carousel, project views and fallbacks |
| 9 | Blog with same-page full-article reader | Search, category filters, TOC, progress, accessible articles |
| 10 | Contact frontend and WhatsApp integration | Validation, success/error, verified destinations |
| 11 | Neon Postgres + Prisma schema/migrations | Reproducible schema and secret management |
| 12 | Express API implementation | Validated public read and inquiry endpoints |
| 13 | Resend email and inquiry anti-abuse | Reliable server-side notification flow and safe errors |
| 14 | Authenticated content administration | Authorization, CRUD, drafts/publishing, audit gates |
| 15 | SEO/GEO, accessibility and performance tuning | Metadata, semantic content, structured data, sitemap, CWV checks |
| 16 | Cross-device visual, interaction and regression QA | Screenshot comparison, test suite and responsive validation |
| 17 | Vercel + Render + Neon + Resend deployment | Health checks, env validation, successful production flows |
| 18 | Production audit, docs and handover | Final QA, operating manual, rollback checklist |

## Dependencies

**Modules 0–14 are merged and CI-verified. Module 15 is in acceptance review; Modules 16–18 remain.** Module 11 provides the tested PostgreSQL/Prisma migration and database foundation. Module 12 adds published-content read APIs and idempotent, durable inquiry submission. Collection remains disabled until a real migrated Neon database and reviewed privacy/retention configuration are supplied. Module 13 adds an opt-in server-side Resend notification queue, durable retries, shared PostgreSQL rate guard and retention cleanup; production activation requires real operator configuration. [Module 11](MODULE_11_REPORT.md) · [Module 12](MODULE_12_REPORT.md) · [Module 13](MODULE_13_REPORT.md) · [Database guide](DATABASE.md).

- M1 supplies web/API build foundation.
- M2–M4 establish the reusable visual language and assets.
- M5–M10 build the public experience with initially typed fixture data.
- M11–M14 connect real storage, email and secure editing.
- M15–M18 optimize, verify, deploy and document.

## Completion report format

Each module must record: changed files, functionality delivered, test/build status, screenshots or design comparison evidence, any deviations, pending business data, and Git commit SHA. Do not claim a deployment or green CI without actual tool confirmation.
