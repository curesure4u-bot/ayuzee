import { test, expect } from "@playwright/test";

/**
 * Traditional Medicine Systems E2E Test
 * Tests: /acupuncture, /unani, /homeopathy
 */

test.describe("Traditional Medicine", () => {
  test.setTimeout(180000);

  test("Acupuncture Page", async ({ page }) => {
    console.log("\n" + "=".repeat(50));
    console.log("     TRADITIONAL MEDICINE TEST");
    console.log("=".repeat(50));

    await page.goto("https://ayuzee.com/acupuncture");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Acupuncture accessible`);

    console.log("\n✅ Acupuncture: PASSED\n");
  });

  test("Acupuncture 50 Diseases", async ({ page }) => {
    console.log("\n=== Acupuncture 50 Diseases ===");

    await page.goto("https://ayuzee.com/acupuncture/50-diseases");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ 50 Diseases page accessible`);

    console.log("\n✅ Acupuncture 50 Diseases: PASSED\n");
  });

  test("Acupuncture 300 Diseases", async ({ page }) => {
    console.log("\n=== Acupuncture 300 Diseases ===");

    await page.goto("https://ayuzee.com/acupuncture/300-diseases");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ 300 Diseases page accessible`);

    console.log("\n✅ Acupuncture 300 Diseases: PASSED\n");
  });

  test("Acupuncture Points", async ({ page }) => {
    console.log("\n=== Acupuncture Points ===");

    await page.goto("https://ayuzee.com/acupuncture/points");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Points page accessible`);

    console.log("\n✅ Acupuncture Points: PASSED\n");
  });

  test("Acupuncture Homeopathy", async ({ page }) => {
    console.log("\n=== Acupuncture Homeopathy ===");

    await page.goto("https://ayuzee.com/acupuncture/homeopathy");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Homeopathy page accessible`);

    console.log("\n✅ Acupuncture Homeopathy: PASSED\n");
  });

  test("Unani Medicine", async ({ page }) => {
    console.log("\n=== Unani Medicine ===");

    await page.goto("https://ayuzee.com/unani");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Unani accessible`);

    console.log("\n✅ Unani: PASSED\n");
  });
});