-- ═══════════════════════════════════════════════════════════
-- College Chapters — Discussion Forums per College
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════

-- 1. College Chapters (one per college)
CREATE TABLE IF NOT EXISTS college_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_name TEXT NOT NULL UNIQUE,
  description TEXT,
  state TEXT,
  course TEXT DEFAULT 'BAMS',
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_count INTEGER DEFAULT 1 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE college_chapters ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view chapters
DROP POLICY IF EXISTS "Authenticated users can view chapters" ON college_chapters;
CREATE POLICY "Authenticated users can view chapters"
  ON college_chapters FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Any authenticated user can create a chapter
DROP POLICY IF EXISTS "Authenticated users can create chapters" ON college_chapters;
CREATE POLICY "Authenticated users can create chapters"
  ON college_chapters FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Only creator can update chapter info
DROP POLICY IF EXISTS "Creator can update chapter" ON college_chapters;
CREATE POLICY "Creator can update chapter"
  ON college_chapters FOR UPDATE
  USING (auth.uid() = created_by);

-- 2. Chapter Members (tracks who joined which chapter)
CREATE TABLE IF NOT EXISTS chapter_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID NOT NULL REFERENCES college_chapters(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(chapter_id, user_id)
);

ALTER TABLE chapter_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view members" ON chapter_members;
CREATE POLICY "Authenticated users can view members"
  ON chapter_members FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can join chapters" ON chapter_members;
CREATE POLICY "Users can join chapters"
  ON chapter_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can leave chapters" ON chapter_members;
CREATE POLICY "Users can leave chapters"
  ON chapter_members FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Chapter Posts (discussion threads)
CREATE TABLE IF NOT EXISTS chapter_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID NOT NULL REFERENCES college_chapters(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  reply_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE chapter_posts ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view posts
DROP POLICY IF EXISTS "Authenticated users can view posts" ON chapter_posts;
CREATE POLICY "Authenticated users can view posts"
  ON chapter_posts FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Members can create posts (simplified: any auth user for now)
DROP POLICY IF EXISTS "Authenticated users can create posts" ON chapter_posts;
CREATE POLICY "Authenticated users can create posts"
  ON chapter_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Authors can update own posts
DROP POLICY IF EXISTS "Authors can update own posts" ON chapter_posts;
CREATE POLICY "Authors can update own posts"
  ON chapter_posts FOR UPDATE
  USING (auth.uid() = user_id);

-- Authors can delete own posts
DROP POLICY IF EXISTS "Authors can delete own posts" ON chapter_posts;
CREATE POLICY "Authors can delete own posts"
  ON chapter_posts FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Chapter Replies (comments on posts)
CREATE TABLE IF NOT EXISTS chapter_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES chapter_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE chapter_replies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view replies" ON chapter_replies;
CREATE POLICY "Authenticated users can view replies"
  ON chapter_replies FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can create replies" ON chapter_replies;
CREATE POLICY "Authenticated users can create replies"
  ON chapter_replies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authors can delete own replies" ON chapter_replies;
CREATE POLICY "Authors can delete own replies"
  ON chapter_replies FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chapter_members_chapter
  ON chapter_members(chapter_id);

CREATE INDEX IF NOT EXISTS idx_chapter_members_user
  ON chapter_members(user_id);

CREATE INDEX IF NOT EXISTS idx_chapter_posts_chapter
  ON chapter_posts(chapter_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chapter_replies_post
  ON chapter_replies(post_id, created_at ASC);

-- 6. Function to auto-increment member_count on join
CREATE OR REPLACE FUNCTION increment_chapter_member_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE college_chapters SET member_count = member_count + 1, updated_at = NOW()
  WHERE id = NEW.chapter_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_chapter_member_join ON chapter_members;
CREATE TRIGGER on_chapter_member_join
  AFTER INSERT ON chapter_members
  FOR EACH ROW EXECUTE FUNCTION increment_chapter_member_count();

-- 7. Function to auto-decrement member_count on leave
CREATE OR REPLACE FUNCTION decrement_chapter_member_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE college_chapters SET member_count = GREATEST(member_count - 1, 0), updated_at = NOW()
  WHERE id = OLD.chapter_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_chapter_member_leave ON chapter_members;
CREATE TRIGGER on_chapter_member_leave
  AFTER DELETE ON chapter_members
  FOR EACH ROW EXECUTE FUNCTION decrement_chapter_member_count();

-- 8. Function to auto-increment reply_count
CREATE OR REPLACE FUNCTION increment_post_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chapter_posts SET reply_count = reply_count + 1, updated_at = NOW()
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_chapter_reply_created ON chapter_replies;
CREATE TRIGGER on_chapter_reply_created
  AFTER INSERT ON chapter_replies
  FOR EACH ROW EXECUTE FUNCTION increment_post_reply_count();

-- Done! College Chapters tables created successfully.
-- Students can now create/join chapters, post discussions, and reply.
-- ═══════════════════════════════════════════════════════════
-- Inter-College Quiz Competitions
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════

-- 1. Quiz Competitions (each competition is a timed event between colleges)
CREATE TABLE IF NOT EXISTS quiz_competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL DEFAULT 'General',
  difficulty TEXT NOT NULL DEFAULT 'Medium' CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  time_limit_seconds INTEGER NOT NULL DEFAULT 600,
  max_participants INTEGER DEFAULT 100,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE quiz_competitions ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view competitions
DROP POLICY IF EXISTS "Authenticated users can view competitions" ON quiz_competitions;
CREATE POLICY "Authenticated users can view competitions"
  ON quiz_competitions FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Admins/creators can create competitions
DROP POLICY IF EXISTS "Authenticated users can create competitions" ON quiz_competitions;
CREATE POLICY "Authenticated users can create competitions"
  ON quiz_competitions FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Creator can update
DROP POLICY IF EXISTS "Creator can update competition" ON quiz_competitions;
CREATE POLICY "Creator can update competition"
  ON quiz_competitions FOR UPDATE
  USING (auth.uid() = created_by);

-- 2. Competition Participants (students who join a competition)
CREATE TABLE IF NOT EXISTS competition_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES quiz_competitions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  college_name TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(competition_id, user_id)
);

ALTER TABLE competition_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view participants" ON competition_participants;
CREATE POLICY "Authenticated users can view participants"
  ON competition_participants FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can join competitions" ON competition_participants;
CREATE POLICY "Users can join competitions"
  ON competition_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can leave competitions" ON competition_participants;
CREATE POLICY "Users can leave competitions"
  ON competition_participants FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Competition Scores (submitted after completing the quiz)
CREATE TABLE IF NOT EXISTS competition_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES quiz_competitions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  college_name TEXT,
  score INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  time_taken_seconds INTEGER NOT NULL DEFAULT 0,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(competition_id, user_id)
);

ALTER TABLE competition_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view scores" ON competition_scores;
CREATE POLICY "Authenticated users can view scores"
  ON competition_scores FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can submit own scores" ON competition_scores;
CREATE POLICY "Users can submit own scores"
  ON competition_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_competitions_status
  ON quiz_competitions(status, starts_at DESC);

CREATE INDEX IF NOT EXISTS idx_competition_participants_comp
  ON competition_participants(competition_id);

CREATE INDEX IF NOT EXISTS idx_competition_participants_user
  ON competition_participants(user_id);

CREATE INDEX IF NOT EXISTS idx_competition_scores_comp
  ON competition_scores(competition_id, score DESC);

CREATE INDEX IF NOT EXISTS idx_competition_scores_college
  ON competition_scores(competition_id, college_name, score DESC);

-- 5. View: College Leaderboard (aggregated scores per college per competition)
CREATE OR REPLACE VIEW competition_college_leaderboard AS
SELECT
  competition_id,
  college_name,
  COUNT(*) AS participants,
  SUM(score) AS total_score,
  AVG(score)::INTEGER AS avg_score,
  MAX(score) AS top_score,
  SUM(correct_answers) AS total_correct,
  SUM(total_questions) AS total_attempted
FROM competition_scores
WHERE college_name IS NOT NULL
GROUP BY competition_id, college_name
ORDER BY total_score DESC;

-- Done! Inter-College Quiz Competition tables ready.
-- Questions are stored as JSONB array in quiz_competitions.questions:
-- [{ "id": 1, "question": "...", "options": ["A","B","C","D"], "correct": 0 }, ...]
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
DROP POLICY IF EXISTS "Authenticated users can view published case studies" ON case_studies;
CREATE POLICY "Authenticated users can view published case studies"
  ON case_studies FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_published = true);

-- Authenticated users can create case studies
DROP POLICY IF EXISTS "Authenticated users can create case studies" ON case_studies;
CREATE POLICY "Authenticated users can create case studies"
  ON case_studies FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Authors can update their own case studies
DROP POLICY IF EXISTS "Authors can update own case studies" ON case_studies;
CREATE POLICY "Authors can update own case studies"
  ON case_studies FOR UPDATE
  USING (auth.uid() = created_by);

-- Authors can delete their own case studies
DROP POLICY IF EXISTS "Authors can delete own case studies" ON case_studies;
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

DROP POLICY IF EXISTS "Users can view own bookmarks" ON case_study_bookmarks;
CREATE POLICY "Users can view own bookmarks"
  ON case_study_bookmarks FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can bookmark case studies" ON case_study_bookmarks;
CREATE POLICY "Users can bookmark case studies"
  ON case_study_bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove own bookmarks" ON case_study_bookmarks;
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

DROP TRIGGER IF EXISTS on_case_study_bookmarked ON case_study_bookmarks;
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

DROP TRIGGER IF EXISTS on_case_study_unbookmarked ON case_study_bookmarks;
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
DROP POLICY IF EXISTS "Authenticated users can view active store items" ON coin_store_items;
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

DROP POLICY IF EXISTS "Users can view own redemptions" ON coin_redemptions;
CREATE POLICY "Users can view own redemptions"
  ON coin_redemptions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own redemptions" ON coin_redemptions;
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

DROP TRIGGER IF EXISTS on_coin_redemption ON coin_redemptions;
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
-- ═══════════════════════════════════════════════════════════
-- Study Planner & Notes — Personal notes and study session tracking
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════

-- 1. Student Notes (personal study notes per subject)
CREATE TABLE IF NOT EXISTS student_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  subject TEXT NOT NULL DEFAULT 'General',
  tags TEXT[] DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE student_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notes" ON student_notes;
CREATE POLICY "Users can view own notes"
  ON student_notes FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own notes" ON student_notes;
CREATE POLICY "Users can create own notes"
  ON student_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notes" ON student_notes;
CREATE POLICY "Users can update own notes"
  ON student_notes FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own notes" ON student_notes;
CREATE POLICY "Users can delete own notes"
  ON student_notes FOR DELETE
  USING (auth.uid() = user_id);

-- 2. Student Study Sessions (track study time per subject)
CREATE TABLE IF NOT EXISTS student_study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL DEFAULT 'General',
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  notes TEXT,
  studied_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE student_study_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own sessions" ON student_study_sessions;
CREATE POLICY "Users can view own sessions"
  ON student_study_sessions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own sessions" ON student_study_sessions;
CREATE POLICY "Users can create own sessions"
  ON student_study_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own sessions" ON student_study_sessions;
CREATE POLICY "Users can delete own sessions"
  ON student_study_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_student_notes_user
  ON student_notes(user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_student_notes_subject
  ON student_notes(user_id, subject);

CREATE INDEX IF NOT EXISTS idx_student_study_sessions_user
  ON student_study_sessions(user_id, studied_at DESC);

CREATE INDEX IF NOT EXISTS idx_student_study_sessions_subject
  ON student_study_sessions(user_id, subject, studied_at DESC);

-- Done! Study Planner tables created.
-- Students can now create notes and log study sessions per subject.
-- ═══════════════════════════════════════════════════════════
-- Mentorship & Connect — Students find mentors and exchange guidance
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════

-- 1. Mentors (senior students / alumni who offer mentorship)
CREATE TABLE IF NOT EXISTS student_mentors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  college_name TEXT,
  specialization TEXT NOT NULL DEFAULT 'General',
  year_of_study INTEGER,
  bio TEXT,
  subjects TEXT[] DEFAULT '{}',
  is_available BOOLEAN DEFAULT true,
  max_mentees INTEGER DEFAULT 5,
  current_mentees INTEGER DEFAULT 0,
  rating NUMERIC(2,1) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE student_mentors ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view available mentors
DROP POLICY IF EXISTS "Authenticated users can view mentors" ON student_mentors;
CREATE POLICY "Authenticated users can view mentors"
  ON student_mentors FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Users can register as mentor
DROP POLICY IF EXISTS "Users can register as mentor" ON student_mentors;
CREATE POLICY "Users can register as mentor"
  ON student_mentors FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Mentors can update their own profile
DROP POLICY IF EXISTS "Mentors can update own profile" ON student_mentors;
CREATE POLICY "Mentors can update own profile"
  ON student_mentors FOR UPDATE
  USING (auth.uid() = user_id);

-- 2. Mentorship Requests (student requests a mentor)
CREATE TABLE IF NOT EXISTS mentorship_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES student_mentors(id) ON DELETE CASCADE,
  mentee_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mentee_name TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(mentor_id, mentee_user_id)
);

ALTER TABLE mentorship_requests ENABLE ROW LEVEL SECURITY;

-- Mentees can view their own requests
DROP POLICY IF EXISTS "Mentees can view own requests" ON mentorship_requests;
CREATE POLICY "Mentees can view own requests"
  ON mentorship_requests FOR SELECT
  USING (auth.uid() = mentee_user_id);

-- Mentors can view requests sent to them
DROP POLICY IF EXISTS "Mentors can view incoming requests" ON mentorship_requests;
CREATE POLICY "Mentors can view incoming requests"
  ON mentorship_requests FOR SELECT
  USING (
    auth.uid() IN (SELECT user_id FROM student_mentors WHERE id = mentor_id)
  );

-- Users can create requests
DROP POLICY IF EXISTS "Users can create mentorship requests" ON mentorship_requests;
CREATE POLICY "Users can create mentorship requests"
  ON mentorship_requests FOR INSERT
  WITH CHECK (auth.uid() = mentee_user_id);

-- Mentors can update request status
DROP POLICY IF EXISTS "Mentors can update request status" ON mentorship_requests;
CREATE POLICY "Mentors can update request status"
  ON mentorship_requests FOR UPDATE
  USING (
    auth.uid() IN (SELECT user_id FROM student_mentors WHERE id = mentor_id)
  );

-- 3. Mentorship Messages (between mentor and mentee)
CREATE TABLE IF NOT EXISTS mentorship_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES mentorship_requests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE mentorship_messages ENABLE ROW LEVEL SECURITY;

-- Both parties can view messages
DROP POLICY IF EXISTS "Participants can view messages" ON mentorship_messages;
CREATE POLICY "Participants can view messages"
  ON mentorship_messages FOR SELECT
  USING (
    auth.uid() IN (
      SELECT mentee_user_id FROM mentorship_requests WHERE id = request_id
      UNION
      SELECT sm.user_id FROM mentorship_requests mr JOIN student_mentors sm ON sm.id = mr.mentor_id WHERE mr.id = request_id
    )
  );

-- Both parties can send messages (only on accepted requests)
DROP POLICY IF EXISTS "Participants can send messages" ON mentorship_messages;
CREATE POLICY "Participants can send messages"
  ON mentorship_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM mentorship_requests WHERE id = request_id AND status = 'accepted'
    )
  );

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_student_mentors_available
  ON student_mentors(is_available, specialization);

CREATE INDEX IF NOT EXISTS idx_mentorship_requests_mentor
  ON mentorship_requests(mentor_id, status);

CREATE INDEX IF NOT EXISTS idx_mentorship_requests_mentee
  ON mentorship_requests(mentee_user_id, status);

CREATE INDEX IF NOT EXISTS idx_mentorship_messages_request
  ON mentorship_messages(request_id, created_at ASC);

-- 5. Trigger: increment current_mentees on accept
CREATE OR REPLACE FUNCTION on_mentorship_accepted()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    UPDATE student_mentors SET current_mentees = current_mentees + 1, updated_at = NOW()
    WHERE id = NEW.mentor_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_mentorship_request_accepted ON mentorship_requests;
CREATE TRIGGER on_mentorship_request_accepted
  AFTER UPDATE ON mentorship_requests
  FOR EACH ROW EXECUTE FUNCTION on_mentorship_accepted();

-- 6. Seed sample mentors (skipped — fake user IDs not in auth.users)
-- Mentors will be created when real users register as mentors via the app.

-- Done! Mentorship tables created with sample data.
-- ═══════════════════════════════════════════════════════════
-- Study Groups — Subject-wise groups for collaborative learning
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════

-- 1. Study Groups
CREATE TABLE IF NOT EXISTS study_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT 'General',
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_count INTEGER DEFAULT 1 NOT NULL,
  is_public BOOLEAN DEFAULT true,
  max_members INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view public groups" ON study_groups;
CREATE POLICY "Authenticated users can view public groups"
  ON study_groups FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_public = true);

DROP POLICY IF EXISTS "Authenticated users can create groups" ON study_groups;
CREATE POLICY "Authenticated users can create groups"
  ON study_groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Creator can update group" ON study_groups;
CREATE POLICY "Creator can update group"
  ON study_groups FOR UPDATE
  USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Creator can delete group" ON study_groups;
CREATE POLICY "Creator can delete group"
  ON study_groups FOR DELETE
  USING (auth.uid() = created_by);

-- 2. Study Group Members
CREATE TABLE IF NOT EXISTS study_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view group members" ON study_group_members;
CREATE POLICY "Authenticated users can view group members"
  ON study_group_members FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can join groups" ON study_group_members;
CREATE POLICY "Users can join groups"
  ON study_group_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can leave groups" ON study_group_members;
CREATE POLICY "Users can leave groups"
  ON study_group_members FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Study Group Posts (shared content within a group)
CREATE TABLE IF NOT EXISTS study_group_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  post_type TEXT NOT NULL DEFAULT 'discussion' CHECK (post_type IN ('discussion', 'resource', 'question', 'announcement')),
  resource_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE study_group_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view group posts" ON study_group_posts;
CREATE POLICY "Authenticated users can view group posts"
  ON study_group_posts FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Members can create posts" ON study_group_posts;
CREATE POLICY "Members can create posts"
  ON study_group_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authors can delete own posts" ON study_group_posts;
CREATE POLICY "Authors can delete own posts"
  ON study_group_posts FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_study_groups_subject
  ON study_groups(subject, member_count DESC);

CREATE INDEX IF NOT EXISTS idx_study_group_members_group
  ON study_group_members(group_id);

CREATE INDEX IF NOT EXISTS idx_study_group_members_user
  ON study_group_members(user_id);

CREATE INDEX IF NOT EXISTS idx_study_group_posts_group
  ON study_group_posts(group_id, created_at DESC);

-- 5. Triggers for member count
CREATE OR REPLACE FUNCTION increment_study_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE study_groups SET member_count = member_count + 1, updated_at = NOW()
  WHERE id = NEW.group_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_study_group_member_join ON study_group_members;
CREATE TRIGGER on_study_group_member_join
  AFTER INSERT ON study_group_members
  FOR EACH ROW EXECUTE FUNCTION increment_study_group_member_count();

CREATE OR REPLACE FUNCTION decrement_study_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE study_groups SET member_count = GREATEST(member_count - 1, 0), updated_at = NOW()
  WHERE id = OLD.group_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_study_group_member_leave ON study_group_members;
CREATE TRIGGER on_study_group_member_leave
  AFTER DELETE ON study_group_members
  FOR EACH ROW EXECUTE FUNCTION decrement_study_group_member_count();

-- Done! Study Groups tables created.
-- ═══════════════════════════════════════════════════════════
-- Ask a Vaidya — Students ask practicing doctors questions
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════

-- 1. Vaidya Questions (asked by students)
CREATE TABLE IF NOT EXISTS vaidya_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT 'General',
  tags TEXT[] DEFAULT '{}',
  is_resolved BOOLEAN DEFAULT false,
  answer_count INTEGER DEFAULT 0,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vaidya_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view questions" ON vaidya_questions;
CREATE POLICY "Authenticated users can view questions"
  ON vaidya_questions FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can create questions" ON vaidya_questions;
CREATE POLICY "Authenticated users can create questions"
  ON vaidya_questions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authors can update own questions" ON vaidya_questions;
CREATE POLICY "Authors can update own questions"
  ON vaidya_questions FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authors can delete own questions" ON vaidya_questions;
CREATE POLICY "Authors can delete own questions"
  ON vaidya_questions FOR DELETE
  USING (auth.uid() = user_id);

-- 2. Vaidya Answers (from doctors or senior students)
CREATE TABLE IF NOT EXISTS vaidya_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES vaidya_questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_accepted BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vaidya_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view answers" ON vaidya_answers;
CREATE POLICY "Authenticated users can view answers"
  ON vaidya_answers FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can create answers" ON vaidya_answers;
CREATE POLICY "Authenticated users can create answers"
  ON vaidya_answers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authors can update own answers" ON vaidya_answers;
CREATE POLICY "Authors can update own answers"
  ON vaidya_answers FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authors can delete own answers" ON vaidya_answers;
CREATE POLICY "Authors can delete own answers"
  ON vaidya_answers FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Question Upvotes (track who upvoted)
CREATE TABLE IF NOT EXISTS vaidya_question_upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES vaidya_questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(question_id, user_id)
);

ALTER TABLE vaidya_question_upvotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view upvotes" ON vaidya_question_upvotes;
CREATE POLICY "Users can view upvotes"
  ON vaidya_question_upvotes FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can upvote" ON vaidya_question_upvotes;
CREATE POLICY "Users can upvote"
  ON vaidya_question_upvotes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove upvote" ON vaidya_question_upvotes;
CREATE POLICY "Users can remove upvote"
  ON vaidya_question_upvotes FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_vaidya_questions_subject
  ON vaidya_questions(subject, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_vaidya_questions_resolved
  ON vaidya_questions(is_resolved, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_vaidya_answers_question
  ON vaidya_answers(question_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_vaidya_upvotes_question
  ON vaidya_question_upvotes(question_id);

-- 5. Trigger: auto-increment answer_count
CREATE OR REPLACE FUNCTION increment_vaidya_answer_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE vaidya_questions SET answer_count = answer_count + 1, updated_at = NOW()
  WHERE id = NEW.question_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_vaidya_answer_created ON vaidya_answers;
CREATE TRIGGER on_vaidya_answer_created
  AFTER INSERT ON vaidya_answers
  FOR EACH ROW EXECUTE FUNCTION increment_vaidya_answer_count();

-- 6. Trigger: auto-increment/decrement upvotes
CREATE OR REPLACE FUNCTION increment_vaidya_question_upvotes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE vaidya_questions SET upvotes = upvotes + 1 WHERE id = NEW.question_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_vaidya_question_upvoted ON vaidya_question_upvotes;
CREATE TRIGGER on_vaidya_question_upvoted
  AFTER INSERT ON vaidya_question_upvotes
  FOR EACH ROW EXECUTE FUNCTION increment_vaidya_question_upvotes();

CREATE OR REPLACE FUNCTION decrement_vaidya_question_upvotes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE vaidya_questions SET upvotes = GREATEST(upvotes - 1, 0) WHERE id = OLD.question_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_vaidya_question_unupvoted ON vaidya_question_upvotes;
CREATE TRIGGER on_vaidya_question_unupvoted
  AFTER DELETE ON vaidya_question_upvotes
  FOR EACH ROW EXECUTE FUNCTION decrement_vaidya_question_upvotes();

-- Done! Ask a Vaidya tables created.
-- ═══════════════════════════════════════════════════════════
-- Internship Journal — Digital log of clinical postings
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════

-- 1. Internship Journal Entries
CREATE TABLE IF NOT EXISTS internship_journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  posting_date DATE NOT NULL DEFAULT CURRENT_DATE,
  department TEXT NOT NULL,
  hospital_name TEXT,
  supervisor_name TEXT,
  cases_seen INTEGER DEFAULT 0,
  procedures_performed TEXT[] DEFAULT '{}',
  diagnosis_observed TEXT[] DEFAULT '{}',
  learnings TEXT NOT NULL,
  challenges TEXT,
  supervisor_feedback TEXT,
  hours_spent NUMERIC(4,1) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE internship_journal_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own journal entries" ON internship_journal_entries;
CREATE POLICY "Users can view own journal entries"
  ON internship_journal_entries FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own entries" ON internship_journal_entries;
CREATE POLICY "Users can create own entries"
  ON internship_journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own entries" ON internship_journal_entries;
CREATE POLICY "Users can update own entries"
  ON internship_journal_entries FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own entries" ON internship_journal_entries;
CREATE POLICY "Users can delete own entries"
  ON internship_journal_entries FOR DELETE
  USING (auth.uid() = user_id);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_internship_journal_user_date
  ON internship_journal_entries(user_id, posting_date DESC);

CREATE INDEX IF NOT EXISTS idx_internship_journal_department
  ON internship_journal_entries(user_id, department);

-- Done! Internship Journal table created.
-- Students can log daily clinical postings with departments, procedures, and learnings.
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

DROP POLICY IF EXISTS "Authenticated users can view active listings" ON internship_listings;
CREATE POLICY "Authenticated users can view active listings"
  ON internship_listings FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = true);

DROP POLICY IF EXISTS "Authenticated users can create listings" ON internship_listings;
CREATE POLICY "Authenticated users can create listings"
  ON internship_listings FOR INSERT
  WITH CHECK (auth.uid() = posted_by);

DROP POLICY IF EXISTS "Posters can update own listings" ON internship_listings;
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

DROP POLICY IF EXISTS "Users can view own applications" ON internship_applications;
CREATE POLICY "Users can view own applications"
  ON internship_applications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can apply" ON internship_applications;
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

DROP TRIGGER IF EXISTS on_internship_application ON internship_applications;
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
-- ═══════════════════════════════════════════════════════════
-- Research Collaboration — Find co-authors, multi-center studies
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════

-- 1. Research Projects (looking for collaborators)
CREATE TABLE IF NOT EXISTS research_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  research_area TEXT NOT NULL DEFAULT 'General',
  looking_for TEXT NOT NULL,
  skills_needed TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed')),
  collaborator_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE research_projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view projects" ON research_projects;
CREATE POLICY "Authenticated users can view projects"
  ON research_projects FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can create projects" ON research_projects;
CREATE POLICY "Users can create projects"
  ON research_projects FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authors can update own projects" ON research_projects;
CREATE POLICY "Authors can update own projects"
  ON research_projects FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authors can delete own projects" ON research_projects;
CREATE POLICY "Authors can delete own projects"
  ON research_projects FOR DELETE USING (auth.uid() = user_id);

-- 2. Collaboration Requests
CREATE TABLE IF NOT EXISTS research_collaboration_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

ALTER TABLE research_collaboration_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Requesters can view own requests" ON research_collaboration_requests;
CREATE POLICY "Requesters can view own requests"
  ON research_collaboration_requests FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Project owners can view requests" ON research_collaboration_requests;
CREATE POLICY "Project owners can view requests"
  ON research_collaboration_requests FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM research_projects WHERE id = project_id)
  );

DROP POLICY IF EXISTS "Users can send requests" ON research_collaboration_requests;
CREATE POLICY "Users can send requests"
  ON research_collaboration_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_research_projects_status ON research_projects(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_research_collab_requests_project ON research_collaboration_requests(project_id);

-- 4. Trigger
CREATE OR REPLACE FUNCTION increment_research_collaborator_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' THEN
    UPDATE research_projects SET collaborator_count = collaborator_count + 1 WHERE id = NEW.project_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_research_collab_accepted ON research_collaboration_requests;
CREATE TRIGGER on_research_collab_accepted
  AFTER UPDATE ON research_collaboration_requests
  FOR EACH ROW EXECUTE FUNCTION increment_research_collaborator_count();

-- Done!
-- ═══════════════════════════════════════════════════════════
-- Startup Incubator — AYUSH startup ideas + mentorship
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS startup_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'HealthTech' CHECK (category IN ('HealthTech', 'EdTech', 'Wellness', 'E-Commerce', 'SaaS', 'Social Impact', 'Other')),
  stage TEXT NOT NULL DEFAULT 'idea' CHECK (stage IN ('idea', 'prototype', 'mvp', 'launched')),
  looking_for TEXT[] DEFAULT '{}',
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE startup_ideas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view ideas" ON startup_ideas;
CREATE POLICY "Authenticated users can view ideas" ON startup_ideas FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Users can create ideas" ON startup_ideas;
CREATE POLICY "Users can create ideas" ON startup_ideas FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Authors can update own ideas" ON startup_ideas;
CREATE POLICY "Authors can update own ideas" ON startup_ideas FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Authors can delete own ideas" ON startup_ideas;
CREATE POLICY "Authors can delete own ideas" ON startup_ideas FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS startup_idea_upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL REFERENCES startup_ideas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(idea_id, user_id)
);

ALTER TABLE startup_idea_upvotes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view upvotes" ON startup_idea_upvotes;
CREATE POLICY "Users can view upvotes" ON startup_idea_upvotes FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Users can upvote" ON startup_idea_upvotes;
CREATE POLICY "Users can upvote" ON startup_idea_upvotes FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can remove upvote" ON startup_idea_upvotes;
CREATE POLICY "Users can remove upvote" ON startup_idea_upvotes FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_startup_ideas_category ON startup_ideas(category, upvotes DESC);

CREATE OR REPLACE FUNCTION increment_startup_upvotes() RETURNS TRIGGER AS $$
BEGIN UPDATE startup_ideas SET upvotes = upvotes + 1 WHERE id = NEW.idea_id; RETURN NEW; END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS on_startup_upvoted ON startup_idea_upvotes;
CREATE TRIGGER on_startup_upvoted AFTER INSERT ON startup_idea_upvotes FOR EACH ROW EXECUTE FUNCTION increment_startup_upvotes();

CREATE OR REPLACE FUNCTION decrement_startup_upvotes() RETURNS TRIGGER AS $$
BEGIN UPDATE startup_ideas SET upvotes = GREATEST(upvotes - 1, 0) WHERE id = OLD.idea_id; RETURN OLD; END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS on_startup_unupvoted ON startup_idea_upvotes;
CREATE TRIGGER on_startup_unupvoted AFTER DELETE ON startup_idea_upvotes FOR EACH ROW EXECUTE FUNCTION decrement_startup_upvotes();

-- Done!
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

DROP POLICY IF EXISTS "Authenticated users can view active gigs" ON freelance_gigs;
CREATE POLICY "Authenticated users can view active gigs" ON freelance_gigs FOR SELECT USING (auth.uid() IS NOT NULL AND is_active = true);
DROP POLICY IF EXISTS "Users can post gigs" ON freelance_gigs;
CREATE POLICY "Users can post gigs" ON freelance_gigs FOR INSERT WITH CHECK (auth.uid() = posted_by);
DROP POLICY IF EXISTS "Posters can update" ON freelance_gigs;
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

DROP POLICY IF EXISTS "Users can view own applications" ON freelance_gig_applications;
CREATE POLICY "Users can view own applications" ON freelance_gig_applications FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can apply" ON freelance_gig_applications;
CREATE POLICY "Users can apply" ON freelance_gig_applications FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_freelance_gigs_active ON freelance_gigs(is_active, category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_freelance_gig_apps_user ON freelance_gig_applications(user_id);

CREATE OR REPLACE FUNCTION increment_gig_application_count() RETURNS TRIGGER AS $$
BEGIN UPDATE freelance_gigs SET application_count = application_count + 1 WHERE id = NEW.gig_id; RETURN NEW; END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS on_gig_application ON freelance_gig_applications;
CREATE TRIGGER on_gig_application AFTER INSERT ON freelance_gig_applications FOR EACH ROW EXECUTE FUNCTION increment_gig_application_count();

-- Seed
INSERT INTO freelance_gigs (title, description, category, budget, duration, skills_required, is_remote, poster_name, posted_by) VALUES
('Ayurveda Blog Writer Needed', 'Write 4 SEO-optimized blog articles per month on Ayurvedic wellness topics for our clinic website.', 'Content Writing', '₹3,000/month', 'Ongoing', ARRAY['Ayurveda knowledge', 'SEO writing', 'English'], true, 'Dr. Ananya Clinic', NULL),
('Social Media Manager for Ayush Clinic', 'Manage Instagram and Facebook pages. Create reels, posts, and stories about Ayurvedic treatments.', 'Social Media', '₹5,000/month', '3 months', ARRAY['Canva', 'Instagram Reels', 'Content planning'], true, 'Vedic Wellness Center', NULL),
('Research Assistant — Literature Review', 'Help compile a systematic review on Panchakarma for metabolic syndrome. 20 hours total.', 'Research Assistant', '₹8,000 (one-time)', '2 weeks', ARRAY['PubMed search', 'Academic writing', 'Zotero'], true, 'BHU Research Lab', NULL),
('Hindi-English Medical Translation', 'Translate 50 pages of Ayurvedic clinical guidelines from Hindi to English.', 'Translation', '₹4,000', '1 week', ARRAY['Hindi fluency', 'Medical terminology', 'English writing'], true, 'AIIA Publications', NULL);

-- Done!
