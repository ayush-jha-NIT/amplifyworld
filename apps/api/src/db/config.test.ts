import assert from "node:assert/strict";
import test from "node:test";
import { databaseUrl, migrationEnvironment, poolConfig } from "./config.js";
import { createDatabaseLifecycle } from "./lifecycle.js";

// These strings are parser fixtures, never connection attempts or credentials.
const local = "postgresql://test@127.0.0.1:5432/amplifyworld_test?sslmode=disable";
const remote = "postgresql://test:parser-fixture@ep-test-pooler.neon.tech/test?sslmode=require&channel_binding=require";

test("database configuration is explicit and diagnostics never echo credentials", () => {
  for (const value of [undefined, "", "secret:do-not-print", "https://user:secret@example.com/db", "postgresql://user:secret@host/"]) {
    assert.throws(() => databaseUrl(value, "DATABASE_URL", "runtime"), (error: unknown) => {
      assert.ok(error instanceof Error);
      assert.match(error.message, /^DATABASE_URL /);
      assert.doesNotMatch(error.message, /secret|do-not-print|example\.com/);
      return true;
    });
  }
});

test("remote connections require TLS and cannot override validated connection options", () => {
  for (const value of [
    remote.replace("sslmode=require", "sslmode=disable"),
    remote.replace("sslmode=require", "sslmode=prefer"),
    remote.replace("test:parser-fixture@", "test@"),
    `${remote}&sslmode=disable`,
    `${remote}&host=127.0.0.1`,
    `${remote}&ssl=false`,
    `${remote}&schema=other`,
    `${remote}&options=-c%20search_path=other`
  ]) assert.throws(() => databaseUrl(value, "DATABASE_URL", "runtime"));
  const config = poolConfig(remote);
  assert.deepEqual(config.ssl, { rejectUnauthorized: true });
  assert.equal(config.enableChannelBinding, true);
  assert.equal(new URL(config.connectionString).search, "");
  assert.equal(config.max, 5);
  assert.ok(config.connectionTimeoutMillis > 0);
  assert.ok(config.statement_timeout > 0);
  assert.equal(poolConfig(local).ssl, false);
});

test("migration commands never fall back to the runtime URL or accept a Neon pooler", () => {
  assert.throws(() => migrationEnvironment({ DATABASE_URL: local }, false), /DIRECT_URL must be set/);
  assert.throws(() => migrationEnvironment({ DIRECT_URL: remote }, false), /unpooled/);
  const env = migrationEnvironment({ DIRECT_URL: local, SHADOW_DATABASE_URL: "unused" }, false);
  assert.equal(env.SHADOW_DATABASE_URL, undefined);
});

test("migration authoring requires separate disposable local databases", () => {
  const shadow = local.replace("amplifyworld_test", "amplifyworld_shadow");
  assert.doesNotThrow(() => migrationEnvironment({ DIRECT_URL: local, SHADOW_DATABASE_URL: shadow }, true));
  assert.throws(() => migrationEnvironment({ DIRECT_URL: local, SHADOW_DATABASE_URL: local }, true), /separate/);
  assert.throws(() => migrationEnvironment({
    DIRECT_URL: local, SHADOW_DATABASE_URL: local.replace("127.0.0.1", "localhost")
  }, true), /separate/);
  assert.throws(() => migrationEnvironment({ DIRECT_URL: local }, true), /SHADOW_DATABASE_URL/);
  assert.throws(() => migrationEnvironment({ DIRECT_URL: local, NODE_ENV: "production" }, true), /local development/);
  assert.throws(() => migrationEnvironment({ DIRECT_URL: remote.replace("-pooler", "") }, true), /local development/);
});

test("client lifecycle is lazy, reuses one client and disconnects once", async () => {
  let created = 0;
  let disconnected = 0;
  const lifecycle = createDatabaseLifecycle(() => {
    created++;
    return { $disconnect: async () => { disconnected++; } };
  });
  assert.equal(created, 0);
  assert.equal(lifecycle.get(), lifecycle.get());
  assert.equal(created, 1);
  await Promise.all([lifecycle.close(), lifecycle.close()]);
  assert.equal(disconnected, 1);
  assert.throws(() => lifecycle.get(), /shutting down/);
  const unused = createDatabaseLifecycle(() => { throw new Error("must not create"); });
  await unused.close();
});

test("failed initialization can be retried and failed disconnect is observable", async () => {
  let attempts = 0;
  const lifecycle = createDatabaseLifecycle(() => {
    if (++attempts === 1) throw new Error("temporarily unavailable");
    return { $disconnect: async () => { throw new Error("disconnect failed"); } };
  });
  assert.throws(() => lifecycle.get(), /temporarily unavailable/);
  lifecycle.get();
  await assert.rejects(lifecycle.close(), /disconnect failed/);
  await assert.rejects(lifecycle.close(), /disconnect failed/);
});
