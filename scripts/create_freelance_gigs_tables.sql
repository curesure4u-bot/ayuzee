-- ═══════════════════════════════════════════════════════════
-- Freelance Gigs — Content writing, clinic management, social media for doctors
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS freelance_gigs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Content Writing' CHECK (category IN ('Content Writing', 'Social Media', 'Clinic Management', 'Research Assistant', 'Translation', 'Graphic Design', 'Video Editing', 'Other')),
  budget TEXT,
  duration TEXT,
  skills_required TEXT[] DEFAULT '{}',
  is_remote BOOLEAN DEFAULT true,
  location TEXT,
  posted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  poster_name TEXT,
  is_active BOOLEAN DEFAULT true,
  application_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE freelance_gigs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active gigs" ON freelance_gigs FOR SELECT USING (auth.uid() IS NOT NULL AND is_active = true);
CREATE POLICY "Users can post gigs" ON freelance_gigs FOR INSERT WITH CHECK (auth.uid() = posted_by);
CREATE POLICY "Posters can update" ON freelance_gigs FOR UPDATE USING (auth.uid() = posted_by);

CREATE TABLE IF NOT EXISTS freelance_gig_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id UUID NOT NULL REFERENCES freelance_gigs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pitch TEXT NOT NULL,
  portfolio_url TEXT,
  status TEXT NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'shortlisted', 'hired', 'rejected')),
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(gig_id, user_id)
);

ALTER TABLE freelance_gig_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own applications" ON freelance_gig_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can apply" ON freelance_gig_applications FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_freelance_gigs_active ON freelance_gigs(is_active, category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_freelance_gig_apps_user ON freelance_gig_applications(user_id);

CREATE OR REPLACE FUNCTION increment_gig_application_count() RETURNS TRIGGER AS $$
BEGIN UPDATE freelance_gigs SET application_count = application_count + 1 WHERE id = NEW.gig_id; RETURN NEW; END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE TRIGGER on_gig_application AFTER INSERT ON freelance_gig_applications FOR EACH ROW EXECUTE FUNCTION increment_gig_application_count();

-- Seed
INSERT INTO freelance_gigs (title, description, category, budget, duration, skills_required, is_remote, poster_name, posted_by) VALUES
('Ayurveda Blog Writer Needed', 'Write 4 SEO-optimized blog articles per month on Ayurvedic wellness topics for our clinic website.', 'Content Writing', '₹3,000/month', 'Ongoing', ARRAY['Ayurveda knowledge', 'SEO writing', 'English'], true, 'Dr. Ananya Clinic', NULL),
('Social Media Manager for Ayush Clinic', 'Manage Instagram and Facebook pages. Create reels, posts, and stories about Ayurvedic treatments.', 'Social Media', '₹5,000/month', '3 months', ARRAY['Canva', 'Instagram Reels', 'Content planning'], true, 'Vedic Wellness Center', NULL),
('Research Assistant — Literature Review', 'Help compile a systematic review on Panchakarma for metabolic syndrome. 20 hours total.', 'Research Assistant', '₹8,000 (one-time)', '2 weeks', ARRAY['PubMed search', 'Academic writing', 'Zotero'], true, 'BHU Research Lab', NULL),
('Hindi-English Medical Translation', 'Translate 50 pages of Ayurvedic clinical guidelines from Hindi to English.', 'Translation', '₹4,000', '1 week', ARRAY['Hindi fluency', 'Medical terminology', 'English writing'], true, 'AIIA Publications', NULL);

-- Done!
