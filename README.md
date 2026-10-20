# AmplifyWorld

**We Amplify Your Business Growth.**

AmplifyWorld helps businesses grow through strategic marketing, technology, branding, web development, SEO, GEO and AI automation. This repository is the planned production website for the agency.

> **Development status:** **Modules 0–16 merged and CI-verified**: public experience, database, public APIs, secure inquiry receipts and the opt-in Resend notification/anti-abuse workflow. **Module 17 deployment readiness is under review; live deployment is pending. Module 18 remains.** No live Neon deployment, verified Resend sender or production message delivery is claimed.

Modules 11–13 passed PostgreSQL integration, application checks and browser regressions. The [database guide](docs/DATABASE.md) covers the operator-controlled Neon bootstrap. **No Neon instance or production deployment has been provisioned in this work.**

## Approved experience

- **Homepage**: cinematic black/violet hero with a glowing mountain road, sequential **Strategy → Marketing → Technology → Scalable Growth** milestones, an animated AmplifyWorld mark whose arrow points toward a continuously revolving Earth, service cards and featured projects.
- **About**: uncluttered brand story, mission, vision, values and differentiators.
- **Portfolio**: animated project carousel, category filters, interactive previews and detail views. Show only authorized projects and substantiated metrics.
- **Blog**: articles, topic filters, search and **full inline article reading on the blog page**, not redirecting users to separate pages.
- **Contact**: accessible inquiry form with local/server validation and a typed HTTP adapter for durable database receipts when both frontend and server are explicitly configured. Resend notifications are pending Module 13. Direct WhatsApp links require a configured, verified business number.

### Branding and contact CTAs

- Use the supplied white-to-violet/magenta AmplifyWorld logo and matching dark/purple design palette.
- Main headline: **We Amplify Your Business Growth**.
- Navbar CTA: **Let's Grow** (WhatsApp icon).
- Primary WhatsApp CTA: **Talk to Amplify World**.
- No fabricated client testimonials, performance statistics, contact numbers or addresses.

### Core services

1. Meta Ads and performance marketing
2. Google Business Profile optimization
3. Customized, growth-focused website development
4. SEO and Generative Engine Optimization (GEO)
5. Agentic AI for websites where suitable
6. End-to-end social media management: shooting, production, publishing and ongoing management

## Technical architecture

| Layer | Stack |
| --- | --- |
| Web | Next.js (App Router), TypeScript, Tailwind CSS |
| Interactive motion | GSAP/ScrollTrigger, SVG/CSS |
| 3D | Three.js with React Three Fiber |
| API | Node.js, Express, TypeScript |
| Database | Neon PostgreSQL, Prisma |
| Email | Resend |
| Workspace | pnpm monorepo |
| Deployment target | Vercel (web) + Render (API) + Neon |

No paid motion-generation platform is needed for the code-based animations. Motion must be performant on mobile and honor reduced-motion settings.

## Development quick start

Use Node.js 22.12+ (22 line) or 24+, and pnpm 10.13.1. From the repository root:

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

The frontend with homepage, About, Portfolio, inline Blog reader and Contact runs at `http://localhost:3000` and the Express health endpoint at `http://localhost:4000/health`. Run `pnpm check` for build, typecheck, lint and tests. After building, run `pnpm --filter @amplifyworld/web exec playwright install chromium` then `pnpm --filter @amplifyworld/web test:browser` for browser interaction, accessibility and responsive checks. CI runs both suites and saves browser screenshots. The workspace source lives in `apps/web`, `apps/api` and `packages/shared`.

The Contact form stays in **Check Inquiry** (local-only) mode by default. The Module 12 Express API implements `GET /api/v1/posts`, `/projects`, slug details, `/ready`, and `POST /api/v1/inquiries` with validated idempotent storage. To enable real collection, operators must first migrate a real Neon database and provide an approved privacy/retention policy, then deliberately configure `INQUIRY_COLLECTION_ENABLED=true`, `INQUIRY_PRIVACY_POLICY_APPROVED=true`, `INQUIRY_RETENTION_DAYS` (1–365), `DATABASE_URL`, `NEXT_PUBLIC_API_URL`, and `NEXT_PUBLIC_INQUIRIES_ENABLED=true`. **Receipt means stored, not emailed.** Module 13 implements an opt-in, private Resend worker, distributed rate limiting and scheduled retention cleanup, **but these do not run until configured and deployed**. Live delivery testing remains pending. Configure `NEXT_PUBLIC_WHATSAPP_NUMBER` only with a verified business number.

The independently reviewable design kit lives in [`design-assets/`](design-assets/README.md), with integrated developer instructions in [`docs/design/INTEGRATION_HANDOFF.md`](docs/design/INTEGRATION_HANDOFF.md). The large preview assets are not production page backgrounds.

## Project documents

- [Module 17 deployment preparation and operator release gates](docs/MODULE_17_REPORT.md)
- [Deployment runbook for Render, Vercel, Neon and Resend](docs/DEPLOYMENT_RUNBOOK.md)

- [Module 16 cross-device QA matrix and findings](docs/MODULE_16_REPORT.md)

- [Module 15: search visibility, GEO, accessibility and performance](docs/MODULE_15_REPORT.md)

- [Module 14 secure admin CMS report](docs/MODULE_14_REPORT.md)

- [Module 13 notification queue, Resend configuration and anti-abuse](docs/MODULE_13_REPORT.md)

- [Module 12 API, inquiry contracts and safety gates](docs/MODULE_12_REPORT.md)

- [Database setup, migrations, security and recovery](docs/DATABASE.md)
- [Module 11 database foundation and validation](docs/MODULE_11_REPORT.md)

- [Module 10 Contact implementation and validation](docs/MODULE_10_REPORT.md)

- [Module 9 Blog and inline article reader](docs/MODULE_09_REPORT.md)

- [Module 8 interactive Portfolio](docs/MODULE_08_REPORT.md)

- [Module 7 About page completion report](docs/MODULE_07_REPORT.md)
- [Module 6 full homepage report](docs/MODULE_06_REPORT.md)

- [Module 5 cinematic hero and validation](docs/MODULE_05_REPORT.md)

- [Module 4 implementation report](docs/MODULE_04_REPORT.md)
- [Modules 0–3 completion report](docs/MODULES_00_03_STATUS.md)
- [Module 1 foundation report](docs/MODULE_01_REPORT.md)

- [Module 0 specification](docs/MODULE_00_SPEC.md)
- [Development roadmap (Modules 0–18)](docs/ROADMAP.md)
- [Architecture and backend contracts](docs/ARCHITECTURE.md)
- [Design and asset production inventory](docs/DESIGN_ASSETS.md)

## Working agreement

Implement sequentially; use screenshot comparison against approved mockups to guide layout and content; treat those mockups as reference, **not** as flattened page backgrounds. Keep production secrets out of source control. Each module ends with build/test and repository review.

Project repository: [ayush-jha-NIT/amplifyworld](https://github.com/ayush-jha-NIT/amplifyworld).
