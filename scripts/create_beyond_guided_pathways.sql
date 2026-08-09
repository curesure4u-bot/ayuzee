-- ═══════════════════════════════════════════════════════════
-- BEYOND.PRAXIS — Module 8: Guided Pathways
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════
-- SECTION 1: PATHWAYS (Programs)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_pathways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'finance', 'leadership', 'wellness', 'productivity',
    'communication', 'career', 'clinical', 'entrepreneurship'
  )),
  duration_weeks INTEGER NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  icon_name TEXT NOT NULL DEFAULT 'rocket',
  total_lessons INTEGER NOT NULL DEFAULT 0,
  xp_reward INTEGER NOT NULL DEFAULT 500,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE beyond_pathways ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view pathways"
  ON beyond_pathways FOR SELECT USING (auth.uid() IS NOT NULL);


-- ═══════════════════════════════════════════════════════════
-- SECTION 2: PATHWAY LESSONS
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_pathway_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pathway_id UUID NOT NULL REFERENCES beyond_pathways(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  day_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  action_item TEXT NOT NULL,
  reflection_question TEXT,
  book_recommendation TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 5,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE beyond_pathway_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view lessons"
  ON beyond_pathway_lessons FOR SELECT USING (auth.uid() IS NOT NULL);

-- ═══════════════════════════════════════════════════════════
-- SECTION 3: USER ENROLLMENTS
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_pathway_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pathway_id UUID NOT NULL REFERENCES beyond_pathways(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  progress_pct INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, pathway_id)
);

ALTER TABLE beyond_pathway_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own enrollments"
  ON beyond_pathway_enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can enroll"
  ON beyond_pathway_enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own enrollments"
  ON beyond_pathway_enrollments FOR UPDATE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════
-- SECTION 4: LESSON PROGRESS
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_lesson_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES beyond_pathway_lessons(id) ON DELETE CASCADE,
  action_done BOOLEAN DEFAULT false,
  reflection_text TEXT,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE beyond_lesson_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own completions"
  ON beyond_lesson_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can mark completions"
  ON beyond_lesson_completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own completions"
  ON beyond_lesson_completions FOR UPDATE USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════
-- SECTION 5: SEED DATA — 3 Pathways with Lessons
-- ═══════════════════════════════════════════════════════════

-- Pathway 1: Financial Freedom for Doctors (4 weeks)
INSERT INTO beyond_pathways (id, title, description, category, duration_weeks, difficulty, icon_name, total_lessons, xp_reward)
VALUES ('a1000000-0000-0000-0000-000000000001',
  'Financial Freedom for Doctors',
  'A 4-week program to take control of your finances. From emergency fund to investments — no prior knowledge needed.',
  'finance', 4, 'beginner', 'coins', 12, 500);

INSERT INTO beyond_pathway_lessons (pathway_id, week_number, day_number, title, content, action_item, reflection_question, book_recommendation, duration_minutes, sort_order) VALUES
('a1000000-0000-0000-0000-000000000001', 1, 1, 'Where Does Your Money Go?',
 'Most doctors earn well but have no idea where money disappears. The first step is awareness. You cannot manage what you do not measure. Today you start tracking.',
 'Download any expense tracker app OR open a spreadsheet. Log every rupee you spend today — coffee, auto, lunch, everything.',
 'Were you surprised by any spending today?', 'The Psychology of Money — Morgan Housel', 5, 1),
('a1000000-0000-0000-0000-000000000001', 1, 2, 'Income Mapping',
 'Doctors often have multiple income streams but treat money as one pool. Map every source: OPD, surgery, locum, online, teaching. Know exactly what comes in.',
 'Write down ALL your income sources and approximate monthly amount for each. Total them up.',
 'Which income stream has the most growth potential?', NULL, 5, 2),
('a1000000-0000-0000-0000-000000000001', 1, 3, 'The Savings Rate Truth',
 'Your savings rate matters more than your income. A doctor earning 3L saving 20% builds wealth faster than one earning 5L saving 5%. Calculate yours today.',
 'Calculate: (Income - Expenses) / Income × 100. This is your savings rate. Write it down.',
 'Is your savings rate above 20%? If not, what is one expense you could reduce?', NULL, 5, 3),
('a1000000-0000-0000-0000-000000000001', 2, 1, 'Emergency Fund First',
 'Before investing, build a safety net. 6 months of expenses in a liquid account. This prevents panic decisions during emergencies.',
 'Calculate 6 × monthly expenses. Open a separate savings account or liquid fund if you do not have one. Set up auto-transfer.',
 'How many months could you survive if income stopped today?', 'Lets Talk Money — Monika Halan', 5, 4),
('a1000000-0000-0000-0000-000000000001', 2, 2, 'Insurance: Your Financial Bodyguard',
 'Term insurance (not endowment!) protects your family. Health insurance prevents one hospitalization from wiping savings. These are non-negotiable.',
 'Check: Do you have term life insurance (10× annual income)? Do you have health insurance (₹10L+ cover)? If no to either, research options today.',
 'If something happened to you tomorrow, would your family be financially secure?', NULL, 5, 5),
('a1000000-0000-0000-0000-000000000001', 2, 3, 'Kill Bad Debt',
 'Not all debt is bad. Education loan at 8% is acceptable. Credit card debt at 36% is an emergency. List all debts and prioritize killing high-interest ones.',
 'List every debt: amount, interest rate, EMI. Mark anything above 12% as "urgent". Pay extra on the highest-rate debt this month.',
 'How much interest are you paying per month across all debts?', NULL, 5, 6),
('a1000000-0000-0000-0000-000000000001', 3, 1, 'Start a SIP Today',
 'SIP (Systematic Investment Plan) in index mutual funds is the simplest path to wealth. ₹10,000/month for 20 years at 12% = ₹1 Crore. Start today, not tomorrow.',
 'Open a mutual fund account (Groww/Zerodha/Kuvera). Start a SIP of any amount in Nifty 50 index fund. Even ₹500 counts.',
 'What stopped you from investing before today?', 'I Will Teach You to Be Rich — Ramit Sethi', 5, 7),
('a1000000-0000-0000-0000-000000000001', 3, 2, 'Tax Optimization',
 'Doctors in the old tax regime can save ₹1.5L+ through deductions: 80C (PPF/ELSS), 80D (health insurance), equipment depreciation. Every rupee saved is earned.',
 'Check which 80C/80D deductions you are already using. Identify at least one you are missing and set it up.',
 'Are you paying more tax than necessary? Could a CA save you money?', NULL, 5, 8),
('a1000000-0000-0000-0000-000000000001', 3, 3, 'Automate Everything',
 'Willpower fails. Automation works. Set up: auto-debit for SIP, auto-transfer for savings, auto-pay for insurance premiums. Money should flow to the right place without your involvement.',
 'Set up at least 2 auto-transfers: one to savings, one to investment. Remove the need for monthly decisions.',
 'What financial decisions can you eliminate by automating?', NULL, 5, 9),
('a1000000-0000-0000-0000-000000000001', 4, 1, 'Net Worth Tracking',
 'Net worth = Assets - Liabilities. Track it monthly. Watching this number grow is the most motivating financial habit. Use Beyond.Praxis Finance Toolkit.',
 'Calculate your net worth today using the Finance Toolkit. Set a calendar reminder to update it on the 1st of every month.',
 'Were you surprised by your net worth? Higher or lower than expected?', NULL, 5, 10),
('a1000000-0000-0000-0000-000000000001', 4, 2, 'The 50-30-20 Rule for Doctors',
 '50% needs (rent, EMI, food), 30% wants (travel, gadgets, eating out), 20% savings/investments. Adjust for your income — aim for 30% savings if possible.',
 'Allocate next months income into 50-30-20 buckets. Which category is currently overshooting?',
 'What is one want you could reduce to boost your savings bucket?', NULL, 5, 11),
('a1000000-0000-0000-0000-000000000001', 4, 3, 'Your Financial Plan (1-Page)',
 'Congratulations! You now know more about money than most doctors. Consolidate everything into a 1-page financial plan that guides your decisions.',
 'Write a 1-page plan: Emergency fund target, debt payoff date, monthly SIP amount, insurance status, net worth goal for 1 year from now.',
 'How does it feel to have a written financial plan? Share it with someone you trust.', 'Rich Dad Poor Dad — Robert Kiyosaki', 5, 12)
ON CONFLICT DO NOTHING;


-- Pathway 2: Master Your Energy (3 weeks)
INSERT INTO beyond_pathways (id, title, description, category, duration_weeks, difficulty, icon_name, total_lessons, xp_reward)
VALUES ('a1000000-0000-0000-0000-000000000002',
  'Master Your Energy',
  'A 3-week program to build a sustainable routine that survives night shifts, on-call, and 80-hour weeks.',
  'wellness', 3, 'beginner', 'zap', 9, 400);

INSERT INTO beyond_pathway_lessons (pathway_id, week_number, day_number, title, content, action_item, reflection_question, book_recommendation, duration_minutes, sort_order) VALUES
('a1000000-0000-0000-0000-000000000002', 1, 1, 'Your Energy Audit',
 'Energy is not about time — it is about managing your physical, emotional, and mental batteries. Today you audit where energy leaks happen.',
 'Log your energy level (1-5) every 2 hours today using the Energy Tracker tool. Note what you were doing at each point.',
 'When was your energy highest? What were you doing?', 'When — Daniel Pink', 5, 1),
('a1000000-0000-0000-0000-000000000002', 1, 2, 'Sleep: The Non-Negotiable',
 'Sleep deprivation impairs like alcohol. Residents average 5-6 hours — this is a performance AND safety issue. Protecting sleep is not lazy, it is professional.',
 'Set a fixed wake time for this week (yes, even weekends). Work backward 7.5 hours for your bedtime. Put phone away 30 min before.',
 'How many hours did you actually sleep last night? Be honest.', 'Why We Sleep — Matthew Walker', 5, 2),
('a1000000-0000-0000-0000-000000000002', 1, 3, 'Movement as Medicine',
 'You prescribe exercise to patients but skip it yourself. Even 10 minutes raises energy for 2 hours. You do not need a gym — you need a habit.',
 'Do 10 minutes of movement right now. Anything: walk, stairs, stretching, dance. Set a daily alarm for this.',
 'How did your energy feel 30 minutes after moving?', NULL, 5, 3),
('a1000000-0000-0000-0000-000000000002', 2, 1, 'Ultradian Rhythms',
 'Your body works in 90-minute cycles. After 90 min of focus, you need 15-20 min recovery. Fighting this causes fatigue. Work WITH your biology.',
 'Today, work in 90-minute blocks with 15-minute breaks. During breaks: walk, breathe, stretch. No phone scrolling.',
 'Did you notice a difference in focus quality with breaks?', NULL, 5, 4),
('a1000000-0000-0000-0000-000000000002', 2, 2, 'Fuel Your Brain',
 'What you eat directly impacts energy. Sugar spikes then crashes. Protein and fat sustain. Hydration affects cognition by 15-20%.',
 'Today: drink 2L water, eat protein at breakfast, avoid sugar crash at 3 PM. Notice the difference.',
 'What do you typically eat during your shift? Does it give or drain energy?', NULL, 5, 5),
('a1000000-0000-0000-0000-000000000002', 2, 3, 'The Post-Call Recovery Protocol',
 'After a night shift or 36-hour duty, your body needs a specific recovery sequence: sleep (4-6 hrs), hydrate, gentle movement, light meal, then normal bedtime.',
 'Write your personal post-call recovery checklist. Share it with a colleague. Use it after your next call.',
 'What do you currently do after a night shift? Is it helping or harming recovery?', NULL, 5, 6),
('a1000000-0000-0000-0000-000000000002', 3, 1, 'Energy Boundaries',
 'Say no to energy vampires: unnecessary meetings, toxic colleagues, excessive social media, saying yes to everything. Your energy is finite — protect it.',
 'Identify your top 3 energy drains this week. For each, decide: eliminate, reduce, or tolerate with boundaries.',
 'What is one thing you can stop doing this week that drains you?', 'Essentialism — Greg McKeown', 5, 7),
('a1000000-0000-0000-0000-000000000002', 3, 2, 'The Evening Ritual',
 'How you end the day determines how you start tomorrow. A wind-down ritual signals your brain to shift from work mode to rest mode.',
 'Design a 20-min evening ritual: e.g., 5 min gratitude journal, 10 min reading, 5 min breathing. Try it tonight.',
 'Do you have a clear boundary between work-you and home-you?', NULL, 5, 8),
('a1000000-0000-0000-0000-000000000002', 3, 3, 'Your Energy Blueprint',
 'You now know your chronotype, your energy patterns, and your recovery needs. Write your personal Energy Blueprint — the sustainable routine that works for YOUR life.',
 'Write your ideal daily schedule based on energy: peak hours for deep work, low hours for admin, recovery windows, and non-negotiable habits.',
 'Does this routine feel sustainable for 6 months? If not, what needs adjusting?', 'Atomic Habits — James Clear', 5, 9)
ON CONFLICT DO NOTHING;


-- Pathway 3: Effective Communication (3 weeks)
INSERT INTO beyond_pathways (id, title, description, category, duration_weeks, difficulty, icon_name, total_lessons, xp_reward)
VALUES ('a1000000-0000-0000-0000-000000000003',
  'Effective Communication',
  'A 3-week program to master difficult conversations, patient communication, and public speaking — skills every doctor needs.',
  'communication', 3, 'intermediate', 'message-circle', 9, 400);

INSERT INTO beyond_pathway_lessons (pathway_id, week_number, day_number, title, content, action_item, reflection_question, book_recommendation, duration_minutes, sort_order) VALUES
('a1000000-0000-0000-0000-000000000003', 1, 1, 'The Listening Audit',
 'Most doctors interrupt patients within 18 seconds. Active listening means hearing the full story before diagnosing. This applies to colleagues and family too.',
 'In your next 3 conversations today, do NOT interrupt for the first 60 seconds. Just listen. Note what you learn.',
 'What did you hear that you would have missed if you interrupted?', 'Crucial Conversations — Patterson et al.', 5, 1),
('a1000000-0000-0000-0000-000000000003', 1, 2, 'Empathy Before Advice',
 'People need to feel heard before they can hear you. "I can see this is frustrating" opens ears better than "You should do X." Validate first, advise second.',
 'Use one empathy statement before giving advice today: "That sounds difficult" or "I can understand why you feel that way."',
 'How did people respond differently when you validated their feelings first?', NULL, 5, 2),
('a1000000-0000-0000-0000-000000000003', 1, 3, 'The Art of Questions',
 'Open questions ("How are you coping?") generate insight. Closed questions ("Does it hurt?") confirm facts. Great communicators ask more than they tell.',
 'Replace 3 statements with questions today. Instead of "Take this medicine" try "What do you know about this medicine?" Note the difference.',
 'Did asking questions reveal information you would have missed?', NULL, 5, 3),
('a1000000-0000-0000-0000-000000000003', 2, 1, 'Delivering Bad News',
 'The SPIKES protocol: Setting, Perception, Invitation, Knowledge, Emotions, Summary. Bad news delivered well preserves trust. Delivered poorly, it destroys it.',
 'Review the SPIKES framework. Next time you deliver difficult information, mentally run through S-P-I-K-E-S before speaking.',
 'Have you ever received bad news badly? What would you have wanted done differently?', NULL, 5, 4),
('a1000000-0000-0000-0000-000000000003', 2, 2, 'Difficult Conversations',
 'Use the STATE method: Share facts, Tell your story, Ask for theirs, Talk tentatively, Encourage testing. Facts before feelings. Curiosity before conclusions.',
 'Identify one difficult conversation you have been avoiding. Write out the opening using STATE: lead with facts, not accusations.',
 'What is the conversation you most need to have but have been postponing?', 'Never Split the Difference — Chris Voss', 5, 5),
('a1000000-0000-0000-0000-000000000003', 2, 3, 'Giving Feedback',
 'The SBI model: Situation, Behavior, Impact. "In yesterdays meeting (S), when you interrupted Dr. Rao (B), it shut down the discussion (I)." Specific, not personal.',
 'Give one piece of feedback today using SBI format. It can be positive or constructive.',
 'Is feedback easier to give or receive? Why?', NULL, 5, 6),
('a1000000-0000-0000-0000-000000000003', 3, 1, 'Public Speaking Basics',
 'Structure any talk: Hook (why should they care?), 3 Points (what do you want them to know?), Call to Action (what should they do?). Simple structure, confident delivery.',
 'Prepare a 3-minute talk on any medical topic using Hook-3 Points-CTA. Practice it aloud once — even alone.',
 'What makes you nervous about public speaking? Name the specific fear.', NULL, 5, 7),
('a1000000-0000-0000-0000-000000000003', 3, 2, 'Written Communication',
 'Emails, referral letters, case reports — clear writing saves lives. Rule: one idea per paragraph, active voice, shortest word that works. Write for the reader, not yourself.',
 'Rewrite one recent email or message to be 50% shorter while keeping all meaning. Notice how clarity improves.',
 'Do you write to impress or to communicate? There is a difference.', 'Show Your Work — Austin Kleon', 5, 8),
('a1000000-0000-0000-0000-000000000003', 3, 3, 'Your Communication Toolkit',
 'You now have: active listening, empathy statements, open questions, SPIKES, STATE, SBI, and Hook-3-CTA. These 7 tools cover 90% of professional communication.',
 'Write your personal Top 3 communication rules on a card. Keep it where you can see it daily. Share one tool with a colleague.',
 'Which communication skill will make the biggest difference in your career?', 'How to Win Friends and Influence People — Dale Carnegie', 5, 9)
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════
-- DONE! Tables and seed data created for:
-- ✅ Pathways (3 programs: Finance 4wk, Energy 3wk, Communication 3wk)
-- ✅ Pathway Lessons (30 total lessons with actions + reflections)
-- ✅ Enrollments (user progress tracking)
-- ✅ Lesson Completions (per-lesson done status)
-- ═══════════════════════════════════════════════════════════
