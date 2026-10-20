import { randomBytes, randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { Client } from "pg";
import { databaseUrl, isLoopback } from "../src/db/config.js";
import { runPrisma } from "./prisma-cli.js";

// No dotenv loading and no DATABASE_URL fallback. This runner never migrates,
// resets, truncates or drops a database supplied by a caller.
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
  await admin.connect();
  try {
    // Identifiers/password below are generated locally from UUIDs/hex, not input.
    await admin.query(`CREATE DATABASE "${database}"`);
    databaseCreated = true;
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
    await runPrisma(["generate"], env);
    await runPrisma(["migrate", "deploy"], env);
    await runPrisma(["migrate", "deploy"], env); // Repeated deploy must be a no-op.
    await runPrisma(["migrate", "status"], env);
    await runPrisma(["migrate", "diff", "--from-config-datasource", "--to-schema", "prisma/schema.prisma", "--exit-code"], env);
    const owner = new Client({ connectionString: migrationUrl.toString() });
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
    await new Promise<void>((resolve, reject) => {
      const child = spawn(process.execPath, ["--import", "tsx", "--test", "tests/database.integration.ts"], {
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

main().catch(() => {
  // Driver errors may contain URLs or passwords. Test assertions identify the
  // failing contract; never dump raw connection errors from the orchestrator.
  console.error("Isolated database validation failed. Check the test output and local PostgreSQL availability.");
  process.exitCode = 1;
});
