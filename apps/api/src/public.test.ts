import assert from "node:assert/strict";
import { once } from "node:events";
import type { AddressInfo } from "node:net";
import test from "node:test";
import { randomUUID } from "node:crypto";
import type { InquiryInput } from "@amplifyworld/shared/inquiry";
import { validateInquiryPayload } from "@amplifyworld/shared/inquiry";
import { createApp } from "./app.js";
import type { PublicRepository } from "./routes/repository.js";

const payload: InquiryInput = {
  name: " Sample Person ", email: "HELLO@example.org", phone: "",
  company: "", service: "not-sure", message: "Please help us plan a business website."
};
const repository = (): PublicRepository => ({
  listPosts: async () => ({ items: [{ slug: "released" }], total: 1 }),
  readPost: async slug => slug === "released" ? { slug } : null,
  listProjects: async () => ({ items: [], total: 0 }),
  readProject: async () => null,
  ready: async () => true,
  writeInquiry: async () => ({ id: randomUUID(), created: true })
});
async function withApi(repo: PublicRepository, fn: (url: string) => Promise<void>) {
  const server = createApp({ repository: repo, collectionEnabled: true, privacyApproved: true, retentionDays: 30 }).listen(0);
  try {
    await once(server, "listening");
    const address = server.address() as AddressInfo;
    await fn("http://127.0.0.1:" + address.port);
  } finally {
    await new Promise<void>((resolve, reject) => server.close(err => err ? reject(err) : resolve()));
  }
}
async function submit(url: string, data: unknown, key: string = randomUUID()) {
  return fetch(url + "/api/v1/inquiries", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Idempotency-Key": key, Origin: "http://localhost:3000" },
    body: JSON.stringify(data)
  });
}
test("canonical validation trims fields, lowers email and rejects extra fields", () => {
  const result = validateInquiryPayload(payload);
  assert.equal(result.valid, true);
  if (result.valid) { assert.equal(result.data.name, "Sample Person"); assert.equal(result.data.email, "hello@example.org"); }
  assert.equal(validateInquiryPayload({ ...payload, password: "secret" }).valid, false);
});
test("published content routes and missing item handling use stable envelopes", async () => {
  await withApi(repository(), async url => {
    const posts = await fetch(url + "/api/v1/posts?limit=3&offset=2");
    assert.equal(posts.status, 200);
    assert.equal((await posts.json() as { total: number }).total, 1);
    const item = await fetch(url + "/api/v1/posts/released");
    assert.equal(item.status, 200);
    assert.equal((await fetch(url + "/api/v1/posts/absent")).status, 404);
    assert.equal((await fetch(url + "/api/v1/projects")).status, 200);
    assert.equal((await fetch(url + "/api/v1/posts?limit=500")).status, 400);
    assert.equal((await fetch(url + "/api/v1/posts?category=%3Cscript%3E")).status, 400);
    assert.equal((await fetch(url + "/api/v1/ready")).status, 200);
  });
});
test("inquiry only acknowledges awaited durable receipt", async () => {
  let writes = 0;
  const repo = repository();
  repo.writeInquiry = async () => { writes++; return { id: "123e4567-e89b-42d3-a456-426614174000", created: true }; };
  await withApi(repo, async url => {
    const invalid = await submit(url, { ...payload, message: "tiny" });
    assert.equal(invalid.status, 422);
    assert.equal((await invalid.json() as { error: { code: string } }).error.code, "VALIDATION_ERROR");
    assert.equal(writes, 0);
    const ok = await submit(url, payload);
    assert.equal(ok.status, 201);
    const answer = await ok.json() as { status: string; receiptId: string; notification: string };
    assert.equal(answer.status, "accepted");
    assert.ok(answer.receiptId);
    assert.equal(answer.notification, "not_requested");
    assert.equal(writes, 1);
  });
});
test("idempotency conflict, origin checks and failure response are safe", async () => {
  const repo = repository();
  repo.writeInquiry = async () => ({ conflict: true });
  await withApi(repo, async url => {
    const key = randomUUID();
    assert.equal((await submit(url, payload, key)).status, 409);
    assert.equal((await submit(url, payload, "bad-key")).status, 400);
    const blocked = await fetch(url + "/api/v1/inquiries", {
      method: "POST", headers: { "Content-Type": "application/json", Origin: "https://example.invalid", "Idempotency-Key": randomUUID() }, body: JSON.stringify(payload)
    });
    assert.equal(blocked.status, 403);
    assert.equal((await fetch(url + "/api/v1/inquiries", {
      method: "POST", headers: { "Content-Type": "application/json", Origin: "http://localhost:3000" }, body: "{invalid"
    })).status, 400);
  });
});
test("rate guard rejects request bursts and unavailable repo uses 503", async () => {
  const repo = repository();
  repo.writeInquiry = async () => { throw new Error("SENSITIVE INTERNAL SQL ERROR"); };
  await withApi(repo, async url => {
    const result = await submit(url, payload);
    assert.equal(result.status, 503);
    assert.doesNotMatch(JSON.stringify(await result.json()), /SENSITIVE INTERNAL/);
    for (let i=0; i<4; i++) await submit(url, { ...payload, message: "tiny" });
    const throttled = await submit(url, payload);
    assert.equal(throttled.status, 429);
    assert.ok(throttled.headers.get("retry-after"));
  });
});
test("production defaults never enable collection without explicit approved retention", async () => {
  const server = createApp().listen(0);
  try {
    await once(server, "listening");
    const address = server.address() as AddressInfo;
    assert.equal((await submit("http://127.0.0.1:" + address.port, payload)).status, 503);
  } finally {
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
});


test("honeypot bot input does not issue a receipt or create a stored inquiry", async () => {
  let writes = 0;
  const repo = repository();
  repo.writeInquiry = async () => { writes++; return { id: randomUUID(), created: true }; };
  await withApi(repo, async url => {
    const result = await submit(url, { ...payload, website: "spam target" });
    assert.equal(result.status, 204);
    assert.equal(writes, 0);
  });
});
