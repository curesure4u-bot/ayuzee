-- ╔══════════════════════════════════════════════════════════════════╗
-- ║  Therapist Portal Enhancements — Full SQL Migration             ║
-- ║  AI Session Notes, Progress Tracking, Availability, Comms, etc. ║
-- ║  Run this in Supabase SQL Editor                                ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- ╔══════════════════════════════════════════════════════════════════╗
-- ║  PRIVACY & CONTROL RULES (ENFORCED IN CODE + DB)                ║
-- ║                                                                  ║
-- ║  1. Therapists NEVER work independently — doctor instruction     ║
-- ║  2. Patient names stored full but UI masks to "FirstName L."     ║
-- ║  3. Patient phone NEVER shown to therapist (doctor/admin only)   ║
-- ║  4. Therapist can ONLY message doctors, NOT patients directly    ║
-- ║  5. All session notes require doctor review/acknowledgement      ║
-- ║  6. Platform retains full patient data; therapist sees minimum   ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- ════════════════════════════════════════════════════════════
-- 1. THERAPIST AI SESSION NOTES (Panchakarma/AYUSH-adapted)
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS therapist_session_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  session_id UUID NOT NULL, -- references therapy_sessions(id) — FK added after that table exists
  patient_name TEXT NOT NULL,
  -- AYUSH-specific clinical fields
  therapy_type TEXT NOT NULL, -- abhyanga, shirodhara, basti, nasya, vamana, virechana, etc.
  prakriti_observed TEXT, -- Vata/Pitta/Kapha dominance observed
  dosha_assessment JSONB DEFAULT '{}'::jsonb, -- {vata: 0-10, pitta: 0-10, kapha: 0-10}
  agni_status TEXT, -- tikshna, manda, vishama, sama
  ama_status TEXT, -- present/absent/mild/moderate/severe
  therapy_response TEXT, -- excellent/good/moderate/poor
  patient_tolerance TEXT, -- good/moderate/low
  -- Materials used
  oil_decoction_used TEXT,
  quantity_used TEXT,
  temperature TEXT, -- warm/hot/cold/room_temp
  duration_applied INTEGER, -- minutes
  -- Charaka-style documentation
  rogi_bala TEXT, -- patient strength assessment
  roga_bala TEXT, -- disease strength
  vyadhi_assessment TEXT, -- disease assessment
  -- Vital observations
  pulse_before TEXT,
  pulse_after TEXT,
  skin_response TEXT,
  sweat_response TEXT,
  -- Notes
  procedure_notes TEXT,
  observations TEXT,
  after_care_instructions TEXT,
  adverse_reactions TEXT,
  recommendations_for_doctor TEXT,
  -- Doctor intimation
  doctor_id UUID, -- prescribing doctor
  doctor_instruction_id UUID, -- reference to doctor's prescription/instruction that authorized this session
  sent_to_doctor BOOLEAN NOT NULL DEFAULT FALSE,
  doctor_acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
  doctor_acknowledged_at TIMESTAMPTZ,
  doctor_response TEXT,
  -- AI generated summary
  ai_generated_summary TEXT,
  -- Metadata
  note_status TEXT NOT NULL DEFAULT 'draft' CHECK (note_status IN ('draft', 'submitted', 'acknowledged', 'flagged')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE therapist_session_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Therapists manage own session notes" ON therapist_session_notes
  FOR ALL USING (
    therapist_id IN (SELECT id FROM therapists WHERE user_id = auth.uid())
    OR doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_tsn_therapist ON therapist_session_notes(therapist_id);
CREATE INDEX IF NOT EXISTS idx_tsn_session ON therapist_session_notes(session_id);
CREATE INDEX IF NOT EXISTS idx_tsn_doctor ON therapist_session_notes(doctor_id);

-- ════════════════════════════════════════════════════════════
-- 2. TREATMENT PROGRESS TRACKING
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS therapist_treatment_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  patient_phone TEXT, -- PRIVACY: stored for doctor/admin lookup ONLY, NEVER shown to therapist UI
  therapy_type TEXT NOT NULL,
  total_sessions INTEGER NOT NULL DEFAULT 7,
  completed_sessions INTEGER NOT NULL DEFAULT 0,
  start_date DATE NOT NULL,
  expected_end_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  -- Dosha baseline
  dosha_baseline JSONB DEFAULT '{"vata":5,"pitta":5,"kapha":5}'::jsonb,
  -- Doctor connection
  prescribing_doctor_id UUID,
  doctor_approved BOOLEAN NOT NULL DEFAULT FALSE,
  -- Photos (patient consent required)
  before_photo_url TEXT,
  after_photo_url TEXT,
  photo_consent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE therapist_treatment_courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Therapists manage own courses" ON therapist_treatment_courses
  FOR ALL USING (
    therapist_id IN (SELECT id FROM therapists WHERE user_id = auth.uid())
    OR prescribing_doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid())
  );

-- Progress entries per session within a course
CREATE TABLE IF NOT EXISTS therapist_progress_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES therapist_treatment_courses(id) ON DELETE CASCADE,
  session_number INTEGER NOT NULL,
  session_date DATE NOT NULL,
  -- Symptom scores (1-10)
  pain_score INTEGER CHECK (pain_score BETWEEN 0 AND 10),
  mobility_score INTEGER CHECK (mobility_score BETWEEN 0 AND 10),
  energy_score INTEGER CHECK (energy_score BETWEEN 0 AND 10),
  sleep_score INTEGER CHECK (sleep_score BETWEEN 0 AND 10),
  digestion_score INTEGER CHECK (digestion_score BETWEEN 0 AND 10),
  -- Dosha tracking
  dosha_current JSONB DEFAULT '{"vata":5,"pitta":5,"kapha":5}'::jsonb,
  -- Notes
  therapist_observation TEXT,
  patient_feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE therapist_progress_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Therapists manage progress entries" ON therapist_progress_entries
  FOR ALL USING (
    course_id IN (
      SELECT id FROM therapist_treatment_courses
      WHERE therapist_id IN (SELECT id FROM therapists WHERE user_id = auth.uid())
      OR prescribing_doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid())
    )
  );

CREATE INDEX IF NOT EXISTS idx_tpe_course ON therapist_progress_entries(course_id);

-- ════════════════════════════════════════════════════════════
-- 3. THERAPIST AVAILABILITY / SCHEDULING
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS therapist_availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sun
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE therapist_availability_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Therapists manage own availability" ON therapist_availability_slots
  FOR ALL USING (therapist_id IN (SELECT id FROM therapists WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS therapist_blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  blocked_date DATE NOT NULL,
  reason TEXT, -- leave, festival, travel, personal
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(therapist_id, blocked_date)
);

ALTER TABLE therapist_blocked_dates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Therapists manage own blocked dates" ON therapist_blocked_dates
  FOR ALL USING (therapist_id IN (SELECT id FROM therapists WHERE user_id = auth.uid()));

-- Settings
CREATE TABLE IF NOT EXISTS therapist_scheduling_settings (
  therapist_id UUID PRIMARY KEY REFERENCES therapists(id) ON DELETE CASCADE,
  auto_accept_bookings BOOLEAN NOT NULL DEFAULT FALSE,
  max_sessions_per_day INTEGER NOT NULL DEFAULT 8,
  buffer_minutes INTEGER NOT NULL DEFAULT 15,
  advance_booking_days INTEGER NOT NULL DEFAULT 14,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE therapist_scheduling_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Therapists manage own settings" ON therapist_scheduling_settings
  FOR ALL USING (therapist_id IN (SELECT id FROM therapists WHERE user_id = auth.uid()));

-- ════════════════════════════════════════════════════════════
-- 4. PATIENT NOTES & HISTORY (Therapist's private notes)
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS therapist_patient_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  patient_phone TEXT, -- PRIVACY: stored for doctor/admin lookup ONLY, NEVER shown to therapist UI
  -- Patient preferences & flags
  allergies TEXT,
  contraindications TEXT,
  preferences JSONB DEFAULT '{}'::jsonb, -- {oil_preference, temperature, pressure, etc}
  pain_tolerance TEXT, -- high/medium/low
  special_notes TEXT,
  -- Tags
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(therapist_id, patient_name, patient_phone)
);

ALTER TABLE therapist_patient_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Therapists manage own patient notes" ON therapist_patient_notes
  FOR ALL USING (therapist_id IN (SELECT id FROM therapists WHERE user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_tpn_therapist ON therapist_patient_notes(therapist_id);

-- ════════════════════════════════════════════════════════════
-- 5. COMMUNICATION HUB (Doctor ↔ Therapist ↔ Patient)
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS therapist_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_type TEXT NOT NULL CHECK (sender_type IN ('therapist', 'doctor', 'patient', 'system')),
  sender_id UUID NOT NULL, -- therapist_id or doctor_id or user_id
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('therapist', 'doctor', 'patient')),
  recipient_id UUID NOT NULL,
  -- Context
  session_id UUID, -- optional, links to a specific session
  subject TEXT,
  message TEXT NOT NULL,
  -- Status
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  is_urgent BOOLEAN NOT NULL DEFAULT FALSE,
  -- Metadata
  message_type TEXT NOT NULL DEFAULT 'general' CHECK (message_type IN ('general', 'instruction', 'clarification', 'adverse_event', 'follow_up', 'handoff')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- PRIVACY CONSTRAINT: Therapists can ONLY send to doctors/system, NEVER directly to patients
  CONSTRAINT chk_no_therapist_to_patient CHECK (
    NOT (sender_type = 'therapist' AND recipient_type = 'patient')
  )
);

ALTER TABLE therapist_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see messages they sent or received" ON therapist_messages
  FOR ALL USING (
    sender_id IN (SELECT id FROM therapists WHERE user_id = auth.uid())
    OR recipient_id IN (SELECT id FROM therapists WHERE user_id = auth.uid())
    OR sender_id IN (SELECT id FROM doctors WHERE user_id = auth.uid())
    OR recipient_id IN (SELECT id FROM doctors WHERE user_id = auth.uid())
    OR sender_id = auth.uid()
    OR recipient_id = auth.uid()
  );

CREATE INDEX IF NOT EXISTS idx_tm_recipient ON therapist_messages(recipient_type, recipient_id);
CREATE INDEX IF NOT EXISTS idx_tm_sender ON therapist_messages(sender_type, sender_id);

-- ════════════════════════════════════════════════════════════
-- 6. PROTOCOL LIBRARY
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS therapy_protocol_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapy_type TEXT NOT NULL, -- abhyanga, shirodhara, basti, etc.
  title TEXT NOT NULL,
  description TEXT,
  -- Steps
  preparation_steps JSONB DEFAULT '[]'::jsonb,
  procedure_steps JSONB DEFAULT '[]'::jsonb,
  post_procedure_steps JSONB DEFAULT '[]'::jsonb,
  -- Clinical info
  indications TEXT[],
  contraindications TEXT[],
  precautions TEXT[],
  duration_minutes INTEGER,
  -- Materials
  materials_required JSONB DEFAULT '[]'::jsonb,
  -- Metadata
  reference_text TEXT, -- Charaka Samhita ref, etc.
  difficulty_level TEXT DEFAULT 'intermediate' CHECK (difficulty_level IN ('basic', 'intermediate', 'advanced')),
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- No RLS needed — this is public reference data
ALTER TABLE therapy_protocol_library ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can read protocols" ON therapy_protocol_library FOR SELECT USING (true);
CREATE POLICY "Only admins insert/update protocols" ON therapy_protocol_library
  FOR ALL USING (auth.jwt() ->> 'email' IN ('jasirsajidh8@gmail.com', 'curesure4u@gmail.com'));

-- ════════════════════════════════════════════════════════════
-- 7. THERAPIST EDUCATION / LEARNING
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS therapist_learning_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'article', 'quiz', 'certification', 'clinical_update')),
  therapy_type TEXT, -- null = general
  video_url TEXT,
  article_body TEXT,
  thumbnail_url TEXT,
  duration_minutes INTEGER,
  difficulty_level TEXT DEFAULT 'all',
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE therapist_learning_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can read learning content" ON therapist_learning_content FOR SELECT USING (is_published = true);
CREATE POLICY "Only admins manage learning content" ON therapist_learning_content
  FOR ALL USING (auth.jwt() ->> 'email' IN ('jasirsajidh8@gmail.com', 'curesure4u@gmail.com'));

CREATE TABLE IF NOT EXISTS therapist_learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES therapist_learning_content(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  completed_at TIMESTAMPTZ,
  score INTEGER, -- for quizzes
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(therapist_id, content_id)
);

ALTER TABLE therapist_learning_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Therapists manage own learning" ON therapist_learning_progress
  FOR ALL USING (therapist_id IN (SELECT id FROM therapists WHERE user_id = auth.uid()));

-- ════════════════════════════════════════════════════════════
-- 8. PATIENT FEEDBACK / REVIEWS (Therapist view)
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS therapist_patient_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  session_id UUID, -- references therapy_sessions(id) — FK added after that table exists
  patient_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  compliment_tags TEXT[] DEFAULT '{}', -- ['gentle_hands', 'punctual', 'calming', 'professional']
  -- Therapist response
  therapist_response TEXT,
  responded_at TIMESTAMPTZ,
  -- Visibility
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE therapist_patient_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Therapists can view and respond to their reviews" ON therapist_patient_reviews
  FOR ALL USING (therapist_id IN (SELECT id FROM therapists WHERE user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_tpr_therapist ON therapist_patient_reviews(therapist_id);

-- ════════════════════════════════════════════════════════════
-- 9. SUPPORT TICKETS
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS therapist_support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('payment', 'scheduling', 'technical', 'emergency', 'feedback', 'other')),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  admin_response TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE therapist_support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Therapists manage own tickets" ON therapist_support_tickets
  FOR ALL USING (therapist_id IN (SELECT id FROM therapists WHERE user_id = auth.uid()));

-- ════════════════════════════════════════════════════════════
-- 10. CONTENT MARKETING / BRANDING
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS therapist_content_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  post_type TEXT NOT NULL CHECK (post_type IN ('explainer', 'education_card', 'testimonial', 'tip')),
  title TEXT NOT NULL,
  body TEXT,
  image_url TEXT,
  therapy_type TEXT,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  share_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE therapist_content_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Therapists manage own content" ON therapist_content_posts
  FOR ALL USING (therapist_id IN (SELECT id FROM therapists WHERE user_id = auth.uid()));

-- Referral tracking
CREATE TABLE IF NOT EXISTS therapist_referral_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL UNIQUE,
  clicks INTEGER NOT NULL DEFAULT 0,
  bookings_from_referral INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE therapist_referral_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Therapists manage own referrals" ON therapist_referral_links
  FOR ALL USING (therapist_id IN (SELECT id FROM therapists WHERE user_id = auth.uid()));

-- ════════════════════════════════════════════════════════════
-- Done! All therapist enhancement tables created.
-- ════════════════════════════════════════════════════════════
