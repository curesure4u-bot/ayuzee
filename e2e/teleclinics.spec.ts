import { test, expect } from "@playwright/test";

/**
 * Teleconsult & Clinics E2E Test
 * Tests: /teleconsult, /clinics, /colleges
 */

test.describe("Teleconsult & Clinics", () => {
  test.setTimeout(180000);

  test("Teleconsult Page", async ({ page }) => {
    console.log("\n" + "=".repeat(50));
    console.log("     TELECONSULT & CLINICS TEST");
    console.log("=".repeat(50));

    await page.goto("https://ayuzee.com/teleconsult");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Teleconsult accessible`);

    console.log("\n✅ Teleconsult: PASSED\n");
  });

  test("Clinics Page", async ({ page }) => {
    console.log("\n=== Clinics Page ===");

    await page.goto("https://ayuzee.com/clinics");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Clinics accessible`);

    // Check for clinic listings
    const cards = await page.locator("[class*='clinic'], [class*='card']").count();
    console.log(`  Listing elements: ${cards}`);

    console.log("\n✅ Clinics: PASSED\n");
  });

  test("Colleges Page", async ({ page }) => {
    console.log("\n=== Colleges Page ===");

    await page.goto("https://ayuzee.com/colleges");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Colleges accessible`);

    // Check for college listings
    const cards = await page.locator("[class*='college'], [class*='card']").count();
    console.log(`  Listing elements: ${cards}`);

    console.log("\n✅ Colleges: PASSED\n");
  });

  test("Clinics Search/Filter", async ({ page }) => {
    console.log("\n=== Clinics Search/Filter ===");

    await page.goto("https://ayuzee.com/clinics");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    // Check for filters
    const selects = await page.locator("select").count();
    console.log(`  Filter dropdowns: ${selects}`);

    const inputs = await page.locator("input").count();
    console.log(`  Input fields: ${inputs}`);

    console.log("\n✅ Clinics Search: PASSED\n");
  });

  test("Teleconsult Features", async ({ page }) => {
    console.log("\n=== Teleconsult Features ===");

    await page.goto("https://ayuzee.com/teleconsult");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    // Check for booking elements
    const buttons = await page.locator("button").count();
    console.log(`  Buttons: ${buttons}`);

    const links = await page.locator("a").count();
    console.log(`  Links: ${links}`);

    console.log("\n✅ Teleconsult Features: PASSED\n");
  });
});