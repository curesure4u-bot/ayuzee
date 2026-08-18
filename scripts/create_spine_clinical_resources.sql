-- ═══════════════════════════════════════════════════════════════
-- Spine Clinical Resources — Database Table
-- Stores videos, case studies, protocols, research, cost-benefit
-- Admin can add/edit/delete from the UI
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS spine_clinical_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Resource type: 'video', 'case_study', 'protocol', 'research', 'cost_benefit'
  resource_type TEXT NOT NULL CHECK (resource_type IN ('video', 'case_study', 'protocol', 'research', 'cost_benefit')),
  
  -- Common fields
  title TEXT NOT NULL,
  therapy TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  
  -- Video-specific fields
  video_url TEXT DEFAULT '',
  video_duration TEXT DEFAULT '',
  video_language TEXT DEFAULT '',
  
  -- Case study fields
  patient_profile TEXT DEFAULT '',
  condition TEXT DEFAULT '',
  vas_before INTEGER DEFAULT NULL,
  vas_after INTEGER DEFAULT NULL,
  treatment_duration TEXT DEFAULT '',
  treatment_given TEXT DEFAULT '',
  outcome TEXT DEFAULT '',
  key_learning TEXT DEFAULT '',
  follow_up TEXT DEFAULT '',
  
  -- Protocol sheet fields
  pages TEXT DEFAULT '',
  contents JSONB DEFAULT '[]'::jsonb,
  format TEXT DEFAULT '',
  
  -- Research citation fields
  authors TEXT DEFAULT '',
  journal TEXT DEFAULT '',
  publication_year INTEGER DEFAULT NULL,
  study_type TEXT DEFAULT '',
  pubmed_id TEXT DEFAULT '',
  pubmed_url TEXT DEFAULT '',
  finding TEXT DEFAULT '',
  evidence_level TEXT DEFAULT '',
  
  -- Cost-benefit fields
  cost_per_session INTEGER DEFAULT NULL,
  sessions_needed INTEGER DEFAULT NULL,
  total_cost INTEGER DEFAULT NULL,
  success_rate INTEGER DEFAULT NULL,
  avg_pain_reduction INTEGER DEFAULT NULL,
  cost_per_vas_point INTEGER DEFAULT NULL,
  roi TEXT DEFAULT '',
  break_even_sessions INTEGER DEFAULT NULL,
  compared_to_modern TEXT DEFAULT '',
  package_suggestion TEXT DEFAULT '',
  revenue_per_patient INTEGER DEFAULT NULL,
  patient_retention INTEGER DEFAULT NULL,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE spine_clinical_resources ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone authenticated can read
CREATE POLICY "spine_clinical_resources_select" ON spine_clinical_resources
  FOR SELECT TO authenticated USING (true);

-- Policy: Authenticated users can insert
CREATE POLICY "spine_clinical_resources_insert" ON spine_clinical_resources
  FOR INSERT TO authenticated WITH CHECK (true);

-- Policy: Authenticated users can update
CREATE POLICY "spine_clinical_resources_update" ON spine_clinical_resources
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Policy: Authenticated users can delete
CREATE POLICY "spine_clinical_resources_delete" ON spine_clinical_resources
  FOR DELETE TO authenticated USING (true);

-- Index for fast type-based queries
CREATE INDEX IF NOT EXISTS idx_spine_clinical_resources_type ON spine_clinical_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_spine_clinical_resources_therapy ON spine_clinical_resources(therapy);
CREATE INDEX IF NOT EXISTS idx_spine_clinical_resources_active ON spine_clinical_resources(is_active);

-- ═══════════════════════════════════════════════════════════════
-- SEED: Insert the existing hardcoded data as initial records
-- ═══════════════════════════════════════════════════════════════

-- Videos
INSERT INTO spine_clinical_resources (resource_type, title, therapy, category, video_url, video_duration, video_language, description, sort_order) VALUES
('video', 'Agnikarma Procedure — Live Demonstration', 'Agnikarma', 'Level 1', 'https://www.youtube.com/watch?v=agnikarma-demo', '8:45', 'English + Hindi', 'Step-by-step Agnikarma using Panchdhatu Shalaka on trigger points. Shows heating, application technique, and post-care.', 1),
('video', 'Agnikarma for Sciatica (Gridhrasi) — 3 Points Protocol', 'Agnikarma', 'Level 1', 'https://www.youtube.com/watch?v=agnikarma-sciatica', '12:30', 'English', 'Gluteal trigger point identification and cauterization for sciatic pain. VAS before/after shown.', 2),
('video', 'Kati Basti — Complete Setup & Procedure', 'Kati Basti', 'Level 2 (PK)', 'https://www.youtube.com/watch?v=kati-basti-procedure', '15:20', 'English', 'Dough ring preparation, oil temperature check (42°C), retention technique, and 7-day protocol explanation.', 3),
('video', 'Kati Basti Oil Selection Guide', 'Kati Basti', 'Level 2 (PK)', 'https://www.youtube.com/watch?v=kati-basti-oils', '6:15', 'English + Tamil', 'Which oil for which condition: Dhanwantaram (Vata), Sahacharadi (Kapha-Vata), Ksheerabala (disc).', 4),
('video', 'Acupuncture for Low Back Pain — BL40, BL60, Huatuojiaji', 'Acupuncture', 'Integrative', 'https://www.youtube.com/watch?v=acu-lbp-points', '10:45', 'English', 'Point location, needle depth, De Qi sensation, and retention time for lumbar pain protocol.', 5),
('video', 'Electroacupuncture for Sciatica (2/100 Hz)', 'Acupuncture', 'Integrative', 'https://www.youtube.com/watch?v=electro-acu-sciatica', '14:00', 'English', 'Electrode placement on Huatuojiaji L4-S1, frequency selection, and treatment duration for nerve pain.', 6),
('video', 'Kukundara Marma for Low Back Pain', 'Marma Therapy', 'Level 1', 'https://www.youtube.com/watch?v=kukundara-marma', '7:30', 'English + Malayalam', 'Location of Kukundara Marma (sacral), stimulation technique (clockwise pressure), and patient response.', 7),
('video', 'Krikatika Marma for Cervical Pain', 'Marma Therapy', 'Level 1', 'https://www.youtube.com/watch?v=krikatika-marma', '6:00', 'English', 'C1-C2 junction Marma point. Sustained pressure technique for neck pain and cervicogenic headache.', 8),
('video', 'Piriformis Trigger Point Release — Ischemic Compression', 'Trigger Point Therapy', 'Level 1', 'https://www.youtube.com/watch?v=piriformis-trp', '9:15', 'English', 'Palpation technique, barrier concept, 60-90 sec hold, and post-release stretching for sciatica.', 9),
('video', 'Hijama (Wet Cupping) for Back Pain — Complete Protocol', 'Hijama / Cupping', 'Level 1', 'https://www.youtube.com/watch?v=hijama-back-pain', '18:00', 'English + Arabic', 'Cup placement on BL channel, superficial scratching technique, retention, and aftercare instructions.', 10),
('video', 'Nasya Procedure for Cervicogenic Headache', 'Nasya', 'Level 2 (PK)', 'https://www.youtube.com/watch?v=nasya-headache', '8:00', 'English + Hindi', 'Facial steam, head positioning, Anu Taila administration (6 drops), and post-procedure care.', 11),
('video', 'Spine Yoga Protocol — Cat-Cow, Bird-Dog, Bridge Sequence', 'Spine Yoga', 'Yoga/Exercise', 'https://www.youtube.com/watch?v=spine-yoga-sequence', '20:00', 'English', 'Complete 20-min home exercise routine for chronic back pain patients. Follow-along format.', 12),
('video', 'McKenzie Extension Protocol for Disc Patients', 'Spine Yoga', 'Yoga/Exercise', 'https://www.youtube.com/watch?v=mckenzie-extension', '10:00', 'English', 'Prone press-ups, progression from lying to standing extension. Centralisation concept explained.', 13),
('video', 'Dry Needling Multifidus — Lumbar Spine', 'Dry Needling', 'Integrative', 'https://www.youtube.com/watch?v=dn-multifidus', '11:30', 'English', 'Needle insertion technique for deep multifidus muscle at L4-L5, local twitch response, and safety.', 14),
('video', 'Tikta Ksheer Basti — 16-Day Protocol Explained', 'Tikta Ksheer Basti', 'Level 2 (PK)', 'https://www.youtube.com/watch?v=tikta-ksheer-basti', '12:00', 'English + Sanskrit', 'Alternating Anuvasana/Niruha schedule, dravya preparation, administration technique, and diet during Basti.', 15);

-- Case Studies
INSERT INTO spine_clinical_resources (resource_type, title, therapy, category, patient_profile, condition, vas_before, vas_after, treatment_duration, treatment_given, outcome, key_learning, follow_up, sort_order) VALUES
('case_study', 'Chronic Sciatica — Farmer', 'Agnikarma', 'Level 1', 'Male, 45 yrs, Farmer', 'Chronic Sciatica (L5-S1) — 2 years, failed physio', 8, 2, '3 sessions (weekly)', 'Agnikarma on 4 gluteal trigger points + piriformis. Panchdhatu Shalaka, Samyak Dagdha achieved.', 'VAS 8→2 after 3 sessions. SLR improved from 30° to 70°. Returned to farming within 2 weeks.', 'Agnikarma works best when active trigger points are precisely identified before cauterization.', 'Monthly maintenance × 3, then as needed. Pain-free at 6 months.', 1),
('case_study', 'Tennis Elbow — IT Professional', 'Agnikarma', 'Level 1', 'Female, 38 yrs, IT Professional', 'Tennis Elbow (Lateral Epicondylitis) — 8 months, steroid injection failed', 7, 1, '4 sessions (weekly)', 'Agnikarma on extensor origin + 2 forearm trigger points. Combined with wrist stretching protocol.', 'VAS 7→1. Grip strength returned to normal. Resumed full desk work pain-free.', 'Chronic tendinopathy responds well to Agnikarma when combined with eccentric loading exercises.', 'No recurrence at 1 year. Ergonomic corrections maintained.', 2),
('case_study', 'L4-L5 Disc Bulge — Auto Driver', 'Kati Basti', 'Level 2 (PK)', 'Male, 52 yrs, Auto Driver', 'L4-L5 Disc Bulge with bilateral sciatica — MRI confirmed', 9, 3, '14 days (daily)', 'Kati Basti × 14 (Ksheerabala 101 @ 42°C) + Tikta Ksheer Basti × 16 + Patra Pinda Sweda × 7.', 'VAS 9→3. Bilateral SLR improved 25°→65°. MRI repeat at 3 months showed disc regression.', 'Disc bulges respond best to combined Kati Basti + Basti protocol. Minimum 14 days needed for disc cases.', 'Monthly Kati Basti × 6. Yoga daily. Symptom-free at 1 year.', 3),
('case_study', 'Lumbar Spondylosis — Homemaker', 'Kati Basti', 'Level 2 (PK)', 'Female, 60 yrs, Homemaker', 'Lumbar Spondylosis with morning stiffness — 5 years', 6, 1, '7 days (daily)', 'Kati Basti × 7 (Dhanwantaram Taila) + Abhyanga + Patra Pinda Sweda daily.', 'VAS 6→1. Morning stiffness reduced from 45 min to 5 min. ROM improved significantly.', 'Spondylosis in elderly responds quickly to oil therapy — Snehana principle. 7 days often sufficient.', 'Weekly self-Abhyanga. Quarterly Kati Basti. Pain-free lifestyle maintained.', 4),
('case_study', 'Cervical Spondylosis — Software Engineer', 'Acupuncture', 'Integrative', 'Male, 35 yrs, Software Engineer', 'Cervical Spondylosis with arm numbness (C5-C6) — 1 year', 7, 2, '12 sessions (3×/week × 4 weeks)', 'Acupuncture: GB20, GB21, Huatuojiaji C4-C7, LI4, LI11. Electroacupuncture 2Hz on C5-C6 points.', 'VAS 7→2. Arm numbness resolved by session 8. Full neck ROM restored. EMG improved.', 'Electroacupuncture at 2Hz specifically targets nerve regeneration. Combine with Greeva Basti for faster results.', 'Weekly maintenance × 4, then monthly. Numbness-free at 6 months.', 5),
('case_study', 'Chronic Migraine — Teacher', 'Acupuncture', 'Integrative', 'Female, 28 yrs, Teacher', 'Chronic Migraine (cervicogenic) — 3 years, 12-15 episodes/month', 8, 2, '10 sessions (2×/week × 5 weeks)', 'Acupuncture: GB20, GV20, Taiyang, LI4 + Ear seeds on Shenmen + Occiput. Nasya × 7 days added.', 'Migraine frequency: 15/month → 2/month. VAS during attacks: 8→4. Preventive control achieved.', 'Cervicogenic migraine requires both local (GB20) and distal (LI4) points. Ear seeds provide continuous stimulation.', 'Monthly sessions. Migraine diary shows sustained improvement at 1 year.', 6),
('case_study', 'Frozen Shoulder — Diabetic Patient', 'Marma Therapy', 'Level 1', 'Female, 55 yrs, Diabetic', 'Frozen Shoulder (Right) — 6 months, limited ROM', 6, 1, '10 sessions (alternate days)', 'Marma: Amsa + Amsaphalaka + Kshipra points. Combined with Pichu (oil-soaked cotton on shoulder).', 'VAS 6→1. Flexion improved 90°→160°. External rotation 10°→50°. Full ADL function restored.', 'Marma therapy is ideal for frozen shoulder in elderly/diabetic patients where aggressive manipulation is risky.', 'Home Marma self-press taught. Full recovery maintained.', 7),
('case_study', 'Upper Back Pain — Bodybuilder', 'Trigger Point + Dry Needling', 'Level 1', 'Male, 40 yrs, Bodybuilder', 'Chronic upper back pain (inter-scapular) — rhomboid/trap TrPs', 7, 1, '6 sessions (2×/week)', 'Manual TrP release sessions 1-3, then Dry Needling to persistent deep TrPs (rhomboid, middle trap).', 'VAS 7→1. Resolved within 3 weeks. Could resume training with full ROM.', 'When manual TrP therapy plateaus after 3 sessions, switch to Dry Needling for deeper muscle access.', 'Taught self-compression with Theracane. No recurrence with proper warm-up routine.', 8),
('case_study', 'Chronic LBP — Construction Worker', 'Hijama (Cupping)', 'Level 1', 'Male, 48 yrs, Construction Worker', 'Chronic low back pain with muscle spasm — Kapha-Vata type', 7, 2, '4 sessions (weekly wet cupping)', 'Wet cupping (Hijama) on BL23, BL25, and paraspinal muscles. 6 cups per session. Combined with Kati Basti.', 'VAS 7→2. Muscle spasm resolved. Dark blood initial sessions → lighter by session 4 (Dushta Rakta cleared).', 'Cup mark color indicates toxin load — darker = more stagnation. Wet cupping is superior for Rakta Dushti type pain.', 'Monthly Hijama as maintenance. Remains pain-free with physical labor.', 9);
