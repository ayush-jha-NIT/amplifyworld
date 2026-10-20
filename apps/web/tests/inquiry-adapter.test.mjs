import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("frontend uses the real typed inquiry adapter with an explicit environment gate", () => {
  const wrapper = read("components/contact/contact-inquiry.tsx");
  const page = read("app/contact/page.tsx");
  const adapter = read("components/contact/inquiry-adapter.ts");
  assert.match(wrapper, /NEXT_PUBLIC_INQUIRIES_ENABLED/);
  assert.match(wrapper, /NEXT_PUBLIC_API_URL/);
  assert.match(page, /<ContactInquiry \/>/);
  assert.match(adapter, /fetch\(url\.href/);
  assert.match(adapter, /Idempotency-Key/);
  assert.match(adapter, /crypto\.randomUUID/);
  assert.match(adapter, /receiptPattern\.test/);
  assert.match(adapter, /"accepted"/);
});
