import "dotenv/config";
import { smokeDeployment } from "../src/deployment/smoke.js";

smokeDeployment(
  process.env.DEPLOYMENT_SMOKE_WEB_URL,
  process.env.DEPLOYMENT_SMOKE_API_URL,
  process.env.DEPLOYMENT_EXPECT_DATABASE_READY === "true"
).then(results => {
  // Log only endpoint class, status and verified result, never provider URLs.
  for (const row of results) console.info(row.path, row.status, row.verified ? "verified" : "failed");
}).catch(() => {
  console.error("Deployment smoke test did not pass. Check configured HTTPS origins and readiness.");
  process.exitCode = 1;
});
