import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("home page integrates the animated hero and all Module 6 sections", () => {
  const page = read("app/page.tsx");
  assert.match(page, /<HomeHero\s*\/>/);
  assert.match(page, /<HomeSections\s*\/>/);
  const sections = read("components/home/home-sections.tsx");
  for (const id of ['id="services"', 'id="why-us"', 'id="featured-work"', 'id="process"']) {
    assert.ok(sections.includes(id), id);
  }
  assert.match(sections, /home-horizon-cta/);
});

test("service descriptions cover the six exact shared categories", () => {
  const content = read("components/home/home-content.ts");
  for (const id of ["performance", "local", "website", '"seo-geo"', '"agentic-ai"', "social"]) {
    assert.ok(content.includes(id), id);
  }
  assert.match(read("components/home/home-sections.tsx"), /SERVICES\.map/);
});

test("featured artwork is disclosed as concepts without false claims", () => {
  const sections = read("components/home/home-sections.tsx");
  assert.match(sections, /Concept \/ Placeholder/);
  assert.match(sections, /not client projects or performance claims/);
  assert.match(sections, /loading="lazy"/);
  assert.ok(!sections.includes("98%"));
  assert.ok(!sections.includes("500+"));
});

test("reveal is a one-shot motion enhancement and respects reduced-motion", () => {
  const reveal = read("components/home/section-reveal.tsx");
  for (const token of ["IntersectionObserver", "prefers-reduced-motion", "played", "observer.disconnect()", "context.revert()"]) {
    assert.ok(reveal.includes(token), token);
  }
});

test("services and process icons are represented as original assets", () => {
  const section = read("components/home/home-sections.tsx");
  assert.match(section, /\/design\/icons\//);
  assert.match(section, /\/design\/templates\//);
  for (const asset of ["performance.svg", "agent.svg", "partnership.svg", "project-website.svg", "project-local.svg"]) {
    const folder = asset.includes("project-") ? "templates" : "icons";
    assert.ok(readFileSync(new URL(`../public/design/${folder}/${asset}`, import.meta.url)).length > 20);
  }
});
