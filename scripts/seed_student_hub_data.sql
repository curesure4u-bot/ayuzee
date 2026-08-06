-- AYUZEE STUDENT HUB - SEED DATA
-- Run this in Supabase SQL Editor

-- 1. QUIZ COMPETITIONS
WITH u AS (SELECT id AS uid FROM auth.users LIMIT 1)
INSERT INTO quiz_competitions (title, description, subject, difficulty, status, questions, time_limit_seconds, max_participants, starts_at, ends_at, created_by)
SELECT * FROM (
  VALUES
  ('Dravyaguna Grand Challenge 2025', 'Test your knowledge of Ayurvedic pharmacology. 20 questions on classical drug groups and Karma of important dravyas.', 'Dravyaguna', 'Medium', 'upcoming', '[{"id":1,"question":"Which rasa predominates in Haritaki?","options":["Madhura","Kashaya","Tikta","Lavana"],"correct":1}]'::jsonb, 900, 200, (CURRENT_DATE + INTERVAL '7 days')::timestamptz, (CURRENT_DATE + INTERVAL '8 days')::timestamptz, (SELECT uid FROM u)),
  ('Panchakarma Procedures Quiz', 'Inter-college quiz on Vamana, Virechana, Basti, Nasya, Raktamokshana procedures.', 'Panchakarma', 'Hard', 'upcoming', '[{"id":1,"question":"Which Sneha is used for Mrudu Koshtha?","options":["Eranda Taila","Trivrit Lehya","Aragwadha","Tila Taila"],"correct":0}]'::jsonb, 1200, 150, (CURRENT_DATE + INTERVAL '14 days')::timestamptz, (CURRENT_DATE + INTERVAL '15 days')::timestamptz, (SELECT uid FROM u)),
  ('Rachana Sharira Speed Quiz', 'Quick-fire anatomy quiz - 15 questions in 10 minutes on Marma, Asthi, Sandhi, and Srotas.', 'Rachana Sharir', 'Easy', 'upcoming', '[{"id":1,"question":"Total Marma points according to Sushruta?","options":["107","108","117","101"],"correct":0}]'::jsonb, 600, 300, (CURRENT_DATE + INTERVAL '3 days')::timestamptz, (CURRENT_DATE + INTERVAL '4 days')::timestamptz, (SELECT uid FROM u)),
  ('Samhita Siddhanta Challenge', 'Classical Ayurveda concepts from Sutra Sthana, Nidana Sthana, Vimana Sthana.', 'General', 'Hard', 'active', '[{"id":1,"question":"Trividha Roga Ayatana?","options":["Asatmyendriyartha","Ahara Vihara","Tridosha","Nija Agantuja"],"correct":0}]'::jsonb, 1500, 100, (CURRENT_DATE - INTERVAL '1 day')::timestamptz, (CURRENT_DATE + INTERVAL '2 days')::timestamptz, (SELECT uid FROM u))
) AS t(a,b,c,d,e,f,g,h,i,j,k);

-- 2. RESEARCH PROJECTS
WITH u AS (SELECT id AS uid FROM auth.users LIMIT 1)
INSERT INTO research_projects (user_id, title, description, research_area, looking_for, skills_needed, status)
VALUES
((SELECT uid FROM u), 'Systematic Review: Panchakarma for Metabolic Syndrome', 'Looking for co-authors to compile a systematic review on Panchakarma interventions for metabolic syndrome markers.', 'Clinical Research', 'Co-authors for data extraction and statistical analysis', ARRAY['PubMed search', 'PRISMA methodology', 'Statistical analysis'], 'open'),
((SELECT uid FROM u), 'Multi-Center RCT: Kati Basti vs Physiotherapy for Lumbar Disc', 'Planning a randomized controlled trial comparing Kati Basti with conventional physiotherapy for lumbar disc prolapse.', 'Clinical Trials', 'Clinical investigators at AYUSH hospitals', ARRAY['GCP certification', 'Patient recruitment', 'Clinical documentation'], 'open'),
((SELECT uid FROM u), 'AI-Assisted Prakriti Classification Using Facial Image Analysis', 'Building a machine learning model to classify Prakriti from facial photographs. Need Ayurveda experts to label training data.', 'AI and Technology', 'Ayurveda practitioners to validate dataset', ARRAY['Prakriti assessment', 'Data labeling', 'Python'], 'open'),
((SELECT uid FROM u), 'Phytochemical Analysis of Ashwagandha Cultivars', 'Comparing withanolide content in Ashwagandha samples from Maharashtra, Rajasthan, MP, and Karnataka.', 'Pharmacognosy', 'Students near cultivation areas who can collect samples', ARRAY['Plant identification', 'Sample collection', 'HPLC basics'], 'open'),
((SELECT uid FROM u), 'Survey: Mental Health Among BAMS Interns', 'Conducting a pan-India survey on stress, burnout, and coping mechanisms among BAMS internship students.', 'Public Health', 'Student representatives from various BAMS colleges', ARRAY['Survey distribution', 'Data collection', 'Basic statistics'], 'open');

-- 3. STARTUP IDEAS
WITH u AS (SELECT id AS uid FROM auth.users LIMIT 1)
INSERT INTO startup_ideas (user_id, title, tagline, description, category, stage, looking_for)
VALUES
((SELECT uid FROM u), 'PrakritiAI', 'AI-powered Dosha analysis from selfie and questionnaire', 'A mobile app that uses facial analysis plus brief questionnaire to give instant Prakriti assessment with personalized recommendations.', 'HealthTech', 'prototype', ARRAY['Mobile developer', 'UI/UX designer', 'Ayurveda consultant']),
((SELECT uid FROM u), 'VaidyaConnect', 'Uber for Panchakarma therapists - home visits', 'On-demand platform connecting certified Panchakarma therapists with patients for home-based treatments.', 'HealthTech', 'idea', ARRAY['Full-stack developer', 'Operations manager', 'Marketing']),
((SELECT uid FROM u), 'HerbBox', 'Monthly Ayurvedic herb subscription - farm to doorstep', 'Subscription box delivering fresh authenticated medicinal herbs directly from organic farms to consumers.', 'E-Commerce', 'mvp', ARRAY['Supply chain manager', 'Farmer partnerships', 'Packaging design']),
((SELECT uid FROM u), 'StudyBuddy BAMS', 'Gamified BAMS exam prep with AI tutoring', 'Mobile-first learning platform for BAMS students with spaced repetition flashcards and AI-generated explanations.', 'EdTech', 'idea', ARRAY['React Native developer', 'Content writers', 'AI/ML engineer']),
((SELECT uid FROM u), 'GreenPharm', 'Blockchain-verified supply chain for Ayurvedic medicines', 'QR-scannable verification system for Ayurvedic medicines tracking from raw herb to finished product.', 'SaaS', 'idea', ARRAY['Blockchain developer', 'Pharma advisor', 'Business development']),
((SELECT uid FROM u), 'AyurWaste', 'Recycling Ayurvedic manufacturing by-products', 'Converting Panchakarma oil waste and herbal residues into eco-friendly fertilizers, soaps, and incense.', 'Social Impact', 'prototype', ARRAY['Chemical engineer', 'Marketing specialist', 'Clinic partnerships']);

-- 4. STUDY GROUPS
WITH u AS (SELECT id AS uid FROM auth.users LIMIT 1)
INSERT INTO study_groups (name, subject, description, created_by, member_count, is_public, max_members)
VALUES
('Kayachikitsa Warriors', 'Kayachikitsa', 'Study group for Internal Medicine. Discuss cases, share notes, prep for exams together.', (SELECT uid FROM u), 1, true, 100),
('Dravyaguna Explorers', 'Dravyaguna', 'Deep dive into Ayurvedic pharmacology. Mnemonics, drug groups, and clinical applications.', (SELECT uid FROM u), 1, true, 80),
('Panchakarma Practice Hub', 'Panchakarma', 'Discuss procedures, share clinical posting experiences, and prep for practical exams.', (SELECT uid FROM u), 1, true, 60),
('Shalya and Shalakya Combined', 'Shalya Tantra', 'Study group covering Surgery and ENT. Instrument identification and operative techniques.', (SELECT uid FROM u), 1, true, 50),
('Research Methodology Circle', 'Research', 'For students working on dissertations. Study designs, statistical methods, and publication strategies.', (SELECT uid FROM u), 1, true, 40),
('BAMS Final Year Exam Prep', 'General', 'Intensive exam preparation group. Daily MCQs, previous year papers, viva preparation.', (SELECT uid FROM u), 1, true, 200);

-- 5. ADDITIONAL INTERNSHIP LISTINGS
INSERT INTO internship_listings (title, hospital_name, location, department, description, requirements, duration_weeks, stipend, spots_available, application_deadline, posted_by)
VALUES
('Dravyaguna Pharmacognosy Lab Internship', 'AIIA New Delhi', 'New Delhi', 'Dravyaguna', 'Work in the pharmacognosy lab - plant identification, TLC/HPLC analysis of herbal drugs.', 'BAMS 3rd year or above. Interest in pharmaceutical sciences.', 6, 'Rs 10000/month', 3, (CURRENT_DATE + INTERVAL '40 days')::DATE, NULL),
('Yoga Therapy Clinical Posting', 'Morarji Desai National Institute of Yoga', 'New Delhi', 'Yoga and Naturopathy', 'Clinical exposure in therapeutic yoga for musculoskeletal disorders and mental health.', 'BAMS/BNYS students. Basic yoga practice background.', 4, 'Unpaid (Certificate provided)', 8, (CURRENT_DATE + INTERVAL '25 days')::DATE, NULL),
('Siddha Medicine OPD and IPD Posting', 'National Institute of Siddha', 'Chennai, Tamil Nadu', 'Sirappu Maruthuvam', 'Exposure to Siddha special medicine including Varmam therapy and Thokkanam.', 'BAMS/BSMS students.', 8, 'Rs 7000/month', 5, (CURRENT_DATE + INTERVAL '50 days')::DATE, NULL);

-- 6. ADDITIONAL FREELANCE GIGS
INSERT INTO freelance_gigs (title, description, category, budget, duration, skills_required, is_remote, poster_name, posted_by)
VALUES
('Create 30 MCQs for Panchakarma Quiz Module', 'Need 30 high-quality MCQs on Panchakarma with explanations for each answer.', 'Content Writing', 'Rs 2500 (one-time)', '1 week', ARRAY['Panchakarma expertise', 'Question framing', 'English'], true, 'Ayuzee Quiz Team', NULL),
('Video Editor - Ayurveda Anatomy Animations', 'Edit and animate 10 short videos explaining Marma points and Dhatu formation.', 'Video Editing', 'Rs 12000', '3 weeks', ARRAY['After Effects', 'Motion graphics', 'Medical animation'], true, 'AyurLearn Studios', NULL),
('Graphic Design - Herb Identification Cards', 'Design digital flashcards for 50 medicinal plants with properties and clinical use.', 'Graphic Design', 'Rs 8000', '2 weeks', ARRAY['Canva/Figma', 'Botanical illustration', 'Print-ready design'], true, 'Dravyaguna Department SDM', NULL);

-- DONE! Sample data seeded.
