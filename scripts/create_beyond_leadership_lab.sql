-- ═══════════════════════════════════════════════════════════
-- BEYOND.PRAXIS — Module 4: Leadership Skills Lab
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════
-- SECTION 1: LEADERSHIP SCENARIOS (Interactive branching)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_leadership_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  context TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 5),
  category TEXT NOT NULL CHECK (category IN (
    'self_leadership', 'team_leadership', 'conflict',
    'communication', 'decision_making', 'delegation'
  )),
  options JSONB NOT NULL DEFAULT '[]',
  -- options: [{id: "a", text: "...", feedback: "...", score: 1-5, style: "directive|coaching|supportive|delegating"}]
  best_option_id TEXT,
  learning_point TEXT NOT NULL,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE beyond_leadership_scenarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view scenarios"
  ON beyond_leadership_scenarios FOR SELECT USING (auth.uid() IS NOT NULL);


-- ═══════════════════════════════════════════════════════════
-- SECTION 2: USER SCENARIO PROGRESS
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_leadership_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scenario_id UUID NOT NULL REFERENCES beyond_leadership_scenarios(id) ON DELETE CASCADE,
  chosen_option_id TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 5),
  feedback TEXT,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, scenario_id)
);

ALTER TABLE beyond_leadership_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON beyond_leadership_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own progress"
  ON beyond_leadership_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress"
  ON beyond_leadership_progress FOR UPDATE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════
-- SECTION 3: LEADERSHIP ASSESSMENTS (Style finder)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_leadership_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  primary_style TEXT NOT NULL CHECK (primary_style IN (
    'directive', 'coaching', 'supportive', 'delegating'
  )),
  secondary_style TEXT,
  level INTEGER NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 5),
  strengths TEXT[] DEFAULT '{}',
  growth_areas TEXT[] DEFAULT '{}',
  scenarios_completed INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  assessed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE beyond_leadership_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own assessments"
  ON beyond_leadership_assessments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own assessments"
  ON beyond_leadership_assessments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own assessments"
  ON beyond_leadership_assessments FOR UPDATE USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════
-- SECTION 4: SEED DATA — 12 Leadership Scenarios
-- ═══════════════════════════════════════════════════════════

INSERT INTO beyond_leadership_scenarios (title, description, context, level, category, options, best_option_id, learning_point) VALUES

-- LEVEL 1: Self-Leadership
('The Overwhelmed Resident',
 'You have 3 pending case reports, rounds in 30 minutes, and your senior just asked you to cover an extra shift tomorrow.',
 'You are a PG resident. Your workload is exceeding your capacity. You feel overwhelmed and anxious.',
 1, 'self_leadership',
 '[{"id":"a","text":"Say yes to everything and hope you manage somehow","feedback":"This leads to burnout and poor quality work. Saying yes to everything means saying no to quality.","score":1,"style":"directive"},{"id":"b","text":"Prioritize: do rounds now, negotiate the shift, schedule case reports tonight","feedback":"Good prioritization! You addressed the immediate need, negotiated what you could, and planned the rest.","score":4,"style":"coaching"},{"id":"c","text":"Tell your senior you cannot do anything extra right now","feedback":"While boundary-setting is important, flat refusal without alternatives damages relationships.","score":2,"style":"directive"},{"id":"d","text":"Prioritize rounds, ask a colleague to split the extra shift, block 2 hours tonight for reports","feedback":"Excellent! You prioritized, delegated what you could, and created a realistic plan. This is mature self-leadership.","score":5,"style":"delegating"}]',
 'd',
 'Self-leadership starts with honest prioritization. You cannot do everything well simultaneously. Negotiate, delegate, and plan.'),

('The Procrastination Trap',
 'You have been postponing writing your thesis chapter for 3 weeks. The deadline is in 10 days.',
 'Every time you sit down to write, you find something more urgent. Your advisor sent a reminder email.',
 1, 'self_leadership',
 '[{"id":"a","text":"Wait for motivation to strike and then write in one burst","feedback":"Motivation is unreliable. Professionals work on schedule, not on inspiration. This approach fails 80% of the time.","score":1,"style":"directive"},{"id":"b","text":"Block 45 minutes daily for writing, no negotiation, and tell your advisor your plan","feedback":"Perfect! Small daily blocks are more effective than marathon sessions. Communicating your plan creates accountability.","score":5,"style":"coaching"},{"id":"c","text":"Ask for a deadline extension","feedback":"Sometimes necessary, but without a new work system, you will procrastinate again. It treats the symptom, not the cause.","score":2,"style":"supportive"},{"id":"d","text":"Start with just 10 minutes today — the smallest possible action","feedback":"Good start! The 2-minute/10-minute rule breaks procrastination. But you also need a sustainable daily system.","score":4,"style":"supportive"}]',
 'b',
 'Discipline beats motivation. Block time, communicate plans, and show up daily even when you do not feel like it.'),

-- LEVEL 2: One-on-One Leadership
('The Underperforming Intern',
 'An intern under your supervision has been making repeated small errors in patient documentation.',
 'You are a senior resident. The intern seems eager but careless. Other staff are noticing.',
 2, 'team_leadership',
 '[{"id":"a","text":"Report the errors to the HOD and let them handle it","feedback":"Escalating without first attempting to help is a leadership failure. You missed a coaching opportunity.","score":1,"style":"directive"},{"id":"b","text":"Sit down privately, show specific examples, ask what support they need, and set clear expectations","feedback":"Excellent! Private, specific, supportive, and clear. This is coaching leadership at its best.","score":5,"style":"coaching"},{"id":"c","text":"Correct each error as it happens and move on","feedback":"Reactive correction without a pattern conversation means the root cause persists. They need a system, not patches.","score":2,"style":"directive"},{"id":"d","text":"Create a documentation checklist and ask them to use it for 2 weeks","feedback":"Good tool! But without understanding WHY the errors happen, the checklist might not address the real issue.","score":3,"style":"supportive"}]',
 'b',
 'Effective feedback is private, specific, and forward-looking. Ask before telling. Understand the root cause before prescribing solutions.'),

('The Crying Nurse',
 'A nurse breaks down crying after you pointed out a medication error in front of the ward.',
 'You corrected her publicly because the error was serious. Now she is upset and other staff are watching.',
 2, 'communication',
 '[{"id":"a","text":"Apologize publicly for embarrassing her, then discuss the error privately later","feedback":"Good! Public apology shows humility. Private follow-up addresses the clinical issue properly.","score":4,"style":"supportive"},{"id":"b","text":"Ignore the crying and continue with rounds — professionalism means no emotions at work","feedback":"Ignoring emotional distress is not professionalism — it is emotional ignorance. Your team will fear you, not respect you.","score":1,"style":"directive"},{"id":"c","text":"Take her aside immediately, acknowledge the public correction was wrong, address the error privately","feedback":"Best response. Immediate acknowledgment, private space, dual focus on relationship AND clinical safety.","score":5,"style":"coaching"},{"id":"d","text":"Ask another nurse to comfort her while you continue working","feedback":"Delegating emotional support is appropriate sometimes, but you caused this — you should own it.","score":2,"style":"delegating"}]',
 'c',
 'Praise in public, correct in private. When you make a leadership mistake, own it immediately. Emotional safety enables clinical safety.'),

-- LEVEL 3: Team Leadership
('The Toxic Senior',
 'A senior colleague consistently undermines junior staff in meetings. Team morale is dropping.',
 'You are a department lead. This colleague is clinically excellent but interpersonally destructive.',
 3, 'conflict',
 '[{"id":"a","text":"Have a direct private conversation: name the behavior, share its impact, request change","feedback":"Excellent! Direct, private, behavior-focused, and clear. This is courageous leadership.","score":5,"style":"coaching"},{"id":"b","text":"Ignore it — they are senior and clinically brilliant, it is not worth the conflict","feedback":"Avoiding conflict does not make it disappear. Silent tolerance normalizes toxicity. Your juniors lose trust in you.","score":1,"style":"supportive"},{"id":"c","text":"Raise it in the next team meeting as a general reminder about respect","feedback":"Indirect approaches often backfire. The person may not realize it is about them, or may feel ambushed.","score":2,"style":"directive"},{"id":"d","text":"Document instances, then raise it formally with administration","feedback":"Documentation is wise, but jumping to formal process without a private conversation first shows lack of courage.","score":3,"style":"directive"}]',
 'a',
 'Addressing toxic behavior requires courage. Private conversation first, name the specific behavior, describe impact, request change. Escalate only if direct approach fails.'),

('The Delegation Dilemma',
 'You have 5 tasks due this week. You cannot do all of them well yourself, but your team members are less experienced.',
 'You are a new consultant. Your team has 2 residents and 1 intern. You are used to doing everything yourself.',
 3, 'delegation',
 '[{"id":"a","text":"Do everything yourself — it is faster and the quality will be better","feedback":"This is the trap of competence. You will burn out, your team will not grow, and you become a bottleneck.","score":1,"style":"directive"},{"id":"b","text":"Assign 3 tasks to team members with clear instructions, deadlines, and check-in points","feedback":"Perfect delegation! Clear expectations, appropriate support level, and built-in quality checks.","score":5,"style":"delegating"},{"id":"c","text":"Assign everything and check results at the end of the week","feedback":"Delegating without support or checkpoints is abdication, not delegation. Juniors may fail silently.","score":2,"style":"delegating"},{"id":"d","text":"Do the 2 most critical tasks yourself, delegate 3 with training support","feedback":"Good prioritization! Keeping critical tasks while developing others shows situational awareness.","score":4,"style":"coaching"}]',
 'b',
 'Delegation is not dumping work — it is developing others. Clear expectations + appropriate support + check-ins = trust building.'),

-- LEVEL 4: Department/System Leadership
('The Budget Cut',
 'Hospital administration wants to cut your department budget by 20%. You must choose what to sacrifice.',
 'You are a department head. Options: reduce CME funds, cut a staff position, or reduce equipment maintenance budget.',
 4, 'decision_making',
 '[{"id":"a","text":"Cut CME funds — staff development can wait until finances improve","feedback":"Short-term thinking. Cutting learning creates a knowledge debt that compounds. Staff morale also drops.","score":2,"style":"directive"},{"id":"b","text":"Present a counter-proposal: 10% cut now + revenue improvement plan to avoid remaining 10%","feedback":"Excellent! Negotiating with alternatives shows leadership thinking. You protect your team while meeting organizational needs.","score":5,"style":"coaching"},{"id":"c","text":"Cut the staff position — fewer people, less cost","feedback":"Losing people is losing capability. Unless the role is truly redundant, this damages team capacity and trust.","score":1,"style":"directive"},{"id":"d","text":"Reduce all three areas by smaller amounts to spread the pain","feedback":"Fair but mediocre. Spreading cuts thin may weaken everything without truly protecting anything.","score":3,"style":"supportive"}]',
 'b',
 'Leaders negotiate creatively. Do not accept constraints as given — propose alternatives. Protect your team while showing organizational awareness.'),

('The Change Resistance',
 'You want to implement a new digital patient record system. Half your team resists the change.',
 'You are leading a department of 20 staff. The older doctors say the current paper system works fine.',
 4, 'communication',
 '[{"id":"a","text":"Mandate the change with a deadline — they will adapt eventually","feedback":"Force creates compliance, not commitment. Resistance will go underground and sabotage adoption.","score":2,"style":"directive"},{"id":"b","text":"Find 2-3 early adopters, let them succeed visibly, then expand gradually with peer support","feedback":"Perfect change leadership! Start small, create proof, use social influence, and expand with support.","score":5,"style":"coaching"},{"id":"c","text":"Drop the idea — too much resistance means it is not the right time","feedback":"Avoiding necessary change because of resistance is not leadership. Every change faces resistance.","score":1,"style":"supportive"},{"id":"d","text":"Hold a meeting to explain the benefits and address all concerns before implementing","feedback":"Good step but insufficient alone. Information does not overcome emotional resistance. People need to see it work.","score":3,"style":"supportive"}]',
 'b',
 'Change leadership: start small, create visible wins, use peer influence to expand. People trust what they see working, not what they are told will work.'),

-- LEVEL 5: Thought Leadership
('The Ethical Dilemma',
 'A pharma company offers sponsorship for your CME conference in exchange for featuring their product prominently.',
 'The money would fund a much-needed event. Without it, you cannot hold the conference this year.',
 5, 'decision_making',
 '[{"id":"a","text":"Accept the sponsorship with clear disclosure and balanced content","feedback":"Good transparency, but even disclosed bias affects perception. Consider if featuring their product serves education.","score":3,"style":"supportive"},{"id":"b","text":"Decline and find alternative funding through registration fees and institutional support","feedback":"Maintains complete independence. Harder financially but protects long-term credibility and education quality.","score":4,"style":"coaching"},{"id":"c","text":"Accept the money but maintain full editorial control — do not feature their product","feedback":"Excellent! You secure funding while maintaining integrity. Clear boundaries protect both parties.","score":5,"style":"delegating"},{"id":"d","text":"Accept without conditions — the content will be unbiased regardless of who pays","feedback":"Naive. Financial relationships create unconscious bias. Without explicit safeguards, influence creeps in.","score":1,"style":"directive"}]',
 'c',
 'Ethical leadership means finding creative solutions that serve multiple values. Accept support with clear boundaries rather than all-or-nothing thinking.'),

('The Public Failure',
 'A treatment protocol you championed publicly has shown poor outcomes in a new study.',
 'You published papers supporting this approach. Your reputation is tied to it. The new evidence is strong.',
 5, 'self_leadership',
 '[{"id":"a","text":"Publicly acknowledge the new evidence, update your recommendation, and share what you learned","feedback":"Highest integrity. Admitting you were wrong in public is the hallmark of a true thought leader. Trust increases.","score":5,"style":"coaching"},{"id":"b","text":"Wait for more studies before changing your position","feedback":"Sometimes wise, sometimes avoidance. If the evidence is strong, delay harms patients and credibility.","score":2,"style":"supportive"},{"id":"c","text":"Quietly stop recommending it without publicly addressing the change","feedback":"Avoids short-term discomfort but creates long-term credibility damage. People notice inconsistency.","score":2,"style":"directive"},{"id":"d","text":"Critique the methodology of the new study to defend your position","feedback":"If methodology is truly flawed, this is appropriate. But if you are defending ego rather than science, this damages trust permanently.","score":1,"style":"directive"}]',
 'a',
 'Intellectual humility is the highest form of leadership. Admitting error publicly builds more trust than being right. Evidence > Ego.'),

('The Mentee Who Surpasses You',
 'A doctor you mentored is now getting more recognition, publications, and speaking invitations than you.',
 'They publicly credit you as their mentor. You feel a mix of pride and unexpected jealousy.',
 5, 'self_leadership',
 '[{"id":"a","text":"Celebrate their success publicly and continue mentoring others","feedback":"This is legacy leadership. Your impact multiplies through those you develop. Pride in their success IS your success.","score":5,"style":"supportive"},{"id":"b","text":"Compete harder — publish more, seek more speaking slots","feedback":"Competition with your mentee poisons the relationship and signals insecurity. Collaboration beats competition.","score":2,"style":"directive"},{"id":"c","text":"Distance yourself and focus on your own path","feedback":"Withdrawal from a successful relationship wastes accumulated social capital. Your network is your net worth.","score":2,"style":"directive"},{"id":"d","text":"Acknowledge your jealousy privately, then actively amplify their work","feedback":"Excellent self-awareness! Naming the emotion defuses it. Actively supporting them despite envy is emotional maturity.","score":4,"style":"coaching"}]',
 'a',
 'True leadership is measured by how many people you elevate above yourself. Your legacy is their success.'),

('The Vision Statement',
 'You are asked to define the 5-year vision for AYUSH integration in modern healthcare at a national forum.',
 'This will shape policy and influence thousands of practitioners. The stakes are high.',
 5, 'communication',
 '[{"id":"a","text":"Present a bold, specific vision with measurable milestones and call to collective action","feedback":"Outstanding! Bold + specific + measurable + collective. This inspires AND provides a roadmap.","score":5,"style":"coaching"},{"id":"b","text":"Share a safe, consensus-based vision that everyone will agree with","feedback":"Safe visions inspire no one. Thought leaders take positions, not polls. Boldness with evidence wins.","score":2,"style":"supportive"},{"id":"c","text":"Focus on problems and challenges facing the field","feedback":"Problem-naming without vision-casting creates anxiety without direction. Lead toward something, not away from something.","score":2,"style":"directive"},{"id":"d","text":"Share your personal journey and let the vision emerge from your story","feedback":"Good storytelling, but a forum needs direction, not just narrative. Combine personal story with clear direction.","score":3,"style":"supportive"}]',
 'a',
 'Thought leadership requires boldness. Specific visions with measurable milestones and collective calls to action create movements. Safe statements create nothing.')

ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════
-- DONE! Tables created for:
-- ✅ Leadership Scenarios (12 interactive scenarios, levels 1-5)
-- ✅ Leadership Progress (user choices + scores)
-- ✅ Leadership Assessments (style + level tracking)
-- ═══════════════════════════════════════════════════════════
