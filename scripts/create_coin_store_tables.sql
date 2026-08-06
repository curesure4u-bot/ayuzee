-- ═══════════════════════════════════════════════════════════
-- Coin Redemption Store — Students spend earned coins on rewards
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════

-- 1. Store Items (rewards available for redemption)
CREATE TABLE IF NOT EXISTS coin_store_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'General' CHECK (category IN ('Voucher', 'Course', 'Merchandise', 'Certificate', 'Feature', 'General')),
  coin_price INTEGER NOT NULL CHECK (coin_price > 0),
  stock INTEGER DEFAULT -1, -- -1 means unlimited
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  redemption_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE coin_store_items ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view active items
CREATE POLICY "Authenticated users can view active store items"
  ON coin_store_items FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = true);

-- 2. Coin Redemptions (log of what students redeemed)
CREATE TABLE IF NOT EXISTS coin_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES coin_store_items(id) ON DELETE CASCADE,
  item_title TEXT NOT NULL,
  coins_spent INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'cancelled')),
  redeemed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE coin_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own redemptions"
  ON coin_redemptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own redemptions"
  ON coin_redemptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_coin_store_items_active
  ON coin_store_items(is_active, category);

CREATE INDEX IF NOT EXISTS idx_coin_redemptions_user
  ON coin_redemptions(user_id, redeemed_at DESC);

CREATE INDEX IF NOT EXISTS idx_coin_redemptions_item
  ON coin_redemptions(item_id);

-- 4. Trigger to increment redemption_count on item
CREATE OR REPLACE FUNCTION increment_item_redemption_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE coin_store_items
  SET redemption_count = redemption_count + 1,
      stock = CASE WHEN stock > 0 THEN stock - 1 ELSE stock END,
      updated_at = NOW()
  WHERE id = NEW.item_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_coin_redemption
  AFTER INSERT ON coin_redemptions
  FOR EACH ROW EXECUTE FUNCTION increment_item_redemption_count();

-- 5. Seed sample store items
INSERT INTO coin_store_items (title, description, category, coin_price, stock) VALUES
('10% Off Ayuzee Shop', 'Get 10% discount on any Ayuzee shop product. Coupon code delivered via email.', 'Voucher', 50, -1),
('Premium Quiz Pack Access', 'Unlock 50 advanced quiz questions across all subjects for 30 days.', 'Feature', 30, -1),
('Certificate of Merit', 'Receive a digitally signed Certificate of Merit for academic excellence on Ayuzee.', 'Certificate', 100, -1),
('Ayuzee Branded Notebook', 'A premium hardcover notebook with Ayurvedic herb illustrations. Ships free!', 'Merchandise', 200, 50),
('1-Month CME Course Access', 'Free access to any one CME webinar course for 30 days.', 'Course', 150, -1),
('Exclusive Study Material PDF', 'Download a curated 50-page PDF on Dravyaguna clinical applications.', 'General', 25, -1),
('Priority Support Badge', 'Get a priority support badge on your profile for 60 days.', 'Feature', 75, -1),
('Ayuzee T-Shirt', 'Comfortable cotton t-shirt with Ayuzee Student Hub logo. Choose your size after redemption.', 'Merchandise', 300, 30),
('Free Consultation Voucher', 'Book a free 15-minute consultation with any Ayuzee doctor.', 'Voucher', 250, 20),
('Research Paper Template', 'Professional Ayurveda research paper template with formatting guidelines.', 'General', 15, -1);

-- Done! Coin Redemption Store tables and sample items created.
