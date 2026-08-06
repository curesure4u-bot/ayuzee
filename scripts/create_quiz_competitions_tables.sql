-- ═══════════════════════════════════════════════════════════
-- Inter-College Quiz Competitions
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════

-- 1. Quiz Competitions (each competition is a timed event between colleges)
CREATE TABLE IF NOT EXISTS quiz_competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL DEFAULT 'General',
  difficulty TEXT NOT NULL DEFAULT 'Medium' CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  time_limit_seconds INTEGER NOT NULL DEFAULT 600,
  max_participants INTEGER DEFAULT 100,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE quiz_competitions ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view competitions
CREATE POLICY "Authenticated users can view competitions"
  ON quiz_competitions FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Admins/creators can create competitions
CREATE POLICY "Authenticated users can create competitions"
  ON quiz_competitions FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Creator can update
CREATE POLICY "Creator can update competition"
  ON quiz_competitions FOR UPDATE
  USING (auth.uid() = created_by);

-- 2. Competition Participants (students who join a competition)
CREATE TABLE IF NOT EXISTS competition_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES quiz_competitions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  college_name TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(competition_id, user_id)
);

ALTER TABLE competition_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view participants"
  ON competition_participants FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can join competitions"
  ON competition_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave competitions"
  ON competition_participants FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Competition Scores (submitted after completing the quiz)
CREATE TABLE IF NOT EXISTS competition_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES quiz_competitions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  college_name TEXT,
  score INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  time_taken_seconds INTEGER NOT NULL DEFAULT 0,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(competition_id, user_id)
);

ALTER TABLE competition_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view scores"
  ON competition_scores FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can submit own scores"
  ON competition_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_competitions_status
  ON quiz_competitions(status, starts_at DESC);

CREATE INDEX IF NOT EXISTS idx_competition_participants_comp
  ON competition_participants(competition_id);

CREATE INDEX IF NOT EXISTS idx_competition_participants_user
  ON competition_participants(user_id);

CREATE INDEX IF NOT EXISTS idx_competition_scores_comp
  ON competition_scores(competition_id, score DESC);

CREATE INDEX IF NOT EXISTS idx_competition_scores_college
  ON competition_scores(competition_id, college_name, score DESC);

-- 5. View: College Leaderboard (aggregated scores per college per competition)
CREATE OR REPLACE VIEW competition_college_leaderboard AS
SELECT
  competition_id,
  college_name,
  COUNT(*) AS participants,
  SUM(score) AS total_score,
  AVG(score)::INTEGER AS avg_score,
  MAX(score) AS top_score,
  SUM(correct_answers) AS total_correct,
  SUM(total_questions) AS total_attempted
FROM competition_scores
WHERE college_name IS NOT NULL
GROUP BY competition_id, college_name
ORDER BY total_score DESC;

-- Done! Inter-College Quiz Competition tables ready.
-- Questions are stored as JSONB array in quiz_competitions.questions:
-- [{ "id": 1, "question": "...", "options": ["A","B","C","D"], "correct": 0 }, ...]
