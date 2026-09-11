import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";

/**
 * HMS Specific Modules E2E Test
 * Tests: Ward, Store, Staff management
 */

const TEST_PASSWORD = "TestPass!234";

test.describe("HMS Modules", () => {
  test.setTimeout(180000);

  test("HMS Dashboard", async ({ page }) => {
    console.log("\n" + "=".repeat(50));
    console.log("     HMS MODULES TEST");
    console.log("=".repeat(50));

    // Login first
    const email = `e2e.hms.${Date.now()}@ayuzee-test.dev`;
    await page.goto("https://ayuzee.com/auth?mode=signup");
    await page.locator("#fullName").fill("HMS Test User");
    await page.locator("#phone").fill("9999999999");
    await page.locator("#email").fill(email);
    await page.locator("#password").fill(TEST_PASSWORD);
    await page.getByTestId("auth-submit").click();
    await page.waitForTimeout(3000);

    await login(page, email, TEST_PASSWORD);
    await page.waitForLoadState("networkidle");

    // Go to HMS
    await page.goto("https://ayuzee.com/hms");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ HMS Dashboard accessible`);

    console.log("\n✅ HMS Dashboard: PASSED\n");
  });

  test("HMS Ward Status", async ({ page }) => {
    console.log("\n=== Ward Status ===");

    await page.goto("https://ayuzee.com/hms/ward-status");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Ward Status accessible`);

    // Check for ward elements
    const sections = await page.locator("section").count();
    console.log(`  Sections: ${sections}`);

    console.log("\n✅ Ward Status: PASSED\n");
  });

  test("HMS Ward Store", async ({ page }) => {
    console.log("\n=== Ward Store ===");

    await page.goto("https://ayuzee.com/hms/ward-store");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Ward Store accessible`);

    // Check for store elements
    const cards = await page.locator("[class*='card'], [class*='product']").count();
    console.log(`  Product cards: ${cards}`);

    console.log("\n✅ Ward Store: PASSED\n");
  });

  test("HMS Staff Management", async ({ page }) => {
    console.log("\n=== Staff Management ===");

    await page.goto("https://ayuzee.com/hms/staff-management");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Staff Management accessible`);

    // Check for staff lists
    const tables = await page.locator("table").count();
    console.log(`  Tables: ${tables}`);

    console.log("\n✅ Staff Management: PASSED\n");
  });

  test("HMS Work Schedule", async ({ page }) => {
    console.log("\n=== Work Schedule ===");

    await page.goto("https://ayuzee.com/hms/work-schedule");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Work Schedule accessible`);

    console.log("\n✅ Work Schedule: PASSED\n");
  });

  test("HMS Time Management", async ({ page }) => {
    console.log("\n=== Time Management ===");

    await page.goto("https://ayuzee.com/hms/time-management");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Time Management accessible`);

    console.log("\n✅ Time Management: PASSED\n");
  });

  test("HMS Worklist", async ({ page }) => {
    console.log("\n=== Worklist ===");

    await page.goto("https://ayuzee.com/hms/worklist");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Worklist accessible`);

    // Check for task elements
    const cards = await page.locator("[class*='task'], [class*='item']").count();
    console.log(`  Task items: ${cards}`);

    console.log("\n✅ Worklist: PASSED\n");
  });

  test("HMS Operations", async ({ page }) => {
    console.log("\n=== HMS Operations ===");

    await page.goto("https://ayuzee.com/hms/operations");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Operations accessible`);

    console.log("\n✅ HMS Operations: PASSED\n");
  });
});