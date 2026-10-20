# Module 13: Resend notification delivery, queue and anti-abuse

## Scope

Module 13 implements a **separate, opt-in, server-only** notification pipeline for
business inquiries. No keys, recipient addresses or sender identity are invented.
The frontend still acknowledges **durable database storage only**, not email delivery.

### Delivery architecture

1. When `INQUIRY_EMAIL_ENABLED=true` and private settings validate, a newly saved
   inquiry is inserted as `PENDING`. Otherwise the existing Module 12 storage
   path writes `NOT_REQUESTED`. Reusing the HTTP idempotency key never schedules
   a second notification.
2. A separately scheduled `pnpm notifications:dispatch` process claims up to
   10 due inquiries using atomic PostgreSQL `FOR UPDATE SKIP LOCKED`, a unique
   UUID token and a 90-second lease; two workers cannot claim the same active row.
3. The worker calls `POST https://api.resend.com/emails` with private Bearer credentials,
   a verified `from`, one private notification `to`, fixed subject and escaped-as-plain-text
   details. It uses the stable provider `Idempotency-Key: amplifyworld-inquiry/<UUID>`,
   a 12-second timeout, and bounded sequential sends.
4. On a provider-accepted response with an email ID, the worker records
   `SENT`, provider ID and accepted timestamp, conditioned on ownership of
   the lease token. **SENT means API accepted, not delivered to the inbox.**
5. 409 concurrent requests, 429 (honoring bounded `Retry-After`), HTTP 5xx,
   ambiguous provider responses and network failures schedule 1, 5 and 15 minute
   retry delays, up to four total attempts. Fatal 4xx and exhausted retries
   transition to `SKIPPED` for manual review without leaking API error bodies.
   Stale leases can be reclaimed; provider idempotency mitigates duplicates
   on uncertain acceptance. Resend's official 24-hour window does not guarantee
   exactly-once delivery beyond that period.

### Anti-abuse and data controls

- Existing API content-type enforcement, payload bound, origin checking and
  five-attempt local guard remain in place.
- A hidden decoy input never enters normal tab order. Nonempty bot-filled values
  are dropped **without issuing a false accepted receipt**.
- For actual database requests, a mandatory `INQUIRY_ABUSE_HASH_SECRET`
  (at least 32 private characters) HMAC-hashes remote IP + UTC ten-minute window.
  A PostgreSQL atomic upsert enforces five attempts per window **across API
  replicas**. Only 64-character digests, counts and expiry timestamps are kept,
  never raw IPs, user agents or email addresses in the limiter.
- `pnpm retention:prune` deletes expired inquiry records and expired opaque
  rate buckets, but only when explicitly enabled with approved policy. Execute
  on a separate reviewed schedule. Configure legitimate `TRUST_PROXY_HOPS`
  for the hosting provider; never trust arbitrary `X-Forwarded-For`.
- Do not enable inquiry collection until reviewed privacy text, lawful contact
  processing and retention policies are ready. Expiry timestamps alone do not
  delete data, so a scheduled cleanup is essential.

### Deployment setup (operator required)

Environment in the **API/worker**, not the browser:

```dotenv
DATABASE_URL=<restricted pooled Neon URL>
INQUIRY_COLLECTION_ENABLED=true
INQUIRY_PRIVACY_POLICY_APPROVED=true
INQUIRY_RETENTION_DAYS=<approved integer 1..365>
INQUIRY_ABUSE_HASH_SECRET=<stable private random secret at least 32 chars>
INQUIRY_EMAIL_ENABLED=true
RESEND_API_KEY=<private re_... key>
RESEND_FROM_EMAIL=<verified sender address>
INQUIRY_NOTIFY_EMAIL=<approved private recipient address>
INQUIRY_NOTIFICATION_BATCH_SIZE=5
INQUIRY_RETENTION_CLEANUP_ENABLED=true
CLIENT_ORIGIN=<verified frontend origin>
TRUST_PROXY_HOPS=<reviewed proxy count>
```

- Provision actual Neon (Module 17), review migrations including enum change
  and new rate-limiter table, apply via controlled `pnpm db:migrate:deploy` using
  the direct schema-owner URL.
- Grant `SELECT, INSERT, UPDATE, DELETE` on `inquiry_rate_buckets` to the
  limited runtime role alongside previous inquiry grants.
- Verify the sender domain/address and the notification recipient in Resend.
  All values are absent from GitHub and CI. No email is sent during tests.
- Schedule `pnpm notifications:dispatch` **once each minute** as a separate
  recurring job with the private API environment, and
  `pnpm retention:prune` according to the approved policy. A regular API
  health check or page request must never send mail or run cleanup.
- Enable `NEXT_PUBLIC_INQUIRIES_ENABLED=true` in the web project only after
  the production API, migrations, retention task and worker are verified.

Resend documents [24-hour idempotency retention](https://resend.com/changelog/idempotency-keys)
and [rate-limit retry headers](https://resend.com/changelog/api-rate-limit).
No webhook verified delivery state is claimed; if required, add authenticated
webhook handling and delivery reconciliation in production operations.

### Verification

CI must pass frozen install, Prisma 7 generation/schema and migrations, Node/Next
build, TypeScript, lint, ordinary tests, isolated PostgreSQL integration tests,
and Chromium Contact regressions. Tests use a fake HTTP sender, never a live
Resend key or production Neon database.

### Boundaries

Module 14 provides authenticated content operations; Module 17 provisions actual
deployment and scheduled jobs. **Completing this module is not evidence of a
live Neon connection, verified sender, outgoing email, or production retention
compliance.**
