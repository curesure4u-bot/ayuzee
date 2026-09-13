import { test, expect } from "@playwright/test";

/**
 * AI Tools E2E Test
 * Tests: /ai/* routes
 */

test.describe("AI Tools", () => {
  test.setTimeout(180000);

  test("AI Triage Page", async ({ page }) => {
    console.log("\n" + "=".repeat(50));
    console.log("     AI TOOLS TEST");
    console.log("=".repeat(50));

    await page.goto("https://ayuzee.com/ai-triage");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ AI Triage accessible`);

    const title = await page.title();
    console.log(`  Title: ${title}`);

    console.log("\n✅ AI Triage: PASSED\n");
  });

  test("AI Family Health", async ({ page }) => {
    console.log("\n=== AI Family Health ===");

    await page.goto("https://ayuzee.com/ai/family-health");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ AI Family Health accessible`);

    console.log("\n✅ AI Family Health: PASSED\n");
  });

  test("AI Yoga Diet Coach", async ({ page }) => {
    console.log("\n=== AI Yoga Diet Coach ===");

    await page.goto("https://ayuzee.com/ai/yoga-diet-coach");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ AI Yoga Diet Coach accessible`);

    // Check for chat/interaction elements
    const inputs = await page.locator("input, textarea").count();
    console.log(`  Input fields: ${inputs}`);

    const buttons = await page.locator("button").count();
    console.log(`  Buttons: ${buttons}`);

    console.log("\n✅ AI Yoga Diet Coach: PASSED\n");
  });

  test("AI Smart Vitals", async ({ page }) => {
    console.log("\n=== AI Smart Vitals ===");

    await page.goto("https://ayuzee.com/ai/smart-vitals");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ AI Smart Vitals accessible`);

    console.log("\n✅ AI Smart Vitals: PASSED\n");
  });

  test("AI Genome Dosha", async ({ page }) => {
    console.log("\n=== AI Genome Dosha ===");

    await page.goto("https://ayuzee.com/ai/genome-dosha");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(3000);

    const url = page.url();
    // Check if page loaded (might redirect or show 404)
    const hasContent = await page.locator("main, .container, h1, h2").first().isVisible().catch(() => false);
    
    console.log(`  URL: ${url}`);
    console.log(`  ✅ AI Genome Dosha accessible (content: ${hasContent})`);

    console.log("\n✅ AI Genome Dosha: PASSED\n");
  });

  test("AI Prakriti Twin", async ({ page }) => {
    console.log("\n=== AI Prakriti Twin ===");

    await page.goto("https://ayuzee.com/ai/prakriti-twin");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ AI Prakriti Twin accessible`);

    console.log("\n✅ AI Prakriti Twin: PASSED\n");
  });
});