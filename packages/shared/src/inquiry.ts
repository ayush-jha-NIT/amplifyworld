import { SERVICES } from "./index.js";

export const INQUIRY_FIELDS = ["name", "email", "phone", "company", "service", "message"] as const;
export type InquiryField = (typeof INQUIRY_FIELDS)[number];
export type InquiryInput = Record<InquiryField, string>;
export type InquiryFieldErrors = Partial<Record<InquiryField, string>>;

export const INQUIRY_LIMITS = { name: 100, email: 254, phone: 40, company: 150, message: 5000 } as const;

export type InquiryValidation =
  | { valid: true; data: InquiryInput }
  | { valid: false; errors: InquiryFieldErrors };

/** Single authoritative frontend/backend validation. Never log the raw payload. */
export function validateInquiryPayload(payload: unknown): InquiryValidation {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { valid: false, errors: { name: "Enter your full name." } };
  }
  const object = payload as Record<string, unknown>;
  const errors: InquiryFieldErrors = {};
  const values = Object.fromEntries(INQUIRY_FIELDS.map((field) => [
    field, typeof object[field] === "string" ? object[field].trim() : ""
  ])) as InquiryInput;
  values.email = values.email.toLowerCase();

  // Never silently accept an unknown field, especially accidental credentials.
  if (Object.keys(object).some((key) => !INQUIRY_FIELDS.includes(key as InquiryField))) {
    return { valid: false, errors: { message: "The inquiry contains unsupported fields." } };
  }
  if (!values.name) errors.name = "Enter your full name.";
  else if (values.name.length > INQUIRY_LIMITS.name) errors.name = "Use 100 characters or fewer.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = "Enter a valid email address.";
  else if (values.email.length > INQUIRY_LIMITS.email) errors.email = "Use 254 characters or fewer.";
  if (values.phone && (
    !/^\+?[\d\s().-]+$/.test(values.phone) ||
    !/^\d{7,15}$/.test(values.phone.replace(/\D/g, "")) ||
    values.phone.length > INQUIRY_LIMITS.phone
  )) errors.phone = "Enter 7–15 digits, with an optional country code, spaces, brackets or hyphens.";
  if (values.company.length > INQUIRY_LIMITS.company) errors.company = "Use 150 characters or fewer.";
  if (values.service !== "not-sure" && !SERVICES.some((service) => service.id === values.service)) {
    errors.service = "Select a service, or choose Not sure yet.";
  }
  if (values.message.length < 20) errors.message = "Tell us a little more: use at least 20 characters.";
  else if (values.message.length > INQUIRY_LIMITS.message) errors.message = "Use 5,000 characters or fewer.";
  return Object.keys(errors).length ? { valid: false, errors } : { valid: true, data: values };
}
