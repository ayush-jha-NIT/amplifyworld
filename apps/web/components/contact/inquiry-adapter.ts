"use client";

import type { InquirySubmitter, InquiryValues } from "./inquiry";

const receiptPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Retain idempotency key for identical retries, rotate on edited data. */
export function createHttpInquirySubmitter(baseUrl: string): InquirySubmitter {
  const url = new URL("/api/v1/inquiries", baseUrl.endsWith("/") ? baseUrl : baseUrl + "/");
  if (url.protocol !== "https:" && !(url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))) {
    throw new Error("A secure inquiry API is required.");
  }
  let fingerprint: string | undefined;
  let idempotencyKey: string | undefined;

  return async (values: InquiryValues, signal: AbortSignal) => {
    const canonical = JSON.stringify({
      name: values.name.trim(),
      email: values.email.trim().toLowerCase(),
      phone: values.phone.trim(),
      company: values.company.trim(),
      service: values.service.trim(),
      message: values.message.trim()
    });
    if (fingerprint !== canonical) {
      fingerprint = canonical;
      idempotencyKey = crypto.randomUUID();
    }
    const response = await fetch(url.href, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey! },
      body: canonical,
      signal,
      credentials: "omit",
      mode: "cors",
      cache: "no-store"
    });
    let body: unknown;
    try { body = await response.json(); } catch { throw new Error("Invalid API response"); }
    if (!body || typeof body !== "object") throw new Error("Invalid API response");
    const data = body as Record<string, unknown>;
    if (response.status === 422 && data.error && typeof data.error === "object") {
      const remote = data.error as { fields?: Record<string, unknown> };
      const allowed = ["name", "email", "phone", "company", "service", "message"] as const;
      const fields: Record<string, string> = {};
      for (const field of allowed) {
        if (typeof remote.fields?.[field] === "string") fields[field] = remote.fields[field] as string;
      }
      return { status: "invalid", errors: fields };
    }
    // Never claim success based on HTTP 200 alone. Require durable receipt UUID.
    if ((response.status === 201 || response.status === 200) && data.status === "accepted" &&
      typeof data.receiptId === "string" && receiptPattern.test(data.receiptId)) {
      return { status: "accepted" };
    }
    throw new Error("Inquiry receipt not confirmed");
  };
}
