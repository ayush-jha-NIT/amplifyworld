# Module 17: Deployment runbook

**Status: DEPLOYMENT BLOCKED PENDING OPERATOR RESOURCES.** This is a tested deployment plan, not evidence that any production service has been provisioned. The repository deployment configuration is safe by default.

## Provider inventory checked 20 October 2026

| Provider | Observed | Required action |
| --- | --- | --- |
| GitHub | Verified source ayush-jha-NIT/amplifyworld | CI on main before deployment |
| Vercel | Only digimarket-software found | Establish a separate AmplifyWorld Vercel project, do not modify Digimarket |
| Neon | Only Digimarket-software found | Provision a dedicated AmplifyWorld Neon project, do not reuse another agency database |
| Render | Workspace named amplify's workspace discovered | Obtain explicit confirmation of workspace ID/owner before accessing or changing services |
| Resend | No sender/recipient identity or approved mail configuration provided | Do not enable notifications until sender is verified and mail destination is approved |

## 1. Operator confirmation and environment prerequisites

Identify the production DNS name, correct account/team/workspace, preferred regions, hosting budget/plan, verified email sender/recipient, legal/privacy approval, retention days and official WhatsApp number (if any). Missing items must **not** be guessed or copied from Digimarket.

Use the two manifests in this repository:
- Render: ../render.yaml for a free-plan API web service. This is health-only by default; it provisions neither a Neon database nor a cron worker.
- Vercel: ../apps/web/vercel.json for the Next.js monorepo build.

No raw API key, PostgreSQL password, real personal address, schema-owner URL or private token is committed.

## 2. Render API

Import the Render Blueprint **only after selecting the confirmed workspace**. The Git source is the verified main branch, the build is executed from the repository root, and the service uses:

- Build command: corepack enable && pnpm install --frozen-lockfile && pnpm --filter @amplifyworld/shared build && pnpm --filter @amplifyworld/api build
- Start command: node apps/api/dist/server.js
- Health path: /health
- NODE_VERSION=22 and NODE_ENV=production

Supply CLIENT_ORIGIN as the EXACT real HTTPS Vercel origin (no trailing slash). Initially keep INQUIRY_COLLECTION_ENABLED=false, INQUIRY_EMAIL_ENABLED=false, INQUIRY_RETENTION_CLEANUP_ENABLED=false and TRUST_PROXY_HOPS=0.

The health endpoint must return HTTP 200 and service amplifyworld-api. The readiness endpoint /api/v1/ready deliberately returns 503 until a migrated, reachable database is configured. HTTP 200 from /health alone **does not** mean the system is ready for inquiries.

Keep DIRECT_URL, SHADOW_DATABASE_URL and TEST_DATABASE_ADMIN_URL out of the running API environment. The server now validates production config at startup. If invalid, it refuses to start and reports only failing configuration key names.

## 3. Vercel frontend

Create a NEW Vercel project from the AmplifyWorld repo; leave the unrelated Digimarket project unchanged.

- Framework: Next.js; root directory: apps/web; production Git branch main.
- Install: pnpm install --frozen-lockfile, using pnpm monorepo auto-detection.
- Build: cd ../.. && pnpm --filter @amplifyworld/shared build && pnpm --filter @amplifyworld/web build
- Output: the default .next, not static export and not an invented directory.
- Ensure the Vercel installation has access to workspace packages; confirm in the actual build logs.
- Node line: 22 or 24 compatible with repository engines and pnpm 10.13.1.

Production environment begins with NEXT_PUBLIC_API_URL set to the verified HTTPS Render API, NEXT_PUBLIC_INQUIRIES_ENABLED=false and SITE_INDEXING_ENABLED=false. Do not set NEXT_PUBLIC_SITE_URL or enable search indexing before the real canonical domain and approved content have been checked. The Admin OIDC public client fields remain blank until an approved identity provider exists. Never put secrets in NEXT_PUBLIC variables.

Changes to NEXT_PUBLIC variables require rebuilding the frontend.

## 4. Neon separate database and controlled migrations

Provision a dedicated Neon project only after authorization. Follow DATABASE.md for restricted runtime role, direct schema-owner identity, permissions, migration history and TLS requirements.

- DATABASE_URL: secret pooled PostgreSQL URL for a restricted runtime role, using verified TLS.
- DIRECT_URL: use only within a controlled migration environment; never persist in the API web service.
- Execute pnpm db:migrate:status and pnpm db:migrate:deploy from the repository root with approved direct migration credentials.
- Verify migration status and service readiness (GET /api/v1/ready HTTP 200).
- Never run an ad-hoc db push against production; do not share tenant databases or reuse Digimarket roles.

## 5. Inquiry activation and anti-abuse

Do not enable collection until the real privacy notice and retention policy have been signed off, and both a data deletion schedule and database permissions are verified.

Server-only configuration includes:
- DATABASE_URL and CLIENT_ORIGIN, validated exact HTTPS browser origin.
- TRUST_PROXY_HOPS=1 or 2 only after reviewing the trusted Render proxy chain.
- INQUIRY_COLLECTION_ENABLED=true.
- INQUIRY_PRIVACY_POLICY_APPROVED=true.
- INQUIRY_RETENTION_DAYS must be an approved integer from 1 to 365.
- INQUIRY_ABUSE_HASH_SECRET must be a private stable random secret of at least 32 characters.
- INQUIRY_RETENTION_CLEANUP_ENABLED=true only after the private independent retention job exists and runs correctly.

Enable NEXT_PUBLIC_INQUIRIES_ENABLED=true on Vercel only AFTER the backend is ready; rebuild and verify with approved synthetic inquiry content. A database receipt is not an email delivery receipt.

## 6. Resend and independently scheduled jobs

Do not run email jobs inside the normal API request handler. They require private runtime configuration and independently managed scheduler capacity. The free Render web service in the Blueprint does not provision a cron job.

Schedule pnpm notifications:dispatch (e.g., every minute when the selected plan permits) and pnpm retention:prune (at a legally reviewed interval). They currently execute TS via tsx: install full workspace dependencies in their dedicated job environment, not production-only dependencies. Confirm the plan and running schedule before setting INQUIRY_NOTIFICATION_WORKER_CONFIRMED=true.

Before enabling INQUIRY_EMAIL_ENABLED=true, supply a verified RESEND_API_KEY, RESEND_FROM_EMAIL, INQUIRY_NOTIFY_EMAIL, a live approved collection workflow and a confirmed worker. Test that the provider accepted a synthetic message and that the intended destination actually received it. Audit provider 429/retry/failed records without logging messages or addresses. No such live delivery is evidenced by GitHub tests.

## 7. Private authenticated admin

Choose a compatible HTTPS OIDC provider, secure MFA and audience, its JWKS and an exact registered callback ending /admin. Bootstrap the verified OIDC subject with the protected admin:bootstrap script in a private operator context, according to MODULE_14_REPORT.md. Verify login, editor/admin permissions, publication, revocation and audit records against the dedicated Neon instance. CI uses test identities, not a live authenticated production account.

## 8. Safe smoke test and acceptance

After actual deployment, set:
- DEPLOYMENT_SMOKE_WEB_URL to the real bare HTTPS Vercel origin (without trailing slash).
- DEPLOYMENT_SMOKE_API_URL to the real bare HTTPS Render origin (without trailing slash).
- DEPLOYMENT_EXPECT_DATABASE_READY=false for health-only mode, or true AFTER Neon is migrated and connected.

Run pnpm deployment:smoke. It only issues GETs to homepage, Contact, API /health and API /api/v1/ready, checking expected HTTP status and response identity. It never sends inquiries or emails and does not certify transactional production flows.

Run CI and Module 16 screenshot regression on the exact production commit, and separately review physical iOS Safari and Android Chrome, real DNS/HTTPS/robots, 404, metadata, WebGL fallback and form/error states. Validate CORS PATCH preflight for admin, identity-provider flow, a real restricted admin session, a stored synthetic inquiry and a verified Resend notification in an approved test window.

## 9. Rollback and incident control

Keep the last known-good deployment SHA. To stop data collection, first disable both frontend NEXT_PUBLIC_INQUIRIES_ENABLED and API INQUIRY_COLLECTION_ENABLED, redeploy where necessary, stop the notification schedule and secure sensitive audit data. Use provider-supported rollback of the app. Do NOT blindly roll back database migrations. Restore backups with a tested recovery plan. Rotate any compromised credentials, revoke OIDC sessions and record the incident.

## Still-required production evidence

No Module 17 complete status until all of these exist: real Vercel deployment link and commit, Render service/deploy ID, dedicated Neon project/database, applied migrations with limited runtime role, readiness HTTP 200, live CORS, verified Resend sender and destination, privacy/retention approval, worker/cleanup schedules, test inquiry receipt, accepted and received sample mail, real device visual approval and rollback procedure. **Do not invent any missing evidence.**
