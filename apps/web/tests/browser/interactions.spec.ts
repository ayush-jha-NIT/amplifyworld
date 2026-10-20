import { expect, test } from "@playwright/test";

test.describe("Module 16 keyboard, motion and functional regressions", () => {
  test("mobile menu opens, Escape restores focus, navigating closes the disclosure", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 850 });
    await page.goto("/");
    const menu = page.getByRole("button", { name: "Open navigation" });
    await expect(menu).toBeVisible();
    await menu.click();
    const close = page.getByRole("button", { name: "Close navigation" });
    await expect(close).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Open navigation" })).toBeFocused();
    await expect(page.getByRole("button", { name: "Open navigation" })).toHaveAttribute("aria-expanded", "false");
    await page.getByRole("button", { name: "Open navigation" }).click();
    await page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Work" }).click();
    await expect(page).toHaveURL(/\/portfolio$/);
    await expect(page.getByRole("button", { name: "Open navigation" })).toHaveAttribute("aria-expanded", "false");
  });

  test("portfolio keyboard carousel, detail dialog Escape and focus restoration", async ({ page }) => {
    await page.goto("/portfolio");
    const stage = page.getByRole("region", { name: /Portfolio concepts/ });
    await expect(stage).toBeVisible();
    await expect(page.getByText("3 concepts found")).toBeVisible();
    const title = page.locator(".portfolio-selected-copy h3");
    const first = await title.textContent();
    await stage.focus();
    await page.keyboard.press("ArrowRight");
    await expect(title).not.toHaveText(first ?? "");
    const trigger = page.getByRole("button", { name: /Explore Concept/ });
    await trigger.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Concept / Placeholder").first()).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await page.getByRole("button", { name: "Performance Marketing", exact: true }).click();
    await expect(page.getByText("1 concept found")).toBeVisible();
    await expect(page.getByRole("button", { name: "Next concept" })).toBeDisabled();
    await page.getByRole("searchbox", { name: "Search projects" }).fill("no-matching-project-123");
    await expect(page.getByText("No matching concepts")).toBeVisible();
    await page.getByRole("button", { name: "Clear filters" }).click();
    await expect(page.getByText("3 concepts found")).toBeVisible();
  });

  test("blog inline reader keeps same URL path, history Back/Forward, TOC and focus", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.getByText("4 articles found")).toBeVisible();
    await page.locator(".blog-card").first().click();
    await expect(page).toHaveURL(/\/blog\?article=/);
    const article = page.getByRole("article", { name: /A clearer path from search/i });
    await expect(article).toBeVisible();
    await expect(article.getByRole("heading", { level: 2 })).toBeFocused();
    await expect(page.getByRole("navigation", { name: "In this article" }).getByRole("link").first()).toHaveAttribute("href", /^#article-section-/);
    await page.goBack();
    await expect(page).toHaveURL(/\/blog$/);
    await expect(page.locator(".blog-reader-placeholder")).toHaveCount(1);
    await page.goForward();
    await expect(page).toHaveURL(/\/blog\?article=/);
    await expect(article).toBeVisible();
    await page.getByRole("button", { name: "Back to articles" }).click();
    await expect(page).toHaveURL(/\/blog$/);
    await page.getByRole("searchbox", { name: "Search articles" }).fill("never-matching-query-999");
    await expect(page.getByText("No matching articles")).toBeVisible();
    await page.getByRole("button", { name: "Clear filters" }).click();
    await expect(page.getByText("4 articles found")).toBeVisible();
  });

  test("direct sample article and unavailable slug stay honest", async ({ page }) => {
    await page.goto("/blog?article=search");
    await expect(page.getByRole("article", { name: /A clearer path from search/i })).toBeVisible();
    await page.goto("/blog?article=does-not-exist");
    await expect(page.getByRole("heading", { name: "Article unavailable" })).toBeVisible();
    await page.getByRole("button", { name: "Back to articles" }).click();
    await expect(page).toHaveURL(/\/blog$/);
  });

  test("reduced motion and keyboard skip are usable without a spinning WebGL scene", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main-content$/);
    await expect(page.getByRole("button", { name: "Pause motion" })).toBeDisabled();
    await expect(page.getByRole("button", { name: /Replay/ })).toBeDisabled();
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(page.locator(".hero-visual")).toHaveAttribute("data-hero-state", "complete");
  });

  test("form cannot claim delivery without configured API, including after a retry", async ({ page }) => {
    const posts: string[] = [];
    page.on("request", request => { if (request.method() === "POST") posts.push(request.url()); });
    await page.goto("/contact");
    const form = page.getByRole("form");
    await form.getByRole("button", { name: /Check Inquiry/ }).click();
    await expect(page.getByRole("textbox", { name: "Full Name", exact: true })).toBeFocused();
    await page.getByRole("textbox", { name: "Full Name", exact: true }).fill("Module Sixteen Visitor");
    await page.getByRole("textbox", { name: "Email Address", exact: true }).fill("sample@example.org");
    await page.getByRole("combobox", { name: "Service Interested In" }).selectOption("not-sure");
    await page.getByRole("textbox", { name: "Project Details" }).fill("We would like help planning a growth website.");
    await form.getByRole("button", { name: /Check Inquiry/ }).click();
    await expect(page.getByRole("status")).toContainText("Nothing has been sent");
    await expect(page.getByRole("textbox", { name: "Full Name", exact: true })).toHaveValue("Module Sixteen Visitor");
    expect(posts).toEqual([]);
  });

  for (const viewport of [390, 1440]) {
    test("browser zoom 200 percent does not clip headings or controls at " + viewport, async ({ page }) => {
      await page.setViewportSize({ width: viewport, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      // Chromium uses the zoom CSS property in place of OS display scaling in headless CI.
      await page.goto("/contact");
      await page.addStyleTag({ content: "html { zoom: 2; }" });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(2);
      await expect(page.getByRole("textbox", { name: "Full Name" })).toBeVisible();
    });
  }
});
