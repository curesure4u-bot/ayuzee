import { describe, expect, it, beforeEach } from "vitest";
import {
  COOKIE_CONSENT_KEY,
  getCookieConsent,
  hasAnalyticsConsent,
  setCookieConsent,
  POLICY_VERSION,
} from "./consent";

describe("consent", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns null when no cookie consent saved", () => {
    expect(getCookieConsent()).toBeNull();
    expect(hasAnalyticsConsent()).toBe(false);
  });

  it("persists essential-only consent", () => {
    const saved = setCookieConsent(false);
    expect(saved.analytics).toBe(false);
    expect(getCookieConsent()?.analytics).toBe(false);
    expect(hasAnalyticsConsent()).toBe(false);
  });

  it("persists analytics consent", () => {
    setCookieConsent(true);
    expect(hasAnalyticsConsent()).toBe(true);
    expect(localStorage.getItem(COOKIE_CONSENT_KEY)).toContain('"analytics":true');
  });

  it("uses current policy version constant", () => {
    expect(POLICY_VERSION).toMatch(/^\d{4}\.\d{2}$/);
  });
});
