import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { writeFile } from "node:fs/promises";

const viewports = [320, 375, 390, 768, 1024, 1440] as const;
const routes = [
  { slug: "home", url: "/", heading: "We Amplify" },
  { slug: "about", url: "/about", heading: "Growth Partner" },
  { slug: "services", url: "/services", heading: "Our Services" },
  { slug: "portfolio", url: "/portfolio", heading: "Our Portfolio" },
  { slug: "blog", url: "/blog", heading: "Insights That" },
  { slug: "article", url: "/blog?article=search", heading: "Insights That" },
  { slug: "contact", url: "/contact", heading: "AmplifyWorld" },
  { slug: "admin", url: "/admin", heading: "Content administration" }
] as const;

test.describe("Module 16 responsive visual evidence", () => {
  test.setTimeout(55_000);
  for (const width of viewports) {
    for (const route of routes) {
      test(route.slug + " renders within " + width + "px without clipping or runtime failure", async ({ page }, info) => {
        const errors: string[] = [];
        page.on("pageerror", error => errors.push(error.message));
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ reducedMotion: "reduce" });
        const response = await page.goto(route.url);
        expect(response?.status()).toBe(200);
        await expect(page.locator("main h1")).toContainText(route.heading);
        await page.evaluate(() => document.fonts.ready);
        // App Router may transiently render a streaming fallback after the first
        // H1 appears; measure the settled main rather than its loading shell.
        await page.waitForFunction(() => {
          const main = document.querySelector("main");
          return main?.querySelectorAll("h1").length === 1 && !main.hasAttribute("aria-busy");
        }, undefined, { timeout: 15_000 });
        await expect(page.locator(".site-footer")).toBeVisible();
        const layout = await page.evaluate(() => {
          const viewport = document.documentElement.clientWidth;
          const html = document.documentElement;
          const body = document.body;
          const main = document.querySelector("main");
          const shell = document.querySelector(".content-shell");
          const mainBox = main?.getBoundingClientRect();
          const shellBox = shell?.getBoundingClientRect();
          return {
            viewport,
            htmlWidth: html.scrollWidth,
            bodyWidth: body.scrollWidth,
            mainWidth: mainBox?.width ?? 0,
            mainX: mainBox?.x ?? -1,
            shellLeft: shellBox?.left ?? null,
            shellRight: shellBox?.right ?? null,
            headingCount: main?.querySelectorAll("h1").length ?? 0,
            brokenVisibleImages: Array.from(document.images).filter(img => {
              const r = img.getBoundingClientRect();
              const visible = r.bottom > 0 && r.top < window.innerHeight &&
                r.right > 0 && r.left < viewport;
              return visible && img.complete && img.naturalWidth === 0 && img.currentSrc !== "";
            }).map(img => img.currentSrc)
          };
        });
        expect(layout.headingCount).toBe(1);
        expect(layout.htmlWidth, JSON.stringify(layout)).toBeLessThanOrEqual(width + 1);
        expect(layout.bodyWidth, JSON.stringify(layout)).toBeLessThanOrEqual(width + 1);
        expect(layout.mainX).toBeGreaterThanOrEqual(-1);
        expect(layout.mainWidth).toBeLessThanOrEqual(width + 1);
        if (layout.shellLeft !== null) expect(layout.shellLeft).toBeGreaterThanOrEqual(-1);
        if (layout.shellRight !== null) expect(layout.shellRight).toBeLessThanOrEqual(width + 1);
        expect(layout.brokenVisibleImages).toEqual([]);
        expect(errors).toEqual([]);
        // CI screenshot evidence, not a claim of exact pixel parity with design mockups.
        await page.screenshot({ path: info.outputPath(route.slug + "-" + width + ".png"), fullPage: true, animations: "disabled" });
        await writeFile(info.outputPath(route.slug + "-" + width + ".json"),
          JSON.stringify({ route: route.url, width, ...layout }, null, 2));
      });
    }
  }
});

test.describe("Module 16 accessibility coverage", () => {
  test.setTimeout(55_000);
  for (const width of [390, 1440]) {
    for (const route of routes) {
      test(route.slug + " passes automated accessibility scan at " + width + "px", async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.goto(route.url);
        await expect(page.locator("main h1")).toBeVisible();
        const report = await new AxeBuilder({ page }).analyze();
        expect(report.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => n.target) }))).toEqual([]);
      });
    }
  }
});
