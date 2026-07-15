-- 🎮 Ayuzee Gamification System - Database Schema
-- Tables: user_coins, user_badges, coin_transactions, user_streaks

-- ============================================
-- 1. User Coins (Wallet balance per user)
-- ============================================
CREATE TABLE IF NOT EXISTS user_coins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('doctor', 'patient', 'student', 'therapist', 'service_provider', 'pharma', 'hms_staff')),
  total_coins INTEGER NOT NULL DEFAULT 0,
  total_points INTEGER NOT NULL DEFAULT 0,
  current_rank TEXT NOT NULL DEFAULT 'Beginner',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- ============================================
-- 2. Coin Transactions (earn/spend history)
-- ============================================
CREATE TABLE IF NOT EXISTS coin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  action TEXT NOT NULL,
  coins INTEGER NOT NULL, -- positive = earn, negative = spend
  points INTEGER NOT NULL DEFAULT 0,
  emoji TEXT DEFAULT '',
  badge_id TEXT DEFAULT NULL, -- if earned via badge unlock
  balance_after INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast user history lookup
CREATE INDEX IF NOT EXISTS idx_coin_transactions_user ON coin_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_role ON coin_transactions(role, created_at DESC);

-- ============================================
-- 3. User Badges (earned badges per user)
-- ============================================
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL, -- references gamificationConfig badge id
  role TEXT NOT NULL,
  points_awarded INTEGER NOT NULL DEFAULT 0,
  coins_awarded INTEGER NOT NULL DEFAULT 0,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_role ON user_badges(role);

-- ============================================
-- 4. User Streaks (daily activity tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  streak_type TEXT NOT NULL DEFAULT 'daily_login', -- daily_login, medicine_adherence, diet_adherence, etc.
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  streak_start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role, streak_type)
);

-- ============================================
-- 5. Shout Outs (peer recognition)
-- ============================================
CREATE TABLE IF NOT EXISTS shout_outs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_name TEXT NOT NULL,
  from_role TEXT NOT NULL,
  to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_name TEXT NOT NULL,
  to_role TEXT NOT NULL,
  message TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '🌟',
  coins_awarded INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shout_outs_to ON shout_outs(to_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shout_outs_from ON shout_outs(from_user_id, created_at DESC);

-- ============================================
-- 6. Shout Out Reactions
-- ============================================
CREATE TABLE IF NOT EXISTS shout_out_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shout_out_id UUID NOT NULL REFERENCES shout_outs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(shout_out_id, user_id, emoji)
);

-- ============================================
-- 7. Leaderboard View (materialized for performance)
-- ============================================
CREATE OR REPLACE VIEW gamification_leaderboard AS
SELECT 
  uc.user_id,
  uc.role,
  uc.total_points,
  uc.total_coins,
  uc.current_rank,
  (SELECT COUNT(*) FROM user_badges ub WHERE ub.user_id = uc.user_id) AS badge_count,
  COALESCE((SELECT us.current_streak FROM user_streaks us WHERE us.user_id = uc.user_id AND us.streak_type = 'daily_login' LIMIT 1), 0) AS login_streak,
  uc.updated_at
FROM user_coins uc
ORDER BY uc.total_points DESC;

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE user_coins ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE shout_outs ENABLE ROW LEVEL SECURITY;
ALTER TABLE shout_out_reactions ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users read own coins" ON user_coins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users read own transactions" ON coin_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users read own badges" ON user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users read own streaks" ON user_streaks FOR SELECT USING (auth.uid() = user_id);

-- Shout outs are public (everyone can read)
CREATE POLICY "Anyone can read shout outs" ON shout_outs FOR SELECT USING (true);
CREATE POLICY "Users create shout outs" ON shout_outs FOR INSERT WITH CHECK (auth.uid() = from_user_id);

-- Leaderboard is public
-- (view doesn't need RLS)

-- Service role can insert/update everything (for Edge Functions)
CREATE POLICY "Service role manages coins" ON user_coins FOR ALL USING (true);
CREATE POLICY "Service role manages transactions" ON coin_transactions FOR ALL USING (true);
CREATE POLICY "Service role manages badges" ON user_badges FOR ALL USING (true);
CREATE POLICY "Service role manages streaks" ON user_streaks FOR ALL USING (true);
