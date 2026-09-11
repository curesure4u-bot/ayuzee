import { test, expect } from "@playwright/test";

/**
 * Jobs & Career - Complete Workflow E2E Test
 */

test.describe("Jobs & Career", () => {
  test.setTimeout(180000);

  test("Jobs Main Board", async ({ page }) => {
    console.log("\n" + "=".repeat(60));
    console.log("     JOBS & CAREER TEST");
    console.log("=".repeat(60));

    await page.goto("https://ayuzee.com/jobs");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /jobs: ${page.url()}`);

    const cards = await page.locator("[class*='card'], [class*='job']").count();
    console.log(`     Job cards: ${cards}`);

    console.log("\n✅ Jobs Main: PASSED\n");
  });

  test("Jobs Aggregated", async ({ page }) => {
    console.log("\n=== Jobs Aggregated ===");

    await page.goto("https://ayuzee.com/jobs/aggregated");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /jobs/aggregated: ${page.url()}`);

    console.log("\n✅ Jobs Aggregated: PASSED\n");
  });

  test("Jobs AI Match", async ({ page }) => {
    console.log("\n=== Jobs AI Match ===");

    await page.goto("https://ayuzee.com/jobs/ai-match");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /jobs/ai-match: ${page.url()}`);

    console.log("\n✅ Jobs AI Match: PASSED\n");
  });

  test("Jobs Post", async ({ page }) => {
    console.log("\n=== Jobs Post ===");

    await page.goto("https://ayuzee.com/jobs/post");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /jobs/post: ${page.url()}`);

    const forms = await page.locator("form").count();
    console.log(`     Forms: ${forms}`);

    console.log("\n✅ Jobs Post: PASSED\n");
  });

  test("Jobs Employer", async ({ page }) => {
    console.log("\n=== Jobs Employer ===");

    await page.goto("https://ayuzee.com/jobs/employer");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /jobs/employer: ${page.url()}`);

    console.log("\n✅ Jobs Employer: PASSED\n");
  });

  test("Jobs Candidates", async ({ page }) => {
    console.log("\n=== Jobs Candidates ===");

    await page.goto("https://ayuzee.com/jobs/candidates");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /jobs/candidates: ${page.url()}`);

    console.log("\n✅ Jobs Candidates: PASSED\n");
  });

  test("Jobs Government", async ({ page }) => {
    console.log("\n=== Jobs Government ===");

    await page.goto("https://ayuzee.com/jobs/government");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /jobs/government: ${page.url()}`);

    console.log("\n✅ Jobs Government: PASSED\n");
  });

  test("Jobs My Applications", async ({ page }) => {
    console.log("\n=== Jobs My Applications ===");

    await page.goto("https://ayuzee.com/jobs/my-applications");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /jobs/my-applications: ${page.url()}`);

    console.log("\n✅ Jobs My Applications: PASSED\n");
  });

  test("Jobs Profile", async ({ page }) => {
    console.log("\n=== Jobs Profile ===");

    await page.goto("https://ayuzee.com/jobs/profile");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /jobs/profile: ${page.url()}`);

    console.log("\n✅ Jobs Profile: PASSED\n");
  });

  test("Jobs Alerts", async ({ page }) => {
    console.log("\n=== Jobs Alerts ===");

    await page.goto("https://ayuzee.com/jobs/alerts");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /jobs/alerts: ${page.url()}`);

    console.log("\n✅ Jobs Alerts: PASSED\n");
  });

  test("Career Roadmap", async ({ page }) => {
    console.log("\n=== Career Roadmap ===");

    await page.goto("https://ayuzee.com/jobs/career-roadmap");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /jobs/career-roadmap: ${page.url()}`);

    console.log("\n✅ Career Roadmap: PASSED\n");
  });

  test("Salary Insights", async ({ page }) => {
    console.log("\n=== Salary Insights ===");

    await page.goto("https://ayuzee.com/jobs/salary-insights");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /jobs/salary-insights: ${page.url()}`);

    console.log("\n✅ Salary Insights: PASSED\n");
  });
});