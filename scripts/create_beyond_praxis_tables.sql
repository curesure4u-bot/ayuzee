-- ═══════════════════════════════════════════════════════════
-- BEYOND.PRAXIS — Module 1: Wheel of Life + Gamification Core
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════
-- SECTION 1: USER PROFILES (Beyond Praxis Extension)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  career_stage TEXT NOT NULL DEFAULT 'student' 
    CHECK (career_stage IN ('student', 'intern', 'resident', 'consultant', 'senior_doctor', 'academic')),
  specialty TEXT,
  institution TEXT,
  city TEXT,
  years_experience INTEGER DEFAULT 0,
  interests TEXT[] DEFAULT '{}',
  goals TEXT[] DEFAULT '{}',
  avatar_url TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE beyond_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON beyond_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own profile"
  ON beyond_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON beyond_profiles FOR UPDATE
  USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════
-- SECTION 2: WHEEL OF LIFE
-- ═══════════════════════════════════════════════════════════

-- 2a. Wheel Assessments (monthly self-scoring)
CREATE TABLE IF NOT EXISTS beyond_wheel_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clinical_score INTEGER NOT NULL CHECK (clinical_score BETWEEN 1 AND 10),
  finance_score INTEGER NOT NULL CHECK (finance_score BETWEEN 1 AND 10),
  time_score INTEGER NOT NULL CHECK (time_score BETWEEN 1 AND 10),
  leadership_score INTEGER NOT NULL CHECK (leadership_score BETWEEN 1 AND 10),
  relationships_score INTEGER NOT NULL CHECK (relationships_score BETWEEN 1 AND 10),
  family_score INTEGER NOT NULL CHECK (family_score BETWEEN 1 AND 10),
  wellness_score INTEGER NOT NULL CHECK (wellness_score BETWEEN 1 AND 10),
  joy_score INTEGER NOT NULL CHECK (joy_score BETWEEN 1 AND 10),
  total_score NUMERIC(4,1) GENERATED ALWAYS AS (
    (clinical_score + finance_score + time_score + leadership_score +
     relationships_score + family_score + wellness_score + joy_score) / 8.0
  ) STORED,
  notes TEXT,
  assessed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE beyond_wheel_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own assessments"
  ON beyond_wheel_assessments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own assessments"
  ON beyond_wheel_assessments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own assessments"
  ON beyond_wheel_assessments FOR DELETE
  USING (auth.uid() = user_id);

-- 2b. Wheel Goals (per-spoke goals)
CREATE TABLE IF NOT EXISTS beyond_wheel_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  spoke TEXT NOT NULL CHECK (spoke IN (
    'clinical', 'finance', 'time', 'leadership',
    'relationships', 'family', 'wellness', 'joy'
  )),
  goal_text TEXT NOT NULL,
  current_score INTEGER DEFAULT 1 CHECK (current_score BETWEEN 1 AND 10),
  target_score INTEGER NOT NULL CHECK (target_score BETWEEN 1 AND 10),
  deadline DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE beyond_wheel_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wheel goals"
  ON beyond_wheel_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own wheel goals"
  ON beyond_wheel_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wheel goals"
  ON beyond_wheel_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wheel goals"
  ON beyond_wheel_goals FOR DELETE
  USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════
-- SECTION 3: GAMIFICATION — XP & LEVELS
-- ═══════════════════════════════════════════════════════════

-- 3a. User XP & Level tracker
CREATE TABLE IF NOT EXISTS beyond_user_xp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  current_level INTEGER NOT NULL DEFAULT 1,
  level_title TEXT NOT NULL DEFAULT 'Intern',
  xp_to_next_level INTEGER NOT NULL DEFAULT 500,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE beyond_user_xp ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own xp"
  ON beyond_user_xp FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own xp"
  ON beyond_user_xp FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own xp"
  ON beyond_user_xp FOR UPDATE
  USING (auth.uid() = user_id);

-- 3b. XP Transaction Log (audit trail)
CREATE TABLE IF NOT EXISTS beyond_xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  source TEXT NOT NULL,
  source_id UUID,
  description TEXT,
  earned_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE beyond_xp_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own xp transactions"
  ON beyond_xp_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own xp transactions"
  ON beyond_xp_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════
-- SECTION 4: GAMIFICATION — STREAKS
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  streak_type TEXT NOT NULL CHECK (streak_type IN (
    'daily_login', 'learning', 'wellness', 'planning',
    'reading', 'reflection', 'finance'
  )),
  current_count INTEGER NOT NULL DEFAULT 0,
  longest_count INTEGER NOT NULL DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  freeze_tokens_remaining INTEGER NOT NULL DEFAULT 2,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, streak_type)
);

ALTER TABLE beyond_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streaks"
  ON beyond_streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own streaks"
  ON beyond_streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks"
  ON beyond_streaks FOR UPDATE
  USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════
-- SECTION 5: GAMIFICATION — BADGES
-- ═══════════════════════════════════════════════════════════

-- 5a. Badge Catalog (all available badges)
CREATE TABLE IF NOT EXISTS beyond_badges_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('starter', 'growth', 'mastery', 'hidden')),
  icon_name TEXT NOT NULL DEFAULT 'award',
  rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  criteria JSONB NOT NULL DEFAULT '{}',
  xp_reward INTEGER NOT NULL DEFAULT 0,
  coin_reward INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE beyond_badges_catalog ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can view badge catalog
CREATE POLICY "Authenticated users can view badge catalog"
  ON beyond_badges_catalog FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 5b. User Earned Badges
CREATE TABLE IF NOT EXISTS beyond_user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES beyond_badges_catalog(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  is_displayed BOOLEAN DEFAULT true,
  UNIQUE(user_id, badge_id)
);

ALTER TABLE beyond_user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own badges"
  ON beyond_user_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can earn badges"
  ON beyond_user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can toggle badge display"
  ON beyond_user_badges FOR UPDATE
  USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════
-- SECTION 6: GAMIFICATION — COINS & STORE
-- ═══════════════════════════════════════════════════════════

-- 6a. Coin Balance
CREATE TABLE IF NOT EXISTS beyond_coin_balance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  lifetime_earned INTEGER NOT NULL DEFAULT 0,
  lifetime_spent INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE beyond_coin_balance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own coin balance"
  ON beyond_coin_balance FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own coin balance"
  ON beyond_coin_balance FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own coin balance"
  ON beyond_coin_balance FOR UPDATE
  USING (auth.uid() = user_id);

-- 6b. Coin Transactions
CREATE TABLE IF NOT EXISTS beyond_coin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earn', 'spend')),
  source TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE beyond_coin_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own coin transactions"
  ON beyond_coin_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own coin transactions"
  ON beyond_coin_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════
-- SECTION 7: GAMIFICATION — LEADERBOARD
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_leaderboard_weekly (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  xp_this_week INTEGER NOT NULL DEFAULT 0,
  rank INTEGER,
  specialty TEXT,
  institution TEXT,
  week_start DATE NOT NULL DEFAULT (date_trunc('week', CURRENT_DATE))::DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

ALTER TABLE beyond_leaderboard_weekly ENABLE ROW LEVEL SECURITY;

-- Everyone can see leaderboard
CREATE POLICY "Authenticated users can view leaderboard"
  ON beyond_leaderboard_weekly FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create own leaderboard entry"
  ON beyond_leaderboard_weekly FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leaderboard entry"
  ON beyond_leaderboard_weekly FOR UPDATE
  USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════
-- SECTION 8: CHALLENGES (Daily/Weekly/Monthly)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('daily', 'weekly', 'monthly')),
  category TEXT NOT NULL DEFAULT 'general',
  criteria JSONB NOT NULL DEFAULT '{}',
  xp_reward INTEGER NOT NULL DEFAULT 50,
  coin_reward INTEGER NOT NULL DEFAULT 10,
  badge_reward_id UUID REFERENCES beyond_badges_catalog(id),
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE beyond_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view challenges"
  ON beyond_challenges FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- User challenge progress
CREATE TABLE IF NOT EXISTS beyond_user_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES beyond_challenges(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed')),
  progress_pct INTEGER NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, challenge_id)
);

ALTER TABLE beyond_user_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own challenges"
  ON beyond_user_challenges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can join challenges"
  ON beyond_user_challenges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenge progress"
  ON beyond_user_challenges FOR UPDATE
  USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════
-- SECTION 9: NOTIFICATIONS
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'streak_risk', 'badge_earned', 'level_up', 'challenge_complete',
    'wheel_reminder', 'nudge', 'social', 'system'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE beyond_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON beyond_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own notifications"
  ON beyond_notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can mark own notifications read"
  ON beyond_notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON beyond_notifications FOR DELETE
  USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════
-- SECTION 10: SEED DATA — Badge Catalog
-- ═══════════════════════════════════════════════════════════

INSERT INTO beyond_badges_catalog (name, description, category, icon_name, rarity, criteria, xp_reward, coin_reward) VALUES
-- Starter Badges
('First Steps', 'Complete your onboarding', 'starter', 'footprints', 'common', '{"action": "onboarding_complete"}', 50, 10),
('Mirror Mirror', 'Complete your first Wheel of Life assessment', 'starter', 'target', 'common', '{"action": "wheel_assessment", "count": 1}', 100, 25),
('Time Lord', 'Create your first weekly time plan', 'starter', 'clock', 'common', '{"action": "time_plan_created", "count": 1}', 50, 10),
('Bookworm Begins', 'Add your first book to reading list', 'starter', 'book-open', 'common', '{"action": "book_added", "count": 1}', 50, 10),
('Deep Breath', 'Complete your first breathing exercise', 'starter', 'wind', 'common', '{"action": "breathing_done", "count": 1}', 30, 5),
('Penny Wise', 'Log your first financial entry', 'starter', 'coins', 'common', '{"action": "finance_logged", "count": 1}', 50, 10),
('Scribe', 'Write your first journal entry', 'starter', 'pen-tool', 'common', '{"action": "journal_written", "count": 1}', 50, 10),

-- Growth Badges
('Balanced Life', 'All Wheel of Life spokes score 6 or above', 'growth', 'circle-dot', 'rare', '{"action": "wheel_all_above", "threshold": 6}', 200, 50),
('Marathon Mind', 'Maintain a 30-day learning streak', 'growth', 'brain', 'rare', '{"action": "streak", "type": "learning", "count": 30}', 300, 75),
('Money Wise', 'Track finances for 3 months straight', 'growth', 'trending-up', 'rare', '{"action": "streak", "type": "finance", "count": 90}', 250, 60),
('Scenario Master', 'Complete 20 leadership scenarios', 'growth', 'shield', 'rare', '{"action": "leadership_scenarios", "count": 20}', 200, 50),
('Wellness Warrior', 'Maintain a 30-day wellness streak', 'growth', 'heart-pulse', 'rare', '{"action": "streak", "type": "wellness", "count": 30}', 300, 75),
('Community Builder', 'Help 10 people in community', 'growth', 'users', 'rare', '{"action": "community_help", "count": 10}', 200, 50),

-- Mastery Badges
('Praxis Pioneer', 'Complete 5 guided pathways', 'mastery', 'rocket', 'epic', '{"action": "pathways_completed", "count": 5}', 500, 150),
('Centurion', 'Maintain a 100-day streak of any type', 'mastery', 'flame', 'epic', '{"action": "streak_any", "count": 100}', 500, 200),
('Library Card', 'Read 12 books in a year', 'mastery', 'library', 'epic', '{"action": "books_read", "count": 12, "period": "year"}', 400, 100),
('Full Circle', 'Improve ALL Wheel spokes by 2+ points in 6 months', 'mastery', 'refresh-cw', 'legendary', '{"action": "wheel_improve_all", "threshold": 2, "period": "6months"}', 1000, 300),
('Renaissance Doctor', 'Use 10+ different tools actively', 'mastery', 'sparkles', 'epic', '{"action": "tools_used", "count": 10}', 400, 100),

-- Hidden Badges
('Night Owl', 'Complete a lesson after midnight', 'hidden', 'moon', 'rare', '{"action": "lesson_after_midnight"}', 100, 25),
('Early Bird', 'Complete a lesson before 5 AM', 'hidden', 'sunrise', 'rare', '{"action": "lesson_before_5am"}', 100, 25),
('Philosopher', 'Write 50 reflections', 'hidden', 'lightbulb', 'epic', '{"action": "reflections_written", "count": 50}', 300, 75),
('Comeback Kid', 'Recover from burnout score >7 to <4', 'hidden', 'trophy', 'legendary', '{"action": "burnout_recovery"}', 500, 150)
ON CONFLICT DO NOTHING;


-- ═══════════════════════════════════════════════════════════
-- SECTION 11: SEED DATA — Default Challenges
-- ═══════════════════════════════════════════════════════════

INSERT INTO beyond_challenges (title, description, type, category, criteria, xp_reward, coin_reward) VALUES
-- Daily Challenges
('Daily Reflection', 'Write one reflection or gratitude entry today', 'daily', 'wellness', '{"action": "journal_written"}', 30, 5),
('Pomodoro Power', 'Complete 3 Pomodoro sessions today', 'daily', 'time', '{"action": "pomodoro_completed", "count": 3}', 45, 10),
('Micro Learner', 'Complete 2 micro-lessons today', 'daily', 'learning', '{"action": "lesson_completed", "count": 2}', 50, 10),
('Breathe Easy', 'Do a 2-minute breathing exercise', 'daily', 'wellness', '{"action": "breathing_done"}', 20, 5),

-- Weekly Challenges
('Weekly Planner', 'Create and follow your weekly time plan', 'weekly', 'time', '{"action": "weekly_plan_created"}', 100, 25),
('Book Chapter', 'Read at least one chapter of a book this week', 'weekly', 'reading', '{"action": "reading_logged"}', 75, 20),
('Leadership Move', 'Complete 2 leadership scenarios this week', 'weekly', 'leadership', '{"action": "scenarios_completed", "count": 2}', 100, 25),
('Wheel Check', 'Review your Wheel of Life scores and set 1 goal', 'weekly', 'wheel', '{"action": "wheel_goal_set"}', 80, 20),

-- Monthly Challenges
('Pathway Progress', 'Complete at least 1 full module in your active pathway', 'monthly', 'learning', '{"action": "pathway_module_completed"}', 200, 50),
('Finance Review', 'Log all income and expenses for the month', 'monthly', 'finance', '{"action": "monthly_finance_complete"}', 150, 40),
('Balanced Growth', 'Improve at least 2 Wheel spokes by 1 point', 'monthly', 'wheel', '{"action": "wheel_improved", "spokes": 2}', 250, 75),
('Mentor Moment', 'Help at least 3 people in the community this month', 'monthly', 'social', '{"action": "community_help", "count": 3}', 200, 50)
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════
-- SECTION 12: HELPER FUNCTION — Level Calculator
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION calculate_level(total_xp INTEGER)
RETURNS TABLE(level INTEGER, title TEXT, xp_to_next INTEGER) AS $$
BEGIN
  IF total_xp < 500 THEN
    RETURN QUERY SELECT 1, 'Intern'::TEXT, 500 - total_xp;
  ELSIF total_xp < 1500 THEN
    RETURN QUERY SELECT 2, 'Junior Resident'::TEXT, 1500 - total_xp;
  ELSIF total_xp < 3500 THEN
    RETURN QUERY SELECT 3, 'Senior Resident'::TEXT, 3500 - total_xp;
  ELSIF total_xp < 7000 THEN
    RETURN QUERY SELECT 4, 'Registrar'::TEXT, 7000 - total_xp;
  ELSIF total_xp < 12000 THEN
    RETURN QUERY SELECT 5, 'Consultant'::TEXT, 12000 - total_xp;
  ELSIF total_xp < 20000 THEN
    RETURN QUERY SELECT 6, 'Associate Professor'::TEXT, 20000 - total_xp;
  ELSIF total_xp < 35000 THEN
    RETURN QUERY SELECT 7, 'Professor'::TEXT, 35000 - total_xp;
  ELSIF total_xp < 55000 THEN
    RETURN QUERY SELECT 8, 'Department Head'::TEXT, 55000 - total_xp;
  ELSIF total_xp < 80000 THEN
    RETURN QUERY SELECT 9, 'Dean'::TEXT, 80000 - total_xp;
  ELSE
    RETURN QUERY SELECT 10, 'Praxis Master'::TEXT, 0;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════
-- DONE! Tables created for:
-- ✅ Beyond Profiles
-- ✅ Wheel of Life (Assessments + Goals)
-- ✅ XP & Levels
-- ✅ Streaks
-- ✅ Badges (Catalog + User Earned)
-- ✅ Coins (Balance + Transactions)
-- ✅ Leaderboard
-- ✅ Challenges (System + User Progress)
-- ✅ Notifications
-- ✅ Seed Data (24 badges + 12 challenges)
-- ✅ Helper Functions
-- ═══════════════════════════════════════════════════════════
