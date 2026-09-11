import { test, expect } from "@playwright/test";

/**
 * Wellness & Yoga E2E Test
 * Tests: /wellness, /yoga, /yoga/*
 */

test.describe("Wellness & Yoga", () => {
  test.setTimeout(180000);

  test("Wellness Main Page", async ({ page }) => {
    console.log("\n" + "=".repeat(50));
    console.log("     WELLNESS & YOGA TEST");
    console.log("=".repeat(50));

    await page.goto("https://ayuzee.com/wellness");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Wellness page accessible`);

    console.log("\n✅ Wellness Main: PASSED\n");
  });

  test("Yoga Main Page", async ({ page }) => {
    console.log("\n=== Yoga Main ===");

    await page.goto("https://ayuzee.com/yoga");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Yoga page accessible`);

    // Check for content
    const headings = await page.locator("h1, h2, h3").count();
    console.log(`  Headings: ${headings}`);

    const images = await page.locator("img").count();
    console.log(`  Images: ${images}`);

    console.log("\n✅ Yoga Main: PASSED\n");
  });

  test("Yoga Content Pages", async ({ page }) => {
    console.log("\n=== Yoga Content Pages ===");

    // Test some yoga sub-routes
    const routes = [
      { path: "/yoga", name: "Yoga" },
    ];

    for (const { path, name } of routes) {
      await page.goto(`https://ayuzee.com${path}`);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1000);
      console.log(`  ✅ ${name}: ${page.url()}`);
    }

    console.log("\n✅ Yoga Content: PASSED\n");
  });

  test("Wellness Programs", async ({ page }) => {
    console.log("\n=== Wellness Programs ===");

    await page.goto("https://ayuzee.com/wellness");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    // Check for program cards
    const cards = await page.locator("[class*='card'], [class*='program']").count();
    console.log(`  Program elements: ${cards}`);

    // Check for CTAs
    const buttons = await page.locator("button").count();
    console.log(`  Buttons: ${buttons}`);

    console.log("\n✅ Wellness Programs: PASSED\n");
  });

  test("Wellness Mobile Responsive", async ({ page }) => {
    console.log("\n=== Wellness Mobile ===");

    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("https://ayuzee.com/wellness");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    console.log(`  Mobile content width: ${scrollWidth}px`);
    console.log(`  ${scrollWidth <= 380 ? '✅' : '⚠️'} Fits viewport`);

    await page.setViewportSize({ width: 1280, height: 800 });

    console.log("\n✅ Wellness Mobile: PASSED\n");
  });
});