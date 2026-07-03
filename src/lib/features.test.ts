import { describe, expect, it } from "vitest";
import { FEATURE_DEFAULTS, FEATURES, GATED_PATHS } from "./features";

describe("features", () => {
  it("defaults placeholder features to disabled in production", () => {
    expect(FEATURE_DEFAULTS[FEATURES.SYMPTOM_CHECKER]).toBe(false);
    expect(FEATURE_DEFAULTS[FEATURES.ATMRI_CAMPAIGNS]).toBe(false);
    expect(FEATURE_DEFAULTS[FEATURES.GAMIFICATION_PORTAL]).toBe(false);
  });

  it("defaults operational features to enabled", () => {
    expect(FEATURE_DEFAULTS[FEATURES.GUEST_CHECKOUT]).toBe(true);
    expect(FEATURE_DEFAULTS[FEATURES.PRESCRIPTION_UPLOAD]).toBe(true);
  });

  it("maps gated paths to flags", () => {
    const symptom = GATED_PATHS.find((g) => g.flag === FEATURES.SYMPTOM_CHECKER);
    expect(symptom?.paths).toContain("/diagnosis/symptoms");
  });
});
