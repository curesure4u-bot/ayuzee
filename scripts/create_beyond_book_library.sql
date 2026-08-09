-- ═══════════════════════════════════════════════════════════
-- BEYOND.PRAXIS — Module 3: Book Library & Reading System
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════
-- SECTION 1: BOOKS CATALOG
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'mindset', 'finance', 'productivity', 'leadership',
    'communication', 'wellness', 'career', 'medical'
  )),
  summary_short TEXT NOT NULL,
  summary_full TEXT,
  key_takeaways TEXT[] DEFAULT '{}',
  apply_it_challenge TEXT,
  cover_url TEXT,
  buy_link TEXT,
  applicable_spokes TEXT[] DEFAULT '{}',
  career_stages TEXT[] DEFAULT '{}',
  rating NUMERIC(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE beyond_books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view books"
  ON beyond_books FOR SELECT USING (auth.uid() IS NOT NULL);


-- ═══════════════════════════════════════════════════════════
-- SECTION 2: USER READING LOGS
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_reading_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES beyond_books(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'want_to_read' CHECK (status IN (
    'want_to_read', 'reading', 'finished'
  )),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  review TEXT,
  key_takeaway TEXT,
  apply_it_done BOOLEAN DEFAULT false,
  apply_it_reflection TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);

ALTER TABLE beyond_reading_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reading logs"
  ON beyond_reading_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own reading logs"
  ON beyond_reading_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reading logs"
  ON beyond_reading_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reading logs"
  ON beyond_reading_logs FOR DELETE USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════
-- SECTION 3: SEED DATA — Curated Books (30 books)
-- ═══════════════════════════════════════════════════════════

INSERT INTO beyond_books (title, author, category, summary_short, key_takeaways, apply_it_challenge, applicable_spokes, career_stages) VALUES

-- MINDSET & PSYCHOLOGY
('Atomic Habits', 'James Clear', 'mindset',
 'Small changes compound into remarkable results. Build good habits using the 4 laws: make it obvious, attractive, easy, and satisfying.',
 ARRAY['1% better daily compounds massively', 'Habits are the compound interest of self-improvement', 'Focus on systems, not goals', 'Identity-based habits stick longer'],
 'Create one habit stack this week: After [current habit], I will [new tiny habit].',
 ARRAY['time', 'wellness', 'joy'], ARRAY['student', 'resident', 'consultant']),

('Mindset', 'Carol Dweck', 'mindset',
 'Fixed mindset believes talent is innate. Growth mindset knows abilities develop through effort. Choose growth.',
 ARRAY['Embrace challenges as growth opportunities', 'Effort is the path to mastery', 'Learn from criticism instead of ignoring it', '"Not yet" is more powerful than "I failed"'],
 'This week, replace "I cant do this" with "I cant do this YET" in 3 situations.',
 ARRAY['clinical', 'leadership'], ARRAY['student', 'intern', 'resident']),

('Thinking, Fast and Slow', 'Daniel Kahneman', 'mindset',
 'Two systems drive thinking: System 1 (fast, intuitive) and System 2 (slow, deliberate). Know when each leads you astray.',
 ARRAY['System 1 creates cognitive biases', 'Anchoring affects all decisions', 'Loss aversion is 2x stronger than gains', 'Slow down for important clinical decisions'],
 'Before your next big decision, write down 3 ways you might be biased.',
 ARRAY['clinical', 'leadership', 'finance'], ARRAY['resident', 'consultant', 'academic']),

('The Obstacle Is the Way', 'Ryan Holiday', 'mindset',
 'Stoic philosophy applied: every obstacle contains an opportunity. Perception, action, and will are your tools.',
 ARRAY['See obstacles as fuel, not barriers', 'Control perception before reacting', 'Persistent action beats talent', 'Amor fati — love your fate'],
 'Name your biggest current obstacle. Write 3 hidden opportunities within it.',
 ARRAY['clinical', 'leadership', 'joy'], ARRAY['resident', 'consultant']),

('Grit', 'Angela Duckworth', 'mindset',
 'Passion + perseverance over long periods beats raw talent. Grit predicts success better than IQ.',
 ARRAY['Effort counts twice: talent × effort = skill, skill × effort = achievement', 'Develop deliberate practice habits', 'Find your top-level goal and align everything', 'Gritty cultures create gritty people'],
 'Identify your top professional goal. Write 3 sub-goals that serve it.',
 ARRAY['clinical', 'time', 'leadership'], ARRAY['student', 'intern', 'resident']),

-- FINANCE & WEALTH
('The Psychology of Money', 'Morgan Housel', 'finance',
 'Money decisions are driven by behavior, not intelligence. Wealth is what you dont spend.',
 ARRAY['Saving is the gap between ego and income', 'Compounding needs time, not timing', 'Room for error is essential', 'Wealth is hidden — its the money not spent'],
 'Calculate your savings rate this month. Set a target 5% higher for next month.',
 ARRAY['finance'], ARRAY['student', 'resident', 'consultant']),

('Rich Dad Poor Dad', 'Robert Kiyosaki', 'finance',
 'Assets put money in your pocket; liabilities take it out. Build assets, reduce liabilities.',
 ARRAY['Work to learn, not just to earn', 'Buy assets that generate income', 'Financial literacy is not taught in school', 'Mind your own business alongside your job'],
 'List everything you own. Label each as asset (generates income) or liability (costs money).',
 ARRAY['finance'], ARRAY['student', 'resident', 'consultant']),

('Lets Talk Money', 'Monika Halan', 'finance',
 'India-specific personal finance guide: insurance, investments, and building a money box that works.',
 ARRAY['Get term insurance first (not endowment)', 'Emergency fund = 6 months expenses', 'SIP in index funds for long term', 'Health insurance is non-negotiable'],
 'Check: Do you have term insurance + health insurance + 6-month emergency fund? Fix the first gap.',
 ARRAY['finance'], ARRAY['resident', 'consultant']),

('I Will Teach You to Be Rich', 'Ramit Sethi', 'finance',
 'Automate your finances: set up systems so money flows to savings, investments, and guilt-free spending.',
 ARRAY['Automate transfers on payday', 'Spend extravagantly on what you love, cut mercilessly elsewhere', 'Negotiate big wins, ignore small costs', 'Start investing today, not tomorrow'],
 'Set up one automatic monthly transfer to a savings/investment account this week.',
 ARRAY['finance', 'time'], ARRAY['student', 'resident', 'consultant']),

-- PRODUCTIVITY & TIME
('Deep Work', 'Cal Newport', 'productivity',
 'Focused, distraction-free work produces rare and valuable output. Shallow work fills time but not achievement.',
 ARRAY['Schedule deep work blocks daily', 'Quit social media during work hours', 'Embrace boredom — dont fill every gap', 'Drain the shallows: batch admin tasks'],
 'Block 90 minutes tomorrow for ONE important task. No phone, no email.',
 ARRAY['time', 'clinical', 'joy'], ARRAY['student', 'resident', 'consultant', 'academic']),

('Getting Things Done', 'David Allen', 'productivity',
 'Capture everything, clarify next actions, organize by context. Your mind is for having ideas, not holding them.',
 ARRAY['Write down every open loop in your head', 'Define the very next physical action', '2-minute rule: if it takes <2 min, do it now', 'Weekly review keeps the system alive'],
 'Brain dump: Write down EVERY task, worry, and idea in your head right now (spend 10 min).',
 ARRAY['time'], ARRAY['student', 'resident', 'consultant']),

('Essentialism', 'Greg McKeown', 'productivity',
 'Do less, but better. Systematically identify what matters most and eliminate everything else.',
 ARRAY['If its not a clear YES, its a NO', 'Protect your time like your most valuable asset', 'Trade-offs are real — accept them', 'Less but better leads to breakthrough results'],
 'Say NO to one commitment this week that does not align with your top priority.',
 ARRAY['time', 'wellness', 'leadership'], ARRAY['consultant', 'academic']),

('Make Time', 'Jake Knapp', 'productivity',
 'Choose a daily highlight, eliminate distractions, energize your body. Simple framework, big results.',
 ARRAY['Pick ONE highlight each day', 'Make distractions harder to access', 'Energize: move, eat real food, sleep well', 'Reflect daily on what worked'],
 'Tonight, choose tomorrows ONE most important task. Write it on paper.',
 ARRAY['time', 'wellness'], ARRAY['student', 'resident', 'consultant']),

-- LEADERSHIP
('Leaders Eat Last', 'Simon Sinek', 'leadership',
 'Great leaders create safety. When people feel safe, they cooperate. When threatened, they protect themselves.',
 ARRAY['Circle of Safety: protect your team', 'Empathy and trust before authority', 'Leaders sacrifice comfort for their people', 'Dopamine vs serotonin vs oxytocin in teams'],
 'This week, do ONE thing that makes a colleague feel safer or more valued.',
 ARRAY['leadership', 'relationships'], ARRAY['resident', 'consultant', 'academic']),

('Dare to Lead', 'Brene Brown', 'leadership',
 'Vulnerability is not weakness — its courage. Brave leaders show up imperfectly.',
 ARRAY['Vulnerability is the birthplace of innovation', 'Clear is kind, unclear is unkind', 'Rumbling with vulnerability builds trust', 'Courage is a collection of practices'],
 'Have one honest conversation this week where you share what you dont know.',
 ARRAY['leadership', 'relationships'], ARRAY['resident', 'consultant', 'academic']),

('The Making of a Manager', 'Julie Zhuo', 'leadership',
 'Practical guide for new managers: your job is to get better outcomes from your team.',
 ARRAY['Great managers are made, not born', 'Give feedback frequently, not just annually', 'Hire for strengths, not lack of weaknesses', 'Your success = your teams success'],
 'Schedule a 15-min 1-on-1 with someone you lead this week. Ask: How can I help you?',
 ARRAY['leadership'], ARRAY['consultant', 'academic']),

-- COMMUNICATION & RELATIONSHIPS
('Crucial Conversations', 'Patterson, Grenny, McMillan & Switzler', 'communication',
 'When stakes are high, opinions differ, and emotions run strong — these tools keep dialogue productive.',
 ARRAY['Start with heart: know what you want', 'Make it safe for others to speak', 'STATE your path: Share facts, Tell story, Ask, Talk tentatively, Encourage testing', 'Master your stories — emotions come from stories, not facts'],
 'Next time you feel defensive in a conversation, pause and ask: What do I really want here?',
 ARRAY['leadership', 'relationships', 'family'], ARRAY['resident', 'consultant', 'academic']),

('Never Split the Difference', 'Chris Voss', 'communication',
 'FBI negotiator tactics applied to everyday life. Tactical empathy and calibrated questions win.',
 ARRAY['Label emotions: "It seems like..."', 'Mirrors: repeat last 3 words', 'Calibrated questions: "How am I supposed to do that?"', 'The late-night FM DJ voice calms situations'],
 'In your next negotiation (salary, vendor, even with family), use one labeling technique.',
 ARRAY['leadership', 'finance', 'relationships'], ARRAY['consultant', 'academic']),

('How to Win Friends and Influence People', 'Dale Carnegie', 'communication',
 'Timeless principles: show genuine interest, remember names, listen more than you talk, make others feel important.',
 ARRAY['Become genuinely interested in others', 'Remember that a persons name is their sweetest sound', 'Let the other person do most of the talking', 'Make people feel important — and do it sincerely'],
 'Learn and use 3 new patients/colleagues names today. Note how they respond.',
 ARRAY['relationships', 'leadership', 'clinical'], ARRAY['student', 'intern', 'resident', 'consultant']),

-- WELLNESS & RESILIENCE
('Why We Sleep', 'Matthew Walker', 'wellness',
 'Sleep is the single most effective thing you can do for brain and body health. 8 hours is non-negotiable.',
 ARRAY['Sleep deprivation impairs as much as alcohol', 'Memory consolidation happens in sleep', 'Consistent sleep/wake times matter more than duration', 'No caffeine after 2 PM'],
 'Set a consistent bedtime for 7 days. Track how you feel on day 7 vs day 1.',
 ARRAY['wellness', 'clinical', 'time'], ARRAY['student', 'resident', 'consultant']),

('Burnout', 'Emily & Amelia Nagoski', 'wellness',
 'Burnout is not caused by too much work — its caused by incomplete stress cycles. Complete the cycle to recover.',
 ARRAY['Stress and stressor are different things', 'Physical movement completes the stress cycle', 'Connection and laughter are recovery tools', 'Rest is not laziness — its a biological need'],
 'After your shift today, do 20 minutes of physical movement to complete the stress cycle.',
 ARRAY['wellness', 'time'], ARRAY['resident', 'consultant']),

('Breath', 'James Nestor', 'wellness',
 'How you breathe changes everything: anxiety, sleep, focus, and athletic performance. Nose breathing is medicine.',
 ARRAY['Nose breathing filters and humidifies air', 'Exhale longer than inhale to calm', 'Mouth taping at night improves sleep', '5.5 second inhale + 5.5 second exhale = optimal'],
 'Practice 5-5-5 breathing: 5 sec in, 5 sec hold, 5 sec out. Do 5 rounds before bed tonight.',
 ARRAY['wellness'], ARRAY['student', 'resident', 'consultant']),

('The Happiness Equation', 'Neil Pasricha', 'wellness',
 'Happiness is not a result of success — its a precondition. Be happy first, then success follows.',
 ARRAY['Want nothing + Do anything = Have everything', '20-minute replay: relive happy moments', 'Retire to something, not from something', 'Remove 3 decisions per day (automate them)'],
 'Write down 3 things that made you smile today. Do this for 7 days.',
 ARRAY['joy', 'wellness'], ARRAY['student', 'resident', 'consultant']),

-- CAREER & ENTREPRENEURSHIP
('So Good They Cant Ignore You', 'Cal Newport', 'career',
 'Dont follow your passion — build rare skills. Career capital gives you control and autonomy.',
 ARRAY['Passion follows mastery, not the reverse', 'Build career capital through deliberate practice', 'Control requires capital first', 'Mission comes after mastery'],
 'Identify one rare skill in your field. Spend 30 min this week deliberately practicing it.',
 ARRAY['clinical', 'leadership'], ARRAY['student', 'resident', 'consultant']),

('Show Your Work', 'Austin Kleon', 'career',
 'Share your process, not just your product. Build an audience by documenting your journey.',
 ARRAY['You dont have to be a genius to share', 'Document, dont create from scratch', 'Share something small every day', 'Teach what you know — it builds authority'],
 'Post one thing you learned today on any platform (LinkedIn, Twitter, WhatsApp status).',
 ARRAY['leadership', 'joy'], ARRAY['student', 'resident', 'consultant']),

('Zero to One', 'Peter Thiel', 'career',
 'True innovation creates something new (0 to 1), not copies (1 to n). Monopolies drive progress.',
 ARRAY['Competition destroys profits', 'Start small and monopolize a niche', 'Secrets exist — ask what nobody is talking about', 'Definite optimism builds the future'],
 'Identify one unmet need in healthcare that nobody is solving. Write it down.',
 ARRAY['leadership', 'finance'], ARRAY['consultant', 'academic']),

-- MEDICAL LEADERSHIP
('Being Mortal', 'Atul Gawande', 'medical',
 'Medicine should serve well-being, not just extend life. The hardest conversations are the most important.',
 ARRAY['Ask patients what a good day looks like', 'Autonomy matters more than safety at end of life', 'Having the conversation is the intervention', 'Doctors fear mortality conversations too'],
 'Ask one patient this week: What matters most to you? (Not: What is wrong with you?)',
 ARRAY['clinical', 'leadership', 'relationships'], ARRAY['resident', 'consultant']),

('The Checklist Manifesto', 'Atul Gawande', 'medical',
 'Simple checklists prevent failures in complex environments. Aviation proved it. Medicine needs it.',
 ARRAY['Checklists catch what memory misses', 'DO-CONFIRM vs READ-DO checklists', 'Keep checklists short (5-9 items)', 'Even experts benefit from checklists'],
 'Create a simple 5-item checklist for your most common procedure or daily routine.',
 ARRAY['clinical', 'time', 'leadership'], ARRAY['student', 'resident', 'consultant']),

('When Breath Becomes Air', 'Paul Kalanithi', 'medical',
 'A neurosurgeon faces terminal cancer. Memoir on finding meaning when death is certain.',
 ARRAY['Life is about meaning, not just length', 'Doctor-patient roles can reverse in an instant', 'Keep asking: What makes life worth living?', 'Write your own story while you can'],
 'Write a 3-sentence answer: What gives my work meaning beyond the paycheck?',
 ARRAY['wellness', 'joy', 'clinical'], ARRAY['student', 'resident', 'consultant', 'academic']),

('Black Box Thinking', 'Matthew Syed', 'medical',
 'Aviation learns from every failure. Medicine hides them. A culture of learning from mistakes saves lives.',
 ARRAY['Closed loops: failure → denial → repeat', 'Open loops: failure → analysis → improvement', 'Marginal gains compound over time', 'Blame culture kills learning culture'],
 'Reflect on one recent mistake or near-miss. What system change would prevent it next time?',
 ARRAY['clinical', 'leadership'], ARRAY['resident', 'consultant', 'academic'])

ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════
-- DONE! Tables created for:
-- ✅ Books Catalog (30 curated books across 8 categories)
-- ✅ Reading Logs (status, rating, review, apply-it tracking)
-- ═══════════════════════════════════════════════════════════
