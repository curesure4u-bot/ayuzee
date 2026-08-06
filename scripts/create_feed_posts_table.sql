-- ═══════════════════════════════════════════════════════════════════════════════
-- Feed Posts Base Table — Run this BEFORE create_community_engagement_tables.sql
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Main feed posts table
CREATE TABLE IF NOT EXISTS feed_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL DEFAULT 'Anonymous',
  author_avatar_url TEXT,
  title TEXT,
  body TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  post_type TEXT NOT NULL DEFAULT 'public_post' CHECK (post_type IN ('doctor_post', 'public_post', 'patient_question', 'poll')),
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('doctor', 'public', 'patient')),
  is_published BOOLEAN DEFAULT true,
  author_specialization TEXT,
  poll_options JSONB DEFAULT NULL,
  poll_expires_at TIMESTAMPTZ DEFAULT NULL,
  mentions TEXT[] DEFAULT '{}',
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE feed_posts ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view published posts
CREATE POLICY "Anyone can view published feed posts"
  ON feed_posts FOR SELECT
  USING (is_published = true AND auth.uid() IS NOT NULL);

-- Authenticated users can create posts
CREATE POLICY "Authenticated users can create feed posts"
  ON feed_posts FOR INSERT
  WITH CHECK (auth.uid() = author_user_id);

-- Authors can update own posts
CREATE POLICY "Authors can update own feed posts"
  ON feed_posts FOR UPDATE
  USING (auth.uid() = author_user_id);

-- Authors can delete own posts
CREATE POLICY "Authors can delete own feed posts"
  ON feed_posts FOR DELETE
  USING (auth.uid() = author_user_id);

CREATE INDEX IF NOT EXISTS idx_feed_posts_type ON feed_posts(post_type, is_published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feed_posts_author ON feed_posts(author_user_id);

-- 2. Feed likes table
CREATE TABLE IF NOT EXISTS feed_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE feed_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view likes"
  ON feed_likes FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can like posts"
  ON feed_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike"
  ON feed_likes FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_feed_likes_post ON feed_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_feed_likes_user ON feed_likes(user_id);

-- 3. Feed comments table
CREATE TABLE IF NOT EXISTS feed_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL DEFAULT 'User',
  body TEXT NOT NULL,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE feed_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments"
  ON feed_comments FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create comments"
  ON feed_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON feed_comments FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_feed_comments_post ON feed_comments(post_id);

-- 4. Triggers to auto-update like/comment counts
CREATE OR REPLACE FUNCTION update_feed_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE feed_posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE feed_posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_feed_liked
  AFTER INSERT ON feed_likes
  FOR EACH ROW EXECUTE FUNCTION update_feed_like_count();

CREATE TRIGGER on_feed_unliked
  AFTER DELETE ON feed_likes
  FOR EACH ROW EXECUTE FUNCTION update_feed_like_count();

CREATE OR REPLACE FUNCTION update_feed_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE feed_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE feed_posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_feed_comment_added
  AFTER INSERT ON feed_comments
  FOR EACH ROW EXECUTE FUNCTION update_feed_comment_count();

CREATE TRIGGER on_feed_comment_removed
  AFTER DELETE ON feed_comments
  FOR EACH ROW EXECUTE FUNCTION update_feed_comment_count();

-- ═══════════════════════════════════════════════════════════
-- Done! Feed posts base tables created.
-- Now you can run create_community_engagement_tables.sql
-- ═══════════════════════════════════════════════════════════
