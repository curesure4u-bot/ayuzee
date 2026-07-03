/** Feature flag keys — must match `feature_flags` table rows. */
export const FEATURES = {
  ATMRI_CAMPAIGNS: "atmri_campaigns_enabled",
  ATMRI_CSR: "atmri_csr_enabled",
  ATMRI_IMPACT: "atmri_impact_dashboard_enabled",
  ATMRI_LEADERBOARD: "atmri_doctor_leaderboard_enabled",
  SYMPTOM_CHECKER: "symptom_checker_enabled",
  NADI_PAREEKSHA: "nadi_pareeksha_enabled",
  ADMIN_ROADMAP: "admin_roadmap_enabled",
  HMS_PHARMACY_ORDERS: "hms_pharmacy_orders_enabled",
  HMS_IP_ADMISSIONS: "hms_ip_admissions_enabled",
  VITALS_TRACKING: "vitals_tracking_enabled",
  GAMIFICATION_PORTAL: "gamification_portal_enabled",
  APP_WAITLIST: "app_waitlist_enabled",
  THERAPIST_SCHEDULE: "therapist_schedule_enabled",
  MAINTENANCE_MODE: "maintenance_mode",
  GUEST_CHECKOUT: "allow_guest_checkout",
  PRESCRIPTION_UPLOAD: "prescription_upload_enabled",
  THERAPIST_GPS: "therapist_gps_tracking_enabled",
} as const;

export type FeatureKey = (typeof FEATURES)[keyof typeof FEATURES];

/** Production-safe defaults when flags are loading or missing from DB. */
export const FEATURE_DEFAULTS: Record<FeatureKey, boolean> = {
  [FEATURES.ATMRI_CAMPAIGNS]: false,
  [FEATURES.ATMRI_CSR]: false,
  [FEATURES.ATMRI_IMPACT]: false,
  [FEATURES.ATMRI_LEADERBOARD]: false,
  [FEATURES.SYMPTOM_CHECKER]: false,
  [FEATURES.NADI_PAREEKSHA]: false,
  [FEATURES.ADMIN_ROADMAP]: false,
  [FEATURES.HMS_PHARMACY_ORDERS]: false,
  [FEATURES.HMS_IP_ADMISSIONS]: false,
  [FEATURES.VITALS_TRACKING]: false,
  [FEATURES.GAMIFICATION_PORTAL]: false,
  [FEATURES.APP_WAITLIST]: false,
  [FEATURES.THERAPIST_SCHEDULE]: false,
  [FEATURES.MAINTENANCE_MODE]: false,
  [FEATURES.GUEST_CHECKOUT]: true,
  [FEATURES.PRESCRIPTION_UPLOAD]: true,
  [FEATURES.THERAPIST_GPS]: true,
};

/** Paths gated by feature flags (for SEO / sitemap exclusion). */
export const GATED_PATHS: Array<{ flag: FeatureKey; paths: string[] }> = [
  {
    flag: FEATURES.ATMRI_CAMPAIGNS,
    paths: ["/atmri-help/campaigns", "/ayush-help/campaigns"],
  },
  {
    flag: FEATURES.ATMRI_CSR,
    paths: ["/atmri-help/csr", "/ayush-help/csr"],
  },
  {
    flag: FEATURES.ATMRI_IMPACT,
    paths: ["/atmri-help/impact", "/ayush-help/impact"],
  },
  {
    flag: FEATURES.ATMRI_LEADERBOARD,
    paths: ["/atmri-help/leaderboard", "/ayush-help/leaderboard"],
  },
  { flag: FEATURES.SYMPTOM_CHECKER, paths: ["/diagnosis/symptoms"] },
  { flag: FEATURES.ADMIN_ROADMAP, paths: ["/admin/roadmap"] },
  { flag: FEATURES.HMS_PHARMACY_ORDERS, paths: ["/admin/pharmacy-orders"] },
  { flag: FEATURES.HMS_IP_ADMISSIONS, paths: ["/admin/ip-admissions"] },
  { flag: FEATURES.GAMIFICATION_PORTAL, paths: ["/gamification"] },
];
