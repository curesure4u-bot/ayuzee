-- ═══════════════════════════════════════════════════════════════════════════════
-- Micro-Features Tables — Doctor Follow System + Volume Discount Slabs
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 1. DOCTOR FOLLOW / CONNECT SYSTEM (Social Graph)                            │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS doctor_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

ALTER TABLE doctor_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own follows"
  ON doctor_follows FOR SELECT
  USING (auth.uid() = follower_id OR auth.uid() = following_id);

CREATE POLICY "Users can follow doctors"
  ON doctor_follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON doctor_follows FOR DELETE
  USING (auth.uid() = follower_id);

CREATE INDEX IF NOT EXISTS idx_doctor_follows_follower ON doctor_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_doctor_follows_following ON doctor_follows(following_id);

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 2. VOLUME DISCOUNT SLABS (Doctor Ordering Margins)                          │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS volume_discount_slabs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slab_name TEXT NOT NULL,
  min_order_value INTEGER NOT NULL DEFAULT 0,
  max_order_value INTEGER,
  margin_percentage DECIMAL(5,2) NOT NULL DEFAULT 10.0,
  bonus_reward_points INTEGER DEFAULT 0,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE volume_discount_slabs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view slabs"
  ON volume_discount_slabs FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = true);

CREATE INDEX IF NOT EXISTS idx_volume_discount_slabs_active ON volume_discount_slabs(is_active, sort_order);

-- Seed default slabs (NirogStreet-style tiered margins)
INSERT INTO volume_discount_slabs (slab_name, min_order_value, max_order_value, margin_percentage, bonus_reward_points, description, sort_order)
VALUES
  ('Starter', 0, 2999, 10.00, 0, 'Base margin on all orders', 1),
  ('Silver', 3000, 6999, 12.50, 50, 'Orders ₹3,000 – ₹6,999', 2),
  ('Gold', 7000, 14999, 15.00, 150, 'Orders ₹7,000 – ₹14,999', 3),
  ('Platinum', 15000, 29999, 18.00, 400, 'Orders ₹15,000 – ₹29,999', 4),
  ('Diamond', 30000, NULL, 22.00, 1000, 'Orders ₹30,000+', 5)
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════
-- Done! Doctor Follows + Volume Discount Slabs created.
-- ═══════════════════════════════════════════════════════════
