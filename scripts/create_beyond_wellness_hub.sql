-- ═══════════════════════════════════════════════════════════
-- BEYOND.PRAXIS — Module 5: Wellness & Anti-Burnout Hub
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════
-- SECTION 1: MOOD TRACKER
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_mood_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood INTEGER NOT NULL CHECK (mood BETWEEN 1 AND 5),
  -- 1=Very Low, 2=Low, 3=Neutral, 4=Good, 5=Great
  energy INTEGER CHECK (energy BETWEEN 1 AND 5),
  stress INTEGER CHECK (stress BETWEEN 1 AND 5),
  tags TEXT[] DEFAULT '{}',
  -- tags: e.g. ["tired","anxious","grateful","productive"]
  note TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE(user_id, date)
);

ALTER TABLE beyond_mood_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own mood logs"
  ON beyond_mood_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own mood logs"
  ON beyond_mood_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own mood logs"
  ON beyond_mood_logs FOR UPDATE USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════
-- SECTION 2: GRATITUDE JOURNAL
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_gratitude_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_1 TEXT NOT NULL,
  entry_2 TEXT,
  entry_3 TEXT,
  patient_win TEXT,
  -- optional: what went well with a patient today
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

ALTER TABLE beyond_gratitude_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own gratitude entries"
  ON beyond_gratitude_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own gratitude entries"
  ON beyond_gratitude_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own gratitude entries"
  ON beyond_gratitude_entries FOR UPDATE USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════
-- SECTION 3: BURNOUT ASSESSMENTS
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_burnout_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exhaustion_score INTEGER NOT NULL CHECK (exhaustion_score BETWEEN 0 AND 10),
  cynicism_score INTEGER NOT NULL CHECK (cynicism_score BETWEEN 0 AND 10),
  inefficacy_score INTEGER NOT NULL CHECK (inefficacy_score BETWEEN 0 AND 10),
  total_score NUMERIC(3,1) GENERATED ALWAYS AS (
    (exhaustion_score + cynicism_score + inefficacy_score) / 3.0
  ) STORED,
  risk_level TEXT GENERATED ALWAYS AS (
    CASE
      WHEN (exhaustion_score + cynicism_score + inefficacy_score) / 3.0 >= 7 THEN 'high'
      WHEN (exhaustion_score + cynicism_score + inefficacy_score) / 3.0 >= 4 THEN 'moderate'
      ELSE 'low'
    END
  ) STORED,
  notes TEXT,
  assessed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE beyond_burnout_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own burnout assessments"
  ON beyond_burnout_assessments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own burnout assessments"
  ON beyond_burnout_assessments FOR INSERT WITH CHECK (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════
-- SECTION 4: BREATHING / MEDITATION SESSIONS
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_breathing_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('box_breathing', '4_7_8', 'deep_belly', 'alternate_nostril', 'custom')),
  duration_seconds INTEGER NOT NULL,
  completed BOOLEAN DEFAULT true,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE beyond_breathing_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own breathing sessions"
  ON beyond_breathing_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own breathing sessions"
  ON beyond_breathing_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════
-- SECTION 5: SLEEP TRACKER
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_sleep_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bed_time TIME NOT NULL,
  wake_time TIME NOT NULL,
  quality INTEGER NOT NULL CHECK (quality BETWEEN 1 AND 5),
  -- 1=Terrible, 2=Poor, 3=Okay, 4=Good, 5=Excellent
  hours NUMERIC(3,1),
  notes TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

ALTER TABLE beyond_sleep_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sleep logs"
  ON beyond_sleep_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own sleep logs"
  ON beyond_sleep_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sleep logs"
  ON beyond_sleep_logs FOR UPDATE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════
-- DONE! Tables created for:
-- ✅ Mood Logs (daily mood + energy + stress + tags)
-- ✅ Gratitude Entries (3 things + patient win)
-- ✅ Burnout Assessments (3-dimension MBI-adapted scoring)
-- ✅ Breathing Sessions (type + duration tracking)
-- ✅ Sleep Logs (bed/wake time + quality)
-- ═══════════════════════════════════════════════════════════
