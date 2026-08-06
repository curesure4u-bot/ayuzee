-- ═══════════════════════════════════════════════════════════════════════════════
-- NirogStreet Gap Features — All Missing Tables
-- Features: Doctor Verification, Patient Reviews, Doctor Articles,
--           Treatment Outcomes, Clinic Certification, Case Referrals, CME Credits
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 1. DOCTOR VERIFICATION / CREDENTIAL SYSTEM                                  │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS doctor_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  registration_number TEXT NOT NULL,
  registration_council TEXT NOT NULL,
  council_state TEXT,
  degree TEXT NOT NULL,
  university TEXT,
  year_of_passing INTEGER,
  system_of_medicine TEXT NOT NULL DEFAULT 'Ayurveda' CHECK (system_of_medicine IN ('Ayurveda', 'Siddha', 'Unani', 'Homeopathy', 'Yoga', 'Naturopathy', 'Modern')),
  certificate_url TEXT,
  registration_certificate_url TEXT,
  id_proof_url TEXT,
  additional_qualifications JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'verified', 'rejected', 'expired')),
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  expiry_date DATE,
  verification_notes TEXT,
  badge_level TEXT DEFAULT 'none' CHECK (badge_level IN ('none', 'basic', 'verified', 'premium', 'expert')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE doctor_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can view own verification"
  ON doctor_verifications FOR SELECT
  USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can submit verification"
  ON doctor_verifications FOR INSERT
  WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctors can update own pending verification"
  ON doctor_verifications FOR UPDATE
  USING (auth.uid() = doctor_id AND status = 'pending');

CREATE INDEX IF NOT EXISTS idx_doctor_verifications_doctor ON doctor_verifications(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_verifications_status ON doctor_verifications(status);
CREATE INDEX IF NOT EXISTS idx_doctor_verifications_council ON doctor_verifications(registration_council);

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 2. PATIENT REVIEWS / RATINGS SYSTEM                                         │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS patient_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  appointment_id UUID,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  review_text TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  consultation_type TEXT CHECK (consultation_type IN ('video', 'in_clinic', 'chat', 'follow_up')),
  would_recommend BOOLEAN DEFAULT true,
  wait_time_rating INTEGER CHECK (wait_time_rating >= 1 AND wait_time_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  treatment_effectiveness INTEGER CHECK (treatment_effectiveness >= 1 AND treatment_effectiveness <= 5),
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('pending', 'published', 'hidden', 'flagged', 'removed')),
  doctor_response TEXT,
  doctor_responded_at TIMESTAMPTZ,
  helpful_count INTEGER DEFAULT 0,
  report_count INTEGER DEFAULT 0,
  moderation_notes TEXT,
  moderated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(doctor_id, patient_id, appointment_id)
);

ALTER TABLE patient_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published reviews"
  ON patient_reviews FOR SELECT
  USING (status = 'published' OR auth.uid() = patient_id OR auth.uid() = doctor_id);

CREATE POLICY "Patients can create reviews"
  ON patient_reviews FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can update own reviews"
  ON patient_reviews FOR UPDATE
  USING (auth.uid() = patient_id OR auth.uid() = doctor_id);

CREATE INDEX IF NOT EXISTS idx_patient_reviews_doctor ON patient_reviews(doctor_id, status);
CREATE INDEX IF NOT EXISTS idx_patient_reviews_patient ON patient_reviews(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_reviews_rating ON patient_reviews(doctor_id, rating);

-- Review helpful votes
CREATE TABLE IF NOT EXISTS review_helpful_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES patient_reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

ALTER TABLE review_helpful_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can vote helpful"
  ON review_helpful_votes FOR ALL
  USING (auth.uid() = user_id);

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 3. DOCTOR ARTICLES / SELF-PUBLISHING SYSTEM                                 │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS doctor_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  summary TEXT,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  category TEXT NOT NULL DEFAULT 'Clinical Practice' CHECK (category IN ('Clinical Practice', 'Research', 'Case Report', 'Review Article', 'Opinion', 'Education', 'Wellness Tips', 'Drug Review', 'Treatment Protocol')),
  tags TEXT[] DEFAULT '{}',
  system_of_medicine TEXT DEFAULT 'Ayurveda',
  references_list JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'published', 'rejected', 'archived')),
  peer_review_required BOOLEAN DEFAULT true,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  review_comments TEXT,
  reviewed_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  bookmark_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  reading_time_minutes INTEGER DEFAULT 5,
  language TEXT DEFAULT 'en',
  is_featured BOOLEAN DEFAULT false,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE doctor_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published articles"
  ON doctor_articles FOR SELECT
  USING (status = 'published' OR auth.uid() = author_id);

CREATE POLICY "Doctors can create articles"
  ON doctor_articles FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own articles"
  ON doctor_articles FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own drafts"
  ON doctor_articles FOR DELETE
  USING (auth.uid() = author_id AND status = 'draft');

CREATE INDEX IF NOT EXISTS idx_doctor_articles_author ON doctor_articles(author_id);
CREATE INDEX IF NOT EXISTS idx_doctor_articles_status ON doctor_articles(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_doctor_articles_category ON doctor_articles(category);
CREATE INDEX IF NOT EXISTS idx_doctor_articles_slug ON doctor_articles(slug);

-- Article comments
CREATE TABLE IF NOT EXISTS article_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES doctor_articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES article_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  like_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'removed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE article_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active comments"
  ON article_comments FOR SELECT
  USING (status = 'active' OR auth.uid() = user_id);

CREATE POLICY "Users can create comments"
  ON article_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON article_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_article_comments_article ON article_comments(article_id);
CREATE INDEX IF NOT EXISTS idx_article_comments_user ON article_comments(user_id);

-- Article likes/bookmarks
CREATE TABLE IF NOT EXISTS article_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES doctor_articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('like', 'bookmark', 'share')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(article_id, user_id, interaction_type)
);

ALTER TABLE article_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own interactions"
  ON article_interactions FOR ALL
  USING (auth.uid() = user_id);

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 4. EVIDENCE-BASED TREATMENT OUTCOME TRACKING                                │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS treatment_protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  condition TEXT NOT NULL,
  system_of_medicine TEXT NOT NULL DEFAULT 'Ayurveda',
  description TEXT,
  duration_days INTEGER,
  steps JSONB DEFAULT '[]',
  medicines JSONB DEFAULT '[]',
  therapies JSONB DEFAULT '[]',
  dietary_guidelines TEXT,
  lifestyle_guidelines TEXT,
  contraindications TEXT,
  expected_outcomes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_standard BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2),
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE treatment_protocols ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view active protocols"
  ON treatment_protocols FOR SELECT
  USING (auth.uid() IS NOT NULL AND (status = 'active' OR auth.uid() = created_by));

CREATE POLICY "Doctors can create protocols"
  ON treatment_protocols FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update own protocols"
  ON treatment_protocols FOR UPDATE
  USING (auth.uid() = created_by);

CREATE INDEX IF NOT EXISTS idx_treatment_protocols_condition ON treatment_protocols(condition);
CREATE INDEX IF NOT EXISTS idx_treatment_protocols_system ON treatment_protocols(system_of_medicine);

-- Treatment outcome records
CREATE TABLE IF NOT EXISTS treatment_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_id UUID REFERENCES treatment_protocols(id) ON DELETE SET NULL,
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  condition_treated TEXT NOT NULL,
  diagnosis_details TEXT,
  treatment_start_date DATE NOT NULL,
  treatment_end_date DATE,
  duration_days INTEGER,
  baseline_severity INTEGER CHECK (baseline_severity >= 1 AND baseline_severity <= 10),
  final_severity INTEGER CHECK (final_severity >= 0 AND final_severity <= 10),
  outcome_status TEXT NOT NULL DEFAULT 'ongoing' CHECK (outcome_status IN ('ongoing', 'improved', 'resolved', 'no_change', 'worsened', 'discontinued')),
  improvement_percentage DECIMAL(5,2),
  patient_satisfaction INTEGER CHECK (patient_satisfaction >= 1 AND patient_satisfaction <= 5),
  side_effects TEXT,
  notes TEXT,
  medicines_used JSONB DEFAULT '[]',
  therapies_used JSONB DEFAULT '[]',
  follow_up_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE treatment_outcomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can view own outcomes"
  ON treatment_outcomes FOR SELECT
  USING (auth.uid() = doctor_id OR (is_published = true AND auth.uid() IS NOT NULL));

CREATE POLICY "Doctors can create outcomes"
  ON treatment_outcomes FOR INSERT
  WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctors can update own outcomes"
  ON treatment_outcomes FOR UPDATE
  USING (auth.uid() = doctor_id);

CREATE INDEX IF NOT EXISTS idx_treatment_outcomes_doctor ON treatment_outcomes(doctor_id);
CREATE INDEX IF NOT EXISTS idx_treatment_outcomes_condition ON treatment_outcomes(condition_treated);
CREATE INDEX IF NOT EXISTS idx_treatment_outcomes_protocol ON treatment_outcomes(protocol_id);
CREATE INDEX IF NOT EXISTS idx_treatment_outcomes_status ON treatment_outcomes(outcome_status);

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 5. CLINIC CERTIFICATION & QUALITY SYSTEM                                    │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS clinic_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID,
  clinic_name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT,
  phone TEXT,
  email TEXT,
  registration_number TEXT,
  registration_authority TEXT,
  systems_practiced TEXT[] DEFAULT ARRAY['Ayurveda'],
  infrastructure_details JSONB DEFAULT '{}',
  staff_count INTEGER DEFAULT 1,
  doctor_count INTEGER DEFAULT 1,
  has_pharmacy BOOLEAN DEFAULT false,
  has_panchakarma BOOLEAN DEFAULT false,
  has_lab BOOLEAN DEFAULT false,
  photos JSONB DEFAULT '[]',
  documents JSONB DEFAULT '[]',
  tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  certification_status TEXT NOT NULL DEFAULT 'applied' CHECK (certification_status IN ('applied', 'documents_pending', 'inspection_scheduled', 'inspection_done', 'certified', 'rejected', 'expired', 'suspended')),
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  inspection_date DATE,
  inspector_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  inspection_notes TEXT,
  inspection_score INTEGER CHECK (inspection_score >= 0 AND inspection_score <= 100),
  certified_at TIMESTAMPTZ,
  certificate_expiry DATE,
  renewal_reminder_sent BOOLEAN DEFAULT false,
  rejection_reason TEXT,
  compliance_checklist JSONB DEFAULT '[]',
  last_audit_date DATE,
  next_audit_date DATE,
  audit_history JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE clinic_certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view own clinic certification"
  ON clinic_certifications FOR SELECT
  USING (auth.uid() = owner_id OR certification_status = 'certified');

CREATE POLICY "Owners can apply for certification"
  ON clinic_certifications FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update own application"
  ON clinic_certifications FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE INDEX IF NOT EXISTS idx_clinic_certifications_owner ON clinic_certifications(owner_id);
CREATE INDEX IF NOT EXISTS idx_clinic_certifications_status ON clinic_certifications(certification_status);
CREATE INDEX IF NOT EXISTS idx_clinic_certifications_tier ON clinic_certifications(tier);
CREATE INDEX IF NOT EXISTS idx_clinic_certifications_city ON clinic_certifications(city, state);

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 6. CASE REFERRAL SYSTEM (Doctor-to-Doctor)                                  │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS case_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referring_doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_to_doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referral_type TEXT NOT NULL DEFAULT 'referral' CHECK (referral_type IN ('referral', 'second_opinion', 'co_management', 'transfer')),
  urgency TEXT DEFAULT 'routine' CHECK (urgency IN ('emergency', 'urgent', 'routine')),
  patient_name TEXT,
  patient_age INTEGER,
  patient_gender TEXT,
  condition TEXT NOT NULL,
  diagnosis TEXT,
  current_treatment TEXT,
  reason_for_referral TEXT NOT NULL,
  clinical_notes TEXT,
  attachments JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed', 'cancelled')),
  response_notes TEXT,
  responded_at TIMESTAMPTZ,
  outcome_notes TEXT,
  completed_at TIMESTAMPTZ,
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE case_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Referring doctor can view"
  ON case_referrals FOR SELECT
  USING (auth.uid() = referring_doctor_id OR auth.uid() = referred_to_doctor_id);

CREATE POLICY "Doctors can create referrals"
  ON case_referrals FOR INSERT
  WITH CHECK (auth.uid() = referring_doctor_id);

CREATE POLICY "Involved doctors can update"
  ON case_referrals FOR UPDATE
  USING (auth.uid() = referring_doctor_id OR auth.uid() = referred_to_doctor_id);

CREATE INDEX IF NOT EXISTS idx_case_referrals_referring ON case_referrals(referring_doctor_id);
CREATE INDEX IF NOT EXISTS idx_case_referrals_referred_to ON case_referrals(referred_to_doctor_id);
CREATE INDEX IF NOT EXISTS idx_case_referrals_status ON case_referrals(status);

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 7. CME CREDIT TRACKING                                                      │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS cme_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('course', 'webinar', 'workshop', 'conference', 'publication', 'research', 'case_presentation', 'peer_review', 'teaching', 'online_module')),
  activity_title TEXT NOT NULL,
  activity_id UUID,
  provider TEXT,
  credits_earned DECIMAL(5,2) NOT NULL DEFAULT 1.0,
  credit_category TEXT DEFAULT 'Category 1' CHECK (credit_category IN ('Category 1', 'Category 2', 'Category 3')),
  date_completed DATE NOT NULL,
  certificate_url TEXT,
  certificate_number TEXT,
  valid_from DATE,
  valid_until DATE,
  description TEXT,
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cme_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can view own CME credits"
  ON cme_credits FOR SELECT
  USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can add CME credits"
  ON cme_credits FOR INSERT
  WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctors can update own credits"
  ON cme_credits FOR UPDATE
  USING (auth.uid() = doctor_id);

CREATE INDEX IF NOT EXISTS idx_cme_credits_doctor ON cme_credits(doctor_id);
CREATE INDEX IF NOT EXISTS idx_cme_credits_type ON cme_credits(activity_type);
CREATE INDEX IF NOT EXISTS idx_cme_credits_date ON cme_credits(date_completed DESC);

-- CME requirements per council
CREATE TABLE IF NOT EXISTS cme_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  council_name TEXT NOT NULL,
  state TEXT,
  system_of_medicine TEXT NOT NULL DEFAULT 'Ayurveda',
  credits_required_per_year DECIMAL(5,2) NOT NULL DEFAULT 30.0,
  renewal_cycle_years INTEGER DEFAULT 5,
  category_1_minimum DECIMAL(5,2) DEFAULT 0,
  category_2_minimum DECIMAL(5,2) DEFAULT 0,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cme_requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view CME requirements"
  ON cme_requirements FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_cme_requirements_council ON cme_requirements(council_name);

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 8. TRIGGERS & FUNCTIONS                                                     │
-- └─────────────────────────────────────────────────────────────────────────────┘

-- Auto-update helpful count on patient reviews
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE patient_reviews SET helpful_count = helpful_count + 1 WHERE id = NEW.review_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE patient_reviews SET helpful_count = GREATEST(helpful_count - 1, 0) WHERE id = OLD.review_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_helpful_added
  AFTER INSERT ON review_helpful_votes
  FOR EACH ROW EXECUTE FUNCTION update_review_helpful_count();

CREATE TRIGGER on_review_helpful_removed
  AFTER DELETE ON review_helpful_votes
  FOR EACH ROW EXECUTE FUNCTION update_review_helpful_count();

-- Auto-update article interaction counts
CREATE OR REPLACE FUNCTION update_article_interaction_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.interaction_type = 'like' THEN
      UPDATE doctor_articles SET like_count = like_count + 1 WHERE id = NEW.article_id;
    ELSIF NEW.interaction_type = 'bookmark' THEN
      UPDATE doctor_articles SET bookmark_count = bookmark_count + 1 WHERE id = NEW.article_id;
    ELSIF NEW.interaction_type = 'share' THEN
      UPDATE doctor_articles SET share_count = share_count + 1 WHERE id = NEW.article_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.interaction_type = 'like' THEN
      UPDATE doctor_articles SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.article_id;
    ELSIF OLD.interaction_type = 'bookmark' THEN
      UPDATE doctor_articles SET bookmark_count = GREATEST(bookmark_count - 1, 0) WHERE id = OLD.article_id;
    ELSIF OLD.interaction_type = 'share' THEN
      UPDATE doctor_articles SET share_count = GREATEST(share_count - 1, 0) WHERE id = OLD.article_id;
    END IF;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_article_interaction_added
  AFTER INSERT ON article_interactions
  FOR EACH ROW EXECUTE FUNCTION update_article_interaction_count();

CREATE TRIGGER on_article_interaction_removed
  AFTER DELETE ON article_interactions
  FOR EACH ROW EXECUTE FUNCTION update_article_interaction_count();

-- Auto-update article comment count
CREATE OR REPLACE FUNCTION update_article_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE doctor_articles SET comment_count = comment_count + 1 WHERE id = NEW.article_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE doctor_articles SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.article_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_article_comment_added
  AFTER INSERT ON article_comments
  FOR EACH ROW EXECUTE FUNCTION update_article_comment_count();

CREATE TRIGGER on_article_comment_removed
  AFTER DELETE ON article_comments
  FOR EACH ROW EXECUTE FUNCTION update_article_comment_count();

-- Auto update protocol usage count when outcome is created
CREATE OR REPLACE FUNCTION update_protocol_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.protocol_id IS NOT NULL THEN
    UPDATE treatment_protocols SET usage_count = usage_count + 1 WHERE id = NEW.protocol_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_outcome_created
  AFTER INSERT ON treatment_outcomes
  FOR EACH ROW EXECUTE FUNCTION update_protocol_usage_count();

-- ═══════════════════════════════════════════════════════════
-- Done! All NirogStreet gap feature tables created.
-- ═══════════════════════════════════════════════════════════
