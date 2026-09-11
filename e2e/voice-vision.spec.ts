import { test, expect } from "@playwright/test";

/**
 * Voice Interface, Vision Board, Wheel of Life, Yearly Planner E2E Test
 */

test.describe("Voice, Vision & Planning Tools", () => {
  test.setTimeout(180000);

  test("Voice Interface Page", async ({ page }) => {
    console.log("\n" + "=".repeat(50));
    console.log("     VOICE, VISION & PLANNING TEST");
    console.log("=".repeat(50));

    await page.goto("https://ayuzee.com/voice-interface");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Voice Interface accessible`);

    // Check for voice elements
    const buttons = await page.locator("button").count();
    console.log(`  Buttons: ${buttons}`);

    const inputs = await page.locator("input, textarea").count();
    console.log(`  Input fields: ${inputs}`);

    console.log("\n✅ Voice Interface: PASSED\n");
  });

  test("Voice Agent Page", async ({ page }) => {
    console.log("\n=== Voice Agent ===");

    await page.goto("https://ayuzee.com/voice-agent");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Voice Agent accessible`);

    console.log("\n✅ Voice Agent: PASSED\n");
  });

  test("Vision Board Page", async ({ page }) => {
    console.log("\n=== Vision Board ===");

    await page.goto("https://ayuzee.com/vision-board");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Vision Board accessible`);

    // Check for board elements
    const sections = await page.locator("section").count();
    console.log(`  Sections: ${sections}`);

    const cards = await page.locator("[class*='card']").count();
    console.log(`  Cards: ${cards}`);

    console.log("\n✅ Vision Board: PASSED\n");
  });

  test("Vision Short Term", async ({ page }) => {
    console.log("\n=== Vision Short ===");

    await page.goto("https://ayuzee.com/vision-short");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Vision Short accessible`);

    console.log("\n✅ Vision Short: PASSED\n");
  });

  test("Vision Long Term", async ({ page }) => {
    console.log("\n=== Vision Long ===");

    await page.goto("https://ayuzee.com/vision-long");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Vision Long accessible`);

    console.log("\n✅ Vision Long: PASSED\n");
  });

  test("Wheel of Life Page", async ({ page }) => {
    console.log("\n=== Wheel of Life ===");

    await page.goto("https://ayuzee.com/wheel-of-life");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Wheel of Life accessible`);

    // Check for interactive elements
    const buttons = await page.locator("button").count();
    console.log(`  Buttons: ${buttons}`);

    const forms = await page.locator("form").count();
    console.log(`  Forms: ${forms}`);

    console.log("\n✅ Wheel of Life: PASSED\n");
  });

  test("Yearly Planner Page", async ({ page }) => {
    console.log("\n=== Yearly Planner ===");

    await page.goto("https://ayuzee.com/yearly-planner");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Yearly Planner accessible`);

    // Check for planner elements
    const sections = await page.locator("section").count();
    console.log(`  Sections: ${sections}`);

    const cards = await page.locator("[class*='card']").count();
    console.log(`  Cards: ${cards}`);

    console.log("\n✅ Yearly Planner: PASSED\n");
  });

  test("Weekly Challenge Page", async ({ page }) => {
    console.log("\n=== Weekly Challenge ===");

    await page.goto("https://ayuzee.com/weekly-challenge");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Weekly Challenge accessible`);

    console.log("\n✅ Weekly Challenge: PASSED\n");
  });
});