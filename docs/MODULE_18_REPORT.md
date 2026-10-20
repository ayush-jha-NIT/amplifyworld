# Module 18: Final audit, operations and handover

## Delivery scope

**Implementation status: repository handover package and release audit tool prepared; live production acceptance BLOCKED by Module 17.** This is intentionally not a claim that the full AmplifyWorld project is publicly operational.

Changed files:
- \`apps/api/src/release/audit.ts\`: typed release profiles with required gates for preview, public site and full production; safe HTTPS evidence references; reject missing/invalid claims.
- \`apps/api/src/release/audit.test.ts\`: default-blocked, progressively complete and malicious evidence input tests.
- \`apps/api/scripts/release-audit.ts\`: read-only operator CLI that prints gate identifiers, never credentials or file contents. Non-zero exit on incomplete/malformed evidence.
- \`docs/RELEASE_EVIDENCE_TEMPLATE.json\`: **every gate blocked by default**, no fictional URLs or release approvals.
- \`docs/OPERATIONS_MANUAL.md\`: deployment, verification, monitoring, change control, incident response, credential handling, jobs, recovery, rollback and operator signoff.
- \`docs/RELEASE_DECISION.md\`: current factual release go/no-go matrix.
- Updated Module 17 deployment runbook, report, README and roadmap to reflect the **new dedicated Neon project**, zero application tables, denied Vercel team and rejected Render workspace.

## Evidence and product audit

Repository coverage through Module 16 includes six viewport sizes, 42 full-page route captures, 14 automated accessibility route checks, Blog/Portfolio/Contact behavior, admin auth contract tests, Postgres migration/integration tests and security-baseline contracts. These are useful but **do not replace** a live browser/device comparison, security audit by specialists, screen-reader testing, legitimate content approval, backup restoration or live CWV measurements.

Potential unresolved product distinctions:
- Blog/Portfolio may still present clearly labeled sample content and are noindexed; an operator must publish reviewed CMS content and connect the public rendering before advertising those as verified client cases.
- OIDC backend verifies signed JWT/roles, but no external admin IdP has been provisioned.
- Inquiry storage, sender verification, privacy and cleanup scheduling are intentionally disabled pending approval. None has demonstrated live delivery.
- The free frontend/backend plans may sleep or limit cron/background work. No zero-downtime uptime or SLA claim is made.

## Actual live state checked

- Neon: new free AmplifyWorld PostgreSQL 17 project \`lingering-pond-17105101\`, default branch \`main\`, database \`amplifyworld\`. **Zero application tables** in read-only schema inspection on 21 October 2026. No production migrations applied.
- Vercel: \`ayush-jha-nits-projects\` is not accessible to either connected account (403). No legitimate AmplifyWorld deployment URL available.
- Render: the user rejected \`amplify's workspace\`. Correct workspace is not available. No API deployment.
- Resend: no approved verified sender/domain/recipient; no delivery.
- Real domain: none requested. Use free provider domains when resources are authorized.
- User preferences: free plans; no Digimarket modifications; keep contact collection, email, indexing and OIDC admin off.

## Acceptance requirements

1. Green CI for this PR and final \`main\` commit, including the new release CLI tests, Postgres and Chromium.
2. Documentation reflects the actual active providers, no guessed identity or secrets.
3. Evidence template remains blocked and \`release:audit\` cannot report a pass without individual HTTPS evidence references and a commit SHA.
4. Deployment runbook, operational manual, rollback and incident response are usable without locally modifying code.
5. **Production acceptance is explicitly withheld** until the live release decision in \`docs/RELEASE_DECISION.md\` changes after real verified actions.

The project is **code-and-handover ready** after successful CI. The **complete production product** remains blocked by external permissions, migration and privacy/sender approval. Never describe Module 18 final release as successfully launched until those are resolved.
