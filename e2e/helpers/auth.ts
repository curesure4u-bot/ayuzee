import { Page, expect } from "@playwright/test";

export async function login(page: Page, email: string, password: string) {
  await page.goto("/auth?mode=login");
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: /sign in|log in|continue/i }).first().click();
  // App redirects to a role-specific dashboard on success.
  await expect(page).not.toHaveURL(/\/auth/, { timeout: 15_000 });
}

export async function logout(page: Page) {
  await page.evaluate(async () => {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith("sb-"));
    keys.forEach((k) => localStorage.removeItem(k));
  });
}

export function randomEmail(prefix = "e2e") {
  const stamp = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  return `${prefix}+${stamp}@ayuzee-test.dev`;
}

export function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var ${name} — see playwright.config.ts header.`);
  return v;
}
