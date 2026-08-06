-- ═══════════════════════════════════════════════════════════
-- Case Study Library — Clinical AYUSH Case Studies for Students
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════

-- 1. Case Studies (main table)
CREATE TABLE IF NOT EXISTS case_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT 'General',
  system TEXT NOT NULL DEFAULT 'Ayurveda' CHECK (system IN ('Ayurveda', 'Siddha', 'Unani', 'Homeopathy', 'Yoga', 'Naturopathy')),
  difficulty TEXT NOT NULL DEFAULT 'Intermediate' CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  tags TEXT[] DEFAULT '{}',
  summary TEXT NOT NULL,
  patient_history TEXT NOT NULL,
  examination TEXT NOT NULL,
  diagnosis TEXT NOT NULL,
  treatment TEXT NOT NULL,
  outcome TEXT NOT NULL,
  discussion TEXT,
  "references" TEXT,
  author_name TEXT,
  author_college TEXT,
  is_published BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  bookmark_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view published case studies
CREATE POLICY "Authenticated users can view published case studies"
  ON case_studies FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_published = true);

-- Authenticated users can create case studies
CREATE POLICY "Authenticated users can create case studies"
  ON case_studies FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Authors can update their own case studies
CREATE POLICY "Authors can update own case studies"
  ON case_studies FOR UPDATE
  USING (auth.uid() = created_by);

-- Authors can delete their own case studies
CREATE POLICY "Authors can delete own case studies"
  ON case_studies FOR DELETE
  USING (auth.uid() = created_by);

-- 2. Case Study Bookmarks
CREATE TABLE IF NOT EXISTS case_study_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_study_id UUID NOT NULL REFERENCES case_studies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(case_study_id, user_id)
);

ALTER TABLE case_study_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmarks"
  ON case_study_bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can bookmark case studies"
  ON case_study_bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own bookmarks"
  ON case_study_bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_case_studies_subject
  ON case_studies(subject, system);

CREATE INDEX IF NOT EXISTS idx_case_studies_difficulty
  ON case_studies(difficulty);

CREATE INDEX IF NOT EXISTS idx_case_studies_published
  ON case_studies(is_published, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_case_study_bookmarks_user
  ON case_study_bookmarks(user_id);

CREATE INDEX IF NOT EXISTS idx_case_study_bookmarks_case
  ON case_study_bookmarks(case_study_id);

-- 4. Trigger to auto-increment bookmark_count
CREATE OR REPLACE FUNCTION increment_case_study_bookmark_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE case_studies SET bookmark_count = bookmark_count + 1 WHERE id = NEW.case_study_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_case_study_bookmarked
  AFTER INSERT ON case_study_bookmarks
  FOR EACH ROW EXECUTE FUNCTION increment_case_study_bookmark_count();

CREATE OR REPLACE FUNCTION decrement_case_study_bookmark_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE case_studies SET bookmark_count = GREATEST(bookmark_count - 1, 0) WHERE id = OLD.case_study_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_case_study_unbookmarked
  AFTER DELETE ON case_study_bookmarks
  FOR EACH ROW EXECUTE FUNCTION decrement_case_study_bookmark_count();

-- 5. Seed some sample case studies for students
INSERT INTO case_studies (title, subject, system, difficulty, tags, summary, patient_history, examination, diagnosis, treatment, outcome, author_name, author_college, created_by)
VALUES
(
  'Chronic Low Back Pain managed with Kati Basti',
  'Panchakarma',
  'Ayurveda',
  'Intermediate',
  ARRAY['Kati Basti', 'Vata', 'Musculoskeletal'],
  'A 45-year-old male with chronic lumbar pain for 3 years, managed successfully with Kati Basti and internal medicines.',
  'A 45-year-old male office worker presented with dull aching pain in the lumbar region for the past 3 years. Pain aggravated on prolonged sitting, bending, and cold weather. No history of trauma. Previously tried NSAIDs with temporary relief.',
  'Tenderness over L4-L5 region. Restricted forward flexion. SLR negative bilaterally. No neurological deficit. Prakriti: Vata-Pitta. Agni: Vishamagni. Koshtha: Krura.',
  'Katishoola (Vataja type). Modern correlation: Chronic mechanical low back pain with possible early degenerative disc changes.',
  'Kati Basti with Dhanwantharam Taila — 7 days. Abhyanga with Bala Taila followed by Nadi Sweda — 14 days. Internal: Yogaraja Guggulu 2 BD, Rasnasaptak Kashaya 15ml BD before food, Ashwagandha Churna 3g HS with milk. Pathya: Avoid cold food, prolonged sitting; advised lumbar exercises.',
  'Significant pain reduction (VAS 8→2) after 14 days. At 3-month follow-up, patient maintained relief with lifestyle modifications and continued Yogaraja Guggulu.',
  'Dr. Ananya Sharma',
  'SDM College of Ayurveda, Udupi',
  NULL
),
(
  'Eczema (Vicharchika) treated with Shodhana and Shamana',
  'Kayachikitsa',
  'Ayurveda',
  'Advanced',
  ARRAY['Skin', 'Pitta', 'Shodhana', 'Eczema'],
  'A 28-year-old female with recurrent eczema on both hands for 5 years, treated with Virechana followed by Shamana therapy.',
  'A 28-year-old female IT professional presented with itchy, dry, cracked skin over both palms and dorsum of hands for 5 years. History of frequent relapse after steroid cream use. Stress was identified as an aggravating factor. Family history of asthma in father.',
  'Dry, thickened, hyperpigmented patches over palms with fissures. Slight oozing on scratching. No secondary infection. Prakriti: Pitta-Kapha. Agni: Tikshna initially. Mala: Constipated. Nidra: Disturbed.',
  'Vicharchika (Pitta-Kapha predominant). Modern correlation: Chronic hand eczema / atopic dermatitis.',
  'Deepana-Pachana with Chitrakadi Vati for 5 days. Snehapana with Mahatiktaka Ghrita — 5 days (ascending dose). Virechana with Trivrit Lehya. Post-Virechana Samsarjana Krama — 5 days. Shamana: Khadirarishta 15ml BD, Manjishtadi Kashaya 15ml BD, Arogyavardhini Vati 2 BD. External: Jatyadi Taila application. Pathya: Avoid spicy, sour, fermented foods; stress management counselling.',
  'After Virechana, 60% improvement in 2 weeks. After 2 months of Shamana, lesions almost completely healed. No relapse at 6-month follow-up with maintenance dose of Khadirarishta.',
  'Dr. Priya Nair',
  'Govt. Ayurveda College, Thiruvananthapuram',
  NULL
),
(
  'Migraine (Ardhavabhedaka) managed with Nasya Karma',
  'Shalakya Tantra',
  'Ayurveda',
  'Beginner',
  ARRAY['Nasya', 'Headache', 'Vata-Pitta'],
  'A 32-year-old female with episodic migraine for 2 years, successfully managed with Nasya therapy and internal medicines.',
  'A 32-year-old female teacher presented with recurrent unilateral throbbing headache, 2-3 episodes per month for 2 years. Associated with photophobia, nausea, and occasional vomiting. Episodes last 4-8 hours. Triggers: stress, menstruation, skipped meals.',
  'No neurological deficit. Blood pressure normal. Prakriti: Vata-Pitta. Agni: Mandagni. Nidra: Light sleep. Psychological assessment: High stress levels.',
  'Ardhavabhedaka (Vata-Pitta type). Modern correlation: Migraine without aura.',
  'Abhyanga with Ksheerabala Taila to head — 7 days. Nasya with Anu Taila — 7 days (Marsha Nasya). Internal: Pathyadi Kashaya 15ml BD, Shirashooladi Vajra Rasa 1 BD, Brahmi Vati 2 HS. Lifestyle: Regular meals, adequate sleep (10 PM–6 AM), Pranayama (Anulom Vilom, Sheetali).',
  'Headache frequency reduced from 3/month to 0-1/month after 1 month. Intensity reduced (VAS 9→3). At 4-month follow-up, patient continued Pranayama and Brahmi Vati with excellent quality of life.',
  'Dr. Raghav Menon',
  'VPSV Ayurveda College, Kottakkal',
  NULL
),
(
  'Rheumatoid Arthritis (Amavata) — Integrated Panchakarma approach',
  'Panchakarma',
  'Ayurveda',
  'Advanced',
  ARRAY['Amavata', 'Joint', 'Panchakarma', 'Autoimmune'],
  'A 52-year-old female with RA (Amavata) managed with a stepwise Panchakarma protocol over 21 days with significant joint improvement.',
  'A 52-year-old homemaker with bilateral symmetrical polyarthritis for 4 years. Small joints of hands and feet involved. Morning stiffness lasting >1 hour. On MTX 10mg/week and Prednisolone 5mg OD. Wanted to explore Ayurvedic management. RF positive, ESR elevated (56 mm/hr).',
  'Swollen, tender MCP and PIP joints bilaterally. Grip strength reduced. Mild ulnar deviation of fingers. Prakriti: Kapha-Vata. Agni: Mandagni. Ama lakshanas present: Coated tongue, heaviness, anorexia. DAS28 score: 4.8 (moderate activity).',
  'Amavata (active phase with Ama predominance). Modern correlation: Seropositive Rheumatoid Arthritis, moderate disease activity.',
  'Phase 1 (Day 1-5): Langhana + Deepana with Shunthi-Guduchi Kashaya, Dry Swedana (Valuka Sweda). Phase 2 (Day 6-12): Abhyanga with Kottamchukkadi Taila + Patrapinda Sweda. Phase 3 (Day 13-19): Virechana with Eranda Taila + Trivrit. Phase 4 (Day 20-21): Basti — Ksheera Basti with Dashamoola. Internal (continued): Simhanada Guggulu 2 TID, Rasna Erandadi Kashaya 15ml BD, Amavatari Rasa 1 BD.',
  'DAS28 improved from 4.8 to 3.1 after 21 days. Morning stiffness reduced to 15 minutes. ESR reduced to 34 mm/hr at 6 weeks. Patient able to reduce Prednisolone to 2.5mg under rheumatologist supervision. Continued Ayurvedic medicines for 6 months with sustained improvement.',
  'Dr. Suresh Kumar',
  'Faculty of Ayurveda, BHU, Varanasi',
  NULL
),
(
  'Irritable Bowel Syndrome (Grahani) — Siddha approach',
  'Maruthuvam',
  'Siddha',
  'Intermediate',
  ARRAY['IBS', 'Grahani', 'Digestive', 'Siddha'],
  'A 35-year-old male with IBS-D managed with Siddha formulations focusing on digestive fire correction.',
  'A 35-year-old male software engineer with alternating diarrhoea and constipation for 3 years. Abdominal bloating, urgency, and incomplete evacuation. Symptoms worsen with stress and irregular meals. Colonoscopy normal. Previously diagnosed as IBS-D.',
  'Mild abdominal distension. Borborygmi present. No organomegaly. Tongue: Coated. Naadi: Vatha Naadi. Neerkuri: Pale yellow, frothy. Neikuri: Vatha pattern (spreads like snake).',
  'Grahani (Vatha type). Siddha classification: Vatha Grahani Noi.',
  'Agasthiyar Kuzhambu — 1 dose for Shodhana (Day 1). Mandoora Chendooram 100mg BD with honey — 30 days. Sathilinga Parpam 100mg BD with buttermilk — 30 days. Kadukkai Legiyam 5g HS — 30 days. Dietary advice: Warm, cooked foods; avoid raw salads, cold drinks, coffee.',
  'Bowel frequency normalized (from 5-6/day to 1-2/day) by week 2. Bloating resolved by week 3. At 3-month follow-up, patient remained symptom-free with dietary discipline.',
  'Dr. Tamilarasi M',
  'Govt. Siddha Medical College, Chennai',
  NULL
);

-- Done! Case Study Library tables and sample data created.
