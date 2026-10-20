import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";
import { Client } from "pg";
import { SERVICES } from "@amplifyworld/shared";
import { getDatabase, disconnectDatabase } from "../src/db/client.js";
import { databaseUrl } from "../src/db/config.js";

const db = getDatabase();
const sql = new Client({ connectionString: databaseUrl(process.env.DATABASE_URL, "DATABASE_URL", "runtime") });
let authorId: string;
let categoryId: string;
const message = "Please help with our business website.";
const inquiry = { name: "Test Contact", email: "test@example.invalid", message };

before(async () => {
  await sql.connect();
  const author = await db.adminUser.create({
    data: { email: "editor@example.invalid", displayName: "Test Editor", authProvider: "test", authSubject: randomUUID() }
  });
  authorId = author.id;
  categoryId = (await db.category.create({ data: { slug: "test-category", name: "Test category" } })).id;
});

after(async () => {
  await Promise.all([disconnectDatabase(), sql.end()]);
});

async function rejectsSql(statement: string, values: unknown[], code: string, constraint?: string) {
  await assert.rejects(sql.query(statement, values), (error: unknown) => {
    const actual = error as { code?: string; constraint?: string };
    assert.equal(actual.code, code);
    if (constraint) assert.equal(actual.constraint, constraint);
    return true;
  });
}

test("migrations seed exactly the approved service catalog and no business data", async () => {
  const services = await db.service.findMany({ orderBy: { id: "asc" } });
  assert.deepEqual(services.map(({ id, name }) => ({ id, title: name })),
    [...SERVICES].sort((a, b) => a.id.localeCompare(b.id)));
  assert.equal(await db.post.count(), 0);
  assert.equal(await db.project.count(), 0);
  assert.equal(await db.inquiry.count(), 0);
  assert.equal(await db.adminUser.count(), 1); // Only the fixture from before().
});

test("Prisma CRUD uses UUIDs, UTC timestamps and safe defaults", async () => {
  const admin = await db.adminUser.findUniqueOrThrow({ where: { id: authorId } });
  assert.equal(admin.role, "EDITOR");
  assert.equal(admin.isActive, false);
  const lead = await db.inquiry.create({ data: inquiry });
  assert.match(lead.id, /^[0-9a-f-]{36}$/);
  assert.equal(lead.status, "NEW");
  assert.equal(lead.notificationStatus, "NOT_REQUESTED");
  assert.equal(lead.notificationAttempts, 0);
  assert.equal(lead.notifiedAt, null);
  assert.equal(lead.serviceId, null);
  assert.ok(lead.createdAt instanceof Date);
  assert.ok(lead.updatedAt >= lead.createdAt);
  const post = await db.post.create({ data: { slug: "draft-post", title: "Draft", authorId, categoryId } });
  assert.equal(post.status, "DRAFT");
  assert.equal(post.publishedAt, null);
  const project = await db.project.create({ data: { slug: "draft-project", name: "Draft" } });
  assert.equal(project.status, "DRAFT");
  assert.equal(project.claimsReviewedAt, null);
});

test("slugs, emails and external identities enforce normalization and uniqueness", async () => {
  await rejectsSql("INSERT INTO categories (slug, name) VALUES ($1, $2)", ["Test Category", "Test"], "23514", "categories_slug_format");
  await rejectsSql("INSERT INTO categories (slug, name) VALUES ($1, $2)", ["test-category", "Duplicate"], "23505");
  await rejectsSql("UPDATE admin_users SET email = $1 WHERE id = $2", ["EDITOR@example.invalid", authorId], "23514", "admin_users_email_normalized");
  const admin = await db.adminUser.findUniqueOrThrow({ where: { id: authorId } });
  await assert.rejects(db.adminUser.create({
    data: { email: admin.email, displayName: "Duplicate", authProvider: "test", authSubject: randomUUID() }
  }), { code: "P2002" });
  await assert.rejects(db.adminUser.create({
    data: { email: "other@example.invalid", displayName: "Duplicate", authProvider: admin.authProvider, authSubject: admin.authSubject }
  }), { code: "P2002" });
  await assert.rejects(db.post.create({ data: { slug: "draft-post", title: "Duplicate", authorId, categoryId } }), { code: "P2002" });
});

test("publication requires content, timestamps and project claim review", async () => {
  await rejectsSql("UPDATE posts SET status = 'PUBLISHED' WHERE slug = 'draft-post'", [], "23514", "posts_published_content");
  await rejectsSql("UPDATE posts SET cover_image_url = '/test.png' WHERE slug = 'draft-post'", [], "23514", "posts_cover_accessibility");
  const published = await db.post.update({
    where: { slug: "draft-post" },
    data: { status: "PUBLISHED", publishedAt: new Date(), excerpt: "Reviewed excerpt", body: "Reviewed article" }
  });
  assert.equal(published.status, "PUBLISHED");
  await rejectsSql("UPDATE projects SET status = 'PUBLISHED', published_at = now(), description = 'Reviewed', body = 'Content' WHERE slug = 'draft-project'",
    [], "23514", "projects_publication_review");
  await db.project.update({
    where: { slug: "draft-project" },
    data: { status: "PUBLISHED", publishedAt: new Date(), claimsReviewedAt: new Date(), description: "Reviewed", body: "Reviewed case study" }
  });
});

test("inquiry constraints enforce contact bounds, notification state and retention", async () => {
  const lead = await db.inquiry.create({ data: { ...inquiry, serviceId: "website", phone: "+1 (212) 555-0100" } });
  await rejectsSql("UPDATE inquiries SET message = 'short' WHERE id = $1", [lead.id], "23514", "inquiries_message_length");
  await rejectsSql("UPDATE inquiries SET email = ' INVALID@example.invalid ' WHERE id = $1", [lead.id], "23514", "inquiries_email_normalized");
  await rejectsSql("UPDATE inquiries SET name = ' ' WHERE id = $1", [lead.id], "23514", "inquiries_name_nonempty");
  await rejectsSql("UPDATE inquiries SET phone = '123' WHERE id = $1", [lead.id], "23514", "inquiries_optional_details");
  await rejectsSql("UPDATE inquiries SET name = $1 WHERE id = $2", ["x".repeat(101), lead.id], "22001");
  await rejectsSql("UPDATE inquiries SET notification_attempts = -1 WHERE id = $1", [lead.id], "23514", "inquiries_notification_attempts");
  await rejectsSql("UPDATE inquiries SET notification_status = 'SENT' WHERE id = $1", [lead.id], "23514", "inquiries_sent_timestamp");
  await rejectsSql("UPDATE inquiries SET retention_expires_at = created_at WHERE id = $1", [lead.id], "23514", "inquiries_retention_after_creation");
  await db.inquiry.update({ where: { id: lead.id }, data: { notificationStatus: "SENT", notifiedAt: new Date(), notificationAttempts: 1 } });
});

test("idempotency keys prevent duplicate receipt while repeated contacts remain allowed", async () => {
  const idempotencyKey = randomUUID();
  const data = { ...inquiry, idempotencyKey, requestHash: "a".repeat(64) };
  const results = await Promise.allSettled([db.inquiry.create({ data }), db.inquiry.create({ data })]);
  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
  const rejected = results.find((result) => result.status === "rejected");
  assert.equal((rejected as PromiseRejectedResult).reason.code, "P2002");
  await db.inquiry.create({ data: inquiry }); // Email is deliberately not unique.
  await rejectsSql("UPDATE inquiries SET request_hash = NULL WHERE idempotency_key = $1", [idempotencyKey], "23514", "inquiries_idempotency_pair");
  await rejectsSql("UPDATE inquiries SET request_hash = $1 WHERE idempotency_key = $2", ["z".repeat(64), idempotencyKey], "23514", "inquiries_idempotency_pair");
});

test("foreign keys restrict referenced authors, categories and unknown services", async () => {
  await assert.rejects(db.adminUser.delete({ where: { id: authorId } }), { code: "P2003" });
  await assert.rejects(db.category.delete({ where: { id: categoryId } }), { code: "P2003" });
  await assert.rejects(db.inquiry.create({ data: { ...inquiry, serviceId: "unknown" } }), { code: "P2003" });
});

test("project taxonomy and media reject duplicates and cascade on project deletion", async () => {
  const project = await db.project.create({
    data: {
      slug: "delete-project", name: "Disposable",
      categories: { create: { categoryId } },
      services: { create: { serviceId: "website" } },
      media: { create: { url: "/test.png", alt: "Test asset" } }
    }
  });
  await assert.rejects(db.projectCategory.create({ data: { projectId: project.id, categoryId } }), { code: "P2002" });
  await assert.rejects(db.projectMedia.create({ data: { projectId: project.id, url: "/other.png", alt: "Other", sortOrder: 0 } }), { code: "P2002" });
  await rejectsSql("UPDATE project_media SET sort_order = -1 WHERE project_id = $1", [project.id], "23514", "project_media_sort_order");
  await db.project.delete({ where: { id: project.id } });
  assert.equal(await db.projectMedia.count({ where: { projectId: project.id } }), 0);
  assert.equal(await db.projectCategory.count({ where: { projectId: project.id } }), 0);
  assert.equal(await db.projectService.count({ where: { projectId: project.id } }), 0);
});

test("deleting an unreferenced admin preserves project and audit history", async () => {
  const admin = await db.adminUser.create({
    data: { email: "remove@example.invalid", displayName: "Temporary", authProvider: "test", authSubject: randomUUID() }
  });
  const project = await db.project.create({ data: { slug: "preserve-project", name: "History", createdById: admin.id } });
  const audit = await db.auditEvent.create({ data: { actorId: admin.id, action: "create", entityType: "project", entityId: project.id } });
  await db.adminUser.delete({ where: { id: admin.id } });
  assert.equal((await db.project.findUniqueOrThrow({ where: { id: project.id } })).createdById, null);
  assert.equal((await db.auditEvent.findUniqueOrThrow({ where: { id: audit.id } })).actorId, null);
});

test("transaction failures roll back every write", async () => {
  await assert.rejects(db.$transaction(async (tx) => {
    await tx.category.create({ data: { slug: "rolled-back", name: "Temporary" } });
    throw new Error("intentional rollback");
  }), /intentional rollback/);
  assert.equal(await db.category.findUnique({ where: { slug: "rolled-back" } }), null);
});

test("timestamps update for direct SQL and Prisma, including database triggers", async () => {
  const old = new Date("2020-01-01T00:00:00.000Z");
  const lead = await db.inquiry.create({ data: { ...inquiry, createdAt: old, updatedAt: old } });
  await sql.query("UPDATE inquiries SET company = 'Test company' WHERE id = $1", [lead.id]);
  const fromSql = await db.inquiry.findUniqueOrThrow({ where: { id: lead.id } });
  assert.ok(fromSql.updatedAt > old);
  const fromPrisma = await db.inquiry.update({ where: { id: lead.id }, data: { status: "IN_PROGRESS" } });
  assert.ok(fromPrisma.updatedAt >= fromSql.updatedAt);
  const triggers = await sql.query("SELECT count(*)::int AS count FROM pg_trigger WHERE tgname LIKE '%_updated_at' AND NOT tgisinternal");
  assert.equal(triggers.rows[0].count, 7);
});

test("query indexes exist and the runtime role cannot migrate or rewrite audit/catalog data", async () => {
  const indexes = await sql.query("SELECT indexname FROM pg_indexes WHERE schemaname = 'public'");
  const names = new Set(indexes.rows.map((row) => row.indexname));
  for (const name of ["posts_status_published_at_id_idx", "projects_status_sort_order_published_at_id_idx",
    "inquiries_status_created_at_id_idx", "inquiries_notification_status_next_notification_at_idx",
    "inquiries_retention_expires_at_idx", "inquiries_idempotency_key_key"]) assert.ok(names.has(name), name);
  await rejectsSql("CREATE TABLE forbidden (id integer)", [], "42501");
  await rejectsSql("DELETE FROM services", [], "42501");
  await rejectsSql("UPDATE audit_events SET action = 'tampered'", [], "42501");
  await rejectsSql("DELETE FROM audit_events", [], "42501");
});
