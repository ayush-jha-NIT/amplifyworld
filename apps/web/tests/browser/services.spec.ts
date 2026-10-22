import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("Services in navbar navigates to its own page", async ({ page }) => {
  await page.goto("/");
  const navigation = page.getByRole("navigation", { name: "Primary navigation" });
  await navigation.getByRole("link", { name: "Services" }).click();
  await expect(page).toHaveURL(/\/services$/);
  await expect(page.getByRole("heading", { name: /Our Services\./, level: 1 })).toBeVisible();
  await expect(navigation.getByRole("link", { name: "Services" })).toHaveAttribute("aria-current", "page");
  await expect(page.locator(".services-offer-card")).toHaveCount(6);
  await expect(page.getByRole("heading", { name: /Google Business Profile Optimization/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /SEO & GEO Optimization/ })).toBeVisible();
});

test("Individual homepage and About service links navigate to their corresponding detail", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Explore Meta Ads & Performance Marketing details/ }).click();
  await expect(page).toHaveURL(/\/services#performance$/);
  await expect(page.locator("#performance")).toBeVisible();
  await page.goto("/about");
  await page.getByRole("link", { name: "See Our Services" }).click();
  await expect(page).toHaveURL(/\/services$/);
});

test("Mobile navbar Services closes menu and loads the route", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 820 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Services" }).click();
  await expect(page).toHaveURL(/\/services$/);
  await expect(page.getByRole("button", { name: "Open navigation" })).toHaveAttribute("aria-expanded", "false");
});

for (const width of [320, 390, 768, 1440]) {
  test(`Services at ${width}px fits the viewport and passes axe`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/services");
    await expect(page.locator("main h1")).toHaveCount(1);
    await expect(page.locator(".services-offer-card")).toHaveCount(6);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  });
}
