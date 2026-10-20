# Architecture — AmplifyWorld

## Workspace shape (planned for Module 1)

```text
amplifyworld/
  apps/
    web/             # Next.js App Router / TypeScript
      app/
      components/
      features/
      public/
    api/             # Express / TypeScript
      src/
        routes/
        middleware/
        services/
        db/
  packages/
    shared/          # Shared contracts and schemas
  docs/
  pnpm-workspace.yaml
```

## Runtime

- **Web (Vercel):** server-rendered marketing content, interactive UI and safe calls to the API. Next.js image optimization and metadata.
- **API (Render):** Express endpoints for blog, portfolio and inquiries, authorization for admin operations.
- **Database (Neon PostgreSQL):** Prisma models and migrations for users, projects, categories, posts, inquiries and future business content.
- **Email (Resend):** server-only transactional inquiry notification.
- **Animation:** client-only Three.js scene loaded lazily. GSAP for milestone choreography and route/section motion. Responsive fallbacks on WebGL/motion-disabled devices.

## Public HTTP API (provisional)

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | Runtime liveness (no sensitive metadata) |
| GET | `/api/v1/projects` | Published portfolio items |
| GET | `/api/v1/posts` | Published blogs |
| POST | `/api/v1/inquiries` | Validated business inquiry |

Protected admin routes (implemented in M14) will have role-checked create, update, unpublish and deletion operations. Public content models should include slug, status, metadata, timestamps, and normalized taxonomy. Avoid storing social media credentials in this public website.

## Database concepts

Module 11 implements these concepts in `apps/api/prisma/schema.prisma`, with
versioned SQL migrations (including CHECK constraints and timestamp triggers)
and a lazy Prisma 7 PostgreSQL client in `apps/api/src/db`. See
[DATABASE.md](DATABASE.md) for the exact model contract, role grants, Neon
bootstrap, migration/recovery workflow and isolated database tests. This is a
storage foundation; no public API route or web fixture has been connected yet.

- **Project:** slug, name, description, services/categories, media, published flag, case-study content. Claim metrics may be published only after verification.
- **Post:** slug, title, excerpt, body, cover image, category, author, timestamps, status, SEO metadata.
- **Inquiry:** contact identity, company, requested services, message, creation timestamp, notification status.
- **AdminUser:** authentication identity, hashed credential (if passwords used), role, audit timestamps.

## Security baseline

- Never commit `DATABASE_URL`, `RESEND_API_KEY`, app secrets or production keys.
- Validate all API payloads; protect against XSS, CSRF where relevant, and injection. Prisma must still be used safely.
- Rate-limit inquiry and authentication endpoints; add spam controls.
- Use correct CORS origins, secure cookies/token lifetimes, server-only admin credentials, and least-privilege authorization.
- Respect privacy and retention requirements for collected leads.
- Sanitize externally editable blog content.
- Protect admin routes by authentication **and** authorization, not obscurity.

## Env names (documentation only)

```dotenv
# API
DATABASE_URL=
# Direct schema-owner URL for a separate migration job only:
DIRECT_URL=
# Separate disposable local database for migration authoring only:
SHADOW_DATABASE_URL=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
INQUIRY_NOTIFY_EMAIL=
CLIENT_ORIGIN=
PORT=

# Web - only non-secret values
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_WHATSAPP_NUMBER=
```

Populate verified values during deployment; `NEXT_PUBLIC_WHATSAPP_NUMBER` is a public business contact and must not be hardcoded to a fake value.

## Deployment and observability

- Vercel: frontend `apps/web`, Next.js build.
- Render: backend `apps/api`, persistent API with `/health`.
- Neon: hosted PostgreSQL with migration strategy appropriate to production.
- Resend: verified sender domain, configured notification recipient.
- Logs should avoid leaking credentials and personal contact content.
