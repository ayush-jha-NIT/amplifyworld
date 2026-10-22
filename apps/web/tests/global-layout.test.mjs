import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const text = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("shared header contains all six current routes, active state and mobile disclosure semantics", () => {
  const header = text("components/site-header.tsx");
  for (const path of ["/", "/about", "/services", "/portfolio", "/blog", "/contact"]) {
    assert.ok(header.includes(`href: "${path}"`));
  }
  for (const label of ["aria-expanded", "aria-controls", 'event.key === "Escape"', "aria-current"]) {
    assert.ok(header.includes(label));
  }
});

test("whatsapp buttons do not invent contact numbers", () => {
  const cta = text("components/whatsapp-cta.tsx");
  assert.ok(cta.includes("NEXT_PUBLIC_WHATSAPP_NUMBER"));
  assert.ok(cta.includes("data-whatsapp-state"));
  assert.ok(cta.includes("disabled"));
  assert.ok(cta.includes("wa.me/"));
  assert.ok(!cta.includes("1234567890"));
});

test("shared layout respects tokens, reduced motion and real logo sources", () => {
  const css = text("app/globals.css");
  assert.ok(css.includes("--canvas: #03040a"));
  assert.ok(css.includes("@media (prefers-reduced-motion: reduce)"));
  assert.ok(css.includes("@media (max-width: 1099px)"));
  assert.ok(css.includes("@media (max-width: 639px)"));
  const layout = text("app/layout.tsx");
  assert.ok(layout.includes("Skip to content"));
  assert.ok(layout.includes("SiteHeader"));
  assert.ok(layout.includes("PageTransition"));
  assert.ok(layout.includes("SiteFooter"));
  assert.ok(text("components/site-header.tsx").includes("/design/brand/logo-compact.webp"));
});

test("process and service section anchors are real", () => {
  const home = text("components/home/home-sections.tsx");
  assert.ok(home.includes('id="services"'));
  assert.ok(home.includes('id="process"'));
});
