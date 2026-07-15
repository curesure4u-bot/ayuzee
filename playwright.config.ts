import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for Ayuzee E2E tests.
 *
 * Required env vars (create a local .env.e2e, do NOT commit secrets):
 *   E2E_BASE_URL              default http://127.0.0.1:4173
 *   E2E_PATIENT_EMAIL         existing patient login
 *   E2E_PATIENT_PASSWORD
 *   E2E_DOCTOR_EMAIL          existing doctor login
 *   E2E_DOCTOR_PASSWORD
 *   E2E_NEW_SIGNUP_EMAIL      optional, defaults to a random throwaway address
 *
 * Razorpay must be running in TEST MODE. Use test card 4111 1111 1111 1111,
 * any future expiry, any CVV, OTP 1234 on the Razorpay test checkout.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false, // ordered flows touch shared cart/booking state
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://127.0.0.1:4173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    viewport: { width: 1280, height: 900 },
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
