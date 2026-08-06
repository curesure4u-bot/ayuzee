-- ═══════════════════════════════════════════════════════════
-- Ask a Vaidya — Students ask practicing doctors questions
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════

-- 1. Vaidya Questions (asked by students)
CREATE TABLE IF NOT EXISTS vaidya_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT 'General',
  tags TEXT[] DEFAULT '{}',
  is_resolved BOOLEAN DEFAULT false,
  answer_count INTEGER DEFAULT 0,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vaidya_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view questions"
  ON vaidya_questions FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create questions"
  ON vaidya_questions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authors can update own questions"
  ON vaidya_questions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Authors can delete own questions"
  ON vaidya_questions FOR DELETE
  USING (auth.uid() = user_id);

-- 2. Vaidya Answers (from doctors or senior students)
CREATE TABLE IF NOT EXISTS vaidya_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES vaidya_questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_accepted BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vaidya_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view answers"
  ON vaidya_answers FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create answers"
  ON vaidya_answers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authors can update own answers"
  ON vaidya_answers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Authors can delete own answers"
  ON vaidya_answers FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Question Upvotes (track who upvoted)
CREATE TABLE IF NOT EXISTS vaidya_question_upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES vaidya_questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(question_id, user_id)
);

ALTER TABLE vaidya_question_upvotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view upvotes"
  ON vaidya_question_upvotes FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can upvote"
  ON vaidya_question_upvotes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove upvote"
  ON vaidya_question_upvotes FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_vaidya_questions_subject
  ON vaidya_questions(subject, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_vaidya_questions_resolved
  ON vaidya_questions(is_resolved, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_vaidya_answers_question
  ON vaidya_answers(question_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_vaidya_upvotes_question
  ON vaidya_question_upvotes(question_id);

-- 5. Trigger: auto-increment answer_count
CREATE OR REPLACE FUNCTION increment_vaidya_answer_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE vaidya_questions SET answer_count = answer_count + 1, updated_at = NOW()
  WHERE id = NEW.question_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_vaidya_answer_created
  AFTER INSERT ON vaidya_answers
  FOR EACH ROW EXECUTE FUNCTION increment_vaidya_answer_count();

-- 6. Trigger: auto-increment/decrement upvotes
CREATE OR REPLACE FUNCTION increment_vaidya_question_upvotes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE vaidya_questions SET upvotes = upvotes + 1 WHERE id = NEW.question_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_vaidya_question_upvoted
  AFTER INSERT ON vaidya_question_upvotes
  FOR EACH ROW EXECUTE FUNCTION increment_vaidya_question_upvotes();

CREATE OR REPLACE FUNCTION decrement_vaidya_question_upvotes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE vaidya_questions SET upvotes = GREATEST(upvotes - 1, 0) WHERE id = OLD.question_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_vaidya_question_unupvoted
  AFTER DELETE ON vaidya_question_upvotes
  FOR EACH ROW EXECUTE FUNCTION decrement_vaidya_question_upvotes();

-- Done! Ask a Vaidya tables created.
