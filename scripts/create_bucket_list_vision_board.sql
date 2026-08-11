-- ╔══════════════════════════════════════════════════════════════════╗
-- ║  Beyond Praxis — Bucket List & Vision Board Tables              ║
-- ║  Run this in Supabase SQL Editor                                ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- ════════════════════════════════════════════════════════════
-- 1. BUCKET LIST ITEMS (101 personal dreams)
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_bucket_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_number INTEGER NOT NULL CHECK (item_number >= 1 AND item_number <= 101),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'personal',
  target_date DATE,
  image_url TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  -- SAG: Self Appreciation Gift
  sag_planned TEXT, -- "When I achieve this, I'll reward myself with..."
  sag_claimed BOOLEAN NOT NULL DEFAULT FALSE,
  sag_claimed_at TIMESTAMPTZ,
  -- Celebration
  celebration_note TEXT, -- What the user felt when completing
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_number)
);

-- RLS
ALTER TABLE beyond_bucket_list_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own bucket list items"
  ON beyond_bucket_list_items
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_bucket_list_user ON beyond_bucket_list_items(user_id);
CREATE INDEX IF NOT EXISTS idx_bucket_list_category ON beyond_bucket_list_items(user_id, category);

-- ════════════════════════════════════════════════════════════
-- 2. VISION BOARD ITEMS (Short-term & Long-term)
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_vision_board_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  -- Vision type: 'short_term' (3-6 months) or 'long_term' (1-5 years)
  vision_type TEXT NOT NULL CHECK (vision_type IN ('short_term', 'long_term')),
  category TEXT NOT NULL DEFAULT 'personal',
  image_url TEXT,
  -- Dates & accountability
  target_date DATE,
  accountability_partner TEXT, -- Name or contact of accountability partner
  -- Milestones (for long-term visions)
  milestones JSONB DEFAULT '[]'::jsonb,
  -- SAG: Self Appreciation Gift
  sag_planned TEXT,
  sag_claimed BOOLEAN NOT NULL DEFAULT FALSE,
  sag_claimed_at TIMESTAMPTZ,
  -- Completion
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  celebration_note TEXT,
  -- Ordering & display
  display_order INTEGER NOT NULL DEFAULT 0,
  color TEXT DEFAULT 'from-violet-100 to-indigo-100 border-violet-200',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE beyond_vision_board_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own vision board items"
  ON beyond_vision_board_items
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vision_board_user ON beyond_vision_board_items(user_id);
CREATE INDEX IF NOT EXISTS idx_vision_board_type ON beyond_vision_board_items(user_id, vision_type);

-- ════════════════════════════════════════════════════════════
-- 3. CELEBRATION LOG (tracks all celebrations across features)
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_celebration_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('bucket_list', 'vision_short', 'vision_long')),
  source_id UUID NOT NULL,
  title TEXT NOT NULL,
  sag_description TEXT,
  celebration_note TEXT,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  celebrated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE beyond_celebration_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own celebrations"
  ON beyond_celebration_log
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_celebration_log_user ON beyond_celebration_log(user_id);

-- ════════════════════════════════════════════════════════════
-- Done! Tables created with RLS policies.
-- ════════════════════════════════════════════════════════════
