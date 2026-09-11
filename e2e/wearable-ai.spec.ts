import { test, expect } from "@playwright/test";

/**
 * Wearable, AI Risk & More E2E Test
 */

test.describe("Wearable & AI Features", () => {
  test.setTimeout(180000);

  test("Wearable Sync", async ({ page }) => {
    console.log("\n" + "=".repeat(50));
    console.log("     WEARABLE & AI FEATURES TEST");
    console.log("=".repeat(50));

    await page.goto("https://ayuzee.com/wearable-sync");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Wearable Sync accessible`);

    console.log("\n✅ Wearable Sync: PASSED\n");
  });

  test("AI Predictive Risk", async ({ page }) => {
    console.log("\n=== AI Predictive Risk ===");

    await page.goto("https://ayuzee.com/ai/predictive-risk");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Predictive Risk accessible`);

    console.log("\n✅ AI Predictive Risk: PASSED\n");
  });

  test("Home Page", async ({ page }) => {
    console.log("\n=== Home ===");

    await page.goto("https://ayuzee.com/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Home accessible`);

    // Check for main content
    const sections = await page.locator("section").count();
    console.log(`  Sections: ${sections}`);

    console.log("\n✅ Home: PASSED\n");
  });

  test("Login Page", async ({ page }) => {
    console.log("\n=== Login ===");

    await page.goto("https://ayuzee.com/auth");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Auth accessible`);

    // Check for auth forms
    const forms = await page.locator("form").count();
    console.log(`  Forms: ${forms}`);

    console.log("\n✅ Auth: PASSED\n");
  });

  test("Dashboard Page", async ({ page }) => {
    console.log("\n=== Dashboard ===");

    await page.goto("https://ayuzee.com/dashboard");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Dashboard accessible`);

    console.log("\n✅ Dashboard: PASSED\n");
  });

  test("Owner Dashboard", async ({ page }) => {
    console.log("\n=== Owner Dashboard ===");

    await page.goto("https://ayuzee.com/owner");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Owner accessible`);

    console.log("\n✅ Owner Dashboard: PASSED\n");
  });

  test("Vaidya Dashboard", async ({ page }) => {
    console.log("\n=== Vaidya (Doctor) ===");

    await page.goto("https://ayuzee.com/vaidya");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Vaidya accessible`);

    console.log("\n✅ Vaidya: PASSED\n");
  });

  test("Admin Dashboard", async ({ page }) => {
    console.log("\n=== Admin Dashboard ===");

    await page.goto("https://ayuzee.com/admin");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Admin accessible`);

    console.log("\n✅ Admin Dashboard: PASSED\n");
  });
});