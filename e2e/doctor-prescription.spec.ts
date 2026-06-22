import { test, expect } from "@playwright/test";
import { login, requireEnv } from "./helpers/auth";

test.describe("Doctor prescription flow", () => {
  test.beforeEach(async ({ page }) => {
    await login(
      page,
      requireEnv("E2E_DOCTOR_EMAIL"),
      requireEnv("E2E_DOCTOR_PASSWORD"),
    );
  });

  test("doctor writes a prescription for a patient", async ({ page }) => {
    // Doctor lands somewhere under /vaidya or /doctor depending on role.
    await page.goto("/vaidya");

    // Open the first patient / appointment from the doctor's queue.
    const openPatient = page
      .getByRole("link", { name: /patient|appointment|consult|view/i })
      .first();
    await openPatient.click();

    // Navigate to the prescription writer.
    const writeBtn = page.getByRole("button", { name: /prescribe|prescription|write/i }).first();
    if (await writeBtn.count()) await writeBtn.click();

    // Fill at least one medicine row.
    const medInput = page.getByPlaceholder(/medicine|drug|name/i).first();
    await medInput.fill("Ashwagandha 500mg");
    const doseInput = page.getByPlaceholder(/dose|dosage|1-0-1/i).first();
    if (await doseInput.count()) await doseInput.fill("1-0-1 after food");

    const notes = page.getByPlaceholder(/note|advice|instruction/i).first();
    if (await notes.count()) await notes.fill("E2E test prescription. Take with warm water.");

    await page.getByRole("button", { name: /save|sign|issue|send/i }).first().click();

    await expect(page.getByText(/saved|sent|issued|success/i).first())
      .toBeVisible({ timeout: 15_000 });
  });
});
