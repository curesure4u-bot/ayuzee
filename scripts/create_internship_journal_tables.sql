-- ═══════════════════════════════════════════════════════════
-- Internship Journal — Digital log of clinical postings
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════

-- 1. Internship Journal Entries
CREATE TABLE IF NOT EXISTS internship_journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  posting_date DATE NOT NULL DEFAULT CURRENT_DATE,
  department TEXT NOT NULL,
  hospital_name TEXT,
  supervisor_name TEXT,
  cases_seen INTEGER DEFAULT 0,
  procedures_performed TEXT[] DEFAULT '{}',
  diagnosis_observed TEXT[] DEFAULT '{}',
  learnings TEXT NOT NULL,
  challenges TEXT,
  supervisor_feedback TEXT,
  hours_spent NUMERIC(4,1) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE internship_journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own journal entries"
  ON internship_journal_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own entries"
  ON internship_journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries"
  ON internship_journal_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries"
  ON internship_journal_entries FOR DELETE
  USING (auth.uid() = user_id);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_internship_journal_user_date
  ON internship_journal_entries(user_id, posting_date DESC);

CREATE INDEX IF NOT EXISTS idx_internship_journal_department
  ON internship_journal_entries(user_id, department);

-- Done! Internship Journal table created.
-- Students can log daily clinical postings with departments, procedures, and learnings.
