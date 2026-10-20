# Module 11 — Neon PostgreSQL and Prisma foundation

## Baseline and scope

Started from `main` at
[`7dfc6c2bfd86c70f541afb435ced48a9c83dcf97`](https://github.com/ayush-jha-NIT/amplifyworld/commit/7dfc6c2bfd86c70f541afb435ced48a9c83dcf97),
the merged Module 10 baseline. Inspected `docs/ROADMAP.md`, `ARCHITECTURE.md`,
`MODULE_10_REPORT.md`, the Express application/tests, shared service taxonomy,
workspace scripts, environment templates and CI.

Module 11 supplies storage contracts and tooling only. The API still has
`GET /health` and its existing 404 behavior. Contact still validates locally,
does not submit or persist, and cannot claim receipt. Website content remains
the existing typed fixtures. No Neon resource, live database deployment,
credential, admin account or email delivery is claimed.

## Delivered

- Pinned supported Prisma **7.10.1** CLI, client and PostgreSQL adapter, with
  `pg` **8.23.1** and the locked workspace dependency graph. Prisma 8 was a release
  candidate at implementation time. The minimum Node 22 version is now 22.12.
- Ten normalized models: admin users, categories, services, posts, projects,
  project/category and project/service relations, project media, inquiries and
  audit events. UUIDs, timezone-aware timestamps, explicit deletion rules,
  publication/queue/foreign-key indexes and bounded contact/metadata fields.
- Draft content, disabled EDITOR accounts, NEW inquiries and NOT_REQUESTED
  notifications by default. No automatic submission, publishing or admin access.
  Unique slugs and external identities, normalized emails, publication gates,
  notification/retention invariants and paired unique retry key/request hash.
- Two atomic PostgreSQL migrations: schema/indexes/relations, then database
  CHECK constraints, timestamp triggers and exactly the six approved service
  records. No sample business data, users, fabricated metrics or secrets.
- Lazy process-wide client with a bounded pool, verified remote TLS, finite
  connection/query/transaction timeouts and orderly shutdown. No SQL/PII logging.
  The migration role is separate from the runtime role.
- Explicit generate/validate/deploy/status/authoring scripts. Offline checks need
  no credentials; migrations require a direct URL with no runtime-URL fallback.
  Development authoring is restricted to separate disposable local databases.
  No deployment is hidden in install, build, startup or CI.
- Integration runner creates/drops only its unique local test database/role.
  It applies migrations twice, checks status and Prisma drift, and exercises
  Prisma/database contracts as a restricted application user.
- CI retains the complete existing validation/browser suite and adds PostgreSQL
  17 service-based migration/contract tests without Neon credentials.
- Blank API environment templates and [DATABASE.md](DATABASE.md) covering
  first Neon bootstrap, private configuration, least-privilege grants,
  idempotency/notification handoff, migration review and recovery.

## Changed files

- `apps/api/prisma/schema.prisma`, `prisma/migrations/**`, `prisma.config.ts`.
- `apps/api/src/db/**`, `src/server.ts`, `src/app.test.ts`.
- `apps/api/scripts/**`, `tests/database.integration.ts`, `tsconfig.check.json`,
  package scripts, lint exclusions and API environment template.
- Root scripts/Node requirement, lockfile, workspace build allowlist,
  `.gitignore`, `.env.example`, `.github/workflows/ci.yml`.
- README, architecture, roadmap, database guide and this report.

`packages/shared` contracts and all web application source/assets are unchanged.
The database service catalog is tested against the shared source instead of
introducing Prisma types into browser/shared code.

## Validation evidence

Local checks on 20 October 2026, Windows, Node 24.16.0 and pnpm 10.13.1:

| Check | Result |
| --- | --- |
| Locked install | Passed with `pnpm install --frozen-lockfile` |
| Schema validation and client generation | Passed with no database URLs |
| `pnpm build` | Shared, API and Next.js production builds passed |
| `pnpm typecheck` | All workspaces plus database scripts/tests/config passed |
| `pnpm lint` | Passed with no ESLint errors or warnings |
| `pnpm test` | 51 passed: 41 web, 9 API/database configuration/lifecycle, 1 shared |
| Browser regression | All 9 Chromium tests passed, including accessibility, responsive layouts, no submission and existing routes |
| Real PostgreSQL migration/contract tests | Pending GitHub CI; no local PostgreSQL/Docker is installed |

The six configuration/lifecycle tests cover secret-safe failures, TLS and option
validation, direct-URL requirements, protected authoring targets, lazy reuse,
single disconnect, retry after construction failure and shutdown failure.
The added API regression checks that all provisional public routes remain 404.

The twelve database integration tests cover reference data, defaults, UUIDs,
timestamps, uniqueness, publication/claim review gates, contact constraints,
notification state, retention, concurrent retry keys, foreign keys/deletion
policy, ordered media, transaction rollback, SQL timestamp triggers, query
indexes and runtime permission denials.

Repository PR, implementation commit and green CI evidence will be recorded
after the corresponding checks complete. Module acceptance remains pending
those checks.

## Decisions and remaining integration

Use an external provider/subject identity for future authentication; no password
system is introduced prematurely. A single nullable inquiry service follows the
current Module 10 form; multiple project services use a normalized join.
Audit records contain identifiers/action names rather than personal payloads.
Markdown and URL sanitization, authorized publishing/review invalidation, HTTP
validation, retry conflict semantics, retention enforcement, notification workers
and authorization remain the corresponding Modules 12–14 responsibilities.

This module has no visual changes; existing Module 10 browser regressions are
the relevant preservation checks, and no new design comparison is necessary.
PostgreSQL integration proves the schema/client, not Neon network access or TLS
against the eventual deployment. The owner still needs a Neon project/branch,
verified region and backup policy, separate private migration/runtime URLs,
restricted role grants and an intentional migration deployment following
[DATABASE.md](DATABASE.md). Modules 12–18 remain.
