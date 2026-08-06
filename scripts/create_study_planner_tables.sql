-- ═══════════════════════════════════════════════════════════
-- Study Planner & Notes — Personal notes and study session tracking
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════

-- 1. Student Notes (personal study notes per subject)
CREATE TABLE IF NOT EXISTS student_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  subject TEXT NOT NULL DEFAULT 'General',
  tags TEXT[] DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE student_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notes"
  ON student_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own notes"
  ON student_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
  ON student_notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
  ON student_notes FOR DELETE
  USING (auth.uid() = user_id);

-- 2. Student Study Sessions (track study time per subject)
CREATE TABLE IF NOT EXISTS student_study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL DEFAULT 'General',
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  notes TEXT,
  studied_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE student_study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON student_study_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions"
  ON student_study_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON student_study_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_student_notes_user
  ON student_notes(user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_student_notes_subject
  ON student_notes(user_id, subject);

CREATE INDEX IF NOT EXISTS idx_student_study_sessions_user
  ON student_study_sessions(user_id, studied_at DESC);

CREATE INDEX IF NOT EXISTS idx_student_study_sessions_subject
  ON student_study_sessions(user_id, subject, studied_at DESC);

-- Done! Study Planner tables created.
-- Students can now create notes and log study sessions per subject.
