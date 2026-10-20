import { randomBytes, randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { Client } from "pg";
import { databaseUrl, isLoopback } from "../src/db/config.js";
import { runPrisma } from "./prisma-cli.js";

// No dotenv loading and no DATABASE_URL fallback. This runner never migrates,
// resets, truncates or drops a database supplied by a caller.
let stage = "configuration";
async function main() {
  const adminUrl = new URL(databaseUrl(process.env.TEST_DATABASE_ADMIN_URL, "TEST_DATABASE_ADMIN_URL", "migration"));
  if (!isLoopback(adminUrl) || decodeURIComponent(adminUrl.pathname) !== "/postgres") {
    throw new Error("Database tests require the postgres maintenance database on an isolated local server");
  }
  const suffix = randomUUID().replaceAll("-", "");
  const database = `amplifyworld_test_${suffix}`;
  const role = `amplifyworld_app_${suffix}`;
  const password = randomBytes(32).toString("hex");
  const admin = new Client({ connectionString: adminUrl.toString(), connectionTimeoutMillis: 5_000 });
  let databaseCreated = false;
  let roleCreated = false;
  stage = "connect to isolated PostgreSQL";
  await admin.connect();
  try {
    // Identifiers/password below are generated locally from UUIDs/hex, not input.
    stage = "create test database";
    await admin.query(`CREATE DATABASE "${database}"`);
    databaseCreated = true;
    stage = "create test role";
    await admin.query(`CREATE ROLE "${role}" LOGIN PASSWORD '${password}' NOSUPERUSER NOCREATEDB NOCREATEROLE`);
    roleCreated = true;
    const migrationUrl = new URL(adminUrl);
    migrationUrl.pathname = `/${database}`;
    const env = {
      ...process.env,
      NODE_ENV: "test",
      DIRECT_URL: migrationUrl.toString(),
      DATABASE_URL: migrationUrl.toString(),
      SHADOW_DATABASE_URL: ""
    };
    stage = "generate Prisma client";
    await runPrisma(["generate"], env);
    stage = "first migration deploy";
    await runPrisma(["migrate", "deploy"], env);
    stage = "repeat migration deploy";
    await runPrisma(["migrate", "deploy"], env); // Repeated deploy must be a no-op.
    stage = "migration status";
    await runPrisma(["migrate", "status"], env);
    stage = "migration drift";
    await runPrisma(["migrate", "diff", "--from-config-datasource", "--to-schema", "prisma/schema.prisma", "--exit-code"], env);
    const owner = new Client({ connectionString: migrationUrl.toString() });
    stage = "grant runtime database role";
    await owner.connect();
    try {
      await owner.query("REVOKE CREATE ON SCHEMA public FROM PUBLIC");
      await owner.query(`GRANT CONNECT ON DATABASE "${database}" TO "${role}"`);
      await owner.query(`GRANT USAGE ON SCHEMA public TO "${role}"`);
      await owner.query(`GRANT SELECT, INSERT, UPDATE, DELETE ON
        admin_users, categories, posts, projects, project_categories,
        project_services, project_media, inquiries TO "${role}"`);
      await owner.query(`GRANT SELECT ON services TO "${role}"`);
      await owner.query(`GRANT SELECT, INSERT ON audit_events TO "${role}"`);
    } finally {
      await owner.end();
    }
    const runtimeUrl = new URL(migrationUrl);
    runtimeUrl.username = role;
    runtimeUrl.password = password;
    env.DATABASE_URL = runtimeUrl.toString();
    stage = "runtime integration tests";
    await new Promise<void>((resolve, reject) => {
      const child = spawn(process.execPath, ["--import", "tsx", "--test", "tests/database.integration.ts", "tests/public.database.integration.ts"], {
        env, stdio: "inherit", shell: false
      });
      child.once("error", () => reject(new Error("Unable to start database tests")));
      child.once("exit", (code) => code === 0 ? resolve() : reject(new Error("Database tests failed")));
    });
  } finally {
    try {
      if (databaseCreated) await admin.query(`DROP DATABASE "${database}" WITH (FORCE)`);
      if (roleCreated) await admin.query(`DROP ROLE "${role}"`);
    } finally {
      await admin.end();
    }
  }
}

main().catch((error: unknown) => {
  // Driver errors may contain URLs or passwords. Test assertions identify the
  // failing contract; never dump raw connection errors from the orchestrator.
  const code = typeof error === "object" && error !== null && "code" in error && typeof error.code === "string" ? error.code : "unspecified";
  // Only controlled stage labels and a machine-readable PostgreSQL code are logged.
  // Raw errors can expose connection strings, SQL parameters, or passwords.
  console.error(`Isolated database validation failed at: ${stage} (code: ${code}).`);
  process.exitCode = 1;
});
