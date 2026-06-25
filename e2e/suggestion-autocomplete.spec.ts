import { test, expect, request } from "@playwright/test";
import { login, requireEnv, skipIfMissingEnv } from "./helpers/auth";

/**
 * Drives the real Vaidya consultation dialog to verify:
 *   - typing into Chief complaint opens the SuggestionField dropdown
 *   - keyboard (ArrowDown + Enter) inserts a suggestion
 *   - short-code + space expands to the full suggestion text
 *   - clicking a suggestion (or expansion) calls hms_increment_suggestion_usage
 *     so usage_count goes up after saving the consultation.
 *
 * Requires E2E_DOCTOR_*, plus E2E_SUPABASE_URL + E2E_SUPABASE_ANON_KEY so the
 * test can read usage_count via the REST API using the doctor's access token.
 */
test.describe("Suggestion autocomplete in consultation form", () => {
  test.beforeEach(({}, testInfo) => {
    skipIfMissingEnv(test, [
      "E2E_DOCTOR_EMAIL",
      "E2E_DOCTOR_PASSWORD",
      "E2E_SUPABASE_URL",
      "E2E_SUPABASE_ANON_KEY",
    ]);
    void testInfo;
  });

  test("dropdown opens, keyboard + short code work, usage_count increments on save", async ({ page }) => {
    await login(page, requireEnv("E2E_DOCTOR_EMAIL"), requireEnv("E2E_DOCTOR_PASSWORD"));

    // Grab the doctor's access token + supabase project key from localStorage so
    // we can hit the REST API as the signed-in user.
    const session = await page.evaluate(() => {
      const key = Object.keys(localStorage).find((k) => k.startsWith("sb-") && k.endsWith("-auth-token"));
      if (!key) return null;
      try { return JSON.parse(localStorage.getItem(key)!); } catch { return null; }
    });
    expect(session?.access_token, "doctor must be signed in").toBeTruthy();

    const SUPABASE_URL = requireEnv("E2E_SUPABASE_URL").replace(/\/$/, "");
    const ANON = requireEnv("E2E_SUPABASE_ANON_KEY");
    const api = await request.newContext({
      baseURL: SUPABASE_URL,
      extraHTTPHeaders: {
        apikey: ANON,
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
    });

    // Pick the highest-usage chief_complaint suggestion as the deterministic target.
    const listRes = await api.get(
      "/rest/v1/hms_suggestions?suggestion_type=eq.chief_complaint&is_active=eq.true&order=usage_count.desc&limit=1&select=id,short_code,suggestion_text,usage_count",
    );
    expect(listRes.ok(), "must read hms_suggestions").toBeTruthy();
    const [target] = (await listRes.json()) as Array<{
      id: string; short_code: string | null; suggestion_text: string; usage_count: number;
    }>;
    test.skip(!target, "No chief_complaint suggestions seeded — add some in Suggestion Master first.");
    const baseline = target.usage_count;

    // Open the consultation dialog.
    await page.goto("/vaidya/consultations");
    await page.getByRole("button", { name: /new consultation/i }).click();

    // Select the first patient (required to save).
    const patientSelect = page.locator("select").first();
    await patientSelect.selectOption({ index: 1 });

    // Switch to EMR tab and use the Chief complaint SuggestionField.
    await page.getByRole("tab", { name: /^EMR$/i }).click();
    const ccInput = page.locator('input').filter({ hasNot: page.locator('[type="date"], [type="number"], [type="file"]') }).nth(0);

    // --- 1. Dropdown opens on focus and matches by text ---
    await ccInput.click();
    await ccInput.fill(target.suggestion_text.slice(0, 3));
    const option = page.getByRole("button", { name: new RegExp(target.suggestion_text, "i") }).first();
    await expect(option).toBeVisible({ timeout: 5_000 });

    // --- 2. Keyboard selection: ArrowDown + Enter inserts the (highlighted) item ---
    await ccInput.press("ArrowDown");
    await ccInput.press("ArrowDown");
    await ccInput.press("ArrowUp"); // land back on first match
    await ccInput.press("Enter");
    await expect(ccInput).toHaveValue(new RegExp(target.suggestion_text, "i"));

    // --- 3. Short-code expansion (in Plan field, type "<code> ") ---
    if (target.short_code) {
      const planField = page.getByLabel(/^Plan$/i);
      await planField.fill(`${target.short_code} `);
      await expect(planField).toHaveValue(new RegExp(target.suggestion_text, "i"));
    }

    // --- 4. Save the consultation, then verify usage_count climbed in DB ---
    await page.getByRole("button", { name: /save consultation/i }).click();
    await expect(page.getByText(/saved|success/i).first()).toBeVisible({ timeout: 15_000 });

    // Poll until the RPC-driven increment is visible (eventual after fire-and-forget).
    let latest = baseline;
    for (let i = 0; i < 10; i++) {
      const r = await api.get(
        `/rest/v1/hms_suggestions?id=eq.${target.id}&select=usage_count`,
      );
      const rows = (await r.json()) as Array<{ usage_count: number }>;
      latest = rows[0]?.usage_count ?? latest;
      if (latest > baseline) break;
      await page.waitForTimeout(500);
    }
    expect(latest).toBeGreaterThan(baseline);
  });
});
