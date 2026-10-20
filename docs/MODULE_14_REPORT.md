# Module 14: Authenticated content administration

## Delivered

- Admin console on /admin, noindex and disabled by default until explicitly configured OIDC/HTTPS API settings.
- OpenID Connect Authorization Code with PKCE: state/PKCE verifier temporarily kept in sessionStorage, access token in memory only; no stored password or refresh token.
- Server RS256 JWT verification using HTTPS JWKS, bounded cache/network, strict configured issuer, audience, subject, expiration, not-before, and active database identity lookup by (oidc, sub).
- EDITOR can create and edit drafts; ADMIN can create categories, review project claims, publish, unpublish, archive and view audit entries.
- Draft-only editing, separate project claims review, strict field allowlists, size checks, Markdown/plain-text only, secure HTTPS media URLs, and no public registration.
- Same PostgreSQL serializable transaction for content mutation and identifier-only audit entry.
- First admin explicit operator bootstrap using private subject/email confirmation; no default login.
- Automated fake-signed RSA token tests, HTTP role checks, isolated PostgreSQL content/audit tests, noindex/disabled browser tests, existing site regressions.

## API surface

- GET /api/v1/admin/me and /categories (EDITOR+); POST /categories (ADMIN).
- GET and POST /api/v1/admin/posts and /projects (EDITOR+).
- PATCH /api/v1/admin/posts/:id and /projects/:id (EDITOR+, DRAFT only).
- POST /api/v1/admin/posts/:id/publish, /unpublish, /archive (ADMIN).
- POST /api/v1/admin/projects/:id/review, /publish, /unpublish, /archive (ADMIN).
- GET /api/v1/admin/audit (ADMIN) returns identifiers/actions only.

## Operator setup

API private: ADMIN_OIDC_ISSUER, ADMIN_OIDC_AUDIENCE and ADMIN_OIDC_JWKS_URL must identify a trusted HTTPS OIDC issuer delivering RS256-signed access tokens, and DATABASE_URL must target migrated Neon.
Web public: NEXT_PUBLIC_ADMIN_OIDC_CLIENT_ID, NEXT_PUBLIC_ADMIN_OIDC_AUTH_URL, NEXT_PUBLIC_ADMIN_OIDC_TOKEN_URL and NEXT_PUBLIC_API_URL. Register exact https://YOUR_SITE/admin redirect and web-origin token-endpoint CORS for a public PKCE client.
First admin: run pnpm admin:bootstrap only after verifying ADMIN_BOOTSTRAP_SUBJECT with the provider, with ADMIN_BOOTSTRAP_CONFIRM=CREATE_FIRST_ACTIVE_ADMIN and private ADMIN_BOOTSTRAP_EMAIL. It refuses a second active ADMIN. No credentials or accounts are provisioned in CI.
IdP must enforce session revocation and suitable MFA. Token signature/role verification is on the API for EVERY request, not just UI. Do not confuse an ID token with a scoped access token.

## Limitations

- The content management API manages core post/project draft fields and publication; project media/taxonomy editing beyond categories is still an integration extension.
- Public Blog/Portfolio frontend currently displays transparently labeled concept/example data, rather than silently claiming database content is approved.
- No real OIDC provider, Neon instance, admin account or live editor session has been configured or verified.
- Module 15 will cover SEO/accessibility/performance. Modules 16–18 will complete cross-device QA, deployment and handover.

## CI status

To be completed only after verified green checks and main merge.