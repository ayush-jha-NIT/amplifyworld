import { createPublicKey, verify as verifySignature } from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import { getDatabase } from "../db/client.js";

export type AdminActor = { id: string; role: "EDITOR" | "ADMIN" };
export type Authenticator = (request: Request) => Promise<AdminActor | null>;

type TokenClaims = { iss?: unknown; aud?: unknown; sub?: unknown; exp?: unknown; nbf?: unknown; iat?: unknown };
type PublicJwk = JsonWebKey & { kid?: string; kty?: string; alg?: string; use?: string };
const jwkCache = new Map<string, { expires: number; keys: PublicJwk[] }>();

function config(env: NodeJS.ProcessEnv) {
  const issuer = env.ADMIN_OIDC_ISSUER?.trim();
  const audience = env.ADMIN_OIDC_AUDIENCE?.trim();
  const endpoint = env.ADMIN_OIDC_JWKS_URL?.trim();
  if (!issuer || !audience || !endpoint || issuer.length > 512 || audience.length > 512) return null;
  try {
    const origin = new URL(issuer);
    const keys = new URL(endpoint);
    // Tokens are issued only by an explicitly configured HTTPS provider.
    if (origin.protocol !== "https:" || keys.protocol !== "https:" ||
      origin.username || origin.password || keys.username || keys.password ||
      keys.hash || !origin.hostname || !keys.hostname) return null;
    return { issuer: origin.href.replace(/\/$/, ""), audience, endpoint: keys.href };
  } catch { return null; }
}
function jsonPart(encoded: string): Record<string, unknown> | null {
  if (!/^[A-Za-z0-9_-]+$/.test(encoded) || encoded.length > 12000) return null;
  try {
    const data: unknown = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    return data && typeof data === "object" && !Array.isArray(data) ? data as Record<string, unknown> : null;
  } catch { return null; }
}
async function keys(endpoint: string, fetcher: typeof fetch): Promise<PublicJwk[]> {
  const cached = jwkCache.get(endpoint);
  if (cached && cached.expires > Date.now()) return cached.keys;
  const response = await fetcher(endpoint, {
    redirect: "error", headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(3500)
  });
  if (!response.ok) throw new Error("OIDC keys unavailable");
  const body = await response.text();
  if (body.length > 100_000) throw new Error("OIDC keys too large");
  const obj: unknown = JSON.parse(body);
  const collection = obj && typeof obj === "object" && "keys" in obj ? obj.keys : null;
  if (!Array.isArray(collection) || collection.length > 30) throw new Error("Invalid OIDC keyset");
  const verified = collection.filter((item): item is PublicJwk =>
    item && typeof item === "object" && item.kty === "RSA" &&
    typeof item.n === "string" && typeof item.e === "string" &&
    item.n.length <= 1500 && item.e.length <= 16 &&
    (!item.use || item.use === "sig") && (!item.alg || item.alg === "RS256"));
  jwkCache.set(endpoint, { keys: verified, expires: Date.now() + 5 * 60_000 });
  return verified;
}
/** RS256-only OIDC access tokens. Never trust unsigned claims or ID/email alone. */
export async function verifyOidcSubject(
  token: string, env: NodeJS.ProcessEnv = process.env, fetcher: typeof fetch = fetch
): Promise<string | null> {
  const configured = config(env);
  if (!configured || token.length > 12000 || token.length < 30) return null;
  const parts = token.split(".");
  if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) return null;
  const header = jsonPart(parts[0]); const payload = jsonPart(parts[1]) as TokenClaims | null;
  if (!header || !payload || header.alg !== "RS256" || typeof header.kid !== "string" || !header.kid ||
      header.kid.length > 128 || typeof payload.sub !== "string" || !payload.sub ||
      payload.sub.length > 255 || payload.iss !== configured.issuer ||
      !(payload.aud === configured.audience || Array.isArray(payload.aud) &&
        payload.aud.includes(configured.audience))) return null;
  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp !== "number" || !Number.isFinite(payload.exp) ||
      payload.exp <= now || payload.exp > now + 86_400 ||
      (payload.nbf !== undefined && (typeof payload.nbf !== "number" || payload.nbf > now + 30)) ||
      (payload.iat !== undefined && (typeof payload.iat !== "number" || payload.iat > now + 30))) return null;
  try {
    const key = (await keys(configured.endpoint, fetcher)).find(item => item.kid === header.kid);
    if (!key) return null;
    const signed = Buffer.from(parts[0] + "." + parts[1], "ascii");
    const signature = Buffer.from(parts[2], "base64url");
    if (!verifySignature("RSA-SHA256", signed, createPublicKey({ key, format: "jwk" }), signature)) return null;
    return payload.sub;
  } catch { return null; }
}

export const oidcAuthenticate: Authenticator = async (request) => {
  const auth = request.get("authorization");
  if (!auth || !/^Bearer [A-Za-z0-9._~-]+$/.test(auth)) return null;
  const subject = await verifyOidcSubject(auth.slice(7));
  if (!subject) return null;
  const user = await getDatabase().adminUser.findUnique({
    where: { authProvider_authSubject: { authProvider: "oidc", authSubject: subject } },
    select: { id: true, isActive: true, role: true }
  });
  return user?.isActive ? { id: user.id, role: user.role } : null;
};
export function protect(authenticate: Authenticator, required: "EDITOR" | "ADMIN" = "EDITOR") {
  return async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    response.setHeader("Cache-Control", "no-store");
    try {
      const actor = await authenticate(request);
      if (!actor) { response.status(401).json({ error: { code: "UNAUTHORIZED", message: "Authentication required." } }); return; }
      if (required === "ADMIN" && actor.role !== "ADMIN") {
        response.status(403).json({ error: { code: "FORBIDDEN", message: "Administrator approval required." } }); return;
      }
      response.locals.actor = actor;
      next();
    } catch {
      response.status(503).json({ error: { code: "AUTH_UNAVAILABLE", message: "Authentication could not be verified." } });
    }
  };
}
