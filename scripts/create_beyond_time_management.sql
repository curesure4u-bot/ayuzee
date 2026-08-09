-- ═══════════════════════════════════════════════════════════
-- BEYOND.PRAXIS — Module 2: Time Management Toolkit
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════
-- SECTION 1: TIME LOGS (Daily activity tracking)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_time_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'clinical', 'admin', 'study', 'personal_growth', 'family',
    'wellness', 'social', 'commute', 'rest', 'wasted', 'other'
  )),
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 5),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE beyond_time_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own time logs"
  ON beyond_time_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own time logs"
  ON beyond_time_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own time logs"
  ON beyond_time_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own time logs"
  ON beyond_time_logs FOR DELETE USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════
-- SECTION 2: WEEKLY PLANS (Time-blocked weekly schedules)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_time_weekly_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  plan_data JSONB NOT NULL DEFAULT '[]',
  -- plan_data structure: [{day: "monday", blocks: [{start: "08:00", end: "09:00", activity: "OPD", category: "clinical"}]}]
  reflection_notes TEXT,
  adherence_score INTEGER CHECK (adherence_score BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

ALTER TABLE beyond_time_weekly_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own weekly plans"
  ON beyond_time_weekly_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own weekly plans"
  ON beyond_time_weekly_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own weekly plans"
  ON beyond_time_weekly_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own weekly plans"
  ON beyond_time_weekly_plans FOR DELETE USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════
-- SECTION 3: TIME BLOCK TEMPLATES (Pre-built & user-created)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_time_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  career_stage TEXT NOT NULL DEFAULT 'general' CHECK (career_stage IN (
    'general', 'student', 'intern', 'resident', 'consultant', 'academic', 'private_practice'
  )),
  blocks JSONB NOT NULL DEFAULT '[]',
  -- blocks: [{day: "monday", start: "06:00", end: "07:00", activity: "Exercise", category: "wellness"}]
  is_default BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE beyond_time_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view templates"
  ON beyond_time_templates FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can create own templates"
  ON beyond_time_templates FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own templates"
  ON beyond_time_templates FOR UPDATE USING (auth.uid() = created_by);


-- ═══════════════════════════════════════════════════════════
-- SECTION 4: POMODORO SESSIONS
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_pomodoro_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'study',
  duration_minutes INTEGER NOT NULL DEFAULT 25,
  completed BOOLEAN DEFAULT false,
  interrupted BOOLEAN DEFAULT false,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE beyond_pomodoro_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pomodoro sessions"
  ON beyond_pomodoro_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own pomodoro sessions"
  ON beyond_pomodoro_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pomodoro sessions"
  ON beyond_pomodoro_sessions FOR UPDATE USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════
-- SECTION 5: ENERGY TRACKER (Daily energy mapping)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_energy_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hour_of_day INTEGER NOT NULL CHECK (hour_of_day BETWEEN 0 AND 23),
  energy_level INTEGER NOT NULL CHECK (energy_level BETWEEN 1 AND 5),
  -- 1=Very Low, 2=Low, 3=Medium, 4=High, 5=Peak
  activity_at_time TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date, hour_of_day)
);

ALTER TABLE beyond_energy_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own energy logs"
  ON beyond_energy_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own energy logs"
  ON beyond_energy_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own energy logs"
  ON beyond_energy_logs FOR UPDATE USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════
-- SECTION 6: SEED DATA — Default Templates
-- ═══════════════════════════════════════════════════════════

INSERT INTO beyond_time_templates (name, description, career_stage, is_default, blocks) VALUES
(
  'PG Resident (Typical Day)',
  'Standard schedule for a postgraduate resident with clinical duties and study time',
  'resident',
  true,
  '[
    {"day":"weekday","start":"06:00","end":"06:30","activity":"Morning Routine","category":"wellness"},
    {"day":"weekday","start":"06:30","end":"07:00","activity":"Exercise / Yoga","category":"wellness"},
    {"day":"weekday","start":"07:00","end":"07:30","activity":"Breakfast + News","category":"rest"},
    {"day":"weekday","start":"07:30","end":"08:00","activity":"Commute","category":"commute"},
    {"day":"weekday","start":"08:00","end":"13:00","activity":"Hospital Duties (OPD/Ward)","category":"clinical"},
    {"day":"weekday","start":"13:00","end":"14:00","activity":"Lunch + Micro-lesson","category":"personal_growth"},
    {"day":"weekday","start":"14:00","end":"17:00","activity":"Hospital (Procedures/OT)","category":"clinical"},
    {"day":"weekday","start":"17:00","end":"17:30","activity":"Commute","category":"commute"},
    {"day":"weekday","start":"17:30","end":"18:00","activity":"Rest + Tea","category":"rest"},
    {"day":"weekday","start":"18:00","end":"20:00","activity":"Study / Exam Prep","category":"study"},
    {"day":"weekday","start":"20:00","end":"21:00","activity":"Family / Dinner","category":"family"},
    {"day":"weekday","start":"21:00","end":"22:00","activity":"Personal Growth / Reading","category":"personal_growth"},
    {"day":"weekday","start":"22:00","end":"22:30","activity":"Wind Down","category":"rest"}
  ]'::JSONB
),
(
  'Private Practitioner',
  'Balanced schedule for a doctor running their own clinic with built-in growth time',
  'private_practice',
  true,
  '[
    {"day":"weekday","start":"05:30","end":"06:30","activity":"Exercise + Meditation","category":"wellness"},
    {"day":"weekday","start":"06:30","end":"07:30","activity":"Personal Growth (Reading/Course)","category":"personal_growth"},
    {"day":"weekday","start":"07:30","end":"08:00","activity":"Breakfast + Family","category":"family"},
    {"day":"weekday","start":"08:00","end":"08:30","activity":"Commute","category":"commute"},
    {"day":"weekday","start":"08:30","end":"13:00","activity":"Morning OPD","category":"clinical"},
    {"day":"weekday","start":"13:00","end":"14:00","activity":"Lunch + Admin","category":"admin"},
    {"day":"weekday","start":"14:00","end":"16:00","activity":"Procedures / Follow-ups","category":"clinical"},
    {"day":"weekday","start":"16:00","end":"17:00","activity":"Admin + Finances","category":"admin"},
    {"day":"weekday","start":"17:00","end":"18:30","activity":"Evening OPD","category":"clinical"},
    {"day":"weekday","start":"18:30","end":"19:00","activity":"Commute","category":"commute"},
    {"day":"weekday","start":"19:00","end":"20:30","activity":"Family Time","category":"family"},
    {"day":"weekday","start":"20:30","end":"21:30","activity":"CME / Side Project","category":"personal_growth"},
    {"day":"weekday","start":"21:30","end":"22:00","activity":"Reflection + Plan Tomorrow","category":"personal_growth"}
  ]'::JSONB
),
(
  'Medical Student (Exam Mode)',
  'High-study schedule for MBBS/BAMS students during exam preparation',
  'student',
  true,
  '[
    {"day":"weekday","start":"05:00","end":"05:30","activity":"Wake + Fresh Up","category":"wellness"},
    {"day":"weekday","start":"05:30","end":"08:00","activity":"Deep Study Block 1","category":"study"},
    {"day":"weekday","start":"08:00","end":"08:30","activity":"Breakfast","category":"rest"},
    {"day":"weekday","start":"08:30","end":"11:00","activity":"Deep Study Block 2","category":"study"},
    {"day":"weekday","start":"11:00","end":"11:15","activity":"Break + Stretch","category":"wellness"},
    {"day":"weekday","start":"11:15","end":"13:00","activity":"Study Block 3 (Revision)","category":"study"},
    {"day":"weekday","start":"13:00","end":"14:00","activity":"Lunch + Power Nap","category":"rest"},
    {"day":"weekday","start":"14:00","end":"16:00","activity":"Practice MCQs / Mock Tests","category":"study"},
    {"day":"weekday","start":"16:00","end":"16:30","activity":"Tea + Walk","category":"wellness"},
    {"day":"weekday","start":"16:30","end":"18:30","activity":"Study Block 4 (New Topics)","category":"study"},
    {"day":"weekday","start":"18:30","end":"19:30","activity":"Exercise / Sports","category":"wellness"},
    {"day":"weekday","start":"19:30","end":"20:30","activity":"Dinner + Family","category":"family"},
    {"day":"weekday","start":"20:30","end":"22:00","activity":"Light Revision + Notes","category":"study"},
    {"day":"weekday","start":"22:00","end":"22:30","activity":"Gratitude + Plan Tomorrow","category":"personal_growth"}
  ]'::JSONB
),
(
  'Academic Doctor (Teaching + Research)',
  'Schedule for doctors with teaching and research responsibilities',
  'academic',
  true,
  '[
    {"day":"weekday","start":"06:00","end":"07:00","activity":"Writing / Research Paper","category":"personal_growth"},
    {"day":"weekday","start":"07:00","end":"07:30","activity":"Exercise","category":"wellness"},
    {"day":"weekday","start":"07:30","end":"08:30","activity":"Breakfast + Family","category":"family"},
    {"day":"weekday","start":"08:30","end":"10:30","activity":"Clinical Duties","category":"clinical"},
    {"day":"weekday","start":"10:30","end":"12:00","activity":"Teaching / Lectures","category":"clinical"},
    {"day":"weekday","start":"12:00","end":"13:00","activity":"Research Work","category":"personal_growth"},
    {"day":"weekday","start":"13:00","end":"14:00","activity":"Lunch + Networking","category":"social"},
    {"day":"weekday","start":"14:00","end":"16:00","activity":"PG Student Guidance","category":"clinical"},
    {"day":"weekday","start":"16:00","end":"17:00","activity":"Admin / Meetings","category":"admin"},
    {"day":"weekday","start":"17:00","end":"18:00","activity":"Personal Development","category":"personal_growth"},
    {"day":"weekday","start":"18:00","end":"19:00","activity":"Commute","category":"commute"},
    {"day":"weekday","start":"19:00","end":"21:00","activity":"Family + Dinner","category":"family"},
    {"day":"weekday","start":"21:00","end":"22:00","activity":"Reading / Leisure","category":"rest"}
  ]'::JSONB
)
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════
-- DONE! Tables created for:
-- ✅ Time Logs (activity + category + energy tracking)
-- ✅ Weekly Plans (time-blocked schedules with JSONB)
-- ✅ Time Templates (pre-built + user-created)
-- ✅ Pomodoro Sessions (focus timer tracking)
-- ✅ Energy Logs (hourly energy mapping)
-- ✅ Seed Data (4 doctor-specific templates)
-- ═══════════════════════════════════════════════════════════
