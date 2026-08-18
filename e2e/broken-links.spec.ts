import { test, expect } from "@playwright/test";

test.describe("Navigation & Broken Links", () => {
  test("all main navigation links should resolve", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Get all internal links
    const links = await page.evaluate(() => {
      const anchors = document.querySelectorAll("a[href]");
      return Array.from(anchors)
        .map((a) => a.getAttribute("href"))
        .filter((href): href is string => !!href)
        .filter((href) => href.startsWith("/") || href.startsWith(window.location.origin))
        .filter((href) => !href.includes("#")) // Skip anchors
        .slice(0, 30); // Limit to first 30 for speed
    });

    const uniqueLinks = [...new Set(links)];
    const brokenLinks: string[] = [];

    for (const link of uniqueLinks) {
      const response = await page.goto(link);
      const status = response?.status() ?? 0;

      // SPA returns 200 for everything, but check for actual 404 content
      if (status >= 400) {
        brokenLinks.push(`${link} (${status})`);
      }

      const content = await page.content();
      if (content.includes("Page not found") || content.includes("404")) {
        brokenLinks.push(`${link} (shows 404 page)`);
      }
    }

    if (brokenLinks.length > 0) {
      console.log("Broken links found:", brokenLinks);
    }
    expect(brokenLinks).toHaveLength(0);
  });

  test("mobile navigation should be functional", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone X
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check for mobile menu button
    const menuButton = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"], [data-testid="mobile-menu"]').first();

    if (await menuButton.isVisible()) {
      await menuButton.click();
      await page.waitForTimeout(500);

      // Menu should be visible
      const nav = page.locator("nav").first();
      expect(await nav.isVisible()).toBeTruthy();
    }
  });
});

test.describe("Form Validation", () => {
  test("auth form should validate email format", async ({ page }) => {
    await page.goto("/auth");
    await page.waitForLoadState("networkidle");

    const emailInput = page.locator('input[type="email"]').first();
    const submitButton = page.locator('button[type="submit"]').first();

    if (await emailInput.isVisible()) {
      await emailInput.fill("invalid-email");
      await submitButton.click();
      await page.waitForTimeout(500);

      // Should show validation error
      const errorMessage = page.locator('[role="alert"], .text-destructive, .error-message').first();
      const hasError = await errorMessage.isVisible().catch(() => false);

      // Browser native validation or custom
      const validity = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valid);
      expect(hasError || !validity).toBeTruthy();
    }
  });

  test("contact form should require all fields", async ({ page }) => {
    await page.goto("/contact");
    await page.waitForLoadState("networkidle");

    const submitButton = page.locator('button[type="submit"]').first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(500);

      // Should not submit without required fields
      // URL should still be /contact
      expect(page.url()).toContain("/contact");
    }
  });
});
