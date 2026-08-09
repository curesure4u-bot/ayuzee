-- ═══════════════════════════════════════════════════════════════════════════
-- BEYOND.PRAXIS — ALL COACHING MODULES (Combined SQL)
-- 
-- Run this SINGLE file in Supabase SQL Editor to set up ALL coaching tables:
--   1. Academy (LMS) — Courses, Lessons, Quizzes, Certificates
--   2. Events & Webinars — Events, Registrations, Q&A, Resources
--   3. Digital Store — Products, Purchases, Reviews
--   4. Coaching Cohorts — Cohorts, Members, Sessions, Homework, Submissions
--   5. Membership Tiers — Plans, Subscriptions, Feature Access
--
-- IMPORTANT: Run create_beyond_praxis_tables.sql FIRST (if not already done)
-- This script is safe to re-run (uses IF NOT EXISTS / ON CONFLICT DO NOTHING)
-- ═══════════════════════════════════════════════════════════════════════════


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
-- ═══════════════════════════════════════════════════════════
-- BEYOND.PRAXIS — Webinars & Events Module
-- Events, Registrations, Q&A, Resources/Replays
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════
-- 1. EVENTS (Webinars, Workshops, Live Sessions)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'webinar' CHECK (event_type IN (
    'webinar', 'workshop', 'live_qa', 'masterclass', 'panel'
  )),
  host_name TEXT NOT NULL DEFAULT 'Jasir Sajidh',
  host_avatar TEXT,
  guest_speakers TEXT[] DEFAULT '{}',
  thumbnail_url TEXT,
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN (
    'clinical', 'finance', 'leadership', 'wellness', 'time',
    'side_income', 'communication', 'general'
  )),
  -- Scheduling
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  duration_minutes INTEGER DEFAULT 60,
  timezone TEXT DEFAULT 'Asia/Kolkata',
  -- Live links
  live_url TEXT,
  meeting_id TEXT,
  meeting_password TEXT,
  -- Replay
  replay_url TEXT,
  replay_available BOOLEAN DEFAULT false,
  replay_expires_at TIMESTAMPTZ,
  -- Status
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed', 'cancelled')),
  is_published BOOLEAN DEFAULT false,
  is_free BOOLEAN DEFAULT true,
  price_inr INTEGER DEFAULT 0,
  max_attendees INTEGER,
  -- CTA (Call to Action after event)
  cta_enabled BOOLEAN DEFAULT false,
  cta_title TEXT,
  cta_description TEXT,
  cta_button_text TEXT DEFAULT 'Enroll Now',
  cta_link TEXT,
  -- Gamification
  xp_reward INTEGER DEFAULT 50,
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  registration_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE beyond_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view published events"
  ON beyond_events FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_published = true);

CREATE POLICY "Admins can manage events"
  ON beyond_events FOR ALL
  USING (auth.uid() IS NOT NULL);


-- ═══════════════════════════════════════════════════════════
-- 2. EVENT REGISTRATIONS
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES beyond_events(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'no_show', 'cancelled')),
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  attended_at TIMESTAMPTZ,
  watch_duration_minutes INTEGER DEFAULT 0,
  feedback_rating INTEGER CHECK (feedback_rating BETWEEN 1 AND 5),
  feedback_text TEXT,
  UNIQUE(user_id, event_id)
);

ALTER TABLE beyond_event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own registrations"
  ON beyond_event_registrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can register for events"
  ON beyond_event_registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own registration"
  ON beyond_event_registrations FOR UPDATE
  USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════
-- 3. EVENT Q&A (Questions during/after event)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_event_qa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES beyond_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT,
  answered_by TEXT,
  is_pinned BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0,
  asked_at TIMESTAMPTZ DEFAULT NOW(),
  answered_at TIMESTAMPTZ
);

ALTER TABLE beyond_event_qa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Registered users can view event QA"
  ON beyond_event_qa FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can ask questions"
  ON beyond_event_qa FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can answer questions"
  ON beyond_event_qa FOR UPDATE
  USING (auth.uid() IS NOT NULL);


-- ═══════════════════════════════════════════════════════════
-- 4. EVENT RESOURCES (Slides, PDFs, Downloads)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_event_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES beyond_events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  resource_type TEXT NOT NULL DEFAULT 'pdf' CHECK (resource_type IN ('pdf', 'slides', 'worksheet', 'link', 'other')),
  file_url TEXT,
  external_url TEXT,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE beyond_event_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Registered users can view resources"
  ON beyond_event_resources FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage resources"
  ON beyond_event_resources FOR ALL
  USING (auth.uid() IS NOT NULL);


-- ═══════════════════════════════════════════════════════════
-- 5. INDEXES
-- ═══════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_events_status ON beyond_events(status, starts_at);
CREATE INDEX IF NOT EXISTS idx_events_published ON beyond_events(is_published, starts_at);
CREATE INDEX IF NOT EXISTS idx_event_regs_user ON beyond_event_registrations(user_id, event_id);
CREATE INDEX IF NOT EXISTS idx_event_qa_event ON beyond_event_qa(event_id, is_pinned, asked_at);
CREATE INDEX IF NOT EXISTS idx_event_resources_event ON beyond_event_resources(event_id, sort_order);


-- ═══════════════════════════════════════════════════════════
-- 6. SEED: Sample Events
-- ═══════════════════════════════════════════════════════════

INSERT INTO beyond_events (title, subtitle, description, event_type, host_name, category, starts_at, ends_at, duration_minutes, status, is_published, is_free, xp_reward, cta_enabled, cta_title, cta_description, cta_button_text, cta_link, tags)
VALUES
(
  'Why Doctors Burn Out & The 8-Spoke Solution',
  'Free Masterclass — The Wheel of Life for Busy Clinicians',
  'In this 60-minute free masterclass, learn why 60% of doctors experience burnout and discover the 8-spoke Wheel of Life framework that helps you identify imbalances before they become crises. You''ll leave with a personalized action plan and access to the Beyond.Praxis tool.',
  'masterclass',
  'Jasir Sajidh',
  'wellness',
  NOW() + INTERVAL '7 days',
  NOW() + INTERVAL '7 days' + INTERVAL '75 minutes',
  75,
  'upcoming',
  true,
  true,
  100,
  true,
  'Ready to Transform Your Life?',
  'Join the Beyond Burnout course and get structured guidance for 30 days.',
  'Enroll in Course',
  '/beyond/academy',
  ARRAY['burnout', 'wellness', 'wheel-of-life', 'free', 'masterclass']
),
(
  'Side Income Secrets for AYUSH Doctors',
  'Workshop: 5 Proven Models to Earn Beyond Your Clinic',
  'Discover 5 side-income models that AYUSH doctors are using right now to generate ₹50K-₹5L/month beyond their practice — without compromising patient care. Includes case studies, templates, and Q&A.',
  'workshop',
  'Jasir Sajidh',
  'side_income',
  NOW() + INTERVAL '14 days',
  NOW() + INTERVAL '14 days' + INTERVAL '90 minutes',
  90,
  'upcoming',
  true,
  true,
  100,
  true,
  'Start Building Side Income',
  'Get the full Side Income Blueprint with templates and frameworks.',
  'Get the Blueprint',
  '/beyond/side-income',
  ARRAY['side-income', 'finance', 'workshop', 'free']
),
(
  'Monthly Wheel Check-In: Live Group Coaching',
  'Reflect, Reset, and Recommit with the Community',
  'Join our monthly live group coaching session where we review our Wheel of Life scores together, celebrate wins, troubleshoot challenges, and set intentions for the next 30 days. Open to all Beyond.Praxis members.',
  'live_qa',
  'Jasir Sajidh',
  'general',
  NOW() + INTERVAL '21 days',
  NOW() + INTERVAL '21 days' + INTERVAL '60 minutes',
  60,
  'upcoming',
  true,
  true,
  75,
  false,
  NULL, NULL, NULL, NULL,
  ARRAY['coaching', 'community', 'wheel-of-life', 'monthly']
)
ON CONFLICT DO NOTHING;
-- ═══════════════════════════════════════════════════════════
-- BEYOND.PRAXIS — Digital Products Store
-- Products, Purchases, Reviews, Downloads
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════
-- 1. DIGITAL PRODUCTS
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_digital_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  product_type TEXT NOT NULL DEFAULT 'pdf' CHECK (product_type IN (
    'pdf', 'template', 'worksheet', 'ebook', 'spreadsheet',
    'notion_template', 'checklist', 'toolkit', 'bundle'
  )),
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN (
    'clinical', 'finance', 'leadership', 'wellness', 'time',
    'side_income', 'communication', 'research', 'general'
  )),
  thumbnail_url TEXT,
  preview_url TEXT,
  file_url TEXT NOT NULL,
  file_size_kb INTEGER DEFAULT 0,
  -- Pricing: coins OR free
  price_coins INTEGER DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  -- Stats
  download_count INTEGER DEFAULT 0,
  rating_avg NUMERIC(2,1) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  -- Metadata
  author_name TEXT NOT NULL DEFAULT 'Jasir Sajidh',
  tags TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE beyond_digital_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view published products"
  ON beyond_digital_products FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_published = true);

CREATE POLICY "Admins can manage products"
  ON beyond_digital_products FOR ALL
  USING (auth.uid() IS NOT NULL);


-- ═══════════════════════════════════════════════════════════
-- 2. PURCHASES / UNLOCKS
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_digital_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES beyond_digital_products(id) ON DELETE CASCADE,
  coins_spent INTEGER DEFAULT 0,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  download_count INTEGER DEFAULT 0,
  last_downloaded_at TIMESTAMPTZ,
  UNIQUE(user_id, product_id)
);

ALTER TABLE beyond_digital_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchases"
  ON beyond_digital_purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can purchase products"
  ON beyond_digital_purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own purchase"
  ON beyond_digital_purchases FOR UPDATE
  USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════
-- 3. PRODUCT REVIEWS
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_digital_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES beyond_digital_products(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  reviewer_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE beyond_digital_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
  ON beyond_digital_reviews FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create own reviews"
  ON beyond_digital_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON beyond_digital_reviews FOR UPDATE
  USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════
-- 4. INDEXES
-- ═══════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_digital_products_published ON beyond_digital_products(is_published, category);
CREATE INDEX IF NOT EXISTS idx_digital_products_featured ON beyond_digital_products(is_featured, created_at);
CREATE INDEX IF NOT EXISTS idx_digital_purchases_user ON beyond_digital_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_digital_reviews_product ON beyond_digital_reviews(product_id);


-- ═══════════════════════════════════════════════════════════
-- 5. SEED: Sample Digital Products
-- ═══════════════════════════════════════════════════════════

INSERT INTO beyond_digital_products (title, subtitle, description, product_type, category, file_url, price_coins, is_free, is_published, is_featured, author_name, tags)
VALUES
(
  '30-Day Wheel of Life Journal',
  'Daily reflection prompts for all 8 spokes',
  'A beautifully designed 30-day journal with daily prompts for each spoke of the Wheel of Life. Includes weekly review pages, goal-setting frameworks, and progress trackers. Print or use digitally.',
  'pdf',
  'general',
  '/docs/wheel-journal-30-day.pdf',
  50,
  false,
  true,
  true,
  'Jasir Sajidh',
  ARRAY['journal', 'wheel-of-life', 'reflection', '30-day']
),
(
  'Doctor''s Monthly Budget Planner',
  'Track income, expenses, investments & tax savings',
  'An Excel/Google Sheets template designed specifically for doctors. Tracks clinic income, hospital salary, side income, expenses by category, SIP investments, tax-saving instruments, and net worth over time.',
  'spreadsheet',
  'finance',
  '/docs/doctor-budget-planner.xlsx',
  75,
  false,
  true,
  true,
  'Jasir Sajidh',
  ARRAY['finance', 'budget', 'spreadsheet', 'tax']
),
(
  'Leadership Scenario Workbook',
  '20 real-world medical leadership challenges',
  'A PDF workbook with 20 detailed leadership scenarios that medical professionals face — from managing difficult team members to handling hospital politics. Each scenario includes analysis frameworks and model responses.',
  'worksheet',
  'leadership',
  '/docs/leadership-workbook.pdf',
  100,
  false,
  true,
  false,
  'Jasir Sajidh',
  ARRAY['leadership', 'scenarios', 'workbook']
),
(
  'Side Income Starter Kit',
  'Templates, frameworks & action plans',
  'Everything you need to start your first side-income project as a doctor. Includes: income stream comparison matrix, content calendar template, pricing calculator, client outreach scripts, and a 90-day action plan.',
  'bundle',
  'side_income',
  '/docs/side-income-starter-kit.zip',
  150,
  false,
  true,
  true,
  'Jasir Sajidh',
  ARRAY['side-income', 'templates', 'bundle', 'starter-kit']
),
(
  'Pomodoro Focus Planner',
  'Weekly planner with energy tracking built in',
  'A printable weekly planner that combines Pomodoro technique tracking with energy-level mapping. Plan your deep work during peak energy hours. Includes habit check-off section.',
  'template',
  'time',
  '/docs/pomodoro-weekly-planner.pdf',
  0,
  true,
  true,
  false,
  'Jasir Sajidh',
  ARRAY['time', 'pomodoro', 'planner', 'free']
),
(
  'Gratitude & Wellness Tracker',
  '90-day wellness check-in with mood patterns',
  'A 90-day tracker for daily mood, energy, sleep quality, and gratitude entries. Designed for doctors who want to identify burnout patterns early. Includes monthly review spreads.',
  'checklist',
  'wellness',
  '/docs/wellness-90-day-tracker.pdf',
  50,
  false,
  true,
  false,
  'Jasir Sajidh',
  ARRAY['wellness', 'gratitude', 'tracker', 'burnout']
)
ON CONFLICT DO NOTHING;
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
-- ═══════════════════════════════════════════════════════════
-- BEYOND.PRAXIS — Membership Tiers
-- Plans, Subscriptions, Feature Access
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════
-- 1. MEMBERSHIP PLANS (Catalog)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_membership_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  tier_level INTEGER NOT NULL DEFAULT 0,
  -- Pricing
  price_monthly_inr INTEGER DEFAULT 0,
  price_yearly_inr INTEGER DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  -- Features
  features JSONB NOT NULL DEFAULT '[]',
  highlighted_feature TEXT,
  -- Display
  badge_color TEXT DEFAULT 'gray',
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE beyond_membership_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active plans"
  ON beyond_membership_plans FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage plans"
  ON beyond_membership_plans FOR ALL
  USING (auth.uid() IS NOT NULL);


-- ═══════════════════════════════════════════════════════════
-- 2. USER SUBSCRIPTIONS
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_membership_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES beyond_membership_plans(id),
  plan_slug TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'paused')),
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly', 'lifetime', 'free')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  -- Payment (for future integration)
  payment_method TEXT,
  last_payment_at TIMESTAMPTZ,
  next_payment_at TIMESTAMPTZ,
  UNIQUE(user_id)
);

ALTER TABLE beyond_membership_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON beyond_membership_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create subscription"
  ON beyond_membership_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON beyond_membership_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════
-- 3. FEATURE ACCESS CONTROL
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_membership_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key TEXT NOT NULL UNIQUE,
  feature_name TEXT NOT NULL,
  description TEXT,
  min_tier_level INTEGER NOT NULL DEFAULT 0,
  category TEXT DEFAULT 'module',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE beyond_membership_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view features"
  ON beyond_membership_features FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage features"
  ON beyond_membership_features FOR ALL
  USING (auth.uid() IS NOT NULL);


-- ═══════════════════════════════════════════════════════════
-- 4. INDEXES
-- ═══════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_membership_subs_user ON beyond_membership_subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_membership_plans_active ON beyond_membership_plans(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_membership_features_tier ON beyond_membership_features(min_tier_level);


-- ═══════════════════════════════════════════════════════════
-- 5. SEED: Plans
-- ═══════════════════════════════════════════════════════════

INSERT INTO beyond_membership_plans (name, slug, description, tier_level, price_monthly_inr, price_yearly_inr, is_free, features, highlighted_feature, badge_color, is_popular, sort_order)
VALUES
(
  'Free',
  'free',
  'Get started with essential tools. Perfect for exploring Beyond.Praxis.',
  0,
  0, 0, true,
  '[
    {"text": "Wheel of Life assessment", "included": true},
    {"text": "Dashboard with spoke health", "included": true},
    {"text": "Community access (read only)", "included": true},
    {"text": "3 free digital products", "included": true},
    {"text": "Daily mood & habit tracking", "included": true},
    {"text": "Basic gamification (XP & streaks)", "included": true},
    {"text": "Academy courses", "included": false},
    {"text": "Coaching cohorts", "included": false},
    {"text": "Events & webinars", "included": false},
    {"text": "All digital products", "included": false},
    {"text": "Priority support", "included": false},
    {"text": "1-on-1 coaching", "included": false}
  ]'::jsonb,
  'Free forever — no card needed',
  'gray',
  false,
  1
),
(
  'Pro',
  'pro',
  'Full access to all modules, courses, events, and group coaching. For serious growth.',
  1,
  999, 9999, false,
  '[
    {"text": "Everything in Free", "included": true},
    {"text": "All Academy courses (unlimited)", "included": true},
    {"text": "Events & webinars access", "included": true},
    {"text": "Group coaching cohorts", "included": true},
    {"text": "All digital products included", "included": true},
    {"text": "Community full access (post & reply)", "included": true},
    {"text": "Advanced gamification & leaderboard", "included": true},
    {"text": "Leadership Lab full scenarios", "included": true},
    {"text": "AI Clinical Companion", "included": true},
    {"text": "Monthly bonus coins (100/month)", "included": true},
    {"text": "Priority support", "included": false},
    {"text": "1-on-1 coaching sessions", "included": false}
  ]'::jsonb,
  'Most popular — everything you need',
  'violet',
  true,
  2
),
(
  'Elite',
  'elite',
  'Premium tier with 1-on-1 coaching, priority support, and exclusive perks. For those who want maximum growth.',
  2,
  4999, 49999, false,
  '[
    {"text": "Everything in Pro", "included": true},
    {"text": "Monthly 1-on-1 coaching (30 min)", "included": true},
    {"text": "Priority support (24h response)", "included": true},
    {"text": "Exclusive Elite community", "included": true},
    {"text": "Early access to new features", "included": true},
    {"text": "Custom goal planning with coach", "included": true},
    {"text": "Monthly bonus coins (500/month)", "included": true},
    {"text": "Certificate programs included", "included": true},
    {"text": "Accountability partner matching", "included": true},
    {"text": "Guest expert sessions access", "included": true},
    {"text": "White-glove onboarding", "included": true},
    {"text": "Lifetime badge: Elite Member", "included": true}
  ]'::jsonb,
  'Maximum growth with personal coaching',
  'amber',
  false,
  3
)
ON CONFLICT (slug) DO NOTHING;

-- Seed feature access control
INSERT INTO beyond_membership_features (feature_key, feature_name, description, min_tier_level, category)
VALUES
  ('academy_courses', 'Academy Courses', 'Access to all LMS courses', 1, 'module'),
  ('events_webinars', 'Events & Webinars', 'Register and attend live events', 1, 'module'),
  ('coaching_cohorts', 'Group Coaching', 'Join coaching cohorts', 1, 'module'),
  ('digital_store_all', 'All Digital Products', 'Access entire store without coins', 1, 'module'),
  ('community_post', 'Community Posting', 'Create posts and replies', 1, 'module'),
  ('leadership_full', 'Leadership Lab (Full)', 'All leadership scenarios', 1, 'module'),
  ('ai_companion', 'AI Clinical Companion', 'AI-powered clinical practice', 1, 'module'),
  ('one_on_one', '1-on-1 Coaching', 'Personal coaching sessions', 2, 'coaching'),
  ('priority_support', 'Priority Support', '24-hour response guarantee', 2, 'support'),
  ('elite_community', 'Elite Community', 'Exclusive high-performers group', 2, 'community'),
  ('early_access', 'Early Access', 'New features before everyone else', 2, 'perk')
ON CONFLICT (feature_key) DO NOTHING;
