import { randomUUID } from "node:crypto";
import { getDatabase } from "../db/client.js";

export type NotificationJob = {
  id: string;
  claimToken: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string;
  serviceId: string | null;
  attempts: number;
};
export type FailureDisposition = "retry" | "terminal";

export interface NotificationQueue {
  claim(limit: number): Promise<NotificationJob[]>;
  accepted(job: NotificationJob, providerId: string): Promise<boolean>;
  rejected(job: NotificationJob, mode: FailureDisposition, retrySeconds: number): Promise<boolean>;
}

export const prismaNotificationQueue: NotificationQueue = {
  async claim(limit) {
    if (!Number.isInteger(limit) || limit < 1 || limit > 10) throw new Error("Invalid notification batch size");
    // If the process died on its final attempt, do not strand the record
    // permanently in PROCESSING after its lease expires. It needs manual review:
    // an external provider may already have accepted the ambiguous send.
    await getDatabase().inquiry.updateMany({
      where: {
        notificationStatus: "PROCESSING",
        notificationAttempts: { gte: 4 },
        notificationLeaseUntil: { lte: new Date() }
      },
      data: {
        notificationStatus: "SKIPPED",
        notificationClaimToken: null,
        notificationLeaseUntil: null,
        nextNotificationAt: null
      }
    });
    const token = randomUUID();
    // SQL is a fixed string; only validated numeric limit and UUID token are bound.
    // SKIP LOCKED safely coordinates independent workers, without external I/O inside the claim.
    const sql = [
      "WITH picked AS (SELECT id FROM inquiries",
      "WHERE (((notification_status IN ('PENDING','FAILED')) AND (next_notification_at IS NULL OR next_notification_at <= now()))",
      "OR (notification_status = 'PROCESSING' AND notification_lease_until <= now()))",
      "AND notification_attempts < 4 AND (retention_expires_at IS NULL OR retention_expires_at > now())",
      "AND status NOT IN ('SPAM','ARCHIVED')",
      "ORDER BY created_at ASC FOR UPDATE SKIP LOCKED LIMIT $1)",
      "UPDATE inquiries AS i SET notification_status = 'PROCESSING',",
      "notification_claim_token = $2::uuid, notification_lease_until = now() + interval '90 seconds',",
      "next_notification_at = NULL, notification_attempts = i.notification_attempts + 1",
      "FROM picked WHERE i.id = picked.id",
      "RETURNING i.id, i.name, i.email, i.phone, i.company, i.message,",
      "i.service_id, i.notification_attempts"
    ].join(" ");
    const claimed = await getDatabase().$queryRawUnsafe<Array<{
      id: string; name: string; email: string; phone: string | null; company: string | null;
      message: string; service_id: string | null; notification_attempts: number;
    }>>(sql, limit, token);
    return claimed.map(row => ({
      id: row.id, claimToken: token, name: row.name, email: row.email,
      phone: row.phone, company: row.company, message: row.message,
      serviceId: row.service_id, attempts: row.notification_attempts
    }));
  },
  async accepted(job, providerId) {
    const result = await getDatabase().inquiry.updateMany({
      where: { id: job.id, notificationStatus: "PROCESSING", notificationClaimToken: job.claimToken },
      data: {
        notificationStatus: "SENT", notificationProviderId: providerId,
        notifiedAt: new Date(), notificationClaimToken: null, notificationLeaseUntil: null,
        nextNotificationAt: null
      }
    });
    return result.count === 1;
  },
  async rejected(job, mode, retrySeconds) {
    const retry = mode === "retry" && job.attempts < 4;
    const result = await getDatabase().inquiry.updateMany({
      where: { id: job.id, notificationStatus: "PROCESSING", notificationClaimToken: job.claimToken },
      data: {
        notificationStatus: retry ? "FAILED" : "SKIPPED",
        notificationClaimToken: null,
        notificationLeaseUntil: null,
        nextNotificationAt: retry ? new Date(Date.now() + Math.max(60, Math.min(retrySeconds, 3600)) * 1000) : null,
        notifiedAt: null
      }
    });
    return result.count === 1;
  }
};

export function nextRetrySeconds(attempts: number, retryAfterSeconds = 0): number {
  const schedule = [60, 300, 900, 3600];
  return Math.min(3600, Math.max(schedule[Math.max(0, Math.min(3, attempts - 1))] ?? 60, retryAfterSeconds));
}
