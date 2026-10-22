import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

test("About is a complete server-rendered page with metadata and all approved sections", () => {
  const page = read("app/about/page.tsx");
  for (const anchor of [
    'className="about-hero"',
    'className="about-section about-story"',
    'className="about-section about-values"',
    'className="about-section about-partner"',
    'className="about-section about-expertise"',
    'className="about-final-cta"'
  ]) assert.ok(page.includes(anchor), anchor);

  for (const title of ["Our Mission", "Our Vision", "Results-Driven", "Innovation", "Transparency",
    "Long-Term Partnerships", "Talk to Amplify World", "See Our Services"]) {
    assert.ok(page.includes(title), title);
  }
  assert.match(page, /export const metadata: Metadata/);
  assert.match(page, /SERVICES\.map/);
  assert.match(page, /serviceDetails\[service.id\]/);
});

test("About art is a single owned decorative illustration, not a separate WebGL canvas", () => {
  const page = read("app/about/page.tsx");
  assert.match(page, /earth-beauty-1200\.webp/);
  assert.match(page, /logo-emblem\.webp/);
  assert.doesNotMatch(page, /Canvas|@react-three\/fiber|Math\.random/);
  assert.match(page, /aria-hidden="true"/);
});

test("About page keeps useful CTA navigation when WhatsApp is unconfigured", () => {
  const page = read("app/about/page.tsx");
  assert.match(page, /href="\/services"/);
  assert.match(page, /href="\/contact"/);
  assert.match(page, /href="\/portfolio"/);
  assert.match(page, /WhatsAppCta label="Talk to Amplify World"/);
  assert.ok(!page.includes("9999999999"));
});

test("About SVGs and standalone planet have real source assets", () => {
  for (const file of ["mission.svg", "vision.svg", "transparency.svg", "results.svg", "innovation.svg",
      "partnership.svg", "execute.svg"]) {
    assert.ok(existsSync(new URL("public/design/icons/" + file, root)), file);
  }
  assert.ok(existsSync(new URL("public/design/about/earth-beauty-1200.webp", root)));
});

test("About motion and responsive behavior respects accessibility choices", () => {
  const css = read("app/globals.css");
  for (const token of [".about-hero-grid", ".about-purpose-card", ".about-values-grid",
    ".about-partner-list", ".about-expertise-grid", ".about-final-cta",
    "@media (max-width: 1099px)", "@media (max-width: 850px)",
    "@media (max-width: 639px)", "@media (prefers-reduced-motion: reduce)"]) {
    assert.ok(css.includes(token), token);
  }
  const page = read("app/about/page.tsx");
  assert.match(page, /<SectionReveal>/);
});
