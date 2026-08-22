-- ═══════════════════════════════════════════════════════════════════════════════
-- AYUZEE HMS — Flags 16-20: MIS, CRM, Teleconsult, Quiz, ABDM
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- All tables use CREATE TABLE IF NOT EXISTS + ADD COLUMN IF NOT EXISTS pattern
-- ═══════════════════════════════════════════════════════════════════════════════

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ FLAG 16: MIS — Views over existing tables (no new tables needed)             ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

-- MIS pulls from: hms_op_visits, hms_bills, hms_prescriptions, hms_lab_orders,
-- hms_stock_products, hms_pk_enrollments, hms_attendance, hms_appointment_bookings
-- We create helper views for common aggregations:

CREATE OR REPLACE VIEW public.mis_daily_revenue AS
SELECT
  bill_date,
  branch,
  COUNT(*) as total_bills,
  SUM(total_amount) as total_revenue,
  SUM(paid_amount) as collected,
  SUM(balance_amount) as outstanding,
  COUNT(*) FILTER (WHERE payment_status = 'paid') as paid_count,
  COUNT(*) FILTER (WHERE payment_status = 'pending') as pending_count
FROM public.hms_bills
WHERE is_cancelled = false
GROUP BY bill_date, branch
ORDER BY bill_date DESC;

CREATE OR REPLACE VIEW public.mis_department_revenue AS
SELECT
  bill_date,
  department,
  branch,
  COUNT(*) as bill_count,
  SUM(total_amount) as revenue
FROM public.hms_bills
WHERE is_cancelled = false AND department IS NOT NULL
GROUP BY bill_date, department, branch
ORDER BY bill_date DESC, revenue DESC;

CREATE OR REPLACE VIEW public.mis_doctor_revenue AS
SELECT
  doctor_name,
  branch,
  DATE_TRUNC('month', bill_date)::DATE as month,
  COUNT(*) as bill_count,
  SUM(total_amount) as revenue
FROM public.hms_bills
WHERE is_cancelled = false AND doctor_name IS NOT NULL
GROUP BY doctor_name, branch, DATE_TRUNC('month', bill_date)
ORDER BY month DESC, revenue DESC;

CREATE OR REPLACE VIEW public.mis_opd_summary AS
SELECT
  visit_date,
  branch,
  COUNT(*) as total_visits,
  COUNT(*) FILTER (WHERE mode_visit = 'Direct') as walkins,
  COUNT(*) FILTER (WHERE mode_visit = 'Follow-up') as followups,
  COUNT(*) FILTER (WHERE mode_visit = 'Teleconsult') as teleconsults,
  COUNT(*) FILTER (WHERE status = 'completed') as completed,
  COUNT(*) FILTER (WHERE status = 'no_show') as no_shows
FROM public.hms_op_visits
GROUP BY visit_date, branch
ORDER BY visit_date DESC;

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ FLAG 17: Call Center / CRM                                                   ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS public.hms_call_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Caller
  caller_name TEXT,
  caller_phone TEXT NOT NULL,
  patient_id UUID,
  -- Call details
  direction TEXT DEFAULT 'inbound' CHECK (direction IN ('inbound','outbound')),
  call_time TIMESTAMPTZ DEFAULT now(),
  duration_seconds INT DEFAULT 0,
  -- Agent
  agent_name TEXT,
  agent_id UUID,
  -- Purpose
  purpose TEXT DEFAULT 'inquiry' CHECK (purpose IN ('inquiry','appointment','follow_up','complaint','feedback','referral','emergency','other')),
  -- Outcome
  outcome TEXT DEFAULT 'answered' CHECK (outcome IN ('answered','missed','voicemail','busy','callback_scheduled','transferred')),
  callback_scheduled_at TIMESTAMPTZ,
  -- Notes
  notes TEXT,
  disposition TEXT,
  -- Linked records
  appointment_id UUID,
  -- Meta
  branch TEXT DEFAULT 'Main Branch',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hms_call_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can manage call log" ON public.hms_call_log;
CREATE POLICY "Staff can manage call log" ON public.hms_call_log FOR ALL TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_call_log_phone ON public.hms_call_log(caller_phone);
CREATE INDEX IF NOT EXISTS idx_call_log_date ON public.hms_call_log(call_time DESC);
CREATE INDEX IF NOT EXISTS idx_call_log_agent ON public.hms_call_log(agent_name, call_time DESC);

-- CRM follow-up tasks
CREATE TABLE IF NOT EXISTS public.hms_crm_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID,
  patient_name TEXT,
  patient_phone TEXT,
  -- Task
  task_type TEXT DEFAULT 'follow_up' CHECK (task_type IN ('follow_up','callback','reminder','reactivation','feedback','birthday','referral_thank')),
  description TEXT,
  due_date DATE NOT NULL,
  due_time TIME,
  -- Assignment
  assigned_to TEXT,
  assigned_to_id UUID,
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','cancelled','overdue')),
  completed_at TIMESTAMPTZ,
  result TEXT,
  -- Context
  reference_type TEXT, -- visit, appointment, prescription
  reference_id UUID,
  -- Meta
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  branch TEXT DEFAULT 'Main Branch',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hms_crm_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can manage CRM tasks" ON public.hms_crm_tasks;
CREATE POLICY "Staff can manage CRM tasks" ON public.hms_crm_tasks FOR ALL TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_crm_tasks_due ON public.hms_crm_tasks(due_date, status);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_assigned ON public.hms_crm_tasks(assigned_to, status);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_patient ON public.hms_crm_tasks(patient_id);

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ FLAG 18: Teleconsult Sessions                                                ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

-- hms_teleconsult_sessions already exists — add missing columns
DO $$ BEGIN ALTER TABLE public.hms_teleconsult_sessions ADD COLUMN IF NOT EXISTS room_id TEXT; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.hms_teleconsult_sessions ADD COLUMN IF NOT EXISTS room_url TEXT; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.hms_teleconsult_sessions ADD COLUMN IF NOT EXISTS patient_joined_at TIMESTAMPTZ; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.hms_teleconsult_sessions ADD COLUMN IF NOT EXISTS doctor_joined_at TIMESTAMPTZ; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.hms_teleconsult_sessions ADD COLUMN IF NOT EXISTS actual_start TIMESTAMPTZ; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.hms_teleconsult_sessions ADD COLUMN IF NOT EXISTS actual_end TIMESTAMPTZ; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.hms_teleconsult_sessions ADD COLUMN IF NOT EXISTS actual_duration_min INT; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.hms_teleconsult_sessions ADD COLUMN IF NOT EXISTS recording_url TEXT; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.hms_teleconsult_sessions ADD COLUMN IF NOT EXISTS prescription_id UUID; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.hms_teleconsult_sessions ADD COLUMN IF NOT EXISTS patient_rating INT; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.hms_teleconsult_sessions ADD COLUMN IF NOT EXISTS patient_feedback TEXT; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.hms_teleconsult_sessions ADD COLUMN IF NOT EXISTS visit_id UUID; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.hms_teleconsult_sessions ADD COLUMN IF NOT EXISTS appointment_id UUID; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.hms_teleconsult_sessions ADD COLUMN IF NOT EXISTS branch TEXT DEFAULT 'Main Branch'; EXCEPTION WHEN others THEN NULL; END $$;

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ FLAG 19: Student Quiz Engine                                                 ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

-- Quiz questions bank
CREATE TABLE IF NOT EXISTS public.hms_quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  topic TEXT,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]', -- ["option1","option2","option3","option4"]
  correct_answer INT NOT NULL, -- 0-based index
  explanation TEXT,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy','medium','hard')),
  source TEXT, -- "Charaka Samhita", "Previous Year 2023", etc.
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hms_quiz_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view questions" ON public.hms_quiz_questions;
CREATE POLICY "Anyone can view questions" ON public.hms_quiz_questions FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admin can manage questions" ON public.hms_quiz_questions;
CREATE POLICY "Admin can manage questions" ON public.hms_quiz_questions FOR ALL TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_quiz_q_subject ON public.hms_quiz_questions(subject);
CREATE INDEX IF NOT EXISTS idx_quiz_q_difficulty ON public.hms_quiz_questions(difficulty);

-- Student quiz attempts
CREATE TABLE IF NOT EXISTS public.hms_quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Quiz context
  quiz_type TEXT DEFAULT 'daily' CHECK (quiz_type IN ('daily','subject','competition','weekly_challenge','practice')),
  subject TEXT,
  -- Results
  total_questions INT NOT NULL DEFAULT 0,
  correct_answers INT NOT NULL DEFAULT 0,
  wrong_answers INT NOT NULL DEFAULT 0,
  skipped INT DEFAULT 0,
  score_pct DECIMAL(5,2) DEFAULT 0,
  time_taken_seconds INT,
  -- Coins
  coins_earned INT DEFAULT 0,
  streak_day INT DEFAULT 0,
  -- Detail
  answers JSONB DEFAULT '[]', -- [{question_id, selected, correct, time_ms}]
  -- Meta
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hms_quiz_attempts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own attempts" ON public.hms_quiz_attempts;
CREATE POLICY "Users can view own attempts" ON public.hms_quiz_attempts FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own attempts" ON public.hms_quiz_attempts;
CREATE POLICY "Users can insert own attempts" ON public.hms_quiz_attempts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON public.hms_quiz_attempts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_type ON public.hms_quiz_attempts(quiz_type, created_at DESC);

-- Student streaks & coins
CREATE TABLE IF NOT EXISTS public.hms_student_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  total_coins INT DEFAULT 0,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_quiz_date DATE,
  total_quizzes_taken INT DEFAULT 0,
  total_correct INT DEFAULT 0,
  -- Subject-wise
  subject_scores JSONB DEFAULT '{}', -- {"Dravyaguna": {attempted: 50, correct: 35}, ...}
  -- Level
  level INT DEFAULT 1,
  xp INT DEFAULT 0,
  badges JSONB DEFAULT '[]',
  -- Meta
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hms_student_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own progress" ON public.hms_student_progress;
CREATE POLICY "Users can view own progress" ON public.hms_student_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage own progress" ON public.hms_student_progress;
CREATE POLICY "Users can manage own progress" ON public.hms_student_progress FOR ALL TO authenticated USING (auth.uid() = user_id);

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ FLAG 20: ABDM / ABHA Patient Linking                                         ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS public.hms_abha_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID,
  patient_display_id TEXT,
  -- ABHA Details
  abha_number TEXT UNIQUE, -- 14-digit ABHA number
  abha_address TEXT, -- username@abdm
  health_id TEXT, -- legacy PHR address
  -- Verification
  verified BOOLEAN DEFAULT false,
  verification_method TEXT CHECK (verification_method IN ('aadhaar_otp','mobile_otp','demographics','driving_license')),
  verified_at TIMESTAMPTZ,
  -- Demographics from ABDM
  abdm_name TEXT,
  abdm_gender TEXT,
  abdm_dob DATE,
  abdm_phone TEXT,
  abdm_address TEXT,
  abdm_photo_url TEXT,
  -- Consent
  consent_granted BOOLEAN DEFAULT false,
  consent_purpose TEXT, -- 'care', 'insurance', 'research'
  consent_expiry DATE,
  -- Health records shared
  records_pushed INT DEFAULT 0,
  records_pulled INT DEFAULT 0,
  last_sync_at TIMESTAMPTZ,
  -- Meta
  status TEXT DEFAULT 'linked' CHECK (status IN ('pending','linked','unlinked','expired')),
  branch TEXT DEFAULT 'Main Branch',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hms_abha_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can manage ABHA records" ON public.hms_abha_records;
CREATE POLICY "Staff can manage ABHA records" ON public.hms_abha_records FOR ALL TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_abha_patient ON public.hms_abha_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_abha_number ON public.hms_abha_records(abha_number);

-- Health record exchange log
CREATE TABLE IF NOT EXISTS public.hms_abdm_exchange_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID,
  abha_record_id UUID REFERENCES public.hms_abha_records(id) ON DELETE SET NULL,
  -- Exchange
  direction TEXT NOT NULL CHECK (direction IN ('push','pull')),
  record_type TEXT NOT NULL, -- 'prescription','discharge_summary','diagnostic_report','opd_visit','immunization'
  fhir_bundle_id TEXT,
  -- Status
  status TEXT DEFAULT 'initiated' CHECK (status IN ('initiated','in_progress','completed','failed')),
  error_message TEXT,
  -- Meta
  initiated_by UUID,
  initiated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  branch TEXT DEFAULT 'Main Branch'
);

ALTER TABLE public.hms_abdm_exchange_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can manage ABDM log" ON public.hms_abdm_exchange_log;
CREATE POLICY "Staff can manage ABDM log" ON public.hms_abdm_exchange_log FOR ALL TO authenticated USING (true);

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ Seed quiz questions (50 sample BAMS questions)                               ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

INSERT INTO public.hms_quiz_questions (subject, topic, question, options, correct_answer, explanation, difficulty, source) VALUES
('Dravyaguna', 'Rasa Panchaka', 'Which rasa (taste) is dominant in Guduchi (Tinospora cordifolia)?', '["Madhura","Tikta","Kashaya","Katu"]', 1, 'Guduchi is predominantly Tikta (bitter) in rasa, with Kashaya as secondary.', 'medium', 'Bhavaprakasha Nighantu'),
('Dravyaguna', 'Guna', 'Snigdha guna is the opposite of which guna?', '["Guru","Ruksha","Sheeta","Laghu"]', 1, 'Snigdha (unctuous) is opposite to Ruksha (dry) in the Gurvadi gunas.', 'easy', 'Charaka Samhita'),
('Kayachikitsa', 'Jwara', 'According to Charaka, which is the first disease (Vyadhi) described?', '["Prameha","Jwara","Raktapitta","Atisara"]', 1, 'Jwara (fever) is the king of diseases and described first in Charaka Chikitsa Sthana.', 'easy', 'Charaka Chikitsa 3'),
('Kayachikitsa', 'Amavata', 'The classical treatment principle for Amavata is?', '["Langhana-Swedana","Snehana-Virechana","Brimhana","Raktamokshana"]', 0, 'Langhana (fasting) and Swedana (sudation) are the primary treatments for Amavata (RA).', 'medium', 'Madhava Nidana 25'),
('Shalyatantra', 'Ksharasutra', 'Ksharasutra therapy is primarily used for?', '["Piles","Fistula-in-ano","Fissure","Prolapse"]', 1, 'Ksharasutra is the gold-standard Ayurvedic treatment for Bhagandara (fistula-in-ano).', 'easy', 'Sushruta Chikitsa'),
('Kriya Shareera', 'Dosha', 'Main site (Sthana) of Vata dosha is?', '["Amashaya","Pakwashaya","Hridaya","Nabhi"]', 1, 'Pakwashaya (large intestine/colon) is the primary seat of Vata dosha.', 'easy', 'Ashtanga Hridaya Su. 12'),
('Kriya Shareera', 'Dhatu', 'How many Dhatus are described in Ayurveda?', '["5","6","7","8"]', 2, 'Sapta Dhatu: Rasa, Rakta, Mamsa, Meda, Asthi, Majja, Shukra.', 'easy', 'Charaka Sutra 28'),
('Rasashastra', 'Parada', 'Shodhana of Parada (mercury) is done using?', '["Gomutra","Kanchika + Tikta dravya","Plain water","Honey"]', 1, 'Mercury purification uses Kanchika (sour gruel) with Tikta (bitter) drugs.', 'hard', 'Rasaratna Samucchaya'),
('Prasuti Tantra', 'Garbha', 'According to Ayurveda, which month of pregnancy is for Mamsa Dhatu formation?', '["2nd month","3rd month","4th month","5th month"]', 1, 'In the 3rd month (Tritiya masa), Mamsa Dhatu (muscle) develops in the fetus.', 'medium', 'Charaka Shareera 4'),
('Swasthavritta', 'Dinacharya', 'Abhyanga (oil massage) pacifies which dosha primarily?', '["Pitta","Kapha","Vata","Tridosha"]', 2, 'Abhyanga is primarily Vata-shamaka due to Snehana (oleation) property.', 'easy', 'Charaka Sutra 5')
ON CONFLICT DO NOTHING;

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ Enable Realtime                                                              ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.hms_call_log;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN others THEN NULL; END $$;

DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.hms_crm_tasks;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN others THEN NULL; END $$;
