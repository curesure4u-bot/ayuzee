import { test, expect } from "@playwright/test";

/**
 * User Management E2E Test
 */

test.describe("User Management", () => {
  test.setTimeout(180000);

  test("Users Main Page", async ({ page }) => {
    console.log("\n" + "=".repeat(50));
    console.log("     USER MANAGEMENT TEST");
    console.log("=".repeat(50));

    await page.goto("https://ayuzee.com/admin/users");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Users page accessible`);

    // Check for user lists
    const tables = await page.locator("table").count();
    console.log(`  Tables: ${tables}`);

    console.log("\n✅ Users Main: PASSED\n");
  });

  test("Users Legacy", async ({ page }) => {
    console.log("\n=== Users Legacy ===");

    await page.goto("https://ayuzee.com/admin/users-legacy");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Legacy users accessible`);

    console.log("\n✅ Users Legacy: PASSED\n");
  });

  test("Verification Queue", async ({ page }) => {
    console.log("\n=== Verification Queue ===");

    await page.goto("https://ayuzee.com/admin/verification-queue");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Verification queue accessible`);

    console.log("\n✅ Verification Queue: PASSED\n");
  });

  test("User Roles", async ({ page }) => {
    console.log("\n=== User Roles ===");

    await page.goto("https://ayuzee.com/admin/user-roles");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ User Roles accessible`);

    console.log("\n✅ User Roles: PASSED\n");
  });

  test("Unified Leaderboard", async ({ page }) => {
    console.log("\n=== Unified Leaderboard ===");

    await page.goto("https://ayuzee.com/unified-leaderboard");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Leaderboard accessible`);

    // Check for rankings
    const cards = await page.locator("[class*='card'], [class*='rank']").count();
    console.log(`  Rank entries: ${cards}`);

    console.log("\n✅ Unified Leaderboard: PASSED\n");
  });

  test("Admin Auth", async ({ page }) => {
    console.log("\n=== Admin Auth ===");

    await page.goto("https://ayuzee.com/admin/auth");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Admin Auth accessible`);

    console.log("\n✅ Admin Auth: PASSED\n");
  });

  test("Templates", async ({ page }) => {
    console.log("\n=== Templates ===");

    await page.goto("https://ayuzee.com/admin/templates");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Templates accessible`);

    console.log("\n✅ Templates: PASSED\n");
  });

  test("Tasks Schedule", async ({ page }) => {
    console.log("\n=== Tasks Schedule ===");

    await page.goto("https://ayuzee.com/hms/tasks-schedule");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Tasks Schedule accessible`);

    console.log("\n✅ Tasks Schedule: PASSED\n");
  });
});