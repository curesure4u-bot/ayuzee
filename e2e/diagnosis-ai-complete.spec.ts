import { test, expect } from "@playwright/test";

/**
 * Diagnosis Complete & AI Tools - Complete Workflow E2E Test
 */

test.describe("Diagnosis - Complete Routes", () => {
  test.setTimeout(180000);

  test("Diagnosis Main & Netra", async ({ page }) => {
    console.log("\n" + "=".repeat(60));
    console.log("     DIAGNOSIS COMPLETE TEST");
    console.log("=".repeat(60));

    // Diagnosis Main
    await page.goto("https://ayuzee.com/diagnosis");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /diagnosis: ${page.url()}`);

    // Netra (Eye) Diagnosis
    await page.goto("https://ayuzee.com/diagnosis/netra");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
    console.log(`  ✅ /diagnosis/netra: ${page.url()}`);

    console.log("\n✅ Diagnosis Main & Netra: PASSED\n");
  });

  test("Diagnosis Prakriti", async ({ page }) => {
    console.log("\n=== Diagnosis Prakriti ===");

    await page.goto("https://ayuzee.com/diagnosis/prakriti");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /diagnosis/prakriti: ${page.url()}`);

    // Prakriti Run
    await page.goto("https://ayuzee.com/diagnosis/prakriti/run");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
    console.log(`  ✅ /diagnosis/prakriti/run: ${page.url()}`);

    console.log("\n✅ Diagnosis Prakriti: PASSED\n");
  });

  test("Diagnosis Spine", async ({ page }) => {
    console.log("\n=== Diagnosis Spine ===");

    await page.goto("https://ayuzee.com/diagnosis/spine");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /diagnosis/spine: ${page.url()}`);

    console.log("\n✅ Diagnosis Spine: PASSED\n");
  });

  test("Diagnosis Symptoms", async ({ page }) => {
    console.log("\n=== Diagnosis Symptoms ===");

    await page.goto("https://ayuzee.com/diagnosis/symptoms");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /diagnosis/symptoms: ${page.url()}`);

    const inputs = await page.locator("input").count();
    console.log(`     Input fields: ${inputs}`);

    console.log("\n✅ Diagnosis Symptoms: PASSED\n");
  });

  // Already tested routes
  test("Diagnosis Gut Health", async ({ page }) => {
    console.log("\n=== Diagnosis Gut Health (Rerun) ===");

    await page.goto("https://ayuzee.com/diagnosis/gut-health");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
    console.log(`  ✅ /diagnosis/gut-health: ${page.url()}`);

    console.log("\n✅ Diagnosis Gut Health: PASSED\n");
  });
});

test.describe("AI Tools - Complete Routes", () => {
  test.setTimeout(180000);

  test("AI Triage", async ({ page }) => {
    console.log("\n=== AI Triage ===");

    await page.goto("https://ayuzee.com/ai-triage");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /ai-triage: ${page.url()}`);

    console.log("\n✅ AI Triage: PASSED\n");
  });

  test("AI Family Health", async ({ page }) => {
    console.log("\n=== AI Family Health ===");

    await page.goto("https://ayuzee.com/ai/family-health");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /ai/family-health: ${page.url()}`);

    console.log("\n✅ AI Family Health: PASSED\n");
  });

  test("AI Genome Dosha", async ({ page }) => {
    console.log("\n=== AI Genome Dosha ===");

    await page.goto("https://ayuzee.com/ai/genome-dosha");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /ai/genome-dosha: ${page.url()}`);

    console.log("\n✅ AI Genome Dosha: PASSED\n");
  });

  test("AI Prakriti Twin", async ({ page }) => {
    console.log("\n=== AI Prakriti Twin ===");

    await page.goto("https://ayuzee.com/ai/prakriti-twin");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /ai/prakriti-twin: ${page.url()}`);

    console.log("\n✅ AI Prakriti Twin: PASSED\n");
  });

  test("AI Smart Vitals", async ({ page }) => {
    console.log("\n=== AI Smart Vitals ===");

    await page.goto("https://ayuzee.com/ai/smart-vitals");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /ai/smart-vitals: ${page.url()}`);

    console.log("\n✅ AI Smart Vitals: PASSED\n");
  });

  test("AI Yoga Diet Coach", async ({ page }) => {
    console.log("\n=== AI Yoga Diet Coach ===");

    await page.goto("https://ayuzee.com/ai/yoga-diet-coach");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /ai/yoga-diet-coach: ${page.url()}`);

    console.log("\n✅ AI Yoga Diet Coach: PASSED\n");
  });

  test("AI Predictive Risk", async ({ page }) => {
    console.log("\n=== AI Predictive Risk ===");

    await page.goto("https://ayuzee.com/ai/predictive-risk");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /ai/predictive-risk: ${page.url()}`);

    console.log("\n✅ AI Predictive Risk: PASSED\n");
  });
});

test.describe("ABDM - Complete Routes", () => {
  test.setTimeout(180000);

  test("ABHA Registration", async ({ page }) => {
    console.log("\n=== ABHA Registration ===");

    await page.goto("https://ayuzee.com/abdm/abha");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /abdm/abha: ${page.url()}`);

    console.log("\n✅ ABHA: PASSED\n");
  });

  test("ABDM Consent Manager", async ({ page }) => {
    console.log("\n=== ABDM Consent Manager ===");

    await page.goto("https://ayuzee.com/abdm/consent-manager");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /abdm/consent-manager: ${page.url()}`);

    console.log("\n✅ Consent Manager: PASSED\n");
  });

  test("ABDM Digilocker", async ({ page }) => {
    console.log("\n=== ABDM Digilocker ===");

    await page.goto("https://ayuzee.com/abdm/digilocker");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /abdm/digilocker: ${page.url()}`);

    console.log("\n✅ Digilocker: PASSED\n");
  });

  test("ABDM e-Sanjeevani", async ({ page }) => {
    console.log("\n=== ABDM e-Sanjeevani ===");

    await page.goto("https://ayuzee.com/abdm/e-sanjeevani");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /abdm/e-sanjeevani: ${page.url()}`);

    console.log("\n✅ e-Sanjeevani: PASSED\n");
  });

  test("ABDM FHIR Export", async ({ page }) => {
    console.log("\n=== ABDM FHIR Export ===");

    await page.goto("https://ayuzee.com/abdm/fhir-export");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /abdm/fhir-export: ${page.url()}`);

    console.log("\n✅ FHIR Export: PASSED\n");
  });

  test("ABDM AYUSH Reporting", async ({ page }) => {
    console.log("\n=== ABDM AYUSH Reporting ===");

    await page.goto("https://ayuzee.com/abdm/ayush-reporting");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log(`  ✅ /abdm/ayush-reporting: ${page.url()}`);

    console.log("\n✅ AYUSH Reporting: PASSED\n");
  });
});