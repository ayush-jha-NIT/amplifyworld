import { getDatabase } from "../db/client.js";
import type { InquiryInput } from "@amplifyworld/shared/inquiry";

export type Listing = { limit: number; offset: number; category?: string };
export type InquiryReceipt = { id: string; created: boolean } | { conflict: true };
export interface PublicRepository {
  listPosts(query: Listing): Promise<{ items: unknown[]; total: number }>;
  readPost(slug: string): Promise<unknown | null>;
  listProjects(query: Listing): Promise<{ items: unknown[]; total: number }>;
  readProject(slug: string): Promise<unknown | null>;
  writeInquiry(data: InquiryInput, key: string, requestHash: string, retentionDays: number): Promise<InquiryReceipt>;
  ready(): Promise<boolean>;
}
function postWhere(category?: string) {
  return { status: "PUBLISHED" as const, publishedAt: { lte: new Date() }, ...(category ? { category: { slug: category } } : {}) };
}
function projectWhere(category?: string) {
  return {
    status: "PUBLISHED" as const,
    publishedAt: { lte: new Date() }, claimsReviewedAt: { not: null },
    ...(category ? { categories: { some: { category: { slug: category } } } } : {})
  };
}
export const prismaPublicRepository: PublicRepository = {
  async listPosts(q) {
    const db = getDatabase(); const where = postWhere(q.category);
    const [items, total] = await Promise.all([
      db.post.findMany({
        where, orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
        skip: q.offset, take: q.limit,
        select: { slug: true, title: true, excerpt: true, coverImageUrl: true, coverImageAlt: true,
          publishedAt: true, category: { select: { slug: true, name: true } } }
      }),
      db.post.count({ where })
    ]);
    return { items, total };
  },
  async readPost(slug) {
    return getDatabase().post.findFirst({
      where: { slug, ...postWhere() },
      select: { slug: true, title: true, excerpt: true, body: true,
        coverImageUrl: true, coverImageAlt: true, publishedAt: true,
        seoTitle: true, seoDescription: true, category: { select: { slug: true, name: true } } }
    });
  },
  async listProjects(q) {
    const db = getDatabase(); const where = projectWhere(q.category);
    const [items, total] = await Promise.all([
      db.project.findMany({
        where, orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }, { id: "desc" }],
        skip: q.offset, take: q.limit,
        select: { slug: true, name: true, description: true, clientName: true,
          websiteUrl: true, publishedAt: true,
          categories: { select: { category: { select: { slug: true, name: true } } } },
          services: { select: { service: { select: { id: true, name: true } } } },
          media: { orderBy: { sortOrder: "asc" }, select: { kind: true, url: true, alt: true, sortOrder: true } } }
      }),
      db.project.count({ where })
    ]);
    return { items, total };
  },
  async readProject(slug) {
    return getDatabase().project.findFirst({
      where: { slug, ...projectWhere() },
      select: { slug: true, name: true, description: true, body: true, clientName: true,
        websiteUrl: true, seoTitle: true, seoDescription: true, publishedAt: true,
        categories: { select: { category: { select: { slug: true, name: true } } } },
        services: { select: { service: { select: { id: true, name: true } } } },
        media: { orderBy: { sortOrder: "asc" }, select: { kind: true, url: true, alt: true, sortOrder: true } } }
    });
  },
  async writeInquiry(data, key, requestHash, retentionDays) {
    const db = getDatabase();
    try {
      const entry = await db.inquiry.create({
        data: { name: data.name, email: data.email, phone: data.phone || null, company: data.company || null,
          message: data.message, serviceId: data.service === "not-sure" ? null : data.service,
          idempotencyKey: key, requestHash,
          retentionExpiresAt: new Date(Date.now() + retentionDays * 86_400_000) },
        select: { id: true }
      });
      return { id: entry.id, created: true };
    } catch (error: unknown) {
      if (typeof error !== "object" || error === null || !("code" in error) || error.code !== "P2002") throw error;
      const old = await db.inquiry.findUnique({ where: { idempotencyKey: key }, select: { id: true, requestHash: true } });
      if (!old) throw error;
      return old.requestHash === requestHash ? { id: old.id, created: false } : { conflict: true };
    }
  },
  async ready() {
    // SQL is a fixed trusted literal, never interpolated user input.
    await getDatabase().$queryRawUnsafe("SELECT 1");
    return true;
  }
};
