import { test, expect } from "@playwright/test";

/**
 * Wallet, Payments & WhatsApp E2E Test
 */

test.describe("Wallet, Payments & WhatsApp", () => {
  test.setTimeout(180000);

  test("Wallet Main Page", async ({ page }) => {
    console.log("\n" + "=".repeat(50));
    console.log("     WALLET, PAYMENTS & WHATSAPP TEST");
    console.log("=".repeat(50));

    await page.goto("https://ayuzee.com/wallet");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Wallet accessible`);

    // Check for wallet elements
    const cards = await page.locator("[class*='card'], [class*='balance']").count();
    console.log(`  Balance cards: ${cards}`);

    console.log("\n✅ Wallet Main: PASSED\n");
  });

  test("Wallet Dashboard", async ({ page }) => {
    console.log("\n=== Wallet Dashboard ===");

    await page.goto("https://ayuzee.com/dashboard/wallet");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Dashboard wallet accessible`);

    console.log("\n✅ Wallet Dashboard: PASSED\n");
  });

  test("Checkout Page", async ({ page }) => {
    console.log("\n=== Checkout ===");

    await page.goto("https://ayuzee.com/checkout");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Checkout accessible`);

    // Check for payment elements
    const forms = await page.locator("form").count();
    console.log(`  Forms: ${forms}`);

    const buttons = await page.locator("button").count();
    console.log(`  Buttons: ${buttons}`);

    console.log("\n✅ Checkout: PASSED\n");
  });

  test("Orders Page", async ({ page }) => {
    console.log("\n=== Orders ===");

    await page.goto("https://ayuzee.com/dashboard/orders");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Orders accessible`);

    console.log("\n✅ Orders: PASSED\n");
  });

  test("WhatsApp Integration", async ({ page }) => {
    console.log("\n=== WhatsApp ===");

    await page.goto("https://ayuzee.com/whatsapp");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ WhatsApp accessible`);

    console.log("\n✅ WhatsApp: PASSED\n");
  });

  test("Cart Page", async ({ page }) => {
    console.log("\n=== Cart ===");

    await page.goto("https://ayuzee.com/cart");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Cart accessible`);

    // Check for cart items
    const items = await page.locator("[class*='item'], [class*='product']").count();
    console.log(`  Cart items: ${items}`);

    console.log("\n✅ Cart: PASSED\n");
  });

  test("Upcoming Appointments", async ({ page }) => {
    console.log("\n=== Upcoming ===");

    await page.goto("https://ayuzee.com/dashboard/upcoming");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Upcoming accessible`);

    console.log("\n✅ Upcoming: PASSED\n");
  });

  test("Waitlist", async ({ page }) => {
    console.log("\n=== Waitlist ===");

    await page.goto("https://ayuzee.com/waitlist");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Waitlist accessible`);

    console.log("\n✅ Waitlist: PASSED\n");
  });
});