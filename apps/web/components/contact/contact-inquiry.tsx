"use client";

import { useMemo } from "react";
import { InquiryForm } from "./inquiry-form";
import { createHttpInquirySubmitter } from "./inquiry-adapter";

export function ContactInquiry() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const submitter = useMemo(() => {
    if (process.env.NEXT_PUBLIC_INQUIRIES_ENABLED !== "true" || !apiUrl) return undefined;
    try { return createHttpInquirySubmitter(apiUrl); } catch { return undefined; }
  }, [apiUrl]);
  return <InquiryForm submitInquiry={submitter} />;
}
