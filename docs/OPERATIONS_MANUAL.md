# AmplifyWorld Operations and Handover Manual (Module 18)

**Production release status: BLOCKED.** Modules 0–16 and Module 17 deployment-readiness code are GitHub CI-verified. The hosted application, business approvals, and live services have not passed acceptance. This document is a practical operating manual, not an attestation that the cloud deployment exists.

## Ownership and boundaries

- Source of truth: [GitHub repository](https://github.com/ayush-jha-NIT/amplifyworld), production branch \`main\`; release SHAs must be pinned to a successful Actions run.
- Software: pnpm 10.13.1 monorepo, Node 22, Next.js 15, Express, Prisma 7, PostgreSQL 17, Resend opt-in.
- Owners: project owner must explicitly assign the deployment operator, incident responder, content approver and privacy contact before live submissions. **No staff names, mailboxes, phone numbers or service-level promises are invented.**
- Provider isolation: NEVER share projects, databases, runtime identities or deployments with Digimarket-software. Never access the rejected Render workspace \`amplify's workspace\`.
- Billing: free tiers only unless the owner gives separate, explicit approval. Inspect the plan/cost estimate before creating services, cron, domains or scaling instances.
- Config policy: no secrets in GitHub source, browser \`NEXT_PUBLIC_*\`, audit artifacts, public docs, issues, CI logs or ChatGPT messages. Credentials belong in service secret managers.

## First-day operator checklist

1. Read [Deployment Runbook](DEPLOYMENT_RUNBOOK.md), [Database Guide](DATABASE.md), [Modules 14–17](MODULE_17_REPORT.md) and this manual. Confirm who approves release and accepts incidents.
2. Confirm the requested Vercel team **\`ayush-jha-nits-projects\`** authorizes the connected integration; both linked accounts returned 403 at the 21 October 2026 audit.
3. Connect the **correct Render workspace**. The discovered \`amplify's workspace\` was rejected; do not select it for any operation.
4. Reuse the existing isolated Neon free project **\`lingering-pond-17105101\`**, branch \`main\`, database \`amplifyworld\`. Schema inspection showed **zero public application tables**, so do not mark migrations complete.
5. Decide production domain (provider-generated URLs are permitted), privacy policy, retention days, Resend verified sender/destination, content publication approval and admin OIDC provider before enabling those corresponding features.
6. Confirm exact deployed commit and CI evidence. Follow a controlled deployment, migration and independent worker schedule, then perform health, readiness and approved synthetic inquiry tests. No live production actions are authorized by this document.

## Operator commands (repository root)

| Purpose | Command | Expected behavior |
| --- | --- | --- |
| Local build/type/lint/unit | \`pnpm check\` | Must succeed at exact release SHA |
| Validate Prisma | \`pnpm db:validate\` | No remote write or credentials required |
| Database integration | \`pnpm test:database\` | Disposable PostgreSQL 17 only; never point at production |
| Migration status | \`pnpm db:migrate:status\` | Requires controlled operator schema-owner access |
| Migration apply | \`pnpm db:migrate:deploy\` | Only in an approved production migration window |
| Private runtime configuration | \`pnpm deployment:check\` | Reports invalid variable names, not values |
| Public smoke | \`pnpm deployment:smoke\` | Read-only GETs to approved HTTPS targets |
| Resend worker | \`pnpm notifications:dispatch\` | Only in explicitly scheduled, approved private worker |
| Retention cleanup | \`pnpm retention:prune\` | Deletes expired data; approved schedule/policy required |
| Release audit | \`pnpm release:audit -- preview docs/RELEASE_EVIDENCE_TEMPLATE.json\` | Must be **BLOCKED** with template evidence |

The release audit profiles are \`preview\`, \`public-site\` and \`full-production\`. Copy the JSON template **outside the repository** into a private operations workspace, fill only validated status and HTTPS evidence URLs, then run the CLI. Any "passed" flag is an **operator claim**, not independent proof; inspect the target evidence manually, including that it matches the exact Git SHA. Never attach private database URLs, IDs revealing customer data or credentials.

## Health and monitoring

The API endpoints mean different things: \`GET /health\` HTTP 200 means the Express process responds; \`GET /api/v1/ready\` HTTP 200 means the configured application database is reachable. A 503 is an actionable failure, not a health pass. Review readiness independently after any migrations, network changes or DB failover.

Suggested *operating checks*, not promises of always-on alerting:
- After each deployment: fetch root web page, \`/contact\`, \`/health\`, \`/api/v1/ready\`, robots/sitemap and the Admin noindex page.
- During service activation: verify a synthetic inquiry's stored receipt and a separate Resend provider-accepted ID, then inspect arrival in the approved inbox. A stored receipt is never evidence of email receipt.
- Daily after activation: review Render error rates/5xx, Vercel failed deployments, Neon compute/quota, notification retry/dead-letter counts and retention cleanup job status. Set actual alerts in the provider dashboards only after operator ownership and free-plan availability are confirmed.
- Weekly after activation: sample keyboard accessibility, desktop/mobile rendering, public metadata, published Blog/Portfolio correctness and manual approved-content spot checks.
- Monthly after activation: rotate/review access, check scheduled cleanup evidence, backup/restore posture, retention obligations, workspace spend and dependency/CI status.

**No external monitoring or recurring task is enabled by this document.** The operator must configure real alerts with an approved contact and tier.

## Incident response

| Incident | Containment | Recovery verification |
| --- | --- | --- |
| API unavailable / \`/health\` not 200 | Disable browser contact submission; inspect Render service/deploy logs | Restore to last green commit, then check \`/health\` and \`/ready\` |
| Neon connection failed / \`/ready\` 503 | Keep data collection disabled; stop notification/cleanup jobs if unsafe; check Neon project and credentials | Verify migrations, limited DB role and TLS; test readiness without touching unrelated DB |
| Email backpressure / Resend 429 or 5xx | Pause worker, preserve queued records; do not resend manually without idempotency check | Worker resumes with bounded retry, verify provider accepted ID and operator inbox |
| Invalid inquiry or spam surge | Disable collection; inspect distributed rate buckets and provider proxy configuration | Confirm HMAC guard, limits, 429 and privacy behavior with synthetic tests |
| Admin credential or OIDC issue | Disable access at provider / deactivate affected AdminUser through approved operator procedure; rotate keys | Verify non-admin denial, active-role checks, audit and revocation |
| Publishing incorrect claims | Unpublish/archived item via authorized admin, take down unapproved content from cache | Verify public API and site no longer expose unreviewed claims |
| Leaked production secrets | Revoke/rotate at provider immediately and investigate read access; do not publish leaked values in ticket | Confirm old key rejected, new key in private env and restart healthy |
| Production regression on mobile | Turn off affected capability, select approved prior Vercel/Render deployment | Verify functionality, screenshots and accessibility at 320/390/1440 widths |

## Change, rollback and recovery

- **Application:** store deploy SHA and the previous known-green SHA before each release. Use provider rollback on a code regression; validate health/ready, browser and accessibility afterward.
- **Database:** never reverse production migrations ad hoc. Review SQL diffs and backups before applying. Resolve via a forward migration or tested backup restoration with the schema owner; preserve audit history. This runbook has not verified a recovery point objective or a restore test, so none is promised.
- **Security controls:** a feature's frontend/public flag and API/private flag must both be disabled on an incident, and workers paused separately. Redeploy frontend for changes to public environment variables.
- **Runbook governance:** record change description, approver, CI run, merge SHA, deployed project IDs, migration version, smoke outputs, feature flags and rollback outcome in a private release log.

## Final acceptance and Module 18 handover

The operator must sign off independently on code+CI, Vercel/Render/Neon credentials and ownership, migration success, no shared Digimarket resources, HTTPS/API/DB readiness, real device/browser results, approved published content, privacy and retention, admin identity, independently scheduled cleanup/notification jobs, Resend delivery, indexing and rollback rehearsal. The current release decision is tracked in [RELEASE_DECISION.md](RELEASE_DECISION.md).

**Handover documentation and automated release gate can be completed in GitHub even when production launch remains blocked.** That is not equivalent to declaring the entire project live.
