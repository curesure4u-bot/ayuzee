-- ═══════════════════════════════════════════════════════════
-- Study Groups — Subject-wise groups for collaborative learning
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════

-- 1. Study Groups
CREATE TABLE IF NOT EXISTS study_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT 'General',
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_count INTEGER DEFAULT 1 NOT NULL,
  is_public BOOLEAN DEFAULT true,
  max_members INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view public groups"
  ON study_groups FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_public = true);

CREATE POLICY "Authenticated users can create groups"
  ON study_groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creator can update group"
  ON study_groups FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Creator can delete group"
  ON study_groups FOR DELETE
  USING (auth.uid() = created_by);

-- 2. Study Group Members
CREATE TABLE IF NOT EXISTS study_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view group members"
  ON study_group_members FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can join groups"
  ON study_group_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups"
  ON study_group_members FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Study Group Posts (shared content within a group)
CREATE TABLE IF NOT EXISTS study_group_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  post_type TEXT NOT NULL DEFAULT 'discussion' CHECK (post_type IN ('discussion', 'resource', 'question', 'announcement')),
  resource_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE study_group_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view group posts"
  ON study_group_posts FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Members can create posts"
  ON study_group_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authors can delete own posts"
  ON study_group_posts FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_study_groups_subject
  ON study_groups(subject, member_count DESC);

CREATE INDEX IF NOT EXISTS idx_study_group_members_group
  ON study_group_members(group_id);

CREATE INDEX IF NOT EXISTS idx_study_group_members_user
  ON study_group_members(user_id);

CREATE INDEX IF NOT EXISTS idx_study_group_posts_group
  ON study_group_posts(group_id, created_at DESC);

-- 5. Triggers for member count
CREATE OR REPLACE FUNCTION increment_study_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE study_groups SET member_count = member_count + 1, updated_at = NOW()
  WHERE id = NEW.group_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_study_group_member_join
  AFTER INSERT ON study_group_members
  FOR EACH ROW EXECUTE FUNCTION increment_study_group_member_count();

CREATE OR REPLACE FUNCTION decrement_study_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE study_groups SET member_count = GREATEST(member_count - 1, 0), updated_at = NOW()
  WHERE id = OLD.group_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_study_group_member_leave
  AFTER DELETE ON study_group_members
  FOR EACH ROW EXECUTE FUNCTION decrement_study_group_member_count();

-- Done! Study Groups tables created.
