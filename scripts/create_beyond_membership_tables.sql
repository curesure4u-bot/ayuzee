-- ═══════════════════════════════════════════════════════════
-- BEYOND.PRAXIS — Membership Tiers
-- Plans, Subscriptions, Feature Access
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════
-- 1. MEMBERSHIP PLANS (Catalog)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_membership_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  tier_level INTEGER NOT NULL DEFAULT 0,
  -- Pricing
  price_monthly_inr INTEGER DEFAULT 0,
  price_yearly_inr INTEGER DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  -- Features
  features JSONB NOT NULL DEFAULT '[]',
  highlighted_feature TEXT,
  -- Display
  badge_color TEXT DEFAULT 'gray',
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE beyond_membership_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active plans"
  ON beyond_membership_plans FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage plans"
  ON beyond_membership_plans FOR ALL
  USING (auth.uid() IS NOT NULL);


-- ═══════════════════════════════════════════════════════════
-- 2. USER SUBSCRIPTIONS
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_membership_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES beyond_membership_plans(id),
  plan_slug TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'paused')),
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly', 'lifetime', 'free')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  -- Payment (for future integration)
  payment_method TEXT,
  last_payment_at TIMESTAMPTZ,
  next_payment_at TIMESTAMPTZ,
  UNIQUE(user_id)
);

ALTER TABLE beyond_membership_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON beyond_membership_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create subscription"
  ON beyond_membership_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON beyond_membership_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════
-- 3. FEATURE ACCESS CONTROL
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_membership_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key TEXT NOT NULL UNIQUE,
  feature_name TEXT NOT NULL,
  description TEXT,
  min_tier_level INTEGER NOT NULL DEFAULT 0,
  category TEXT DEFAULT 'module',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE beyond_membership_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view features"
  ON beyond_membership_features FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage features"
  ON beyond_membership_features FOR ALL
  USING (auth.uid() IS NOT NULL);


-- ═══════════════════════════════════════════════════════════
-- 4. INDEXES
-- ═══════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_membership_subs_user ON beyond_membership_subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_membership_plans_active ON beyond_membership_plans(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_membership_features_tier ON beyond_membership_features(min_tier_level);


-- ═══════════════════════════════════════════════════════════
-- 5. SEED: Plans
-- ═══════════════════════════════════════════════════════════

INSERT INTO beyond_membership_plans (name, slug, description, tier_level, price_monthly_inr, price_yearly_inr, is_free, features, highlighted_feature, badge_color, is_popular, sort_order)
VALUES
(
  'Free',
  'free',
  'Get started with essential tools. Perfect for exploring Beyond.Praxis.',
  0,
  0, 0, true,
  '[
    {"text": "Wheel of Life assessment", "included": true},
    {"text": "Dashboard with spoke health", "included": true},
    {"text": "Community access (read only)", "included": true},
    {"text": "3 free digital products", "included": true},
    {"text": "Daily mood & habit tracking", "included": true},
    {"text": "Basic gamification (XP & streaks)", "included": true},
    {"text": "Academy courses", "included": false},
    {"text": "Coaching cohorts", "included": false},
    {"text": "Events & webinars", "included": false},
    {"text": "All digital products", "included": false},
    {"text": "Priority support", "included": false},
    {"text": "1-on-1 coaching", "included": false}
  ]'::jsonb,
  'Free forever — no card needed',
  'gray',
  false,
  1
),
(
  'Pro',
  'pro',
  'Full access to all modules, courses, events, and group coaching. For serious growth.',
  1,
  999, 9999, false,
  '[
    {"text": "Everything in Free", "included": true},
    {"text": "All Academy courses (unlimited)", "included": true},
    {"text": "Events & webinars access", "included": true},
    {"text": "Group coaching cohorts", "included": true},
    {"text": "All digital products included", "included": true},
    {"text": "Community full access (post & reply)", "included": true},
    {"text": "Advanced gamification & leaderboard", "included": true},
    {"text": "Leadership Lab full scenarios", "included": true},
    {"text": "AI Clinical Companion", "included": true},
    {"text": "Monthly bonus coins (100/month)", "included": true},
    {"text": "Priority support", "included": false},
    {"text": "1-on-1 coaching sessions", "included": false}
  ]'::jsonb,
  'Most popular — everything you need',
  'violet',
  true,
  2
),
(
  'Elite',
  'elite',
  'Premium tier with 1-on-1 coaching, priority support, and exclusive perks. For those who want maximum growth.',
  2,
  4999, 49999, false,
  '[
    {"text": "Everything in Pro", "included": true},
    {"text": "Monthly 1-on-1 coaching (30 min)", "included": true},
    {"text": "Priority support (24h response)", "included": true},
    {"text": "Exclusive Elite community", "included": true},
    {"text": "Early access to new features", "included": true},
    {"text": "Custom goal planning with coach", "included": true},
    {"text": "Monthly bonus coins (500/month)", "included": true},
    {"text": "Certificate programs included", "included": true},
    {"text": "Accountability partner matching", "included": true},
    {"text": "Guest expert sessions access", "included": true},
    {"text": "White-glove onboarding", "included": true},
    {"text": "Lifetime badge: Elite Member", "included": true}
  ]'::jsonb,
  'Maximum growth with personal coaching',
  'amber',
  false,
  3
)
ON CONFLICT (slug) DO NOTHING;

-- Seed feature access control
INSERT INTO beyond_membership_features (feature_key, feature_name, description, min_tier_level, category)
VALUES
  ('academy_courses', 'Academy Courses', 'Access to all LMS courses', 1, 'module'),
  ('events_webinars', 'Events & Webinars', 'Register and attend live events', 1, 'module'),
  ('coaching_cohorts', 'Group Coaching', 'Join coaching cohorts', 1, 'module'),
  ('digital_store_all', 'All Digital Products', 'Access entire store without coins', 1, 'module'),
  ('community_post', 'Community Posting', 'Create posts and replies', 1, 'module'),
  ('leadership_full', 'Leadership Lab (Full)', 'All leadership scenarios', 1, 'module'),
  ('ai_companion', 'AI Clinical Companion', 'AI-powered clinical practice', 1, 'module'),
  ('one_on_one', '1-on-1 Coaching', 'Personal coaching sessions', 2, 'coaching'),
  ('priority_support', 'Priority Support', '24-hour response guarantee', 2, 'support'),
  ('elite_community', 'Elite Community', 'Exclusive high-performers group', 2, 'community'),
  ('early_access', 'Early Access', 'New features before everyone else', 2, 'perk')
ON CONFLICT (feature_key) DO NOTHING;
