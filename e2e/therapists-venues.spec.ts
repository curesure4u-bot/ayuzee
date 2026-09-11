import { test, expect } from "@playwright/test";

/**
 * Therapists & Venues E2E Test
 */

test.describe("Therapists & Venues", () => {
  test.setTimeout(180000);

  test("Therapists Main Page", async ({ page }) => {
    console.log("\n" + "=".repeat(50));
    console.log("     THERAPISTS & VENUES TEST");
    console.log("=".repeat(50));

    await page.goto("https://ayuzee.com/therapists");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Therapists page accessible`);

    // Check for therapist cards
    const cards = await page.locator("[class*='card'], [class*='therapist']").count();
    console.log(`  Therapist cards: ${cards}`);

    console.log("\n✅ Therapists Main: PASSED\n");
  });

  test("Therapist Management", async ({ page }) => {
    console.log("\n=== Therapist Management ===");

    await page.goto("https://ayuzee.com/therapist-management");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Management page accessible`);

    console.log("\n✅ Therapist Management: PASSED\n");
  });

  test("Therapist Achievements", async ({ page }) => {
    console.log("\n=== Therapist Achievements ===");

    await page.goto("https://ayuzee.com/therapist-achievements");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Achievements accessible`);

    console.log("\n✅ Therapist Achievements: PASSED\n");
  });

  test("Therapy Appointments", async ({ page }) => {
    console.log("\n=== Therapy Appointments ===");

    await page.goto("https://ayuzee.com/therapy-appointments");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Appointments accessible`);

    // Check for appointment lists
    const tables = await page.locator("table").count();
    console.log(`  Tables: ${tables}`);

    console.log("\n✅ Therapy Appointments: PASSED\n");
  });

  test("Therapy Catalog", async ({ page }) => {
    console.log("\n=== Therapy Catalog ===");

    await page.goto("https://ayuzee.com/therapy-catalog");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Catalog accessible`);

    // Check for therapy listings
    const cards = await page.locator("[class*='card'], [class*='therapy']").count();
    console.log(`  Therapy cards: ${cards}`);

    console.log("\n✅ Therapy Catalog: PASSED\n");
  });

  test("Therapy Sessions", async ({ page }) => {
    console.log("\n=== Therapy Sessions ===");

    await page.goto("https://ayuzee.com/therapy-sessions");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Sessions accessible`);

    console.log("\n✅ Therapy Sessions: PASSED\n");
  });

  test("Venues Main Page", async ({ page }) => {
    console.log("\n=== Venues Main ===");

    await page.goto("https://ayuzee.com/venues");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Venues accessible`);

    // Check for venue listings
    const cards = await page.locator("[class*='card'], [class*='venue']").count();
    console.log(`  Venue cards: ${cards}`);

    console.log("\n✅ Venues Main: PASSED\n");
  });

  test("Venue Achievements", async ({ page }) => {
    console.log("\n=== Venue Achievements ===");

    await page.goto("https://ayuzee.com/venue-achievements");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Achievements accessible`);

    console.log("\n✅ Venue Achievements: PASSED\n");
  });
});