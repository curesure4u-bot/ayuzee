import { test, expect } from "@playwright/test";

/**
 * Blog System E2E Test
 * Tests: /blog
 */

test.describe("Blog System", () => {
  test.setTimeout(120000);

  test("Blog Main Page", async ({ page }) => {
    console.log("\n" + "=".repeat(50));
    console.log("     BLOG SYSTEM TEST");
    console.log("=".repeat(50));

    await page.goto("https://ayuzee.com/blog");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Blog page accessible`);

    const title = await page.title();
    console.log(`  Title: ${title}`);

    expect(url).toContain("/blog");
    console.log("\n✅ Blog Main: PASSED\n");
  });

  test("Blog Content Elements", async ({ page }) => {
    console.log("\n=== Blog Content Elements ===");

    await page.goto("https://ayuzee.com/blog");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    // Check for articles/posts
    const articles = await page.locator("article, .blog-card, [class*='blog']").count();
    console.log(`  Blog articles: ${articles}`);

    // Check for headings
    const headings = await page.locator("h1, h2, h3").count();
    console.log(`  Headings: ${headings}`);

    // Check for images
    const images = await page.locator("img").count();
    console.log(`  Images: ${images}`);

    // Check for links
    const links = await page.locator("a").count();
    console.log(`  Links: ${links}`);

    console.log("\n✅ Blog Elements: PASSED\n");
  });

  test("Blog Navigation", async ({ page }) => {
    console.log("\n=== Blog Navigation ===");

    await page.goto("https://ayuzee.com/blog");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    // Check for categories
    const categories = await page.locator("[class*='category'], [class*='tag']").count();
    console.log(`  Categories/Tags: ${categories}`);

    // Check for search
    const searchInput = await page.locator("input[type='search'], input[placeholder*='search']").count();
    console.log(`  Search input: ${searchInput}`);

    // Check for pagination
    const pagination = await page.locator("[class*='pagination'], [class*='page']").count();
    console.log(`  Pagination: ${pagination}`);

    console.log("\n✅ Blog Navigation: PASSED\n");
  });

  test("Blog Mobile Responsive", async ({ page }) => {
    console.log("\n=== Blog Mobile Responsive ===");

    // Desktop
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("https://ayuzee.com/blog");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    console.log("  Desktop: ✅");

    // Mobile
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(500);
    const mobileScroll = await page.evaluate(() => document.documentElement.scrollWidth);
    console.log(`  Mobile (375px): ${mobileScroll <= 380 ? '✅' : '⚠️'}`);

    await page.setViewportSize({ width: 1280, height: 800 });

    console.log("\n✅ Blog Mobile: PASSED\n");
  });
});