-- ═══════════════════════════════════════════════════════════
-- BEYOND.PRAXIS — Module 10: Habit Tracker
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════

-- User-defined habits
CREATE TABLE IF NOT EXISTS beyond_habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'wellness' CHECK (category IN (
    'wellness', 'productivity', 'learning', 'finance', 'relationships', 'clinical'
  )),
  frequency TEXT NOT NULL DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekdays', 'weekly')),
  reminder_time TIME,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE beyond_habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own habits" ON beyond_habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create habits" ON beyond_habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update habits" ON beyond_habits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete habits" ON beyond_habits FOR DELETE USING (auth.uid() = user_id);

-- Daily check-ins
CREATE TABLE IF NOT EXISTS beyond_habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES beyond_habits(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, habit_id, date)
);

ALTER TABLE beyond_habit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own logs" ON beyond_habit_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create logs" ON beyond_habit_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete logs" ON beyond_habit_logs FOR DELETE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════
-- DONE! ✅ beyond_habits + beyond_habit_logs
-- ═══════════════════════════════════════════════════════════
