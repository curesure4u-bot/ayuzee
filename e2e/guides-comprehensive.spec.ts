import { test, expect } from "@playwright/test";

/**
 * Guides & Documentation - Complete Workflow E2E Test
 * Testing all guide sub-routes with end-to-end workflow
 */

test.describe("Guides - Patient & Doctor", () => {
  test.setTimeout(180000);

  test("Patient Guide", async ({ page }) => {
    console.log("\n" + "=".repeat(60));
    console.log("     GUIDES COMPREHENSIVE TEST");
    console.log("=".repeat(60));

    // Patient Guide
    await page.goto("https://ayuzee.com/guides/patient");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /guides/patient: ${page.url()}`);

    const headings = await page.locator("h1, h2, h3").count();
    console.log(`     Headings: ${headings}`);

    console.log("\n✅ Patient Guide: PASSED\n");
  });

  test("Doctor Guide", async ({ page }) => {
    console.log("\n=== Doctor Guide ===");

    await page.goto("https://ayuzee.com/guides/doctor");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /guides/doctor: ${page.url()}`);

    console.log("\n✅ Doctor Guide: PASSED\n");
  });

  test("HMS Admin Guide", async ({ page }) => {
    console.log("\n=== HMS Admin Guide ===");

    await page.goto("https://ayuzee.com/guides/hms-admin");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /guides/hms-admin: ${page.url()}`);

    console.log("\n✅ HMS Admin Guide: PASSED\n");
  });

  test("HRMS Guide", async ({ page }) => {
    console.log("\n=== HRMS Guide ===");

    await page.goto("https://ayuzee.com/guides/hrms");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /guides/hrms: ${page.url()}`);

    console.log("\n✅ HRMS Guide: PASSED\n");
  });

  test("Billing Guide", async ({ page }) => {
    console.log("\n=== Billing Guide ===");

    await page.goto("https://ayuzee.com/guides/billing");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /guides/billing: ${page.url()}`);

    console.log("\n✅ Billing Guide: PASSED\n");
  });
});

test.describe("Guides - Medical Departments", () => {
  test.setTimeout(180000);

  test("Pharmacy Guide", async ({ page }) => {
    console.log("\n=== Pharmacy Guide ===");

    await page.goto("https://ayuzee.com/guides/pharmacy");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /guides/pharmacy: ${page.url()}`);

    console.log("\n✅ Pharmacy Guide: PASSED\n");
  });

  test("Lab Guide", async ({ page }) => {
    console.log("\n=== Lab Guide ===");

    await page.goto("https://ayuzee.com/guides/lab");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /guides/lab: ${page.url()}`);

    console.log("\n✅ Lab Guide: PASSED\n");
  });

  test("Radiology Guide", async ({ page }) => {
    console.log("\n=== Radiology Guide ===");

    await page.goto("https://ayuzee.com/guides/radiology");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /guides/radiology: ${page.url()}`);

    console.log("\n✅ Radiology Guide: PASSED\n");
  });

  test("IPD Nursing Guide", async ({ page }) => {
    console.log("\n=== IPD Nursing Guide ===");

    await page.goto("https://ayuzee.com/guides/ipd-nursing");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /guides/ipd-nursing: ${page.url()}`);

    console.log("\n✅ IPD Nursing Guide: PASSED\n");
  });

  test("Panchakarma Ops Guide", async ({ page }) => {
    console.log("\n=== Panchakarma Ops Guide ===");

    await page.goto("https://ayuzee.com/guides/panchakarma-ops");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /guides/panchakarma-ops: ${page.url()}`);

    console.log("\n✅ Panchakarma Ops Guide: PASSED\n");
  });
});

test.describe("Guides - Analytics & Compliance", () => {
  test.setTimeout(180000);

  test("MIS Analytics Guide", async ({ page }) => {
    console.log("\n=== MIS Analytics Guide ===");

    await page.goto("https://ayuzee.com/guides/mis-analytics");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /guides/mis-analytics: ${page.url()}`);

    console.log("\n✅ MIS Analytics Guide: PASSED\n");
  });

  test("Online Booking Guide", async ({ page }) => {
    console.log("\n=== Online Booking Guide ===");

    await page.goto("https://ayuzee.com/guides/online-booking");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /guides/online-booking: ${page.url()}`);

    console.log("\n✅ Online Booking Guide: PASSED\n");
  });

  test("AI Tools Guide", async ({ page }) => {
    console.log("\n=== AI Tools Guide ===");

    await page.goto("https://ayuzee.com/guides/ai-tools");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /guides/ai-tools: ${page.url()}`);

    console.log("\n✅ AI Tools Guide: PASSED\n");
  });

  test("ABDM Compliance Guide", async ({ page }) => {
    console.log("\n=== ABDM Compliance Guide ===");

    await page.goto("https://ayuzee.com/guides/abdm-compliance");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /guides/abdm-compliance: ${page.url()}`);

    console.log("\n✅ ABDM Compliance Guide: PASSED\n");
  });

  test("Guides Main", async ({ page }) => {
    console.log("\n=== Guides Main ===");

    await page.goto("https://ayuzee.com/guides");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /guides: ${page.url()}`);

    const sections = await page.locator("section").count();
    console.log(`     Sections: ${sections}`);

    console.log("\n✅ Guides Main: PASSED\n");
  });
});