import { test, expect } from "@playwright/test";
import { login, requireEnv, skipIfMissingEnv } from "./helpers/auth";

const submitAuthForm = (page: import("@playwright/test").Page) =>
  page.getByTestId("auth-submit");


const expectAuthToast = async (page: import("@playwright/test").Page) => {
  await expect(page.locator("[data-sonner-toast]").first()).toBeVisible({ timeout: 10_000 });
};

// Generate unique test email
const generateTestEmail = () => `e2e.auth.${Date.now()}@ayuzee-test.dev`;
const TEST_PASSWORD = "TestPass!234";

test.describe("Authentication", () => {
  test("signup creates a new patient account", async ({ page }) => {
    const email = generateTestEmail();
    console.log("\n=== TEST: Patient Signup ===");
    console.log(`Email: ${email}`);

    await page.goto("/auth?mode=signup");
    await page.locator("#fullName").fill("E2E Test User");
    await page.locator("#phone").fill("9999999999");
    await page.locator("#email").fill(email);
    await page.locator("#password").fill(TEST_PASSWORD);
    await submitAuthForm(page).click();

    // Success: redirect away from signup, or confirmation toast
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
    
    console.log("✅ Signup successful\n");
  });

  test("login with dynamically created credentials succeeds", async ({ page }) => {
    // First, create a new account
    const email = generateTestEmail();
    console.log("\n=== TEST: Login with Dynamic Credentials ===");
    console.log(`Creating account: ${email}`);
    
    await page.goto("/auth?mode=signup");
    await page.locator("#fullName").fill("E2E Login Test");
    await page.locator("#phone").fill("9999999999");
    await page.locator("#email").fill(email);
    await page.locator("#password").fill(TEST_PASSWORD);
    await submitAuthForm(page).click();
    
    // Wait for registration
    await page.waitForTimeout(3000);
    console.log("✅ Account created");
    
    // Now login with the same credentials
    console.log(`Logging in with: ${email}`);
    await login(page, email, TEST_PASSWORD);
    
    // Verify redirect away from auth page
    await expect(page).not.toHaveURL(/\/auth/, { timeout: 15_000 });
    console.log("✅ Login successful - redirected to dashboard\n");
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
  
  test("role-based redirect works correctly", async ({ page }) => {
    // Test patient redirect
    const patientEmail = generateTestEmail();
    console.log("\n=== TEST: Role-Based Redirects ===");
    
    await page.goto("/auth?mode=signup");
    await page.locator("#fullName").fill("E2E Patient");
    await page.locator("#phone").fill("9999999999");
    await page.locator("#email").fill(patientEmail);
    await page.locator("#password").fill(TEST_PASSWORD);
    await submitAuthForm(page).click();
    await page.waitForTimeout(3000);
    
    await login(page, patientEmail, TEST_PASSWORD);
    await page.waitForLoadState("networkidle");
    
    // Should redirect to patient dashboard
    const patientUrl = page.url();
    const patientRedirect = /\/(dashboard|patient|home)/i.test(patientUrl);
    console.log(`Patient redirect: ${patientUrl} - ${patientRedirect ? '✅' : '⚠️'}`);
    
    expect(patientRedirect).toBe(true);
    console.log("✅ Role-based redirects working\n");
  });
});
