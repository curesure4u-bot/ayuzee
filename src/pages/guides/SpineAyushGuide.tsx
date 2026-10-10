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

      {/* Section 11: Spine Submenu — Full Reference */}
      <h2>11. Spine Submenu — Full Navigation Reference</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Every item visible in the Spine sidebar, organized exactly as it appears. Use this as your daily reference map.
      </p>

      {/* Owner Only */}
      <StepCard number={1} title="🔐 Owner Only">
        <ul>
          <li><strong>Super Admin (Control)</strong> — Master control panel for the entire Spine AYUSH system. Only accessible to the owner (curesure4u@gmail.com). Manage global settings, all branches, override permissions, and see the full data picture across the franchise network.</li>
          <li><strong>Chief Physician Suite</strong> — Exclusive workspace for the chief physician. Review complex cases, set clinical protocols, approve treatment exceptions, and access cross-branch clinical analytics. Owner-guarded — not visible to other roles.</li>
        </ul>
      </StepCard>

      {/* Daily Operations */}
      <StepCard number={2} title="Daily Operations">
        <ul>
          <li><strong>⭐ Daily Command Center</strong> — The go-to morning screen. Shows today's patient queue, pending assessments, sessions due, revenue targets, and staff status in one consolidated view. Start every shift here.</li>
          <li><strong>Spine Dashboard</strong> — The main Spine AYUSH module home. Displays total spine patients, revenue, success rate, active branches, satisfaction score, top conditions, and the AI insights panel. Acts as the tab landing page when you click the Spine tab.</li>
          <li><strong>SOP & Safety Checklists</strong> — Pre-treatment safety checklists and SOPs for each therapy. Ensures every therapist follows the standard protocol. Covers Basti preparation, oil temperature checks, consent verification, and post-treatment cleanup.</li>
        </ul>
      </StepCard>

      {/* Patient Journey */}
      <StepCard number={3} title="Patient Journey">
        <ul>
          <li><strong>AI Assessment (₹199)</strong> — Entry-point assessment for new spine patients. Patient uploads posture photos (Front / Side / Back). AI generates a Spine Score (0–100), identifies problem areas, and recommends a treatment package. Conversion target: 62% from assessment to package booking.</li>
          <li><strong>Examination (7 Systems)</strong> — Comprehensive clinical examination across 7 systems: Ayurvedic (Dosha, Agni, Nadi), Gut-Spine Connection (Ama Index, Mala Pareeksha), Modern Orthopedic (SLR, Schober's, ROM, Reflexes), TCM/Acupuncture (Shu Points, Huatuojiaji), Siddha Varma (12 Todu Varmam points), Chakra Assessment (7 Chakras), and Unani Hijama (cupping zones). AI generates a treatment decision based on all findings.</li>
          <li><strong>Disease Connection Map</strong> — Visual map linking spinal levels to connected organs via dermatomes. C1-C3 → Migraine/Vertigo; C4-C7 → Thyroid/Frozen Shoulder; T5-T9 → Acidity/Liver/Diabetes; L1-L3 → PCOD/Constipation; L4-S1 → Sciatica/Knee Pain. Use this as the upsell pathway to show patients spine treatment can address their connected systemic conditions.</li>
          <li><strong>Dermatome Mapper</strong> — Interactive spinal dermatome diagram. Click on a vertebral level to see which muscles, skin zones, and organs it innervates. Helps explain patient symptoms visually during consultation. Useful for confirming examination findings and patient education.</li>
        </ul>
      </StepCard>

      <TipBox title="Upsell Script (Disease Connection Map)">
        <p>"Your L1-L3 compression may be connected to your digestive and hormonal issues. A comprehensive spine + digestive protocol can address both simultaneously."</p>
      </TipBox>

      {/* Treatment Planning */}
      <StepCard number={4} title="Treatment Planning">
        <ul>
          <li><strong>Quick Protocol Builder</strong> — Fast protocol selection for busy OPD. Choose condition + severity, and the system instantly suggests the best protocol. Considers Dosha type, Agni status, and Ama level. Output: a ready-to-execute treatment plan in under 60 seconds.</li>
          <li><strong>Advanced Protocol Builder</strong> — Full protocol design tool for complex or multi-condition cases. Customize therapy duration, sequencing, herb selection, Panchakarma stages, and add patient-specific modifications. Saves as reusable templates for recurring conditions.</li>
          <li><strong>Therapy Comparison Engine</strong> — Side-by-side comparison of up to 3 therapies for a given condition. Shows: duration, success rate, materials needed, contraindications, cost, and effort level. Helps doctor pick the best therapy for the patient's profile and budget.</li>
          <li><strong>Packages & Pricing</strong> — Standardized franchise package catalog. Includes: Assessment Only (₹199), Quick Relief 3-Day (₹4,500), Standard 7-Day (₹8,500), Intensive 14-Day (₹16,000), Comprehensive 21-Day (₹22,000), Monthly Maintenance (₹3,500/month), Corporate Wellness (₹1,500/employee/month). Select and assign a package to the patient after assessment.</li>
        </ul>
      </StepCard>

      {/* Treatment Delivery */}
      <StepCard number={5} title="Treatment Delivery">
        <ul>
          <li><strong>Level 1: First Treatment</strong> — Same-day OPD relief therapy. Goal: patient feels 30–40% improvement before leaving. Options include Viddha Karma, Agnikarma, Marma Therapy, Hijama/Cupping, Trigger Point, Varma Therapy, and Mudra Therapy. After Level 1 relief, convert to a package: "This was emergency relief — for permanent cure, you need a 7-day protocol."</li>
          <li><strong>Level 2: Panchakarma</strong> — Multi-day Panchakarma treatment following the planned protocol. Stages: Poorvakarma (preparation — oleation, fomentation) → Pradhana Karma (main therapy — Basti, Nasya, etc.) → Paschath Karma (post-treatment regimen). All 10 standard protocols are listed here with their respective day-by-day schedules.</li>
          <li><strong>All Therapies (19)</strong> — Complete catalog of all 19 integrated therapy systems used in Spine AYUSH. Each has: Protocol steps, Duration, Materials list, Contraindications, Expected outcomes, and success data. Browse to educate patients or to select an adjunct therapy.</li>
          <li><strong>T19: Functional Neurology</strong> — The 19th and most advanced therapy. Targets the neurological component of spine conditions. Includes: sensory-motor integration exercises, proprioception retraining, vestibular rehabilitation, and neural mobilization. Used for complex disc herniation, radiculopathy, and post-surgical cases.</li>
          <li><strong>Record Level 1 Session</strong> — Quick documentation for a single-visit Level 1 treatment. Captures: therapy performed, VAS pain score before and after, materials used, therapist notes, and patient response. Takes under 2 minutes to complete.</li>
          <li><strong>Record Level 2 Session</strong> — Multi-day protocol session documentation. Records each day of the Panchakarma course: therapy administered, oil/herb quantities used, patient feedback, VAS/ROM scores, therapist observations, and any adverse reactions.</li>
          <li><strong>Record Therapy Session</strong> — General-purpose therapy documentation for any session outside Level 1/2 protocols. Use for maintenance sessions, yoga therapy, follow-up treatment, and adjunct therapies.</li>
        </ul>
      </StepCard>

      <TipBox title="Spine Score Guarantee™">
        <p>If the patient's Spine Score doesn't improve by 50%+ within the treatment duration, extend treatment FREE until it does. 92% of patients hit this target. Auto-tracked by AI using VAS/ODI scores.</p>
      </TipBox>

      {/* Tracking & Outcomes */}
      <StepCard number={6} title="Tracking & Outcomes">
        <ul>
          <li><strong>Outcome Tracker</strong> — Central dashboard for tracking all patient outcomes. Measures: VAS Pain Score (0–10), ODI — Oswestry Disability Index (for lumbar), NDI — Neck Disability Index (for cervical), ROM (Range of Motion) in degrees, and overall Spine Score. Progress graphs show improvement over time. Feeds into franchise KPIs and branch success rate metrics.</li>
          <li><strong>Patient Journey (Show Patient)</strong> — Patient-facing journey view. Show this screen to the patient at every visit to visualize their progress from Day 1 to today. Builds trust, motivates compliance, and reduces drop-offs. Includes before/after scores, photos, and milestone achievements.</li>
          <li><strong>Patient Recovery Score</strong> — AI-calculated composite score combining 4 factors: Pain reduction (VAS), Functional improvement (ODI/NDI), ROM recovery percentage, and Treatment compliance rate. Expressed as a 0–100 score with color indicators (Red/Yellow/Green).</li>
          <li><strong>Discharge & Home Plan</strong> — Generate a structured take-home plan at the end of treatment. Includes: Daily exercises (with images), Pathya/Apathya diet guidelines, Lifestyle modifications, Medicine schedule and dosage, Follow-up date, and Warning signs to watch for. Auto-sent to patient via WhatsApp as a formatted PDF.</li>
        </ul>
      </StepCard>

      {/* Mind-Body Dispenza */}
      <StepCard number={7} title="Mind-Body (Dispenza Tools)">
        <ul>
          <li><strong>All 10 Tools (Dashboard)</strong> — Overview of all Dispenza-based mind-body healing tools. Assign specific tools to patients as part of their treatment plan. Track usage frequency and patient compliance. Shows which tools are Free, Premium, or Clinic-use only.</li>
          <li><strong>Breath Work (Spinal) [PRO]</strong> — Guided spinal breathing sequence based on Joe Dispenza's breathing protocol. Activates the spine's energy centers, reduces cortisol, and enhances the healing environment for Panchakarma. Duration: 20–45 min sessions. Research shows 3x faster tissue repair in patients who practice regularly.</li>
          <li><strong>Body Part Blessing [PRO]</strong> — Guided meditation directing healing awareness to specific spinal segments and discs. Patient visualizes and "blesses" each vertebral level. Backed by neuroplasticity research showing focused attention accelerates local tissue repair.</li>
          <li><strong>Space-Time (Open Focus) [FREE]</strong> — Open focus attention training. Shifts brain from narrow-objective focus (pain amplifying) to diffuse-inclusive awareness (pain reducing). Immediately accessible to all patients. Takes 15–20 minutes. Can be done at home daily without any cost.</li>
          <li><strong>Walking Meditation [PRO]</strong> — Mindful slow-walking protocol with spinal awareness cues. Combines sensory integration with movement re-education. Ideal for post-Panchakarma rehabilitation and for patients with postural syndrome or sway back.</li>
          <li><strong>Pineal Gland Activation [PRO]</strong> — Advanced meditation targeting the reticular activating system and pineal gland. Promotes deep alpha/theta brain states that accelerate spinal cord and nerve healing. Used specifically for disc herniation and nerve compression cases.</li>
          <li><strong>Meditation Scheduler [PRO]</strong> — Automated scheduler that assigns specific meditations to each day of the patient's treatment plan. Sends WhatsApp reminders with links. Tracks completion and adjusts the sequence based on the patient's compliance rate.</li>
          <li><strong>Elevated Emotion Journal [FREE]</strong> — Daily journaling tool for patients to record elevated emotions (gratitude, joy, love, inspiration). Dispenza's research shows sustained elevated emotion creates a biochemical healing environment. Free for all patients. Integrated with the community platform.</li>
          <li><strong>Coherence Healing (Group) [CLINIC]</strong> — Group coherence meditation sessions conducted at the clinic. 6–12 patients meditate together, amplifying the collective healing field. Weekly schedule. Shown to improve outcomes by 3x compared to individual treatment alone. Requires clinic setup and therapist facilitation.</li>
          <li><strong>Mental Rehearsal (Future Self) [PRO]</strong> — Future-self visualization exercise where patients mentally rehearse living pain-free with full mobility. Combines vivid sensory imagination with elevated emotion. Used at the start of each treatment phase to prime the nervous system for recovery.</li>
          <li><strong>Brain-Heart Coherence Score [PRO]</strong> — Tracks the patient's brain-heart coherence level over time using a simple self-reported questionnaire. Higher coherence = faster healing. Score influences treatment recommendations and medication scheduling. Premium analytics dashboard included.</li>
        </ul>
      </StepCard>

      {/* Clinical Knowledge */}
      <StepCard number={8} title="Clinical Knowledge">
        <ul>
          <li><strong>All Modules (M1–M18)</strong> — Complete library of 18 learning modules covering posture theory, assessment, corrective models, syndrome identification, and AYUSH native protocols. 175+ topics, ~9 hours of content. Doctors and therapists use these for clinical decision-making; patients access assigned modules through the app.</li>
          <li><strong>AYUSH Native (M14–M18)</strong> — The 5 AYUSH-specific modules covering system-by-system native protocols: M14 (Ayurveda spine protocols), M15 (Siddha Varma spine), M16 (Unani Hijama spine), M17 (Acupuncture spine points), M18 (Yoga therapy for spine syndromes). Each includes Dosha-specific modifications.</li>
          <li><strong>Clinical Resources (Videos/Cases)</strong> — Repository of video demonstrations for all 19 therapies, real patient case studies with before/after outcomes, technique guides for Basti, Agnikarma, and Marma, and research references. Use to train new therapists or prepare for complex cases.</li>
          <li><strong>AI Tools (Intelligence)</strong> — Suite of AI-powered clinical decision tools: AI Protocol Suggester (input symptoms → get protocol recommendation), AI Herb Selector (based on Dosha + condition), AI Outcome Predictor (estimates recovery timeline), and AI Upsell Identifier (detects connected organ conditions for cross-sell).</li>
          <li><strong>Rejuvenation</strong> — Rasayana and rejuvenation protocol section. Post-treatment Rasayana plans using classical formulations (Ashwagandha, Shatavari, Bala, etc.) to consolidate treatment gains and prevent recurrence. Includes diet plans and lifestyle guidelines for long-term spinal health maintenance.</li>
          <li><strong>Follow-up (Video LMS)</strong> — Post-treatment follow-up system delivering structured WhatsApp video content. Day 1: Oil application demo → Day 3: Morning exercises → Day 5: Self-Kizhi → Day 7: Therapist video call → Day 14: Progress check form → Day 21: Advanced Yoga → Day 30: Monthly visit reminder. System tracks watch completion and AI adjusts schedule based on compliance.</li>
        </ul>
      </StepCard>

      {/* Franchise Tools */}
      <StepCard number={9} title="Franchise Tools">
        <ul>
          <li><strong>Franchise Hub (Home)</strong> — Central dashboard for franchise management. Overview of all 6 steps of franchise setup, current franchise locations, performance comparison, and expansion planning tools.</li>
          <li><strong>1. Setup Wizard</strong> — Step-by-step guided setup for a new Spine AYUSH franchise location. Covers: Entity registration, Branch profile, Service menu, Staff assignment, Stock initialization, and System configuration. Estimated completion: 2–3 hours for a new branch.</li>
          <li><strong>2. Layout Planner</strong> — Interactive floor plan tool for designing the physical clinic layout. Drag-and-drop room placement for Basti room, Examination room, Reception, Pharmacy, and Waiting area. Generates a standardized layout report for construction/renovation teams.</li>
          <li><strong>3. Operations Dashboard</strong> — Real-time operational KPIs across all franchise locations. Monitors daily patient count, revenue, therapy throughput, therapist utilization, and stock levels for each branch. Franchise owner's day-to-day control panel.</li>
          <li><strong>4. Cost Calculator</strong> — ROI and profitability calculator for franchise investment. Input: Location, Staff count, Rent, Equipment cost → Output: Break-even point, projected monthly revenue, EBITDA, and payback period. Use this during new franchise negotiations.</li>
          <li><strong>5. Staff Roster</strong> — Centralized staff scheduling for all franchise locations. Assign doctors, therapists, and reception staff to shifts. Handles leave management, duty swaps, and overtime calculation. Integrated with payroll module.</li>
          <li><strong>6. Patient Portal (Online/Hybrid)</strong> — Patient-facing online portal for the franchise. Enables self-booking, assessment uploads, follow-up video access, home exercise tracking, and community participation. White-labeled for each franchise location.</li>
        </ul>
      </StepCard>

      {/* Growth & Revenue */}
      <StepCard number={10} title="Growth & Revenue">
        <ul>
          <li><strong>Memberships & Subscriptions</strong> — Manage recurring subscription plans for patients. Options: Monthly Maintenance (₹3,500/month), Annual Wellness (₹36,000/year), Corporate Block (bulk slots for companies). Handles auto-renewal, payment collection, and subscription pause/cancel. Reduces revenue unpredictability.</li>
          <li><strong>Success Stories</strong> — Repository for documenting, managing, and publishing patient transformation stories. Structured format: Condition → Before metrics → Treatment taken → After metrics → Patient quote → Photo (with consent). Auto-publishable to social media and the public website.</li>
          <li><strong>Offers & Promotions</strong> — Create and manage time-limited promotional offers. Types: Seasonal discounts, Family packages, Corporate tie-ups, Referral bonuses, and Festival offers. Each offer has: validity dates, usage limits, applicable packages, and tracking analytics.</li>
        </ul>
      </StepCard>

      {/* Content & Marketing */}
      <StepCard number={11} title="Content & Marketing">
        <ul>
          <li><strong>Video Library (YouTube)</strong> — Curated library of all published Spine AYUSH YouTube videos. Categorized by: Condition (Back Pain, Sciatica, Cervical), Therapy type, Patient stories, and Exercise tutorials. Doctors can assign specific videos to patients directly from this screen.</li>
          <li><strong>Social Hub</strong> — Unified social media management for all Spine AYUSH channels (Instagram, Facebook, YouTube). Schedule posts, track engagement metrics, manage DMs, and access content templates. Connects to @spineayush Instagram and YouTube accounts.</li>
          <li><strong>Patient Library</strong> — Patient-accessible content library with educational articles, exercise PDFs, diet guides, and infographics. Organized by condition and language. Patients receive auto-assigned content based on their diagnosis. Reduces "what do I do at home?" questions.</li>
          <li><strong>Integrations & APIs</strong> — Technical integration panel. Manage connections to: WhatsApp Business API, Google Analytics, Payment gateways (Razorpay/Stripe), CRM (HubSpot), and external marketing tools. For IT administrators and franchise tech teams.</li>
        </ul>
      </StepCard>

      {/* Referral & Influencer */}
      <StepCard number={12} title="Referral & Influencer">
        <ul>
          <li><strong>Referral Network Hub</strong> — Manage the entire referral program. Track referral sources (Doctor referrals, Patient referrals, Physiotherapy partnerships, Orthopedic surgeon referrals). Calculate referral commissions, send thank-you payouts, and analyze the top referral performers.</li>
          <li><strong>Public Sign-Up Page ↗</strong> — External-facing page at <code>/spine/refer</code> for new referral partners to register. Opens in a new tab. Share this link with orthopedic surgeons, physiotherapists, and wellness coaches who want to refer patients to Spine AYUSH in exchange for a commission.</li>
        </ul>
      </StepCard>

      {/* Longevity & Rejuvenation */}
      <StepCard number={13} title="Longevity & Rejuvenation">
        <ul>
          <li><strong>Wellness Age Tracker</strong> — Calculates and tracks the patient's "Spinal Wellness Age" — a biological age metric based on posture, ROM, pain levels, and disc health. Motivates patients to "age younger" through consistent spine care. Updated after each assessment or treatment cycle.</li>
          <li><strong>Rejuvenation (Rasayana)</strong> — Full Rasayana program management. Design personalized rejuvenation protocols using classical Ayurvedic Rasayana formulations. Tracks the 3–6 month Rasayana course: herb schedule, diet compliance, energy levels, and bio-markers.</li>
          <li><strong>Retreats & Boot Camps</strong> — Plan and manage intensive residential spine retreat programs. Typically 7–21 day residential experiences combining Panchakarma, Yoga, meditation, and lifestyle transformation. Handles registration, accommodation booking, therapy scheduling, and dietary planning for retreat participants.</li>
        </ul>
      </StepCard>

      {/* Vitality & Vajikarana */}
      <StepCard number={14} title="Vitality & Vajikarana (18+)">
        <ul>
          <li><strong>Vajikarana & Pelvic Health</strong> — Specialized module for male sexual health, vitality, and reproductive wellness using Vajikarana Chikitsa (Ayurvedic virilization therapy). Addresses: ED, low libido, pelvic pain, and prostate-related spine-pelvic connections. Confidential clinical workflow.</li>
          <li><strong>Pelvic Floor / Kegel Program</strong> — Structured pelvic floor rehabilitation program for both male and female patients. Addresses: urinary incontinence, pelvic organ prolapse, post-partum pelvic floor weakness, and lumbosacral instability secondary to weak pelvic floor. Includes video-guided Kegel exercise protocols.</li>
          <li><strong>Confidential Assessment</strong> — Private intake form and assessment for vitality/Vajikarana cases. Captured in a separate, access-controlled workflow. Only the treating doctor and the patient can view this data. Ensures patient confidentiality for sensitive conditions.</li>
        </ul>
      </StepCard>

      {/* Spinal Injury Rehab & CSR */}
      <StepCard number={15} title="Spinal Injury Rehab & CSR">
        <ul>
          <li><strong>Rehab Registry</strong> — Registry of patients with severe spinal injuries (SCI — Spinal Cord Injury, post-surgical, paralysis). Tracks rehabilitation milestones, functional recovery scores, assistive device needs, and long-term care plans. Used for both clinical management and grant/CSR reporting.</li>
          <li><strong>Tele-Rehab Follow-Up</strong> — Remote rehabilitation support for SCI patients who cannot travel to the clinic. Video consultations, home exercise guidance, caregiver training, and remote monitoring. Expands Spine AYUSH's reach beyond physical clinic boundaries.</li>
          <li><strong>CSR Fund & Sponsorship</strong> — Manage the Corporate Social Responsibility fund for free or subsidized treatment of SCI patients from low-income backgrounds. Tracks: Donor contributions, Beneficiary cases, Treatment provided, Outcomes, and CSR reporting dashboards for corporate donors.</li>
          <li><strong>Public Impact Page ↗</strong> — External-facing page at <code>/spine/impact</code> showing the social impact of the Spine AYUSH program — patients helped, surgeries avoided, SCI cases rehabilitated, and community clinics conducted. Opens in a new tab. Share with donors, NGOs, and government health departments.</li>
        </ul>
      </StepCard>

      {/* Community & Business */}
      <StepCard number={16} title="Community & Business">
        <ul>
          <li><strong>Follow-Up Rules (Automation)</strong> — Configure automated follow-up triggers and rules. Define: when to send WhatsApp reminders, what content to send at each day/week interval, which patients get escalated to the doctor, and how to re-engage dropped-off patients. Runs without manual intervention once configured.</li>
          <li><strong>Community & Funnel</strong> — Patient community management platform. Groups by condition (Sciatica Warriors, Back Pain Recovery, Cervical Pain Group). Includes: gamification (points, badges, leaderboards for exercise compliance), weekly group calls, milestone celebrations, and the engagement pipeline: Lead → Assessment → Package → Active → Maintenance → Referral.</li>
          <li><strong>Engagement Pipeline</strong> — Detailed CRM pipeline showing every patient's current stage in the Spine AYUSH journey. Stages: Cold Lead → Assessment Done → Package Sold → Active Treatment → Completed → Maintenance → Referral Given → Churned. Identify bottlenecks and intervene with targeted communication.</li>
          <li><strong>Franchise Operations</strong> — Tab link to the Spine AYUSH franchise operations dashboard. Track per-branch performance: Patients, Revenue, Packages sold, Satisfaction scores, and Success Rate. Ensure protocol consistency across all locations.</li>
          <li><strong>Funnel & Marketing</strong> — Lead funnel analytics and marketing channel performance. Track: Cost per lead by source (Google, WhatsApp, Referral, Walk-in, Corporate), assessment-to-package conversion rate, and patient LTV. The ₹199 Assessment is the primary lead magnet — low-barrier entry for maximum top-of-funnel volume.</li>
          <li><strong>Franchise KPIs</strong> — Standardized KPI scorecard across all franchise locations. Key metrics and targets: Assessment → Package Conversion (60%+), Treatment Success Rate (80%+), Patient Satisfaction (4.5+/5), Monthly Revenue per Branch (location-specific targets), Referral Rate (15%+), Follow-up Compliance (70%+).</li>
          <li><strong>🎲 Spine Cashflow Game</strong> — Gamified business simulation for franchise staff. Staff earn points by hitting daily targets: patients registered, packages sold, sessions completed, and follow-ups sent. Leaderboard visible to all staff and management. Drives healthy competition and consistent performance. Uses a "Cashflow game" metaphor where staff level up by building the business.</li>
        </ul>
      </StepCard>

      {/* Productivity */}
      <StepCard number={17} title="Productivity">
        <ul>
          <li><strong>Task Tracker</strong> — All-in-one task management tool accessible from the Spine sidebar. Assign tasks to staff members, set due dates, add priority levels, and track completion. Covers clinical tasks (patient follow-up calls, protocol preparation), administrative tasks (billing, reports), and franchise tasks (training, inspections). Integrated with the business register for full operational accountability.</li>
        </ul>
      </StepCard>

      <TipBox title="Revenue Strategy">
        <p>The Spine Score Guarantee™ + ₹199 entry assessment + connected disease upsell (spine → related organ conditions) increases patient LTV by 3x. The community + follow-up automation ensures 70%+ retention into maintenance plans — the real long-term revenue driver.</p>
      </TipBox>

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
