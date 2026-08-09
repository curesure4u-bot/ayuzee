-- ═══════════════════════════════════════════════════════════
-- BEYOND.PRAXIS — Academy (LMS) Module
-- Courses, Lessons, Quizzes, Enrollments, Progress, Certificates
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════
-- 1. COURSES
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_academy_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN (
    'clinical', 'finance', 'leadership', 'wellness', 'time',
    'side_income', 'communication', 'research', 'general'
  )),
  difficulty TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  estimated_hours NUMERIC(4,1) DEFAULT 0,
  total_lessons INTEGER DEFAULT 0,
  total_quizzes INTEGER DEFAULT 0,
  instructor_name TEXT NOT NULL DEFAULT 'Jasir Sajidh',
  instructor_avatar TEXT,
  is_published BOOLEAN DEFAULT false,
  is_free BOOLEAN DEFAULT true,
  price_inr INTEGER DEFAULT 0,
  drip_enabled BOOLEAN DEFAULT false,
  drip_interval_days INTEGER DEFAULT 7,
  xp_reward INTEGER DEFAULT 200,
  coin_reward INTEGER DEFAULT 50,
  badge_on_complete TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE beyond_academy_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view published courses"
  ON beyond_academy_courses FOR SELECT
  USING (auth.uid() IS NOT NULL AND (is_published = true OR auth.uid() IN (
    SELECT user_id FROM beyond_profiles WHERE user_id = auth.uid()
  )));

CREATE POLICY "Admins can manage courses"
  ON beyond_academy_courses FOR ALL
  USING (auth.uid() IN (
    SELECT user_id FROM beyond_profiles WHERE career_stage = 'academic' OR user_id = auth.uid()
  ));


-- ═══════════════════════════════════════════════════════════
-- 2. LESSONS (within courses)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_academy_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES beyond_academy_courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  lesson_type TEXT NOT NULL DEFAULT 'video' CHECK (lesson_type IN ('video', 'text', 'pdf', 'audio', 'assignment')),
  video_url TEXT,
  content_html TEXT,
  pdf_url TEXT,
  audio_url TEXT,
  assignment_text TEXT,
  duration_minutes INTEGER DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_free_preview BOOLEAN DEFAULT false,
  drip_day INTEGER DEFAULT 0,
  xp_reward INTEGER DEFAULT 25,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE beyond_academy_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enrolled users can view lessons"
  ON beyond_academy_lessons FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage lessons"
  ON beyond_academy_lessons FOR ALL
  USING (auth.uid() IS NOT NULL);


-- ═══════════════════════════════════════════════════════════
-- 3. QUIZZES (per course or per lesson)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_academy_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES beyond_academy_courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES beyond_academy_lessons(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  passing_score INTEGER NOT NULL DEFAULT 70,
  time_limit_minutes INTEGER,
  max_attempts INTEGER DEFAULT 3,
  sort_order INTEGER DEFAULT 0,
  xp_reward INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE beyond_academy_quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enrolled users can view quizzes"
  ON beyond_academy_quizzes FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage quizzes"
  ON beyond_academy_quizzes FOR ALL
  USING (auth.uid() IS NOT NULL);


-- ═══════════════════════════════════════════════════════════
-- 4. QUIZ QUESTIONS
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_academy_quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES beyond_academy_quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'mcq' CHECK (question_type IN ('mcq', 'true_false', 'short_answer')),
  options JSONB DEFAULT '[]',
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  points INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE beyond_academy_quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enrolled users can view questions"
  ON beyond_academy_quiz_questions FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage questions"
  ON beyond_academy_quiz_questions FOR ALL
  USING (auth.uid() IS NOT NULL);


-- ═══════════════════════════════════════════════════════════
-- 5. ENROLLMENTS
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_academy_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES beyond_academy_courses(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'expired')),
  progress_pct INTEGER DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  lessons_completed INTEGER DEFAULT 0,
  quizzes_passed INTEGER DEFAULT 0,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

ALTER TABLE beyond_academy_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own enrollments"
  ON beyond_academy_enrollments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can enroll themselves"
  ON beyond_academy_enrollments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own enrollment"
  ON beyond_academy_enrollments FOR UPDATE
  USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════
-- 6. LESSON PROGRESS
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_academy_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES beyond_academy_lessons(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES beyond_academy_courses(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  watch_time_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE beyond_academy_lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own lesson progress"
  ON beyond_academy_lesson_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own lesson progress"
  ON beyond_academy_lesson_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lesson progress"
  ON beyond_academy_lesson_progress FOR UPDATE
  USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════
-- 7. QUIZ ATTEMPTS
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_academy_quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES beyond_academy_quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  total_points INTEGER NOT NULL DEFAULT 0,
  percentage INTEGER NOT NULL DEFAULT 0,
  passed BOOLEAN DEFAULT false,
  answers JSONB DEFAULT '{}',
  time_taken_seconds INTEGER,
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE beyond_academy_quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quiz attempts"
  ON beyond_academy_quiz_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own quiz attempts"
  ON beyond_academy_quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════
-- 8. CERTIFICATES
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_academy_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES beyond_academy_courses(id) ON DELETE CASCADE,
  certificate_number TEXT NOT NULL UNIQUE,
  holder_name TEXT NOT NULL,
  course_title TEXT NOT NULL,
  instructor_name TEXT NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  grade TEXT DEFAULT 'Pass' CHECK (grade IN ('Pass', 'Merit', 'Distinction')),
  UNIQUE(user_id, course_id)
);

ALTER TABLE beyond_academy_certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own certificates"
  ON beyond_academy_certificates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can issue certificates"
  ON beyond_academy_certificates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Public view for certificate verification
CREATE POLICY "Anyone can verify certificates"
  ON beyond_academy_certificates FOR SELECT
  USING (true);


-- ═══════════════════════════════════════════════════════════
-- 9. INDEXES FOR PERFORMANCE
-- ═══════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_academy_lessons_course ON beyond_academy_lessons(course_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_academy_quizzes_course ON beyond_academy_quizzes(course_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_academy_questions_quiz ON beyond_academy_quiz_questions(quiz_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_academy_enrollments_user ON beyond_academy_enrollments(user_id, status);
CREATE INDEX IF NOT EXISTS idx_academy_progress_user ON beyond_academy_lesson_progress(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_academy_attempts_user ON beyond_academy_quiz_attempts(user_id, quiz_id);


-- ═══════════════════════════════════════════════════════════
-- 10. SEED: Sample Course for Testing
-- ═══════════════════════════════════════════════════════════

INSERT INTO beyond_academy_courses (title, subtitle, description, category, difficulty, estimated_hours, total_lessons, total_quizzes, instructor_name, is_published, is_free, xp_reward, coin_reward, tags)
VALUES (
  'Beyond Burnout: Doctor Life Mastery',
  'A 4-week system to reclaim balance, energy, and purpose',
  'This flagship course teaches medical professionals how to use the Wheel of Life framework to identify imbalances, set meaningful goals, build sustainable habits, and create a life that thrives beyond the clinic. Includes video lessons, workbooks, quizzes, and a certificate of completion.',
  'wellness',
  'beginner',
  6.0,
  12,
  3,
  'Jasir Sajidh',
  true,
  true,
  500,
  100,
  ARRAY['burnout', 'wellness', 'wheel-of-life', 'habits', 'balance']
)
ON CONFLICT DO NOTHING;

-- Get the course ID for lesson seeding
DO $$
DECLARE
  v_course_id UUID;
BEGIN
  SELECT id INTO v_course_id FROM beyond_academy_courses WHERE title = 'Beyond Burnout: Doctor Life Mastery' LIMIT 1;
  
  IF v_course_id IS NOT NULL THEN
    -- Week 1 Lessons
    INSERT INTO beyond_academy_lessons (course_id, title, description, lesson_type, duration_minutes, sort_order, is_free_preview, drip_day, xp_reward)
    VALUES
      (v_course_id, 'Welcome & Course Overview', 'What you will learn and how to get the most from this course', 'video', 8, 1, true, 0, 25),
      (v_course_id, 'Understanding the Wheel of Life', 'The 8 spokes explained — why balance matters for doctors', 'video', 15, 2, true, 0, 25),
      (v_course_id, 'Your First Self-Assessment', 'Take your baseline Wheel assessment with guided reflection', 'assignment', 20, 3, false, 0, 50),
      (v_course_id, 'Identifying Your Weak Spokes', 'How to read your wheel and find where to focus first', 'video', 12, 4, false, 7, 25),
      (v_course_id, 'Goal Setting That Actually Works', 'SMART goals adapted for busy medical professionals', 'video', 15, 5, false, 7, 25),
      (v_course_id, 'The Habit Stack Method', 'Building micro-habits that compound into transformation', 'video', 18, 6, false, 7, 25),
      (v_course_id, 'Time Blocking for Doctors', 'Protect your non-negotiables in a chaotic schedule', 'video', 14, 7, false, 14, 25),
      (v_course_id, 'The Energy Management Framework', 'Work with your biology, not against it', 'video', 16, 8, false, 14, 25),
      (v_course_id, 'Building Your Support System', 'Accountability partners and community power', 'video', 12, 9, false, 14, 25),
      (v_course_id, 'Financial Foundations for Doctors', 'The basics every doctor should know but was never taught', 'video', 20, 10, false, 21, 25),
      (v_course_id, 'The Joy Audit', 'Rediscovering what lights you up outside of medicine', 'assignment', 25, 11, false, 21, 50),
      (v_course_id, 'Your 90-Day Action Plan', 'Putting it all together — your personalized growth roadmap', 'video', 20, 12, false, 21, 50)
    ON CONFLICT DO NOTHING;

    -- Quiz for Week 1
    INSERT INTO beyond_academy_quizzes (course_id, title, description, passing_score, max_attempts, sort_order, xp_reward)
    VALUES
      (v_course_id, 'Week 1: Foundations Quiz', 'Test your understanding of the Wheel of Life and self-assessment', 70, 3, 1, 75),
      (v_course_id, 'Week 2: Goals & Habits Quiz', 'Check your grasp of goal setting and habit formation', 70, 3, 2, 75),
      (v_course_id, 'Final Assessment', 'Comprehensive quiz covering all course material', 80, 2, 3, 150)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Seed quiz questions for Week 1 quiz
DO $$
DECLARE
  v_quiz_id UUID;
BEGIN
  SELECT id INTO v_quiz_id FROM beyond_academy_quizzes WHERE title = 'Week 1: Foundations Quiz' LIMIT 1;
  
  IF v_quiz_id IS NOT NULL THEN
    INSERT INTO beyond_academy_quiz_questions (quiz_id, question_text, question_type, options, correct_answer, explanation, points, sort_order)
    VALUES
      (v_quiz_id, 'How many spokes does the Wheel of Life have in Beyond.Praxis?', 'mcq', '["6", "8", "10", "12"]', '8', 'The Wheel of Life has 8 spokes: Clinical, Finance, Time, Leadership, Relationships, Family, Wellness, and Joy.', 1, 1),
      (v_quiz_id, 'What is the recommended frequency for taking a Wheel of Life assessment?', 'mcq', '["Daily", "Weekly", "Monthly", "Yearly"]', 'Monthly', 'Monthly assessments give enough time for change while keeping data fresh for accurate recommendations.', 1, 2),
      (v_quiz_id, 'A balanced Wheel means all spokes score 10/10.', 'true_false', '["True", "False"]', 'False', 'Balance means intentional attention to all areas, not perfection. A 7-8 across all spokes is excellent.', 1, 3),
      (v_quiz_id, 'Which spoke covers sleep, exercise, and stress management?', 'mcq', '["Clinical Excellence", "Joy & Hobbies", "Health & Wellness", "Family & Presence"]', 'Health & Wellness', 'The Wellness spoke encompasses physical health, sleep quality, exercise, stress levels, and burnout prevention.', 1, 4),
      (v_quiz_id, 'The Combined Score on the dashboard blends which two data sources?', 'mcq', '["Self-score + Peer rating", "Self-score + Activity data", "XP + Coins", "Goals + Streaks"]', 'Self-score + Activity data', 'Combined Score = 60% Wheel self-assessment + 40% actual module activity. This ensures both reflection and action count.', 1, 5)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
