import assert from "node:assert/strict";
import test from "node:test";
import { runNotificationCycle } from "./processor.js";
import type { NotificationJob, NotificationQueue } from "./queue.js";
import { nextRetrySeconds } from "./queue.js";
import { createResendSender, emailPayload, resendSettings } from "./resend.js";
import { workerEnabled } from "./settings.js";

const settings = { apiKey: "re_private-test-credential", from: "sender@example.org", to: "team@example.org" };
const job: NotificationJob = {
  id: "3a1beac3-0d13-4fd2-8239-af6bb13d3f45",
  claimToken: "5e8da20f-44e1-48c6-bc7d-aa23648d4b15",
  name: "Example Contact", email: "contact@example.org", phone: null,
  company: null, serviceId: "website",
  message: "I am interested in a new website for my business.",
  attempts: 1
};
function memoryQueue(jobToReturn: NotificationJob = job) {
  const actions: string[] = [];
  const queue: NotificationQueue = {
    claim: async limit => { assert.equal(limit, 5); return [jobToReturn]; },
    accepted: async (_job, id) => { actions.push("accepted:" + id); return true; },
    rejected: async (_job, mode, retry) => { actions.push(mode + ":" + retry); return true; }
  };
  return { queue, actions };
}

test("Resend settings fail closed without verified private configuration", () => {
  assert.equal(workerEnabled({}), false);
  assert.equal(workerEnabled({ INQUIRY_EMAIL_ENABLED: "true", INQUIRY_COLLECTION_ENABLED: "true",
    INQUIRY_PRIVACY_POLICY_APPROVED: "true", DATABASE_URL: "private-value" }), true);
  assert.throws(() => resendSettings({}), /Email delivery/);
  assert.throws(() => resendSettings({ INQUIRY_EMAIL_ENABLED: "true",
    RESEND_API_KEY: "invalid", RESEND_FROM_EMAIL: "from@example.org",
    INQUIRY_NOTIFY_EMAIL: "recipient@example.org" }), /Email delivery/);
  assert.deepEqual(resendSettings({
    INQUIRY_EMAIL_ENABLED: "true", RESEND_API_KEY: settings.apiKey,
    RESEND_FROM_EMAIL: settings.from, INQUIRY_NOTIFY_EMAIL: settings.to
  }), settings);
});

test("email body is plain text, never HTML, with verified sender and stable subject", () => {
  const text = emailPayload({ ...job, name: "Alice\r\nBcc: injected@example.org", message: "<script>bad</script>" }, settings);
  assert.equal(text.subject, "New AmplifyWorld business inquiry");
  assert.equal(text.from, settings.from);
  assert.deepEqual(text.to, [settings.to]);
  assert.ok(!("html" in text));
  assert.ok(!text.text.includes("\r"));
  assert.match(text.text, /Receipt ID/);
  assert.match(text.text, /Growth-Focused Website Development/);
});

test("Resend email requests are idempotent, timeout-bounded and accepted only with provider id", async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const request = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init });
    return new Response(JSON.stringify({ id: "provider-msg-123" }), { status: 200 });
  }) as typeof fetch;
  const sender = createResendSender(settings, request);
  assert.deepEqual(await sender(job), { outcome: "accepted", providerId: "provider-msg-123" });
  assert.equal(calls[0]?.url, "https://api.resend.com/emails");
  const headers = calls[0]?.init?.headers as Record<string, string>;
  assert.equal(headers["Idempotency-Key"], "amplifyworld-inquiry/" + job.id);
  assert.equal(headers.Authorization, "Bearer " + settings.apiKey);
  assert.ok(calls[0]?.init?.signal);
  assert.doesNotMatch(JSON.stringify(calls[0]?.init?.body), /provider-msg-123/);
});

test("provider retry/terminal policy covers rate limits, errors, missing IDs and network failures", async () => {
  for (const [status, outcome] of [[429,"retry"],[502,"retry"],[409,"retry"],[422,"terminal"]] as const) {
    const sender = createResendSender(settings, (async () =>
      new Response("{}", { status, headers: { "retry-after": "78" } })) as typeof fetch);
    const result = await sender(job);
    assert.equal(result.outcome, outcome);
    if (result.outcome === "retry") assert.equal(result.retryAfter, 78);
  }
  assert.deepEqual(await createResendSender(settings,
    (async () => new Response("{}", { status: 200 })) as typeof fetch)(job),
    { outcome: "retry", retryAfter: 60 });
  assert.deepEqual(await createResendSender(settings,
    (async () => { throw new Error("do not log this secret"); }) as typeof fetch)(job),
    { outcome: "retry", retryAfter: 60 });
});

test("backoff bounded within provider idempotency window", () => {
  assert.equal(nextRetrySeconds(1), 60);
  assert.equal(nextRetrySeconds(2), 300);
  assert.equal(nextRetrySeconds(3), 900);
  assert.equal(nextRetrySeconds(2, 800), 800);
  assert.equal(nextRetrySeconds(3, 99999), 3600);
});

test("successful provider acceptance finalizes only a matching claim", async () => {
  const { queue, actions } = memoryQueue();
  assert.deepEqual(await runNotificationCycle(queue,
    async () => ({ outcome: "accepted", providerId: "provider-accept" })),
    { claimed: 1, accepted: 1, deferred: 0, stopped: 0 });
  assert.deepEqual(actions, ["accepted:provider-accept"]);
});

test("retryable provider failures are scheduled, exhausted/permanent ones stop", async () => {
  const { queue, actions } = memoryQueue();
  const summary = await runNotificationCycle(queue, async () => ({ outcome: "retry", retryAfter: 120 }));
  assert.equal(summary.deferred, 1);
  assert.deepEqual(actions, ["retry:120"]);
  const last = memoryQueue({ ...job, attempts: 4 });
  const result = await runNotificationCycle(last.queue, async () => ({ outcome: "retry", retryAfter: 0 }));
  assert.equal(result.stopped, 1);
  assert.equal(last.actions[0]?.startsWith("terminal:"), true);
  const fatal = memoryQueue();
  await runNotificationCycle(fatal.queue, async () => ({ outcome: "terminal", retryAfter: 0 }));
  assert.equal(fatal.actions[0]?.startsWith("terminal:"), true);
});
