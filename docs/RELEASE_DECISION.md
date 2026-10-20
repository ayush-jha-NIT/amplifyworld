# AmplifyWorld Release Decision (as of 21 October 2026)

**Decision: NO-GO for live public operations.** No real working Vercel frontend + Render API + migrated Neon database has been verified together. The "full-production" and "public-site" release gates are blocked. The stricter standalone frontend-preview gate also lacks a real deployed URL and approved live content.

## Known verified evidence

| Area | Status | Evidence / limitation |
| --- | --- | --- |
| GitHub modules 0–16 | Green repository CI | Main GitHub Actions run [39471166905](https://github.com/ayush-jha-NIT/amplifyworld/actions/runs/39471166905) |
| Module 17 deployment-readiness code | Green repository CI | [PR #16](https://github.com/ayush-jha-NIT/amplifyworld/pull/16), main run [39474494194](https://github.com/ayush-jha-NIT/amplifyworld/actions/runs/39474494194) |
| Dedicated Neon | Project exists | AmplifyWorld free organization project \`lingering-pond-17105101\`, PostgreSQL 17, branch \`main\`, database \`amplifyworld\`; **read-only inspection on 21 October: no public application tables** |
| Vercel authorization | **Blocked** | Both connected accounts get HTTP 403 for target team \`ayush-jha-nits-projects\` |
| Render authorization | **Blocked** | User rejected discovered \`amplify's workspace\`; correct workspace unknown |
| Real domain | Not provided | Provider-generated domains acceptable after authorized deployment |
| Privacy, retention, public claims, sender/recipient | Not approved | Contact collection, email delivery and SEO indexing intentionally remain disabled |
| Live API readiness / admin OIDC | Unverified | No production API service or configured identity provider |
| Live end-to-end submission/email | Unverified | No real accepted-and-delivered message receipt |
| Physical-device screenshots and review | Manual signoff outstanding | CI 83 Chromium tests + screenshot evidence do not substitute for iOS Safari/Android Chrome |

## Minimum path to release

1. The owner must grant **ChatGPT Vercel integration** access to \`ayush-jha-nits-projects\`, and give it access to GitHub \`ayush-jha-NIT/amplifyworld\`. It is currently not authorized even when the account is connected.
2. The owner must connect and explicitly authorize the **correct Render workspace**. Do not access the previously rejected workspace.
3. Deploy a separate AmplifyWorld frontend and API on the agreed free plans using the existing deployment manifests; record project/deploy IDs and provider URLs; keep collection/email/indexing disabled.
4. Apply reviewed Prisma migrations **only to the dedicated Neon** via a controlled schema-owner identity, configure restricted runtime role and verify \`/api/v1/ready\`.
5. Run read-only \`deployment:smoke\`, check CORS and the code-derived noindex state. Conduct visual review on real phones.
6. Obtain lawful privacy and retention approval and configure an actual cleanup schedule before activating inquiry collection. Configure a verified Resend sender/recipient, independently scheduled worker and authenticated admin identity as separately approved. Verify actual results and set monitoring/rollback.
7. Fill a private copy of [release evidence template](RELEASE_EVIDENCE_TEMPLATE.json), verify every evidence link against the exact release SHA, then run \`pnpm release:audit -- full-production /path/to/evidence.json\`. The CLI reports only claimed status; human approval and live validation remain mandatory.

**No service or setting may be marked deployed, green or approved solely because code and documentation exist.** Never substitute Digimarket resources, a paid plan, invented domain or fabricated delivery data to close this checklist.
