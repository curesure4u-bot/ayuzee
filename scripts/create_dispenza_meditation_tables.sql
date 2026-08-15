-- ═══════════════════════════════════════════════════════════════════════════════
-- AYUZEE HMS — Dr. Joe Dispenza Meditative Tools (Spine AYUSH Integration)
-- Mind-Body Healing Tools for Spinal Recovery & Neuroplasticity
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ TABLE 1: DISPENZA MEDITATION TOOLS (Master catalog of 10 tools)              ║
-- ║ Purpose: Stores each meditation technique's metadata, instructions, benefits ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS dispenza_meditation_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_number INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  -- Technique Details
  category TEXT NOT NULL CHECK (category IN (
    'breathwork', 'body_healing', 'open_focus', 'movement', 
    'pineal_activation', 'scheduling', 'journaling', 
    'group_healing', 'visualization', 'biometrics'
  )),
  duration_minutes INTEGER NOT NULL DEFAULT 20,
  difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  -- Instructions & Guidance
  preparation_steps JSONB DEFAULT '[]',
  main_steps JSONB DEFAULT '[]',
  post_meditation_steps JSONB DEFAULT '[]',
  contraindications TEXT[] DEFAULT '{}',
  best_time_of_day TEXT DEFAULT 'morning' CHECK (best_time_of_day IN ('morning', 'evening', 'both', 'anytime')),
  -- Spine-Specific Integration
  spine_relevance TEXT,
  target_spinal_regions TEXT[] DEFAULT '{}',
  pairs_with_modules INTEGER[] DEFAULT '{}',
  dosha_affinity TEXT CHECK (dosha_affinity IN ('vata', 'pitta', 'kapha', 'tridosha')),
  -- Media & Presentation
  icon_name TEXT DEFAULT 'Brain',
  color_class TEXT DEFAULT 'purple',
  audio_url TEXT,
  video_url TEXT,
  cover_image_url TEXT,
  -- Metadata
  for_role TEXT[] DEFAULT '{doctor,patient}',
  is_premium BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE dispenza_meditation_tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view dispenza tools"
  ON dispenza_meditation_tools FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage dispenza tools"
  ON dispenza_meditation_tools FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_dispenza_tools_number ON dispenza_meditation_tools(tool_number);
CREATE INDEX IF NOT EXISTS idx_dispenza_tools_category ON dispenza_meditation_tools(category);

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ TABLE 2: MEDITATION SESSIONS (Individual session logs per patient)            ║
-- ║ Purpose: Track each meditation sitting — duration, quality, notes            ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS dispenza_meditation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES dispenza_meditation_tools(id) ON DELETE CASCADE,
  -- Session Details
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_time TIME,
  end_time TIME,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  time_of_day TEXT CHECK (time_of_day IN ('morning', 'afternoon', 'evening', 'night')),
  -- Quality & Feedback
  depth_rating INTEGER CHECK (depth_rating >= 1 AND depth_rating <= 10),
  energy_before INTEGER CHECK (energy_before >= 1 AND energy_before <= 10),
  energy_after INTEGER CHECK (energy_after >= 1 AND energy_after <= 10),
  pain_before INTEGER CHECK (pain_before >= 0 AND pain_before <= 10),
  pain_after INTEGER CHECK (pain_after >= 0 AND pain_after <= 10),
  -- Emotional State
  emotion_before TEXT,
  emotion_after TEXT,
  elevated_emotions TEXT[] DEFAULT '{}',
  -- Experience Notes
  body_sensations TEXT,
  insights TEXT,
  challenges TEXT,
  spine_awareness_notes TEXT,
  -- Completion
  completed BOOLEAN DEFAULT true,
  guided_audio_used BOOLEAN DEFAULT false,
  environment TEXT CHECK (environment IN ('home', 'clinic', 'outdoors', 'group', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE dispenza_meditation_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own meditation sessions"
  ON dispenza_meditation_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own meditation sessions"
  ON dispenza_meditation_sessions FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_dispenza_sessions_user ON dispenza_meditation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_dispenza_sessions_date ON dispenza_meditation_sessions(user_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_dispenza_sessions_tool ON dispenza_meditation_sessions(tool_id);

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ TABLE 3: MEDITATION PROGRESS (Streak tracking, coherence scores)             ║
-- ║ Purpose: Aggregate stats — streaks, total hours, coherence score over time   ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS dispenza_meditation_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Streaks
  current_streak_days INTEGER DEFAULT 0,
  longest_streak_days INTEGER DEFAULT 0,
  last_session_date DATE,
  -- Totals
  total_sessions INTEGER DEFAULT 0,
  total_minutes INTEGER DEFAULT 0,
  total_days_practiced INTEGER DEFAULT 0,
  -- Averages
  avg_depth_rating NUMERIC(3,1) DEFAULT 0,
  avg_pain_reduction NUMERIC(3,1) DEFAULT 0,
  avg_energy_gain NUMERIC(3,1) DEFAULT 0,
  -- Coherence Score (0-100, calculated from consistency + depth + pain reduction)
  coherence_score INTEGER DEFAULT 0 CHECK (coherence_score >= 0 AND coherence_score <= 100),
  coherence_trend TEXT DEFAULT 'stable' CHECK (coherence_trend IN ('improving', 'stable', 'declining')),
  -- Level / Gamification
  meditation_level INTEGER DEFAULT 1 CHECK (meditation_level >= 1 AND meditation_level <= 10),
  coins_earned INTEGER DEFAULT 0,
  badges TEXT[] DEFAULT '{}',
  -- Favorite Tools
  most_used_tool_id UUID REFERENCES dispenza_meditation_tools(id),
  preferred_time TEXT,
  -- Correlation with Spine Recovery
  spine_recovery_correlation NUMERIC(3,2) DEFAULT 0,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE dispenza_meditation_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own meditation progress"
  ON dispenza_meditation_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own meditation progress"
  ON dispenza_meditation_progress FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_dispenza_progress_user ON dispenza_meditation_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_dispenza_progress_score ON dispenza_meditation_progress(coherence_score DESC);

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ TABLE 4: MEDITATION PRESCRIPTIONS (Doctor assigns meditation to patient)     ║
-- ║ Purpose: Clinical integration — doctor prescribes specific tools             ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS dispenza_meditation_prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Prescription Details
  tool_ids UUID[] NOT NULL DEFAULT '{}',
  diagnosis TEXT,
  spinal_condition TEXT,
  -- Schedule
  frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('daily', 'twice_daily', 'alternate_days', 'weekly', 'as_needed')),
  preferred_time TEXT DEFAULT 'morning' CHECK (preferred_time IN ('morning', 'evening', 'both', 'anytime')),
  duration_weeks INTEGER DEFAULT 4,
  min_minutes_per_session INTEGER DEFAULT 15,
  -- Instructions
  doctor_notes TEXT,
  patient_instructions TEXT,
  precautions TEXT,
  -- Pairing with Physical Treatments
  paired_exercise_rx_id UUID REFERENCES spine_ayush_exercise_prescriptions(id) ON DELETE SET NULL,
  paired_therapy TEXT,
  sequence_instruction TEXT,
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  review_date DATE,
  -- Progress Tracking
  compliance_pct INTEGER DEFAULT 0 CHECK (compliance_pct >= 0 AND compliance_pct <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE dispenza_meditation_prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can manage meditation prescriptions"
  ON dispenza_meditation_prescriptions FOR ALL
  USING (auth.uid() = doctor_id OR auth.uid() = patient_id);

CREATE POLICY "Patients can view own meditation prescriptions"
  ON dispenza_meditation_prescriptions FOR SELECT
  USING (auth.uid() = patient_id);

CREATE INDEX IF NOT EXISTS idx_dispenza_rx_patient ON dispenza_meditation_prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_dispenza_rx_doctor ON dispenza_meditation_prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_dispenza_rx_status ON dispenza_meditation_prescriptions(status);

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ TABLE 5: ELEVATED EMOTION JOURNAL (Daily gratitude & emotion logs)            ║
-- ║ Purpose: Patients log emotions before/after meditation for healing tracking  ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS dispenza_emotion_journal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES dispenza_meditation_sessions(id) ON DELETE SET NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  -- Emotions
  gratitude_items TEXT[] DEFAULT '{}',
  love_items TEXT[] DEFAULT '{}',
  joy_items TEXT[] DEFAULT '{}',
  -- Body Awareness
  body_area_focused TEXT,
  healing_intention TEXT,
  -- Future Self Visualization
  future_self_description TEXT,
  future_self_feeling TEXT,
  -- Spine-Specific
  spine_pain_level INTEGER CHECK (spine_pain_level >= 0 AND spine_pain_level <= 10),
  mobility_feeling TEXT CHECK (mobility_feeling IN ('restricted', 'normal', 'free', 'expanded')),
  -- Reflection
  biggest_insight TEXT,
  synchronicities TEXT,
  overall_mood TEXT CHECK (overall_mood IN ('low', 'neutral', 'good', 'elevated', 'transcendent')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE dispenza_emotion_journal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own emotion journal"
  ON dispenza_emotion_journal FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own emotion journal"
  ON dispenza_emotion_journal FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_emotion_journal_user ON dispenza_emotion_journal(user_id);
CREATE INDEX IF NOT EXISTS idx_emotion_journal_date ON dispenza_emotion_journal(user_id, entry_date DESC);

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ TABLE 6: GROUP COHERENCE SESSIONS (Community healing events)                  ║
-- ║ Purpose: Schedule & track group meditation events for collective healing     ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS dispenza_group_coherence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  -- Event Details
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 45,
  tool_id UUID REFERENCES dispenza_meditation_tools(id) ON DELETE SET NULL,
  facilitator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  -- Location
  mode TEXT DEFAULT 'online' CHECK (mode IN ('online', 'in_clinic', 'hybrid')),
  meeting_link TEXT,
  location_name TEXT,
  -- Healing Target
  healing_intention TEXT,
  target_condition TEXT,
  -- Participants
  max_participants INTEGER DEFAULT 50,
  registered_count INTEGER DEFAULT 0,
  attended_count INTEGER DEFAULT 0,
  -- Status
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  -- Results
  group_coherence_score INTEGER CHECK (group_coherence_score >= 0 AND group_coherence_score <= 100),
  testimonials JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE dispenza_group_coherence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view group events"
  ON dispenza_group_coherence FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Facilitators can manage group events"
  ON dispenza_group_coherence FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_group_coherence_date ON dispenza_group_coherence(event_date);
CREATE INDEX IF NOT EXISTS idx_group_coherence_status ON dispenza_group_coherence(status);

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ TABLE 7: MEDITATION SCHEDULE (Patient's personalized daily schedule)          ║
-- ║ Purpose: AM/PM meditation plans with reminders and compliance tracking       ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS dispenza_meditation_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Schedule Config
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  time_slot TEXT NOT NULL CHECK (time_slot IN ('morning', 'evening')),
  scheduled_time TIME,
  tool_id UUID NOT NULL REFERENCES dispenza_meditation_tools(id) ON DELETE CASCADE,
  duration_minutes INTEGER DEFAULT 20,
  -- Reminder
  reminder_enabled BOOLEAN DEFAULT true,
  reminder_minutes_before INTEGER DEFAULT 10,
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE dispenza_meditation_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own schedule"
  ON dispenza_meditation_schedule FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own schedule"
  ON dispenza_meditation_schedule FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_med_schedule_user ON dispenza_meditation_schedule(user_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- DONE — 7 Tables Created:
-- 1. dispenza_meditation_tools (Master catalog)
-- 2. dispenza_meditation_sessions (Individual session logs)
-- 3. dispenza_meditation_progress (Aggregate stats & coherence score)
-- 4. dispenza_meditation_prescriptions (Doctor → Patient assignments)
-- 5. dispenza_emotion_journal (Gratitude & emotion tracking)
-- 6. dispenza_group_coherence (Group healing events)
-- 7. dispenza_meditation_schedule (Daily AM/PM schedules)
-- ═══════════════════════════════════════════════════════════════════════════════
