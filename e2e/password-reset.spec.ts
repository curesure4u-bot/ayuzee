import { test, expect } from "@playwright/test";
import { skipIfMissingEnv, requireEnv } from "./helpers/auth";

/**
 * End-to-end password reset flow.
 *
 * Requires (in addition to the standard patient creds):
 *   E2E_SUPABASE_URL
 *   E2E_SUPABASE_SERVICE_ROLE_KEY   (never commit — set only in CI secrets)
 *
 * The service role key is used strictly to fetch the recovery action_link
 * via Supabase's admin generateLink API, since there is no test inbox.
 * We reset the password back to the original at the end so the shared
 * patient account remains usable by other specs.
 */

const APP_ORIGIN = process.env.E2E_BASE_URL ?? "http://localhost:8080";

async function generateRecoveryLink(email: string): Promise<string> {
  const url = requireEnv("E2E_SUPABASE_URL");
  const key = requireEnv("E2E_SUPABASE_SERVICE_ROLE_KEY");
  const res = await fetch(`${url}/auth/v1/admin/generate_link`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "recovery",
      email,
      options: { redirect_to: `${APP_ORIGIN}/reset-password` },
    }),
  });
  if (!res.ok) {
    throw new Error(`generate_link ${res.status}: ${await res.text()}`);
  }
  const data = (await res.json()) as { action_link?: string; properties?: { action_link?: string } };
  const link = data.action_link ?? data.properties?.action_link;
  if (!link) throw new Error("generate_link response missing action_link");
  return link;
}

test.describe("Password reset", () => {
  test("request → open link → set new password → login with it", async ({ page }) => {
    skipIfMissingEnv(test, [
      "E2E_PATIENT_EMAIL",
      "E2E_PATIENT_PASSWORD",
      "E2E_SUPABASE_URL",
      "E2E_SUPABASE_SERVICE_ROLE_KEY",
    ]);

    const email = requireEnv("E2E_PATIENT_EMAIL");
    const originalPassword = requireEnv("E2E_PATIENT_PASSWORD");
    const newPassword = `Reset!${Date.now().toString(36)}A`;

    // 1) Request reset from the login screen via the Forgot password dialog.
    await page.goto("/auth?mode=login");
    await expect(page.locator("#email")).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: /forgot password/i }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.locator("#reset-email").fill(email);
    await page.getByTestId("forgot-password-submit").click();

    // Success toast must appear, be styled as a success, and contain the copy.
    const requestToast = page.locator("[data-sonner-toast]").first();
    await expect(requestToast).toBeVisible({ timeout: 10_000 });
    await expect(requestToast).toHaveAttribute("data-type", "success");
    await expect(requestToast).toContainText(/reset link sent/i);
    await expect(requestToast).toContainText(/check your email/i);

    // Dialog auto-closes on success.
    await expect(dialog).not.toBeVisible({ timeout: 5_000 });


    // 2) Fetch the actual recovery link via admin API (no inbox in CI).
    const actionLink = await generateRecoveryLink(email);

    // 3) Follow it — Supabase verifies the token then redirects to /reset-password
    //    with the recovery session hash. Wait for the form to become ready.
    await page.goto(actionLink);
    await page.waitForURL(/\/reset-password/, { timeout: 15_000 });
    const submit = page.getByTestId("reset-password-submit");
    await expect(submit).toBeEnabled({ timeout: 15_000 });

    // 4) Submit new password.
    await page.locator("#password").fill(newPassword);
    await page.locator("#confirm").fill(newPassword);
    await submit.click();

    // Success toast must appear, be visible, and carry the expected copy.
    const successToast = page.locator("[data-sonner-toast]").first();
    await expect(successToast).toBeVisible({ timeout: 10_000 });
    await expect(successToast).toHaveAttribute("data-type", "success");
    await expect(successToast).toContainText(/password updated/i);
    await expect(successToast).toContainText(/please sign in/i);

    // After the toast, the app signs the user out and routes to the auth screen.
    await page.waitForURL(/\/(auth|login)/, { timeout: 10_000 });


    // 5) Sign in with the NEW password from a clean session.
    await page.context().clearCookies();
    await page.evaluate(() => {
      Object.keys(localStorage)
        .filter((k) => k.startsWith("sb-"))
        .forEach((k) => localStorage.removeItem(k));
    });
    await page.goto("/auth?mode=login");
    await expect(page.locator("#email")).toBeVisible({ timeout: 10_000 });
    await page.locator("#email").fill(email);
    await page.locator("#password").fill(newPassword);
    await page.getByTestId("auth-submit").click();
    await expect(page).not.toHaveURL(/\/auth/, { timeout: 15_000 });

    // 6) Restore the original password so shared fixtures keep working.
    try {
      const restoreLink = await generateRecoveryLink(email);
      await page.goto(restoreLink);
      await page.waitForURL(/\/reset-password/, { timeout: 15_000 });
      await expect(page.getByTestId("reset-password-submit")).toBeEnabled({ timeout: 15_000 });
      await page.locator("#password").fill(originalPassword);
      await page.locator("#confirm").fill(originalPassword);
      await page.getByTestId("reset-password-submit").click();
      await expect(page.locator("[data-sonner-toast]").first()).toContainText(
        /password updated/i,
        { timeout: 10_000 },
      );
    } catch (err) {
      console.warn("Failed to restore original password:", err);
    }
  });
});
