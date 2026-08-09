-- ═══════════════════════════════════════════════════════════
-- BEYOND.PRAXIS — Module 17: Community
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL DEFAULT 'Anonymous',
  type TEXT NOT NULL DEFAULT 'discussion' CHECK (type IN (
    'discussion', 'question', 'win', 'resource', 'accountability'
  )),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  upvotes INTEGER NOT NULL DEFAULT 0,
  reply_count INTEGER NOT NULL DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE beyond_community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view posts" ON beyond_community_posts FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can create posts" ON beyond_community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON beyond_community_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON beyond_community_posts FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS beyond_community_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES beyond_community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL DEFAULT 'Anonymous',
  content TEXT NOT NULL,
  upvotes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE beyond_community_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view replies" ON beyond_community_replies FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can create replies" ON beyond_community_replies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own replies" ON beyond_community_replies FOR DELETE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════
-- DONE! ✅ beyond_community_posts + beyond_community_replies
-- ═══════════════════════════════════════════════════════════
