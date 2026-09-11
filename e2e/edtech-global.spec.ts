import { test, expect } from "@playwright/test";

/**
 * EdTech, Global, Essential Drugs - Complete Workflow E2E Test
 */

test.describe("EdTech - Learning Platform", () => {
  test.setTimeout(180000);

  test("Case Library", async ({ page }) => {
    console.log("\n" + "=".repeat(60));
    console.log("     EDTECH, GLOBAL, DRUGS TEST");
    console.log("=".repeat(60));

    await page.goto("https://ayuzee.com/edtech/case-library");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /edtech/case-library: ${page.url()}`);

    const cards = await page.locator("[class*='card'], [class*='case']").count();
    console.log(`     Case elements: ${cards}`);

    console.log("\n✅ Case Library: PASSED\n");
  });

  test("Certificates", async ({ page }) => {
    console.log("\n=== Certificates ===");

    await page.goto("https://ayuzee.com/edtech/certificates");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /edtech/certificates: ${page.url()}`);

    console.log("\n✅ Certificates: PASSED\n");
  });

  test("PG Prep", async ({ page }) => {
    console.log("\n=== PG Prep ===");

    await page.goto("https://ayuzee.com/edtech/pg-prep");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /edtech/pg-prep: ${page.url()}`);

    console.log("\n✅ PG Prep: PASSED\n");
  });

  test("Ebooks", async ({ page }) => {
    console.log("\n=== Ebooks ===");

    await page.goto("https://ayuzee.com/ebooks");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /ebooks: ${page.url()}`);

    console.log("\n✅ Ebooks: PASSED\n");
  });
});

test.describe("Global - International", () => {
  test.setTimeout(180000);

  test("Currency & Language", async ({ page }) => {
    console.log("\n=== Currency & Language ===");

    await page.goto("https://ayuzee.com/global/currency-language");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /global/currency-language: ${page.url()}`);

    console.log("\n✅ Currency & Language: PASSED\n");
  });

  test("Diaspora", async ({ page }) => {
    console.log("\n=== Diaspora ===");

    await page.goto("https://ayuzee.com/global/diaspora");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /global/diaspora: ${page.url()}`);

    console.log("\n✅ Diaspora: PASSED\n");
  });

  test("Export Compliance", async ({ page }) => {
    console.log("\n=== Export Compliance ===");

    await page.goto("https://ayuzee.com/global/export-compliance");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /global/export-compliance: ${page.url()}`);

    console.log("\n✅ Export Compliance: PASSED\n");
  });

  test("Partner Clinics", async ({ page }) => {
    console.log("\n=== Partner Clinics ===");

    await page.goto("https://ayuzee.com/global/partner-clinics");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /global/partner-clinics: ${page.url()}`);

    console.log("\n✅ Partner Clinics: PASSED\n");
  });

  test("Global Teleconsult", async ({ page }) => {
    console.log("\n=== Global Teleconsult ===");

    await page.goto("https://ayuzee.com/global/teleconsult");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /global/teleconsult: ${page.url()}`);

    console.log("\n✅ Global Teleconsult: PASSED\n");
  });
});

test.describe("Essential Drugs", () => {
  test.setTimeout(180000);

  test("Essential Drugs", async ({ page }) => {
    console.log("\n=== Essential Drugs ===");

    await page.goto("https://ayuzee.com/essential-drugs");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /essential-drugs: ${page.url()}`);

    console.log("\n✅ Essential Drugs: PASSED\n");
  });

  test("Essential Homeopathy Drugs", async ({ page }) => {
    console.log("\n=== Essential Homeopathy Drugs ===");

    await page.goto("https://ayuzee.com/essential-homeopathy-drugs");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /essential-homeopathy-drugs: ${page.url()}`);

    console.log("\n✅ Essential Homeopathy Drugs: PASSED\n");
  });

  test("Essential Siddha Drugs", async ({ page }) => {
    console.log("\n=== Essential Siddha Drugs ===");

    await page.goto("https://ayuzee.com/essential-siddha-drugs");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /essential-siddha-drugs: ${page.url()}`);

    console.log("\n✅ Essential Siddha Drugs: PASSED\n");
  });

  test("Essential Unani Drugs", async ({ page }) => {
    console.log("\n=== Essential Unani Drugs ===");

    await page.goto("https://ayuzee.com/essential-unani-drugs");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /essential-unani-drugs: ${page.url()}`);

    console.log("\n✅ Essential Unani Drugs: PASSED\n");
  });

  test("Drug Herb Checker", async ({ page }) => {
    console.log("\n=== Drug Herb Checker ===");

    await page.goto("https://ayuzee.com/drug-herb-checker");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /drug-herb-checker: ${page.url()}`);

    console.log("\n✅ Drug Herb Checker: PASSED\n");
  });
});

test.describe("Food & Gamification", () => {
  test.setTimeout(180000);

  test("Food as Medicine", async ({ page }) => {
    console.log("\n=== Food as Medicine ===");

    await page.goto("https://ayuzee.com/food-as-medicine");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /food-as-medicine: ${page.url()}`);

    console.log("\n✅ Food as Medicine: PASSED\n");
  });

  test("Gamification", async ({ page }) => {
    console.log("\n=== Gamification ===");

    await page.goto("https://ayuzee.com/gamification");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /gamification: ${page.url()}`);

    console.log("\n✅ Gamification: PASSED\n");
  });

  test("Feed", async ({ page }) => {
    console.log("\n=== Feed ===");

    await page.goto("https://ayuzee.com/feed");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /feed: ${page.url()}`);

    console.log("\n✅ Feed: PASSED\n");
  });
});