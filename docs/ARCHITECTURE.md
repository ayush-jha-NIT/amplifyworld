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

Module 14 provides protected RS256 OIDC/JWKS content CRUD, draft editing, approvals, publishing, archiving and audit. Public content models should include slug, status, metadata, timestamps, and normalized taxonomy. Avoid storing social media credentials in this public website.

## Database concepts

Module 11 implements these concepts in `apps/api/prisma/schema.prisma`, with
versioned SQL migrations (including CHECK constraints and timestamp triggers)
and a lazy Prisma 7 PostgreSQL client in `apps/api/src/db`. See
[DATABASE.md](DATABASE.md) for the exact model contract, role grants, Neon
bootstrap, migration/recovery workflow and isolated database tests. This is a storage foundation. Module 12 now implements the public API routes and an opt-in Contact adapter; published database posts/projects do not replace the frontend's disclosed editorial/design samples until the CMS/publishing phase.

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
INQUIRY_EMAIL_ENABLED=false
RESEND_API_KEY=
RESEND_FROM_EMAIL=
INQUIRY_NOTIFY_EMAIL=
INQUIRY_NOTIFICATION_BATCH_SIZE=5
INQUIRY_ABUSE_HASH_SECRET=
INQUIRY_RETENTION_CLEANUP_ENABLED=false
ADMIN_OIDC_ISSUER=
ADMIN_OIDC_AUDIENCE=
ADMIN_OIDC_JWKS_URL=
CLIENT_ORIGIN=
PORT=

INQUIRY_COLLECTION_ENABLED=false
INQUIRY_PRIVACY_POLICY_APPROVED=false
INQUIRY_RETENTION_DAYS=
TRUST_PROXY_HOPS=0

# Web - only non-secret values
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_INQUIRIES_ENABLED=false
NEXT_PUBLIC_ADMIN_OIDC_CLIENT_ID=
NEXT_PUBLIC_ADMIN_OIDC_AUTH_URL=
NEXT_PUBLIC_ADMIN_OIDC_TOKEN_URL=
NEXT_PUBLIC_WHATSAPP_NUMBER=
```

Populate verified values during deployment; `NEXT_PUBLIC_WHATSAPP_NUMBER` is a public business contact and must not be hardcoded to a fake value.

## Deployment and observability

- Vercel: frontend `apps/web`, Next.js build.
- Render: backend `apps/api`, persistent API with `/health`.
- Neon: hosted PostgreSQL with migration strategy appropriate to production.
- Resend: verified sender domain, private notification recipient and separate scheduled dispatch worker (Module 13). A stored inquiry receipt is not proof of sent or delivered email.
- Logs should avoid leaking credentials and personal contact content.
