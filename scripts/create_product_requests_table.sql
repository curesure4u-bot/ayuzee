-- ═══════════════════════════════════════════════════════════════════════════════
-- Product Requests Table — "Can't find your medicine?" feature
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS product_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  brand TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sourcing', 'available', 'not_available', 'fulfilled')),
  admin_notes TEXT,
  fulfilled_product_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE product_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own requests"
  ON product_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can submit requests"
  ON product_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update"
  ON product_requests FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_product_requests_status ON product_requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_requests_user ON product_requests(user_id);

-- ═══════════════════════════════════════════════════════════
-- Done! Product requests table created.
-- ═══════════════════════════════════════════════════════════
