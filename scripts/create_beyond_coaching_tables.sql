-- ═══════════════════════════════════════════════════════════
-- BEYOND.PRAXIS — Coaching Cohort Manager
-- Cohorts, Members, Sessions, Homework, Accountability
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════
-- 1. COACHING COHORTS (Batches)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_coaching_cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  coach_name TEXT NOT NULL DEFAULT 'Jasir Sajidh',
  coach_avatar TEXT,
  -- Schedule
  starts_at DATE NOT NULL,
  ends_at DATE,
  duration_weeks INTEGER NOT NULL DEFAULT 4,
  -- Configuration
  max_members INTEGER DEFAULT 20,
  current_members INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'paused')),
  tier TEXT NOT NULL DEFAULT 'pro' CHECK (tier IN ('free', 'pro', 'elite')),
  -- Details
  what_you_get TEXT[] DEFAULT '{}',
  schedule_summary TEXT,
  session_day TEXT DEFAULT 'Saturday',
  session_time TEXT DEFAULT '10:00 AM IST',
  meeting_link TEXT,
  -- Gamification
  xp_reward INTEGER DEFAULT 500,
  badge_on_complete TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE beyond_coaching_cohorts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view published cohorts"
  ON beyond_coaching_cohorts FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_published = true);

CREATE POLICY "Admins can manage cohorts"
  ON beyond_coaching_cohorts FOR ALL
  USING (auth.uid() IS NOT NULL);


-- ═══════════════════════════════════════════════════════════
-- 2. COHORT MEMBERS
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_coaching_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cohort_id UUID NOT NULL REFERENCES beyond_coaching_cohorts(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped', 'paused')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  sessions_attended INTEGER DEFAULT 0,
  homework_completed INTEGER DEFAULT 0,
  accountability_score INTEGER DEFAULT 0,
  notes TEXT,
  UNIQUE(user_id, cohort_id)
);

ALTER TABLE beyond_coaching_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own membership"
  ON beyond_coaching_members FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can join cohorts"
  ON beyond_coaching_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own membership"
  ON beyond_coaching_members FOR UPDATE
  USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════
-- 3. COACHING SESSIONS (Weekly live calls)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_coaching_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id UUID NOT NULL REFERENCES beyond_coaching_cohorts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  session_number INTEGER NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  meeting_link TEXT,
  recording_url TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE beyond_coaching_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view sessions"
  ON beyond_coaching_sessions FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage sessions"
  ON beyond_coaching_sessions FOR ALL
  USING (auth.uid() IS NOT NULL);


-- ═══════════════════════════════════════════════════════════
-- 4. SESSION ATTENDANCE
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_coaching_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES beyond_coaching_sessions(id) ON DELETE CASCADE,
  attended BOOLEAN DEFAULT false,
  marked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, session_id)
);

ALTER TABLE beyond_coaching_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own attendance"
  ON beyond_coaching_attendance FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can mark attendance"
  ON beyond_coaching_attendance FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own attendance"
  ON beyond_coaching_attendance FOR UPDATE
  USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════
-- 5. HOMEWORK / ASSIGNMENTS
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_coaching_homework (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id UUID NOT NULL REFERENCES beyond_coaching_cohorts(id) ON DELETE CASCADE,
  session_id UUID REFERENCES beyond_coaching_sessions(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  due_date DATE,
  week_number INTEGER DEFAULT 1,
  xp_reward INTEGER DEFAULT 50,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE beyond_coaching_homework ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view homework"
  ON beyond_coaching_homework FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage homework"
  ON beyond_coaching_homework FOR ALL
  USING (auth.uid() IS NOT NULL);


-- ═══════════════════════════════════════════════════════════
-- 6. HOMEWORK SUBMISSIONS
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_coaching_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  homework_id UUID NOT NULL REFERENCES beyond_coaching_homework(id) ON DELETE CASCADE,
  submission_text TEXT,
  file_url TEXT,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewed', 'needs_revision')),
  coach_feedback TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  UNIQUE(user_id, homework_id)
);

ALTER TABLE beyond_coaching_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own submissions"
  ON beyond_coaching_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can submit homework"
  ON beyond_coaching_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own submission"
  ON beyond_coaching_submissions FOR UPDATE
  USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════
-- 7. INDEXES
-- ═══════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_coaching_cohorts_status ON beyond_coaching_cohorts(status, is_published);
CREATE INDEX IF NOT EXISTS idx_coaching_members_user ON beyond_coaching_members(user_id, cohort_id);
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_cohort ON beyond_coaching_sessions(cohort_id, session_number);
CREATE INDEX IF NOT EXISTS idx_coaching_homework_cohort ON beyond_coaching_homework(cohort_id, week_number);
CREATE INDEX IF NOT EXISTS idx_coaching_submissions_user ON beyond_coaching_submissions(user_id, homework_id);


-- ═══════════════════════════════════════════════════════════
-- 8. SEED: Sample Cohort
-- ═══════════════════════════════════════════════════════════

INSERT INTO beyond_coaching_cohorts (title, description, coach_name, starts_at, ends_at, duration_weeks, max_members, status, tier, is_published, what_you_get, schedule_summary, session_day, session_time, xp_reward)
VALUES (
  'Beyond Burnout — Batch 1',
  'A 4-week group coaching cohort where we apply the Wheel of Life framework together. Weekly live sessions, homework, accountability partners, and direct access to your coach. Transform your life balance with community support.',
  'Jasir Sajidh',
  CURRENT_DATE + INTERVAL '10 days',
  CURRENT_DATE + INTERVAL '38 days',
  4,
  15,
  'upcoming',
  'pro',
  true,
  ARRAY[
    '4 weekly live group coaching sessions (60 min each)',
    'Weekly homework with personalized feedback',
    'Accountability partner matching',
    'Private cohort chat group',
    'Session recordings for replay',
    'Certificate of completion',
    '500 XP + exclusive badge on completion'
  ],
  'Every Saturday, 10:00 AM IST for 4 weeks',
  'Saturday',
  '10:00 AM IST',
  500
)
ON CONFLICT DO NOTHING;

-- Seed sessions for the cohort
DO $$
DECLARE
  v_cohort_id UUID;
  v_start DATE;
BEGIN
  SELECT id, starts_at INTO v_cohort_id, v_start FROM beyond_coaching_cohorts WHERE title = 'Beyond Burnout — Batch 1' LIMIT 1;

  IF v_cohort_id IS NOT NULL THEN
    INSERT INTO beyond_coaching_sessions (cohort_id, title, description, session_number, scheduled_at, duration_minutes, status)
    VALUES
      (v_cohort_id, 'Week 1: Your Wheel Unveiled', 'Take your baseline assessment, identify weak spokes, set intentions for the cohort', 1, v_start + INTERVAL '0 days' + TIME '10:00', 60, 'upcoming'),
      (v_cohort_id, 'Week 2: Building Micro-Habits', 'Design your habit stack, set up accountability, track first week progress', 2, v_start + INTERVAL '7 days' + TIME '10:00', 60, 'upcoming'),
      (v_cohort_id, 'Week 3: Time & Energy Mastery', 'Pomodoro practice, energy mapping, boundary setting for doctors', 3, v_start + INTERVAL '14 days' + TIME '10:00', 60, 'upcoming'),
      (v_cohort_id, 'Week 4: Your 90-Day Roadmap', 'Create your personal growth plan, celebrate wins, next steps', 4, v_start + INTERVAL '21 days' + TIME '10:00', 60, 'upcoming')
    ON CONFLICT DO NOTHING;

    INSERT INTO beyond_coaching_homework (cohort_id, title, description, week_number, xp_reward, sort_order)
    VALUES
      (v_cohort_id, 'Complete Your Wheel Assessment', 'Take the Wheel of Life assessment in Beyond.Praxis and screenshot your radar chart. Note your 2 weakest spokes.', 1, 50, 1),
      (v_cohort_id, 'Write Your "Why" Statement', 'In 3-5 sentences, describe WHY you want to improve your life balance. What will be different in 90 days?', 1, 50, 2),
      (v_cohort_id, 'Design Your 3-Habit Stack', 'Choose 3 daily micro-habits (under 5 min each) that target your weakest spokes. Set them up in the Habit Tracker.', 2, 75, 3),
      (v_cohort_id, 'Accountability Check-In', 'Report: How many days did you complete your 3 habits this week? What blocked you?', 2, 50, 4),
      (v_cohort_id, 'Time Audit & Energy Map', 'Track your time for 2 days. Note your energy peaks and valleys. When are you most focused?', 3, 75, 5),
      (v_cohort_id, 'Boundary Setting Exercise', 'Identify 1 boundary you will set this week (work hours, phone usage, etc.) and report the outcome.', 3, 50, 6),
      (v_cohort_id, '90-Day Action Plan', 'Using the template provided, create your personalized 90-day growth plan with specific goals for your 3 focus spokes.', 4, 100, 7),
      (v_cohort_id, 'Reflection: What Changed?', 'Compare your Week 1 Wheel assessment to how you feel now. What shifted? What will you carry forward?', 4, 75, 8)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
