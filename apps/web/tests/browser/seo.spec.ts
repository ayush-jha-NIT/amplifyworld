import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("unconfigured preview metadata is nonindexable with no phantom canonical or JSON-LD", async ({page}) => {
  await page.goto("/");
  await expect(page.locator("meta[name='robots']")).toHaveAttribute("content",/noindex/);
  await expect(page.locator("link[rel='canonical']")).toHaveCount(0);
  await expect(page.locator("script[type='application/ld+json']")).toHaveCount(0);
  await expect(page.locator("main h1")).toHaveCount(1);
  await expect(page.locator("a.skip-link")).toHaveText("Skip to content");
  await page.keyboard.press("Tab");
  await expect(page.locator("a.skip-link")).toBeFocused();
});
test("robots disallows preview crawling and sitemap does not advertise fictional production domain",async({request})=>{
  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toContain("Disallow: /");
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  expect(await sitemap.text()).not.toContain("amplify.example");
});
test("original Blog and Portfolio example routes must remain noindex",async({page})=>{
  for(const route of ["/blog","/blog?article=search","/portfolio","/admin"]){
    await page.goto(route);
    await expect(page.locator("meta[name='robots']")).toHaveAttribute("content",/noindex/);
    await expect(page.locator("link[rel='canonical']")).toHaveCount(0);
  }
});
test("public marketing routes have headings, a keyboard route and no axe errors",async({page})=>{
  for(const route of ["/about","/contact"]){
    await page.goto(route);
    await expect(page.locator("main h1")).toBeVisible();
    await expect(page.locator("a.skip-link")).toHaveCount(1);
    expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  }
});
test("unknown page has meaningful 404 and noindex",async({page})=>{
  const response=await page.goto("/no-such-page-15");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading",{name:"This page is not available."})).toBeVisible();
  await expect(page.locator("meta[name='robots']").first()).toHaveAttribute("content",/noindex/);
});
