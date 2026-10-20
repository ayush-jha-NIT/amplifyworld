import { nextRetrySeconds } from "./queue.js";
import type { NotificationQueue } from "./queue.js";
import type { EmailSender } from "./resend.js";

export type CycleSummary = { claimed: number; accepted: number; deferred: number; stopped: number };

export async function runNotificationCycle(queue: NotificationQueue, send: EmailSender, limit = 5): Promise<CycleSummary> {
  const jobs = await queue.claim(limit);
  const summary: CycleSummary = { claimed: jobs.length, accepted: 0, deferred: 0, stopped: 0 };
  // Intentional sequential provider I/O: each cycle respects Resend's rate limits.
  for (const job of jobs) {
    let result: Awaited<ReturnType<EmailSender>>;
    try { result = await send(job); } catch {
      result = { outcome: "retry", retryAfter: 60 };
    }
    if (result.outcome === "accepted") {
      if (await queue.accepted(job, result.providerId)) summary.accepted++;
      // If the claim lease was lost, do not falsely acknowledge local completion.
    } else {
      const retriable = result.outcome === "retry" && job.attempts < 4;
      const retry = nextRetrySeconds(job.attempts, result.retryAfter);
      const written = await queue.rejected(job, retriable ? "retry" : "terminal", retry);
      if (written) {
        if (retriable) summary.deferred++;
        else summary.stopped++;
      }
    }
  }
  return summary;
}
