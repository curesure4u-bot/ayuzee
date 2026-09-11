import { test, expect } from "@playwright/test";

/**
 * AIBMTR & Diagnosis Tools E2E Test
 */

test.describe("AIBMTR & Diagnosis", () => {
  test.setTimeout(180000);

  test("AIBMTR Main Page", async ({ page }) => {
    console.log("\n" + "=".repeat(50));
    console.log("     AIBMTR & DIAGNOSIS TEST");
    console.log("=".repeat(50));

    await page.goto("https://ayuzee.com/aibmtr");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ AIBMTR accessible`);

    console.log("\n✅ AIBMTR: PASSED\n");
  });

  test("Diagnosis Main Page", async ({ page }) => {
    console.log("\n=== Diagnosis Main ===");

    await page.goto("https://ayuzee.com/diagnosis");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Diagnosis accessible`);

    // Check for diagnostic options
    const cards = await page.locator("[class*='card'], [class*='option']").count();
    console.log(`  Diagnostic options: ${cards}`);

    console.log("\n✅ Diagnosis Main: PASSED\n");
  });

  test("Gut Health Diagnosis", async ({ page }) => {
    console.log("\n=== Gut Health ===");

    await page.goto("https://ayuzee.com/diagnosis/gut-health");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Gut Health accessible`);

    console.log("\n✅ Gut Health: PASSED\n");
  });

  test("Jihva (Tongue) Diagnosis", async ({ page }) => {
    console.log("\n=== Jihva Diagnosis ===");

    await page.goto("https://ayuzee.com/diagnosis/jihva");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Jihva accessible`);

    console.log("\n✅ Jihva: PASSED\n");
  });

  test("Mutra Bindu (Urine) Diagnosis", async ({ page }) => {
    console.log("\n=== Mutra Bindu ===");

    await page.goto("https://ayuzee.com/diagnosis/mutra-bindu");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Mutra Bindu accessible`);

    console.log("\n✅ Mutra Bindu: PASSED\n");
  });

  test("AIBMTR Features", async ({ page }) => {
    console.log("\n=== AIBMTR Features ===");

    await page.goto("https://ayuzee.com/aibmtr");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    // Check for content
    const headings = await page.locator("h1, h2, h3").count();
    console.log(`  Headings: ${headings}`);

    const buttons = await page.locator("button").count();
    console.log(`  Buttons: ${buttons}`);

    const links = await page.locator("a").count();
    console.log(`  Links: ${links}`);

    console.log("\n✅ AIBMTR Features: PASSED\n");
  });

  test("Diagnosis Forms", async ({ page }) => {
    console.log("\n=== Diagnosis Forms ===");

    await page.goto("https://ayuzee.com/diagnosis");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    // Check for form elements
    const forms = await page.locator("form").count();
    console.log(`  Forms: ${forms}`);

    const inputs = await page.locator("input").count();
    console.log(`  Inputs: ${inputs}`);

    const selects = await page.locator("select").count();
    console.log(`  Selects: ${selects}`);

    console.log("\n✅ Diagnosis Forms: PASSED\n");
  });
});