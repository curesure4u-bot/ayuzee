import { GraduationCap } from "lucide-react";
import { GuideLayout, StepCard, TipBox, KeyboardShortcuts } from "./GuideLayout";

const StudentHubGuide = () => {
  return (
    <GuideLayout
      title="Student Hub Playbook"
      subtitle="BAMS student platform: quizzes, competitions, study groups, internships, research, and gamification"
      icon={GraduationCap}
      color="bg-indigo-500/10 text-indigo-600"
      estimatedTime="15 min"
      roles={["Student", "Faculty", "Admin"]}
    >
      <h2>1. Getting Started</h2>
      <StepCard number={1} title="Access Student Hub">
        <ul>
          <li>Navigate to <code>/student/auth</code> to sign up or log in.</li>
          <li>Student dashboard at <code>/student</code> shows: Courses, Daily Quiz, Progress, and Community.</li>
          <li>Available to: BAMS students, Ayurveda interns, PG scholars, and AYUSH researchers.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Dashboard overview">
        <ul>
          <li><strong>My Progress:</strong> Coins earned, quiz streaks, certificates, leaderboard rank.</li>
          <li><strong>Today:</strong> Daily quiz, pending study plan tasks, upcoming webinars.</li>
          <li><strong>Quick links:</strong> Courses, Jobs, Research, Colleges, Ask Vaidya.</li>
        </ul>
      </StepCard>

      <h2>2. Learning & Courses</h2>
      <StepCard number={1} title="Browse courses">
        <ul>
          <li>Navigate to <strong>Student → Courses</strong>.</li>
          <li>Categories: Clinical subjects, Research methodology, Pharmacology, Practice management.</li>
          <li>Each course has: Video lectures, Reading material, Quizzes, and Certificate on completion.</li>
          <li>Filter by: Subject, Difficulty, Duration, and CME credit eligibility.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Webinars & live sessions">
        <ul>
          <li>Navigate to <strong>Student → Webinars</strong>.</li>
          <li>Live sessions with AYUSH experts: Case discussions, Guest lectures, Practical demonstrations.</li>
          <li>Register → Attend → Certificate of participation auto-generated.</li>
          <li>Recorded sessions available for replay.</li>
        </ul>
      </StepCard>

      <h2>3. Quizzes & Competitions</h2>
      <StepCard number={1} title="Daily Quiz">
        <ul>
          <li>Navigate to <strong>Student → Daily Quiz</strong>.</li>
          <li>5 questions daily from AYUSH subjects — rotate across all topics.</li>
          <li>Earn coins for correct answers. Maintain streaks for bonus rewards.</li>
          <li>Questions sourced from: Previous year papers, clinical scenarios, pharmacology MCQs.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Subject-wise Quiz">
        <ul>
          <li>Navigate to <strong>Student → Subject Quiz</strong>.</li>
          <li>Deep-dive into specific subjects: Dravyaguna, Kayachikitsa, Shalyatantra, etc.</li>
          <li>Timed quizzes (15-30 min) with immediate scoring and explanations.</li>
          <li>Track performance across subjects to identify weak areas.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Quiz Competitions">
        <ul>
          <li>Navigate to <strong>Student → Competitions</strong>.</li>
          <li>Inter-college competitions with live leaderboards.</li>
          <li>Winners receive: Coins, certificates, sponsor prizes, and recognition.</li>
          <li>Format: MCQ rounds + Clinical case solving + Viva (video submission).</li>
        </ul>
      </StepCard>

      <StepCard number={4} title="Weekly Challenge">
        <ul>
          <li>Navigate to <strong>Student → Weekly Challenge</strong>.</li>
          <li>Each week: A themed challenge (Clinical case, Research review, Drug identification).</li>
          <li>Submit answers by week-end → Top performers featured on leaderboard.</li>
        </ul>
      </StepCard>

      <TipBox>
        <p>Maintain a <strong>7-day quiz streak</strong> to earn 2x coins. 30-day streaks unlock premium course access. Consistency is rewarded!</p>
      </TipBox>

      <h2>4. Study Tools</h2>
      <StepCard number={1} title="Study Planner">
        <ul>
          <li>Navigate to <strong>Student → Study Planner</strong>.</li>
          <li>Create a personalized study schedule: Subjects, topics, hours per day.</li>
          <li>AI suggests optimal study plan based on exam date and weak areas.</li>
          <li>Track daily completion and get streak rewards.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Study Groups">
        <ul>
          <li>Navigate to <strong>Student → Study Groups</strong>.</li>
          <li>Join or create study groups by: Subject, College, Exam prep, Interest area.</li>
          <li>Features: Group chat, shared notes, collaborative quizzes, doubt discussions.</li>
          <li>Group study sessions with video call integration.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Ask Vaidya (AI Tutor)">
        <ul>
          <li>Navigate to <strong>Student → Ask Vaidya</strong>.</li>
          <li>AI-powered tutor for Ayurveda questions:</li>
          <ul>
            <li>"Explain Samprapti of Amavata"</li>
            <li>"What is the Chikitsa for Tamaka Shwasa according to Charaka?"</li>
            <li>"Differentiate between Vata and Kapha type Prameha"</li>
            <li>"Pharmacological action of Guduchi (Tinospora)"</li>
          </ul>
          <li>Provides answers with classical references and shloka citations.</li>
        </ul>
      </StepCard>

      <StepCard number={4} title="Question Bank Manager">
        <ul>
          <li>Navigate to <strong>Student → Question Bank</strong>.</li>
          <li>Practice from a bank of 10,000+ Ayurveda MCQs.</li>
          <li>Filter by: Subject, Topic, Difficulty, Question type (MCQ/True-False/Match).</li>
          <li>Bookmark questions for revision. Track accuracy per topic.</li>
        </ul>
      </StepCard>

      <h2>5. Career & Research</h2>
      <StepCard number={1} title="Jobs & internships">
        <ul>
          <li><strong>Student → Jobs:</strong> AYUSH job listings — clinics, hospitals, research, pharma companies.</li>
          <li><strong>Student → Internship Marketplace:</strong> Find internship positions across India.</li>
          <li><strong>Student → Internship Journal:</strong> Document your internship cases (required for some colleges).</li>
          <li><strong>Student → Freelance Gigs:</strong> Short-term projects (content writing, research assistance).</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Research collaboration">
        <ul>
          <li>Navigate to <strong>Student → Research Collaboration</strong>.</li>
          <li>Find research projects looking for collaborators.</li>
          <li>Post your research idea → Find co-researchers or mentors.</li>
          <li>Track: Methodology, Data collection, Analysis, Publication status.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Mentorship">
        <ul>
          <li>Navigate to <strong>Student → Mentorship</strong>.</li>
          <li>Connect with senior practitioners for guidance.</li>
          <li>Schedule 1:1 mentoring sessions (video/chat).</li>
          <li>Topics: Career advice, Clinical skills, Research guidance, Practice setup.</li>
        </ul>
      </StepCard>

      <StepCard number={4} title="Startup Incubator">
        <ul>
          <li>Navigate to <strong>Student → Startup Incubator</strong>.</li>
          <li>For students with AYUSH business ideas (products, clinics, apps).</li>
          <li>Submit your idea → Get mentorship → Pitch to investors.</li>
          <li>Resources: Business plan templates, legal guides, funding opportunities.</li>
        </ul>
      </StepCard>

      <h2>6. Community & Gamification</h2>
      <StepCard number={1} title="Coins & rewards">
        <ul>
          <li>Navigate to <strong>Student → Coin Store</strong>.</li>
          <li>Earn coins from: Quizzes, Streaks, Course completion, Competition wins, Referrals.</li>
          <li>Spend coins on: Premium courses, Merchandise, Consultation credits, Event tickets.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="College chapters">
        <ul>
          <li>Navigate to <strong>Student → Chapters</strong>.</li>
          <li>Each BAMS college has a chapter with: Local events, College-specific resources, Alumni network.</li>
          <li>Chapter leaders organize: Workshops, Study sessions, Guest lectures.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="College directory">
        <ul>
          <li>Navigate to <strong>Student → Colleges</strong>.</li>
          <li>Browse all AYUSH colleges in India: Ratings, Reviews, Courses offered, Cutoffs, Infrastructure.</li>
          <li>Compare colleges side-by-side for admission decisions.</li>
        </ul>
      </StepCard>

      <h2>7. Clinical Practice Tools</h2>
      <StepCard number={1} title="Interactive learning tools">
        <ul>
          <li><strong>Marma Explorer:</strong> Interactive 3D marma point study tool.</li>
          <li><strong>Drug Interaction Checker:</strong> Check herb-drug and herb-herb interactions.</li>
          <li><strong>Panchakarma Simulator:</strong> Virtual walkthrough of PK procedures.</li>
          <li><strong>Herb Identifier:</strong> Upload plant photo → AI identifies herb with properties.</li>
          <li><strong>Pulse Reading Practice:</strong> Guided Nadi Pariksha training module.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Case studies library">
        <ul>
          <li>Navigate to <strong>Student → Case Studies</strong>.</li>
          <li>Real clinical cases with: Presentation, Examination, Diagnosis, Treatment, Outcome.</li>
          <li>Submit your own cases for peer review and publication.</li>
          <li>Discuss cases in study groups with structured format.</li>
        </ul>
      </StepCard>

      <KeyboardShortcuts
        shortcuts={[
          { keys: "Ctrl + Q", action: "Start daily quiz" },
          { keys: "Ctrl + S", action: "Open study planner" },
          { keys: "Ctrl + G", action: "Open study groups" },
          { keys: "Ctrl + A", action: "Ask Vaidya" },
          { keys: "Ctrl + J", action: "Browse jobs" },
        ]}
      />
    </GuideLayout>
  );
};

export default StudentHubGuide;
