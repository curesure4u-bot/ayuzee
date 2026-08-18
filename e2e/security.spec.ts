import { test, expect } from "@playwright/test";

test.describe("Security Headers", () => {
  test("should return proper security headers", async ({ page }) => {
    const response = await page.goto("/");
    const headers = response?.headers() ?? {};

    // X-Frame-Options prevents clickjacking
    expect(headers["x-frame-options"]?.toLowerCase()).toBe("sameorigin");

    // Prevents MIME type sniffing
    expect(headers["x-content-type-options"]).toBe("nosniff");

    // Referrer policy
    expect(headers["referrer-policy"]).toBeTruthy();
  });

  test("should not expose sensitive information in HTML source", async ({ page }) => {
    await page.goto("/");
    const html = await page.content();

    // No API keys in HTML
    expect(html).not.toMatch(/sk_live_[a-zA-Z0-9]+/); // Stripe live keys
    expect(html).not.toMatch(/rzp_live_[a-zA-Z0-9]+/); // Razorpay live keys
    expect(html).not.toMatch(/password\s*[:=]\s*["'][^"']+["']/i);
  });

  test("should not have exposed .env or sensitive files", async ({ page }) => {
    const sensitiveRoutes = ["/.env", "/.git/config", "/wp-admin", "/phpinfo.php"];

    for (const route of sensitiveRoutes) {
      const response = await page.goto(route);
      // SPA will return 200 with index.html for all routes due to redirects
      // But the content should be the SPA, not actual sensitive files
      const content = await page.content();
      expect(content).not.toContain("DB_PASSWORD");
      expect(content).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
    }
  });
});

test.describe("Authentication Security", () => {
  test("protected routes should redirect to auth", async ({ page }) => {
    // Try accessing a protected page without auth
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Should either redirect to /auth or show login prompt
    const url = page.url();
    const content = await page.content();
    const isProtected = url.includes("/auth") || content.includes("Sign in") || content.includes("Login");
    expect(isProtected).toBeTruthy();
  });

  test("should not expose user data in local storage without auth", async ({ page }) => {
    await page.goto("/");
    const localStorage = await page.evaluate(() => {
      const items: Record<string, string> = {};
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key) items[key] = window.localStorage.getItem(key) ?? "";
      }
      return items;
    });

    // No auth tokens should be present without logging in
    const sensitiveKeys = Object.keys(localStorage).filter(
      (k) => k.includes("token") || k.includes("session") || k.includes("password")
    );
    expect(sensitiveKeys).toHaveLength(0);
  });
});

test.describe("XSS Prevention", () => {
  test("search input should sanitize XSS payloads", async ({ page }) => {
    await page.goto("/search");
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], input[name="search"]').first();

    if (await searchInput.isVisible()) {
      await searchInput.fill('<script>alert("xss")</script>');
      await searchInput.press("Enter");
      await page.waitForTimeout(1000);

      // No alert dialog should appear
      const dialogPromise = page.waitForEvent("dialog", { timeout: 2000 }).catch(() => null);
      const dialog = await dialogPromise;
      expect(dialog).toBeNull();
    }
  });
});
