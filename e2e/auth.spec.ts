import { test, expect } from "@playwright/test";
import { login, requireEnv, skipIfMissingEnv } from "./helpers/auth";

const submitAuthForm = (page: import("@playwright/test").Page) =>
  page.getByTestId("auth-submit");


const expectAuthToast = async (page: import("@playwright/test").Page) => {
  await expect(page.locator("[data-sonner-toast]").first()).toBeVisible({ timeout: 10_000 });
};

test.describe("Authentication", () => {
  test("signup creates a new patient account", async ({ page }) => {
    skipIfMissingEnv(test, ["E2E_NEW_SIGNUP_EMAIL"]);
    const email = requireEnv("E2E_NEW_SIGNUP_EMAIL");
    const password = "TestPass!234";

    await page.goto("/auth?mode=signup");
    await page.locator("#fullName").fill("E2E Test User");
    await page.locator("#phone").fill("9999999999");
    await page.locator("#email").fill(email);
    await page.locator("#password").fill(password);
    await submitAuthForm(page).click();

    // Success: redirect away from signup, or confirmation toast (email verification on).
    await expect
      .poll(
        async () => {
          if (!page.url().includes("/auth?mode=signup")) return "redirected";
          const toast = page.locator("[data-sonner-toast]").first();
          if (await toast.isVisible()) return (await toast.innerText()).toLowerCase();
          return "";
        },
        { timeout: 15_000 },
      )
      .toMatch(/redirected|welcome|created|account|email|confirm/i);
  });

  test("login with existing patient credentials succeeds", async ({ page }) => {
    skipIfMissingEnv(test, ["E2E_PATIENT_EMAIL", "E2E_PATIENT_PASSWORD"]);
    await login(
      page,
      requireEnv("E2E_PATIENT_EMAIL"),
      requireEnv("E2E_PATIENT_PASSWORD"),
    );
    await expect(page).toHaveURL(/\/(dashboard|patient|home)/i);
  });

  test("login with bad password shows an error", async ({ page }) => {
    await page.goto("/auth?mode=login");
    await expect(page.locator("#email")).toBeVisible({ timeout: 10_000 });

    await page.locator("#email").fill("nobody@ayuzee-test.dev");
    await page.locator("#password").fill("wrong-password-xx");
    await submitAuthForm(page).click();
    await expectAuthToast(page);
    await expect(page.locator("[data-sonner-toast]").first()).toContainText(
      /invalid|incorrect|credentials|wrong|error/i,
    );
  });
});
