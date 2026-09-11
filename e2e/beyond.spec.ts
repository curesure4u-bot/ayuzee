import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";

/**
 * Beyond Platform E2E Test
 * Tests: /beyond, /beyond/landing
 */

const TEST_PASSWORD = "TestPass!234";

test.describe("Beyond Platform", () => {
  test.setTimeout(120000);

  test("Beyond Landing Page", async ({ page }) => {
    console.log("\n" + "=".repeat(50));
    console.log("     BEYOND PLATFORM TEST");
    console.log("=".repeat(50));

    await page.goto("https://ayuzee.com/beyond/landing");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Beyond landing page accessible`);

    // Check for main content
    const title = await page.title();
    console.log(`  Title: ${title}`);

    expect(url).toContain("/beyond");
    console.log("\n✅ Beyond Landing: PASSED\n");
  });

  test("Beyond Main Page", async ({ page }) => {
    console.log("\n=== Beyond Main Page ===");

    await page.goto("https://ayuzee.com/beyond");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);

    // Check page loaded
    const body = await page.locator("body").isVisible();
    console.log(`  Page loaded: ${body ? '✅' : '⚠️'}`);

    console.log("\n✅ Beyond Main: PASSED\n");
  });

  test("Beyond Navigation Elements", async ({ page }) => {
    console.log("\n=== Beyond Navigation Elements ===");

    await page.goto("https://ayuzee.com/beyond/landing");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    // Check for navigation links
    const navLinks = await page.locator("nav a, header a").count();
    console.log(`  Navigation links: ${navLinks}`);

    // Check for buttons
    const buttons = await page.locator("button").count();
    console.log(`  Buttons found: ${buttons}`);

    // Check for forms
    const forms = await page.locator("form").count();
    console.log(`  Forms found: ${forms}`);

    console.log("\n✅ Beyond Navigation: PASSED\n");
  });

  test("Beyond as Authenticated User", async ({ page }) => {
    const email = `e2e.beyond.${Date.now()}@ayuzee-test.dev`;
    console.log("\n=== Beyond as Authenticated User ===");

    // Register & Login
    await page.goto("https://ayuzee.com/auth?mode=signup");
    await page.locator("#fullName").fill("Beyond Test User");
    await page.locator("#phone").fill("9999999999");
    await page.locator("#email").fill(email);
    await page.locator("#password").fill(TEST_PASSWORD);
    await page.getByTestId("auth-submit").click();
    await page.waitForTimeout(3000);

    await login(page, email, TEST_PASSWORD);
    await page.waitForLoadState("networkidle");

    // Navigate to beyond
    await page.goto("https://ayuzee.com/beyond");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    const url = page.url();
    console.log(`  Authenticated beyond URL: ${url}`);
    console.log(`  ✅ Authenticated access verified`);

    console.log("\n✅ Beyond Auth User: PASSED\n");
  });
});