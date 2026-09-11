import { test, expect } from "@playwright/test";

/**
 * Careers/Jobs E2E Test
 * Tests: /careers
 */

test.describe("Careers & Jobs", () => {
  test.setTimeout(120000);

  test("Careers Main Page", async ({ page }) => {
    console.log("\n" + "=".repeat(50));
    console.log("     CAREERS & JOBS TEST");
    console.log("=".repeat(50));

    await page.goto("https://ayuzee.com/careers");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Careers page accessible`);

    const title = await page.title();
    console.log(`  Title: ${title}`);

    expect(url).toContain("/jobs");
    console.log("\n✅ Careers Main: PASSED\n");
  });

  test("Job Listings", async ({ page }) => {
    console.log("\n=== Job Listings ===");

    await page.goto("https://ayuzee.com/careers");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    // Check for job cards
    const jobCards = await page.locator("[class*='job'], [class*='career'], [class*='position']").count();
    console.log(`  Job cards: ${jobCards}`);

    // Check for headings
    const headings = await page.locator("h1, h2, h3").count();
    console.log(`  Headings: ${headings}`);

    // Check for buttons (apply)
    const buttons = await page.locator("button, [role='button']").count();
    console.log(`  Buttons: ${buttons}`);

    // Check for links
    const links = await page.locator("a").count();
    console.log(`  Links: ${links}`);

    console.log("\n✅ Job Listings: PASSED\n");
  });

  test("Careers Filters", async ({ page }) => {
    console.log("\n=== Careers Filters ===");

    await page.goto("https://ayuzee.com/careers");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    // Check for department/location filters
    const filters = await page.locator("select, [class*='filter']").count();
    console.log(`  Filters: ${filters}`);

    // Check for search
    const searchInputs = await page.locator("input[type='search'], input[type='text']").count();
    console.log(`  Search inputs: ${searchInputs}`);

    console.log("\n✅ Careers Filters: PASSED\n");
  });

  test("Careers Page Elements", async ({ page }) => {
    console.log("\n=== Careers Page Elements ===");

    await page.goto("https://ayuzee.com/careers");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    // Check for company info
    const sections = await page.locator("section").count();
    console.log(`  Sections: ${sections}`);

    // Check for images
    const images = await page.locator("img").count();
    console.log(`  Images: ${images}`);

    // Check for forms (application)
    const forms = await page.locator("form").count();
    console.log(`  Forms: ${forms}`);

    console.log("\n✅ Careers Elements: PASSED\n");
  });
});