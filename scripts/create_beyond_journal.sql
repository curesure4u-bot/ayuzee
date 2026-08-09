-- ═══════════════════════════════════════════════════════════
-- BEYOND.PRAXIS — Module 9: Reflection Journal
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'reflection' CHECK (type IN (
    'reflection', 'gratitude', 'learning', 'goal_review', 'free_write'
  )),
  prompt TEXT,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  mood_score INTEGER CHECK (mood_score BETWEEN 1 AND 5),
  related_module TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE beyond_journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own journal"
  ON beyond_journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create journal entries"
  ON beyond_journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own journal"
  ON beyond_journal_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own journal"
  ON beyond_journal_entries FOR DELETE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════
-- DONE! ✅ beyond_journal_entries (type, prompt, content, tags, mood)
-- ═══════════════════════════════════════════════════════════
