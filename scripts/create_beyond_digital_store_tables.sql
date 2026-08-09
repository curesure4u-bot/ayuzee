-- ═══════════════════════════════════════════════════════════
-- BEYOND.PRAXIS — Digital Products Store
-- Products, Purchases, Reviews, Downloads
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════
-- 1. DIGITAL PRODUCTS
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_digital_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  product_type TEXT NOT NULL DEFAULT 'pdf' CHECK (product_type IN (
    'pdf', 'template', 'worksheet', 'ebook', 'spreadsheet',
    'notion_template', 'checklist', 'toolkit', 'bundle'
  )),
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN (
    'clinical', 'finance', 'leadership', 'wellness', 'time',
    'side_income', 'communication', 'research', 'general'
  )),
  thumbnail_url TEXT,
  preview_url TEXT,
  file_url TEXT NOT NULL,
  file_size_kb INTEGER DEFAULT 0,
  -- Pricing: coins OR free
  price_coins INTEGER DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  -- Stats
  download_count INTEGER DEFAULT 0,
  rating_avg NUMERIC(2,1) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  -- Metadata
  author_name TEXT NOT NULL DEFAULT 'Jasir Sajidh',
  tags TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE beyond_digital_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view published products"
  ON beyond_digital_products FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_published = true);

CREATE POLICY "Admins can manage products"
  ON beyond_digital_products FOR ALL
  USING (auth.uid() IS NOT NULL);


-- ═══════════════════════════════════════════════════════════
-- 2. PURCHASES / UNLOCKS
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_digital_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES beyond_digital_products(id) ON DELETE CASCADE,
  coins_spent INTEGER DEFAULT 0,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  download_count INTEGER DEFAULT 0,
  last_downloaded_at TIMESTAMPTZ,
  UNIQUE(user_id, product_id)
);

ALTER TABLE beyond_digital_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchases"
  ON beyond_digital_purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can purchase products"
  ON beyond_digital_purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own purchase"
  ON beyond_digital_purchases FOR UPDATE
  USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════
-- 3. PRODUCT REVIEWS
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_digital_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES beyond_digital_products(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  reviewer_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE beyond_digital_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
  ON beyond_digital_reviews FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create own reviews"
  ON beyond_digital_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON beyond_digital_reviews FOR UPDATE
  USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════
-- 4. INDEXES
-- ═══════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_digital_products_published ON beyond_digital_products(is_published, category);
CREATE INDEX IF NOT EXISTS idx_digital_products_featured ON beyond_digital_products(is_featured, created_at);
CREATE INDEX IF NOT EXISTS idx_digital_purchases_user ON beyond_digital_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_digital_reviews_product ON beyond_digital_reviews(product_id);


-- ═══════════════════════════════════════════════════════════
-- 5. SEED: Sample Digital Products
-- ═══════════════════════════════════════════════════════════

INSERT INTO beyond_digital_products (title, subtitle, description, product_type, category, file_url, price_coins, is_free, is_published, is_featured, author_name, tags)
VALUES
(
  '30-Day Wheel of Life Journal',
  'Daily reflection prompts for all 8 spokes',
  'A beautifully designed 30-day journal with daily prompts for each spoke of the Wheel of Life. Includes weekly review pages, goal-setting frameworks, and progress trackers. Print or use digitally.',
  'pdf',
  'general',
  '/docs/wheel-journal-30-day.pdf',
  50,
  false,
  true,
  true,
  'Jasir Sajidh',
  ARRAY['journal', 'wheel-of-life', 'reflection', '30-day']
),
(
  'Doctor''s Monthly Budget Planner',
  'Track income, expenses, investments & tax savings',
  'An Excel/Google Sheets template designed specifically for doctors. Tracks clinic income, hospital salary, side income, expenses by category, SIP investments, tax-saving instruments, and net worth over time.',
  'spreadsheet',
  'finance',
  '/docs/doctor-budget-planner.xlsx',
  75,
  false,
  true,
  true,
  'Jasir Sajidh',
  ARRAY['finance', 'budget', 'spreadsheet', 'tax']
),
(
  'Leadership Scenario Workbook',
  '20 real-world medical leadership challenges',
  'A PDF workbook with 20 detailed leadership scenarios that medical professionals face — from managing difficult team members to handling hospital politics. Each scenario includes analysis frameworks and model responses.',
  'worksheet',
  'leadership',
  '/docs/leadership-workbook.pdf',
  100,
  false,
  true,
  false,
  'Jasir Sajidh',
  ARRAY['leadership', 'scenarios', 'workbook']
),
(
  'Side Income Starter Kit',
  'Templates, frameworks & action plans',
  'Everything you need to start your first side-income project as a doctor. Includes: income stream comparison matrix, content calendar template, pricing calculator, client outreach scripts, and a 90-day action plan.',
  'bundle',
  'side_income',
  '/docs/side-income-starter-kit.zip',
  150,
  false,
  true,
  true,
  'Jasir Sajidh',
  ARRAY['side-income', 'templates', 'bundle', 'starter-kit']
),
(
  'Pomodoro Focus Planner',
  'Weekly planner with energy tracking built in',
  'A printable weekly planner that combines Pomodoro technique tracking with energy-level mapping. Plan your deep work during peak energy hours. Includes habit check-off section.',
  'template',
  'time',
  '/docs/pomodoro-weekly-planner.pdf',
  0,
  true,
  true,
  false,
  'Jasir Sajidh',
  ARRAY['time', 'pomodoro', 'planner', 'free']
),
(
  'Gratitude & Wellness Tracker',
  '90-day wellness check-in with mood patterns',
  'A 90-day tracker for daily mood, energy, sleep quality, and gratitude entries. Designed for doctors who want to identify burnout patterns early. Includes monthly review spreads.',
  'checklist',
  'wellness',
  '/docs/wellness-90-day-tracker.pdf',
  50,
  false,
  true,
  false,
  'Jasir Sajidh',
  ARRAY['wellness', 'gratitude', 'tracker', 'burnout']
)
ON CONFLICT DO NOTHING;
