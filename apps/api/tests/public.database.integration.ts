import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { once } from "node:events";
import type { AddressInfo } from "node:net";
import { after, before, test } from "node:test";
import { getDatabase, disconnectDatabase } from "../src/db/client.js";
import { createApp } from "../src/app.js";

const db = getDatabase();
const slug = "m12-" + randomUUID().slice(0, 8);
let authorId = "";
let categoryId = "";
let projectId = "";
let server: ReturnType<ReturnType<typeof createApp>["listen"]>;
let base = "";
const inquiry = {
  name: "Contact Person", email: "HELLO@example.org",
  phone: "", company: "", service: "website",
  message: "We would like to discuss a new website for our business."
};

before(async () => {
  const author = await db.adminUser.create({
    data: { email: slug + "@example.invalid", displayName: "Integration Tester",
      authProvider: "test", authSubject: randomUUID() }
  });
  authorId = author.id;
  const category = await db.category.create({ data: { slug, name: "Test category" } });
  categoryId = category.id;
  await db.post.create({
    data: { slug: slug + "-draft", title: "Unpublished", authorId, categoryId }
  });
  await db.post.create({
    data: { slug: slug + "-published", title: "Published", excerpt: "Review excerpt", body: "Reviewed body",
      authorId, categoryId, status: "PUBLISHED", publishedAt: new Date() }
  });
  const project = await db.project.create({
    data: { slug: slug + "-published", name: "Published concept", description: "Reviewed",
      body: "Approved text", status: "PUBLISHED", publishedAt: new Date(), claimsReviewedAt: new Date() }
  });
  projectId = project.id;
  await db.project.create({ data: { slug: slug + "-draft", name: "Private project" } });
  server = createApp({ collectionEnabled: true, privacyApproved: true, retentionDays: 30 }).listen(0);
  await once(server, "listening");
  base = "http://127.0.0.1:" + (server.address() as AddressInfo).port;
});
after(async () => {
  if (server) await new Promise<void>(resolve => server.close(() => resolve()));
  await db.inquiry.deleteMany({ where: { email: "hello@example.org" } });
  await db.project.deleteMany({ where: { slug: { startsWith: slug } } });
  await db.post.deleteMany({ where: { slug: { startsWith: slug } } });
  if (categoryId) await db.category.delete({ where: { id: categoryId } });
  if (authorId) await db.adminUser.delete({ where: { id: authorId } });
  await disconnectDatabase();
});
test("published API hides draft posts/projects and returns reviewed records only", async () => {
  const posts = await fetch(base + "/api/v1/posts?category=" + slug);
  assert.equal(posts.status, 200);
  const body = await posts.json() as { items: Array<{ slug: string }> };
  assert.equal(body.items.filter(x => x.slug.startsWith(slug)).length, 1);
  assert.equal((await fetch(base + "/api/v1/posts/" + slug + "-draft")).status, 404);
  assert.equal((await fetch(base + "/api/v1/posts/" + slug + "-published")).status, 200);
  assert.equal((await fetch(base + "/api/v1/projects/" + slug + "-draft")).status, 404);
  assert.equal((await fetch(base + "/api/v1/projects/" + slug + "-published")).status, 200);
});
test("same idempotency key yields exactly one durable inquiry; changed details conflict", async () => {
  const key = randomUUID();
  const send = (value: object) => fetch(base + "/api/v1/inquiries", {
    method: "POST", headers: { "Content-Type": "application/json",
      "Idempotency-Key": key, Origin: "http://localhost:3000" },
    body: JSON.stringify(value)
  });
  const first = await send(inquiry);
  assert.equal(first.status, 201);
  const receipt = await first.json() as { receiptId: string; status: string; notification: string };
  assert.equal(receipt.status, "accepted");
  assert.equal(receipt.notification, "not_requested");
  const again = await send(inquiry);
  assert.equal(again.status, 200);
  assert.equal((await again.json() as { receiptId: string }).receiptId, receipt.receiptId);
  const conflict = await send({ ...inquiry, message: inquiry.message + " Change." });
  assert.equal(conflict.status, 409);
  const stored = await db.inquiry.findMany({ where: { idempotencyKey: key } });
  assert.equal(stored.length, 1);
  assert.equal(stored[0]?.email, "hello@example.org");
  assert.equal(stored[0]?.serviceId, "website");
  assert.ok(stored[0]?.retentionExpiresAt instanceof Date);
});
