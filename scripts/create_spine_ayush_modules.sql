-- ═══════════════════════════════════════════════════════════════════════════════
-- AYUZEE HMS — Spine AYUSH Modules (Posture Assessment & Corrective Exercise)
-- 13 Modules covering spinal health through AYUSH-oriented approach
-- Designed for both Doctors (protocol reference) and Patients (self-guided learning)
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 1: SPINE AYUSH MODULES (Master table for 13 modules)                 ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS spine_ayush_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_number INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  topic_count INTEGER NOT NULL DEFAULT 0,
  duration_minutes INTEGER DEFAULT 30,
  difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  category TEXT NOT NULL CHECK (category IN (
    'posture_theory', 'posture_assessment', 'functional_assessment',
    'corrective_exercise', 'syndrome_treatment'
  )),
  ayush_system TEXT DEFAULT 'integrative' CHECK (ayush_system IN (
    'ayurveda', 'yoga', 'unani', 'siddha', 'homeopathy', 'naturopathy', 'integrative'
  )),
  icon_name TEXT DEFAULT 'Activity',
  color_class TEXT DEFAULT 'blue',
  for_role TEXT[] DEFAULT '{doctor,patient}',
  is_premium BOOLEAN DEFAULT false,
  prerequisites INTEGER[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  cover_image_url TEXT,
  video_intro_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE spine_ayush_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view spine modules"
  ON spine_ayush_modules FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage spine modules"
  ON spine_ayush_modules FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_spine_modules_number ON spine_ayush_modules(module_number);
CREATE INDEX IF NOT EXISTS idx_spine_modules_category ON spine_ayush_modules(category);

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 2: MODULE TOPICS (Individual topics within each module)               ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS spine_ayush_module_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES spine_ayush_modules(id) ON DELETE CASCADE,
  topic_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT DEFAULT 'text' CHECK (content_type IN (
    'text', 'video', 'image', 'exercise', 'quiz', 'practical', 'table', 'case_study'
  )),
  content_body TEXT,
  ayush_context TEXT,
  doctor_notes TEXT,
  patient_instructions TEXT,
  exercise_steps JSONB DEFAULT '[]',
  contraindications TEXT[] DEFAULT '{}',
  precautions TEXT[] DEFAULT '{}',
  duration_minutes INTEGER DEFAULT 5,
  video_url TEXT,
  image_url TEXT,
  "references" TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(module_id, topic_number)
);

ALTER TABLE spine_ayush_module_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view module topics"
  ON spine_ayush_module_topics FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage module topics"
  ON spine_ayush_module_topics FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_spine_topics_module ON spine_ayush_module_topics(module_id);
CREATE INDEX IF NOT EXISTS idx_spine_topics_sort ON spine_ayush_module_topics(module_id, sort_order);

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 3: USER PROGRESS TRACKING                                            ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS spine_ayush_user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES spine_ayush_modules(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES spine_ayush_module_topics(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN (
    'not_started', 'in_progress', 'completed', 'skipped'
  )),
  progress_pct INTEGER DEFAULT 0 CHECK (progress_pct >= 0 AND progress_pct <= 100),
  score INTEGER,
  time_spent_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, module_id, topic_id)
);

ALTER TABLE spine_ayush_user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON spine_ayush_user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own progress"
  ON spine_ayush_user_progress FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_spine_progress_user ON spine_ayush_user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_spine_progress_module ON spine_ayush_user_progress(user_id, module_id);

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 4: EXERCISE PRESCRIPTIONS (Doctor → Patient assignment)              ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS spine_ayush_exercise_prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID REFERENCES spine_ayush_modules(id) ON DELETE SET NULL,
  topic_ids UUID[] DEFAULT '{}',
  diagnosis TEXT NOT NULL,
  spinal_level TEXT,
  dosha_involvement TEXT CHECK (dosha_involvement IN ('vata', 'pitta', 'kapha', 'vata-pitta', 'vata-kapha', 'pitta-kapha', 'tridosha')),
  exercise_plan JSONB DEFAULT '{}',
  frequency TEXT DEFAULT 'daily',
  duration_weeks INTEGER DEFAULT 4,
  precautions TEXT,
  ayush_adjuncts JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  review_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE spine_ayush_exercise_prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can manage prescriptions"
  ON spine_ayush_exercise_prescriptions FOR ALL
  USING (auth.uid() = doctor_id OR auth.uid() = patient_id);

CREATE POLICY "Patients can view own prescriptions"
  ON spine_ayush_exercise_prescriptions FOR SELECT
  USING (auth.uid() = patient_id);

CREATE INDEX IF NOT EXISTS idx_spine_rx_patient ON spine_ayush_exercise_prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_spine_rx_doctor ON spine_ayush_exercise_prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_spine_rx_status ON spine_ayush_exercise_prescriptions(status);

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 5: PATIENT ASSESSMENT RECORDS (Posture assessments)                  ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS spine_ayush_posture_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assessment_date DATE DEFAULT CURRENT_DATE,
  -- Posterior View
  posterior_head_position TEXT,
  posterior_shoulder_asymmetry TEXT,
  posterior_scapular_position TEXT,
  posterior_thoracic_spine TEXT,
  posterior_lumbar_spine TEXT,
  posterior_pelvis TEXT,
  posterior_knee TEXT,
  posterior_foot TEXT,
  posterior_notes TEXT,
  -- Anterior View
  anterior_head_position TEXT,
  anterior_shoulder_level TEXT,
  anterior_carrying_angle TEXT,
  anterior_pelvis TEXT,
  anterior_knee TEXT,
  anterior_foot TEXT,
  anterior_notes TEXT,
  -- Lateral View
  lateral_head_position TEXT,
  lateral_cervical TEXT,
  lateral_thoracic TEXT,
  lateral_lumbar TEXT,
  lateral_pelvis_tilt TEXT,
  lateral_knee TEXT,
  lateral_notes TEXT,
  -- Functional Assessment
  single_leg_stability TEXT,
  scapular_dyskinesia TEXT,
  thoracic_rotation TEXT,
  dorsiflexion_test TEXT,
  -- Syndrome Classification
  syndrome_identified TEXT CHECK (syndrome_identified IN (
    'upper_cross', 'lower_cross', 'layered', 'pronation_distortion',
    'flat_back', 'sway_back', 'normal', 'mixed'
  )),
  -- Dosha Analysis
  vata_score INTEGER DEFAULT 0,
  pitta_score INTEGER DEFAULT 0,
  kapha_score INTEGER DEFAULT 0,
  predominant_dosha TEXT,
  -- Photos
  photo_posterior_url TEXT,
  photo_anterior_url TEXT,
  photo_lateral_url TEXT,
  -- Overall
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe')),
  recommended_modules INTEGER[] DEFAULT '{}',
  treatment_plan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE spine_ayush_posture_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view posture assessments"
  ON spine_ayush_posture_assessments FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Staff can manage posture assessments"
  ON spine_ayush_posture_assessments FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_posture_patient ON spine_ayush_posture_assessments(patient_id);
CREATE INDEX IF NOT EXISTS idx_posture_date ON spine_ayush_posture_assessments(assessment_date DESC);
CREATE INDEX IF NOT EXISTS idx_posture_syndrome ON spine_ayush_posture_assessments(syndrome_identified);

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 6: SEED DATA — All 13 Modules                                       ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

INSERT INTO spine_ayush_modules (module_number, title, subtitle, description, topic_count, duration_minutes, difficulty_level, category, ayush_system, icon_name, color_class, tags, sort_order)
VALUES
(1, 'Posture Introduction', 'Foundation of Spinal Assessment', 'Understanding posture, postural control systems, developmental curves, and Janda''s muscle imbalance theory from an AYUSH perspective. Learn the basics before hands-on assessment.', 18, 45, 'beginner', 'posture_theory', 'integrative', 'BookOpen', 'blue', '{posture,basics,theory,janda}', 1),
(2, 'Posterior View Assessment', 'Back View Observation & Analysis', 'Complete posterior view posture assessment covering head to foot — torticollis, scapular position, thoracic alignment, pelvic tilt, genu varum/valgum, and foot position with AYUSH muscle correlation.', 29, 60, 'intermediate', 'posture_assessment', 'integrative', 'Eye', 'green', '{posterior,assessment,observation}', 2),
(3, 'Anterior View Assessment', 'Front View Observation & Analysis', 'Full anterior posture assessment — face symmetry, clavicle position, carrying angle, pelvic rotation, Q-angle, Craig''s test concept, and foot alignment with Ayurvedic body type correlation.', 23, 50, 'intermediate', 'posture_assessment', 'integrative', 'User', 'purple', '{anterior,assessment,observation}', 3),
(4, 'Lateral View Assessment', 'Side View & Plumb Line Analysis', 'Lateral view standard alignment using plumb line — forward head posture, cervicothoracic junction, thoracic kyphosis, lumbar lordosis, anterior/posterior pelvic tilt, and sway back from AYUSH lens.', 12, 35, 'intermediate', 'posture_assessment', 'integrative', 'ArrowRight', 'orange', '{lateral,plumbline,assessment}', 4),
(5, 'Practical Assessment Skills', 'Hands-On Clinical Application', 'Practical application: setting up patient, using plumb line, marking landmarks, photography guidelines, documentation format, palpation tips, and common mistakes to avoid in clinic.', 10, 40, 'intermediate', 'posture_assessment', 'integrative', 'Hand', 'teal', '{practical,palpation,documentation}', 5),
(6, 'Functional Assessment', 'Movement Quality & Compensation', 'Assessing movement quality — Single Leg Stability, Scapular Dyskinesia test, Seated Thoracic Rotation, Weighted Lunge for Dorsiflexion. Understanding stability vs mobility from Yoga & Naturopathy perspective.', 7, 30, 'intermediate', 'functional_assessment', 'yoga', 'Zap', 'indigo', '{functional,movement,stability}', 6),
(7, 'Corrective Exercise Introduction', '4-Phase Corrective Model', 'The AYUSH-oriented corrective exercise model: Mobility → Stability → Strength → Functional Integration. Exercise prescription guidelines aligned with Panchakarma therapy stages.', 13, 40, 'beginner', 'corrective_exercise', 'integrative', 'Dumbbell', 'red', '{corrective,exercise,phases}', 7),
(8, 'Upper Cross Syndrome (UCS)', 'Greeva-Amsa Vayu Vikara', 'Upper Cross Syndrome from AYUSH perspective — Vata-dominant muscle imbalance of cervicothoracic region. Includes MMT, muscle length testing, and AYUSH-based treatment protocols (Greeva Basti, Nasya, Yoga).', 5, 45, 'advanced', 'syndrome_treatment', 'ayurveda', 'AlertTriangle', 'amber', '{ucs,upper_cross,cervical,greeva}', 8),
(9, 'Lower Cross Syndrome (LCS)', 'Kati-Nitamba Vayu Vikara', 'Lower Cross Syndrome through Ayurvedic lens — Vata-Kapha involvement in lumbopelvic imbalance. MMT protocols, muscle length testing, and treatment with Kati Basti, Basti Karma, and therapeutic Yoga.', 5, 45, 'advanced', 'syndrome_treatment', 'ayurveda', 'AlertTriangle', 'rose', '{lcs,lower_cross,lumbar,kati}', 9),
(10, 'Layered Syndrome (Double Cross)', 'Sarva-Shareera Vayu Vikara', 'Combined UCS + LCS (Janda''s Layered Syndrome) — whole-body Vata derangement. Comprehensive treatment combining Panchakarma, Yoga sequences, and graduated corrective exercise protocols.', 5, 50, 'advanced', 'syndrome_treatment', 'integrative', 'Layers', 'violet', '{layered,double_cross,full_body}', 10),
(11, 'Pronation Distortion Syndrome', 'Pada-Jangha Vayu Vikara', 'Lower extremity chain dysfunction from AYUSH viewpoint — excessive foot pronation causing knee, hip, and spine compensation. Treatment with Marma therapy, Agnikarma, and corrective Yoga asanas.', 5, 40, 'advanced', 'syndrome_treatment', 'ayurveda', 'Footprints', 'cyan', '{pronation,foot,lower_limb}', 11),
(12, 'Flat Back Posture', 'Kati-Sthairya Vikara', 'Loss of lumbar lordosis — Kapha-dominant postural pattern. Assessment, muscle imbalance identification, and AYUSH treatment including Kati Basti variations, Yoga backbends, and Naturopathy techniques.', 5, 40, 'advanced', 'syndrome_treatment', 'integrative', 'MinusCircle', 'slate', '{flat_back,lumbar,lordosis}', 12),
(13, 'Sway Back Posture', 'Kati-Chalana Vikara', 'Posterior displacement of pelvis — Vata-dominant postural deviation. Complete assessment, muscle imbalance mapping, and AYUSH corrective protocol with specific Yoga, Panchakarma, and exercise prescription.', 5, 40, 'advanced', 'syndrome_treatment', 'integrative', 'TrendingDown', 'emerald', '{sway_back,pelvis,posture}', 13)
ON CONFLICT (module_number) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  topic_count = EXCLUDED.topic_count,
  duration_minutes = EXCLUDED.duration_minutes,
  difficulty_level = EXCLUDED.difficulty_level,
  category = EXCLUDED.category,
  ayush_system = EXCLUDED.ayush_system,
  icon_name = EXCLUDED.icon_name,
  color_class = EXCLUDED.color_class,
  tags = EXCLUDED.tags,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- ═══════════════════════════════════════════════════════════════════════════════
-- DONE — Tables: spine_ayush_modules, spine_ayush_module_topics,
--        spine_ayush_user_progress, spine_ayush_exercise_prescriptions,
--        spine_ayush_posture_assessments
-- Seed: 13 modules inserted
-- ═══════════════════════════════════════════════════════════════════════════════
