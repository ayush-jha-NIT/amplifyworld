# Module 12: Express public API and durable inquiry receipts

Module 12 builds on the merged Prisma/PostgreSQL Module 11 foundation.

## Implemented HTTP interface

- `GET /health`: existing DB-independent liveness.
- `GET /api/v1/ready`: performs a read-only DB probe; returns 503 without credentials or on failure.
- `GET /api/v1/posts` and `GET /api/v1/posts/:slug`: read-only, explicitly filter `PUBLISHED` and publication timestamps, safe projections excluding admin identity and private fields.
- `GET /api/v1/projects` and `GET /api/v1/projects/:slug`: additionally require non-null claims-review timestamp. Only approved public media/taxonomy included. No draft/archived content leaks.
- `POST /api/v1/inquiries`: server-side schema validation, canonical lowercase email, normalized options, DB foreign-key service IDs, UUID idempotency key, SHA-256 canonical request fingerprint, conflict on changed retry, 201 on committed first write, 200 on confirmed duplicate, 422 validation errors, 503 for disabled/storage errors and 429 on rate limiting. No success if a database write fails.
- Public listing queries support `limit` (1–50), `offset` (0–10000), optional safe category slug. Error payloads return codes and generic messages, without raw SQL or personally identifying input.
- JSON is capped to 20 KiB; malformed JSON gets stable 400 and oversized payload gets 413.
- CORS allow-list uses `CLIENT_ORIGIN`; browser submissions also reject unapproved Origin headers. Trusted proxy hop count is an explicit operator decision.
- Limited local per-IP abuse guard of five attempts per ten minutes, bounded to 5,000 IP buckets. **Not a substitute for distributed rate limits, bot management, honeypots or notification protection in Module 13.**

## Security and configuration

Collection fails closed unless **all** are present:
1. `INQUIRY_COLLECTION_ENABLED=true`
2. `INQUIRY_PRIVACY_POLICY_APPROVED=true` indicating a real operator-reviewed privacy/retention notice
3. `INQUIRY_RETENTION_DAYS` explicitly set to integer 1–365
4. An actual private `DATABASE_URL` for an appropriately migrated database

Frontend send mode additionally requires `NEXT_PUBLIC_INQUIRIES_ENABLED=true` and a real HTTPS `NEXT_PUBLIC_API_URL` (plain HTTP only for localhost). Otherwise the Module 10 form remains in honest local check-only mode. Never set these switches until a verified policy and real database are ready. Neither this commit nor any CI run provisions production Neon.

The client creates a UUID key and **reuses it for identical retry content**, rotating when fields change. A success state requires HTTP 200/201 **and** a correctly shaped durable receipt UUID. False 200 responses, invalid acknowledgements, network errors and 409 conflicts never show success. Acknowledgement means stored in the database, **not emailed**. Module 13 adds Resend delivery, spam policy, distributed anti-abuse and notification state management.

## Testing and readiness

- Shared validation, public-route mocked HTTP tests, Contact adapter contract, database-backed publication visibility and idempotent inquiry tests (PostgreSQL temporary CI service).
- Existing Contact browser tests continue to run with collection disabled by default. Connected live browser QA must be performed once Neon and Render are actually configured; CI cannot substitute for a production receipt verification.
- No admin API/auth, publishing, Resend keys, fake media or fabricated lead content is introduced. The frontend still shows original editorial/project samples marked as concepts and is not falsely claimed to be CMS-connected.
- Production enablement also requires operator-approved retention/deletion job and privacy/legal language; storing an expiry timestamp alone does not implement deletion.

## Next

Module 13 implements server-only Resend dispatch, durable notification retry state, rate/spam hardening and human-safe failure modes.
