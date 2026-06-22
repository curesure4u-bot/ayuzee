import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for Ayuzee E2E tests.
 *
 * Required env vars (create a local .env.e2e, do NOT commit secrets):
 *   E2E_BASE_URL              default http://localhost:8080
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
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:8080",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    viewport: { width: 1280, height: 900 },
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: process.env.E2E_NO_SERVER
    ? undefined
    : {
        command: "npm run dev",
        url: process.env.E2E_BASE_URL ?? "http://localhost:8080",
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
