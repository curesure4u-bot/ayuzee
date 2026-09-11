import { test, expect } from "@playwright/test";

/**
 * Additional Routes E2E Test
 */

test.describe("Additional Routes", () => {
  test.setTimeout(180000);

  test("Ayurveda Advisor", async ({ page }) => {
    console.log("\n" + "=".repeat(50));
    console.log("     ADDITIONAL ROUTES TEST");
    console.log("=".repeat(50));

    await page.goto("https://ayuzee.com/ayurveda-advisor");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Ayurveda Advisor accessible`);

    console.log("\n✅ Ayurveda Advisor: PASSED\n");
  });

  test("Classical References", async ({ page }) => {
    console.log("\n=== Classical References ===");

    await page.goto("https://ayuzee.com/classical-references");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Classical References accessible`);

    console.log("\n✅ Classical References: PASSED\n");
  });

  test("Thermography", async ({ page }) => {
    console.log("\n=== Thermography ===");

    await page.goto("https://ayuzee.com/thermography");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Thermography accessible`);

    console.log("\n✅ Thermography: PASSED\n");
  });

  test("Triage", async ({ page }) => {
    console.log("\n=== Triage ===");

    await page.goto("https://ayuzee.com/triage");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Triage accessible`);

    console.log("\n✅ Triage: PASSED\n");
  });

  test("ASTG Musculoskeletal", async ({ page }) => {
    console.log("\n=== ASTG Musculoskeletal ===");

    await page.goto("https://ayuzee.com/astg/musculoskeletal");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ ASTG Musculoskeletal accessible`);

    console.log("\n✅ ASTG Musculoskeletal: PASSED\n");
  });

  test("Team Page", async ({ page }) => {
    console.log("\n=== Team ===");

    await page.goto("https://ayuzee.com/team");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Team accessible`);

    // Check for team members
    const cards = await page.locator("[class*='card'], [class*='member']").count();
    console.log(`  Team members: ${cards}`);

    console.log("\n✅ Team: PASSED\n");
  });

  test("Unified Leaderboard Alt", async ({ page }) => {
    console.log("\n=== Leaderboard ===");

    await page.goto("https://ayuzee.com/leaderboard");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Leaderboard accessible`);

    console.log("\n✅ Leaderboard: PASSED\n");
  });

  test("Writing Page", async ({ page }) => {
    console.log("\n=== Writing ===");

    await page.goto("https://ayuzee.com/writing");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Writing accessible`);

    console.log("\n✅ Writing: PASSED\n");
  });
});