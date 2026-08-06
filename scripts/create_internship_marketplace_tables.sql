-- ═══════════════════════════════════════════════════════════
-- Internship Marketplace — Hospitals post openings, students apply
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════

-- 1. Internship Listings
CREATE TABLE IF NOT EXISTS internship_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  hospital_name TEXT NOT NULL,
  location TEXT NOT NULL,
  department TEXT NOT NULL DEFAULT 'General',
  description TEXT NOT NULL,
  requirements TEXT,
  duration_weeks INTEGER DEFAULT 4,
  stipend TEXT,
  spots_available INTEGER DEFAULT 1,
  application_deadline DATE,
  is_active BOOLEAN DEFAULT true,
  application_count INTEGER DEFAULT 0,
  posted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE internship_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active listings"
  ON internship_listings FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = true);

CREATE POLICY "Authenticated users can create listings"
  ON internship_listings FOR INSERT
  WITH CHECK (auth.uid() = posted_by);

CREATE POLICY "Posters can update own listings"
  ON internship_listings FOR UPDATE
  USING (auth.uid() = posted_by);

-- 2. Internship Applications
CREATE TABLE IF NOT EXISTS internship_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES internship_listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cover_note TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'shortlisted', 'accepted', 'rejected')),
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(listing_id, user_id)
);

ALTER TABLE internship_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own applications"
  ON internship_applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can apply"
  ON internship_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_internship_listings_active
  ON internship_listings(is_active, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_internship_applications_user
  ON internship_applications(user_id);

CREATE INDEX IF NOT EXISTS idx_internship_applications_listing
  ON internship_applications(listing_id);

-- 4. Trigger: increment application_count
CREATE OR REPLACE FUNCTION increment_internship_application_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE internship_listings SET application_count = application_count + 1 WHERE id = NEW.listing_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_internship_application
  AFTER INSERT ON internship_applications
  FOR EACH ROW EXECUTE FUNCTION increment_internship_application_count();

-- 5. Seed sample listings
INSERT INTO internship_listings (title, hospital_name, location, department, description, requirements, duration_weeks, stipend, spots_available, application_deadline, posted_by)
VALUES
('Panchakarma Clinical Internship', 'SDM Ayurveda Hospital', 'Udupi, Karnataka', 'Panchakarma', 'Hands-on training in Panchakarma procedures including Vamana, Virechana, Basti, Nasya, and Raktamokshana under expert supervision.', 'BAMS 3rd year or above. Basic knowledge of Panchakarma principles.', 8, '₹5,000/month', 5, (CURRENT_DATE + INTERVAL '30 days')::DATE, NULL),
('Kayachikitsa OPD Posting', 'Govt. Ayurveda Hospital, Thiruvananthapuram', 'Thiruvananthapuram, Kerala', 'Kayachikitsa', 'OPD exposure in general medicine. Learn case taking, diagnosis, and prescription writing in a high-volume setting.', 'BAMS students in internship phase.', 4, 'Unpaid (Certificate provided)', 10, (CURRENT_DATE + INTERVAL '45 days')::DATE, NULL),
('Research Internship — Clinical Trials', 'AIIA, New Delhi', 'New Delhi', 'Research', 'Assist in ongoing AYUSH clinical trials. Learn GCP, data collection, and research methodology.', 'MD/MS scholars or final year BAMS with research interest.', 12, '₹15,000/month', 3, (CURRENT_DATE + INTERVAL '60 days')::DATE, NULL),
('Shalya Tantra Surgical Training', 'KLE Ayurveda Hospital', 'Belagavi, Karnataka', 'Shalya Tantra', 'Observe and assist in Kshar Sutra, Agnikarma, and minor surgical procedures.', 'BAMS final year or interns. Surgical aptitude preferred.', 6, '₹8,000/month', 4, (CURRENT_DATE + INTERVAL '21 days')::DATE, NULL);

-- Done! Internship Marketplace tables and sample data created.
