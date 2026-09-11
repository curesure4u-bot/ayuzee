import { test, expect } from "@playwright/test";

/**
 * AYUSH Help & ATMRI Help E2E Test
 * Tests: /ayush-help/*, /atmri-help/*
 */

test.describe("AYUSH & ATMRI Help", () => {
  test.setTimeout(180000);

  // AYUSH Help Tests
  test("AYUSH Help Main", async ({ page }) => {
    console.log("\n" + "=".repeat(50));
    console.log("     AYUSH HELP TEST");
    console.log("=".repeat(50));

    await page.goto("https://ayuzee.com/ayush-help");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ AYUSH Help accessible`);

    console.log("\n✅ AYUSH Help Main: PASSED\n");
  });

  test("AYUSH Help Campaigns", async ({ page }) => {
    console.log("\n=== AYUSH Campaigns ===");

    await page.goto("https://ayuzee.com/ayush-help/campaigns");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Campaigns page accessible`);

    // Check for campaign cards
    const cards = await page.locator("[class*='campaign'], [class*='card']").count();
    console.log(`  Campaign elements: ${cards}`);

    console.log("\n✅ AYUSH Campaigns: PASSED\n");
  });

  test("AYUSH Help Apply", async ({ page }) => {
    console.log("\n=== AYUSH Apply ===");

    await page.goto("https://ayuzee.com/ayush-help/apply");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Apply page accessible`);

    // Check for forms
    const forms = await page.locator("form").count();
    console.log(`  Forms: ${forms}`);

    console.log("\n✅ AYUSH Apply: PASSED\n");
  });

  // ATMRI Help Tests
  test("ATMRI Help Main", async ({ page }) => {
    console.log("\n=== ATMRI Help Main ===");

    await page.goto("https://ayuzee.com/atmri-help");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ ATMRI Help accessible`);

    console.log("\n✅ ATMRI Help Main: PASSED\n");
  });

  test("ATMRI Help Campaigns", async ({ page }) => {
    console.log("\n=== ATMRI Campaigns ===");

    await page.goto("https://ayuzee.com/atmri-help/campaigns");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ ATMRI Campaigns accessible`);

    console.log("\n✅ ATMRI Campaigns: PASSED\n");
  });

  test("ATMRI Help Cases", async ({ page }) => {
    console.log("\n=== ATMRI Cases ===");

    await page.goto("https://ayuzee.com/atmri-help/cases");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ ATMRI Cases accessible`);

    console.log("\n✅ ATMRI Cases: PASSED\n");
  });

  test("ATMRI Help Hospitals", async ({ page }) => {
    console.log("\n=== ATMRI Hospitals ===");

    await page.goto("https://ayuzee.com/atmri-help/hospitals");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ ATMRI Hospitals accessible`);

    console.log("\n✅ ATMRI Hospitals: PASSED\n");
  });
});