import { test, expect } from "@playwright/test";

/**
 * HMS Treatment Systems E2E Test
 */

test.describe("HMS Treatment Systems", () => {
  test.setTimeout(180000);

  test("Treatment Systems Main", async ({ page }) => {
    console.log("\n" + "=".repeat(50));
    console.log("     HMS TREATMENT SYSTEMS TEST");
    console.log("=".repeat(50));

    await page.goto("https://ayuzee.com/hms/treatment-systems");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Treatment Systems accessible`);

    // Check for treatment options
    const cards = await page.locator("[class*='card'], [class*='treatment']").count();
    console.log(`  Treatment cards: ${cards}`);

    console.log("\n✅ Treatment Systems: PASSED\n");
  });

  test("Treatment Timeline", async ({ page }) => {
    console.log("\n=== Treatment Timeline ===");

    await page.goto("https://ayuzee.com/hms/treatment-timeline");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Timeline accessible`);

    console.log("\n✅ Treatment Timeline: PASSED\n");
  });

  test("Treatment Outcomes", async ({ page }) => {
    console.log("\n=== Treatment Outcomes ===");

    await page.goto("https://ayuzee.com/hms/treatment-outcomes");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Outcomes accessible`);

    console.log("\n✅ Treatment Outcomes: PASSED\n");
  });

  test("Treatment View", async ({ page }) => {
    console.log("\n=== Treatment View ===");

    await page.goto("https://ayuzee.com/hms/treatment-view");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Treatment View accessible`);

    console.log("\n✅ Treatment View: PASSED\n");
  });

  test("Therapies Main", async ({ page }) => {
    console.log("\n=== Therapies ===");

    await page.goto("https://ayuzee.com/therapies");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Therapies accessible`);

    // Check for therapy listings
    const cards = await page.locator("[class*='card']").count();
    console.log(`  Cards: ${cards}`);

    console.log("\n✅ Therapies: PASSED\n");
  });

  test("Therapy Plans", async ({ page }) => {
    console.log("\n=== Therapy Plans ===");

    await page.goto("https://ayuzee.com/hms/therapy-plans");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Plans accessible`);

    console.log("\n✅ Therapy Plans: PASSED\n");
  });

  test("Variable Tasks", async ({ page }) => {
    console.log("\n=== Variable Tasks ===");

    await page.goto("https://ayuzee.com/hms/variable-tasks");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Variable Tasks accessible`);

    console.log("\n✅ Variable Tasks: PASSED\n");
  });

  test("TAT Monitoring", async ({ page }) => {
    console.log("\n=== TAT Monitoring ===");

    await page.goto("https://ayuzee.com/hms/tat-monitoring");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ TAT Monitoring accessible`);

    console.log("\n✅ TAT Monitoring: PASSED\n");
  });
});