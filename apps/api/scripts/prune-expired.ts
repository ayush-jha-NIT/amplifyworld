import "dotenv/config";
import { assertDeploymentEnvironment } from "../src/deployment/config.js";
import { getDatabase, disconnectDatabase } from "../src/db/client.js";

/** Schedule independently after a reviewed retention/deletion policy is approved. */
async function main() {
  assertDeploymentEnvironment(process.env, "retention");
  if (process.env.INQUIRY_PRIVACY_POLICY_APPROVED !== "true" || !process.env.DATABASE_URL ||
      process.env.INQUIRY_RETENTION_CLEANUP_ENABLED !== "true") {
    throw new Error("Retention cleanup requires approved policy, database and explicit enablement");
  }
  const now = new Date();
  const db = getDatabase();
  const leads = await db.inquiry.deleteMany({
    where: { retentionExpiresAt: { lte: now } }
  });
  const buckets = await db.inquiryRateBucket.deleteMany({
    where: { expiresAt: { lte: now } }
  });
  console.info("Retention cleanup counts:", JSON.stringify({
    expiredInquiries: leads.count, expiredRateBuckets: buckets.count
  }));
}
main().catch(() => {
  console.error("Retention cleanup failed (contact data not logged)");
  process.exitCode = 1;
}).finally(() => disconnectDatabase().catch(() => { process.exitCode = 1; }));
