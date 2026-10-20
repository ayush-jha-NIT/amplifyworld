import "dotenv/config";
import { disconnectDatabase } from "../src/db/client.js";
import { prismaNotificationQueue } from "../src/notifications/queue.js";
import { runNotificationCycle } from "../src/notifications/processor.js";
import { createResendSender, resendSettings } from "../src/notifications/resend.js";
import { workerEnabled } from "../src/notifications/settings.js";

async function main() {
  if (!workerEnabled(process.env)) {
    throw new Error("Notification dispatch disabled: approved database, privacy and email settings required");
  }
  const settings = resendSettings(process.env);
  const count = Number(process.env.INQUIRY_NOTIFICATION_BATCH_SIZE ?? 5);
  if (!Number.isInteger(count) || count < 1 || count > 10) throw new Error("Invalid notification batch size");
  const result = await runNotificationCycle(prismaNotificationQueue, createResendSender(settings), count);
  // Counts only, no inquiry content, contact data, provider payload or credential.
  console.info("Notification cycle:", JSON.stringify(result));
}

main().catch(() => {
  console.error("Notification cycle unsuccessful (no inquiry details logged)");
  process.exitCode = 1;
}).finally(() => disconnectDatabase().catch(() => { process.exitCode = 1; }));
