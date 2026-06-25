import { test, expect } from "@playwright/test";
import { login, randomEmail, requireEnv, skipIfMissingEnv } from "./helpers/auth";

test.describe("Authentication", () => {
  test("signup creates a new patient account", async ({ page }) => {
    const email = process.env.E2E_NEW_SIGNUP_EMAIL ?? randomEmail("signup");
    const password = "TestPass!234";

    await page.goto("/auth?mode=signup");
    await page.locator("#fullName").fill("E2E Test User");
    await page.locator("#phone").fill("9999999999");
    await page.locator("#email").fill(email);
    await page.locator("#password").fill(password);
    await page.getByRole("button", { name: /create|sign ?up|continue/i }).first().click();

    // Either redirected to dashboard or shown a "check your email" confirmation toast.
    await expect
      .poll(async () => page.url(), { timeout: 15_000 })
      .not.toMatch(/\/auth\?mode=signup$/);
  });

  test("login with existing patient credentials succeeds", async ({ page }) => {
    await login(
      page,
      requireEnv("E2E_PATIENT_EMAIL"),
      requireEnv("E2E_PATIENT_PASSWORD"),
    );
    await expect(page).toHaveURL(/\/(dashboard|patient|home)/i);
  });

  test("login with bad password shows an error", async ({ page }) => {
    await page.goto("/auth?mode=login");
    await page.locator("#email").fill("nobody@ayuzee-test.dev");
    await page.locator("#password").fill("wrong-password-xx");
    await page.getByRole("button", { name: /sign in|log in/i }).first().click();
    await expect(page.getByText(/invalid|incorrect|wrong|error/i).first())
      .toBeVisible({ timeout: 10_000 });
  });
});
