import "dotenv/config";
import { getDatabase, disconnectDatabase } from "../src/db/client.js";

async function main() {
  // Deliberate, one-time operator-controlled bootstrap. No default credentials or public registration.
  if (process.env.ADMIN_BOOTSTRAP_CONFIRM !== "CREATE_FIRST_ACTIVE_ADMIN" ||
    process.env.ADMIN_BOOTSTRAP_EMAIL?.trim() === undefined ||
    !process.env.ADMIN_BOOTSTRAP_SUBJECT?.trim() ||
    !process.env.DATABASE_URL) {
    throw new Error("First admin bootstrap requires explicit confirmation, OIDC subject, email and database");
  }
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL.trim().toLowerCase();
  const subject = process.env.ADMIN_BOOTSTRAP_SUBJECT.trim();
  const displayName = (process.env.ADMIN_BOOTSTRAP_DISPLAY_NAME ?? "Administrator").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 ||
    subject.length > 255 || displayName.length < 2 || displayName.length > 100) {
    throw new Error("Invalid bootstrap identity fields");
  }
  const db = getDatabase();
  const admins = await db.adminUser.count({ where: { role: "ADMIN", isActive: true } });
  if (admins > 0) throw new Error("An active administrator exists. Use an authenticated governance process.");
  const user = await db.adminUser.create({
    data: { email, displayName, authProvider: "oidc", authSubject: subject,
      role: "ADMIN", isActive: true }
  });
  await db.auditEvent.create({ data: {
    actorId: user.id, action: "BOOTSTRAP", entityType: "admin", entityId: user.id
  }});
  console.info("First active administrator was provisioned. Credentials are managed by the OIDC provider.");
}

main().catch(() => {
  console.error("Bootstrap failed. Check identity and existing-admin state; no credentials are logged.");
  process.exitCode = 1;
}).finally(() => disconnectDatabase().catch(() => {process.exitCode = 1;}));
