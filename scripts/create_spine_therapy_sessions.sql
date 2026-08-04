-- ═══════════════════════════════════════════════════════════════════════════════
-- SPINE AYUSH — Therapy Session Records + Recovery Scoring System
-- Doctor records each session (checkpoints per therapy) → auto-calculates recovery score
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════════

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ TABLE 1: SPINE THERAPY SESSIONS (Doctor records what was done each visit)    ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS spine_therapy_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  session_number INTEGER DEFAULT 1,
  -- Therapy selection (which of 15 systems used this session)
  therapy_id INTEGER NOT NULL CHECK (therapy_id >= 1 AND therapy_id <= 15),
  therapy_name TEXT NOT NULL,
  -- Session details
  duration_minutes INTEGER DEFAULT 30,
  intensity TEXT CHECK (intensity IN ('mild', 'moderate', 'strong')),
  body_area TEXT,
  spinal_level TEXT,
  -- Checkpoints (JSONB: each therapy has specific checkpoints)
  checkpoints_completed JSONB DEFAULT '[]',
  total_checkpoints INTEGER DEFAULT 0,
  checkpoints_done INTEGER DEFAULT 0,
  -- Points/areas treated
  points_treated JSONB DEFAULT '[]',
  -- Patient response (immediate)
  pain_before INTEGER CHECK (pain_before >= 0 AND pain_before <= 10),
  pain_after INTEGER CHECK (pain_after >= 0 AND pain_after <= 10),
  patient_feedback TEXT,
  immediate_response TEXT CHECK (immediate_response IN ('excellent', 'good', 'moderate', 'minimal', 'adverse')),
  -- Doctor notes
  doctor_notes TEXT,
  next_session_plan TEXT,
  home_exercise_given TEXT,
  -- Status
  status TEXT DEFAULT 'completed' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE spine_therapy_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view therapy sessions" ON spine_therapy_sessions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can manage therapy sessions" ON spine_therapy_sessions FOR ALL USING (auth.uid() IS NOT NULL);
CREATE INDEX IF NOT EXISTS idx_spine_sessions_patient ON spine_therapy_sessions(patient_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_spine_sessions_doctor ON spine_therapy_sessions(doctor_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_spine_sessions_therapy ON spine_therapy_sessions(therapy_id);

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ TABLE 2: SPINE RECOVERY SCORES (Calculated after each session)               ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS spine_recovery_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES spine_therapy_sessions(id) ON DELETE SET NULL,
  score_date DATE NOT NULL DEFAULT CURRENT_DATE,
  -- Individual metrics
  vas_pain INTEGER CHECK (vas_pain >= 0 AND vas_pain <= 10),
  rom_flexion INTEGER,
  rom_extension INTEGER,
  rom_lateral_flexion INTEGER,
  rom_rotation INTEGER,
  functional_score INTEGER CHECK (functional_score >= 0 AND functional_score <= 100),
  odi_score INTEGER CHECK (odi_score >= 0 AND odi_score <= 100),
  ndi_score INTEGER CHECK (ndi_score >= 0 AND ndi_score <= 100),
  sleep_quality INTEGER CHECK (sleep_quality >= 0 AND sleep_quality <= 10),
  daily_activity INTEGER CHECK (daily_activity >= 0 AND daily_activity <= 10),
  medication_usage TEXT CHECK (medication_usage IN ('none', 'occasional', 'daily', 'multiple_daily')),
  -- Calculated overall recovery percentage
  recovery_percentage INTEGER CHECK (recovery_percentage >= 0 AND recovery_percentage <= 100),
  -- Compared to baseline
  baseline_vas INTEGER,
  improvement_percentage DECIMAL(5,2),
  -- Notes
  notes TEXT,
  assessed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE spine_recovery_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view recovery scores" ON spine_recovery_scores FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can manage recovery scores" ON spine_recovery_scores FOR ALL USING (auth.uid() IS NOT NULL);
CREATE INDEX IF NOT EXISTS idx_recovery_patient ON spine_recovery_scores(patient_id, score_date DESC);

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ TABLE 3: SPINE THERAPY PRESCRIPTIONS (Doctor assigns therapies to patient)   ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS spine_therapy_prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prescription_date DATE DEFAULT CURRENT_DATE,
  -- Diagnosis
  primary_diagnosis TEXT NOT NULL,
  spinal_levels TEXT[] DEFAULT '{}',
  syndrome_type TEXT,
  dosha_involvement TEXT,
  -- Prescribed therapies (array of therapy IDs from 15 systems)
  prescribed_therapies JSONB NOT NULL DEFAULT '[]',
  -- Example: [{"therapy_id":1,"name":"Acupuncture","sessions":6,"frequency":"2x/week"},...]
  total_sessions_planned INTEGER DEFAULT 0,
  total_sessions_completed INTEGER DEFAULT 0,
  -- Goals
  target_vas INTEGER,
  target_recovery_pct INTEGER,
  target_duration_weeks INTEGER,
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'discontinued')),
  start_date DATE DEFAULT CURRENT_DATE,
  expected_end_date DATE,
  actual_end_date DATE,
  -- Outcome
  outcome_summary TEXT,
  final_recovery_pct INTEGER,
  patient_satisfaction INTEGER CHECK (patient_satisfaction >= 1 AND patient_satisfaction <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE spine_therapy_prescriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view prescriptions" ON spine_therapy_prescriptions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can manage prescriptions" ON spine_therapy_prescriptions FOR ALL USING (auth.uid() IS NOT NULL);
CREATE INDEX IF NOT EXISTS idx_spine_rx_patient ON spine_therapy_prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_spine_rx_status ON spine_therapy_prescriptions(status);

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ TABLE 4: THERAPY CHECKPOINTS MASTER (Predefined checkpoints per therapy)     ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS spine_therapy_checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapy_id INTEGER NOT NULL CHECK (therapy_id >= 1 AND therapy_id <= 15),
  therapy_name TEXT NOT NULL,
  checkpoint_name TEXT NOT NULL,
  checkpoint_category TEXT CHECK (checkpoint_category IN ('preparation', 'execution', 'assessment', 'aftercare', 'safety')),
  description TEXT,
  is_mandatory BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE spine_therapy_checkpoints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view checkpoints" ON spine_therapy_checkpoints FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage checkpoints" ON spine_therapy_checkpoints FOR ALL USING (auth.uid() IS NOT NULL);
CREATE INDEX IF NOT EXISTS idx_checkpoints_therapy ON spine_therapy_checkpoints(therapy_id, sort_order);

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SEED: CHECKPOINTS FOR ALL 15 THERAPIES                                       ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

INSERT INTO spine_therapy_checkpoints (therapy_id, therapy_name, checkpoint_name, checkpoint_category, description, sort_order) VALUES
-- T1: Acupuncture
(1, 'Acupuncture', 'Patient consent obtained', 'preparation', 'Verbal/written consent for needle insertion', 1),
(1, 'Acupuncture', 'Skin cleaned with alcohol', 'preparation', 'Clean insertion sites with antiseptic swab', 2),
(1, 'Acupuncture', 'Points selected based on diagnosis', 'execution', 'Document which points chosen and rationale', 3),
(1, 'Acupuncture', 'Needles inserted (depth recorded)', 'execution', 'Record depth per point, angle of insertion', 4),
(1, 'Acupuncture', 'De Qi sensation obtained', 'execution', 'Patient confirms heaviness/numbness/distension', 5),
(1, 'Acupuncture', 'Retention time completed', 'execution', 'Needles retained for prescribed duration (20-30 min)', 6),
(1, 'Acupuncture', 'All needles removed & counted', 'safety', 'Verify needle count matches insertion count', 7),
(1, 'Acupuncture', 'Post-treatment VAS recorded', 'assessment', 'Record pain level immediately after', 8),
(1, 'Acupuncture', 'Aftercare instructions given', 'aftercare', 'Hydration, rest, avoid cold for 2 hours', 9),
-- T2: Acupressure
(2, 'Acupressure', 'Points identified by palpation', 'preparation', 'Locate tender/active points on patient', 1),
(2, 'Acupressure', 'Pressure technique selected', 'execution', 'Sustained/pulsed/circular based on condition', 2),
(2, 'Acupressure', 'Pressure applied (duration per point)', 'execution', '60-90 sec per point, document response', 3),
(2, 'Acupressure', 'Patient feedback during treatment', 'assessment', 'Pain level during press, referred sensations', 4),
(2, 'Acupressure', 'Post-treatment VAS recorded', 'assessment', 'Pain score after completion', 5),
(2, 'Acupressure', 'Self-care points taught to patient', 'aftercare', 'Which points patient can press at home', 6),
-- T3: Dry Needling
(3, 'Dry Needling', 'Trigger point identified (taut band)', 'preparation', 'Palpate and confirm active TrP location', 1),
(3, 'Dry Needling', 'Skin cleaned', 'preparation', 'Antiseptic swab on insertion area', 2),
(3, 'Dry Needling', 'Needle inserted into TrP', 'execution', 'Document muscle, depth, angle', 3),
(3, 'Dry Needling', 'Local twitch response obtained', 'execution', 'Count twitches (target 3-5 per TrP)', 4),
(3, 'Dry Needling', 'Referred pain reproduction noted', 'assessment', 'Did needling reproduce patient complaint?', 5),
(3, 'Dry Needling', 'Post-needling stretch performed', 'aftercare', 'Stretch treated muscle to full length', 6),
(3, 'Dry Needling', 'Post-treatment VAS recorded', 'assessment', 'Pain score after treatment', 7),
(3, 'Dry Needling', 'Aftercare: heat + hydration advised', 'aftercare', 'Warm pack tonight, extra water, gentle movement', 8),
-- T4: Trigger Point Therapy
(4, 'Trigger Point Therapy', 'Active TrPs identified & mapped', 'preparation', 'Document location and referred pain pattern', 1),
(4, 'Trigger Point Therapy', 'Ischemic compression applied', 'execution', 'Sustained pressure at 7/10, wait for barrier release', 2),
(4, 'Trigger Point Therapy', 'Barrier releases documented', 'execution', 'Number of barriers released per TrP (2-3 typical)', 3),
(4, 'Trigger Point Therapy', 'Post-release stretch performed', 'aftercare', 'Full length stretch of treated muscle 30 sec x3', 4),
(4, 'Trigger Point Therapy', 'Post-treatment VAS recorded', 'assessment', 'Pain level after treatment', 5),
(4, 'Trigger Point Therapy', 'Self-treatment tool taught', 'aftercare', 'Tennis ball/Theracane technique demonstrated', 6),
-- T5: Auriculotherapy
(5, 'Auriculotherapy', 'Ear points detected (probe/palpation)', 'preparation', 'Find active/tender points on ear', 1),
(5, 'Auriculotherapy', 'Ear cleaned with alcohol', 'preparation', 'Antiseptic ear surface', 2),
(5, 'Auriculotherapy', 'Seeds/needles placed on spine zone', 'execution', 'Document which ear points treated', 3),
(5, 'Auriculotherapy', 'Additional points added (Shenmen etc)', 'execution', 'Analgesic/relaxation points', 4),
(5, 'Auriculotherapy', 'Patient response within 5 min', 'assessment', 'Immediate pain change noted', 5),
(5, 'Auriculotherapy', 'Self-press instructions given', 'aftercare', 'Press seeds 10-20x, 3x daily', 6),
-- T6: Kampo & Shiatsu
(6, 'Kampo & Shiatsu', 'Abdominal diagnosis (Fukushin)', 'preparation', 'Palpate abdomen for diagnostic findings', 1),
(6, 'Kampo & Shiatsu', 'Shiatsu BL channel pressed', 'execution', 'Thumb pressure along entire spine bilateral', 2),
(6, 'Kampo & Shiatsu', 'Tender points noted', 'assessment', 'Which vertebral levels most reactive', 3),
(6, 'Kampo & Shiatsu', 'Kampo formula selected', 'execution', 'Based on constitution + symptoms', 4),
(6, 'Kampo & Shiatsu', 'Sotai correction if indicated', 'execution', 'Movement toward ease direction', 5),
(6, 'Kampo & Shiatsu', 'Makko-Ho stretches taught', 'aftercare', 'Home stretching routine assigned', 6),
-- T7: Korean Hand Therapy
(7, 'Korean Hand Therapy', 'Spine correspondence located', 'preparation', 'Map patient spine problem to hand zone', 1),
(7, 'Korean Hand Therapy', 'Most tender point identified', 'assessment', 'Probe hand for active correspondence', 2),
(7, 'Korean Hand Therapy', 'Stimulation applied', 'execution', 'Seed/needle/magnet/probe at point', 3),
(7, 'Korean Hand Therapy', 'Response assessed', 'assessment', 'Check if body pain reduced after hand treatment', 4),
(7, 'Korean Hand Therapy', 'Seeds placed for ongoing use', 'aftercare', 'Patient to press 5x daily', 5),
-- T8: Reflexology
(8, 'Reflexology', 'Foot/hand spine zone located', 'preparation', 'Identify medial arch spine reflex zone', 1),
(8, 'Reflexology', 'Thumb walking performed', 'execution', 'Systematic pressure along spine zone', 2),
(8, 'Reflexology', 'Tender zones documented', 'assessment', 'Which reflex areas correspond to patient problem', 3),
(8, 'Reflexology', 'Sustained pressure on tender areas', 'execution', '30-60 sec per tender zone', 4),
(8, 'Reflexology', 'Post-treatment VAS recorded', 'assessment', 'Pain score after session', 5),
(8, 'Reflexology', 'Self-rolling technique taught', 'aftercare', 'Golf ball/foot roller instructions', 6),
-- T9: Cupping
(9, 'Cupping Therapy', 'Skin condition checked', 'preparation', 'No lesions/infection at cupping sites', 1),
(9, 'Cupping Therapy', 'Oil applied to treatment area', 'preparation', 'Lubricant for cup placement/sliding', 2),
(9, 'Cupping Therapy', 'Cups placed (method documented)', 'execution', 'Dry/wet/sliding, location, number of cups', 3),
(9, 'Cupping Therapy', 'Retention time completed', 'execution', 'Duration: 5-15 min based on condition', 4),
(9, 'Cupping Therapy', 'Cup marks assessed & documented', 'assessment', 'Color indicates stagnation level', 5),
(9, 'Cupping Therapy', 'Aftercare instructions given', 'aftercare', 'Keep warm, avoid cold 24hr, marks fade 3-7 days', 6),
-- T10: Moxibustion
(10, 'Moxibustion', 'Cold/Vata pattern confirmed', 'preparation', 'Verify patient is cold-type (not hot/inflamed)', 1),
(10, 'Moxibustion', 'Moxa technique selected', 'execution', 'Indirect stick/ginger/salt moxa', 2),
(10, 'Moxibustion', 'Points warmed (BL23, GV4 etc)', 'execution', 'Duration per point until skin pink/warm', 3),
(10, 'Moxibustion', 'Patient warmth sensation confirmed', 'assessment', 'Pleasant deep warmth felt', 4),
(10, 'Moxibustion', 'Skin checked post-treatment', 'safety', 'No burns, blisters, or excessive redness', 5),
(10, 'Moxibustion', 'Self-moxa/infrared instructions', 'aftercare', 'Home warming technique taught', 6),
-- T11: Thai Massage
(11, 'Thai Massage', 'Patient positioned on mat', 'preparation', 'Comfortable clothing, floor mat setup', 1),
(11, 'Thai Massage', 'Sen lines pressed (spine channels)', 'execution', 'Palm/thumb pressure along Sen Sumana', 2),
(11, 'Thai Massage', 'Assisted stretches performed', 'execution', 'Spinal twist, cobra, traction', 3),
(11, 'Thai Massage', 'ROM improvement noted', 'assessment', 'Before/after flexibility comparison', 4),
(11, 'Thai Massage', 'Home stretches assigned', 'aftercare', 'Self-Thai stretches for daily practice', 5),
-- T12: Osteopathic/MET
(12, 'Osteopathic/MET', 'Restricted segment identified', 'preparation', 'Passive motion testing of spine', 1),
(12, 'Osteopathic/MET', 'Barrier engaged', 'execution', 'Position joint at restriction barrier', 2),
(12, 'Osteopathic/MET', 'Isometric contraction (5-7 sec)', 'execution', 'Patient pushes against resistance 20% effort', 3),
(12, 'Osteopathic/MET', 'New barrier taken', 'execution', 'After relaxation, move to new end range', 4),
(12, 'Osteopathic/MET', 'Repetitions completed (3-5)', 'execution', 'Each cycle gains more motion', 5),
(12, 'Osteopathic/MET', 'Post-MET ROM assessed', 'assessment', 'Document improved range', 6),
(12, 'Osteopathic/MET', 'Self-MET taught for home', 'aftercare', 'Patient can do bridge/resist technique at home', 7),
-- T13: Sujok
(13, 'Sujok Therapy', 'Correspondence system selected', 'preparation', 'Standard/insect/mini system for spine', 1),
(13, 'Sujok Therapy', 'Active point found on hand/foot', 'assessment', 'Most tender correspondence point', 2),
(13, 'Sujok Therapy', 'Stimulation method applied', 'execution', 'Seed/magnet/color/needle at point', 3),
(13, 'Sujok Therapy', 'Body pain response checked', 'assessment', 'Did spine pain reduce after hand treatment?', 4),
(13, 'Sujok Therapy', 'Ongoing seeds placed', 'aftercare', 'Patient presses daily between visits', 5),
-- T14: Marma Therapy
(14, 'Marma Therapy', 'Spine Marma points assessed', 'preparation', 'Palpate Kukundara, Katikataruna, etc for tenderness', 1),
(14, 'Marma Therapy', 'Oil applied to Marma zones', 'preparation', 'Warm sesame/Mahanarayan on Marma areas', 2),
(14, 'Marma Therapy', 'Marma stimulation performed', 'execution', 'Clockwise/counterclockwise/sustained per indication', 3),
(14, 'Marma Therapy', 'Duration per Marma (30-60 sec)', 'execution', 'Document which Marmas treated and technique', 4),
(14, 'Marma Therapy', 'Energy flow improvement noted', 'assessment', 'Patient reports warmth/tingling/relief', 5),
(14, 'Marma Therapy', 'Self-Marma routine taught', 'aftercare', 'Morning 7-point self-press protocol', 6),
-- T15: Pranic Healing
(15, 'Pranic Healing', 'Chakra scanning performed', 'preparation', 'Scan spine chakras for congestion/depletion', 1),
(15, 'Pranic Healing', 'Congested areas swept/cleansed', 'execution', 'Sweeping technique over blocked chakras', 2),
(15, 'Pranic Healing', 'Depleted areas energized', 'execution', 'Project prana to weak chakras', 3),
(15, 'Pranic Healing', 'Patient energy level reassessed', 'assessment', 'Post-healing chakra scan comparison', 4),
(15, 'Pranic Healing', 'Self-energy exercise taught', 'aftercare', 'Daily spine visualization + Twin Hearts', 5)
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- DONE — Tables: spine_therapy_sessions, spine_recovery_scores,
--        spine_therapy_prescriptions, spine_therapy_checkpoints
-- Seed: Checkpoints for all 15 therapies
-- ═══════════════════════════════════════════════════════════════════════════════
