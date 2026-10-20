import "dotenv/config";
import { assertDeploymentEnvironment } from "../src/deployment/config.js";
import type { DeployMode } from "../src/deployment/config.js";

const mode = process.argv[2] ?? "api";
if (!["api","worker","retention"].includes(mode) || process.argv.length > 3) {
  console.error("Usage: deployment:check [api|worker|retention]");
  process.exitCode = 1;
} else {
  try {
    assertDeploymentEnvironment(process.env, mode as DeployMode);
    console.info("Configuration checks passed for " + mode + " (external resources not verified).");
  } catch (err) {
    console.error(err instanceof Error ? err.message : "Configuration incomplete");
    process.exitCode = 1;
  }
}
