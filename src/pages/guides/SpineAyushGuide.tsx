import { Activity } from "lucide-react";
import { GuideLayout, StepCard, TipBox, KeyboardShortcuts } from "./GuideLayout";

const SpineAyushGuide = () => {
  return (
    <GuideLayout
      title="Spine AYUSH Playbook"
      subtitle="Complete spine care workflow: Assessment → Treatment → Evidence → Follow-up → Franchise KPIs"
      icon={Activity}
      color="bg-blue-500/10 text-blue-600"
      estimatedTime="25 min"
      roles={["Doctor", "Therapist", "Franchise Manager"]}
    >
      {/* Section 1: Overview */}
      <h2>1. Spine AYUSH — Module Overview</h2>
      <p className="text-sm text-muted-foreground mb-4">
        The Spine AYUSH module is a complete franchise-ready spine care system built on Ayurveda + Modern
        Evidence. It covers the full patient journey from ₹199 AI Assessment → Packages → Treatment → Outcomes → Follow-up.
      </p>

      <StepCard number={1} title="Access the Spine module">
        <ul>
          <li>From the HMS sidebar, click the <strong>Spine</strong> tab at the top.</li>
          <li>The sidebar shows all sub-modules organized by workflow stage.</li>
          <li>Or navigate directly to <code>/hms/spine-ayush</code>.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Dashboard KPIs">
        <ul>
          <li>Total Spine Patients, Revenue, Success Rate, Active Branches, Satisfaction Score.</li>
          <li>Top Conditions: Gridhrasi (Sciatica), Greeva Stambha (Cervical), Kati Shoola (LBP).</li>
          <li>Funnel Performance: Assessment → Converted → Completed → Follow-up → Referred → Upsold.</li>
          <li>AI Insights provide actionable business recommendations.</li>
        </ul>
      </StepCard>

      {/* Section 2: Patient Journey */}
      <h2>2. Patient Journey — Step by Step</h2>

      <StepCard number={1} title="Step 1: AI Spine Assessment (₹199 Entry)">
        <ul>
          <li>Navigate to <strong>Spine → AI Assessment (₹199)</strong>.</li>
          <li>Patient uploads posture photos (Front + Side + Back views).</li>
          <li>AI generates a <strong>Spine Score</strong> (0-100) and recommends a package.</li>
          <li>Doctor reviews and confirms the recommendation.</li>
          <li><strong>Conversion target:</strong> 62% from assessment to package booking.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Step 2: 7-System Examination">
        <ul>
          <li>Navigate to <strong>Spine → Examination (7 Systems)</strong>.</li>
          <li>Systems assessed:</li>
          <ul>
            <li>🍃 <strong>Ayurvedic:</strong> Dosha, Agni, Ama, Koshtha, Bala, Sparsha, Nadi</li>
            <li>🫁 <strong>Gut-Spine Connection:</strong> Agni detailed, Ama Index (0-10), Mala Pareeksha, Gut Symptom Score</li>
            <li>🦴 <strong>Modern Orthopedic:</strong> SLR, Schober's, FABER, ROM, Motor Power, Reflexes, Sensory Dermatomes</li>
            <li>🏮 <strong>TCM/Acupuncture:</strong> Back Shu Points, Huatuojiaji points along spine</li>
            <li>🔱 <strong>Siddha Varma:</strong> 12 Spine Todu Varmam points (rated 0-4)</li>
            <li>🕉️ <strong>Chakra Assessment:</strong> 7 Chakras functional status along spine</li>
            <li>🫙 <strong>Unani Hijama:</strong> Cupping zones and skin color response</li>
          </ul>
          <li>AI generates treatment decision based on all findings.</li>
          <li>Attach X-ray/MRI/Posture photos for documentation.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Step 3: Disease Connection Map">
        <ul>
          <li>Navigate to <strong>Spine → Disease Connection Map</strong>.</li>
          <li>Each spinal level connects to specific organs via dermatomes:</li>
          <ul>
            <li>C1-C3 → Head/Brain → Migraine, Vertigo</li>
            <li>C4-C7 → Shoulder/Arms/Thyroid → Frozen Shoulder, Thyroid</li>
            <li>T5-T9 → Stomach/Liver/Pancreas → Acidity, Diabetes</li>
            <li>L4-S1 → Lower Limbs/Sciatic → Sciatica, Knee Pain</li>
          </ul>
          <li>Use as the <strong>upsell pathway</strong> — spine treatment can address connected diseases.</li>
        </ul>
      </StepCard>

      <TipBox>
        <p><strong>Upsell Script:</strong> "Your L1-L3 compression may be connected to your digestive issues. We can address both through a comprehensive spine + digestive protocol."</p>
      </TipBox>

      {/* Section 3: Treatment Planning */}
      <h2>3. Treatment Planning</h2>

      <StepCard number={1} title="Quick Protocol Builder">
        <ul>
          <li>Navigate to <strong>Spine → Quick Protocol Builder</strong>.</li>
          <li>Select condition + severity → System suggests the optimal protocol.</li>
          <li>AI considers: Dosha type, Agni status, Ama level, and patient strength.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Packages & Pricing (Franchise Standard)">
        <ul>
          <li>Navigate to <strong>Spine → Packages & Pricing</strong>.</li>
          <li><strong>Spine Assessment Only:</strong> ₹199 (1 visit) — AI Score + Posture Analysis</li>
          <li><strong>Quick Relief (3-Day):</strong> ₹4,500 — Basti × 3 + 7-day medicines</li>
          <li><strong>Standard (7-Day):</strong> ₹8,500 — Basti × 7 + Sweda × 7 + medicines + Yoga chart</li>
          <li><strong>Intensive (14-Day):</strong> ₹16,000 — Full spine PK + Basti 16 + Agnikarma</li>
          <li><strong>Comprehensive (21-Day):</strong> ₹22,000 — Complete rejuvenation</li>
          <li><strong>Monthly Maintenance:</strong> ₹3,500/month — Weekly session + medicines + Yoga</li>
          <li><strong>Corporate Wellness:</strong> ₹1,500/employee/month</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="10 Standard Protocols">
        <ul>
          <li>Kati Basti (Lumbar) — 7 days, 87% success rate</li>
          <li>Greeva Basti (Cervical) — 7 days, 85% success</li>
          <li>Prishtha Basti (Full Spine) — 14 days, 82% success</li>
          <li>Agnikarma (Trigger Points) — 3 sessions, 78% success</li>
          <li>Tikta Ksheer Basti — 16 days, 80% success</li>
          <li>Patra Pinda Sweda — 7 days, 75% success</li>
          <li>Nasya + Greeva Basti — 7 days, 83% success</li>
          <li>Meru Chikitsa (Manipulation) — 5 sessions, 70% success</li>
          <li>Spine Yoga Therapy — 21 days, 72% success</li>
          <li>PRP + Ayurveda (Integrative) — 3 sessions, 68% success</li>
        </ul>
      </StepCard>

      {/* Section 4: Treatment Delivery */}
      <h2>4. Treatment Delivery</h2>

      <StepCard number={1} title="Level 1: First Treatment (Same Day OPD)">
        <ul>
          <li>Navigate to <strong>Spine → Level 1: First Treatment</strong>.</li>
          <li>Goal: Patient feels 30-40% relief on the same day — builds trust instantly.</li>
          <li>Options: Viddha Karma, Agnikarma, Marma Therapy, Hijama/Cupping, Doctor's Therapy, Trigger Point, Varma Therapy, Mudra Therapy.</li>
          <li>After Level 1 relief, convert to a package: "This was emergency relief. For permanent cure, you need a 7-day protocol."</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Level 2: Panchakarma Treatment">
        <ul>
          <li>Navigate to <strong>Spine → Level 2: Panchakarma</strong>.</li>
          <li>Multi-day therapy following the protocol selected in planning.</li>
          <li>Poorvakarma → Pradhana Karma → Paschath Karma stages.</li>
          <li>Record sessions at <strong>Spine → Record Level 2 Session</strong>.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Record therapy sessions">
        <ul>
          <li><strong>Record Level 1 Session:</strong> Quick single-visit documentation.</li>
          <li><strong>Record Level 2 Session:</strong> Multi-day protocol documentation.</li>
          <li><strong>Record Therapy Session:</strong> General therapy documentation.</li>
          <li>All sessions track: VAS pain score (before/after), materials used, therapist notes.</li>
        </ul>
      </StepCard>

      <StepCard number={4} title="All 19 Therapies">
        <ul>
          <li>Navigate to <strong>Spine → All Therapies (19)</strong> for the complete therapy catalog.</li>
          <li>Includes: T19 Functional Neurology — advanced neuro-rehabilitation approach.</li>
          <li>Each therapy has: Protocol, Duration, Materials, Contraindications, and Success Data.</li>
        </ul>
      </StepCard>

      <TipBox title="Spine Score Guarantee™">
        <p>If the patient's Spine Score doesn't improve by 50%+ within the treatment duration, extend treatment FREE until it does. 92% of patients hit this target. Auto-tracked by AI using VAS/ODI scores.</p>
      </TipBox>

      {/* Section 5: Tracking & Outcomes */}
      <h2>5. Tracking & Outcomes</h2>

      <StepCard number={1} title="Outcome Tracker">
        <ul>
          <li>Navigate to <strong>Spine → Outcome Tracker</strong>.</li>
          <li>Tracks: VAS Pain Score, ODI (Oswestry Disability Index), NDI (Neck Disability Index).</li>
          <li>Progress graphs show improvement over time per patient.</li>
          <li>Feeds into franchise KPIs and success rate metrics.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Patient Recovery Score">
        <ul>
          <li>Navigate to <strong>Spine → Patient Recovery Score</strong>.</li>
          <li>AI-calculated composite score combining: Pain reduction, ROM improvement, functional ability, compliance.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Discharge & Home Plan">
        <ul>
          <li>Navigate to <strong>Spine → Discharge & Home Plan</strong>.</li>
          <li>Generate a take-home plan: Exercises, Diet (Pathya/Apathya), Lifestyle changes, Medicine schedule.</li>
          <li>Sent to patient via WhatsApp as a structured follow-up guide.</li>
        </ul>
      </StepCard>

      {/* Section 6: Mind-Body (Dispenza Tools) */}
      <h2>6. Mind-Body Integration (Dispenza Tools)</h2>

      <StepCard number={1} title="10 Mind-Body tools for spine healing">
        <ul>
          <li>Navigate to <strong>Spine → All 10 Tools (Dashboard)</strong>.</li>
          <li>Tools include:</li>
          <ul>
            <li>🌬️ Breath Work (Spinal) — <em>Premium</em></li>
            <li>✨ Body Part Blessing — <em>Premium</em></li>
            <li>🌌 Space-Time Open Focus — <em>Free</em></li>
            <li>🚶 Walking Meditation — <em>Premium</em></li>
            <li>🧠 Pineal Gland Activation — <em>Premium</em></li>
            <li>📅 Meditation Scheduler — <em>Premium</em></li>
            <li>📓 Elevated Emotion Journal — <em>Free</em></li>
            <li>👥 Coherence Healing (Group) — <em>Clinic use</em></li>
            <li>🎯 Mental Rehearsal (Future Self) — <em>Premium</em></li>
            <li>❤️ Brain-Heart Coherence Score — <em>Premium</em></li>
          </ul>
          <li>Assign tools to patients as part of their treatment plan.</li>
        </ul>
      </StepCard>

      {/* Section 7: Clinical Knowledge (13 Modules) */}
      <h2>7. Clinical Knowledge — 13 Learning Modules</h2>

      <StepCard number={1} title="Access learning modules">
        <ul>
          <li>Navigate to <strong>Spine → All Modules (M1-M18)</strong>.</li>
          <li>13 core modules + 5 AYUSH Native modules (M14-M18).</li>
          <li>Total: 175+ topics, ~9 hours content, AYUSH-integrated.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Module structure">
        <ul>
          <li><strong>Phase 1 — Theory:</strong> M1 (Posture Introduction, Janda's Theory)</li>
          <li><strong>Phase 2 — Assessment:</strong> M2 (Posterior View), M3 (Anterior View), M4 (Lateral View), M5 (Practical Skills), M6 (Functional Assessment)</li>
          <li><strong>Phase 3 — Corrective:</strong> M7 (4-Phase AYUSH Corrective Model)</li>
          <li><strong>Phase 4 — Syndromes:</strong> M8 (Upper Cross), M9 (Lower Cross), M10 (Layered/Double Cross), M11 (Pronation Distortion), M12 (Flat Back), M13 (Sway Back)</li>
          <li><strong>Phase 5 — AYUSH Native:</strong> M14-M18 (System-specific protocols)</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Using modules clinically">
        <ul>
          <li>Each topic has: Doctor Notes, Patient Tips, AYUSH Context, and Dosha Relevance.</li>
          <li>After identifying a syndrome (from examination), open the corresponding module for the complete treatment protocol.</li>
          <li>Prescribe specific exercise modules to patients — they track progress in the app.</li>
        </ul>
      </StepCard>

      <TipBox>
        <p>Access <strong>Clinical Resources</strong> for video demonstrations and real case studies. Use <strong>AI Tools</strong> for intelligent protocol suggestions based on examination findings.</p>
      </TipBox>

      {/* Section 8: Follow-up */}
      <h2>8. Follow-up & Patient Retention</h2>

      <StepCard number={1} title="Video LMS Follow-up">
        <ul>
          <li>Navigate to <strong>Spine → Follow-up (Video LMS)</strong>.</li>
          <li>After treatment, patient receives guided video content via WhatsApp:</li>
          <ul>
            <li>Day 1: How to apply medicated oil</li>
            <li>Day 3: 5 morning exercises for your back</li>
            <li>Day 5: Self Kizhi (poultice) application</li>
            <li>Day 7: Video call with therapist</li>
            <li>Day 14: Progress check (WhatsApp form)</li>
            <li>Day 21: Advanced Yoga for spine health</li>
            <li>Day 30: Monthly in-person session reminder</li>
          </ul>
          <li>System tracks watch completion and compliance percentage.</li>
          <li>AI adjusts follow-up based on compliance rate.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Community & engagement pipeline">
        <ul>
          <li>Navigate to <strong>Spine → Community & Funnel</strong>.</li>
          <li>Gamification: Points, badges, leaderboard for exercise compliance.</li>
          <li>Community groups by condition (Sciatica Warriors, Back Pain Recovery).</li>
          <li><strong>Engagement Pipeline:</strong> Lead → Assessment → Package → Active → Maintenance → Referral.</li>
        </ul>
      </StepCard>

      {/* Section 9: Franchise Operations */}
      <h2>9. Franchise Operations & KPIs</h2>

      <StepCard number={1} title="Branch performance tracking">
        <ul>
          <li>Navigate to <strong>Spine → Franchise Operations</strong>.</li>
          <li>Track per branch: Patients, Revenue, Packages sold, Satisfaction, Success Rate.</li>
          <li>Compare branches on standardized KPIs.</li>
          <li>Ensure protocol consistency across all franchise locations.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Marketing funnel">
        <ul>
          <li>Navigate to <strong>Spine → Funnel & Marketing</strong>.</li>
          <li>Lead sources: Google Ads, WhatsApp, Referrals, Walk-ins, Corporate.</li>
          <li>Track: Cost per lead, Assessment conversion, Package conversion, LTV.</li>
          <li>₹199 Assessment is the primary lead magnet — low barrier entry point.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Franchise KPIs">
        <ul>
          <li>Navigate to <strong>Spine → Franchise KPIs</strong>.</li>
          <li>Key metrics:</li>
          <ul>
            <li>Assessment → Package Conversion: Target 60%+</li>
            <li>Treatment Success Rate: Target 80%+</li>
            <li>Patient Satisfaction: Target 4.5+/5</li>
            <li>Monthly Revenue per Branch: Target varies by location</li>
            <li>Referral Rate: Target 15%+</li>
            <li>Follow-up Compliance: Target 70%+</li>
          </ul>
        </ul>
      </StepCard>

      <TipBox title="Revenue Strategy">
        <p>The Spine Score Guarantee™ + ₹199 entry assessment + evidence-based outcomes creates a trust-first funnel. Connected disease upsell (spine → related organ conditions) increases patient LTV by 3x.</p>
      </TipBox>

      {/* Section 10: Quick Reference */}
      <h2>10. Quick Reference — Daily Workflow</h2>

      <StepCard number={1} title="Doctor's daily workflow">
        <ul>
          <li><strong>Morning:</strong> Review new assessments in queue → Confirm AI recommendations → Plan treatments for the day.</li>
          <li><strong>Consultations:</strong> Use 7-System Examination → Identify syndrome → Select protocol → Prescribe package.</li>
          <li><strong>Level 1:</strong> Perform same-day relief therapy (Agnikarma/Viddha/Marma) → Convert to package.</li>
          <li><strong>End of day:</strong> Review outcomes, update scores, approve follow-up content triggers.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Therapist's daily workflow">
        <ul>
          <li><strong>Check schedule:</strong> Spine → Today's sessions (Level 2 treatments).</li>
          <li><strong>Prepare:</strong> Check patient history, Dosha type, protocol day, materials needed.</li>
          <li><strong>Execute:</strong> Perform therapy → Record session → Note VAS before/after.</li>
          <li><strong>Document:</strong> Materials used, patient response, any adverse reactions.</li>
          <li><strong>Track:</strong> Update outcome scores after each session.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Manager's weekly review">
        <ul>
          <li>Check Franchise KPIs dashboard for all branches.</li>
          <li>Review conversion funnel — identify drop-off points.</li>
          <li>Compare branch performance against targets.</li>
          <li>Review Spine Cashflow Game leaderboard for gamified performance tracking.</li>
        </ul>
      </StepCard>

      <KeyboardShortcuts
        shortcuts={[
          { keys: "Ctrl + A", action: "New assessment" },
          { keys: "Ctrl + E", action: "Open examination" },
          { keys: "Ctrl + P", action: "Select protocol" },
          { keys: "Ctrl + S", action: "Record session" },
          { keys: "Ctrl + O", action: "Open outcome tracker" },
          { keys: "Ctrl + K", action: "View KPIs" },
        ]}
      />
    </GuideLayout>
  );
};

export default SpineAyushGuide;
