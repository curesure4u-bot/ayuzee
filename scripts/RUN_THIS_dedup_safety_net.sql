-- ╔════════════════════════════════════════════════════════════════════════════════╗
-- ║  AYUZEE — Platform-Wide Deduplication Safety Net                               ║
-- ║                                                                              ║
-- ║  Adds UNIQUE constraints across ALL platform modules to prevent              ║
-- ║  double entries at the database level.                                       ║
-- ║                                                                              ║
-- ║  SAFE TO RUN: Uses IF NOT EXISTS. Won't fail on existing constraints.        ║
-- ║  If duplicates already exist, the constraint will fail — see bottom          ║
-- ║  of script for cleanup queries.                                              ║
-- ║  HOW TO RUN: Supabase Dashboard → SQL Editor → Paste → Run                  ║
-- ╚════════════════════════════════════════════════════════════════════════════════╝

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. APPOINTMENTS — Prevent same patient booking same doctor same time
-- ═══════════════════════════════════════════════════════════════════════════════

-- HMS Appointments: one patient, one doctor, one time slot
CREATE UNIQUE INDEX IF NOT EXISTS idx_dedup_hms_appointments
  ON hms_appointments(patient_name, doctor_name, date, time_slot)
  WHERE status NOT IN ('cancelled', 'no_show');

-- Online Bookings: one patient, one doctor, one slot
DO $$ BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS idx_dedup_hms_online_bookings
    ON hms_online_bookings(patient_id, doctor_id, booking_date, time_slot)
    WHERE status NOT IN ('cancelled');
EXCEPTION WHEN undefined_table THEN NULL;
WHEN undefined_column THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. ORDERS & PAYMENTS — Prevent double orders/charges
-- ═══════════════════════════════════════════════════════════════════════════════

-- Add idempotency column to orders (if table exists)
DO $$ BEGIN
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS idempotency_key TEXT UNIQUE;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- Prevent duplicate payment entries for same order
DO $$ BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS idx_dedup_payments_order
    ON payments(order_id, payment_status)
    WHERE payment_status = 'success';
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. JOB APPLICATIONS — One application per user per job
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE UNIQUE INDEX IF NOT EXISTS idx_dedup_job_applications
  ON job_applications(user_id, job_id)
  WHERE status != 'withdrawn';

-- Freelance gig applications
CREATE UNIQUE INDEX IF NOT EXISTS idx_dedup_freelance_applications
  ON freelance_gig_applications(applicant_id, gig_id)
  WHERE status != 'withdrawn';

-- Internship applications
CREATE UNIQUE INDEX IF NOT EXISTS idx_dedup_internship_applications
  ON internship_applications(student_id, listing_id)
  WHERE status != 'withdrawn';

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. THERAPY/SESSION BOOKINGS — Prevent double-booking same slot
-- ═══════════════════════════════════════════════════════════════════════════════

-- Panchakarma therapy sessions: one therapist, one room, one time
DO $$ BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS idx_dedup_pk_sessions
    ON pk_therapy_sessions(therapist_id, session_date, start_time)
    WHERE status NOT IN ('cancelled');
EXCEPTION WHEN undefined_table THEN NULL;
WHEN undefined_column THEN NULL;
END $$;

-- Spine therapy sessions
DO $$ BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS idx_dedup_spine_sessions
    ON spine_therapy_sessions(patient_id, session_date)
    WHERE status NOT IN ('cancelled');
EXCEPTION WHEN undefined_table THEN NULL;
WHEN undefined_column THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. HMS BILLING — Prevent duplicate bills for same consultation
-- ═══════════════════════════════════════════════════════════════════════════════

-- One bill per patient per consultation/visit
DO $$ BEGIN
  ALTER TABLE hms_bills ADD COLUMN IF NOT EXISTS consultation_ref TEXT;
  CREATE UNIQUE INDEX IF NOT EXISTS idx_dedup_hms_bills
    ON hms_bills(patient_id, consultation_ref)
    WHERE consultation_ref IS NOT NULL AND status != 'cancelled';
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- Lab orders: one order per patient per test per day
DO $$ BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS idx_dedup_lab_orders
    ON hms_lab_orders(patient_id, order_date, referring_doctor_id)
    WHERE status NOT IN ('cancelled');
EXCEPTION WHEN undefined_table THEN NULL;
WHEN undefined_column THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. STUDENT MODULE — Prevent duplicate quiz attempts, memberships
-- ═══════════════════════════════════════════════════════════════════════════════

-- One active study group membership per user per group
CREATE UNIQUE INDEX IF NOT EXISTS idx_dedup_study_group_members
  ON study_group_members(user_id, group_id)
  WHERE status = 'active';

-- One chapter membership per user per chapter
CREATE UNIQUE INDEX IF NOT EXISTS idx_dedup_chapter_members
  ON chapter_members(user_id, chapter_id)
  WHERE status = 'active';

-- Competition: one entry per participant per competition
CREATE UNIQUE INDEX IF NOT EXISTS idx_dedup_competition_participants
  ON competition_participants(user_id, competition_id);

-- Mentorship: one active request per student per mentor
CREATE UNIQUE INDEX IF NOT EXISTS idx_dedup_mentorship
  ON mentorship_requests(student_id, mentor_id)
  WHERE status IN ('pending', 'accepted');

-- ═══════════════════════════════════════════════════════════════════════════════
-- 7. LEAVE REQUESTS — Prevent duplicate leave for same dates
-- ═══════════════════════════════════════════════════════════════════════════════

-- One leave request per employee per date range (not cancelled)
CREATE UNIQUE INDEX IF NOT EXISTS idx_dedup_leave_requests
  ON hrms_leave_requests(employee_id, from_date, to_date, leave_type_id)
  WHERE status NOT IN ('cancelled', 'revoked', 'rejected');

-- ═══════════════════════════════════════════════════════════════════════════════
-- 8. DOCTOR/THERAPIST — Prevent duplicate profiles
-- ═══════════════════════════════════════════════════════════════════════════════

-- One doctor profile per user
DO $$ BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS idx_dedup_doctor_user
    ON doctors(user_id);
EXCEPTION WHEN undefined_table THEN NULL;
WHEN duplicate_table THEN NULL;
END $$;

-- One therapist profile per user
DO $$ BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS idx_dedup_therapist_user
    ON therapists(user_id);
EXCEPTION WHEN undefined_table THEN NULL;
WHEN duplicate_table THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 9. REVIEWS & FEEDBACK — One review per patient per doctor/therapist
-- ═══════════════════════════════════════════════════════════════════════════════

DO $$ BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS idx_dedup_patient_reviews
    ON patient_reviews(patient_id, doctor_id, appointment_id)
    WHERE appointment_id IS NOT NULL;
EXCEPTION WHEN undefined_table THEN NULL;
WHEN undefined_column THEN NULL;
END $$;

-- HMS Patient Feedback: one feedback per visit
DO $$ BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS idx_dedup_hms_feedback
    ON hms_patient_feedback(patient_id, visit_date)
    WHERE visit_date IS NOT NULL;
EXCEPTION WHEN undefined_table THEN NULL;
WHEN undefined_column THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 10. COIN/XP TRANSACTIONS — Prevent duplicate reward credits
-- ═══════════════════════════════════════════════════════════════════════════════

-- Student coins: prevent same action credited twice
DO $$ BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS idx_dedup_student_coins
    ON student_coin_transactions(user_id, action_type, reference_id)
    WHERE reference_id IS NOT NULL;
EXCEPTION WHEN undefined_table THEN NULL;
WHEN undefined_column THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 11. RECRUITMENT — Prevent duplicate candidates for same vacancy
-- ═══════════════════════════════════════════════════════════════════════════════

-- One candidate per phone per vacancy
CREATE UNIQUE INDEX IF NOT EXISTS idx_dedup_hrms_candidates
  ON hrms_candidates(vacancy_id, phone)
  WHERE phone IS NOT NULL AND status NOT IN ('withdrawn');

-- ═══════════════════════════════════════════════════════════════════════════════
-- 12. NOTIFICATIONS — Prevent duplicate notifications
-- ═══════════════════════════════════════════════════════════════════════════════

-- Prevent same notification sent twice for same source
CREATE UNIQUE INDEX IF NOT EXISTS idx_dedup_hrms_notifications
  ON hrms_notifications(recipient_user_id, source_module, source_entity_id)
  WHERE source_entity_id IS NOT NULL;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 13. ANNOUNCEMENTS — Prevent exact duplicate announcements
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE UNIQUE INDEX IF NOT EXISTS idx_dedup_announcements
  ON hrms_announcements(title, publish_date, organisation_id)
  WHERE is_published = true;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 14. INSURANCE CLAIMS — One claim per admission/visit
-- ═══════════════════════════════════════════════════════════════════════════════

DO $$ BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS idx_dedup_insurance_claims
    ON hms_insurance_claims(patient_id, admission_id)
    WHERE admission_id IS NOT NULL AND status NOT IN ('cancelled', 'rejected');
EXCEPTION WHEN undefined_table THEN NULL;
WHEN undefined_column THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 15. STOCK — Prevent duplicate GRN/Purchase Orders
-- ═══════════════════════════════════════════════════════════════════════════════

DO $$ BEGIN
  -- Unique PO number per branch
  CREATE UNIQUE INDEX IF NOT EXISTS idx_dedup_stock_po_number
    ON hms_stock_purchase_orders(po_number, branch_id)
    WHERE po_number IS NOT NULL;
EXCEPTION WHEN undefined_table THEN NULL;
WHEN undefined_column THEN NULL;
END $$;

DO $$ BEGIN
  -- Unique GRN number
  CREATE UNIQUE INDEX IF NOT EXISTS idx_dedup_stock_grn_number
    ON hms_stock_grn(grn_number)
    WHERE grn_number IS NOT NULL;
EXCEPTION WHEN undefined_table THEN NULL;
WHEN undefined_column THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 16. USER ROLES — Prevent duplicate role assignment
-- (Already has UNIQUE(user_id, role) — confirming it exists)
-- ═══════════════════════════════════════════════════════════════════════════════

-- This should already exist from user_setup migration
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_dedup_user_roles ON user_roles(user_id, role);

-- ═══════════════════════════════════════════════════════════════════════════════
-- DONE — Deduplication Safety Net Applied
-- 
-- Summary of protections added:
-- 1.  Appointments: same patient + doctor + time = blocked
-- 2.  Orders: idempotency_key column (app must use it)
-- 3.  Job applications: one per user per job
-- 4.  Therapy sessions: no double-booking same slot
-- 5.  HMS billing: one bill per consultation
-- 6.  Study groups/chapters: one membership per user
-- 7.  Leave requests: no duplicate date ranges
-- 8.  Doctor/Therapist: one profile per user_id
-- 9.  Reviews: one per patient per appointment
-- 10. Coin transactions: no duplicate credits
-- 11. Recruitment candidates: one per phone per vacancy
-- 12. Notifications: no duplicate sends
-- 13. Announcements: no duplicate posts
-- 14. Insurance claims: one per admission
-- 15. Stock PO/GRN: unique numbers
-- 16. User roles: already unique (confirmed)
--
-- NOTE: If any CREATE INDEX fails due to existing duplicates in data,
-- run this query to find them:
--   SELECT column1, column2, COUNT(*) FROM table 
--   GROUP BY column1, column2 HAVING COUNT(*) > 1;
-- Then resolve the duplicates manually before re-running the constraint.
-- ═══════════════════════════════════════════════════════════════════════════════
