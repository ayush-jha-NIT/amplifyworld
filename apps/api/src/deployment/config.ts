/**
 * Deployment gates are deliberately independent of database and provider I/O.
 * Return configuration keys, never values, credentials or connection strings.
 */
export type DeployMode = "api" | "worker" | "retention";
type Environment = Readonly<Record<string, string | undefined>>;

function httpsOrigin(input: string | undefined): boolean {
  if (!input || input.length > 512) return false;
  try {
    const url = new URL(input);
    return url.protocol === "https:" && url.origin === input &&
      !url.username && !url.password && !url.hash && !url.search &&
      !url.pathname?.replaceAll("/", "") && url.hostname.includes(".");
  } catch { return false; }
}
function httpsUrl(input: string | undefined): boolean {
  try {
    if (!input) return false;
    const url = new URL(input);
    return url.protocol === "https:" && !url.username && !url.password &&
      !url.hash && url.hostname.includes(".");
  } catch { return false; }
}
function postgresUrl(input: string | undefined): boolean {
  try {
    if (!input) return false;
    const url = new URL(input);
    return (url.protocol === "postgresql:" || url.protocol === "postgres:") &&
      Boolean(url.hostname && url.pathname.length > 1 && url.username && url.password) &&
      (url.searchParams.get("sslmode") === "verify-full" ||
        url.searchParams.get("sslmode") === "require");
  } catch { return false; }
}
function validEmail(input: string | undefined): boolean {
  return Boolean(input && input.length <= 254 && /^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(input));
}

export function deploymentIssues(env: Environment, mode: DeployMode = "api"): string[] {
  const issues: string[] = [];
  const needsDb = mode !== "api" || env.INQUIRY_COLLECTION_ENABLED === "true" ||
    env.INQUIRY_EMAIL_ENABLED === "true";
  const enabledCollection = env.INQUIRY_COLLECTION_ENABLED === "true";
  const enabledEmail = env.INQUIRY_EMAIL_ENABLED === "true";
  const originList = (env.CLIENT_ORIGIN ?? "").split(",").map(x => x.trim()).filter(Boolean);
  const proxyHops = Number(env.TRUST_PROXY_HOPS);
  if (env.NODE_ENV === "production") {
    if (originList.length < 1 || originList.length > 5 || !originList.every(httpsOrigin)) {
      issues.push("CLIENT_ORIGIN");
    }
    if (env.DIRECT_URL || env.SHADOW_DATABASE_URL || env.TEST_DATABASE_ADMIN_URL) {
      issues.push("MIGRATION_CREDENTIALS_NOT_ALLOWED_ON_API");
    }
  }
  if (env.DATABASE_URL && !postgresUrl(env.DATABASE_URL)) issues.push("DATABASE_URL_TLS");
  if (needsDb && !postgresUrl(env.DATABASE_URL)) issues.push("DATABASE_URL");
  if (needsDb && (!Number.isInteger(proxyHops) || proxyHops < 1 || proxyHops > 2)) {
    issues.push("TRUST_PROXY_HOPS");
  }
  if (enabledCollection || mode !== "api") {
    const days = Number(env.INQUIRY_RETENTION_DAYS);
    if (env.INQUIRY_PRIVACY_POLICY_APPROVED !== "true") issues.push("INQUIRY_PRIVACY_POLICY_APPROVED");
    if (!Number.isInteger(days) || days < 1 || days > 365) issues.push("INQUIRY_RETENTION_DAYS");
    if (!env.INQUIRY_ABUSE_HASH_SECRET || env.INQUIRY_ABUSE_HASH_SECRET.length < 32) {
      issues.push("INQUIRY_ABUSE_HASH_SECRET");
    }
    if (env.INQUIRY_RETENTION_CLEANUP_ENABLED !== "true") {
      issues.push("INQUIRY_RETENTION_CLEANUP_ENABLED");
    }
  }
  if (enabledEmail || mode === "worker") {
    if (!enabledCollection) issues.push("INQUIRY_COLLECTION_ENABLED");
    if (!env.RESEND_API_KEY?.startsWith("re_") || env.RESEND_API_KEY.length < 12) issues.push("RESEND_API_KEY");
    if (!validEmail(env.RESEND_FROM_EMAIL)) issues.push("RESEND_FROM_EMAIL");
    if (!validEmail(env.INQUIRY_NOTIFY_EMAIL)) issues.push("INQUIRY_NOTIFY_EMAIL");
    if (env.INQUIRY_NOTIFICATION_WORKER_CONFIRMED !== "true") {
      issues.push("INQUIRY_NOTIFICATION_WORKER_CONFIRMED");
    }
  }
  if (mode === "worker" && !enabledEmail) issues.push("INQUIRY_EMAIL_ENABLED");
  if (mode === "retention" && !enabledCollection) issues.push("INQUIRY_COLLECTION_ENABLED");
  const oidcValues = [env.ADMIN_OIDC_ISSUER, env.ADMIN_OIDC_AUDIENCE, env.ADMIN_OIDC_JWKS_URL];
  if (oidcValues.some(Boolean) && (!httpsUrl(oidcValues[0]) ||
    !oidcValues[1] || !httpsUrl(oidcValues[2]))) issues.push("ADMIN_OIDC_CONFIGURATION");
  return [...new Set(issues)];
}

export function assertDeploymentEnvironment(env: Environment, mode: DeployMode = "api"): void {
  const errors = deploymentIssues(env, mode);
  if (errors.length) throw new Error("Deployment configuration invalid: " + errors.join(", "));
}
