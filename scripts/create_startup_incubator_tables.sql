-- ═══════════════════════════════════════════════════════════
-- Startup Incubator — AYUSH startup ideas + mentorship
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS startup_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'HealthTech' CHECK (category IN ('HealthTech', 'EdTech', 'Wellness', 'E-Commerce', 'SaaS', 'Social Impact', 'Other')),
  stage TEXT NOT NULL DEFAULT 'idea' CHECK (stage IN ('idea', 'prototype', 'mvp', 'launched')),
  looking_for TEXT[] DEFAULT '{}',
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE startup_ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view ideas" ON startup_ideas FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can create ideas" ON startup_ideas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authors can update own ideas" ON startup_ideas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Authors can delete own ideas" ON startup_ideas FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS startup_idea_upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL REFERENCES startup_ideas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(idea_id, user_id)
);

ALTER TABLE startup_idea_upvotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view upvotes" ON startup_idea_upvotes FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can upvote" ON startup_idea_upvotes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove upvote" ON startup_idea_upvotes FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_startup_ideas_category ON startup_ideas(category, upvotes DESC);

CREATE OR REPLACE FUNCTION increment_startup_upvotes() RETURNS TRIGGER AS $$
BEGIN UPDATE startup_ideas SET upvotes = upvotes + 1 WHERE id = NEW.idea_id; RETURN NEW; END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE TRIGGER on_startup_upvoted AFTER INSERT ON startup_idea_upvotes FOR EACH ROW EXECUTE FUNCTION increment_startup_upvotes();

CREATE OR REPLACE FUNCTION decrement_startup_upvotes() RETURNS TRIGGER AS $$
BEGIN UPDATE startup_ideas SET upvotes = GREATEST(upvotes - 1, 0) WHERE id = OLD.idea_id; RETURN OLD; END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE TRIGGER on_startup_unupvoted AFTER DELETE ON startup_idea_upvotes FOR EACH ROW EXECUTE FUNCTION decrement_startup_upvotes();

-- Done!
