import "dotenv/config";
import { migrationEnvironment } from "../src/db/config.js";
import { runPrisma } from "./prisma-cli.js";

async function main() {
  const [operation, ...args] = process.argv.slice(2);
  if (!["deploy", "status", "dev"].includes(operation ?? "")) {
    throw new Error("Supported database operations: deploy, status, dev");
  }
  if (operation === "dev") {
    if (args.length !== 2 || args[0] !== "--name" || !/^[a-z][a-z0-9_]{0,60}$/.test(args[1] ?? "")) {
      throw new Error("Use db:migrate:dev --name descriptive_change (local disposable databases only)");
    }
  } else if (args.length) {
    throw new Error("Deploy and status do not accept additional arguments");
  }
  const env = migrationEnvironment(process.env, operation === "dev");
  await runPrisma(["migrate", operation!, ...(operation === "dev" ? ["--create-only", ...args] : [])], env);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Database command failed");
  process.exitCode = 1;
});
