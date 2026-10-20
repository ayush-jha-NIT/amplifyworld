import { SERVICES } from "@amplifyworld/shared";
import type { NotificationJob } from "./queue.js";

export type EmailResult =
  | { outcome: "accepted"; providerId: string }
  | { outcome: "retry" | "terminal"; retryAfter: number };

export type EmailSender = (job: NotificationJob) => Promise<EmailResult>;
export type ResendSettings = { apiKey: string; from: string; to: string };

const EMAIL = /^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/;
const CONTROLS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g;

/** Always fail closed if any verified sender/recipient or server secret is missing. */
export function resendSettings(env: NodeJS.ProcessEnv): ResendSettings {
  const apiKey = env.RESEND_API_KEY?.trim() ?? "";
  const from = env.RESEND_FROM_EMAIL?.trim() ?? "";
  const to = env.INQUIRY_NOTIFY_EMAIL?.trim() ?? "";
  if (env.INQUIRY_EMAIL_ENABLED !== "true" || !apiKey.startsWith("re_") ||
      apiKey.length < 12 || !EMAIL.test(from) || !EMAIL.test(to)) {
    throw new Error("Email delivery is not enabled or private Resend configuration is incomplete");
  }
  return { apiKey, from, to };
}

export function emailPayload(job: NotificationJob, settings: ResendSettings) {
  const clean = (value: string | null) => (value ?? "Not provided").replace(CONTROLS, "").slice(0, 5000);
  const service = SERVICES.find(item => item.id === job.serviceId)?.title ?? "Not sure yet";
  return {
    from: settings.from,
    to: [settings.to],
    subject: "New AmplifyWorld business inquiry",
    text: [
      "New business inquiry received.",
      "Receipt ID: " + job.id,
      "Name: " + clean(job.name),
      "Email: " + clean(job.email),
      "Phone: " + clean(job.phone),
      "Company: " + clean(job.company),
      "Service: " + service,
      "",
      "Message:",
      clean(job.message)
    ].join("\n")
  };
}

/** The same inquiry and same payload are retried with the same Resend idempotency key. */
export function createResendSender(settings: ResendSettings, request: typeof fetch = fetch): EmailSender {
  return async (job) => {
    try {
      const response = await request("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + settings.apiKey,
          "Content-Type": "application/json",
          "Idempotency-Key": "amplifyworld-inquiry/" + job.id
        },
        body: JSON.stringify(emailPayload(job, settings)),
        signal: AbortSignal.timeout(12_000),
        cache: "no-store"
      });
      if (response.ok) {
        const body: unknown = await response.json();
        const id = body && typeof body === "object" && "id" in body ? body.id : null;
        if (typeof id === "string" && id.length > 0 && id.length <= 128) {
          return { outcome: "accepted", providerId: id };
        }
        // An ambiguous success is retried within the provider's idempotency window.
        return { outcome: "retry", retryAfter: 60 };
      }
      const after = Number(response.headers.get("retry-after"));
      const retryAfter = Number.isFinite(after) && after >= 0 ? Math.ceil(after) : 0;
      if (response.status === 429 || response.status >= 500 || response.status === 409) {
        return { outcome: "retry", retryAfter };
      }
      return { outcome: "terminal", retryAfter: 0 };
    } catch {
      // Never expose HTTP response bodies, request headers, errors or submitted PII.
      return { outcome: "retry", retryAfter: 60 };
    }
  };
}
