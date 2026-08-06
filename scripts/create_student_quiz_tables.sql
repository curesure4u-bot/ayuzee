-- ═══════════════════════════════════════════════════════════
-- Student Quiz Progress & Gamification Tables
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════

-- 1. Student Quiz Progress (main gamification table)
CREATE TABLE IF NOT EXISTS student_quiz_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  xp INTEGER DEFAULT 0 NOT NULL,
  coins INTEGER DEFAULT 0 NOT NULL,
  streak INTEGER DEFAULT 0 NOT NULL,
  best_streak INTEGER DEFAULT 0 NOT NULL,
  last_quiz_date DATE,
  quizzes_completed INTEGER DEFAULT 0 NOT NULL,
  correct_answers INTEGER DEFAULT 0 NOT NULL,
  total_answers INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE student_quiz_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can read/write their own progress
CREATE POLICY "Users can view own progress"
  ON student_quiz_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON student_quiz_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON student_quiz_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- 2. Coin Transactions (audit trail for coin earn/spend)
CREATE TABLE IF NOT EXISTS student_coin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- positive = earn, negative = spend
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE student_coin_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON student_coin_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON student_coin_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. Index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_student_quiz_progress_xp
  ON student_quiz_progress(xp DESC);

CREATE INDEX IF NOT EXISTS idx_student_quiz_progress_streak
  ON student_quiz_progress(streak DESC);

-- 4. View for leaderboard (top students with profile info)
CREATE OR REPLACE VIEW student_leaderboard AS
SELECT
  sqp.user_id,
  sqp.xp,
  sqp.coins,
  sqp.streak,
  sqp.best_streak,
  sqp.quizzes_completed,
  sqp.correct_answers,
  sqp.total_answers,
  sp.full_name,
  sp.college_name
FROM student_quiz_progress sqp
LEFT JOIN student_profiles sp ON sp.user_id = sqp.user_id
ORDER BY sqp.xp DESC;

-- Done! Tables created successfully.
-- The app will auto-create a row when a student takes their first quiz.
