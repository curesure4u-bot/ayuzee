import { test, expect, Page } from "@playwright/test";
import { login, requireEnv, skipIfMissingEnv } from "./helpers/auth";

/**
 * Verifies that MIS filters (preset, from, to, report, billType, paymentMode)
 * plus pagination (page) and sort order (sortKey, sortDir) round-trip through
 * every drill-down type.
 *
 * The drill-down page renders a "Back to MIS" button even in its "Record not
 * found" state, and that button uses location.search verbatim. So we can verify
 * URL-param preservation using synthetic record IDs — no DB seeding required.
 */

const PARAMS = {
  preset: "custom",
  from: "2025-01-01",
  to: "2025-03-31",
  report: "bills",
  billType: "patient_bill",
  paymentMode: "upi",
  page: "3",
  sortKey: "total",
  sortDir: "asc",
} as const;

const qs = new URLSearchParams(PARAMS).toString();

const DRILL_TYPES = [
  { type: "bill", id: "00000000-0000-0000-0000-000000000001" },
  { type: "consultation", id: "00000000-0000-0000-0000-000000000002" },
  { type: "appointment", id: "00000000-0000-0000-0000-000000000003" },
  { type: "medicine", id: encodeURIComponent("Ashwagandha 500mg") },
];

async function assertParamsPreserved(page: Page) {
  await expect(page).toHaveURL(/\/vaidya\/mis\?/, { timeout: 10_000 });
  const url = new URL(page.url());
  for (const [k, v] of Object.entries(PARAMS)) {
    expect(url.searchParams.get(k), `param ${k}`).toBe(v);
  }
}

test.describe("MIS drill-down URL parameter persistence", () => {
  test.beforeEach(async ({ page }) => {
    skipIfMissingEnv(test, ["E2E_DOCTOR_EMAIL", "E2E_DOCTOR_PASSWORD"]);
    await login(
      page,
      requireEnv("E2E_DOCTOR_EMAIL"),
      requireEnv("E2E_DOCTOR_PASSWORD"),
    );
  });

  for (const { type, id } of DRILL_TYPES) {
    test(`Back to MIS from ${type} drill preserves filters, page, and sort`, async ({ page }) => {
      await page.goto(`/vaidya/mis/drill/${type}/${id}?${qs}`);

      // Either the record loads, or the "not found" fallback renders — both
      // expose a "Back to MIS" control that uses location.search.
      const back = page.getByRole("button", { name: /back to mis/i }).first();
      await expect(back).toBeVisible({ timeout: 15_000 });
      await back.click();

      await assertParamsPreserved(page);
    });
  }

  test("Breadcrumb 'MIS Reports' link preserves all params", async ({ page }) => {
    await page.goto(
      `/vaidya/mis/drill/bill/00000000-0000-0000-0000-000000000001?${qs}`,
    );
    const crumb = page.getByRole("link", { name: /^mis reports$/i }).first();
    if (await crumb.count()) {
      await crumb.click();
      await assertParamsPreserved(page);
    } else {
      test.skip(true, "Breadcrumb not rendered (record-not-found state).");
    }
  });

  test("MIS table drill links encode current page and sort", async ({ page }) => {
    // Land on MIS with filters + page + sort applied via URL.
    await page.goto(`/vaidya/mis?${qs}`);

    // Wait for the preview table or empty state to settle.
    await page.waitForLoadState("networkidle");

    // Find any drill row (View → indicator). Skip if data set is empty.
    const drillRow = page.locator("tr", { hasText: /view →/i }).first();
    if (!(await drillRow.count())) {
      test.skip(true, "No MIS rows in current dataset to drill into.");
      return;
    }

    await drillRow.click();
    await expect(page).toHaveURL(/\/vaidya\/mis\/drill\//, { timeout: 10_000 });

    const url = new URL(page.url());
    for (const [k, v] of Object.entries(PARAMS)) {
      expect(url.searchParams.get(k), `drill link param ${k}`).toBe(v);
    }
  });
});
