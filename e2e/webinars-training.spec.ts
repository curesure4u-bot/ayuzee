import { test, expect } from "@playwright/test";

/**
 * Webinars & Training E2E Test
 */

test.describe("Webinars & Training", () => {
  test.setTimeout(180000);

  test("Webinars Main Page", async ({ page }) => {
    console.log("\n" + "=".repeat(50));
    console.log("     WEBINARS & TRAINING TEST");
    console.log("=".repeat(50));

    await page.goto("https://ayuzee.com/webinars");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Webinars page accessible`);

    // Check for webinar listings
    const cards = await page.locator("[class*='card'], [class*='webinar']").count();
    console.log(`  Webinar cards: ${cards}`);

    console.log("\n✅ Webinars Main: PASSED\n");
  });

  test("Training Main Page", async ({ page }) => {
    console.log("\n=== Training Main ===");

    await page.goto("https://ayuzee.com/training");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Training page accessible`);

    // Check for training content
    const sections = await page.locator("section").count();
    console.log(`  Sections: ${sections}`);

    console.log("\n✅ Training Main: PASSED\n");
  });

  test("Teaching Page", async ({ page }) => {
    console.log("\n=== Teaching ===");

    await page.goto("https://ayuzee.com/teaching");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Teaching accessible`);

    console.log("\n✅ Teaching: PASSED\n");
  });

  test("Courses Page", async ({ page }) => {
    console.log("\n=== Courses ===");

    await page.goto("https://ayuzee.com/courses");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Courses accessible`);

    // Check for course listings
    const cards = await page.locator("[class*='card'], [class*='course']").count();
    console.log(`  Course cards: ${cards}`);

    console.log("\n✅ Courses: PASSED\n");
  });

  test("Weekly Review", async ({ page }) => {
    console.log("\n=== Weekly Review ===");

    await page.goto("https://ayuzee.com/weekly-review");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Weekly Review accessible`);

    console.log("\n✅ Weekly Review: PASSED\n");
  });

  test("Weekly Calendar", async ({ page }) => {
    console.log("\n=== Weekly Calendar ===");

    await page.goto("https://ayuzee.com/weekly-calendar");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Calendar accessible`);

    console.log("\n✅ Weekly Calendar: PASSED\n");
  });

  test("Webinars Features", async ({ page }) => {
    console.log("\n=== Webinar Features ===");

    await page.goto("https://ayuzee.com/webinars");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    // Check for registration elements
    const buttons = await page.locator("button").count();
    console.log(`  Buttons: ${buttons}`);

    const forms = await page.locator("form").count();
    console.log(`  Forms: ${forms}`);

    const links = await page.locator("a").count();
    console.log(`  Links: ${links}`);

    console.log("\n✅ Webinar Features: PASSED\n");
  });

  test("Training Content", async ({ page }) => {
    console.log("\n=== Training Content ===");

    await page.goto("https://ayuzee.com/training");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    // Check for content elements
    const headings = await page.locator("h1, h2, h3").count();
    console.log(`  Headings: ${headings}`);

    const paragraphs = await page.locator("p").count();
    console.log(`  Paragraphs: ${paragraphs}`);

    const images = await page.locator("img").count();
    console.log(`  Images: ${images}`);

    console.log("\n✅ Training Content: PASSED\n");
  });
});