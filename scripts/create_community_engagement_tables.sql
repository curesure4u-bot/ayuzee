-- ═══════════════════════════════════════════════════════════════════════════════
-- Community Engagement Features — Polls, Online Status, @Mentions
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 1. ADD POLL FIELDS TO feed_posts TABLE (if not already present)              │
-- └─────────────────────────────────────────────────────────────────────────────┘

-- These columns are included in create_feed_posts_table.sql already.
-- If you ran that script first, these will safely do nothing (IF NOT EXISTS).
ALTER TABLE feed_posts ADD COLUMN IF NOT EXISTS poll_options JSONB DEFAULT NULL;
ALTER TABLE feed_posts ADD COLUMN IF NOT EXISTS poll_expires_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE feed_posts ADD COLUMN IF NOT EXISTS author_specialization TEXT DEFAULT NULL;
ALTER TABLE feed_posts ADD COLUMN IF NOT EXISTS mentions TEXT[] DEFAULT '{}';
ALTER TABLE feed_posts ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';

-- Poll votes table
CREATE TABLE IF NOT EXISTS feed_poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  option_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE feed_poll_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view poll votes"
  ON feed_poll_votes FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can vote"
  ON feed_poll_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can change vote"
  ON feed_poll_votes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can remove vote"
  ON feed_poll_votes FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_feed_poll_votes_post ON feed_poll_votes(post_id);
CREATE INDEX IF NOT EXISTS idx_feed_poll_votes_user ON feed_poll_votes(user_id);

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 2. DOCTOR ONLINE STATUS / PRESENCE TABLE                                    │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS doctor_online_status (
  doctor_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT false,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  status_text TEXT DEFAULT 'Available',
  accepting_referrals BOOLEAN DEFAULT true,
  accepting_consultations BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE doctor_online_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view doctor online status"
  ON doctor_online_status FOR SELECT
  USING (true);

CREATE POLICY "Doctors can update own status"
  ON doctor_online_status FOR INSERT
  WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctors can modify own status"
  ON doctor_online_status FOR UPDATE
  USING (auth.uid() = doctor_id);

CREATE INDEX IF NOT EXISTS idx_doctor_online_status_active ON doctor_online_status(is_online, last_active_at DESC);

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 3. FEED MENTIONS TABLE (for @mention notifications)                         │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS feed_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
  mentioned_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mentioned_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE feed_mentions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own mentions"
  ON feed_mentions FOR SELECT
  USING (auth.uid() = mentioned_user_id OR auth.uid() = mentioned_by);

CREATE POLICY "Users can create mentions"
  ON feed_mentions FOR INSERT
  WITH CHECK (auth.uid() = mentioned_by);

CREATE POLICY "Users can mark own mentions read"
  ON feed_mentions FOR UPDATE
  USING (auth.uid() = mentioned_user_id);

CREATE INDEX IF NOT EXISTS idx_feed_mentions_user ON feed_mentions(mentioned_user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_feed_mentions_post ON feed_mentions(post_id);

-- ═══════════════════════════════════════════════════════════
-- Done! Community engagement tables created.
-- ═══════════════════════════════════════════════════════════
