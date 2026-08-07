-- ═══════════════════════════════════════════════════════════════════════════════
-- FIX: Drop existing policies before re-creating them
-- Run this BEFORE re-running create_hms_mis_tables.sql or create_hms_doctor_module.sql
-- if you get "policy already exists" errors.
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── MIS TABLES POLICIES ─────────────────────────────────────────────────────

-- mis_daily_collection
DROP POLICY IF EXISTS "HMS staff can view collection" ON mis_daily_collection;
DROP POLICY IF EXISTS "HMS staff can insert collection" ON mis_daily_collection;
DROP POLICY IF EXISTS "HMS staff can update own collection" ON mis_daily_collection;

-- mis_eod_reports
DROP POLICY IF EXISTS "HMS staff can view EOD reports" ON mis_eod_reports;
DROP POLICY IF EXISTS "HMS staff can create EOD reports" ON mis_eod_reports;
DROP POLICY IF EXISTS "HMS staff can update EOD reports" ON mis_eod_reports;

-- mis_scheduled_reports
DROP POLICY IF EXISTS "Owner can manage scheduled reports" ON mis_scheduled_reports;
DROP POLICY IF EXISTS "HMS staff can view scheduled reports" ON mis_scheduled_reports;

-- mis_org_members
DROP POLICY IF EXISTS "HMS staff can view org members" ON mis_org_members;
DROP POLICY IF EXISTS "HMS admins can manage org members" ON mis_org_members;

-- ─── DOCTOR MODULE POLICIES ──────────────────────────────────────────────────

-- consultation_templates
DROP POLICY IF EXISTS "Doctors can view own and shared templates" ON consultation_templates;
DROP POLICY IF EXISTS "Doctors can create own templates" ON consultation_templates;
DROP POLICY IF EXISTS "Doctors can update own templates" ON consultation_templates;
DROP POLICY IF EXISTS "Doctors can delete own templates" ON consultation_templates;

-- cdss_alert_rules
DROP POLICY IF EXISTS "All authenticated can view active CDSS rules" ON cdss_alert_rules;
DROP POLICY IF EXISTS "Admins can manage CDSS rules" ON cdss_alert_rules;

-- cdss_alert_log
DROP POLICY IF EXISTS "Doctors can view own alert logs" ON cdss_alert_log;
DROP POLICY IF EXISTS "Doctors can log alerts" ON cdss_alert_log;

-- doctor_revenue_entries
DROP POLICY IF EXISTS "Doctors can view own revenue" ON doctor_revenue_entries;
DROP POLICY IF EXISTS "System can insert revenue entries" ON doctor_revenue_entries;

-- doctor_payouts
DROP POLICY IF EXISTS "Doctors can view own payouts" ON doctor_payouts;
DROP POLICY IF EXISTS "System can manage payouts" ON doctor_payouts;

-- opd_queue_entries
DROP POLICY IF EXISTS "Doctors can view own queue" ON opd_queue_entries;
DROP POLICY IF EXISTS "Staff can manage queue" ON opd_queue_entries;

-- ─── PATIENT MODULE POLICIES ─────────────────────────────────────────────────

-- patient_timeline_events
DROP POLICY IF EXISTS "Staff can view patient timeline" ON patient_timeline_events;
DROP POLICY IF EXISTS "Staff can create timeline events" ON patient_timeline_events;
DROP POLICY IF EXISTS "Staff can update timeline events" ON patient_timeline_events;

-- patient_allergies
DROP POLICY IF EXISTS "Staff can view patient allergies" ON patient_allergies;
DROP POLICY IF EXISTS "Staff can manage patient allergies" ON patient_allergies;

-- patient_critical_conditions
DROP POLICY IF EXISTS "Staff can view critical conditions" ON patient_critical_conditions;
DROP POLICY IF EXISTS "Staff can manage critical conditions" ON patient_critical_conditions;

-- patient_treatment_plans
DROP POLICY IF EXISTS "Staff can view treatment plans" ON patient_treatment_plans;
DROP POLICY IF EXISTS "Staff can manage treatment plans" ON patient_treatment_plans;

-- patient_treatment_plan_days
DROP POLICY IF EXISTS "Staff can view plan days" ON patient_treatment_plan_days;
DROP POLICY IF EXISTS "Staff can manage plan days" ON patient_treatment_plan_days;

-- patient_compliance_scores
DROP POLICY IF EXISTS "Staff can view compliance scores" ON patient_compliance_scores;
DROP POLICY IF EXISTS "Staff can manage compliance scores" ON patient_compliance_scores;

-- patient_compliance_badges
DROP POLICY IF EXISTS "Staff can view compliance badges" ON patient_compliance_badges;
DROP POLICY IF EXISTS "Staff can manage compliance badges" ON patient_compliance_badges;

-- patient_risk_assessments
DROP POLICY IF EXISTS "Staff can view risk assessments" ON patient_risk_assessments;
DROP POLICY IF EXISTS "Staff can manage risk assessments" ON patient_risk_assessments;

-- patient_journey_stages
DROP POLICY IF EXISTS "Staff can view journey stages" ON patient_journey_stages;
DROP POLICY IF EXISTS "Staff can manage journey stages" ON patient_journey_stages;

-- ═══════════════════════════════════════════════════════════════════════════════
-- Done! Now re-run the create scripts and the policies will be re-created cleanly.
-- ═══════════════════════════════════════════════════════════════════════════════
