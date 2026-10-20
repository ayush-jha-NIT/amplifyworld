# AmplifyWorld

**We Amplify Your Business Growth.**

AmplifyWorld helps businesses grow through strategic marketing, technology, branding, web development, SEO, GEO and AI automation. This repository is the planned production website for the agency.

> **Development status:** **Modules 0–5 implemented and merged into `main`**: specification, Next.js/Express monorepo, design system, original visual assets, responsive shared layout and the cinematic animated mountain-to-3D-Earth homepage hero. **Modules 6–18 remain.** Other homepage sections and page-specific experiences await their designated modules.

## Approved experience

- **Homepage**: cinematic black/violet hero with a glowing mountain road, sequential **Strategy → Marketing → Technology → Scalable Growth** milestones, an animated AmplifyWorld mark whose arrow points toward a continuously revolving Earth, service cards and featured projects.
- **About**: uncluttered brand story, mission, vision, values and differentiators.
- **Portfolio**: animated project carousel, category filters, interactive previews and detail views. Show only authorized projects and substantiated metrics.
- **Blog**: articles, topic filters, search and **full inline article reading on the blog page**, not redirecting users to separate pages.
- **Contact**: inquiry form with server validation, Resend email notifications and direct WhatsApp contact.

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

Use Node.js 22 and pnpm 10.13.1. From the repository root:

```sh
corepack enable
pnpm install --no-frozen-lockfile
pnpm dev
```

The frontend with integrated Module 5 cinematic hero runs at `http://localhost:3000` and the Express health endpoint at `http://localhost:4000/health`. Run `pnpm check` for build, typecheck, lint and tests. The workspace source lives in `apps/web`, `apps/api` and `packages/shared`. Production contact/WhatsApp services will require real business details and later backend modules.

The independently reviewable design kit lives in [`design-assets/`](design-assets/README.md), with integrated developer instructions in [`docs/design/INTEGRATION_HANDOFF.md`](docs/design/INTEGRATION_HANDOFF.md). The large preview assets are not production page backgrounds.

## Project documents

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
