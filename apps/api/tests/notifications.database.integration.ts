import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { after, test } from "node:test";
import { getDatabase, disconnectDatabase } from "../src/db/client.js";
import { prismaNotificationQueue } from "../src/notifications/queue.js";
import { runNotificationCycle } from "../src/notifications/processor.js";
import { prismaPublicRepository } from "../src/routes/repository.js";

const db = getDatabase();
const created: string[] = [];
after(async () => {
  if (created.length) await db.inquiry.deleteMany({ where: { id: { in: created } } });
  await disconnectDatabase();
});

test("distributed bucket counts only opaque digests, enforcing limit across repeated access", async () => {
  const digest = createHash("sha256").update(randomUUID()).digest("hex");
  for (let i=1;i<=5;i++) assert.equal(await prismaPublicRepository.consumeInquiryBudget!(digest), true);
  assert.equal(await prismaPublicRepository.consumeInquiryBudget!(digest), false);
  const count = await db.inquiryRateBucket.findUniqueOrThrow({ where: { keyDigest: digest } });
  assert.equal(count.hits, 6);
  await db.inquiryRateBucket.delete({ where: { keyDigest: digest } });
});

test("two worker claims cannot claim same row, and provider acceptance changes only matching lease", async () => {
  const key = randomUUID();
  const createdRow = await db.inquiry.create({
    data: { name: "Queue tester", email: "queue@example.invalid",
      message: "This inquiry tests durable Resend queue claim behavior.",
      notificationStatus: "PENDING", nextNotificationAt: new Date(), retentionExpiresAt: new Date(Date.now()+86400000),
      idempotencyKey: key, requestHash: "a".repeat(64) }
  });
  created.push(createdRow.id);
  const [a,b] = await Promise.all([prismaNotificationQueue.claim(1),prismaNotificationQueue.claim(1)]);
  const matches = [...a,...b].filter(job=>job.id===createdRow.id);
  assert.equal(matches.length, 1);
  const claimed = matches[0]!;
  assert.equal(claimed.attempts, 1);
  assert.equal(await prismaNotificationQueue.accepted({ ...claimed, claimToken: randomUUID() }, "invalid"), false);
  assert.equal((await db.inquiry.findUniqueOrThrow({ where: { id: createdRow.id } })).notificationStatus, "PROCESSING");
  const outcome = await runNotificationCycle({
    claim: async () => [claimed],
    accepted: prismaNotificationQueue.accepted,
    rejected: prismaNotificationQueue.rejected
  }, async () => ({ outcome: "accepted", providerId: "simulated-provider-id" }));
  assert.equal(outcome.accepted, 1);
  const record = await db.inquiry.findUniqueOrThrow({ where: { id: createdRow.id } });
  assert.equal(record.notificationStatus, "SENT");
  assert.equal(record.notificationProviderId, "simulated-provider-id");
  assert.equal(record.notificationClaimToken, null);
  assert.ok(record.notifiedAt);
});

test("failed notification schedules bounded retry without storing provider secrets", async () => {
  const lead = await db.inquiry.create({
    data: { name: "Failure tester", email: "retry@example.invalid",
      message: "This message verifies bounded notification backoff behavior.",
      notificationStatus: "PENDING", retentionExpiresAt: new Date(Date.now()+86400000) }
  });
  created.push(lead.id);
  const jobs = await prismaNotificationQueue.claim(5);
  const job = jobs.find(item=>item.id===lead.id);
  assert.ok(job);
  const rejected = await prismaNotificationQueue.rejected(job, "retry", 300);
  assert.equal(rejected, true);
  const record = await db.inquiry.findUniqueOrThrow({ where: { id: lead.id } });
  assert.equal(record.notificationStatus, "FAILED");
  assert.ok(record.nextNotificationAt);
  assert.equal(record.notificationLeaseUntil, null);
});
