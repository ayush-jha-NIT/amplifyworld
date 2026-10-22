import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const read = p => readFileSync(new URL("../" + p, import.meta.url), "utf8");

test("Services page is separate and lists every defined shared service", () => {
  const page = read("app/services/page.tsx");
  assert.match(page, /export default function ServicesPage/);
  assert.match(page, /SERVICES\.map/);
  assert.match(page, /marketingWebPage\("\/services"/);
  assert.match(page, /id=\{service\.id\}/);
  for (const id of ["performance", "local", "website", "seo-geo", "agentic-ai", "social"]) {
    assert.ok(page.includes(id), id);
  }
});

test("All permanent Services navigation uses /services instead of the home anchor", () => {
  const header = read("components/site-header.tsx");
  const footer = read("components/site-footer.tsx");
  const about = read("app/about/page.tsx");
  assert.match(header, /href: "\/services", label: "Services"/);
  assert.match(footer, /href="\/services">Services/);
  assert.match(about, /href="\/services" className="about-secondary-action"/);
  assert.ok(!header.includes('href: "/#services", label: "Services"'));
  assert.ok(!footer.includes('href="/#services">Services'));
});
