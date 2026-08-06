-- ═══════════════════════════════════════════════════════════
-- College Chapters — Discussion Forums per College
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════

-- 1. College Chapters (one per college)
CREATE TABLE IF NOT EXISTS college_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_name TEXT NOT NULL UNIQUE,
  description TEXT,
  state TEXT,
  course TEXT DEFAULT 'BAMS',
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_count INTEGER DEFAULT 1 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE college_chapters ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view chapters
CREATE POLICY "Authenticated users can view chapters"
  ON college_chapters FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Any authenticated user can create a chapter
CREATE POLICY "Authenticated users can create chapters"
  ON college_chapters FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Only creator can update chapter info
CREATE POLICY "Creator can update chapter"
  ON college_chapters FOR UPDATE
  USING (auth.uid() = created_by);

-- 2. Chapter Members (tracks who joined which chapter)
CREATE TABLE IF NOT EXISTS chapter_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID NOT NULL REFERENCES college_chapters(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(chapter_id, user_id)
);

ALTER TABLE chapter_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view members"
  ON chapter_members FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can join chapters"
  ON chapter_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave chapters"
  ON chapter_members FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Chapter Posts (discussion threads)
CREATE TABLE IF NOT EXISTS chapter_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID NOT NULL REFERENCES college_chapters(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  reply_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE chapter_posts ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view posts
CREATE POLICY "Authenticated users can view posts"
  ON chapter_posts FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Members can create posts (simplified: any auth user for now)
CREATE POLICY "Authenticated users can create posts"
  ON chapter_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Authors can update own posts
CREATE POLICY "Authors can update own posts"
  ON chapter_posts FOR UPDATE
  USING (auth.uid() = user_id);

-- Authors can delete own posts
CREATE POLICY "Authors can delete own posts"
  ON chapter_posts FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Chapter Replies (comments on posts)
CREATE TABLE IF NOT EXISTS chapter_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES chapter_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE chapter_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view replies"
  ON chapter_replies FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create replies"
  ON chapter_replies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authors can delete own replies"
  ON chapter_replies FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chapter_members_chapter
  ON chapter_members(chapter_id);

CREATE INDEX IF NOT EXISTS idx_chapter_members_user
  ON chapter_members(user_id);

CREATE INDEX IF NOT EXISTS idx_chapter_posts_chapter
  ON chapter_posts(chapter_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chapter_replies_post
  ON chapter_replies(post_id, created_at ASC);

-- 6. Function to auto-increment member_count on join
CREATE OR REPLACE FUNCTION increment_chapter_member_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE college_chapters SET member_count = member_count + 1, updated_at = NOW()
  WHERE id = NEW.chapter_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_chapter_member_join
  AFTER INSERT ON chapter_members
  FOR EACH ROW EXECUTE FUNCTION increment_chapter_member_count();

-- 7. Function to auto-decrement member_count on leave
CREATE OR REPLACE FUNCTION decrement_chapter_member_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE college_chapters SET member_count = GREATEST(member_count - 1, 0), updated_at = NOW()
  WHERE id = OLD.chapter_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_chapter_member_leave
  AFTER DELETE ON chapter_members
  FOR EACH ROW EXECUTE FUNCTION decrement_chapter_member_count();

-- 8. Function to auto-increment reply_count
CREATE OR REPLACE FUNCTION increment_post_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chapter_posts SET reply_count = reply_count + 1, updated_at = NOW()
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_chapter_reply_created
  AFTER INSERT ON chapter_replies
  FOR EACH ROW EXECUTE FUNCTION increment_post_reply_count();

-- Done! College Chapters tables created successfully.
-- Students can now create/join chapters, post discussions, and reply.
