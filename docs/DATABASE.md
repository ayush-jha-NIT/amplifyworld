# Database foundation and bootstrap

Module 11 provides a reproducible PostgreSQL schema, migrations, client and tests.
It does **not** provision Neon, enable inquiry submission, send email, authenticate
admins or replace the website's fixtures. `/health` remains a database-independent
liveness check. Public endpoints arrive in Module 12.

## Supported toolchain

Use Node **22.12+ on the 22 line, or 24+**, and **pnpm 10.13.1**. CI uses Node 22
and PostgreSQL 17. Target PostgreSQL 16 or newer; no extra extensions are needed.
`prisma`, `@prisma/client` and `@prisma/adapter-pg` are pinned together at **7.10.1**.
Prisma 7 remains supported; the registry's `latest` tag pointed to a Prisma 8
release candidate when this module was implemented. Do not upgrade these packages
independently. See [Prisma release status](https://www.prisma.io/docs/orm/release-status)
and the [PostgreSQL adapter reference](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/postgresql).

The API is a persistent Express process on Render, so it uses the standard `pg`
TCP adapter, which works with Neon and local PostgreSQL. One lazy client owns a
pool of at most five connections per API process. Allow for this across replicas.
Connections have a 15-second acquisition timeout, 30-second idle timeout,
15-second statement timeout and 20-second query timeout. Interactive transactions
have a five-second acquisition wait and ten-second duration limit. SIGINT/SIGTERM
drain HTTP requests and disconnect once, with a 15-second shutdown deadline.

## Model contract

| Entity | Invariants and intended use |
| --- | --- |
| AdminUser | Unique normalized email and provider/subject identity; disabled EDITOR by default. No seeded accounts, passwords, tokens or implied authorization. Deactivate authors instead of deleting them. |
| Category | Unique lowercase slug; shared normalized editorial taxonomy for posts and projects. Referenced categories cannot be deleted. |
| Service | The six approved IDs/names in `packages/shared`; populated by a migration and checked against that source in database tests. Runtime has read access only. |
| Post | Unique slug, author and category foreign keys, Markdown body, cover/alt pair, SEO fields. DRAFT by default. Publishing requires a timestamp, excerpt and body. |
| Project | Unique slug, description and Markdown case study, optional client/site, SEO, ordered media, category and service relations. DRAFT by default; publishing requires content, timestamp and explicit claim/permission review. |
| ProjectMedia | Ordered image/video references and alternative text; unique position within a project. Project deletion removes its media and join records. |
| Inquiry | Contact details, one optional service, status, notification bookkeeping, optional retry key/hash and retention expiry. NEW and NOT_REQUESTED by default. Email is not unique. |
| AuditEvent | Actor, action, entity type/ID and timestamp only. No PII payload or secrets. The application role can append/read, not update/delete. Actor removal preserves history. |

Records have database-generated UUIDs and millisecond UTC `timestamptz` fields.
Mutable records have `created_at` and `updated_at`; SQL triggers maintain the
latter even outside Prisma. Join rows use composite primary keys. Indexes cover
publication/category lists, project ordering, inquiry processing/notification/
retention queues, foreign keys and audit lookups.

The second migration contains CHECK constraints and timestamp triggers that
Prisma's schema language cannot express. **Migration history is authoritative**;
schema diff alone does not validate those objects. Integration tests exercise
them. Do not replace migration history with `db push`.

Module 10's `not-sure` service maps to `Inquiry.serviceId = null`. Optional blank
phone/company values must become null; email must be trimmed and lowercased.
The database enforces key contact lengths and basic syntax, but this is not the
future HTTP validation policy. Module 12 must validate and normalize requests,
require a UUID idempotency key plus SHA-256 hash of the normalized request, return
conflict if a reused key has a different hash, and acknowledge only durable
receipt. Nullable keys support controlled imports; they do not implement an
idempotent endpoint on their own.

Module 13 must implement retries, queue ownership, rate/spam controls and Resend.
SENT requires a notification timestamp; NOT_REQUESTED does not imply queuing.
Agree a retention policy before collection and set/enforce `retentionExpiresAt`.
No IP address, user agent, raw notification error or extra PII copy is stored.

Module 14 must enforce authentication **and** roles, sanitize Markdown, validate
media URLs, record audit events transactionally and require fresh editorial
review after material project edits. A stored review timestamp is not proof of
permission or metrics. Public queries must explicitly filter PUBLISHED and
`publishedAt <= now`; a status field alone does not implement access control.
The database is private to the API; there is no direct browser access or public
database credential.

## Configuration

Copy `apps/api/.env.example` to `apps/api/.env` for local development. Keep all
values private; the template deliberately contains no credentials. Root `.env`
is not used by filtered API scripts. The web app must never receive these values.

| Variable | Where used |
| --- | --- |
| `DATABASE_URL` | Runtime pooled Neon URL, using a restricted application role. Required only when code calls `getDatabase()`. |
| `DIRECT_URL` | Direct/unpooled URL using a schema-owner migration role; supplied to a controlled migration job, not the running production API. There is no runtime-URL fallback. |
| `SHADOW_DATABASE_URL` | Separate disposable local database for migration authoring only. Never a production database or the same database as DIRECT_URL. |
| `TEST_DATABASE_ADMIN_URL` | Explicit process environment for tests: the `postgres` maintenance database on an isolated loopback PostgreSQL server with CREATEDB/CREATEROLE. Never Neon. The test runner deliberately does not load `.env`. |

Get the pooled and direct URLs for the same target branch/database from the
[Neon Connect dialog](https://neon.com/docs/guides/prisma). Use the application
role for the pooled URL and the schema owner for the direct one. Percent-encode
special characters in credentials. Use `sslmode=verify-full` (preferred) or
`sslmode=require`; the supported scripts/client upgrade `require` to full
certificate and hostname verification. Remote plaintext, alternate search paths
and unsupported connection overrides are rejected. Runtime pool options are
configured in code, not unbounded URL parameters. Never disable certificate
verification to bypass a connectivity error.

Only local loopback databases may use `sslmode=disable`. All models live in
`public`. Do not log URLs, SQL parameters, inquiry bodies or raw driver errors.

## First Neon bootstrap (operator action; not yet performed)

1. Create a dedicated Neon project/database in the chosen region and a separate
   development/staging branch. Confirm ownership, restore window and backup
   policy. Start with an empty database. Existing tables require a reviewed
   baseline/migration plan; do not reset them.
2. Obtain its direct schema-owner URL and set `DIRECT_URL` privately in the
   release job. Review both committed migrations and verify the target branch.
3. Install the locked dependencies, validate, generate and apply:

   ```sh
   pnpm install --frozen-lockfile
   pnpm db:validate
   pnpm db:generate
   pnpm db:migrate:deploy
   pnpm db:migrate:status
   ```

   Before first deployment, `status` may exit nonzero because migrations are
   pending. After deployment it must report the database up to date. Deploy uses
   `prisma migrate deploy` only: no reset, push, shadow database or automatic seed.
   Do not attach this command to web builds, API startup or every API replica.
4. Using the database owner, create a dedicated application login without
   superuser, database-creation or role-creation rights. Provision its password
   privately (for example with psql's interactive `\password`), not in a migration
   or command history. Do not grant a Neon administrative role membership.
   For a chosen role named `amplifyworld_app`, apply these grants to the target
   database after migration:

   ```sql
   -- One-time, on this dedicated database only; run as the schema owner.
   CREATE ROLE amplifyworld_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE;
   REVOKE CREATE ON SCHEMA public FROM PUBLIC;
   GRANT USAGE ON SCHEMA public TO amplifyworld_app;
   GRANT SELECT, INSERT, UPDATE, DELETE ON
     admin_users, categories, posts, projects, project_categories,
     project_services, project_media, inquiries TO amplifyworld_app;
   GRANT SELECT ON services TO amplifyworld_app;
   GRANT SELECT, INSERT ON audit_events TO amplifyworld_app;
   ```

   Grant CONNECT on the selected database if its default PUBLIC CONNECT grant
   has been revoked. Never grant access to `_prisma_migrations`, schema ownership,
   or blanket default table privileges to the runtime role. Review explicit grants
   whenever a future migration adds a table. Integration tests exercise this role
   separation, including denied DDL and audit/catalog mutation.
5. Copy that role's **pooled** URL to the API's private `DATABASE_URL`. Keep the
   migration-owner credential solely in the release job. Check real TLS/network
   access with a read-only database operation in staging. `/health` is liveness,
   not evidence that the database is reachable or migrations are applied.
6. Keep Contact collection disabled. Finish Modules 12–14 integration and
   Module 17 deployment verification before claiming live delivery.

No production URL, password, email key or fake admin is provided by this module.

## Development migrations and recovery

Builds, lint, typecheck, ordinary tests, schema validation and client generation
all run without database credentials:

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm db:validate
```

For schema changes, create **two separate disposable local databases**. Set the
direct and shadow URLs in the API environment, edit `schema.prisma`, then run:

```sh
pnpm db:migrate:dev --name describe_change
```

The wrapper restricts authoring to loopback databases outside production and
uses `migrate dev --create-only`. Prisma may apply earlier pending migrations and
offer a reset on drift; stop and investigate before agreeing to any reset. Review
the generated SQL, explicitly preserve CHECK constraints/triggers, add custom SQL
as needed, then test it on a fresh temporary database before applying it to a
development Neon branch with `db:migrate:deploy`. Do not edit already applied
migrations or run `migrate dev` against Neon production.

Use one controlled release job per database. Run migrations before application
code that depends on them; use additive/compatible changes for rolling releases.
The initial two migrations are transactional. A failed migration blocks the next
deploy: inspect the target and `_prisma_migrations` privately, restore from a
verified backup/branch or prepare a forward repair, and use Prisma's `migrate
resolve` only after confirming actual database state. Never automatically mark a
failed migration applied, reset a shared database, or roll back by deleting
tables. Revert application code separately when appropriate.

## Real database tests

On an isolated local PostgreSQL 16+ test server, export
`TEST_DATABASE_ADMIN_URL` for its `postgres` maintenance database, then run:

```sh
pnpm --filter @amplifyworld/shared build
pnpm test:database
```

The runner creates a unique `amplifyworld_test_<uuid>` database and restricted
`amplifyworld_app_<uuid>` login, generates a random password in memory, applies
both migrations twice, checks status and Prisma schema drift, runs the database
contracts, and drops only its generated database/role in `finally`. It never
uses `DATABASE_URL` as a fallback or accepts a remote host. Abrupt process
termination can leave test objects behind; use a disposable server and remove
only the specific generated test objects after confirming ownership.

GitHub CI starts a fresh PostgreSQL 17 service and supplies only its locally
provisioned test credentials. It requires **no Neon secrets**. A separate job
runs all builds, schema validation, lint, type checks, unit/component tests and
the existing nine Contact/browser regressions without any database URL.
