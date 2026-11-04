import "@supabase/supabase-js";
import type { PostgrestQueryBuilder } from "@supabase/postgrest-js";

// Compatibility for legacy integrations not represented in the managed schema.
// This only extends query typing; it does not create tables or grant access.
type LegacyTable =
  | "ai_feedback" | "ayuzee_hms_bridge" | "ayuzee_hms_sync_log" | "ayuzee_hms_bridge_config" | "ayush_drug_interactions"
  | "case_referrals" | "clinic_certifications" | "cme_credits"
  | "dispenza_premium_access" | "doctor_articles" | "doctor_follows"
  | "doctor_online_status" | "doctor_payouts" | "doctor_verifications"
  | "feed_posts" | "gamification_points" | "medicine_subscriptions" | "medicine_adherence_logs" | "patient_prescribed_medicines" | "spine_recovery_scores"
  | "orders" | "patient_reviews" | "product_requests" | "spine_ayush_posture_assessments"
  | "spine_ayush_modules" | "spine_clinical_resources" | "spine_ayush_user_progress" | "spine_checklists" | "spine_csr_allocations"
  | "spine_csr_donors" | "spine_franchise_data" | "spine_injury_patients"
  | "spine_leads" | "spine_library_resources" | "spine_offers"
  | "spine_patient_subscriptions" | "spine_referral_applications"
  | "spine_referral_rules" | "spine_referrals" | "spine_referrers"
  | "spine_rehab_followups" | "spine_retreat_registrations" | "spine_retreats"
  | "spine_social_links" | "spine_social_posts" | "spine_subscription_plans"
  | "spine_success_stories" | "spine_therapy_sessions" | "spine_videos"
  | "spine_vitality_assessments" | "spine_wellness_assessments"
  | "treatment_outcomes" | "volume_discount_slabs";

declare module "@supabase/supabase-js" {
  interface SupabaseClient<Database, SchemaNameOrClientOptions, SchemaName, Schema, ClientOptions> {
    from(relation: LegacyTable): PostgrestQueryBuilder<any, any, any>;
  }
}