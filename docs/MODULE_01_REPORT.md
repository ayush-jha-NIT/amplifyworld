# Module 1 — Application foundation report

## Scope and implementation

- pnpm workspace with `apps/web`, `apps/api`, and `packages/shared`.
- Next.js App Router / React / TypeScript web starter with the five approved routes, central navigation and honest placeholder content.
- Express / TypeScript API with `GET /health`, conservative JSON payload limits, 404 handling, configurable CORS, and graceful process shutdown.
- Shared branded service categories and typed API response.
- Node 22 baseline, environment templates, configuration and GitHub Actions CI (install/build/typecheck/lint/test).
- Basic API and route-contract tests.
- No secrets, fake business phone numbers or fabricated client results included.

## Development

Install Node.js 22 and pnpm 10.13.1. From repository root:

```sh
corepack enable
pnpm install --no-frozen-lockfile
pnpm dev
```

Web: http://localhost:3000

API: http://localhost:4000/health

The workspaces must be built in dependency order with `pnpm build`. A standard clean-build validation is `pnpm check`; CI runs build, typecheck, lint and tests individually.

## Boundaries

This module deliberately contains only a usable application scaffold and simple placeholder visual layout. The approved original brand graphics, advanced global navbar, animated globe/mountain scene and design system belong to Modules 2–5. The DB, inquiry forms and Resend are Modules 11–13.

## Acceptance evidence

This document describes intended acceptance checks, **not evidence that GitHub CI has passed**. Consult the GitHub Actions run for the corresponding PR/commit and fix failures before marking the module accepted.

- [ ] Clean pnpm install
- [ ] Shared package build
- [ ] Next.js production build
- [ ] Express TypeScript build
- [ ] Lint/typecheck
- [ ] API and workspace tests

## Next

Merge Modules 2–3 isolated design production kit after acceptance; integrate it with this application in Module 4.
