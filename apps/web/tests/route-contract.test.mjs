import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const routes = ["/", "/about", "/portfolio", "/blog", "/contact"];
test("all planned Module 1 routes exist", () => {
  for (const route of routes) {
    const filename = route === "/" ? "app/page.tsx" : `app${route}/page.tsx`;
    assert.ok(readFileSync(new URL(`../${filename}`, import.meta.url), "utf8").length > 10);
  }
});
