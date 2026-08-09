-- ═══════════════════════════════════════════════════════════
-- BEYOND.PRAXIS — Webinars & Events Module
-- Events, Registrations, Q&A, Resources/Replays
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════
-- 1. EVENTS (Webinars, Workshops, Live Sessions)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'webinar' CHECK (event_type IN (
    'webinar', 'workshop', 'live_qa', 'masterclass', 'panel'
  )),
  host_name TEXT NOT NULL DEFAULT 'Jasir Sajidh',
  host_avatar TEXT,
  guest_speakers TEXT[] DEFAULT '{}',
  thumbnail_url TEXT,
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN (
    'clinical', 'finance', 'leadership', 'wellness', 'time',
    'side_income', 'communication', 'general'
  )),
  -- Scheduling
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  duration_minutes INTEGER DEFAULT 60,
  timezone TEXT DEFAULT 'Asia/Kolkata',
  -- Live links
  live_url TEXT,
  meeting_id TEXT,
  meeting_password TEXT,
  -- Replay
  replay_url TEXT,
  replay_available BOOLEAN DEFAULT false,
  replay_expires_at TIMESTAMPTZ,
  -- Status
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed', 'cancelled')),
  is_published BOOLEAN DEFAULT false,
  is_free BOOLEAN DEFAULT true,
  price_inr INTEGER DEFAULT 0,
  max_attendees INTEGER,
  -- CTA (Call to Action after event)
  cta_enabled BOOLEAN DEFAULT false,
  cta_title TEXT,
  cta_description TEXT,
  cta_button_text TEXT DEFAULT 'Enroll Now',
  cta_link TEXT,
  -- Gamification
  xp_reward INTEGER DEFAULT 50,
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  registration_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE beyond_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view published events"
  ON beyond_events FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_published = true);

CREATE POLICY "Admins can manage events"
  ON beyond_events FOR ALL
  USING (auth.uid() IS NOT NULL);


-- ═══════════════════════════════════════════════════════════
-- 2. EVENT REGISTRATIONS
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES beyond_events(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'no_show', 'cancelled')),
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  attended_at TIMESTAMPTZ,
  watch_duration_minutes INTEGER DEFAULT 0,
  feedback_rating INTEGER CHECK (feedback_rating BETWEEN 1 AND 5),
  feedback_text TEXT,
  UNIQUE(user_id, event_id)
);

ALTER TABLE beyond_event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own registrations"
  ON beyond_event_registrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can register for events"
  ON beyond_event_registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own registration"
  ON beyond_event_registrations FOR UPDATE
  USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════
-- 3. EVENT Q&A (Questions during/after event)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_event_qa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES beyond_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT,
  answered_by TEXT,
  is_pinned BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0,
  asked_at TIMESTAMPTZ DEFAULT NOW(),
  answered_at TIMESTAMPTZ
);

ALTER TABLE beyond_event_qa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Registered users can view event QA"
  ON beyond_event_qa FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can ask questions"
  ON beyond_event_qa FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can answer questions"
  ON beyond_event_qa FOR UPDATE
  USING (auth.uid() IS NOT NULL);


-- ═══════════════════════════════════════════════════════════
-- 4. EVENT RESOURCES (Slides, PDFs, Downloads)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_event_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES beyond_events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  resource_type TEXT NOT NULL DEFAULT 'pdf' CHECK (resource_type IN ('pdf', 'slides', 'worksheet', 'link', 'other')),
  file_url TEXT,
  external_url TEXT,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE beyond_event_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Registered users can view resources"
  ON beyond_event_resources FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage resources"
  ON beyond_event_resources FOR ALL
  USING (auth.uid() IS NOT NULL);


-- ═══════════════════════════════════════════════════════════
-- 5. INDEXES
-- ═══════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_events_status ON beyond_events(status, starts_at);
CREATE INDEX IF NOT EXISTS idx_events_published ON beyond_events(is_published, starts_at);
CREATE INDEX IF NOT EXISTS idx_event_regs_user ON beyond_event_registrations(user_id, event_id);
CREATE INDEX IF NOT EXISTS idx_event_qa_event ON beyond_event_qa(event_id, is_pinned, asked_at);
CREATE INDEX IF NOT EXISTS idx_event_resources_event ON beyond_event_resources(event_id, sort_order);


-- ═══════════════════════════════════════════════════════════
-- 6. SEED: Sample Events
-- ═══════════════════════════════════════════════════════════

INSERT INTO beyond_events (title, subtitle, description, event_type, host_name, category, starts_at, ends_at, duration_minutes, status, is_published, is_free, xp_reward, cta_enabled, cta_title, cta_description, cta_button_text, cta_link, tags)
VALUES
(
  'Why Doctors Burn Out & The 8-Spoke Solution',
  'Free Masterclass — The Wheel of Life for Busy Clinicians',
  'In this 60-minute free masterclass, learn why 60% of doctors experience burnout and discover the 8-spoke Wheel of Life framework that helps you identify imbalances before they become crises. You''ll leave with a personalized action plan and access to the Beyond.Praxis tool.',
  'masterclass',
  'Jasir Sajidh',
  'wellness',
  NOW() + INTERVAL '7 days',
  NOW() + INTERVAL '7 days' + INTERVAL '75 minutes',
  75,
  'upcoming',
  true,
  true,
  100,
  true,
  'Ready to Transform Your Life?',
  'Join the Beyond Burnout course and get structured guidance for 30 days.',
  'Enroll in Course',
  '/beyond/academy',
  ARRAY['burnout', 'wellness', 'wheel-of-life', 'free', 'masterclass']
),
(
  'Side Income Secrets for AYUSH Doctors',
  'Workshop: 5 Proven Models to Earn Beyond Your Clinic',
  'Discover 5 side-income models that AYUSH doctors are using right now to generate ₹50K-₹5L/month beyond their practice — without compromising patient care. Includes case studies, templates, and Q&A.',
  'workshop',
  'Jasir Sajidh',
  'side_income',
  NOW() + INTERVAL '14 days',
  NOW() + INTERVAL '14 days' + INTERVAL '90 minutes',
  90,
  'upcoming',
  true,
  true,
  100,
  true,
  'Start Building Side Income',
  'Get the full Side Income Blueprint with templates and frameworks.',
  'Get the Blueprint',
  '/beyond/side-income',
  ARRAY['side-income', 'finance', 'workshop', 'free']
),
(
  'Monthly Wheel Check-In: Live Group Coaching',
  'Reflect, Reset, and Recommit with the Community',
  'Join our monthly live group coaching session where we review our Wheel of Life scores together, celebrate wins, troubleshoot challenges, and set intentions for the next 30 days. Open to all Beyond.Praxis members.',
  'live_qa',
  'Jasir Sajidh',
  'general',
  NOW() + INTERVAL '21 days',
  NOW() + INTERVAL '21 days' + INTERVAL '60 minutes',
  60,
  'upcoming',
  true,
  true,
  75,
  false,
  NULL, NULL, NULL, NULL,
  ARRAY['coaching', 'community', 'wheel-of-life', 'monthly']
)
ON CONFLICT DO NOTHING;
