import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("admin console fails closed until OIDC and API configured",async ({page})=>{
  await page.goto("/admin");
  await expect(page.getByRole("heading",{name:"Content administration"})).toBeVisible();
  await expect(page.getByText(/disabled until a verified OIDC identity provider/)).toBeVisible();
  await expect(page.getByRole("button",{name:"Sign in securely"})).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content",/noindex/);
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
});
for(const width of [320,390,768,1440])test("admin no horizontal overflow at "+width,async({page})=>{
  await page.setViewportSize({width,height:850});await page.goto("/admin");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
