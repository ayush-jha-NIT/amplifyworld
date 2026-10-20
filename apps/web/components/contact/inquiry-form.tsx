"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { SERVICES } from "@amplifyworld/shared";
import {
  EMPTY_INQUIRY, INQUIRY_FIELDS, INQUIRY_LABELS, INQUIRY_LIMITS,
  normalizeInquiry, submitWithDeadline, validateInquiry,
  type InquiryErrors, type InquiryField, type InquirySubmitter, type InquiryValues
} from "./inquiry";

type Phase = "idle" | "invalid" | "unavailable" | "submitting" | "success" | "failure";

// The production route intentionally supplies no submitter until Modules 11–13.
export function InquiryForm({ submitInquiry }: { submitInquiry?: InquirySubmitter }) {
  const [ready, setReady] = useState(false);
  const [values, setValues] = useState<InquiryValues>({ ...EMPTY_INQUIRY });
  const [errors, setErrors] = useState<InquiryErrors>({});
  const [phase, setPhase] = useState<Phase>("idle");
  const formRef = useRef<HTMLFormElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const inFlight = useRef(false);
  const accepted = useRef(false);
  const activeRequest = useRef<AbortController | null>(null);
  const mounted = useRef(false);
  const pendingFocus = useRef<InquiryField | null>(null);

  useEffect(() => {
    mounted.current = true;
    setReady(true);
    return () => {
      mounted.current = false;
      activeRequest.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (pendingFocus.current) {
      const field = formRef.current?.elements.namedItem(pendingFocus.current);
      if (field instanceof HTMLElement) field.focus();
      pendingFocus.current = null;
    } else if (["unavailable", "success", "failure"].includes(phase)) {
      statusRef.current?.focus();
    }
  }, [errors, phase]);

  function change(field: InquiryField, value: string) {
    const next = { ...values, [field]: value };
    setValues(next);
    if (errors[field]) {
      setErrors((previous) => ({ ...previous, [field]: validateInquiry(next)[field] }));
    }
    if (phase === "unavailable" || phase === "failure") setPhase("idle");
  }

  function showErrors(next: InquiryErrors) {
    pendingFocus.current = INQUIRY_FIELDS.find((field) => next[field]) ?? null;
    setErrors(next);
    setPhase("invalid");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // A synchronous lock also covers repeated Enter/programmatic submits before React renders.
    if (!ready || inFlight.current || accepted.current) return;
    if (honeypotRef.current?.value.trim()) {
      // Discard bot-filled forms without storing, emailing or issuing a fake receipt.
      setPhase("failure");
      return;
    }
    const nextErrors = validateInquiry(values);
    if (Object.keys(nextErrors).length) {
      showErrors(nextErrors);
      return;
    }
    setErrors({});
    if (!submitInquiry) {
      setPhase("unavailable");
      return;
    }

    inFlight.current = true;
    setPhase("submitting");
    const controller = new AbortController();
    activeRequest.current = controller;
    try {
      const result = await submitWithDeadline(submitInquiry, normalizeInquiry(values), controller);
      if (!mounted.current || controller.signal.aborted) return;
      if (result?.status === "accepted") {
        accepted.current = true;
        setPhase("success");
      } else if (result?.status === "invalid") {
        const fieldErrors = Object.fromEntries(
          INQUIRY_FIELDS.filter((field) => typeof result.errors?.[field] === "string" && result.errors[field])
            .map((field) => [field, result.errors[field]])
        );
        if (Object.keys(fieldErrors).length) showErrors(fieldErrors);
        else setPhase("failure");
      } else {
        setPhase("failure");
      }
    } catch {
      // A network failure cannot establish whether a server stored the inquiry.
      if (mounted.current) setPhase("failure");
    } finally {
      activeRequest.current = null;
      inFlight.current = false;
    }
  }

  const invalidFields = INQUIRY_FIELDS.filter((field) => errors[field]);
  const busy = phase === "submitting";
  const disabled = !ready || busy || phase === "success";
  const status = {
    idle: "", invalid: "",
    unavailable: "Your details pass the form checks. Submission is currently unavailable. Nothing has been sent.",
    submitting: "Sending your inquiry. Please wait for confirmation.",
    success: "Your inquiry has been received. Thank you for sharing your goals.",
    failure: "We couldn’t confirm receipt of your inquiry. Your details are still here. Please try again."
  }[phase];

  function fieldProps(field: InquiryField) {
    return {
      id: `inquiry-${field}`, name: field, value: values[field],
      "aria-invalid": errors[field] ? true as const : undefined,
      "aria-describedby": `${field === "message" ? "inquiry-message-hint " : ""}inquiry-${field}-error`,
      onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => change(field, event.target.value),
      onBlur: () => {
        const error = validateInquiry(values)[field];
        setErrors((previous) => ({ ...previous, [field]: error }));
      }
    };
  }

  return (
    <form className="contact-card inquiry-form" ref={formRef} onSubmit={handleSubmit} noValidate
      aria-labelledby="inquiry-title" aria-describedby="inquiry-availability" aria-busy={busy}>
      <p className="eyebrow">Share your project</p>
      <h2 id="inquiry-title">Let’s Discuss Your<br /><span className="gradient-text">Business Goals.</span></h2>
      <p>Tell us about your project and what you’d like to achieve.</p>
      <div id="inquiry-availability" className="inquiry-availability">
        {submitInquiry
          ? "Submit your inquiry to share these details with AmplifyWorld."
          : <><strong>Online inquiries are not open yet.</strong> You can check your details below, but this form
            does not send or save them. Please keep your own copy before leaving this page.</>}
      </div>
      <p className="inquiry-required">Fields marked <span aria-hidden="true">*</span> are required. Phone and company are optional.</p>
      {invalidFields.length > 0 && (
        <div className="inquiry-errors" role="alert">
          <p>Please check {invalidFields.length === 1 ? "this field" : "these fields"}:</p>
          <ul>{invalidFields.map((field) => (
            <li key={field}><a href={`#inquiry-${field}`} onClick={(event) => {
              event.preventDefault();
              const control = formRef.current?.elements.namedItem(field);
              if (control instanceof HTMLElement) control.focus();
            }}>{INQUIRY_LABELS[field]}: {errors[field]}</a></li>
          ))}</ul>
        </div>
      )}
      <div className="inquiry-honeypot" aria-hidden="true">
        <label htmlFor="inquiry-website">Leave this field empty</label>
        <input ref={honeypotRef} id="inquiry-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <fieldset disabled={disabled} className="inquiry-fields">
        <legend className="sr-only">Your contact and project details</legend>
        {(["name", "email", "phone", "company"] as const).map((field) => (
          <div className="inquiry-field" key={field}>
            <label htmlFor={`inquiry-${field}`}>{INQUIRY_LABELS[field]}{" "}
              {field === "name" || field === "email" ? <span aria-hidden="true">*</span> : "(optional)"}
            </label>
            <input {...fieldProps(field)}
              type={field === "email" ? "email" : field === "phone" ? "tel" : "text"}
              autoComplete={{ name: "name", email: "email", phone: "tel", company: "organization" }[field]}
              inputMode={field === "email" ? "email" : field === "phone" ? "tel" : "text"}
              required={field === "name" || field === "email"} maxLength={INQUIRY_LIMITS[field]} />
            <p className="inquiry-field-error" id={`inquiry-${field}-error`}>{errors[field]}</p>
          </div>
        ))}
        <div className="inquiry-field inquiry-full">
          <label htmlFor="inquiry-service">Service Interested In <span aria-hidden="true">*</span></label>
          <select {...fieldProps("service")} required>
            <option value="">Select a service</option>
            {SERVICES.map((service) => <option key={service.id} value={service.id}>{service.title}</option>)}
            <option value="not-sure">Not sure yet</option>
          </select>
          <p className="inquiry-field-error" id="inquiry-service-error">{errors.service}</p>
        </div>
        <div className="inquiry-field inquiry-full">
          <label htmlFor="inquiry-message">Project Details <span aria-hidden="true">*</span></label>
          <p id="inquiry-message-hint" className="inquiry-hint">20–5,000 characters. Please leave out passwords, payment details and other sensitive information.</p>
          <textarea {...fieldProps("message")} required minLength={20} maxLength={INQUIRY_LIMITS.message}
            rows={5} placeholder="Tell us about your goals and what you need." />
          <p className="inquiry-field-error" id="inquiry-message-error">{errors.message}</p>
        </div>
      </fieldset>
      <button type="submit" className="wa-cta inquiry-submit" disabled={disabled}
        aria-describedby="inquiry-availability">
        {busy ? "Sending…" : phase === "success" ? "Inquiry received" : submitInquiry
          ? phase === "failure" ? "Try Again" : "Send Message" : "Check Inquiry"}
        <span aria-hidden="true">{busy ? "…" : "↗"}</span>
      </button>
      <p hidden={ready} className="inquiry-script-notice">JavaScript is needed to check this form. Online submission is not available.</p>
      <div ref={statusRef} role="status" aria-live="polite" aria-atomic="true" tabIndex={-1}
        className={`inquiry-status ${status ? `inquiry-status-${phase}` : ""}`}>{status}</div>
      {phase === "success" && (
        <button type="button" className="contact-text-link" onClick={() => {
          accepted.current = false;
          pendingFocus.current = "name";
          setValues({ ...EMPTY_INQUIRY });
          setErrors({});
          setPhase("idle");
        }}>Start another inquiry</button>
      )}
    </form>
  );
}
