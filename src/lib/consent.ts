import { supabase } from "@/integrations/supabase/client";

export const POLICY_VERSION = "2026.07";
export const COOKIE_CONSENT_KEY = "ayuzee_cookie_consent";

export type ConsentPurpose =
  | "terms"
  | "privacy"
  | "marketing"
  | "health_processing"
  | "analytics"
  | "cookies_essential"
  | "cookies_analytics";

export type CookieConsent = {
  essential: true;
  analytics: boolean;
  savedAt: string;
};

export const getCookieConsent = (): CookieConsent | null => {
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CookieConsent;
  } catch {
    return null;
  }
};

export const setCookieConsent = (analytics: boolean): CookieConsent => {
  const value: CookieConsent = {
    essential: true,
    analytics,
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(value));
  return value;
};

export const hasAnalyticsConsent = (): boolean => getCookieConsent()?.analytics === true;

export const recordConsent = async (opts: {
  purpose: ConsentPurpose;
  granted: boolean;
  userId?: string;
  email?: string;
}) => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = opts.userId ?? sessionData.session?.user?.id;

  const row = {
    user_id: userId ?? null,
    email: opts.email ?? sessionData.session?.user?.email ?? null,
    purpose: opts.purpose,
    policy_version: POLICY_VERSION,
    granted: opts.granted,
    withdrawn_at: opts.granted ? null : new Date().toISOString(),
    user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
  };

  const { error } = await (supabase as any).from("user_consent_records").insert(row);
  if (error) console.warn("[consent] Failed to record:", error.message);
};

export const recordSignupConsents = async (userId: string, email: string) => {
  await Promise.all([
    recordConsent({ purpose: "terms", granted: true, userId, email }),
    recordConsent({ purpose: "privacy", granted: true, userId, email }),
  ]);
};

export const withdrawMarketingConsent = async (email: string) => {
  await recordConsent({ purpose: "marketing", granted: false, email });
};
