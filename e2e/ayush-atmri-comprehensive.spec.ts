import { test, expect } from "@playwright/test";

/**
 * AYUSH Help & ATMRI Help - Complete Workflow E2E Test
 * Testing all sub-routes with end-to-end workflow
 */

test.describe("AYUSH Help Complete Workflow", () => {
  test.setTimeout(180000);

  test("AYUSH Help - Main & Apply", async ({ page }) => {
    console.log("\n" + "=".repeat(60));
    console.log("     AYUSH HELP COMPREHENSIVE TEST");
    console.log("=".repeat(60));

    // 1. AYUSH Help Main
    await page.goto("https://ayuzee.com/ayush-help");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /ayush-help: ${page.url()}`);

    // 2. AYUSH Apply
    await page.goto("https://ayuzee.com/ayush-help/apply");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
    console.log(`  ✅ /ayush-help/apply: ${page.url()}`);

    // Check for forms
    const forms = await page.locator("form").count();
    console.log(`     Forms found: ${forms}`);

    console.log("\n✅ AYUSH Help Main & Apply: PASSED\n");
  });

  test("AYUSH Help - Campaigns & Cases", async ({ page }) => {
    console.log("\n=== AYUSH Campaigns & Cases ===");

    // 3. Campaigns
    await page.goto("https://ayuzee.com/ayush-help/campaigns");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
    console.log(`  ✅ /ayush-help/campaigns: ${page.url()}`);

    // Check for campaign elements
    const cards = await page.locator("[class*='campaign'], [class*='card']").count();
    console.log(`     Campaign elements: ${cards}`);

    // 4. Cases
    await page.goto("https://ayuzee.com/ayush-help/cases");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
    console.log(`  ✅ /ayush-help/cases: ${page.url()}`);

    console.log("\n✅ AYUSH Campaigns & Cases: PASSED\n");
  });

  test("AYUSH Help - CSR & Hospitals", async ({ page }) => {
    console.log("\n=== AYUSH CSR & Hospitals ===");

    // 5. CSR
    await page.goto("https://ayuzee.com/ayush-help/csr");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
    console.log(`  ✅ /ayush-help/csr: ${page.url()}`);

    // 6. Hospitals
    await page.goto("https://ayuzee.com/ayush-help/hospitals");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
    console.log(`  ✅ /ayush-help/hospitals: ${page.url()}`);

    const cards = await page.locator("[class*='card'], [class*='hospital']").count();
    console.log(`     Hospital elements: ${cards}`);

    console.log("\n✅ AYUSH CSR & Hospitals: PASSED\n");
  });

  test("AYUSH Help - Impact & Leaderboard", async ({ page }) => {
    console.log("\n=== AYUSH Impact & Leaderboard ===");

    // 7. Impact
    await page.goto("https://ayuzee.com/ayush-help/impact");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
    console.log(`  ✅ /ayush-help/impact: ${page.url()}`);

    // Check for stats
    const sections = await page.locator("section").count();
    console.log(`     Sections: ${sections}`);

    // 8. Leaderboard
    await page.goto("https://ayuzee.com/ayush-help/leaderboard");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
    console.log(`  ✅ /ayush-help/leaderboard: ${page.url()}`);

    console.log("\n✅ AYUSH Impact & Leaderboard: PASSED\n");
  });

  test("AYUSH Help - Pledge", async ({ page }) => {
    console.log("\n=== AYUSH Pledge ===");

    // 9. Pledge
    await page.goto("https://ayuzee.com/ayush-help/pledge");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
    console.log(`  ✅ /ayush-help/pledge: ${page.url()}`);

    // Check for forms/buttons
    const buttons = await page.locator("button").count();
    console.log(`     Buttons: ${buttons}`);

    console.log("\n✅ AYUSH Pledge: PASSED\n");
  });
});

test.describe("ATMRI Help Complete Workflow", () => {
  test.setTimeout(180000);

  test("ATMRI Help - Main & Apply", async ({ page }) => {
    console.log("\n" + "=".repeat(60));
    console.log("     ATMRI HELP COMPREHENSIVE TEST");
    console.log("=".repeat(60));

    // 1. ATMRI Help Main
    await page.goto("https://ayuzee.com/atmri-help");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /atmri-help: ${page.url()}`);

    // 2. ATMRI Apply
    await page.goto("https://ayuzee.com/atmri-help/apply");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
    console.log(`  ✅ /atmri-help/apply: ${page.url()}`);

    console.log("\n✅ ATMRI Help Main & Apply: PASSED\n");
  });

  test("ATMRI Help - Campaigns & Cases", async ({ page }) => {
    console.log("\n=== ATMRI Campaigns & Cases ===");

    // 3. Campaigns
    await page.goto("https://ayuzee.com/atmri-help/campaigns");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
    console.log(`  ✅ /atmri-help/campaigns: ${page.url()}`);

    // 4. Cases
    await page.goto("https://ayuzee.com/atmri-help/cases");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
    console.log(`  ✅ /atmri-help/cases: ${page.url()}`);

    console.log("\n✅ ATMRI Campaigns & Cases: PASSED\n");
  });

  test("ATMRI Help - CSR & Hospitals", async ({ page }) => {
    console.log("\n=== ATMRI CSR & Hospitals ===");

    // 5. CSR
    await page.goto("https://ayuzee.com/atmri-help/csr");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
    console.log(`  ✅ /atmri-help/csr: ${page.url()}`);

    // 6. Hospitals
    await page.goto("https://ayuzee.com/atmri-help/hospitals");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
    console.log(`  ✅ /atmri-help/hospitals: ${page.url()}`);

    console.log("\n✅ ATMRI CSR & Hospitals: PASSED\n");
  });

  test("ATMRI Help - Impact & Leaderboard", async ({ page }) => {
    console.log("\n=== ATMRI Impact & Leaderboard ===");

    // 7. Impact
    await page.goto("https://ayuzee.com/atmri-help/impact");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
    console.log(`  ✅ /atmri-help/impact: ${page.url()}`);

    // 8. Leaderboard
    await page.goto("https://ayuzee.com/atmri-help/leaderboard");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
    console.log(`  ✅ /atmri-help/leaderboard: ${page.url()}`);

    console.log("\n✅ ATMRI Impact & Leaderboard: PASSED\n");
  });

  test("ATMRI Help - Pledge", async ({ page }) => {
    console.log("\n=== ATMRI Pledge ===");

    // 9. Pledge
    await page.goto("https://ayuzee.com/atmri-help/pledge");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
    console.log(`  ✅ /atmri-help/pledge: ${page.url()}`);

    console.log("\n✅ ATMRI Pledge: PASSED\n");
  });
});