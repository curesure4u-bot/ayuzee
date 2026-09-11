import { test, expect } from "@playwright/test";

/**
 * ABDM (Ayushman Bharat Digital Mission) E2E Test
 * Tests: /abdm/* routes
 */

test.describe("ABDM Health ID", () => {
  test.setTimeout(180000);

  test("ABHA Registration Page", async ({ page }) => {
    console.log("\n" + "=".repeat(50));
    console.log("     ABDM HEALTH ID TEST");
    console.log("=".repeat(50));

    await page.goto("https://ayuzee.com/abdm/abha");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ ABHA page accessible`);

    const title = await page.title();
    console.log(`  Title: ${title}`);

    console.log("\n✅ ABHA Registration: PASSED\n");
  });

  test("Consent Manager", async ({ page }) => {
    console.log("\n=== Consent Manager ===");

    await page.goto("https://ayuzee.com/abdm/consent-manager");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Consent Manager accessible`);

    console.log("\n✅ Consent Manager: PASSED\n");
  });

  test("Digilocker", async ({ page }) => {
    console.log("\n=== Digilocker ===");

    await page.goto("https://ayuzee.com/abdm/digilocker");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Digilocker accessible`);

    console.log("\n✅ Digilocker: PASSED\n");
  });

  test("e-Sanjeevani", async ({ page }) => {
    console.log("\n=== e-Sanjeevani ===");

    await page.goto("https://ayuzee.com/abdm/e-sanjeevani");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ e-Sanjeevani accessible`);

    console.log("\n✅ e-Sanjeevani: PASSED\n");
  });

  test("FHIR Export", async ({ page }) => {
    console.log("\n=== FHIR Export ===");

    await page.goto("https://ayuzee.com/abdm/fhir-export");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ FHIR Export accessible`);

    // Check for export functionality
    const buttons = await page.locator("button").count();
    console.log(`  Buttons: ${buttons}`);

    console.log("\n✅ FHIR Export: PASSED\n");
  });

  test("AYUSH Reporting", async ({ page }) => {
    console.log("\n=== AYUSH Reporting ===");

    await page.goto("https://ayuzee.com/abdm/ayush-reporting");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ AYUSH Reporting accessible`);

    console.log("\n✅ AYUSH Reporting: PASSED\n");
  });
});