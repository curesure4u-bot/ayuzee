-- ╔══════════════════════════════════════════════════════════════════╗
-- ║  Therapist Operations — Checklist, Performance, Shifts,         ║
-- ║  Material Log, Doctor Sign-off, Geo-fence                       ║
-- ║  Run this in Supabase SQL Editor                                ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- ════════════════════════════════════════════════════════════
-- 1. PRE-PROCEDURE CHECKLIST (Gate before starting session)
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS therapist_pre_procedure_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  session_id UUID NOT NULL, -- references therapy_sessions(id)
  -- 5 mandatory checks (ALL must be true to start session)
  doctor_instruction_received BOOLEAN NOT NULL DEFAULT FALSE,
  patient_identity_verified BOOLEAN NOT NULL DEFAULT FALSE, -- verified by attender/venue, NOT therapist
  materials_match_prescription BOOLEAN NOT NULL DEFAULT FALSE,
  room_table_ready BOOLEAN NOT NULL DEFAULT FALSE,
  patient_consent_acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
  -- All checks must pass to start session
  all_clear BOOLEAN NOT NULL DEFAULT FALSE,
  verified_by_venue_staff TEXT, -- name of venue staff who verified patient identity
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(therapist_id, session_id)
);

ALTER TABLE therapist_pre_procedure_checklists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Therapists manage own checklists" ON therapist_pre_procedure_checklists
  FOR ALL USING (therapist_id IN (SELECT id FROM therapists WHERE user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_tppc_session ON therapist_pre_procedure_checklists(session_id);

-- ════════════════════════════════════════════════════════════
-- 2. THERAPIST PERFORMANCE SCORING
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS therapist_performance_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  -- Period
  period_month INTEGER NOT NULL, -- 1-12
  period_year INTEGER NOT NULL,
  -- Scores (0-100 scale)
  ontime_arrival_score INTEGER NOT NULL DEFAULT 0 CHECK (ontime_arrival_score BETWEEN 0 AND 100),
  session_completion_score INTEGER NOT NULL DEFAULT 0 CHECK (session_completion_score BETWEEN 0 AND 100),
  doctor_satisfaction_score INTEGER NOT NULL DEFAULT 0 CHECK (doctor_satisfaction_score BETWEEN 0 AND 100),
  patient_feedback_score INTEGER NOT NULL DEFAULT 0 CHECK (patient_feedback_score BETWEEN 0 AND 100),
  protocol_adherence_score INTEGER NOT NULL DEFAULT 0 CHECK (protocol_adherence_score BETWEEN 0 AND 100),
  -- Aggregate
  overall_score INTEGER NOT NULL DEFAULT 0 CHECK (overall_score BETWEEN 0 AND 100),
  -- Counts for calculation
  total_sessions INTEGER NOT NULL DEFAULT 0,
  sessions_on_time INTEGER NOT NULL DEFAULT 0,
  sessions_completed INTEGER NOT NULL DEFAULT 0,
  checklists_completed INTEGER NOT NULL DEFAULT 0,
  doctor_approvals_received INTEGER NOT NULL DEFAULT 0,
  -- Metadata
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(therapist_id, period_month, period_year)
);

ALTER TABLE therapist_performance_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Therapists view own scores" ON therapist_performance_scores
  FOR SELECT USING (therapist_id IN (SELECT id FROM therapists WHERE user_id = auth.uid()));
-- Admin can manage all
CREATE POLICY "Admin manage all scores" ON therapist_performance_scores
  FOR ALL USING (auth.jwt() ->> 'email' IN ('jasirsajidh8@gmail.com', 'curesure4u@gmail.com'));

-- ════════════════════════════════════════════════════════════
-- 3. SHIFT / ROSTER MANAGEMENT
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS therapist_shift_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  -- Shift details (assigned by admin/venue)
  shift_date DATE NOT NULL,
  shift_type TEXT NOT NULL CHECK (shift_type IN ('morning', 'afternoon', 'evening', 'full_day')),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  -- Venue
  venue_id UUID, -- references therapy_venues if exists
  venue_name TEXT NOT NULL,
  venue_address TEXT,
  -- Assignment
  assigned_by UUID, -- admin or venue manager user_id
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Status
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  therapist_confirmed_at TIMESTAMPTZ,
  -- Expected sessions for this shift
  expected_sessions INTEGER NOT NULL DEFAULT 0,
  completed_sessions INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE therapist_shift_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Therapists view own shifts" ON therapist_shift_assignments
  FOR ALL USING (therapist_id IN (SELECT id FROM therapists WHERE user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_tsa_date ON therapist_shift_assignments(therapist_id, shift_date);

-- ════════════════════════════════════════════════════════════
-- 4. MATERIAL CONSUMPTION LOG
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS therapist_material_consumption (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  session_id UUID NOT NULL, -- references therapy_sessions(id)
  -- Materials used
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Each item: { name, category, quantity, unit, prescribed_quantity }
  -- Categories: oil, herb, powder, decoction, linen, consumable, other
  -- Total cost estimate
  estimated_cost NUMERIC(10,2),
  -- Venue reconciliation
  venue_id UUID,
  venue_acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
  venue_acknowledged_by TEXT,
  venue_acknowledged_at TIMESTAMPTZ,
  -- Discrepancy flag
  has_discrepancy BOOLEAN NOT NULL DEFAULT FALSE,
  discrepancy_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE therapist_material_consumption ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Therapists manage own material logs" ON therapist_material_consumption
  FOR ALL USING (therapist_id IN (SELECT id FROM therapists WHERE user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_tmc_session ON therapist_material_consumption(session_id);

-- ════════════════════════════════════════════════════════════
-- 5. DOCTOR SIGN-OFF / APPROVAL WORKFLOW
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS therapist_session_signoffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL, -- references therapy_sessions(id)
  therapist_id UUID NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  doctor_id UUID, -- prescribing doctor
  -- Sign-off status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'revision_requested')),
  -- Doctor's review
  doctor_rating INTEGER CHECK (doctor_rating BETWEEN 1 AND 5), -- rates note quality
  doctor_comments TEXT,
  revision_reason TEXT,
  -- Earnings gate
  earnings_amount NUMERIC(10,2),
  earnings_released BOOLEAN NOT NULL DEFAULT FALSE,
  earnings_released_at TIMESTAMPTZ,
  -- Timestamps
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  -- Auto-approve after 24hrs if doctor doesn't respond
  auto_approve_after TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(session_id, therapist_id)
);

ALTER TABLE therapist_session_signoffs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Therapists view own signoffs" ON therapist_session_signoffs
  FOR SELECT USING (therapist_id IN (SELECT id FROM therapists WHERE user_id = auth.uid()));
CREATE POLICY "Doctors manage signoffs for their patients" ON therapist_session_signoffs
  FOR ALL USING (doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_tss_therapist ON therapist_session_signoffs(therapist_id);
CREATE INDEX IF NOT EXISTS idx_tss_doctor ON therapist_session_signoffs(doctor_id, status);

-- ════════════════════════════════════════════════════════════
-- 6. GEO-FENCE VERIFICATION LOG
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS therapist_geofence_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  -- Therapist location
  therapist_lat DOUBLE PRECISION NOT NULL,
  therapist_lng DOUBLE PRECISION NOT NULL,
  -- Venue location (from venue record)
  venue_lat DOUBLE PRECISION,
  venue_lng DOUBLE PRECISION,
  -- Calculated distance
  distance_meters DOUBLE PRECISION NOT NULL,
  -- Result
  within_range BOOLEAN NOT NULL, -- true if distance <= 200m
  action_attempted TEXT NOT NULL CHECK (action_attempted IN ('start_session', 'checkin', 'checkout')),
  action_allowed BOOLEAN NOT NULL,
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE therapist_geofence_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Therapists view own geo logs" ON therapist_geofence_logs
  FOR ALL USING (therapist_id IN (SELECT id FROM therapists WHERE user_id = auth.uid()));

-- ════════════════════════════════════════════════════════════
-- Done! All operational enhancement tables created.
-- ════════════════════════════════════════════════════════════
