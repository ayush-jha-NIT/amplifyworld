type DatabasePurpose = "runtime" | "migration";

export function isLoopback(url: URL): boolean {
  return ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
}

// Never include the input or a parser error in diagnostics: URLs contain secrets.
export function databaseUrl(value: string | undefined, name: string, purpose: DatabasePurpose): string {
  const fail = (reason: string): never => { throw new Error(`${name} ${reason}`); };
  if (!value?.trim()) return fail("must be set privately before accessing the database");
  let url: URL;
  try { url = new URL(value); } catch { return fail("must be a valid PostgreSQL URL"); }
  if (!["postgres:", "postgresql:"].includes(url.protocol) ||
      !url.hostname || !url.username || !/^\/[^/]+$/.test(url.pathname) || url.hash) {
    return fail("must identify a PostgreSQL host, user and database");
  }
  // Restrict options so neither pg nor Prisma can override the validated host,
  // database, search path or TLS policy through another connection parameter.
  const allowed = new Set(["sslmode", "channel_binding", "connect_timeout", "schema"]);
  for (const key of url.searchParams.keys()) {
    if (!allowed.has(key) || url.searchParams.getAll(key).length !== 1) {
      return fail("contains an unsupported or duplicate connection option");
    }
  }
  if (url.searchParams.has("schema") && url.searchParams.get("schema") !== "public") {
    return fail("must use the public schema");
  }
  const tls = url.searchParams.get("sslmode");
  if (!isLoopback(url) && (!url.password || !["require", "verify-full"].includes(tls ?? ""))) {
    return fail("requires a password and sslmode=require or sslmode=verify-full for remote hosts");
  }
  if (tls && !["disable", "require", "verify-full"].includes(tls)) {
    return fail("contains an unsupported TLS mode");
  }
  const binding = url.searchParams.get("channel_binding");
  if (binding && !["require", "prefer", "disable"].includes(binding)) {
    return fail("contains an unsupported channel binding mode");
  }
  if (purpose === "migration" && (url.hostname.includes("-pooler") || url.hostname.startsWith("pooler."))) {
    return fail("must be a direct, unpooled connection");
  }
  // Certificate + hostname verification is mandatory for every remote client.
  // Do not rely on changing pg interpretations of sslmode=require.
  if (tls === "require" || !isLoopback(url)) url.searchParams.set("sslmode", "verify-full");
  return url.toString();
}

export function poolConfig(value: string | undefined) {
  const url = new URL(databaseUrl(value, "DATABASE_URL", "runtime"));
  const channelBinding = url.searchParams.get("channel_binding");
  const tls = url.searchParams.get("sslmode");
  // pg's URL parser must not override the explicit, verified TLS configuration.
  url.search = "";
  return {
    connectionString: url.toString(),
    ssl: tls === "require" || tls === "verify-full" ? { rejectUnauthorized: true } : false,
    enableChannelBinding: channelBinding !== "disable",
    max: 5,
    connectionTimeoutMillis: 15_000,
    idleTimeoutMillis: 30_000,
    statement_timeout: 15_000,
    query_timeout: 20_000,
    application_name: "amplifyworld-api"
  };
}

export function migrationEnvironment(env: NodeJS.ProcessEnv, development: boolean): NodeJS.ProcessEnv {
  const direct = databaseUrl(env.DIRECT_URL, "DIRECT_URL", "migration");
  const result: NodeJS.ProcessEnv = { ...env, DIRECT_URL: direct };
  if (development) {
    if (env.NODE_ENV === "production" || !isLoopback(new URL(direct))) {
      throw new Error("Migration authoring is restricted to local development databases");
    }
    const shadow = databaseUrl(env.SHADOW_DATABASE_URL, "SHADOW_DATABASE_URL", "migration");
    const a = new URL(direct);
    const b = new URL(shadow);
    if (!isLoopback(b) || ((a.port || "5432") === (b.port || "5432") && decodeURIComponent(a.pathname) === decodeURIComponent(b.pathname))) {
      throw new Error("SHADOW_DATABASE_URL must identify a separate local disposable database");
    }
    result.SHADOW_DATABASE_URL = shadow;
  } else {
    // migrate deploy/status never need or touch a shadow database.
    delete result.SHADOW_DATABASE_URL;
  }
  return result;
}
