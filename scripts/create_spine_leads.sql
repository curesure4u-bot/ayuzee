-- ═══════════════════════════════════════════════════════════════════════════════
-- AYUZEE — Spine Lead Form Submissions
-- Stores leads from /spine landing page
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS spine_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  age INTEGER,
  sex TEXT CHECK (sex IN ('male', 'female', 'other')),
  place TEXT,
  email TEXT,
  whatsapp TEXT,
  entry_path TEXT,          -- which reason they clicked (pain, posture, energy, etc.)
  source TEXT DEFAULT 'website',
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'booked', 'converted', 'lost')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE spine_leads ENABLE ROW LEVEL SECURITY;

-- Allow anyone (even unauthenticated visitors) to INSERT leads
CREATE POLICY "Anyone can submit a lead"
  ON spine_leads FOR INSERT
  WITH CHECK (true);

-- Only authenticated staff can read leads
CREATE POLICY "Authenticated users can view leads"
  ON spine_leads FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Index for quick lookups
CREATE INDEX idx_spine_leads_status ON spine_leads(status);
CREATE INDEX idx_spine_leads_created ON spine_leads(created_at DESC);
