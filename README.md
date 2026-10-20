# AmplifyWorld

**We Amplify Your Business Growth.**

AmplifyWorld helps businesses grow through strategic marketing, technology, branding, web development, SEO, GEO and AI automation. This repository is the planned production website for the agency.

> **Development status:** **Modules 0–10 implemented**: requirements, application foundation, design assets, navigation, cinematic homepage, About, interactive Portfolio, inline Blog reader and responsive Contact frontend. **Modules 11–18 remain.** Contact validates details locally; online inquiry submission is unavailable until storage, the API and notification/anti-abuse handling are implemented in Modules 11–13. WhatsApp remains unavailable unless a verified business number is configured.

Module 11's database foundation is under acceptance review. See the
[database bootstrap guide](docs/DATABASE.md) and [Module 11 report](docs/MODULE_11_REPORT.md).
Neon has not been provisioned or deployed.

## Approved experience

- **Homepage**: cinematic black/violet hero with a glowing mountain road, sequential **Strategy → Marketing → Technology → Scalable Growth** milestones, an animated AmplifyWorld mark whose arrow points toward a continuously revolving Earth, service cards and featured projects.
- **About**: uncluttered brand story, mission, vision, values and differentiators.
- **Portfolio**: animated project carousel, category filters, interactive previews and detail views. Show only authorized projects and substantiated metrics.
- **Blog**: articles, topic filters, search and **full inline article reading on the blog page**, not redirecting users to separate pages.
- **Contact**: accessible inquiry form with local validation and honest availability messaging. Server validation, persistence and Resend notifications are pending Modules 11–13. Direct WhatsApp links require a configured, verified business number.

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

The Contact form’s **Check Inquiry** action validates in this browser only. It makes no inquiry request, saves no draft and cannot claim receipt. `NEXT_PUBLIC_API_URL` does not enable submission: only `/health` currently exists. A real inquiry adapter, server validation, storage, anti-abuse, notification handling and reviewed privacy/retention copy are required before enabling collection. Configure `NEXT_PUBLIC_WHATSAPP_NUMBER` only with an owner-verified business number in international format; formatting validation does not itself verify ownership.

The independently reviewable design kit lives in [`design-assets/`](design-assets/README.md), with integrated developer instructions in [`docs/design/INTEGRATION_HANDOFF.md`](docs/design/INTEGRATION_HANDOFF.md). The large preview assets are not production page backgrounds.

## Project documents

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
