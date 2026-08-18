import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Activity, ArrowLeft, Globe, Stethoscope, Heart, Brain, Clock,
  CheckCircle2, Leaf, Target, AlertTriangle, ChevronDown, ChevronUp,
  Users, Zap, Play, BookOpen, Hand, ClipboardList, Package,
  GraduationCap, IndianRupee, FileText, Save, Plus, Trash2,
  Shield, Wrench, Award,
} from "lucide-react";
import { extendedDoctorProtocols } from "./therapyDataExtended";

interface TherapyData {
  title: string; origin: string; icon: string; category: string;
  evidenceLevel: string; evidenceScore: number;
  overview: string; history: string; mechanism: string;
  spineIndications: string[];
  contraindications: string[];
  measureTools: { name: string; how: string; frequency: string }[];
  ayushIntegration: string;
  doctorProtocol: { title: string; content: string; steps?: string[]; tips?: string }[];
  patientSelfCare: { title: string; content: string; steps?: string[]; safetyNote?: string }[];
  combinationProtocols: { condition: string; plan: string }[];
  // NEW: 6 additional tool sections
  sop?: { preparation: string[]; execution: string[]; postProcedure: string[]; documentation: string[]; safetyChecks: string[] };
  equipment?: { name: string; cost: string; essential: boolean; notes: string }[];
  sessionChecklist?: { step: string; category: string }[];
  pricing?: { perSession: number; packageOptions: { name: string; sessions: number; price: number; savings: string }[]; breakEven: string; revenuePerMonth: string; competitorComparison: string };
  training?: { level: string; hours: string; certification: string; books: string[]; courses: string[]; skills: string[] }[];
}

const allTherapyData: Record<number, TherapyData> = {
  1: {
    title: "Acupuncture (TCM)", origin: "China (3000+ years)", icon: "🪡", category: "Needle-Based",
    evidenceLevel: "Strong (WHO recognized, 50+ RCTs for spine)", evidenceScore: 85,
    overview: "Traditional Chinese Medicine acupuncture uses thin sterile needles inserted at specific points along meridians to restore Qi flow, reduce pain, and promote healing. For spine conditions, the Bladder (BL) meridian running parallel to the spine is primary.",
    history: "Documented in Huangdi Neijing (Yellow Emperor's Classic, ~200 BCE). Huatuojiaji points were described by surgeon Hua Tuo (2nd century CE) specifically for spine disorders.",
    mechanism: "Needle insertion stimulates A-delta nerve fibers → gate control mechanism → pain modulation. Also releases endorphins, serotonin, and promotes local blood flow. Segmental acupuncture targets specific spinal levels.",
    spineIndications: ["Chronic low back pain", "Cervical spondylosis", "Sciatica (Gridhrasi)", "Lumbar disc herniation", "Spinal stenosis symptoms", "Muscle spasm", "Post-surgical pain", "Degenerative disc disease"],
    contraindications: ["Bleeding disorders", "Anticoagulant therapy (relative)", "Local infection/skin disease", "Pregnancy (certain points)", "Pacemaker (for electroacupuncture)", "Needle phobia (use acupressure instead)"],
    measureTools: [
      { name: "VAS Pain Scale (0-10)", how: "Patient marks pain level on visual line before & after each session", frequency: "Every session" },
      { name: "ODI (Oswestry Disability Index)", how: "10-question questionnaire on daily function limitations", frequency: "Baseline + every 2 weeks" },
      { name: "NDI (Neck Disability Index)", how: "10-question questionnaire for cervical patients", frequency: "Baseline + every 2 weeks" },
      { name: "ROM Measurement", how: "Inclinometer: flexion, extension, lateral flexion, rotation of affected spine level", frequency: "Baseline + weekly" },
      { name: "De Qi Response", how: "Document: heaviness, numbness, distension, electrical sensation at needle site", frequency: "Every session (quality indicator)" },
    ],
    ayushIntegration: "Acupuncture + Kati Basti: Needle session first (45 min) → Kati Basti same day (30 min). Oil retention over already-stimulated paravertebral tissue amplifies healing. BL23 (Shenshu) = Vrikka Marma correlation. Du Mai (Governing Vessel) = Sushumna Nadi.",
    doctorProtocol: [
      { title: "BL Channel Points for Spine", content: "Primary spine channel runs 1.5 cun lateral to midline. Key points: BL11 (T1-bone influential), BL23 (L2-kidney/back), BL25 (L4-large intestine), BL40 (popliteal-master point for back), BL60 (ankle-sciatica).", steps: ["Palpate paravertebral tenderness at each level", "Select 4-6 points based on affected segment", "Insert 0.25×40mm needles perpendicular 1-1.5 cun depth", "Obtain De Qi sensation", "Retain 20-30 minutes", "Optional: connect electroacupuncture 2-100 Hz"], tips: "BL40 is the single most important distal point for ALL back pain — always include it" },
      { title: "Huatuojiaji Points (Paravertebral)", content: "Located 0.5 cun lateral to lower border of each spinous process. Directly target the spinal nerve root at each level. Named after surgeon Hua Tuo.", steps: ["Identify affected spinal level(s) by exam", "Locate 0.5 cun lateral to spinous process inferior border", "Insert needle 0.5-1 cun perpendicular (cervical) or slightly medial-oblique (thoracic/lumbar)", "Target: multifidus, rotators, near medial branch of dorsal ramus", "Needle 2-3 levels above and below affected segment"], tips: "These are the MOST SPECIFIC points for segmental spine treatment — use for disc, stenosis, radiculopathy" },
      { title: "Du Mai (Governing Vessel) Protocol", content: "Midline posterior points: GV14 (C7-T1), GV4 (L2 Mingmen/Life Gate), GV3 (L4). Governs Yang energy of entire spine.", steps: ["GV14: below C7 spinous process — needle 0.5 cun oblique upward", "GV4 (Mingmen): between L2-L3 — needle 0.5-1 cun perpendicular", "GV3: between L4-L5 — needle 1-1.5 cun perpendicular", "Add GV20 (vertex) for descending energy regulation"], tips: "GV4 (Mingmen) = 'Gate of Vitality' — equivalent to Agni in Ayurveda. Always warm with moxa for cold/weakness patterns" },
      { title: "Electroacupuncture Protocols", content: "Connect needles to EA device for enhanced stimulation. Low frequency (2 Hz) = endorphin release, chronic pain. High frequency (100 Hz) = dynorphin, acute pain. Mixed (2/100 Hz alternating) = both.", steps: ["Insert needles at selected points bilaterally", "Connect EA leads: one pair per affected level", "Start at 0 intensity, increase until patient feels strong but comfortable tingling", "Duration: 20-30 minutes", "2 Hz for chronic, 100 Hz for acute, 2/100 Hz alternating for nerve compression"], tips: "EA at Huatuojiaji points is the GOLD STANDARD for disc herniation and radiculopathy" },
      { title: "Treatment Frequency & Course", content: "Acute: 3× per week for 2 weeks. Chronic: 2× per week for 4-6 weeks. Maintenance: 1× per week or fortnightly. One course = 10-12 sessions.", steps: ["Session 1-3: assess response (minimum 30% improvement expected)", "Sessions 4-8: consolidation phase", "Sessions 9-12: spacing out, maintenance", "Re-evaluate with ODI/NDI after course", "If no response by session 6: change point selection or add modality"] },
      { title: "Safety & Depth Guidelines", content: "Cervical: 0.5-1 cun max (critical structures). Thoracic: oblique angle only (pneumothorax risk). Lumbar: 1-2 cun safe perpendicular. Always know anatomy.", steps: ["Never needle perpendicular in upper thoracic (T1-T4)", "Avoid GV16 (medulla proximity)", "Clean technique: alcohol swab, single-use disposable needles", "Monitor for vasovagal response (pale, sweating, nausea)", "Pneumothorax signs: sudden chest pain, dyspnea — refer immediately"], tips: "When in doubt about depth — go shallower. Superficial needling still works via cutaneous nerve stimulation" },
    ],
    patientSelfCare: [
      { title: "Acupressure on Key Spine Points", content: "Press these points firmly with thumb for 60-90 seconds each, 2-3 times daily. Pain should reduce within 2-3 minutes of sustained pressure.", steps: ["BL40 (center of knee crease behind knee) — master point for ALL back pain", "BL60 (between Achilles and outer ankle bone) — sciatica & lumbar pain", "GB34 (below outer knee, front of fibula head) — muscle/tendon relaxation", "LI4 (web between thumb & index) — general pain relief (avoid in pregnancy)", "GV20 (top of head, highest point) — headache from neck problems"], safetyNote: "Press firmly but not painfully. If bruising occurs, reduce pressure. Avoid LI4 during pregnancy." },
      { title: "Self Ear Seed Protocol", content: "Apply Vaccaria seeds or magnetic pellets to ear points corresponding to spine. Press each seed 10-20 times, 3× daily. Replace every 3-5 days.", steps: ["Locate Spine zone: along antihelix ridge of ear (C-spine at bottom, L-spine at top of ridge)", "Clean ear with alcohol", "Apply seed with adhesive tape on most tender point", "Press seed 10-20 times when pain occurs", "Also apply at Shenmen point (triangular fossa) for relaxation", "Replace seeds every 3-5 days or when they fall off"], safetyNote: "Remove seeds if ear becomes red, itchy, or sore. Do not apply on broken skin. Consult doctor if no improvement in 1 week." },
      { title: "Tennis Ball Self-Acupressure (Back)", content: "Use tennis ball against wall to apply sustained pressure to paravertebral points. This mimics acupressure along the BL channel.", steps: ["Stand with back against wall, place tennis ball between wall and paraspinal muscle", "Position ball at painful level (avoid directly on spine bone)", "Lean into ball with comfortable pressure (5-7/10 intensity)", "Hold each spot 60-90 seconds until pain reduces", "Move ball up/down to find next tender spot", "Cover entire painful region: 5-10 minutes total"], safetyNote: "Never place ball directly on spinous processes. Avoid if acute disc herniation. Stop if numbness/tingling in legs occurs." },
      { title: "Daily Point Press Routine (5 minutes)", content: "Morning or evening routine combining the most effective self-accessible points for spine maintenance.", steps: ["1. Press BL40 (both sides) — 60 sec each (low back)", "2. Press GB34 (both sides) — 60 sec each (muscles)", "3. Press between eyebrows (GV24.5) — 30 sec (headache/stress)", "4. Self-massage both sides of neck base (GB20) — 30 sec each (neck)", "5. Press GV20 (top of head) — 30 sec (overall balance)"], safetyNote: "Consistent daily practice gives better results than occasional hard pressing. Be gentle but firm." },
      { title: "When to Stop & Report to Doctor", content: "Know the red flags that require stopping self-treatment and reporting immediately.", steps: ["Stop if: numbness or tingling increases in arms/legs", "Stop if: weakness develops in any limb", "Stop if: bladder/bowel changes occur", "Stop if: pain gets significantly WORSE after self-treatment", "Report: if no improvement after 2 weeks of daily self-care", "Report: if new symptoms develop that weren't there before"], safetyNote: "Self-acupressure is safe but is NOT a substitute for proper diagnosis. Always have your doctor assess first." },
    ],
    combinationProtocols: [
      { condition: "Sciatica (Gridhrasi)", plan: "Acupuncture BL40+BL60+Huatuojiaji L4-S1 → then Kati Basti same day → Tikta Ksheer Basti (16 days) → Self-acupressure BL40 daily" },
      { condition: "Cervical Spondylosis", plan: "Acupuncture Huatuojiaji C4-C7 + GB20 + GB21 → Greeva Basti → Nasya → Self-press GB20 + ear seeds for cervical zone" },
      { condition: "Lumbar Disc Herniation", plan: "Electroacupuncture Huatuojiaji L4-S1 (2/100Hz) → Kati Basti → Agnikarma trigger points → Self-tennis ball BL channel daily" },
      { condition: "Muscle Spasm (Acute)", plan: "Acupuncture BL40 + Ashi points → immediate relief → follow with Patra Pinda Sweda → Patient: hot pack + BL40 press at home" },
    ],
    // ─── NEW: 6 Tool Sections for Therapy #1 (Acupuncture) ───
    sop: {
      preparation: [
        "Verify patient identity and condition (check chart/file)",
        "Confirm informed consent signed",
        "Review contraindications: bleeding disorders, pacemaker (for EA), pregnancy points",
        "Check needle stock: 0.25×25mm (face), 0.30×40mm (body), 0.30×75mm (gluteal)",
        "Prepare alcohol swabs, cotton balls, sharps container",
        "Set up electroacupuncture unit if needed (check batteries/leads)",
        "Ensure treatment room: clean bed, fresh sheet, pillow, blanket",
        "Wash hands + apply gloves",
        "Position patient comfortably (prone for back, supine for limbs)",
      ],
      execution: [
        "Palpate and mark acupuncture points (skin marker if needed)",
        "Swab point locations with alcohol (dry 5 sec before needle)",
        "Insert needles at correct angle and depth per point protocol",
        "Achieve De Qi (patient feels heaviness/distension/radiating)",
        "Connect electroacupuncture leads if using EA (set frequency: 2Hz nerve, 100Hz pain gate)",
        "Set timer: 20-30 minutes retention",
        "Cover patient with blanket, dim lights, play calming music",
        "Check patient every 10 min (consciousness, comfort, needle sites)",
        "Remove needles at end of time — press cotton on each site",
        "Count all needles removed = count inserted (safety check)",
      ],
      postProcedure: [
        "Apply pressure to any bleeding points (hold 30 sec)",
        "Ask patient to remain lying 2 min before sitting up (prevent vasovagal)",
        "Offer water and check for dizziness/light-headedness",
        "Record VAS pain score AFTER treatment",
        "Advise: drink water, avoid heavy exercise today, rest if tired",
        "Schedule next session (explain treatment frequency plan)",
        "Dispose needles in sharps bin immediately",
      ],
      documentation: [
        "Record: points used, needle gauge/depth, retention time",
        "Record: VAS before and after session",
        "Note: De Qi achieved (yes/no per point)",
        "Note: any adverse events (bleeding, bruising, fainting)",
        "Update treatment plan / progress notes",
        "Document informed consent if first session",
      ],
      safetyChecks: [
        "Never needle over major arteries or organs without training",
        "Pneumothorax risk: avoid deep needling T1-T12 medial points (>15mm max)",
        "Check anticoagulant medications before needling",
        "Never leave patient unattended with needles in situ",
        "Emergency kit available: glucose, ammonia, cotton, tourniquet",
        "Needle count IN must equal needle count OUT",
      ],
    },
    equipment: [
      { name: "Acupuncture Needles (0.25×25mm)", cost: "₹200/100 pack", essential: true, notes: "For face, ear, hand points. Seirin or Huanqiu brand recommended." },
      { name: "Acupuncture Needles (0.30×40mm)", cost: "₹250/100 pack", essential: true, notes: "Standard body points. Most commonly used gauge." },
      { name: "Acupuncture Needles (0.30×75mm)", cost: "₹300/100 pack", essential: true, notes: "Deep points: gluteals, piriformis, Huatuojiaji. Use with caution." },
      { name: "Electroacupuncture Unit", cost: "₹8,000-15,000", essential: false, notes: "SDZ-II or KWD-808. 2-channel minimum. For nerve conditions and disc issues." },
      { name: "Alcohol Swabs (sterile)", cost: "₹150/100 pack", essential: true, notes: "70% isopropyl. Swab each point before needling." },
      { name: "Sharps Container (1L)", cost: "₹200-400", essential: true, notes: "Yellow puncture-proof. Replace when 3/4 full. Biomedical waste disposal." },
      { name: "Cotton Balls (sterile)", cost: "₹50/pack", essential: true, notes: "Press on needle site post-removal." },
      { name: "Skin Marker Pen", cost: "₹50-100", essential: false, notes: "Mark points before needling for accuracy. Washable ink." },
      { name: "Acupuncture Point Chart (wall)", cost: "₹500-1500", essential: false, notes: "Full body meridian chart + spine-specific Huatuojiaji chart." },
      { name: "Treatment Timer", cost: "₹300 (or phone)", essential: true, notes: "Set 20-30 min retention. Audible alert." },
      { name: "Treatment Bed (adjustable)", cost: "₹15,000-30,000", essential: true, notes: "Face hole for prone position. Height adjustable. Clean vinyl cover." },
      { name: "Moxa Sticks (optional)", cost: "₹500/box", essential: false, notes: "For warming needle technique (cold-type pain). Keep fire extinguisher nearby." },
    ],
    sessionChecklist: [
      { step: "Patient identity verified", category: "Pre" },
      { step: "Consent confirmed (verbal/written)", category: "Pre" },
      { step: "Contraindications screened", category: "Pre" },
      { step: "VAS pain score recorded (BEFORE)", category: "Pre" },
      { step: "ROM measured if applicable", category: "Pre" },
      { step: "Hands washed + gloves on", category: "Pre" },
      { step: "Points selected based on diagnosis", category: "Procedure" },
      { step: "Skin swabbed with alcohol", category: "Procedure" },
      { step: "Needles inserted — correct angle/depth", category: "Procedure" },
      { step: "De Qi achieved (document per point)", category: "Procedure" },
      { step: "EA connected if indicated (freq/intensity set)", category: "Procedure" },
      { step: "Timer set (20-30 min)", category: "Procedure" },
      { step: "Patient checked at 10 min", category: "Procedure" },
      { step: "Patient checked at 20 min", category: "Procedure" },
      { step: "All needles removed and counted", category: "Post" },
      { step: "Needle count matches (IN = OUT)", category: "Post" },
      { step: "Pressure applied to any bleeders", category: "Post" },
      { step: "Patient sat up slowly (2 min wait)", category: "Post" },
      { step: "VAS pain score recorded (AFTER)", category: "Post" },
      { step: "Adverse events documented (if any)", category: "Post" },
      { step: "Next session scheduled", category: "Post" },
      { step: "Needles disposed in sharps bin", category: "Post" },
      { step: "Treatment notes written in file", category: "Post" },
    ],
    pricing: {
      perSession: 600,
      packageOptions: [
        { name: "Trial (5 sessions)", sessions: 5, price: 2500, savings: "₹500 off" },
        { name: "Standard (10 sessions)", sessions: 10, price: 5000, savings: "₹1,000 off" },
        { name: "Intensive (15 sessions)", sessions: 15, price: 7000, savings: "₹2,000 off" },
        { name: "Maintenance (Monthly 4)", sessions: 4, price: 2000, savings: "₹400 off" },
      ],
      breakEven: "4 patients/day × 25 days = 100 sessions × ₹600 = ₹60,000/month. Break-even at 50 sessions with equipment amortization.",
      revenuePerMonth: "Target: 80-120 sessions/month = ₹48,000-72,000 (acupuncture alone)",
      competitorComparison: "Physiotherapy clinic: ₹300-500/session. Pain clinic injections: ₹1500-3000. Acupuncture at ₹600 is mid-range with superior outcomes for chronic pain.",
    },
    training: [
      { level: "Beginner (Certificate)", hours: "100 hours", certification: "Certificate in Medical Acupuncture", books: ["Deadman — A Manual of Acupuncture", "Maciocia — Foundations of Chinese Medicine"], courses: ["WHO Standard 200-hr Acupuncture Course", "AYUSH Ministry Acupuncture Program (India)"], skills: ["Point location (50 key points)", "Safe needling technique", "Basic TCM diagnosis", "Spine point protocols (BL channel)"] },
      { level: "Intermediate (Diploma)", hours: "300-500 hours", certification: "Diploma in Acupuncture / PG Diploma", books: ["Deadman — Complete", "Shanghai Textbook of Acupuncture", "Yun-tao Ma — Biomedical Acupuncture"], courses: ["Nanjing University Distance Diploma", "MUHS PG Diploma Acupuncture", "Carrick Institute Neuro-Acupuncture"], skills: ["Electroacupuncture (EA)", "Scalp acupuncture", "Musculoskeletal specialization", "Research interpretation"] },
      { level: "Advanced (Master)", hours: "1000+ hours", certification: "MD Acupuncture / Board Certified", books: ["Gunn — Intramuscular Stimulation", "White — Western Medical Acupuncture", "Baldry — Acupuncture, Trigger Points & MSK Pain"], courses: ["Beijing University of TCM (MD)", "McMaster Contemporary Medical Acupuncture", "DACNB Functional Neurology + Acupuncture"], skills: ["Complex pain cases", "Research publication", "Teaching/training others", "Integration with Ayurveda/Siddha", "Running an acupuncture department"] },
    ],
  },
  2: {
    title: "Acupressure Therapy", origin: "China/Japan (2000+ years)", icon: "👆", category: "Manual Therapy",
    evidenceLevel: "Moderate (30+ clinical trials)", evidenceScore: 70,
    overview: "Acupressure applies sustained manual pressure on acupoints without needles. Same point system as acupuncture but non-invasive. Ideal for patient self-treatment and as doctor's adjunct between acupuncture sessions.",
    history: "Predates acupuncture — finger pressure was the original stimulation method before needles were developed. Shiatsu (Japan) and Tui Na (China) are specialized forms.",
    mechanism: "Sustained pressure (30-90 sec) activates mechanoreceptors → releases muscle tension, improves local circulation, stimulates endogenous opioid system. Gate control theory applies.",
    spineIndications: ["Muscle tension headaches", "Cervicogenic headache", "Morning back stiffness", "Chronic low back pain", "Stress-related spine tension", "Maintenance between treatments"],
    contraindications: ["Open wounds/skin lesions at point", "Fracture site", "Deep vein thrombosis (leg points)", "Severe osteoporosis (gentle only)", "Pregnancy (avoid LI4, SP6)"],
    measureTools: [
      { name: "VAS Pain Scale", how: "Before and after each session/self-treatment", frequency: "Every session" },
      { name: "PPT (Pressure Pain Threshold)", how: "Algometer on tender points — document reduction over time", frequency: "Weekly" },
      { name: "Muscle Tension Score (0-3)", how: "Palpation: 0=normal, 1=mild, 2=moderate, 3=severe taut band", frequency: "Every session" },
      { name: "Patient Self-Efficacy Score", how: "How confident patient is in managing own pain (1-10)", frequency: "Baseline + monthly" },
    ],
    ayushIntegration: "Acupressure points overlap 70% with Marma points. GB20 = Krikatika Marma. BL23 = Kukundara Marma. Combine Marma oil application + acupressure for synergistic Vata pacification.",
    doctorProtocol: [
      { title: "Spine-Specific Point Protocol", content: "Focus on BL channel paravertebral points + distal master points. Use sustained thumb pressure 5-7 kg force for 60-90 seconds per point.", steps: ["Patient prone on treatment table", "Apply warm oil to back (sesame/Mahanarayan)", "Start at cervical: GB20, BL10 — sustained press 60 sec each", "Move down BL channel: press each tender paravertebral point", "Key lumbar points: BL23, BL25, BL40 (knee crease)", "Finish with sacral press: BL27, BL28, BL31-34 (Baliao points)"], tips: "Always press BL40 last — it 'opens the gate' for back pain relief" },
      { title: "Tui Na Integration for Spine", content: "Combine point pressure with rolling, kneading, and grasping techniques along erector spinae. More dynamic than static acupressure alone.", steps: ["Rolling technique (gun fa) along erector spinae — 2 min each side", "Grasping technique (na fa) on upper trapezius — 10 repetitions", "Thumb press (an fa) on each Huatuojiaji point tender spot", "Chopping technique (pi fa) on buttocks for piriformis", "Finish with palm rubbing (mo fa) over Du Mai midline — warming"], tips: "Tui Na + Acupressure combined session = 30 min is ideal for spine patients" },
      { title: "Pressure Technique Variations", content: "Different techniques for different presentations: sustained for chronic, pulsed for acute, circular for tension.", steps: ["Sustained press: 60-90 sec, chronic muscle tension — most common", "Pulsed press: 3 sec on / 3 sec off × 10 — acute spasm, sensitive patients", "Circular friction: small circles on point — fascial adhesions", "Cross-fiber friction: perpendicular to muscle fibers — scar tissue", "Vibration: rapid oscillation on point — nerve-related pain"] },
      { title: "Treatment Dosage & Frequency", content: "Acute: daily for 5-7 days. Chronic: 2-3× per week. Each session 20-30 minutes. Course: 10-15 sessions.", steps: ["First session: lighter pressure, assess patient response", "Progress pressure gradually over sessions (patient tolerance)", "Acute phase: daily 15-20 min focused on painful area", "Chronic phase: 2-3×/week, 25-30 min comprehensive", "Maintenance: weekly or patient self-care with monthly professional check"] },
    ],
    patientSelfCare: [
      { title: "Self-Press GB20 (Neck/Headache)", content: "The 'wind pool' point at the skull base — most effective self-accessible point for neck pain and cervicogenic headache.", steps: ["Sit comfortably, tilt head slightly forward", "Place both thumbs at base of skull, in the hollows on either side of spine", "Press firmly upward and inward — you'll feel a 'good pain'", "Hold steady pressure 60-90 seconds", "Breathe slowly and deeply during press", "Repeat 3× daily, especially morning and before bed"], safetyNote: "Don't press if you have high blood pressure or dizziness. Gentle pressure only — never force." },
      { title: "Tennis Ball Wall Technique (Back)", content: "Replaces professional BL channel acupressure — you control the pressure by leaning into ball against wall.", steps: ["Stand 6 inches from wall, place tennis ball between wall and upper back muscle", "Lean back to create comfortable pressure (5-7/10)", "Hold on each tender spot for 60 seconds", "Roll slowly up/down to find next tender spot", "Cover neck-to-sacrum: 10 minutes total", "For deeper pressure: use lacrosse ball instead of tennis ball"], safetyNote: "Never on spine bones directly. Stop if tingling radiates to arms/legs. Avoid on acute inflamed areas." },
      { title: "Partner-Assisted Back Protocol", content: "Simple protocol for partner/family member to perform. No training needed — just sustained thumb pressure on tender spots.", steps: ["Patient lies face-down on firm surface", "Partner locates tender spots 2 finger-widths beside spine", "Use thumbs to press each tender spot: firm but not painful (ask patient)", "Hold each point 60 seconds — patient breathes deeply", "Work from neck down to sacrum, both sides", "Total time: 10-15 minutes"], safetyNote: "Partner should ask 'how's the pressure?' — patient guides intensity. Never crack or manipulate spine." },
      { title: "Morning Stiffness Release (3 min)", content: "Quick morning routine before getting out of bed to reduce spine stiffness.", steps: ["In bed: press GB20 (skull base) 30 sec each side", "Self-knead both sides of neck with fingers — 30 sec", "Fists under low back (BL23 area) — lie on them 60 sec", "Knee-to-chest stretch: 30 sec each side", "Cat-cow in bed: 5 slow repetitions", "Stand up slowly — press BL40 (behind knees) 15 sec each"], safetyNote: "Do gently — morning muscles are cold. Don't bounce or force stretches." },
    ],
    combinationProtocols: [
      { condition: "Chronic Low Back Pain", plan: "Doctor acupressure (2×/week) + Patient self-tennis ball daily + Kati Basti (weekly) + Marma oil self-massage" },
      { condition: "Cervicogenic Headache", plan: "GB20 + BL10 acupressure in clinic + Patient self-press GB20 3×/day + Nasya + Greeva Basti weekly" },
      { condition: "Stress-Related Back Pain", plan: "Full BL channel acupressure + Shirodhara + Patient morning routine + Ashwagandha internal" },
    ],
    sop: {
      preparation: [
        "Review patient file — condition, tender points from last session",
        "Ensure treatment room is warm (Vata patients need warmth)",
        "Prepare warm oil (sesame/Mahanarayan Taila) in oil warmer",
        "Clean towels, face cradle cover, bolster under ankles if prone",
        "Wash hands thoroughly (no gloves needed for acupressure)",
        "Ask patient about current pain level and area of worst complaint today",
      ],
      execution: [
        "Position patient (prone for back, supine for limbs)",
        "Apply warm oil to treatment area",
        "Begin with broad palm compressions to warm tissue (2 min)",
        "Palpate systematically for taut bands and tender points",
        "Apply sustained thumb pressure to each active point (60-90 sec)",
        "Maintain pressure at 7/10 tolerance — wait for barrier release",
        "Progress point-to-point along BL channel (top → bottom)",
        "Include distal master points: BL40 (low back), GB20 (cervical)",
        "Total treatment: 20-30 minutes",
      ],
      postProcedure: [
        "Wipe excess oil with warm towel",
        "Ask patient to remain lying 1-2 min (relaxation response)",
        "Record VAS after treatment",
        "Teach patient 2-3 self-press points for home",
        "Advise: drink warm water, avoid cold exposure 2 hours",
        "Schedule next session",
      ],
      documentation: [
        "Record points treated and tenderness score (0-3) per point",
        "VAS before and after",
        "Oil used and quantity",
        "Patient self-care points taught",
        "Any adverse reactions (bruising, excessive tenderness)",
      ],
      safetyChecks: [
        "Avoid pressure over fractures or acute inflammation",
        "Check for DVT signs before leg point work (calf warmth/swelling)",
        "Reduce pressure for osteoporotic patients",
        "Avoid LI4 and SP6 in pregnant patients",
        "Stop if patient reports radiating nerve symptoms",
      ],
    },
    equipment: [
      { name: "Treatment Table (padded, face hole)", cost: "₹15,000-30,000", essential: true, notes: "Adjustable height preferred. Face cradle for prone work." },
      { name: "Oil Warmer (electric)", cost: "₹1,000-2,000", essential: true, notes: "Keep oil at 38-40°C. Never apply cold oil to Vata patients." },
      { name: "Sesame Oil (cold-pressed, 1L)", cost: "₹300-500", essential: true, notes: "Base oil for general acupressure. Vata pacifying." },
      { name: "Mahanarayan Taila (500ml)", cost: "₹400-700", essential: true, notes: "Medicated oil for musculoskeletal pain. Spine-specific." },
      { name: "Towels (large + small)", cost: "₹500/set", essential: true, notes: "For draping and wiping. Keep warm in warmer." },
      { name: "Pressure Algometer (digital)", cost: "₹8,000-15,000", essential: false, notes: "For objective PPT measurement. Research-grade assessment." },
      { name: "Tennis Balls (for patient demo)", cost: "₹200/pack", essential: false, notes: "To demonstrate wall technique for patient self-care." },
      { name: "Acupoint Chart (BL channel focus)", cost: "₹500-1000", essential: false, notes: "Wall reference showing spine-specific BL channel points." },
    ],
    sessionChecklist: [
      { step: "Patient pain level assessed (VAS)", category: "Pre" },
      { step: "Area of worst complaint identified today", category: "Pre" },
      { step: "Contraindications reviewed", category: "Pre" },
      { step: "Oil warmed and ready", category: "Pre" },
      { step: "Patient positioned comfortably", category: "Pre" },
      { step: "Warm-up compressions applied (2 min)", category: "Procedure" },
      { step: "Taut bands palpated and documented", category: "Procedure" },
      { step: "Active points treated (60-90 sec sustained pressure each)", category: "Procedure" },
      { step: "Barrier release noted per point", category: "Procedure" },
      { step: "Distal points included (BL40/GB20)", category: "Procedure" },
      { step: "Total treatment 20-30 min", category: "Procedure" },
      { step: "Post-treatment VAS recorded", category: "Post" },
      { step: "Self-care points taught to patient", category: "Post" },
      { step: "Next session scheduled", category: "Post" },
      { step: "Notes written in patient file", category: "Post" },
    ],
    pricing: {
      perSession: 500,
      packageOptions: [
        { name: "Trial (5 sessions)", sessions: 5, price: 2200, savings: "₹300 off" },
        { name: "Standard (10 sessions)", sessions: 10, price: 4000, savings: "₹1,000 off" },
        { name: "Monthly Wellness (8)", sessions: 8, price: 3500, savings: "₹500 off" },
        { name: "Family Pack (20)", sessions: 20, price: 8000, savings: "₹2,000 off" },
      ],
      breakEven: "5 patients/day × 25 days = 125 sessions × ₹500 = ₹62,500/month. Low equipment cost — fast break-even.",
      revenuePerMonth: "Target: 100-150 sessions/month = ₹50,000-75,000",
      competitorComparison: "Spa massage: ₹800-1500 (relaxation only). Physiotherapy: ₹300-500. Acupressure at ₹500 is therapeutic + accessible — patients can self-maintain.",
    },
    training: [
      { level: "Beginner (Certificate)", hours: "50-100 hours", certification: "Certificate in Acupressure / Tui Na", books: ["Gach — Acupressure's Potent Points", "Jarmey — Shiatsu Foundation Course"], courses: ["AYUSH Acupressure Certificate (India)", "Shiatsu Foundation Course (100 hrs)"], skills: ["20 key spine points location", "Sustained pressure technique", "Basic TCM theory", "Patient self-care teaching"] },
      { level: "Intermediate (Diploma)", hours: "200-300 hours", certification: "Diploma in Acupressure / Shiatsu Practitioner", books: ["Beresford-Cooke — Shiatsu Theory & Practice", "Deadman — Points Handbook"], courses: ["ITEC Diploma Shiatsu", "Tui Na Professional Training"], skills: ["Full BL channel protocol", "Tui Na rolling/grasping techniques", "Assessment & treatment planning", "Integration with oil therapy"] },
      { level: "Advanced (Specialist)", hours: "500+ hours", certification: "Advanced Practitioner / Shiatsu Teacher", books: ["Masunaga — Zen Shiatsu", "Sasaki — Sotai Movement Therapy"], courses: ["Master Shiatsu Training (Japan)", "Acupressure + Marma Integration Course"], skills: ["Meridian diagnosis by palpation", "Sotai corrective movement", "Teaching other practitioners", "Complex chronic pain management"] },
    ],
  },
  3: {
    title: "Dry Needling", origin: "Western (1940s, Janet Travell)", icon: "📌", category: "Needle-Based",
    evidenceLevel: "Strong (40+ RCTs)", evidenceScore: 80,
    overview: "Thin monofilament needles inserted directly into myofascial trigger points to elicit a local twitch response, release muscle tension, and restore normal tissue function. Unlike acupuncture, based on neuroanatomy rather than meridian theory.",
    history: "Dr. Janet Travell (JFK's physician) mapped trigger points in 1940s. Karel Lewit refined needle technique in 1970s. Now widely practiced by physiotherapists and doctors worldwide.",
    mechanism: "Needle penetrates taut band → mechanical disruption of dysfunctional motor endplate → local twitch response → immediate reduction in acetylcholine concentration → muscle relaxation → restored blood flow → pain relief.",
    spineIndications: ["Myofascial trigger point pain", "Multifidus dysfunction", "Upper trapezius tension", "Piriformis syndrome", "Quadratus lumborum spasm", "Levator scapulae tightness", "Thoracolumbar paraspinal tension"],
    contraindications: ["Needle phobia", "Bleeding disorders/anticoagulants", "Local infection", "Over lung apex (pneumothorax risk)", "Compromised immune system", "First trimester pregnancy"],
    measureTools: [
      { name: "VAS Pain Scale", how: "Before, immediately after, and 24-48 hours post-treatment", frequency: "Every session" },
      { name: "PPT (Pressure Pain Threshold)", how: "Digital algometer on trigger point — measure kg/cm² at pain onset", frequency: "Before & after each session" },
      { name: "Local Twitch Response Count", how: "Count number of visible twitches obtained during needling", frequency: "Every session (treatment quality)" },
      { name: "Referred Pain Reproduction", how: "Document if needling reproduces patient's complaint pattern", frequency: "First session (diagnostic value)" },
    ],
    ayushIntegration: "Post-dry needling: immediate Abhyanga with Mahanarayan Taila over treated area (oil penetrates micro-channels created by needles). Then Nadi Sweda for 10 min. Enhances tissue healing, reduces post-needling soreness by 50%.",
    doctorProtocol: [
      { title: "Multifidus Dry Needling (Lumbar)", content: "Most important deep spine muscle — atrophies in chronic LBP. Needling restores neuromuscular control.", steps: ["Patient prone, identify affected level by palpation", "Palpate 1-2 cm lateral to spinous process for taut band", "Insert 0.3×50mm needle perpendicular to skin", "Advance until taut band resistance felt (2-4 cm depth)", "Fast in-and-out technique (pistoning) to elicit twitch", "Target 3-5 twitch responses per point", "Treat bilateral, 2-3 levels"], tips: "Multifidus is THE key deep stabilizer — restore it and many spine problems resolve" },
      { title: "Upper Trapezius & Levator Scap", content: "Most common trigger points causing neck pain and cervicogenic headache. Pincer palpation technique for safety.", steps: ["Pincer grasp upper trap between thumb and fingers (lift away from chest)", "Insert needle through elevated muscle — safe from lung", "Piston technique: seek twitch responses", "For levator scap: needle at superior angle of scapula", "Angle away from chest wall (direct laterally)", "3-5 twitches per trigger point sufficient"], tips: "ALWAYS use pincer technique in thoracic region — eliminates pneumothorax risk completely" },
      { title: "Piriformis Needling", content: "Key muscle for sciatica that's not from disc. Runs over sciatic nerve. Deep needling required.", steps: ["Patient side-lying, affected side up, hip flexed 60°", "Locate piriformis: from sacrum apex to greater trochanter, midpoint", "Insert 0.3×75mm needle perpendicular to muscle (deep: 5-7 cm)", "Seek twitches — patient may feel familiar sciatic reproduction", "3-5 twitches, then withdraw", "Post-treatment: hip internal rotation stretch"], tips: "If patient's sciatic symptoms reproduce with needling — confirms piriformis involvement" },
      { title: "Safety: Pneumothorax Prevention", content: "The most serious dry needling complication. Know the safe zones and dangerous zones.", steps: ["DANGEROUS: T1-T12 paraspinal perpendicular needling", "SAFE: use tangential/oblique angle in thoracic region", "SAFE: pincer technique lifts muscle away from chest", "SAFE: lumbar region (no lung) — perpendicular OK", "SAFE: cervical (if not going deep toward apex of lung)", "If suspected: immediate chest X-ray, pulse oximetry, refer"] },
    ],
    patientSelfCare: [
      { title: "Foam Roller Myofascial Release", content: "Self-treatment substitute for dry needling — applies sustained pressure to trigger points without needles.", steps: ["Lie on foam roller, position under upper back", "Cross arms over chest to expose scapular area", "Roll slowly up and down — stop on each tender spot 30-60 sec", "For low back: place roller perpendicular, roll hips side-to-side", "For piriformis: sit on roller, cross ankle over knee, lean to affected side", "Duration: 10-15 minutes, avoid bony prominences"], safetyNote: "Never foam roll directly on spine bones. Avoid if acute disc herniation. Some soreness next day is normal." },
      { title: "Lacrosse Ball for Deep Trigger Points", content: "Harder than tennis ball — reaches deeper trigger points (piriformis, QL, multifidus area).", steps: ["Piriformis: sit on ball, cross leg over opposite knee, lean into painful side", "QL: side-lying with ball between ribs and pelvis, roll slowly", "Suboccipitals: lie face-up, ball under skull base, nod slowly", "Hold each spot 60-90 sec until pain decreases by 50%", "Move to next spot — cover 4-5 spots per session"], safetyNote: "Intense pressure is OK but stop if you get radiating numbness or tingling." },
      { title: "Post-Dry Needling Self-Care", content: "What to do after your doctor's dry needling session to maximize benefit and reduce soreness.", steps: ["Drink extra water (2 glasses within 1 hour)", "Apply warm pack to treated area for 15-20 min that evening", "Gentle stretching of treated muscle — hold 30 sec × 3", "Mild soreness (like post-workout) is NORMAL for 24-48 hours", "If bruising: arnica or Dashang Lepa topically", "Keep area warm — avoid cold/AC draft on treated muscles"], safetyNote: "Soreness should decrease by 48 hours. If pain increases significantly or fever develops — contact your doctor." },
    ],
    combinationProtocols: [
      { condition: "Multifidus Dysfunction + LBP", plan: "Dry needling multifidus → Kati Basti (same day) → Core stability exercises (Phase 2) → Patient foam roller daily" },
      { condition: "Upper Trap TrP + Headache", plan: "Dry needling upper trap → Greeva Basti → Nasya → Patient lacrosse ball suboccipitals daily" },
      { condition: "Piriformis Sciatica", plan: "Dry needling piriformis → Kati Basti → Agnikarma on gluteal TrPs → Patient ball release + stretch daily" },
    ],
    sop: {
      preparation: [
        "Review patient file — muscles to target, previous session response",
        "Informed consent: explain needle sensation, expected twitch, post-soreness",
        "Screen contraindications: bleeding, infection, anticoagulants, needle phobia",
        "Prepare needles: 0.30×40mm (superficial), 0.30×50mm (medium), 0.30×75mm (deep/gluteal)",
        "Alcohol swabs, cotton balls, sharps container, gloves ready",
        "Position patient (prone for back, side-lying for piriformis)",
        "Identify target muscles by palpation — mark taut bands with skin marker",
      ],
      execution: [
        "Wash hands + don gloves",
        "Palpate target muscle — identify taut band and active TrP",
        "Swab skin over TrP with alcohol (dry 5 sec)",
        "For thoracic: use PINCER technique (lift muscle off ribs) — pneumothorax prevention",
        "Insert needle into taut band — feel tissue resistance change",
        "Use fast in-out (pistoning) technique to elicit local twitch response (LTR)",
        "Target: 3-5 LTRs per trigger point",
        "When twitches stop → TrP deactivated — move to next",
        "Treat 3-6 trigger points per session maximum",
        "Remove needle, apply cotton pressure to each site",
      ],
      postProcedure: [
        "Count all needles out = needles in (safety critical)",
        "Apply pressure to any bleeding sites (30 sec)",
        "Stretch treated muscles immediately (30 sec × 3 per muscle)",
        "Apply warm pack or Nadi Sweda for 10 min post-treatment",
        "Record VAS after treatment",
        "Warn patient: soreness 24-48 hrs is normal (like post-workout)",
        "Advise: hydrate well, avoid heavy exercise today, warm pack tonight",
      ],
      documentation: [
        "Muscles needled (specific points)",
        "Needle gauge and depth per muscle",
        "Number of LTRs obtained per point",
        "Referred pain reproduction (yes/no — diagnostic significance)",
        "VAS before and after",
        "Any adverse events: bleeding, hematoma, increased pain",
      ],
      safetyChecks: [
        "NEVER needle perpendicular in thoracic paraspinal region (pneumothorax)",
        "Use pincer technique or tangential angle for all thoracic muscles",
        "Lumbar region: safe for perpendicular — no lung",
        "If patient reports sharp chest pain or breathing difficulty → stop → chest X-ray",
        "Needle count IN must equal needle count OUT — verify before patient leaves",
        "Never needle over carotid artery, femoral artery, or brachial artery",
      ],
    },
    equipment: [
      { name: "Dry Needling Needles (0.30×40mm)", cost: "₹250/100 pack", essential: true, notes: "Standard depth for upper trap, levator scap, cervical paraspinals." },
      { name: "Dry Needling Needles (0.30×50mm)", cost: "₹280/100 pack", essential: true, notes: "Medium depth for lumbar multifidus, QL, infraspinatus." },
      { name: "Dry Needling Needles (0.30×75mm)", cost: "₹300/100 pack", essential: true, notes: "Deep muscles: piriformis, gluteus medius, psoas. Use with caution." },
      { name: "Alcohol Swabs", cost: "₹150/100", essential: true, notes: "70% isopropyl. Swab each insertion site." },
      { name: "Sharps Container", cost: "₹200-400", essential: true, notes: "Yellow, puncture-proof. Replace when 3/4 full." },
      { name: "Disposable Gloves (nitrile)", cost: "₹400/100", essential: true, notes: "Wear for every session. Change if glove punctured." },
      { name: "Skin Marker", cost: "₹50-100", essential: false, notes: "Mark TrP locations before needling for accuracy." },
      { name: "Pressure Algometer", cost: "₹8,000-15,000", essential: false, notes: "Objective measurement of PPT before/after. Research-grade." },
      { name: "Anatomy Reference (Travell Manual)", cost: "₹5,000-8,000", essential: true, notes: "Volume 1 (upper body) + Volume 2 (lower body). Essential reference." },
      { name: "Warm Pack / Nadi Sweda unit", cost: "₹2,000-5,000", essential: false, notes: "Post-treatment warming. Reduces soreness. Optional but recommended." },
    ],
    sessionChecklist: [
      { step: "Patient consent confirmed (verbal)", category: "Pre" },
      { step: "Contraindications screened", category: "Pre" },
      { step: "VAS recorded (before)", category: "Pre" },
      { step: "Target muscles identified by palpation", category: "Pre" },
      { step: "Needles and sharps bin ready", category: "Pre" },
      { step: "Gloves on, skin swabbed", category: "Procedure" },
      { step: "Taut band located — TrP identified", category: "Procedure" },
      { step: "Pincer technique used (thoracic region)", category: "Procedure" },
      { step: "LTR obtained (count documented)", category: "Procedure" },
      { step: "Referred pain reproduction checked", category: "Procedure" },
      { step: "Maximum 6 TrPs treated per session", category: "Procedure" },
      { step: "All needles removed and counted", category: "Post" },
      { step: "Needle count IN = OUT verified", category: "Post" },
      { step: "Muscle stretched post-treatment (30 sec × 3)", category: "Post" },
      { step: "Warm pack applied (10 min)", category: "Post" },
      { step: "VAS recorded (after)", category: "Post" },
      { step: "Post-care instructions given", category: "Post" },
      { step: "Notes written in patient file", category: "Post" },
    ],
    pricing: {
      perSession: 700,
      packageOptions: [
        { name: "Trial (3 sessions)", sessions: 3, price: 1800, savings: "₹300 off" },
        { name: "Standard (6 sessions)", sessions: 6, price: 3500, savings: "₹700 off" },
        { name: "Intensive (10 sessions)", sessions: 10, price: 5500, savings: "₹1,500 off" },
        { name: "Combo: DN + Manual TrP (8)", sessions: 8, price: 5000, savings: "₹1,600 off (includes 4 DN + 4 manual)" },
      ],
      breakEven: "4 patients/day × 25 days = 100 sessions × ₹700 = ₹70,000/month. Needle cost per session: ₹15-25. High margin therapy.",
      revenuePerMonth: "Target: 60-100 sessions/month = ₹42,000-70,000",
      competitorComparison: "Physiotherapy clinic DN: ₹500-800. Pain clinic injection: ₹1500-3000. At ₹700, competitive with better sustained outcomes than injections.",
    },
    training: [
      { level: "Beginner (Certificate)", hours: "30-50 hours", certification: "Certificate in Dry Needling Level 1", books: ["Dommerholt — Trigger Point Dry Needling", "Travell & Simons Vol 1 & 2 (reference)"], courses: ["Myopain Seminars DN Level 1 (30 hrs)", "APTA Dry Needling Certification"], skills: ["TrP palpation and identification", "Safe needle insertion (superficial)", "Upper trap, levator scap, forearm muscles", "Pneumothorax awareness"] },
      { level: "Intermediate (Advanced)", hours: "80-150 hours", certification: "Advanced Dry Needling Practitioner", books: ["Gunn — Intramuscular Stimulation (IMS)", "Baldry — Myofascial Pain & Fibromyalgia"], courses: ["Myopain Level 2 + 3 (spine + deep muscles)", "IMS Certification (UBC/Gunn approach)"], skills: ["Deep needling (piriformis, multifidus, psoas)", "Pincer technique (thoracic safety)", "Electroacupuncture integration", "Complex myofascial pain cases"] },
      { level: "Advanced (Expert)", hours: "200+ hours", certification: "Fellow in Myofascial Pain / DN Instructor", books: ["Dommerholt — Complete DN Manual", "Research papers: Cagnie, Fernandez-de-las-Penas"], courses: ["DN Instructor Training", "Ultrasound-Guided DN Course"], skills: ["US-guided deep needling", "Teaching/certifying others", "Research methodology", "Multidisciplinary pain management integration"] },
    ],
  },
  4: {
    title: "Trigger Point Therapy", origin: "USA (Travell & Simons, 1983)", icon: "🎯", category: "Manual Therapy",
    evidenceLevel: "Strong (established clinical framework)", evidenceScore: 78,
    overview: "Manual identification and treatment of myofascial trigger points — hyperirritable spots in taut bands of skeletal muscle that cause referred pain patterns. Treatment: ischemic compression, spray & stretch, and positional release.",
    history: "Dr. Janet Travell and Dr. David Simons published the definitive 'Trigger Point Manual' (1983) mapping referred pain patterns for every muscle. Foundation of modern myofascial pain treatment.",
    mechanism: "Sustained pressure on TrP → local ischemia → reactive hyperemia on release → restoration of normal sarcomere length → normalized motor endplate activity → resolution of taut band.",
    spineIndications: ["Referred pain mimicking radiculopathy", "Chronic muscle knots", "Postural pain (UCS/LCS muscles)", "Headache from cervical TrPs", "Hip/leg pain from QL/piriformis TrPs", "Inter-scapular burning"],
    contraindications: ["Local infection", "Acute inflammation (hot/red)", "Anticoagulation (deep pressure)", "Over nerve/artery (adjust technique)", "Patient unable to provide feedback"],
    measureTools: [
      { name: "VAS Pain Scale", how: "Rate primary complaint before and after", frequency: "Every session" },
      { name: "PPT (Pressure Algometer)", how: "Measure kg/cm² at trigger point pain threshold", frequency: "Before & after treatment" },
      { name: "Active TrP Count", how: "Document number of active (pain-reproducing) trigger points", frequency: "Baseline + monthly" },
      { name: "Referred Pain Map", how: "Draw patient's referred pain pattern — compare to known TrP patterns", frequency: "First visit + when pattern changes" },
    ],
    ayushIntegration: "Agnikarma (thermal cautery) at trigger point locations = the Ayurvedic equivalent of TrP therapy. Apply Agnikarma at TrP → immediate release. Follow with Patra Pinda Sweda (warm herbal bolus) over treated area for tissue nourishment.",
    doctorProtocol: [
      { title: "Trigger Point Identification", content: "Systematic palpation to find active TrPs: taut band, local tenderness, referred pain, jump sign.", steps: ["Flat palpation: press perpendicular to muscle fibers across muscle belly", "Identify taut band (feels like guitar string under fingers)", "Locate most tender spot within taut band (TrP)", "Apply sustained pressure — ask: 'does this reproduce your pain pattern?'", "If yes = ACTIVE TrP (treat). If local only = LATENT TrP (may treat preventively)", "Document: muscle, location, referred pain pattern, severity (0-3)"] },
      { title: "Ischemic Compression Technique", content: "The primary manual treatment: sustained pressure until pain reduces. Barrier-release-barrier approach.", steps: ["Locate active TrP with palpation", "Apply gradual pressure until patient reports 7/10 pain", "HOLD at this barrier — do not increase pressure", "Wait 30-90 seconds — pain will naturally decrease (barrier releases)", "When pain drops to 3/10, increase pressure to new 7/10 barrier", "Repeat 2-3 barriers per TrP (total 90 seconds to 3 minutes per point)", "Post-treatment: stretch the muscle to full length"], tips: "The key is PATIENCE — wait for the release rather than forcing through it" },
      { title: "Spray & Stretch Technique", content: "Vapocoolant spray over referred pain pattern + immediate passive stretch of affected muscle.", steps: ["Position muscle at comfortable stretch (not full stretch)", "Apply vapocoolant spray (or ice) in parallel sweeps over referred pain zone", "Simultaneously take muscle to full available stretch", "Hold stretch 30 seconds", "Reapply spray and stretch further if available", "3 cycles per muscle", "Follow with moist heat for 5 minutes"], tips: "The spray distracts the pain system allowing deeper stretch — mechanism is gate control" },
      { title: "Key Spine TrP Locations", content: "Most common trigger points causing spine symptoms — know these by heart.", steps: ["Upper Trap (TrP1): neck-shoulder junction → refers to temporal headache", "Levator Scapulae: superior angle of scapula → refers to neck/angle of neck", "Multifidus: 1-2 cm from spinous process → refers to local/gluteal", "QL: between 12th rib and iliac crest → refers to hip/SI area", "Piriformis: mid-buttock → refers down posterior thigh (mimics sciatica)", "Gluteus medius: posterior iliac crest → refers to low back/sacrum"] },
    ],
    patientSelfCare: [
      { title: "Tennis Ball Self-Compression", content: "Against wall or on floor — apply sustained pressure to your own trigger points.", steps: ["Wall: place ball between wall and muscle, lean to create pressure (5-7/10)", "Floor: lie on ball for deeper areas (glutes, piriformis)", "Find tender spot → hold pressure without moving for 60-90 seconds", "Pain should reduce by 50% during hold (if not, reposition)", "Move to next spot — typically 4-6 spots per session", "Total time: 10-15 minutes"], safetyNote: "If pain increases or radiates, stop and reposition. Never on spine directly." },
      { title: "Theracane / Self-Massage Tool", content: "S-shaped tool for reaching your own back trigger points. Allows precise pressure control.", steps: ["Hook Theracane over shoulder to reach upper trap TrPs", "Through-the-body reach for inter-scapular points", "Apply point of tool to tender spot with body weight/arm pressure", "Hold 60-90 seconds per point", "For levator scap: hook over shoulder, press at top of scapula", "For rhomboids: arm through back, press between scapula and spine"], safetyNote: "Start light — tool concentrates pressure. Bruising means too hard." },
      { title: "Self-Stretch After Release", content: "Always stretch the treated muscle after compression — locks in the length gain.", steps: ["Upper trap: tilt ear to opposite shoulder, gentle hand assist (30 sec)", "Levator scap: look into armpit, chin to chest + side (30 sec)", "Piriformis: figure-4 stretch (ankle on opposite knee, pull knee to chest)", "QL: side-lying stretch over pillow/ball (30 sec)", "Multifidus: cat-cow slowly × 10 reps", "Hold each stretch 30 sec, 3 repetitions"], safetyNote: "Stretch should feel like a pull, not pain. Never bounce." },
    ],
    combinationProtocols: [
      { condition: "Myofascial Headache", plan: "TrP therapy upper trap + levator + SCM → Nasya → Shirodhara → Patient Theracane daily + GB20 acupressure" },
      { condition: "QL-referred Low Back Pain", plan: "TrP ischemic compression QL → Kati Basti → Agnikarma at TrP → Patient floor ball release + side stretch daily" },
      { condition: "Piriformis mimicking Sciatica", plan: "TrP therapy piriformis → Kati Basti → Basti karma (Vata) → Patient figure-4 stretch + ball release 3×/day" },
    ],
    sop: {
      preparation: [
        "Review patient file — active TrPs identified previously, progress",
        "Ensure room warm (cold increases muscle tension)",
        "Prepare: warm towels, oil (optional), pressure algometer (if available)",
        "Wash hands (no gloves needed — direct palpation required)",
        "Position patient for access to target muscles (prone/supine/side-lying)",
        "Ask about current pain and any new symptoms since last visit",
      ],
      execution: [
        "Palpate systematically — flat or pincer palpation depending on muscle",
        "Identify taut band → find most tender nodule within band",
        "Confirm: press point → ask 'does this reproduce your familiar pain?'",
        "Apply ischemic compression: gradual pressure to 7/10 tolerance",
        "HOLD at barrier — wait 30-90 sec for release (pain drops to 3/10)",
        "Advance to new barrier — repeat 2-3 times per TrP",
        "If no release after 90 sec: try positional release or move to next TrP",
        "Post-compression: immediately stretch the treated muscle (30 sec × 3)",
        "Treat 4-8 trigger points per session",
        "Finish with warm towel/pack over treated area (5 min)",
      ],
      postProcedure: [
        "Apply warm compress or Patra Pinda Sweda (if available)",
        "Record VAS after treatment",
        "Teach patient self-compression for the most responsive TrPs",
        "Demonstrate correct stretch for each treated muscle",
        "Advise: mild soreness 12-24 hrs is normal, drink water, apply heat",
        "Schedule next session (2-3 days for acute, weekly for chronic)",
      ],
      documentation: [
        "Muscles treated and specific TrP locations",
        "Active vs Latent classification per TrP",
        "Referred pain pattern reproduced (match to known patterns?)",
        "Treatment response: release achieved? Partial? None?",
        "VAS before and after",
        "Stretches prescribed and patient compliance notes",
      ],
      safetyChecks: [
        "Avoid deep pressure over nerve trunks (sciatic, brachial plexus)",
        "Reduce pressure for anticoagulated patients (bruising risk)",
        "Never apply compression to pulsating structures (arteries)",
        "Ask patient to report numbness/tingling immediately (nerve compression)",
        "Stop if pain INCREASES during compression (wrong point or technique)",
      ],
    },
    equipment: [
      { name: "Treatment Table (firm padding)", cost: "₹15,000-30,000", essential: true, notes: "Firm enough for effective palpation. Face cradle for prone position." },
      { name: "Pressure Algometer (digital)", cost: "₹8,000-15,000", essential: false, notes: "Measures PPT objectively. Great for tracking progress. Research tool." },
      { name: "Warm Towels / Heating Pad", cost: "₹500-2,000", essential: true, notes: "Apply post-treatment. Keeps muscles warm and responsive." },
      { name: "Theracane (demo model)", cost: "₹1,500-2,500", essential: false, notes: "Keep in clinic for patient education. Demonstrate self-treatment." },
      { name: "Tennis Balls + Lacrosse Balls", cost: "₹200-500", essential: true, notes: "For patient demo. Give 1 tennis ball to each new patient as homework tool." },
      { name: "Travell & Simons Trigger Point Manual (Vol 1+2)", cost: "₹5,000-8,000", essential: true, notes: "THE reference book. Keep in treatment room for point pattern lookup." },
      { name: "Referred Pain Pattern Charts (wall)", cost: "₹1,000-2,000", essential: false, notes: "Visual reference of common TrP patterns. Patient education tool." },
      { name: "Vapocoolant Spray (Biofreeze/Ethyl chloride)", cost: "₹500-1,000", essential: false, notes: "For spray & stretch technique. Not essential but enhances stretch." },
    ],
    sessionChecklist: [
      { step: "Current pain and complaint area documented", category: "Pre" },
      { step: "VAS recorded (before)", category: "Pre" },
      { step: "Target muscles selected based on referral pattern", category: "Pre" },
      { step: "Patient positioned comfortably", category: "Pre" },
      { step: "Taut band palpated — TrP located", category: "Procedure" },
      { step: "Referred pain reproduction confirmed (active TrP)", category: "Procedure" },
      { step: "Ischemic compression applied (7/10 → wait for release)", category: "Procedure" },
      { step: "Barrier release noted (2-3 barriers per TrP)", category: "Procedure" },
      { step: "Post-compression stretch done (30 sec × 3)", category: "Procedure" },
      { step: "4-8 TrPs treated total", category: "Procedure" },
      { step: "Warm pack applied post-treatment", category: "Post" },
      { step: "VAS recorded (after)", category: "Post" },
      { step: "Self-treatment technique demonstrated", category: "Post" },
      { step: "Stretch homework prescribed", category: "Post" },
      { step: "Treatment notes completed", category: "Post" },
    ],
    pricing: {
      perSession: 500,
      packageOptions: [
        { name: "Trial (4 sessions)", sessions: 4, price: 1800, savings: "₹200 off" },
        { name: "Standard (8 sessions)", sessions: 8, price: 3500, savings: "₹500 off" },
        { name: "Intensive (12 sessions)", sessions: 12, price: 5000, savings: "₹1,000 off" },
        { name: "Maintenance (Monthly 4)", sessions: 4, price: 1600, savings: "₹400 off" },
      ],
      breakEven: "5 patients/day × 25 days = 125 sessions × ₹500 = ₹62,500/month. Zero consumable cost — pure skill-based therapy.",
      revenuePerMonth: "Target: 100-150 sessions/month = ₹50,000-75,000. Combine with Dry Needling for ₹1200/session package.",
      competitorComparison: "Massage therapy: ₹500-1000 (relaxation). TrP therapy at ₹500 is targeted, diagnostic, and curative — not just relaxation.",
    },
    training: [
      { level: "Beginner (Foundation)", hours: "30-50 hours", certification: "Certificate in Myofascial Trigger Point Therapy", books: ["Travell & Simons — Trigger Point Manual Vol 1", "Davies — The Trigger Point Therapy Workbook"], courses: ["Myopain Seminars TrP Foundation", "NMT (Neuromuscular Therapy) Level 1"], skills: ["TrP identification (palpation)", "Ischemic compression technique", "5 key spine muscle TrP patterns", "Patient self-care teaching"] },
      { level: "Intermediate (Clinical)", hours: "100-200 hours", certification: "Advanced TrP Practitioner / NMT Certified", books: ["Travell Vol 1 + 2 (complete)", "Fernandez-de-las-Penas — Trigger Points & Myofascial Chains"], courses: ["NMT Level 2 + 3", "Myofascial Pain Advanced Workshop"], skills: ["All spine muscle TrP patterns", "Spray & stretch", "Positional release (counterstrain)", "Complex referral pattern analysis"] },
      { level: "Advanced (Expert)", hours: "300+ hours", certification: "Fellow / Instructor in Myofascial Pain", books: ["Simons — Scientific Basis of TrPs", "Shah — Biochemistry of TrPs (research)"], courses: ["TrP Instructor Training", "Dry Needling integration course"], skills: ["Teaching certification", "Research competency", "Integration with dry needling", "Multidisciplinary pain team leadership"] },
    ],
  },
  5: {
    title: "Auriculotherapy (Ear Acupuncture)", origin: "France/China", icon: "👂", category: "Microsystem",
    evidenceLevel: "Moderate-Strong (Battlefield Acupuncture adopted by US Military)", evidenceScore: 72,
    overview: "The ear is a microsystem representing the entire body (inverted fetus map). Spine zones along the antihelix can be stimulated with needles, seeds, or magnets for rapid pain relief.",
    history: "Paul Nogier (France, 1956) mapped the ear microsystem. Chinese integrated with TCM ear points. US Military adopted Battlefield Acupuncture (BFA) protocol in 2001 for combat pain.",
    mechanism: "Ear has rich cranial nerve innervation (vagus, trigeminal, cervical plexus). Stimulation modulates pain via vagal afferents → nucleus tractus solitarius → descending pain inhibition pathways.",
    spineIndications: ["Acute pain (rapid relief)", "Chronic back pain", "Sciatica", "Post-surgical pain", "Anxiety-driven spine tension", "Opioid-sparing adjunct"],
    contraindications: ["Ear infection/inflammation", "Pregnancy (certain points)", "Anticoagulation (for needle)", "Ear cartilage damage"],
    measureTools: [
      { name: "VAS Pain Scale", how: "Before and 5 min after ear treatment (rapid response expected)", frequency: "Every session" },
      { name: "Ear Point Tenderness", how: "Point detector or probe — tender points are active diagnostic points", frequency: "Every session (diagnostic)" },
      { name: "Pain Medication Usage", how: "Track analgesic consumption pre/post auriculotherapy course", frequency: "Weekly diary" },
    ],
    ayushIntegration: "Auriculotherapy + Karna Purana (Ayurvedic ear oil therapy): ear seeds placed on spine zone → followed by warm Bilva Taila drops in ear canal. Vagal stimulation + warm oil = deep Vata pacification.",
    doctorProtocol: [
      { title: "Spine Zone Location on Ear", content: "Spine represented along the antihelix (curved ridge). Cervical = lower antihelix, Thoracic = middle curve, Lumbar = upper antihelix, Sacrum = antihelix root.", steps: ["Palpate antihelix with probe — locate most tender segment matching patient's spine level", "Cervical spine: inferior antihelix near antitragus", "Thoracic spine: middle antihelix body", "Lumbar spine: superior antihelix approaching upper helix", "Sacrum/coccyx: antihelix root at bifurcation point", "Also locate: Shenmen (analgesic), Point Zero (homeostasis), Thalamus (pain relay)"] },
      { title: "Battlefield Acupuncture (BFA) Protocol", content: "5-point ear protocol for rapid pain relief. Semi-permanent ASP needles left in ear 3-5 days. Developed by Col. Richard Niemtzow.", steps: ["Points (bilateral): Cingulate Gyrus, Thalamus, Omega 2, Point Zero, Shenmen", "Insert ASP (Aiguille Semi-Permanente) gold needles", "Needle one ear first — reassess pain after each point", "If pain <1/10 after one ear — stop (don't needle other ear)", "Needles fall out on own in 3-5 days", "Can repeat weekly for course of 4-6 treatments"], tips: "BFA gives 80% of patients significant relief within 5-15 minutes" },
      { title: "Ear Seed Protocol (Vaccaria/Magnetic)", content: "Non-invasive alternative: apply seeds or magnets to ear points. Patient presses them for ongoing stimulation between visits.", steps: ["Clean ear with alcohol", "Locate active points with probe (most tender = most active)", "Apply Vaccaria seed/magnetic pellet with adhesive tape", "Place on: spine zone (affected level) + Shenmen + Kidney point", "Instruct patient: press each seed firmly 10-20 times, 3× daily", "Replace every 3-5 days — alternate ears"] },
    ],
    patientSelfCare: [
      { title: "Self Ear Seed Application", content: "Pre-made ear seed kits available. Apply to spine zone on ear for ongoing pain management between clinic visits.", steps: ["Wash hands and clean ear with alcohol wipe", "Locate antihelix ridge (curved cartilage inside ear)", "Your spine zone: where it feels MOST tender when pressed with fingertip", "Peel adhesive seed from kit, place on tender spot", "Also place one seed at triangular fossa (Shenmen — relaxation point)", "Press each seed firmly 10-20× whenever pain occurs (minimum 3×/day)", "Replace every 3-5 days, alternate left/right ear"], safetyNote: "Remove if ear becomes red, itchy, or infected. Avoid sleeping on seeded ear. Keep ears dry." },
      { title: "Ear Massage for Spine", content: "No seeds needed — just use fingertips to stimulate spine zones on ears for quick relief.", steps: ["Pinch entire antihelix ridge between thumb (front) and index finger (back)", "Roll and squeeze along the entire ridge for 2 minutes", "Spend extra time on segments that feel most tender", "Pull ear lobe down gently × 10 (vagal stimulation)", "Massage tragus in circular motion × 30 seconds (releases tension)", "Do 2-3× daily: morning, afternoon, before bed"], safetyNote: "Gentle but firm pressure. Stop if dizziness occurs (vagal response)." },
    ],
    combinationProtocols: [
      { condition: "Acute Spine Pain (ER/Urgent)", plan: "BFA protocol (immediate) → assess in 15 min → if partial relief add body acupuncture → Kati Basti next day" },
      { condition: "Chronic with Anxiety Component", plan: "Ear seeds spine zone + Shenmen → Shirodhara → Ashwagandha → Patient self-press seeds 3×/day" },
      { condition: "Post-Surgical Pain (opioid sparing)", plan: "BFA protocol + body acupuncture → reduce analgesics gradually → ear seeds for maintenance" },
    ],
    sop: {
      preparation: [
        "Review patient's spine condition and current pain area",
        "Identify which spine zone to target on ear (cervical/thoracic/lumbar/sacral)",
        "Prepare: point detector (or probe), alcohol swabs, ear seeds/needles, tweezers",
        "For BFA: prepare ASP gold needles (5 per ear)",
        "Clean treatment area with good lighting (magnifying lamp helpful)",
        "Inform patient: procedure is quick, mild discomfort only",
      ],
      execution: [
        "Clean ear thoroughly with alcohol swab (both sides)",
        "Locate spine zone on antihelix using anatomical landmarks",
        "Use point detector/probe to find most reactive (tender) points within zone",
        "Mark reactive points with skin marker",
        "FOR SEEDS: peel adhesive seed, place precisely on marked point with tweezers",
        "FOR BFA NEEDLES: insert ASP needle at 45° into marked point",
        "Treat bilateral for symmetric conditions, unilateral for one-sided pain",
        "Apply 3-5 points per ear: Spine zone + Shenmen + Point Zero (minimum)",
        "Ask patient to press each point — confirm tenderness (correct placement)",
        "If using needles: check they're seated properly, not protruding dangerously",
      ],
      postProcedure: [
        "Record VAS immediately (expect rapid change within 5-10 min)",
        "Instruct patient: press seeds 10-20× firmly, 3×/day",
        "Seeds stay in ear 3-5 days then fall out or are removed",
        "BFA needles: fall out naturally in 3-5 days, don't remove manually",
        "Alternate ears each visit (left this time → right next time)",
        "Schedule: weekly for 4-6 sessions typically",
      ],
      documentation: [
        "Points treated (diagram: mark on ear chart)",
        "Type: seeds, needles, or magnets used",
        "VAS before and after (note time: immediate + 5 min)",
        "Patient's reported response (percentage relief)",
        "Any adverse reactions (ear redness, infection signs)",
      ],
      safetyChecks: [
        "Never insert ear needles if local infection present",
        "Check for anticoagulation before ear needles (seeds safe for all)",
        "Ensure ASP needles are flush — protruding needle = phone + pillow injury risk",
        "Warn patient: if ear becomes red, hot, or swollen → remove seeds and contact clinic",
        "Do not use certain points (uterus, endocrine) in pregnancy",
      ],
    },
    equipment: [
      { name: "Ear Seeds (Vaccaria, 100 pack)", cost: "₹300-500", essential: true, notes: "Most common non-invasive option. Adhesive-backed seeds for patient wear." },
      { name: "Magnetic Ear Pellets (gold-plated)", cost: "₹500-800/100", essential: false, notes: "Stronger stimulation than seeds. Reusable magnets. Premium option." },
      { name: "ASP Needles (Battlefield Acupuncture)", cost: "₹2,000-3,000/100", essential: false, notes: "Semi-permanent gold studs. For BFA protocol. Stronger than seeds." },
      { name: "Point Detector (electronic)", cost: "₹3,000-8,000", essential: false, notes: "Detects low-resistance ear points electronically. More objective than palpation." },
      { name: "Ear Probe (metal, spring-loaded)", cost: "₹200-500", essential: true, notes: "Simple spring probe for finding tender points. Essential basic tool." },
      { name: "Alcohol Swabs", cost: "₹150/100", essential: true, notes: "Clean ear before and between applications." },
      { name: "Tweezers (fine-tip)", cost: "₹200-400", essential: true, notes: "For precise seed/pellet placement. Stainless steel, autoclavable." },
      { name: "Magnifying Lamp", cost: "₹2,000-5,000", essential: false, notes: "Helps visualize small ear anatomy. Especially useful for elderly patients." },
      { name: "Ear Anatomy Chart (Nogier Map)", cost: "₹500-1,000", essential: true, notes: "Wall reference showing ear zones. Essential for point location." },
      { name: "Patient Ear Seed Kit (take-home)", cost: "₹100-200/kit", essential: false, notes: "Pre-made kits for patient self-application at home. Revenue opportunity." },
    ],
    sessionChecklist: [
      { step: "Patient's current pain level documented (VAS)", category: "Pre" },
      { step: "Spine condition matched to ear zone", category: "Pre" },
      { step: "Ear cleaned with alcohol", category: "Pre" },
      { step: "Reactive points located (probe/detector)", category: "Procedure" },
      { step: "Points marked with skin marker", category: "Procedure" },
      { step: "Seeds/needles placed precisely on marked points", category: "Procedure" },
      { step: "Shenmen + Point Zero included", category: "Procedure" },
      { step: "Patient confirms tenderness at each point (correct placement)", category: "Procedure" },
      { step: "VAS recorded after treatment (5 min post)", category: "Post" },
      { step: "Self-press instructions given (10-20× press, 3×/day)", category: "Post" },
      { step: "Replacement schedule explained (3-5 days)", category: "Post" },
      { step: "Adverse event signs explained (redness/swelling = remove)", category: "Post" },
      { step: "Next session scheduled", category: "Post" },
      { step: "Treatment documented with ear diagram", category: "Post" },
    ],
    pricing: {
      perSession: 400,
      packageOptions: [
        { name: "Trial (3 sessions)", sessions: 3, price: 1000, savings: "₹200 off" },
        { name: "Standard (6 sessions)", sessions: 6, price: 2000, savings: "₹400 off" },
        { name: "BFA Protocol (6 sessions)", sessions: 6, price: 3000, savings: "₹600 off (premium ASP needles)" },
        { name: "Monthly Ear Seeds (4)", sessions: 4, price: 1400, savings: "₹200 off" },
      ],
      breakEven: "Each session costs ₹20-50 in consumables. 6 patients/day × 25 days = very high margin. Fast treatment (10-15 min).",
      revenuePerMonth: "Target: 150-200 sessions/month = ₹60,000-80,000. Quick sessions allow high throughput.",
      competitorComparison: "Very few clinics offer auriculotherapy. Unique differentiator. BFA is US Military-validated — strong marketing angle.",
    },
    training: [
      { level: "Beginner (Certificate)", hours: "20-40 hours", certification: "Certificate in Auriculotherapy / Ear Acupuncture", books: ["Oleson — Auriculotherapy Manual", "Nogier — Auriculomedicine"], courses: ["Battlefield Acupuncture Training (BFA — 8 hrs)", "Basic Auriculotherapy Certificate (20 hrs)"], skills: ["Ear anatomy + zone identification", "Seed placement technique", "5-point BFA protocol", "Spine zone targeting"] },
      { level: "Intermediate (Practitioner)", hours: "60-100 hours", certification: "Advanced Auriculotherapy Practitioner", books: ["Oleson — Complete 4th Edition", "Romoli — Auricular Acupuncture Diagnosis"], courses: ["Terry Oleson Advanced Seminar", "French Auriculomedicine Course"], skills: ["Electronic point detection", "Ear needle technique", "Complex conditions", "Frequency-based protocols"] },
      { level: "Advanced (Specialist)", hours: "150+ hours", certification: "Fellow / Instructor Auriculotherapy", books: ["Research papers: Niemtzow, Yeh, Usichenko"], courses: ["Research-focused auriculotherapy training", "Instructor certification"], skills: ["Research protocol design", "Teaching others", "Integration with body acupuncture", "Addictive disorders (NADA protocol)"] },
    ],
  },
  6: {
    title: "Japanese Kampo & Shiatsu", origin: "Japan", icon: "🇯🇵", category: "Traditional System",
    evidenceLevel: "Moderate (Kampo: insurance-covered in Japan)", evidenceScore: 65,
    overview: "Shiatsu (finger pressure along meridians) + Kampo (herbal medicine) + Sotai (corrective movement). Japanese refinement of Chinese medicine with emphasis on palpation diagnosis and gentle technique.",
    history: "Shiatsu formalized by Tokujiro Namikoshi (1940s). Kampo = Japanese interpretation of Chinese herbal medicine, covered by national insurance since 1976. Sotai by Keizo Hashimoto (1969).",
    mechanism: "Shiatsu: sustained pressure along meridian channels normalizes Ki (Qi) flow, releases fascial restrictions. Kampo: targeted herbal formulas for constitutional patterns. Sotai: movement toward comfort to release restriction.",
    spineIndications: ["Chronic stiffness (especially morning)", "Cold-type back pain", "Nerve compression symptoms", "Constitutional weakness", "Stress-related spine tension"],
    contraindications: ["Acute fracture", "Spinal infection", "Malignancy (local area)", "Severe osteoporosis (gentle only)"],
    measureTools: [
      { name: "VAS Pain Scale", how: "Before and after Shiatsu session", frequency: "Every session" },
      { name: "Flexibility Index", how: "Sit-and-reach + spinal rotation ROM", frequency: "Baseline + weekly" },
      { name: "Abdominal Diagnosis Map (Fukushin)", how: "Document abdominal findings matching spine complaints", frequency: "Every visit (Kampo diagnostic)" },
    ],
    ayushIntegration: "Shiatsu BL channel = same as Ayurvedic paravertebral Abhyanga path. Kampo herb Shakuyakukanzoto (peony + licorice) parallels Ayurvedic use of Bala + Yashtimadhu for muscle pain.",
    doctorProtocol: [
      { title: "Shiatsu Spine Protocol", content: "Systematic thumb pressure along BL channel (both lines) from occiput to sacrum. Sustained 3-5 second holds, perpendicular pressure.", steps: ["Patient prone, relaxed", "Start at BL10 (occiput) — 3 sec hold each point bilateral", "Progress down BL inner line (1.5 cun from midline) — every vertebral level", "Then BL outer line (3 cun from midline) — every vertebral level", "Sacral points: BL31-34 (8 Liao points) — deeper pressure", "Total: 15-20 minutes for full spine", "Finish with palm pressure down Du Mai (midline) — 3 passes"] },
      { title: "Kampo Formulas for Spine", content: "Key Japanese herbal formulas for spine conditions — evidence-based and covered by Japanese insurance.", steps: ["Shakuyakukanzoto (Peony + Licorice): muscle cramps, acute spasm — take during pain", "Keishikajutsubuto: cold-type arthralgia, morning stiffness, nerve pain", "Goshajinkigan: radiating nerve pain, numbness, elderly back pain", "Bukuryoingohangekobokuto: tension + anxiety + back pain combination", "Yokuininto: damp-type joint stiffness, heavy feeling"] },
      { title: "Sotai Corrective Exercises", content: "Japanese principle: move toward comfort (not toward pain). The body corrects by moving in the easy direction.", steps: ["Test: which direction of movement is EASIER (less painful)?", "Patient moves in the EASY direction against light resistance from doctor", "Hold 3-5 seconds with exhalation", "Release completely, relax 5 seconds", "Retest original painful direction — should improve", "Repeat 3-5 times per restriction found"] },
    ],
    patientSelfCare: [
      { title: "Makko-Ho 6 Stretches (Daily)", content: "Meridian stretching system — 6 positions each stretch a pair of meridians. 2-3 minutes total, morning routine.", steps: ["1. Lung/LI: arms behind back, bend forward (30 sec)", "2. Stomach/Spleen: sit between heels (seiza), lean back (30 sec)", "3. Heart/SI: soles together, fold forward (30 sec)", "4. Bladder/Kidney: legs straight, fold forward — KEY FOR SPINE (30 sec)", "5. Pericardium/TH: cross-legged, arms crossed, fold forward (30 sec)", "6. Liver/GB: wide legs apart, fold to center (30 sec)"], safetyNote: "Breathe into each stretch. Never force — find comfortable edge and breathe there." },
      { title: "Self-Shiatsu Thumb Press", content: "Press your own accessible points along the BL channel where you can reach.", steps: ["Seated: press GB20 (skull base) firmly with both thumbs — 5 sec × 10", "Press along neck muscles: every 1 cm from skull to shoulder", "Reach behind: press BL23 area (low back) with fists/thumbs — 5 sec × 10", "Stand: press BL40 (center behind knee) with thumb — 10 sec each", "Press BL60 (outer ankle) with thumb — 10 sec each", "Morning + evening: 5 minutes total"], safetyNote: "Firm but comfortable pressure. Breathe out as you press in." },
    ],
    combinationProtocols: [
      { condition: "Morning Stiffness (Vata-Kapha)", plan: "Shiatsu full spine → Keishikajutsubuto herbs → Swedana → Patient Makko-Ho stretches every morning" },
      { condition: "Cold-type Back Pain", plan: "Shiatsu + moxibustion BL23 → Kati Basti warm oil → Goshajinkigan → Patient: self-moxa stick + stretches" },
    ],
    sop: { preparation: ["Review patient constitution (Sho assessment: Kyo/Jitsu imbalance)", "Ensure floor mat/futon is prepared (traditional Shiatsu on floor)", "Room warm and quiet, dim lighting preferred", "Prepare warm towels, check patient wearing loose comfortable clothing", "Ask about current symptoms, sleep quality, digestion (Kampo diagnostic)"], execution: ["Patient supine: begin with Hara (abdominal) diagnosis — identify Kyo/Jitsu zones", "Assess spine: palm feel along entire back for temperature, tension differences", "Shiatsu: sustained thumb/palm pressure along BL channel bilateral", "Press each tender point 5-7 seconds with body weight (lean, not push)", "Include Sen lines from sacrum to occiput", "Sotai corrections: gentle movement toward ease, 2-3 repetitions", "Makko-Ho assessment: test 6 meridian stretches for spine restrictions", "Total treatment: 45-60 minutes"], postProcedure: ["Patient remains lying 3-5 min (integration time)", "Offer warm tea (digestive, Vata-pacifying)", "Record VAS after treatment", "Prescribe Kampo formula if applicable", "Teach relevant Makko-Ho stretch for home", "Schedule next session (weekly for chronic)"], documentation: ["Hara diagnosis findings (Kyo/Jitsu pattern)", "BL channel tension map", "Sotai corrections performed", "Kampo formula prescribed (if any)", "VAS before/after", "Patient response and energy change"], safetyChecks: ["Avoid deep pressure over kidney area in elderly", "Be gentle with osteoporotic patients", "Floor work: ensure patient can get up/down safely", "Watch for vasovagal response in first-time patients", "Refer if red flags: fever, weight loss, night pain"] },
    equipment: [{ name: "Shiatsu Futon / Floor Mat", cost: "₹3,000-8,000", essential: true, notes: "Traditional cotton futon 3 inches thick. Floor work allows body weight leverage." }, { name: "Treatment Table (alternative)", cost: "₹15,000-30,000", essential: false, notes: "If floor work not feasible. Firm padding essential for Shiatsu." }, { name: "Warm Towels", cost: "₹500/set", essential: true, notes: "Apply to treated areas post-session. Keep in warmer." }, { name: "Kampo Herb Reference Book", cost: "₹3,000-5,000", essential: false, notes: "Guide to constitutional prescribing. Japanese Kampo formulary." }, { name: "Makko-Ho Stretch Chart (wall)", cost: "₹500-1000", essential: false, notes: "6 meridian stretches poster for patient education." }, { name: "Moxa Sticks (for combination)", cost: "₹500/box", essential: false, notes: "Rice-grain moxa or smokeless sticks for warming cold-type back." }],
    sessionChecklist: [{ step: "Patient symptoms and energy level assessed", category: "Pre" }, { step: "Hara (abdominal) diagnosis performed", category: "Pre" }, { step: "VAS recorded (before)", category: "Pre" }, { step: "Patient positioned on mat/table", category: "Procedure" }, { step: "BL channel palpated for tension/tenderness", category: "Procedure" }, { step: "Shiatsu sustained pressure applied (5-7 sec/point)", category: "Procedure" }, { step: "Sotai corrections performed where indicated", category: "Procedure" }, { step: "Makko-Ho flexibility assessed", category: "Procedure" }, { step: "Session completed (45-60 min)", category: "Procedure" }, { step: "VAS recorded (after)", category: "Post" }, { step: "Self-care stretch prescribed", category: "Post" }, { step: "Kampo formula discussed/prescribed", category: "Post" }, { step: "Treatment notes completed", category: "Post" }],
    pricing: { perSession: 700, packageOptions: [{ name: "Trial (4 sessions)", sessions: 4, price: 2500, savings: "₹300 off" }, { name: "Standard (8 sessions)", sessions: 8, price: 5000, savings: "₹600 off" }, { name: "Monthly Wellness (4/month)", sessions: 4, price: 2500, savings: "₹300 off" }, { name: "Combo: Shiatsu + Moxa (6)", sessions: 6, price: 4500, savings: "₹700 off" }], breakEven: "3 patients/day × 25 days = 75 sessions × ₹700 = ₹52,500/month. Longer sessions but higher perceived value.", revenuePerMonth: "Target: 60-90 sessions/month = ₹42,000-63,000", competitorComparison: "Spa Shiatsu: ₹1500-2500 (non-therapeutic). Clinical Shiatsu at ₹700 is therapeutic + accessible." },
    training: [{ level: "Beginner (Foundation)", hours: "100 hours", certification: "Certificate in Shiatsu / Japanese Bodywork", books: ["Masunaga — Zen Shiatsu", "Jarmey — Shiatsu Foundation Course"], courses: ["Shiatsu Foundation Course (100 hrs)", "Japanese Bodywork Introduction"], skills: ["Basic Hara diagnosis", "BL channel technique", "Prone + supine protocols", "Makko-Ho assessment"] }, { level: "Intermediate (Practitioner)", hours: "300 hours", certification: "Diploma Shiatsu Practitioner", books: ["Beresford-Cooke — Shiatsu Theory & Practice", "Sasaki — Sotai Natural Exercise"], courses: ["ITEC Diploma Shiatsu (500 hrs)", "Sotai Training Course"], skills: ["Full Kyo/Jitsu assessment", "Sotai corrective movement", "Kampo formula basics", "Meridian treatment planning"] }, { level: "Advanced (Master)", hours: "500+ hours", certification: "Shiatsu Master / Teacher", books: ["Ohashi — Ohashiatsu", "Kampo Medicine (Keisetsu Otsuka)"], courses: ["Master Shiatsu Training (Japan)", "Kampo Prescribing Course"], skills: ["Teaching/supervising", "Complex constitutional treatment", "Kampo integration", "Research/publication"] }],
  },
  7: {
    title: "Korean Hand Therapy (KHT)", origin: "South Korea (1971)", icon: "✋", category: "Microsystem",
    evidenceLevel: "Moderate (popular in Korea, limited international RCTs)", evidenceScore: 60,
    overview: "The hand is a microsystem of the entire body (Koryo system). Middle finger represents the spine. Stimulation of hand spine points provides accessible, non-invasive spine treatment anywhere, anytime.",
    history: "Developed by Dr. Tae-Woo Yoo in 1971. Based on correspondence theory — hand maps to body. Widely practiced in Korea with its own medical association and research institute.",
    mechanism: "Microsystem correspondence: stimulating hand points creates neural signals that influence corresponding body areas via somatotopic organization in the cerebral cortex. Similar to phantom limb theory.",
    spineIndications: ["Quick pain relief (accessible anywhere)", "Travel/office pain", "Adjunct to main treatment", "Maintenance between sessions", "Needle-phobic patients", "Children/elderly (gentle)"],
    contraindications: ["Local hand injury/infection", "Severe peripheral neuropathy (cannot feel stimulation)", "None otherwise — extremely safe"],
    measureTools: [
      { name: "VAS Pain Scale", how: "Before/after hand stimulation", frequency: "Every session" },
      { name: "Hand Point Tenderness", how: "Probe hand spine points — document which are tender", frequency: "Diagnostic — every visit" },
      { name: "Response Time", how: "How quickly does spine pain reduce after hand stimulation?", frequency: "Track per session" },
    ],
    ayushIntegration: "KHT hand spine zone overlaps with Hasta Marma points (Kshipra, Talahridaya). Apply til taila (sesame oil) on hand spine line + seed stimulation = combined AYUSH + KHT approach.",
    doctorProtocol: [
      { title: "Hand Spine Correspondence", content: "Middle finger = spine. Dorsum of hand = back of body. Back of middle finger = posterior spine. Ring/index fingers = arms. Little/thumb = legs.", steps: ["Middle finger dorsum: tip=head, DIP=cervical, PIP=thoracic, MCP=lumbar, hand dorsum=sacrum", "Locate corresponding level on middle finger matching patient's spine pain", "Probe with blunt tip — find most tender spot (active correspondence point)", "Mark the point for treatment", "For bilateral pain: treat both hands", "For complex cases: add 'organ' correspondence points on palm"] },
      { title: "Stimulation Methods", content: "Multiple methods for hand point stimulation — choose based on availability and patient preference.", steps: ["Press stimulation: probe/toothpick tip press, 30 sec per point (simplest)", "Seed therapy: tape Vaccaria/radish seed on marked points (3-5 days)", "Hand needle: tiny 2mm intradermal needle at correspondence point", "Moxa on hand: mini moxa cone on hand point (warm stimulation)", "Magnet: N/S pole placement based on tonify/sedate principle", "E-beam: electronic stimulator device on hand points (commercial available)"] },
      { title: "Protocol by Spine Level", content: "Quick reference for common spine problems mapped to hand.", steps: ["Neck pain → middle finger DIP joint dorsum area", "Upper back pain → middle finger PIP joint dorsum", "Low back pain → middle finger MCP joint dorsum to hand dorsum", "Sciatica → hand dorsum (sacral zone) + little finger (leg correspondence)", "Whole spine stiffness → entire middle finger dorsum midline"] },
    ],
    patientSelfCare: [
      { title: "Self-Locate Spine on Hand", content: "Your middle finger IS your spine in miniature. Dorsum (back) of middle finger = your back.", steps: ["Hold hand in front of you, palm down", "Middle finger tip = your head/upper cervical", "First joint (DIP) = neck (cervical spine)", "Second joint (PIP) = mid-back (thoracic)", "Third joint (MCP/knuckle) = low back (lumbar)", "Back of hand below knuckle = sacrum/tailbone", "Find YOUR pain level and press that zone!"], safetyNote: "Simple, safe, can do anywhere — office, bus, bed. No side effects." },
      { title: "Toothpick/Probe Stimulation", content: "Use blunt end of toothpick to stimulate hand spine points — effective and costs nothing.", steps: ["Find your spine zone on middle finger (dorsum midline)", "Press with round end of toothpick (not sharp end!)", "Find the MOST TENDER spot — that's your active point", "Press and rotate for 30-60 seconds on that spot", "Pain should reduce — also check if your actual spine pain improves", "Do 3-5 times per day especially when pain flares"], safetyNote: "Use blunt end only. If skin becomes irritated, give 1 day rest." },
      { title: "Seed Placement Self-Application", content: "Apply seeds to hand spine points for continuous stimulation throughout the day.", steps: ["Get Vaccaria seeds with adhesive tape (available from AYUSH pharmacy)", "Clean middle finger dorsum with alcohol", "Place seed on most tender spot along midline", "Press seed firmly 20 times to activate", "Leave in place 3-5 days", "Press seed whenever pain occurs throughout the day", "Replace when seed falls off or after 5 days"], safetyNote: "Remove if skin itches or becomes red. Alternate hands each time." },
    ],
    combinationProtocols: [
      { condition: "Office Worker Neck Pain", plan: "KHT hand seeds (DIP zone) for instant relief + Greeva Basti weekly + Self-Shiatsu GB20 + Ergonomic advice" },
      { condition: "Low Back — Between Sessions", plan: "KHT seeds (MCP zone) + Patient presses 5×/day + Kati Basti clinic sessions + Yoga daily" },
    ],
    sop: { preparation: ["Identify patient's spine complaint and laterality", "Prepare: KHT probe, seeds (Vaccaria or magnetic), adhesive tape, tweezers", "Hand anatomy chart available for reference", "Clean patient's hand with alcohol wipe", "Explain: treatment on HAND corresponds to spine — no needles in back"], execution: ["Standard correspondence: middle finger dorsum = spine (DIP=cervical, PIP=thoracic, MCP=lumbar)", "Probe along midline of middle finger dorsum — find most tender point", "Mark tender points with pen", "Apply seeds: one per marked point (maximum 5-7 seeds per hand)", "Press each seed firmly 10× to confirm placement and activate", "Add Shenmen point (wrist crease) for analgesic effect", "Bilateral if symmetric pain, dominant hand if unilateral"], postProcedure: ["Instruct: press each seed 20-30× firmly, 3-5× per day", "Seeds stay 3-5 days then replace", "Record VAS before and after (check 5 min post-placement)", "Give patient take-home seed kit with diagram", "Schedule follow-up in 1 week"], documentation: ["Hand correspondence points used (mark on diagram)", "Seed type (Vaccaria/magnetic/moxa)", "VAS before and after", "Patient compliance with pressing schedule"], safetyChecks: ["Virtually no safety concerns — safest therapy", "Check for skin allergies to adhesive tape", "Remove if skin irritation develops", "Don't apply to open wounds on hand"] },
    equipment: [{ name: "KHT Probe (spring-loaded)", cost: "₹200-500", essential: true, notes: "For locating tender correspondence points on hand." }, { name: "Vaccaria Seeds (100 pack)", cost: "₹200-400", essential: true, notes: "Standard seeds for continuous stimulation." }, { name: "Magnetic Pellets (100 pack)", cost: "₹500-800", essential: false, notes: "Stronger stimulation. Gold-plated preferred." }, { name: "Adhesive Tape (rolls)", cost: "₹100-200", essential: true, notes: "Skin-friendly tape to secure seeds." }, { name: "KHT Hand Chart (laminated)", cost: "₹300-500", essential: true, notes: "Correspondence maps for reference." }, { name: "Patient Take-Home Kits", cost: "₹50-100/kit", essential: false, notes: "Pre-made kits with 10 seeds + diagram. Good revenue add-on." }],
    sessionChecklist: [{ step: "Spine complaint identified", category: "Pre" }, { step: "VAS recorded (before)", category: "Pre" }, { step: "Hand cleaned with alcohol", category: "Pre" }, { step: "Correspondence zone identified (DIP/PIP/MCP)", category: "Procedure" }, { step: "Tender points probed and marked", category: "Procedure" }, { step: "Seeds applied precisely on points", category: "Procedure" }, { step: "Seeds pressed 10× to activate", category: "Procedure" }, { step: "VAS recorded (5 min after)", category: "Post" }, { step: "Press instructions given (20-30×, 3-5×/day)", category: "Post" }, { step: "Take-home kit provided", category: "Post" }, { step: "Follow-up scheduled (1 week)", category: "Post" }],
    pricing: { perSession: 300, packageOptions: [{ name: "Trial (3 sessions)", sessions: 3, price: 800, savings: "₹100 off" }, { name: "Monthly (4 sessions)", sessions: 4, price: 1000, savings: "₹200 off" }, { name: "Take-Home Kit + Training", sessions: 1, price: 500, savings: "Includes kit + teaching session" }], breakEven: "Consumable cost ₹10-20/session. 8 patients/day feasible (quick treatment). Very high margin.", revenuePerMonth: "Target: 150-200 sessions × ₹300 = ₹45,000-60,000. Quick sessions (10-15 min).", competitorComparison: "No competitors typically — unique service. Low price drives volume and patient loyalty." },
    training: [{ level: "Beginner", hours: "20-30 hours", certification: "KHT Foundation Certificate", books: ["Tae-Woo Yoo — Korean Hand Therapy"], courses: ["KHT Basic Course (Korea/India)", "Online KHT Foundation"], skills: ["Standard correspondence mapping", "Seed placement", "Basic spine zone treatment", "Patient self-care teaching"] }, { level: "Intermediate", hours: "60-100 hours", certification: "KHT Practitioner", books: ["KHT Advanced Manual", "Koryo Hand Therapy Complete"], courses: ["KHT Advanced (needle + moxa)", "Koryo Hand Therapy Certification"], skills: ["Hand needle technique", "Hand moxibustion", "Complex conditions", "Constitutional assessment"] }],
  },
  8: {
    title: "Reflexology (Foot & Hand)", origin: "Egypt/USA", icon: "🦶", category: "Microsystem",
    evidenceLevel: "Moderate", evidenceScore: 62,
    overview: "Spinal reflex zones run along the medial arch of the foot (C1 at big toe to coccyx at heel). Thumb-walking pressure along this zone reflexes to corresponding vertebral levels.",
    history: "Ancient Egypt (tomb paintings 2330 BCE). Modern: Eunice Ingham mapped foot zones (1930s). William Fitzgerald (zone therapy, 1917).",
    mechanism: "Zone theory: body divided into 10 longitudinal zones, pressure in one area affects entire zone. Also proprioceptive/neural reflex arcs from foot to spinal cord segments.",
    spineIndications: ["General spine pain", "Nerve symptoms", "Stress-induced tension", "Sleep disturbance from pain", "Elderly/gentle patients"],
    contraindications: ["DVT in legs", "Foot fracture", "Severe peripheral neuropathy", "Active foot infection"],
    measureTools: [{ name: "VAS Pain Scale", how: "Before/after reflexology", frequency: "Every session" }, { name: "Foot Tenderness Map", how: "Document tender zones corresponding to spine areas", frequency: "Each visit" }, { name: "Sleep Quality", how: "PSQI questionnaire", frequency: "Monthly" }],
    ayushIntegration: "Pada Abhyanga (Ayurvedic foot massage with warm sesame oil) + reflexology spine zone work = enhanced Vata-grounding therapy. Oil provides Snehana while pressure provides stimulation.",
    doctorProtocol: [
      { title: "Spinal Reflex Zone on Foot", content: "Medial arch of foot = spine. Big toe medial edge = cervical. Arch = thoracic/lumbar. Heel inner edge = sacrum.", steps: ["Patient supine or reclined, feet toward practitioner", "Thumb walk along entire medial arch: big toe base to heel", "Identify tender zones (correspond to problem vertebral levels)", "Apply sustained pressure to tender areas: 30-60 sec each", "Hook and back-up technique on specific 'vertebral' points", "Treat both feet — 20-30 min session"] },
      { title: "Integration Protocol", content: "Combine reflexology with AYUSH spine treatment for full protocol.", steps: ["Start with 10 min foot reflexology (activates spine zones)", "Then proceed with Kati/Greeva Basti on table", "Reflexology primes the nervous system for deeper treatment response", "End session with foot relaxation holds"] },
    ],
    patientSelfCare: [
      { title: "Golf Ball Foot Rolling", content: "Roll golf ball under foot arch daily to stimulate spine reflex zones.", steps: ["Sit in chair, place golf ball under foot", "Roll along medial arch slowly — toe to heel", "Stop on tender spots: press harder for 30 sec", "Roll both feet: 5 min each", "Best time: morning (before rising) or evening (before bed)"], safetyNote: "Standing on ball is more intense — start seated. Avoid if plantar fasciitis is acute." },
      { title: "Self Thumb Walking", content: "Use your own thumb to walk along foot arch spine zone.", steps: ["Sit with foot on opposite knee", "Place thumb on inner edge of big toe base", "Small 'caterpillar' steps down entire medial arch to heel", "Note: each thumb-width roughly = 2-3 vertebrae", "Spend extra time on zones that are tender", "5 min per foot, daily"], safetyNote: "Moderate pressure — should feel like 'good pain' at tender spots." },
    ],
    combinationProtocols: [
      { condition: "Elderly Spine Pain", plan: "Foot reflexology (gentle) + Pada Abhyanga + Basti karma + Patient golf ball roll daily" },
      { condition: "Insomnia from Back Pain", plan: "Reflexology spine + kidney + solar plexus zones → Shirodhara → Patient self-foot roll before bed" },
    ],
    sop: { preparation: ["Patient seated comfortably or reclined with feet elevated", "Remove shoes and socks, inspect feet (contraindications: wounds, infections, DVT)", "Prepare warm water foot soak (5 min) with epsom salt or Triphala", "Oil/cream ready (coconut/sesame or reflexology wax)", "Spine reflex chart available for reference", "Ask patient about spine complaint and pain location"], execution: ["Begin with relaxation techniques: foot circles, toe pulls, solar plexus press", "Locate spine reflex zone: medial arch of foot (big toe side, from heel to toe)", "Cervical spine: medial side of big toe (base to tip)", "Thoracic spine: medial arch ball area", "Lumbar spine: medial arch mid-section", "Sacrum/coccyx: medial heel", "Apply thumb walking technique along entire spine zone (3 passes)", "Apply deeper sustained pressure on most tender segment (60 sec)", "Include kidney zone (center of sole) and adrenal point (above kidney)", "Both feet: 20-30 minutes per foot"], postProcedure: ["Wipe feet with warm towel", "Offer warm water/tea", "Record VAS after treatment", "Teach patient golf ball self-massage for home", "Schedule next session (weekly recommended)"], documentation: ["Spine zones treated (specific segments)", "Tenderness score per zone (0-3)", "Crystal/grit deposits felt (document location)", "VAS before and after", "Patient response notes"], safetyChecks: ["Never perform on infected or injured feet", "Check for DVT signs (unilateral calf swelling/warmth)", "Gentle pressure for diabetic patients (neuropathy risk)", "Avoid in first trimester pregnancy", "Stop if patient feels nauseous or dizzy (reduce pressure)"] },
    equipment: [{ name: "Reflexology Chair (reclining)", cost: "₹8,000-20,000", essential: true, notes: "Comfortable reclined position with feet accessible. Zero-gravity chair ideal." }, { name: "Foot Soak Basin", cost: "₹500-1000", essential: false, notes: "Warm water pre-treatment relaxes tissues and cleans feet." }, { name: "Reflexology Cream/Oil", cost: "₹200-500", essential: true, notes: "Coconut oil, sesame oil, or specialized reflexology wax." }, { name: "Foot Reflex Chart (wall)", cost: "₹500-1000", essential: true, notes: "Shows all organ zones mapped on feet. Essential reference." }, { name: "Golf Balls (for patient demo)", cost: "₹100-200", essential: false, notes: "Patient takes home for self-rolling. Cheap and effective." }, { name: "Warm Towels", cost: "₹300/set", essential: true, notes: "For wiping and warming feet during treatment." }],
    sessionChecklist: [{ step: "Feet inspected (no wounds/infections/DVT signs)", category: "Pre" }, { step: "VAS recorded (before)", category: "Pre" }, { step: "Foot soak completed (5 min)", category: "Pre" }, { step: "Relaxation techniques performed", category: "Procedure" }, { step: "Spine zone identified and worked (3 passes)", category: "Procedure" }, { step: "Tender segments treated with sustained pressure", category: "Procedure" }, { step: "Kidney + adrenal zones included", category: "Procedure" }, { step: "Both feet treated (20-30 min each)", category: "Procedure" }, { step: "VAS recorded (after)", category: "Post" }, { step: "Self-care technique taught (golf ball)", category: "Post" }, { step: "Treatment notes completed", category: "Post" }],
    pricing: { perSession: 500, packageOptions: [{ name: "Trial (4 sessions)", sessions: 4, price: 1800, savings: "₹200 off" }, { name: "Standard (8 sessions)", sessions: 8, price: 3500, savings: "₹500 off" }, { name: "Relaxation + Spine (single)", sessions: 1, price: 600, savings: "Extended 60 min session" }, { name: "Monthly Wellness (4)", sessions: 4, price: 1800, savings: "₹200 off" }], breakEven: "4 patients/day × 25 days = 100 sessions × ₹500 = ₹50,000/month. Minimal consumable cost.", revenuePerMonth: "Target: 80-120 sessions/month = ₹40,000-60,000", competitorComparison: "Spa reflexology: ₹1000-2000 (relaxation). Clinical spine-focused at ₹500 is therapeutic and affordable." },
    training: [{ level: "Beginner", hours: "50-100 hours", certification: "Certificate in Reflexology", books: ["Ingham — Stories the Feet Can Tell", "Marquardt — Reflexology Atlas"], courses: ["IIR Foundation Course (India)", "ITEC Reflexology Certificate"], skills: ["Basic foot anatomy", "Spine zone location", "Thumb walking technique", "Basic full-foot protocol"] }, { level: "Intermediate", hours: "200-300 hours", certification: "Diploma Reflexologist", books: ["Crane — Reflexology Handbook", "Kunz — Complete Reflexology"], courses: ["IIR Advanced Diploma", "Precision Reflexology Course"], skills: ["Clinical assessment", "Specific condition protocols", "Hand reflexology", "Integration with other therapies"] }, { level: "Advanced", hours: "500+ hours", certification: "Master Reflexologist / Instructor", books: ["Research: Ernst, Lee systematic reviews"], courses: ["Teaching certification", "Research methodology"], skills: ["Clinical research", "Teaching/examining", "Complex multisystem treatment", "Running a reflexology clinic"] }],
  },
  9: {
    title: "Cupping Therapy (Hijama)", origin: "Middle East/China", icon: "🫙", category: "Manual Therapy",
    evidenceLevel: "Moderate (WHO recognizes, growing RCTs)", evidenceScore: 68,
    overview: "Negative pressure (suction) applied via cups to skin surface over spine muscles. Draws blood flow to area, releases fascial adhesions, reduces myofascial tension. Wet cupping (Hijama) adds controlled bloodletting.",
    history: "Documented in Ebers Papyrus (Egypt, 1550 BCE). Islamic Hijama (Prophet's medicine). Chinese fire cupping (2000+ years). Now widely practiced globally.",
    mechanism: "Negative pressure → lifts fascia and muscle from underlying tissue → increases local blood flow → removes metabolic waste → mechanical stretch of connective tissue → neurological pain modulation.",
    spineIndications: ["Paraspinal muscle tension", "Blood stagnation pattern", "Chronic low back pain", "Fascial adhesions", "Post-exercise recovery", "Fibromyalgia (adjunct)"],
    contraindications: ["Bleeding disorders", "Anticoagulant therapy", "Skin disease/infection locally", "Over spine of osteoporotic patient", "Pregnancy (lumbar/sacral)", "Cancer (local area)"],
    measureTools: [{ name: "VAS Pain Scale", how: "Before/after cupping", frequency: "Every session" }, { name: "Cup Mark Color", how: "Light pink=mild stagnation, Dark purple=severe stagnation, Blisters=damp-heat", frequency: "Document post-treatment" }, { name: "ROM", how: "Spinal flexion/extension before & after", frequency: "Every session" }],
    ayushIntegration: "Cupping = Raktamokshana (Ayurvedic blood purification) principle. Dry cupping over Kati Basti area BEFORE oil application allows deeper oil penetration through lifted fascia.",
    doctorProtocol: [
      { title: "Dry Cupping Protocol (Spine)", content: "Glass/silicone cups placed along paraspinal muscles with suction. Retained 5-15 min. Sliding cupping for broader area.", steps: ["Apply oil to back for sliding cups", "Place cups 2-3 cm lateral to spine (on erector spinae)", "Bilateral placement: 4-6 cups per side at affected levels", "Retain for 10-15 minutes (check skin color at 5 min)", "For sliding: move cup slowly along erector spinae (up and down)", "Remove cups: press skin at cup edge to break seal gently"], tips: "Sliding cupping is better for initial treatments — less intense marks, more area covered" },
      { title: "Wet Cupping (Hijama) for Spine", content: "Controlled superficial bloodletting under cup suction. Removes 'stagnant blood' and inflammatory mediators locally.", steps: ["Dry cup first: apply cup for 3 min to raise blood to surface", "Remove cup: make superficial scratches with lancet (0.5mm depth only)", "Reapply cup over scratched area for 3-5 min", "Blood and inflammatory fluid drawn into cup", "Remove, clean, and apply antiseptic", "Key spine Hijama points: BL17 (T7-blood), BL23 (L2-kidney), Kahil (C7-T1)"], tips: "Hijama is particularly effective for 'hot' inflammatory conditions — acute flare with heat and swelling" },
    ],
    patientSelfCare: [
      { title: "Silicone Cup Self-Application", content: "Patient-friendly silicone cups — squeeze and place for self-cupping at home.", steps: ["Apply oil to upper back/shoulders (accessible areas)", "Squeeze silicone cup, place on muscle (not bone)", "Release — cup adheres via suction", "For accessible areas: upper traps, shoulders, thighs, calves", "Leave 5-10 min max (remove if painful)", "For back: use wall technique — press cup against back using wall"], safetyNote: "Start with lighter suction (squeeze less). Remove if painful. Marks are NORMAL and fade in 3-7 days." },
      { title: "Post-Cupping Care", content: "Aftercare maximizes cupping benefit and prevents complications.", steps: ["Keep cupped areas warm for 24 hours — avoid cold/wind/AC", "Drink extra water (2-3 glasses)", "No hot shower for 4-6 hours post-cupping", "Marks will appear: this is normal — not bruises (no trauma)", "Light = good circulation, Dark = congestion was present", "Avoid strenuous exercise day of cupping"], safetyNote: "If blisters form: do not pop — apply antiseptic cream. Reduce cup time next session." },
    ],
    combinationProtocols: [
      { condition: "Chronic Back Pain + Stagnation", plan: "Sliding cupping along erector spinae → Kati Basti immediately after → Herbs: Guggulu preparations → Patient silicone cups weekly at home" },
      { condition: "Acute Muscle Spasm (heat type)", plan: "Wet cupping (Hijama) at painful level → Lepa (cool paste) → Patient: cold pack + rest → Follow-up dry cup in 3 days" },
    ],
    sop: { preparation: ["Informed consent: explain procedure, marks will last 7-14 days", "Screen: bleeding disorders, anticoagulants, anemia, pregnancy, skin conditions", "Prepare: cups (silicone/glass/plastic), pump (if vacuum cups), alcohol swabs, gloves", "For wet cupping: sterile blade/lancet, antiseptic, bandages", "Patient prone with back exposed, clean area with antiseptic", "Mark cup placement sites (BL23, BL25, paraspinal muscles, affected level)"], execution: ["DRY CUPPING: Apply oil to back → squeeze silicone cup or use pump → place on marked sites", "Retain cups 5-10 minutes (observe skin color change: pink → red → dark)", "SLIDING CUPPING: Apply generous oil → place cup → slide along erector spinae (BL channel)", "WET CUPPING (Hijama): Apply dry cup 3 min → remove → make superficial scratches (scalpel/lancet) → reapply cup 3-5 min → collect blood", "Maximum 6-8 cups per session (dry) or 4-6 sites (wet)", "Monitor patient throughout — ask about discomfort level"], postProcedure: ["Remove cups gently (break seal slowly)", "For wet cupping: clean sites with antiseptic, apply bandage", "Apply soothing oil or cream to cup marks", "Record cup mark colors (dark purple = severe stagnation, light pink = mild)", "Advise: marks last 7-14 days, avoid hot bath/sauna 24 hrs, keep area warm", "Wet cupping: keep sites dry 24 hrs, change bandage next day"], documentation: ["Cup locations (mark on body diagram)", "Type: dry/wet/sliding", "Retention time per cup", "Cup mark color scale (1-5 darkness rating)", "For wet: amount of blood extracted (approximate)", "VAS before and after", "Patient reaction and tolerance"], safetyChecks: ["NEVER perform wet cupping if patient on anticoagulants", "Check hemoglobin if doing wet cupping (don't cup anemic patients)", "Avoid cupping over bony prominences, spine directly, varicose veins", "Sterile technique mandatory for wet cupping (infection risk)", "Have first-aid kit ready (rare: burns from fire cupping, excessive bleeding)", "Dispose blades/lancets in sharps bin"] },
    equipment: [{ name: "Silicone Cups (set of 12, various sizes)", cost: "₹1,000-2,000", essential: true, notes: "Self-sealing, no pump needed. Safest for beginners. Reusable." }, { name: "Plastic Vacuum Cups + Pump", cost: "₹2,000-4,000", essential: false, notes: "Adjustable suction strength. More professional look. Reusable." }, { name: "Glass Fire Cups (set of 8)", cost: "₹1,500-3,000", essential: false, notes: "Traditional. Requires skill with fire. Strongest suction." }, { name: "Sterile Lancets/Blades (box)", cost: "₹300-500/50", essential: true, notes: "For wet cupping only. Single-use, disposable." }, { name: "Antiseptic Solution (Betadine)", cost: "₹200-400", essential: true, notes: "Clean sites pre and post wet cupping." }, { name: "Bandages + Cotton", cost: "₹200-300", essential: true, notes: "Post-wet cupping wound care." }, { name: "Massage Oil (olive/sesame)", cost: "₹300-500", essential: true, notes: "Applied before cupping for seal. Also for sliding cupping." }, { name: "Gloves (nitrile, box)", cost: "₹400/100", essential: true, notes: "Mandatory for wet cupping. Blood contact precaution." }, { name: "Sharps Bin", cost: "₹200-400", essential: true, notes: "For blade disposal after wet cupping." }],
    sessionChecklist: [{ step: "Informed consent obtained (marks explained)", category: "Pre" }, { step: "Contraindications screened (bleeding, anemia, pregnancy)", category: "Pre" }, { step: "VAS recorded (before)", category: "Pre" }, { step: "Back cleaned and oiled", category: "Pre" }, { step: "Cups placed on marked sites", category: "Procedure" }, { step: "Retention time monitored (5-10 min)", category: "Procedure" }, { step: "Skin color monitored under cups", category: "Procedure" }, { step: "If wet: scratches made, cups reapplied (3-5 min)", category: "Procedure" }, { step: "Cups removed gently", category: "Post" }, { step: "Sites cleaned and bandaged (if wet)", category: "Post" }, { step: "Cup mark colors documented", category: "Post" }, { step: "VAS recorded (after)", category: "Post" }, { step: "Aftercare instructions given", category: "Post" }, { step: "Next session scheduled (2-4 weeks)", category: "Post" }],
    pricing: { perSession: 1000, packageOptions: [{ name: "Dry Cupping (single)", sessions: 1, price: 800, savings: "Introductory" }, { name: "Wet Cupping Hijama (single)", sessions: 1, price: 1200, savings: "Includes materials" }, { name: "Course (4 sessions monthly)", sessions: 4, price: 3500, savings: "₹500 off" }, { name: "Sliding + Dry Combo (6)", sessions: 6, price: 5000, savings: "₹1,000 off" }], breakEven: "3-4 patients/day × 25 days = 75-100 sessions × ₹1000 = ₹75,000-100,000. Higher consumable cost for wet cupping but strong demand.", revenuePerMonth: "Target: 60-80 sessions/month = ₹60,000-80,000", competitorComparison: "Hijama centers: ₹500-1500 (basic). Clinical cupping at ₹1000 with AYUSH integration is premium + differentiated." },
    training: [{ level: "Beginner (Dry Cupping)", hours: "20-30 hours", certification: "Certificate in Cupping Therapy", books: ["Al-Bedah — Guide to Cupping", "Chirali — Traditional Chinese Cupping"], courses: ["Basic Cupping Certificate (20 hrs)", "Hijama Foundation Course"], skills: ["Dry cupping technique", "Cup placement for spine", "Sliding cupping", "Safety and contraindications"] }, { level: "Intermediate (Wet Cupping)", hours: "60-100 hours", certification: "Certified Hijama Practitioner", books: ["Kamal — Hijama Advanced", "Research: AlBedah RCTs"], courses: ["Wet Cupping Certification (sterile technique)", "Unani Cupping Practice Course"], skills: ["Wet cupping (Hijama) sterile technique", "Sunnah point protocols", "Blood assessment (color analysis)", "Complex conditions"] }, { level: "Advanced (Master)", hours: "200+ hours", certification: "Master Cupping Therapist / Instructor", books: ["Research papers compilation", "Comparative cupping systems"], courses: ["Instructor Training", "Research methodology course"], skills: ["Teaching certification", "Research competency", "Fire cupping mastery", "Integration with acupuncture/Ayurveda"] }],
  },
  10: {
    title: "Moxibustion", origin: "China/Japan (3000+ years)", icon: "🔥", category: "Thermal Therapy",
    evidenceLevel: "Moderate (well-studied in East Asia)", evidenceScore: 65,
    overview: "Burning dried Artemisia (mugwort/moxa) near or on acupuncture points to warm tissues, promote circulation, and expel cold/damp. Particularly effective for cold-type spine pain worse in winter/morning.",
    history: "Mentioned alongside acupuncture in earliest Chinese medical texts. Japanese developed refined techniques (Ibuki moxa, rice-grain moxa). The Chinese character for acupuncture literally means 'needle and moxa'.",
    mechanism: "Radiant heat (infrared) penetrates 2-3 cm → vasodilation → increased local blood flow → mast cell activation → anti-inflammatory cytokine release. Far-infrared radiation has specific biological effects beyond simple heating.",
    spineIndications: ["Cold-type back pain (worse in cold/damp)", "Morning stiffness", "Kidney Yang deficiency (weak back)", "Degenerative disc disease", "Chronic bilateral low back pain", "Elderly spine weakness"],
    contraindications: ["Heat-type conditions (red/hot/inflamed)", "Fever", "Over large blood vessels", "Sensory-impaired areas (burn risk)", "Pregnancy (certain points)"],
    measureTools: [{ name: "VAS Pain Scale", how: "Before/after moxibustion", frequency: "Every session" }, { name: "Cold Sensitivity Score (0-10)", how: "How much does cold/damp worsen your pain?", frequency: "Weekly" }, { name: "Morning Stiffness Duration", how: "Minutes of stiffness from waking to normal movement", frequency: "Daily patient diary" }],
    ayushIntegration: "Moxibustion = Agni-vardhana (increasing digestive/tissue fire). BL23 moxa = strengthening Vrikka (Kidney). Combine with Swedana (sudation) + Kati Basti with warm Dhanwantaram Taila for comprehensive Vata-Kapha-Sheeta treatment.",
    doctorProtocol: [
      { title: "Indirect Moxa Techniques for Spine", content: "Moxa stick held 2-3 cm above skin. Warm without burning. Most common clinical technique.", steps: ["Light moxa stick, blow to even ember", "Hold 2-3 cm above BL23 (Kidney point, L2 level) — patient feels pleasant warmth", "Pecking technique: move stick up/down like bird pecking (intermittent heat)", "Circling technique: small circles over area for broader warming", "Treat BL23, GV4 (Mingmen), BL25, and any painful level", "Duration: 5-10 min per point area until skin pink and warm", "Treatment: 3-5× per week for cold-type conditions"] },
      { title: "Ginger/Salt Moxa for Deep Cold", content: "Place ginger slice or salt on skin, moxa cone on top — penetrates deeper than direct warming.", steps: ["Cut fresh ginger slice (3mm thick), poke holes with needle", "Place ginger on BL23 or GV4 (Mingmen)", "Place small moxa cone on ginger, light it", "Patient feels deep penetrating warmth — replace cone when burns down", "3-5 cones per point per session", "Salt moxa: fill navel with salt, moxa on top (for Kidney Yang) — indirect"] },
    ],
    patientSelfCare: [
      { title: "Self-Moxa Stick at Home", content: "Smokeless moxa sticks available — patient warms own lower back points at home.", steps: ["Light smokeless moxa stick (or use infrared lamp as substitute)", "Hold 3-4 cm from lower back (BL23 area / 'Kidney' zone)", "Move slowly side to side, keeping comfortable warmth", "Duration: 10-15 minutes per session", "Best timing: morning (cold stiffness) or evening (relaxation)", "Daily in winter, 3×/week in warmer months"], safetyNote: "Never fall asleep with moxa burning. Keep away from flammable materials. If skin turns red/blisters — too close, increase distance." },
      { title: "Infrared Lamp Alternative", content: "TDP lamp or infrared heat lamp as modern moxa substitute — same warming effect without smoke.", steps: ["Position lamp 30-50 cm from lower back", "Expose BL23/GV4 area (lower back either side of spine)", "Duration: 20-30 minutes", "Should feel comfortable warmth (not burning)", "Can combine with self-acupressure during lamp session", "Daily use OK for cold-type conditions"], safetyNote: "Check skin every 5 min. Don't fall asleep under lamp. Not for hot/inflamed conditions." },
    ],
    combinationProtocols: [
      { condition: "Cold-Damp Back Pain (Vata-Kapha)", plan: "Moxa BL23+GV4 → Kati Basti (warm oil) → Basti karma (Anuvasana) → Patient: self-moxa + warm water bottle daily" },
      { condition: "Elderly Degenerative Spine", plan: "Gentle moxa full spine → Abhyanga (warm oil) → Mild Basti → Rasayana herbs (Ashwagandha) → Patient: infrared lamp daily" },
    ],
    sop: { preparation: ["Assess patient constitution: cold-type pain confirmed (worse in cold/morning, better with heat)", "Check contraindications: fever, hot/inflamed area, pregnancy (specific points), sensory loss", "Prepare: moxa sticks (pure or smokeless), moxa cones, ginger slices, lighter, ashtray", "Ensure ventilation (moxa produces smoke) — fan/exhaust or use smokeless variety", "Patient prone with lumbar/affected area exposed", "Mark treatment points: BL23, GV4 (Mingmen), affected level, Ashi points"], execution: ["INDIRECT MOXA STICK: Light stick, blow to even ember, hold 2-3 cm above skin", "Warm each point area until skin becomes pink and patient feels comfortable deep warmth", "Pecking technique: move stick up and down like bird pecking (3-5 min per point)", "Circling technique: small circles over broader area (paraspinal muscles)", "GINGER MOXA: Place ginger slice (3mm, holes poked) on point → moxa cone on top → light", "Replace cone when burned down (3-5 cones per point)", "Total treatment: 15-25 minutes covering 4-6 points", "Monitor skin continuously — NEVER leave unattended"], postProcedure: ["Extinguish moxa safely (close ashtray lid)", "Check skin for burns or excessive redness (should be pink, not red/blistered)", "Apply soothing oil to treated area", "Patient remains prone 5 min (warmth integration)", "Record VAS after treatment", "Advise: keep area warm, no cold bath for 2 hours, drink warm water"], documentation: ["Points treated (list with moxa type)", "Duration per point and technique used", "Skin response (normal pink vs excessive)", "Patient warmth perception (comfortable/too hot/not enough)", "VAS before and after", "Any adverse events (burns, blisters)"], safetyChecks: ["NEVER leave moxa burning unattended near patient", "Keep fire extinguisher or water nearby", "Check skin every 30 seconds during treatment", "If patient can't feel heat (neuropathy): DO NOT use moxa", "Avoid in fever, acute inflammation (hot-type conditions)", "Smoky moxa: ensure room ventilation, avoid for asthmatic patients"] },
    equipment: [{ name: "Moxa Sticks (pure Artemisia, box of 10)", cost: "₹500-800", essential: true, notes: "Traditional. Strong smell and smoke. Most effective warming." }, { name: "Smokeless Moxa Sticks (box of 10)", cost: "₹800-1200", essential: false, notes: "Compressed charcoal-based. Less smell. Suitable for enclosed rooms." }, { name: "Moxa Cones (loose Artemisia, bag)", cost: "₹300-500", essential: false, notes: "For indirect (ginger/salt) technique. More targeted than stick." }, { name: "Fresh Ginger Root", cost: "₹20-50/piece", essential: false, notes: "Cut 3mm slices, poke holes. For ginger moxa technique." }, { name: "Moxa Holder/Clip", cost: "₹200-500", essential: false, notes: "Holds moxa stick at correct distance. Frees practitioner's hands." }, { name: "Moxa Extinguisher (ashtray with lid)", cost: "₹200-400", essential: true, notes: "Safely extinguish moxa between uses. Fire safety essential." }, { name: "Infrared TDP Lamp (alternative)", cost: "₹5,000-15,000", essential: false, notes: "Modern alternative to moxa. Same warming effect, no smoke. 30 min sessions." }, { name: "Lighter + Towels", cost: "₹50-100", essential: true, notes: "Light moxa + protect surrounding skin/sheets from ash." }],
    sessionChecklist: [{ step: "Cold-type pain confirmed (not hot/inflamed)", category: "Pre" }, { step: "Contraindications checked (fever, sensory loss, pregnancy)", category: "Pre" }, { step: "VAS recorded (before)", category: "Pre" }, { step: "Ventilation adequate (window/fan)", category: "Pre" }, { step: "Treatment points marked", category: "Pre" }, { step: "Moxa lit and ember stable", category: "Procedure" }, { step: "Held 2-3 cm from skin — patient confirms warmth", category: "Procedure" }, { step: "Pecking/circling technique applied", category: "Procedure" }, { step: "Skin monitored continuously (no burns)", category: "Procedure" }, { step: "4-6 points treated (15-25 min total)", category: "Procedure" }, { step: "Moxa extinguished safely", category: "Post" }, { step: "Skin checked for adverse reaction", category: "Post" }, { step: "Soothing oil applied to treated area", category: "Post" }, { step: "VAS recorded (after)", category: "Post" }, { step: "Home advice given (keep warm, no cold bath)", category: "Post" }],
    pricing: { perSession: 500, packageOptions: [{ name: "Trial (4 sessions)", sessions: 4, price: 1800, savings: "₹200 off" }, { name: "Winter Course (10 sessions)", sessions: 10, price: 4000, savings: "₹1,000 off (seasonal)" }, { name: "Combo: Moxa + Kati Basti (7 days)", sessions: 7, price: 8000, savings: "₹1,500 off (bundled)" }, { name: "Infrared Lamp Session", sessions: 1, price: 400, savings: "Smokeless alternative" }], breakEven: "5 patients/day × 25 days = 125 sessions × ₹500 = ₹62,500/month. Moxa cost ₹50-80/session. Seasonal demand: highest in winter.", revenuePerMonth: "Target: 80-120 sessions/month = ₹40,000-60,000 (peaks in cold season)", competitorComparison: "TCM clinics: ₹500-1000 for moxa. At ₹500 with Ayurvedic integration — unique positioning. Infrared lamp as smoke-free option adds flexibility." },
    training: [{ level: "Beginner", hours: "20-40 hours", certification: "Certificate in Moxibustion / Thermal Therapy", books: ["Wilcox — Moxibustion: The Power of Mugwort Fire", "Lorraine Wilcox — Moxibustion: A Modern Clinical Handbook"], courses: ["Basic Moxibustion Certificate (within acupuncture course)", "TCM Thermal Therapy Workshop"], skills: ["Indirect moxa stick technique", "Safe distance judgment", "BL23/GV4 warming protocol", "Fire safety procedures"] }, { level: "Intermediate", hours: "60-100 hours", certification: "Advanced Moxa Practitioner", books: ["Fukaya — Japanese Moxibustion (direct)", "Junji Mizutani — Japanese Acupuncture (moxa chapter)"], courses: ["Japanese Rice-Grain Moxa Course", "Ginger/Salt Moxa Advanced"], skills: ["Indirect cone moxa (ginger/salt)", "Direct scarring moxa (Japanese style)", "Constitutional assessment for moxa", "Integration with cupping + acupuncture"] }, { level: "Advanced", hours: "200+ hours", certification: "Moxa Specialist / TCM Thermal Therapist", books: ["Research: Deng, Xu systematic reviews on moxa"], courses: ["Japan moxibustion advanced training", "Research methodology"], skills: ["All moxa techniques mastery", "Teaching/certification", "Research competency", "Complex cold-damp conditions"] }],
  },
  11: { title: "Thai Massage & Sen Lines", origin: "Thailand", icon: "🇹🇭", category: "Manual Therapy", evidenceLevel: "Moderate", evidenceScore: 67, overview: "Thai Yoga Massage combines acupressure along Sen (energy) lines with assisted yoga stretching. Sen Sumana runs along the spine. Treatment on floor mat with patient fully clothed.", history: "Attributed to Jivaka Kumar Bhaccha (Buddha's physician, 2500 years ago). Influenced by Indian Ayurveda and Yoga, Chinese medicine, and indigenous Thai healing.", mechanism: "Combination of: point pressure (gate control), passive stretching (fascial release, muscle lengthening), joint mobilization (synovial nutrition), and compression (circulatory enhancement).", spineIndications: ["Stiffness/reduced mobility", "Mechanical back pain", "Hip-spine connection", "Postural correction", "Flexibility restoration"], contraindications: ["Acute disc herniation", "Fracture", "Severe osteoporosis", "DVT", "Pregnancy (modified only)"], measureTools: [{ name: "VAS Pain Scale", how: "Before/after session", frequency: "Every session" }, { name: "Sit-and-Reach", how: "Measure hamstring/spine flexibility", frequency: "Monthly" }, { name: "Spinal Rotation ROM", how: "Inclinometer", frequency: "Weekly" }], ayushIntegration: "Sen Sumana = Sushumna Nadi. Thai stretches = modified Yoga asanas. Combine with Pizhichil (warm oil pouring) before Thai stretching for lubricated deep flexibility work.", doctorProtocol: [{ title: "Sen Sumana (Spine Line) Protocol", content: "Thumb pressure along paraspinal muscles + assisted spinal twist + traction techniques.", steps: ["Patient prone on floor mat", "Palm press: walk palms along entire erector spinae", "Thumb press: both thumbs along Sen Sumana bilateral (1.5 cun from midline)", "Cobra stretch: lift patient's chest while pressing sacrum down", "Supine spinal twist: patient's knees to side, stabilize opposite shoulder", "Traction: pull both ankles with patient supine (axial decompression)", "Total: 60-90 min full session, 30 min spine-focused"] }], patientSelfCare: [{ title: "Self-Thai Yoga Spine Stretches (10 min)", content: "Adapted Thai stretches you can do alone at home for spine flexibility.", steps: ["Seated spinal twist: both directions, hold 30 sec each", "Cobra pose: prone, push up keeping hips down — hold 15 sec × 5", "Knee-to-chest: supine, hug one knee then both — 30 sec each", "Supine twist: knees to one side, shoulders flat — 30 sec each", "Cat-cow: on all fours, 10 slow repetitions with breath", "Child's pose: sit back on heels, arms forward — 60 sec"], safetyNote: "Move within comfort range. Never force rotation. Breathe throughout." }], combinationProtocols: [{ condition: "Chronic Stiffness", plan: "Thai massage full spine → Pizhichil → Patient self-stretches daily → Monthly maintenance Thai session" }], sop: { preparation: ["Prepare floor mat/futon (Thai massage done on floor)", "Patient wears loose comfortable clothing (no oil used)", "Check ROM and flexibility baseline", "Screen: disc herniation, fractures, osteoporosis, DVT, pregnancy", "Ensure adequate space (practitioner moves around patient)"], execution: ["Begin prone: palm press entire back (warming phase 5 min)", "Thumb walk along Sen Sumana (paravertebral) bilateral", "Knee press on gluteals and hamstrings", "Passive stretching: hamstring, hip flexor, quadriceps", "Supine: spinal twist (knees to side, stabilize shoulder)", "Cobra lift: lift patient's upper body while pressing sacrum", "Traction: pull ankles for axial decompression", "Side-lying: hip opening, rotation stretches", "Total: 60-90 min full body, 30 min spine-focused"], postProcedure: ["Patient rests 2-3 min on mat", "Offer water", "Record VAS after treatment", "Teach 2-3 self-stretches for home", "Schedule next session (weekly for stiffness)"], documentation: ["ROM measured before/after (flexion, rotation)", "Techniques used and areas focused", "VAS before and after", "Flexibility changes noted", "Patient tolerance and response"], safetyChecks: ["Never force rotation or extension beyond comfort", "Avoid Thai massage with acute disc herniation", "Be gentle with osteoporotic/elderly patients", "Avoid knee press on varicose veins", "Stop if patient reports radiating nerve pain"] }, equipment: [{ name: "Thai Massage Floor Mat/Futon", cost: "₹3,000-8,000", essential: true, notes: "Firm cotton futon, minimum 2m × 1m. Floor work is traditional." }, { name: "Comfortable Loose Clothing (patient)", cost: "₹500/set", essential: true, notes: "Provide clinic sets for patients. Thai massage is clothed." }, { name: "Bolsters/Pillows (various sizes)", cost: "₹1,000-2,000", essential: true, notes: "Support during stretches. Under knees, under chest." }, { name: "Treatment Room (spacious)", cost: "Variable", essential: true, notes: "Need 3m × 3m minimum floor space. Clean mat floor." }], sessionChecklist: [{ step: "ROM baseline assessed", category: "Pre" }, { step: "Contraindications screened", category: "Pre" }, { step: "VAS recorded (before)", category: "Pre" }, { step: "Patient in loose clothing on mat", category: "Pre" }, { step: "Warming phase completed (palm press)", category: "Procedure" }, { step: "Sen Sumana thumb walk (bilateral)", category: "Procedure" }, { step: "Passive stretches performed (hip, hamstring, spine)", category: "Procedure" }, { step: "Spinal twist + traction performed", category: "Procedure" }, { step: "Session completed (30-90 min)", category: "Procedure" }, { step: "VAS recorded (after)", category: "Post" }, { step: "ROM re-measured (improvement noted)", category: "Post" }, { step: "Self-stretches taught", category: "Post" }, { step: "Notes completed", category: "Post" }], pricing: { perSession: 800, packageOptions: [{ name: "Trial (3 sessions)", sessions: 3, price: 2100, savings: "₹300 off" }, { name: "Standard (8 sessions)", sessions: 8, price: 5500, savings: "₹900 off" }, { name: "Monthly Flexibility (4)", sessions: 4, price: 2800, savings: "₹400 off" }], breakEven: "3 patients/day × 25 days = 75 sessions × ₹800 = ₹60,000/month. No consumables — pure skill.", revenuePerMonth: "Target: 50-75 sessions/month = ₹40,000-60,000", competitorComparison: "Spa Thai massage: ₹1500-3000. Clinical spine-focused at ₹800 is therapeutic + affordable." }, training: [{ level: "Beginner", hours: "100 hours", certification: "Thai Massage Foundation", books: ["Salguero — Encyclopedia of Thai Massage", "Chaithavuthi — Thai Massage"], courses: ["ITM Chiang Mai Foundation", "Thai Yoga Therapy Course (India)"], skills: ["Basic prone/supine protocol", "Sen line identification", "Assisted yoga stretches", "Safety precautions"] }, { level: "Advanced", hours: "300+ hours", certification: "Thai Massage Practitioner/Teacher", books: ["Salguero — Advanced Thai Bodywork", "Buttagat — Thai Traditional Massage Research"], courses: ["ITM Advanced Certification", "Therapeutic Thai Applications"], skills: ["Spine-specific protocols", "Clinical assessment", "Teaching others", "Integration with Ayurveda"] }] },
  12: { title: "Osteopathic & Chiropractic Concepts", origin: "USA/UK", icon: "🦴", category: "Manual Therapy", evidenceLevel: "Strong", evidenceScore: 82, overview: "Evidence-based manual techniques: Muscle Energy Technique (MET), positional release, craniosacral therapy, and myofascial unwinding. HVLA manipulation by trained practitioners only.", history: "Osteopathy: Andrew Taylor Still (1874). Chiropractic: DD Palmer (1895). Both evolved into evidence-based musculoskeletal medicine with manual therapy as core.", mechanism: "MET: isometric contraction against resistance → post-isometric relaxation → immediate ROM gain. Positional release: positioning joint at ease → resets abnormal neural reflexes → pain reduction.", spineIndications: ["Joint restriction/fixation", "SI joint dysfunction", "Facet joint pain", "Segmental hypomobility", "Post-trauma muscle guarding"], contraindications: ["HVLA: vertebrobasilar insufficiency", "Acute fracture", "Spinal malignancy", "Severe osteoporosis", "Cauda equina syndrome"], measureTools: [{ name: "VAS Pain Scale", how: "Before/after treatment", frequency: "Every session" }, { name: "Segmental ROM", how: "Passive motion testing at each vertebral level", frequency: "Every session" }, { name: "TART Assessment", how: "Tenderness, Asymmetry, Restricted ROM, Tissue texture changes", frequency: "Every visit" }], ayushIntegration: "MET parallels Meru Chikitsa (Ayurvedic spinal correction). Craniosacral rhythm assessment = Marma palpation of Adhipati Marma (cranium). Post-MET: apply warm oil + Nadi Sweda for sustained tissue response.", doctorProtocol: [{ title: "Muscle Energy Technique (MET) for Spine", content: "Patient actively contracts muscle against doctor's resistance → then passive stretch to new barrier. Restores joint motion safely.", steps: ["Identify restricted segment (passive motion testing)", "Position joint at restriction barrier", "Patient pushes against doctor's resistance: 20% effort, 5-7 seconds", "Patient relaxes completely", "Doctor takes joint to NEW barrier (further ROM)", "Repeat 3-5 times — each cycle gains more motion", "Final hold at new end-range for 30 seconds"] }, { title: "Positional Release (Counterstrain)", content: "Find tender point → position body until tenderness reduces 70% → hold 90 sec → slowly return. Resets neural loop.", steps: ["Locate tender point (typically anterior or posterior)", "Press point — note pain level (10/10 baseline)", "Slowly move patient's body seeking position that REDUCES tenderness to 3/10 or less", "Hold this 'position of comfort' for 90 seconds", "Return SLOWLY to neutral (do not snap back)", "Recheck tender point — should be dramatically less tender"] }], patientSelfCare: [{ title: "Self-MET for SI Joint", content: "Bridge + resist technique for SI joint self-correction at home.", steps: ["Lie on back, knees bent, feet flat", "Place fist between knees — squeeze GENTLY against fist 5 sec (adductors)", "Relax 5 sec", "Place belt/band around knees — push OUT against band 5 sec (abductors)", "Relax 5 sec", "Repeat squeeze-push cycle 5 times", "Finish: hug both knees to chest, rock gently side to side"], safetyNote: "Use only 20-30% effort — gentle resistance, never maximum force." }], combinationProtocols: [{ condition: "SI Joint Dysfunction", plan: "MET in clinic → Kati Basti → Patient self-MET bridge daily → Monthly professional reassessment" }, { condition: "Facet Joint Restriction", plan: "Positional release + MET → Meru Chikitsa → Agnikarma at facet level → Patient mobility exercises daily" }], sop: { preparation: ["Assess patient history — previous manipulation, imaging available", "Screen red flags: fracture, malignancy, vertebrobasilar insufficiency (VBI) signs", "Test VBI: sustained cervical rotation + extension 30 sec — observe for dizziness/nystagmus", "Palpate spine: TART assessment (Tenderness, Asymmetry, Restricted motion, Tissue texture)", "Identify restricted segment(s) and direction of restriction"], execution: ["Position patient for identified restricted segment", "MET: position at barrier → patient pushes 20% effort × 5-7 sec → relax → take to new barrier", "Repeat 3-5 cycles per segment", "Positional Release: find tender point → position for comfort (70% reduction) → hold 90 sec → return slowly", "Reassess mobility after each technique", "HVLA (if trained): only with confirmed training, proper consent, negative VBI test", "Treat maximum 3-4 segments per session"], postProcedure: ["Reassess TART at treated segments", "Record ROM improvement", "VAS after treatment", "Prescribe home mobility exercises", "Advise: mild soreness 12-24 hrs normal, hydrate well", "Next session in 3-7 days for reassessment"], documentation: ["Segments treated (level and side)", "Technique used (MET/Positional Release/HVLA)", "Direction of restriction and correction", "TART findings before and after", "VAS before and after", "ROM change documented"], safetyChecks: ["NEVER perform HVLA on cervical without VBI test", "NEVER manipulate if positive VBI (dizziness with rotation + extension)", "Check imaging before any high-velocity technique", "Use MET and Positional Release as first-line (safer)", "HVLA only by specifically trained and certified practitioners", "Document informed consent for any manual technique"] }, equipment: [{ name: "Treatment Table (hi-lo, drop sections preferred)", cost: "₹30,000-80,000", essential: true, notes: "Variable height. Thompson drop table ideal for chiropractic. Flat table for MET." }, { name: "Inclinometer / Goniometer", cost: "₹1,000-3,000", essential: true, notes: "Measure segmental and gross ROM. Document objectively." }, { name: "Foam Wedge / Bolsters", cost: "₹1,000-2,000", essential: true, notes: "Position patient for specific segment access." }, { name: "TART Assessment Form (printable)", cost: "₹100", essential: true, notes: "Standardized palpation recording sheet." }, { name: "Anatomy Spine Model", cost: "₹3,000-8,000", essential: false, notes: "Patient education — explain what you're correcting." }], sessionChecklist: [{ step: "Red flags screened (fracture, malignancy, infection)", category: "Pre" }, { step: "VBI test performed (if cervical work planned)", category: "Pre" }, { step: "TART assessment documented", category: "Pre" }, { step: "VAS recorded (before)", category: "Pre" }, { step: "Restricted segment(s) identified", category: "Pre" }, { step: "Technique selected (MET/Positional Release)", category: "Procedure" }, { step: "Patient positioned at restriction barrier", category: "Procedure" }, { step: "Technique performed (3-5 cycles)", category: "Procedure" }, { step: "Reassessment after each technique", category: "Procedure" }, { step: "VAS recorded (after)", category: "Post" }, { step: "ROM improvement documented", category: "Post" }, { step: "Home exercises prescribed", category: "Post" }, { step: "Notes completed", category: "Post" }], pricing: { perSession: 800, packageOptions: [{ name: "Assessment + Treatment (first visit)", sessions: 1, price: 1000, savings: "Includes full TART assessment" }, { name: "Course (6 sessions)", sessions: 6, price: 4200, savings: "₹600 off" }, { name: "Monthly Maintenance (4)", sessions: 4, price: 2800, savings: "₹400 off" }], breakEven: "4 patients/day × 25 days = 100 sessions × ₹800 = ₹80,000/month. No consumables.", revenuePerMonth: "Target: 60-100 sessions/month = ₹48,000-80,000", competitorComparison: "Chiropractor: ₹1000-2000. Osteopath: ₹1500-3000. MET at ₹800 is evidence-based + safer than HVLA." }, training: [{ level: "Beginner (MET)", hours: "40-60 hours", certification: "Certificate in Manual Therapy / MET", books: ["Chaitow — Muscle Energy Techniques", "Greenman — Principles of Manual Medicine"], courses: ["MET Foundation Course (40 hrs)", "Manual Therapy Introduction"], skills: ["Palpation (TART assessment)", "MET technique (3 positions)", "SI joint correction", "Basic lumbar/cervical mobilization"] }, { level: "Intermediate (Osteopathic)", hours: "200-500 hours", certification: "Diploma in Manual Therapy / Osteopathy", books: ["Ward — Foundations for Osteopathic Medicine", "DiGiovanna — Osteopathic Approach"], courses: ["Diploma Osteopathic Medicine", "Counterstrain Academy Course"], skills: ["Full spine MET", "Positional release (all positions)", "Craniosacral basics", "Complex assessment and treatment planning"] }, { level: "Advanced (DO/Chiro)", hours: "4000+ hours (degree)", certification: "DO / DC / DOMP", books: ["Still — Philosophy of Osteopathy", "Palmer — Chiropractic Philosophy"], courses: ["Full Osteopathic/Chiropractic degree program"], skills: ["HVLA (high-velocity low-amplitude)", "Full scope manual medicine", "Teaching/research", "Multimodal integration"] }] },
  13: { title: "Sujok Therapy", origin: "South Korea (Prof. Park Jae Woo)", icon: "🌀", category: "Microsystem", evidenceLevel: "Low-Moderate", evidenceScore: 55, overview: "Hand and foot microsystem therapy using correspondence theory, Six Ki energy, twist therapy, and seed therapy. Middle finger = spine in standard correspondence. Extremely accessible and safe.", history: "Developed by Prof. Park Jae Woo (1987). Combines Korean, Chinese, and Indian philosophy. 'Su' = hand, 'Jok' = foot in Korean. Global following especially in India.", mechanism: "Correspondence stimulation + energy balance (Six Ki = similar to Panchamahabhuta). Seed on correspondence point provides continuous micro-stimulation. Twist therapy creates spiral energy alignment.", spineIndications: ["Quick accessible pain relief", "Energy imbalance correction", "Maintenance therapy", "Gentle/non-invasive option", "Children and elderly"], contraindications: ["Virtually none — extremely safe", "Local skin injury (avoid area)", "Severe peripheral neuropathy (reduced sensation)"], measureTools: [{ name: "VAS Pain Scale", how: "Before/after Sujok treatment", frequency: "Every session" }, { name: "Correspondence Tenderness", how: "Probe hand/foot points — document which respond", frequency: "Each visit" }], ayushIntegration: "Sujok Six Ki theory correlates with Ayurvedic Panchamahabhuta. Wind=Vata, Heat=Pitta, Humidity=Kapha. Combine Sujok seeds on hand with Marma oil application for dual microsystem stimulation.", doctorProtocol: [{ title: "Standard Correspondence Treatment", content: "Map spine pain to corresponding zone on hand. Stimulate with seeds, magnets, moxa, or needle.", steps: ["Standard: middle finger dorsum midline = spine (tip=head, base=lumbar)", "Insect: thumb = head, each finger = limb, palm = torso", "Locate spine problem zone on hand correspondence", "Apply diagnostic probe — find most tender point", "Treatment: seed + tape (continuous) OR moxa (warming) OR color pen (energy)", "Add Sujok ring on corresponding finger for ongoing stimulation"] }, { title: "Twist Therapy for Spine", content: "Spiral movement exercises that create energy flow along spine. Based on spiral/twist pattern of DNA and natural growth.", steps: ["Stand with feet shoulder-width apart", "Twist torso left-right slowly with arms relaxed (swinging)", "Head follows body twist — eyes look in direction of twist", "30 seconds slow twisting → gradually increase speed to comfortable pace", "Continue 3-5 minutes", "Principle: spiral movement restores natural energy flow in spine"] }], patientSelfCare: [{ title: "Seed Therapy Self-Application", content: "Apply seeds to hand spine points for 24/7 stimulation between doctor visits.", steps: ["Find spine line: dorsum (back) of middle finger, center line", "Place seed on most painful corresponding point", "Also add: seed on thumb tip (head) if headache present", "Press seeds 20-30 times whenever pain occurs", "Replace every 3-5 days", "Color: mark green pen on inflammation point, red on cold/weak point"], safetyNote: "Seeds are completely safe. Remove if skin irritation occurs." }, { title: "Daily Twist Therapy (5 min)", content: "Simple standing twist exercise for spine energy flow.", steps: ["Morning: stand relaxed, twist torso left-right 100 times", "Arms swing freely like wet rope", "Speed: comfortable rhythmic pace", "Focus: spine feels like wringing a towel — releasing tension", "Finish: stand still 30 seconds, feel energy flow"], safetyNote: "Start slow if acute pain. Avoid twisting if disc herniation is active." }], combinationProtocols: [{ condition: "General Spine Maintenance", plan: "Sujok seeds on hand spine zone + Twist therapy daily + Monthly Panchakarma maintenance + AYUSH herbs" }], sop: { preparation: ["Identify patient's spine pain location and laterality", "Prepare: Sujok probe, seeds, magnets, color pens, ring, adhesive tape", "Clean patient's hands with alcohol wipe", "Hand correspondence chart ready for reference", "Explain: middle finger = spine representation"], execution: ["Standard correspondence: DIP of middle finger = cervical, PIP = thoracic, MCP = lumbar", "Probe along spine line on dorsum of middle finger", "Find most tender correspondence point(s)", "Treatment options: seed (continuous), magnet (stronger), color pen (energy), moxa cone (warming)", "Apply selected treatment to marked points", "Add Sujok ring on middle finger (ongoing meridian stimulation)", "Teach twist therapy exercise", "Total session: 15-20 minutes"], postProcedure: ["Instruct patient: press seeds 20-30× whenever pain occurs", "Seeds stay 3-5 days — replace at next visit", "Record VAS before and after (expect fast response)", "Give take-home diagram of hand spine points", "Schedule follow-up (weekly)"], documentation: ["Correspondence points treated (mark on hand diagram)", "Type of stimulation used (seed/magnet/color/moxa)", "VAS before and after", "Patient response speed"], safetyChecks: ["Virtually no safety concerns — safest therapy available", "Check for adhesive tape allergy", "Avoid if hand has open wounds", "Remove seeds if skin irritation develops"] }, equipment: [{ name: "Sujok Diagnostic Probe", cost: "₹200-500", essential: true, notes: "Spring-loaded probe for finding tender points." }, { name: "Sujok Seeds (Vaccaria, 100 pack)", cost: "₹200-400", essential: true, notes: "For correspondence point stimulation." }, { name: "Sujok Rings (set of 10)", cost: "₹200-500", essential: false, notes: "Finger rings for meridian stimulation." }, { name: "Color Pens (set of 6 colors)", cost: "₹100-200", essential: false, notes: "For color therapy on correspondence points." }, { name: "Sujok Hand/Foot Chart", cost: "₹300-500", essential: true, notes: "Laminated reference chart for treatment room." }, { name: "Mini Moxa Cones (for hand)", cost: "₹200-400", essential: false, notes: "Tiny moxa for warming correspondence points." }], sessionChecklist: [{ step: "Spine complaint identified", category: "Pre" }, { step: "VAS recorded (before)", category: "Pre" }, { step: "Hands cleaned", category: "Pre" }, { step: "Correspondence zone identified (DIP/PIP/MCP)", category: "Procedure" }, { step: "Tender points probed and found", category: "Procedure" }, { step: "Seeds/magnets applied", category: "Procedure" }, { step: "Ring placed for ongoing stimulation", category: "Procedure" }, { step: "Twist therapy demonstrated", category: "Procedure" }, { step: "VAS recorded (after)", category: "Post" }, { step: "Self-press instructions given", category: "Post" }, { step: "Take-home diagram provided", category: "Post" }], pricing: { perSession: 300, packageOptions: [{ name: "Trial (3 sessions)", sessions: 3, price: 800, savings: "₹100 off" }, { name: "Monthly (4 sessions)", sessions: 4, price: 1000, savings: "₹200 off" }, { name: "Full kit + teaching", sessions: 1, price: 500, savings: "Includes take-home kit + training" }], breakEven: "Consumable cost: ₹10-20/session. Very quick treatment (15 min). High throughput possible.", revenuePerMonth: "Target: 150+ sessions/month = ₹45,000+. Best as add-on to other therapies.", competitorComparison: "Very few competitors. Unique selling point. Low cost drives volume + builds patient loyalty." }, training: [{ level: "Beginner", hours: "20-30 hours", certification: "Sujok Foundation Certificate", books: ["Park Jae Woo — Sujok Therapy", "Sujok Academy Publications"], courses: ["Sujok Academy Foundation (India)", "Online Sujok Basics"], skills: ["Standard correspondence mapping", "Seed therapy", "Basic twist therapy", "Spine zone treatment"] }, { level: "Advanced", hours: "100+ hours", certification: "Sujok Practitioner / Six Ki Specialist", books: ["Park Jae Woo — Six Ki", "Triorigin Theory"], courses: ["Six Ki Advanced Course", "Triorigin Practitioner"], skills: ["Six Ki energy balancing", "Triorigin therapy", "Needle on hand points", "Complex constitutional treatment"] }] },
  14: { title: "Marma Therapy (Ayurveda)", origin: "India (Sushruta Samhita, 600 BCE)", icon: "🙏", category: "Traditional System", evidenceLevel: "Traditional + Emerging Research", evidenceScore: 63, overview: "Marma are vital energy points (107 in body) where Prana concentrates. Spine-related Marmas control energy flow through the back. Stimulation with pressure, oil, heat, or mantra restores Pranic flow.", history: "Documented by Sushruta (surgeon, 600 BCE) as Marma Shastra for surgical safety. Ashtanga Hridaya lists therapeutic applications. Kalari martial arts uses Marma for combat and healing.", mechanism: "Marma points are neurovascular junctions where nerves, blood vessels, muscles, tendons, and bones concentrate. Stimulation activates neurohumoral responses, releases neuropeptides, and modulates autonomic function.", spineIndications: ["Vata-type spine pain", "Energy blockage (Prana obstruction)", "Chronic stiffness", "Nerve-related symptoms", "Post-Panchakarma maintenance", "Constitutional weakness"], contraindications: ["Directly over fracture", "Acute inflammation (gentle only)", "Sadyopranahar Marma (lethal points — heavy stimulation avoided)", "Pregnancy (abdominal Marma)"], measureTools: [{ name: "VAS Pain Scale", how: "Before/after Marma therapy", frequency: "Every session" }, { name: "Marma Tenderness Score (0-3)", how: "Palpation each Marma: 0=normal, 1=mild, 2=moderate, 3=severe tenderness", frequency: "Every session" }, { name: "Prana Flow Assessment", how: "Practitioner palpation + patient subjective energy level", frequency: "Monthly" }], ayushIntegration: "Core AYUSH therapy — directly part of Ayurvedic clinical practice. Integrate with: Abhyanga (oil massage amplifies Marma effect), Basti (Apana Vayu correction), Nasya (Prana Vayu), and Yoga (Prana channel opening).", doctorProtocol: [{ title: "15 Spine-Related Marma Points", content: "Key Marma points affecting spine health — location, stimulation method, and effect.", steps: ["Adhipati (crown) — governs all Marma, affects whole spine via CNS", "Krikatika (C1-C2 junction) — neck mobility, cervical nerve supply", "Amsa (shoulder tip) — upper back, arm supply", "Amsaphalaka (infrascapular) — thoracic spine, scapular control", "Brihati (T5-T6 level) — mid-back, respiratory connection", "Kukundara (sacral dimples/PSIS) — lumbar spine, Apana Vayu seat", "Katikataruna (hip joint) — hip-spine connection", "Nitamba (buttock center) — sciatic nerve, piriformis", "Parshvasandhi (lateral trunk) — lateral spine, QL", "Vitapa (inguinal) — psoas, hip flexor-spine connection", "Janu (knee) — lower limb chain to spine", "Gulpha (ankle) — foundation affecting entire spine alignment", "Nabhi (navel) — center of body, affects psoas and deep core", "Hridaya (chest center) — thoracic alignment, rib mobility", "Sthapani (between eyebrows) — CNS calming, pain modulation"] }, { title: "Marma Stimulation Techniques", content: "Different methods based on condition and Dosha.", steps: ["Clockwise circular pressure (30 sec): TONIFYING — for weakness/depletion", "Counter-clockwise circular (30 sec): REDUCING — for congestion/excess", "Sustained hold (60-90 sec): BALANCING — for general Dosha correction", "Oil application (warm til/sesame): SNEHANA — deep nourishment", "Gentle tapping: AWAKENING — for sluggish/Kapha-blocked Marma", "Frequency: hold each Marma 30-60 sec, work through spine Marmas sequentially"] }], patientSelfCare: [{ title: "Morning Marma Activation (7 points, 5 min)", content: "Self-press accessible spine-related Marma points daily for energy flow.", steps: ["1. Adhipati (top of head) — press gently 30 sec with fingertips", "2. Krikatika (base of skull, both sides) — circular press 30 sec", "3. Kukundara (sacral dimples) — press with thumbs 30 sec", "4. Katikataruna (hip creases) — press where leg meets trunk 30 sec", "5. Janu (center of knee back) — press 15 sec each side", "6. Gulpha (ankle joint center) — circular press 15 sec each", "7. Nabhi (navel center) — gentle clockwise massage 30 sec"], safetyNote: "Gentle to moderate pressure. Apply til taila (sesame oil) to fingertips for enhanced effect." }, { title: "Oil + Marma Self-Treatment (Evening)", content: "Warm sesame oil application on spine-related Marma for deep Vata pacification before bed.", steps: ["Warm 2 tbsp sesame/Mahanarayan oil in palms", "Apply to Kukundara Marma (sacral dimples) — massage 60 sec", "Apply along entire spine midline — long strokes downward", "Press Krikatika Marma (skull base) with oiled fingers — 60 sec", "Press Gulpha Marma (ankles) — 30 sec each", "Total: 5-7 minutes", "Best before bed — Vata pacification aids sleep"], safetyNote: "Use warm (not hot) oil. Place old towel on bed. Consistent daily practice gives best results." }], combinationProtocols: [{ condition: "Vata-type Chronic Back Pain", plan: "Full Marma therapy + Kati Basti + Basti karma + Patient self-Marma morning/evening + Ashwagandha + Yoga" }, { condition: "Post-Panchakarma Maintenance", plan: "Weekly Marma therapy + Patient daily self-Marma oil routine + Monthly follow-up + Rasayana herbs" }], sop: { preparation: ["Assess Dosha and Dhatu involvement (Prakriti + Vikriti)", "Warm medicated oil in oil warmer (sesame/Mahanarayan/Dhanwantaram)", "Room warm, quiet, dim lighting (Marma work requires patient stillness)", "Review 15 spine-related Marma point locations", "Patient positioned for access (prone for back Marma, supine for front)", "Hands clean, oil applied to practitioner's fingers/thumbs"], execution: ["Begin with Abhyanga (oil massage) along spine — warming phase (5 min)", "Identify tender/blocked Marma points by palpation (compare bilateral)", "Treatment per Marma: Clockwise circular = tonifying, Counter-clockwise = reducing", "Apply sustained pressure 30-60 seconds per Marma point", "Work sequence: Kukundara (sacral) → Katikataruna (hip) → Brihati (thoracic) → Krikatika (cervical)", "Include Adhipati (crown) for overall regulation", "Duration per point: 30-60 sec hold, then move to next", "Total 15 points: approximately 25-35 minutes", "Finish with long Du Mai (midline) stroking — integrating"], postProcedure: ["Patient rests 5 min (integration of Pranic shift)", "Wipe excess oil gently with warm towel", "Record VAS after treatment", "Teach patient 3-5 accessible self-Marma points for home", "Advise: avoid cold bath for 2 hours, drink warm water", "Schedule next session (alternate days for acute, weekly for chronic)"], documentation: ["Marma points treated (list with tenderness score 0-3 each)", "Technique used per point (tonifying/reducing/balancing)", "Oil used and quantity", "Patient Pranic response (warmth, tingling, emotional release)", "VAS before and after", "Self-Marma points taught to patient"], safetyChecks: ["Never apply heavy pressure to Sadyopranahar (lethal) Marma without training", "Gentle approach for Vaikalyakar Marma (can cause deformity if damaged)", "Be gentle over bony prominences", "Watch for emotional release (crying, anxiety) — normal, provide support", "Avoid deep abdominal Marma in pregnancy", "Stop if patient reports sharp pain (reposition technique)"] }, equipment: [{ name: "Medicated Oil (Mahanarayan/Dhanwantaram, 1L)", cost: "₹400-800", essential: true, notes: "Warm oil is essential for Marma work. Sesame base for Vata." }, { name: "Oil Warmer (electric)", cost: "₹1,000-2,000", essential: true, notes: "Keep oil at 38-40°C. Cold oil blocks Marma response." }, { name: "Treatment Table (padded)", cost: "₹15,000-30,000", essential: true, notes: "Patient lies still for 30+ min. Comfort essential." }, { name: "Marma Chart (107 points, wall poster)", cost: "₹1,000-2,000", essential: true, notes: "Reference for point location during treatment." }, { name: "Warm Towels", cost: "₹500/set", essential: true, notes: "Wipe excess oil post-treatment." }, { name: "Timer (30 sec intervals)", cost: "₹200", essential: false, notes: "Helps maintain consistent hold duration per Marma." }], sessionChecklist: [{ step: "Dosha assessment reviewed", category: "Pre" }, { step: "Oil warmed and ready", category: "Pre" }, { step: "VAS recorded (before)", category: "Pre" }, { step: "Patient positioned comfortably", category: "Pre" }, { step: "Abhyanga warming phase completed (5 min)", category: "Procedure" }, { step: "Tender Marma points identified by palpation", category: "Procedure" }, { step: "Each Marma treated (30-60 sec clockwise/counter-clockwise)", category: "Procedure" }, { step: "Sequence followed: sacral → thoracic → cervical", category: "Procedure" }, { step: "Du Mai integration stroke performed", category: "Procedure" }, { step: "Patient rested 5 min post-treatment", category: "Post" }, { step: "VAS recorded (after)", category: "Post" }, { step: "Self-Marma points taught to patient", category: "Post" }, { step: "Notes completed with tenderness scores", category: "Post" }], pricing: { perSession: 600, packageOptions: [{ name: "Trial (5 sessions)", sessions: 5, price: 2500, savings: "₹500 off" }, { name: "Standard (10 sessions)", sessions: 10, price: 5000, savings: "₹1,000 off" }, { name: "Marma + Abhyanga Combo (8)", sessions: 8, price: 5500, savings: "₹1,300 off (60 min sessions)" }, { name: "Monthly Wellness (4)", sessions: 4, price: 2200, savings: "₹200 off" }], breakEven: "4 patients/day × 25 days = 100 sessions × ₹600 = ₹60,000/month. Oil cost ₹30-50/session.", revenuePerMonth: "Target: 80-120 sessions/month = ₹48,000-72,000", competitorComparison: "Spa massage: ₹1000-2000 (non-specific). Marma at ₹600 is Ayurvedic therapeutic + unique positioning." }, training: [{ level: "Beginner", hours: "50-100 hours", certification: "Certificate in Marma Therapy", books: ["Lad & Durve — Marma Points of Ayurveda", "Frawley — Ayurveda & Marma Therapy"], courses: ["Marma Foundation Course (BAMS add-on)", "Kalari Marma Training (Kerala)"], skills: ["15 spine-related Marma location", "Basic stimulation techniques", "Oil selection per Dosha", "Self-Marma teaching to patients"] }, { level: "Intermediate", hours: "200-300 hours", certification: "Marma Practitioner / Kalari Therapist", books: ["Murthy — Sushruta Samhita Sharira Sthana (Marma chapter)", "Ranade — Marma Points in Human Body"], courses: ["Advanced Marma Training (India)", "Kalari Chikilsa Course (Kerala)"], skills: ["All 107 Marma points", "Condition-specific protocols", "Integration with Panchakarma", "Pranic assessment by palpation"] }, { level: "Advanced", hours: "500+ hours", certification: "Marma Specialist / Kalari Master", books: ["Original Sushruta Samhita", "Research papers on Marma"], courses: ["Kalari Master Training (3+ years)", "Teaching certification"], skills: ["Full Kalari martial + healing art", "Teaching/certification of others", "Research competency", "Complex chronic pain management"] }] },
  15: { title: "Pranic Healing & Energy Work", origin: "Philippines/India (Master Choa Kok Sui)", icon: "✨", category: "Energy-Based", evidenceLevel: "Low (energy-based, limited RCTs)", evidenceScore: 45, overview: "Energy-based healing working with the body's bioplasmic field (aura) and chakras along the spine. Techniques include scanning for congestion/depletion, sweeping (cleansing), and energizing (projecting prana).", history: "Systematized by Master Choa Kok Sui (Philippines, 1987). Draws from Indian Pranic concepts, Chinese Qi Gong, and Theosophical tradition. Now practiced in 120+ countries.", mechanism: "Theory: disease manifests first in energy body before physical body. Spine chakras (7 major) when congested or depleted affect corresponding vertebral segments. Clearing energy body supports physical healing.", spineIndications: ["Stress/emotional back pain", "Energy depletion", "Post-treatment energy restoration", "Psychosomatic spine conditions", "Chronic pain with emotional component", "Maintenance and prevention"], contraindications: ["Not a substitute for medical treatment (complementary only)", "Psychiatric conditions (modified approach)", "Critical/emergency conditions (refer to medical care first)"], measureTools: [{ name: "VAS Pain Scale", how: "Before/after energy healing session", frequency: "Every session" }, { name: "Chakra Activity Score", how: "Practitioner scanning — document size/congestion/depletion per chakra", frequency: "Every session" }, { name: "Stress/Anxiety Scale (GAD-7)", how: "Patient questionnaire", frequency: "Baseline + monthly" }], ayushIntegration: "Pranic concepts directly parallel Ayurvedic Prana Vayu/Ojas/Tejas framework. 7 Chakras = 7 key Marma clusters along spine. Energy sweeping = Marma-based Pranic cleansing. Combine with Yoga Pranayama for self-practice.", doctorProtocol: [{ title: "Spine Chakra Assessment & Treatment", content: "Scan 7 major chakras along spine for congestion or depletion. Treat accordingly.", steps: ["Scan: hands 4-6 inches from body, feel for heat/cold/tingling/heaviness along spine", "Root (L5-Coccyx): security, stability — congested = chronic pain/fear", "Sacral (L1-L3): creativity, reproduction — depleted = weakness", "Solar Plexus (T12-T8): power, digestion — congested = tension/anger", "Heart (T1-T4): emotions, respiration — depleted = upper back pain", "Throat (C4-C7): communication — congested = neck stiffness", "Treatment: SWEEP congested chakras (hand flicking away from body) × 30 sweeps", "ENERGIZE depleted chakras (project prana from palms) × 2-3 minutes"] }], patientSelfCare: [{ title: "Self Energy Hygiene for Spine (5 min)", content: "Basic energy self-care to keep spine chakras clear and balanced.", steps: ["Stand or sit quietly, close eyes", "Visualize bright white/golden light entering crown of head", "Guide this light DOWN your spine slowly — illuminating each vertebra", "Where you feel pain/heaviness: visualize light dissolving the darkness", "Continue light all the way to tailbone (coccyx)", "Exhale and visualize grey/dirty energy leaving through feet into earth", "Finish: 3 deep breaths, feeling spine light and energized"], safetyNote: "This is visualization/meditation — completely safe. Combine with physical treatments for best results." }, { title: "Twin Hearts Meditation (Spine Focus)", content: "Modified meditation activating heart and crown chakras — floods spine with healing energy.", steps: ["Sit comfortably, spine upright", "Focus on heart center (mid-chest) — feel love/compassion for 2 minutes", "Focus on crown (top of head) — feel connection to universal energy 2 minutes", "Visualize golden light flowing from crown DOWN through entire spine", "At each vertebral level: pause and project love/healing to that segment", "Continue to coccyx, then let energy flow into earth", "Rest in stillness 1 minute", "Total: 10-15 minutes, morning or evening"], safetyNote: "If dizziness or headache: stop and rest. Ground yourself by pressing feet firmly to floor." }], combinationProtocols: [{ condition: "Stress-Related Chronic Back Pain", plan: "Pranic healing sessions (weekly) + Shirodhara + Meditation instruction + Yoga + Patient daily spine energy visualization" }, { condition: "Emotional Component to Pain", plan: "Pranic chakra clearing + Counseling + Basti karma (Vata) + Ashwagandha + Patient Twin Hearts daily" }], sop: { preparation: ["Assess patient's openness to energy-based therapy (explain mechanism simply)", "Room: quiet, clean, comfortable temperature, no electronic interference", "Practitioner preparation: invoke/pray, clean own energy field first", "Patient seated or lying comfortably — no need to undress", "Prepare: alcohol spray for hand clearing, salt/water bowl for disposal"], execution: ["SCANNING: Hands 4-6 inches from body, scan spine from coccyx to crown", "Document: areas of congestion (heat/heaviness) and depletion (coolness/emptiness)", "SWEEPING: Hand flick movements to remove congested energy (30-50 sweeps per area)", "Spray alcohol on hands between sweeps (cleans absorbed energy)", "ENERGIZING: Project fresh Prana from palms to depleted areas (2-3 min per chakra)", "Focus on affected spine chakras: Root (lumbar), Solar Plexus (thoracic), Throat (cervical)", "STABILIZING: 'seal' the treated chakras by projecting blue light (30 sec per area)", "Total session: 30-45 minutes"], postProcedure: ["Patient rests 5-10 min (energy integration)", "Offer water to drink (grounding)", "Ask patient about sensations during treatment (warmth, tingling, emotional release)", "Record VAS after treatment", "Teach basic self-energy hygiene for home", "Schedule: weekly for 4-6 sessions, then monthly maintenance"], documentation: ["Chakras scanned and findings (congested/depleted/normal)", "Sweeping and energizing performed (duration per area)", "Patient's subjective experience during session", "VAS before and after", "Emotional releases if any (tears, anxiety, peace)"], safetyChecks: ["NEVER replace medical treatment — this is complementary only", "Refer red flags to medical team immediately", "If patient becomes very emotional: provide support, don't suppress", "Practitioner: clear own energy after each session (self-care)", "Do not make diagnosis based on energy findings alone", "Ground patient fully before leaving (feet press to floor, drink water)"] }, equipment: [{ name: "Treatment Couch (comfortable)", cost: "₹15,000-30,000", essential: true, notes: "Patient lies comfortably for 30-45 min. Or seated chair." }, { name: "Alcohol Spray Bottle (70%)", cost: "₹100-200", essential: true, notes: "Spray on hands between sweeps to clear absorbed energy." }, { name: "Salt + Water Bowl", cost: "₹50", essential: true, notes: "For disposing of swept negative energy. Replace water after each session." }, { name: "Quiet Room (no electronics)", cost: "Variable", essential: true, notes: "Minimize electronic interference. Soft lighting." }, { name: "Crystal (clear quartz, optional)", cost: "₹500-2,000", essential: false, notes: "Used by some practitioners for energy direction. Not essential." }], sessionChecklist: [{ step: "Patient openness confirmed (willing to try)", category: "Pre" }, { step: "VAS recorded (before)", category: "Pre" }, { step: "Practitioner self-preparation done", category: "Pre" }, { step: "Scanning performed (all spine chakras)", category: "Procedure" }, { step: "Congestion/depletion documented", category: "Procedure" }, { step: "Sweeping performed (30-50 per area)", category: "Procedure" }, { step: "Energizing projected (2-3 min per depleted area)", category: "Procedure" }, { step: "Stabilizing done (blue light sealing)", category: "Procedure" }, { step: "Patient rested 5-10 min", category: "Post" }, { step: "VAS recorded (after)", category: "Post" }, { step: "Patient experience documented", category: "Post" }, { step: "Self-care visualization taught", category: "Post" }, { step: "Practitioner self-clearing performed", category: "Post" }], pricing: { perSession: 800, packageOptions: [{ name: "Trial (3 sessions)", sessions: 3, price: 2100, savings: "₹300 off" }, { name: "Standard (6 sessions)", sessions: 6, price: 4200, savings: "₹600 off" }, { name: "Combo: Pranic + Shirodhara (4)", sessions: 4, price: 4000, savings: "₹1,200 off (premium)" }], breakEven: "3 patients/day × 25 days = 75 sessions × ₹800 = ₹60,000/month. Zero consumable cost.", revenuePerMonth: "Target: 40-60 sessions/month = ₹32,000-48,000 (niche market)", competitorComparison: "Reiki/Energy healing: ₹1000-3000. Pranic at ₹800 is structured and systematic — more credible." }, training: [{ level: "Beginner", hours: "16-20 hours", certification: "Basic Pranic Healing Certificate", books: ["Choa Kok Sui — Miracles Through Pranic Healing"], courses: ["MCKS Basic Pranic Healing (2 days)", "World Pranic Healing Foundation Course"], skills: ["Scanning technique", "Sweeping (general + localized)", "Basic energizing", "Self-healing protocol"] }, { level: "Intermediate", hours: "40-60 hours", certification: "Advanced Pranic Healing + Psychotherapy", books: ["Choa Kok Sui — Advanced Pranic Healing", "Choa Kok Sui — Pranic Psychotherapy"], courses: ["Advanced Pranic Healing (2 days)", "Pranic Psychotherapy (2 days)"], skills: ["Color pranic healing", "Emotional/psychological conditions", "Organ-specific healing", "Chakra repair techniques"] }, { level: "Advanced", hours: "100+ hours", certification: "Pranic Healing Instructor / Arhatic Yoga", books: ["Choa Kok Sui — Pranic Crystal Healing", "Arhatic Yoga materials"], courses: ["Pranic Crystal Healing", "Arhatic Yoga (spiritual development)", "Instructor Training"], skills: ["Crystal healing integration", "Advanced spiritual practices", "Teaching/certification", "Running healing center"] }] },
  16: { title: "Tibb-e-Nabawi (Islamic Healing)", origin: "Arabia / Islamic Golden Age (7th-14th Century CE)", icon: "🕌", category: "Traditional System", evidenceLevel: "Moderate (Hijama RCTs exist, Prophetic herbs validated)", evidenceScore: 65, overview: "Tibb-e-Nabawi (Prophetic Medicine) is a comprehensive healing system based on the teachings of Prophet Muhammad (PBUH) and scholars of the Islamic Golden Age. For spine conditions, it integrates Hijama (cupping), herbal remedies, Salah (prayer) postures as corrective exercise, spiritual healing (Ruqyah), and lifestyle practices. Unani medicine (Greco-Arabic medical tradition) provides the clinical framework.", history: "Rooted in Hadith literature (Sahih Bukhari, Muslim, Tirmidhi). Systematized by scholars: Ibn Sina (Avicenna - Canon of Medicine, 1025 CE), Al-Razi (Rhazes), Ibn Al-Qayyim (Tibb-e-Nabawi compilation, 14th CE). Hijama specifically mentioned by the Prophet as a recommended treatment.", mechanism: "Hijama: creates negative pressure → micro-trauma → inflammation cascade → fresh blood flow → waste removal → pain reduction. Prophetic herbs (black seed, costus): validated anti-inflammatory pathways (NF-kB suppression). Salah postures: biomechanically align spine 5× daily. Spiritual practices: cortisol reduction via meditation-like dhikr states.", spineIndications: ["Chronic low back pain (lumbar Hijama + black seed)", "Cervical spondylosis (Kahil point cupping + neck exercises in Salah)", "Sciatica / Irq un-Nasa (sacral + lumbar Hijama)", "Muscle spasm (Costus oil massage + dry cupping)", "Stress-related spine tension (Adhkar + breathing)", "Disc degeneration (fasting-induced autophagy + Hijama)", "Postural dysfunction (Salah corrective sequence 5×/day)", "Post-treatment maintenance (lifestyle + nutrition)"], contraindications: ["Severe anemia (wet Hijama)", "Blood thinners / anticoagulant therapy (wet Hijama)", "Pregnancy (certain points)", "Skin infection at cupping site", "Extreme fatigue or fasting day (defer Hijama)", "Diabetic neuropathy at site (reduce suction)"], measureTools: [{ name: "VAS Pain Scale (0-10)", how: "Before and after each Hijama session and weekly for ongoing therapies", frequency: "Every session + weekly" }, { name: "Hijama Point Tenderness Score", how: "Palpate each Sunnah point — rate 0 (no tenderness) to 3 (severe)", frequency: "Every Hijama session" }, { name: "Cup Mark Color Assessment", how: "Dark purple = severe stagnation, Light pink = mild. Track color change over sessions", frequency: "Every wet cupping session" }, { name: "ROM (Range of Motion)", how: "Measure cervical/lumbar flexion-extension before and after treatment", frequency: "Baseline + biweekly" }, { name: "Salah Posture Quality Score", how: "Observe patient performing Salah — rate spinal alignment in each position", frequency: "Baseline + monthly" }], ayushIntegration: "Hijama parallels Raktamokshana (Ayurvedic bloodletting) for Pitta-Rakta disorders. Nutool (Unani warm oil irrigation) = Kati Basti. Unani Mizaj assessment = Prakriti. Al-Kaiy (cauterization) = Agnikarma. Salah postures = Yoga asanas. Dhikr/Ruqyah = Meditation/Mantra therapy. Black seed (Nigella sativa) validated in both Unani and modern pharmacology.", doctorProtocol: [{ title: "Hijama Sunnah Points for Spine", content: "6 key cupping points based on Prophetic tradition and clinical effectiveness for spine conditions.", steps: ["1. KAHIL (C7-T1 junction / Dazhui area) — THE primary Sunnah point. Between shoulders. Treats: cervical pain, headache, upper back, energy depletion. Hadith: Prophet was cupped here.", "2. AL-AKHDA'AIN (bilateral jugular/SCM area) — Sides of neck. Treats: cervicogenic headache, neck stiffness, dizziness, Greeva Stambha. Hadith: Prophet was cupped on both sides.", "3. NAQRAH (suboccipital / Fengfu area) — Nape of neck. Treats: posterior headache, vertigo, cervical spondylosis, occipital neuralgia.", "4. LUMBAR ZONE (L3-L5 paravertebral) — Bilateral cupping. Treats: low back pain, disc bulge, Kati Shoola, sciatica origin.", "5. SACRAL POINTS (S1-S3 / Baliao area) — Over sacral foramina. Treats: sacroiliac pain, coccydynia, pelvic pain, sciatic radiation.", "6. YAFOOKH (crown of head / Baihui area) — Top of skull. Treats: general neurological balance, CSF regulation, chronic headache, memory. Hadith: Prophet was cupped here for migraine."], tips: "For spine patients: combine KAHIL + affected level (lumbar OR sacral). Space sessions 2-4 weeks apart. Sunnah days: Monday/Tuesday/Thursday. Best: 17th, 19th, 21st of Islamic month." }, { title: "Prophetic Herbal Prescriptions for Spine", content: "Evidence-based Prophetic herbs with specific spine applications.", steps: ["HABBATUS SAUDA (Nigella sativa / Black Seed): 1 tsp oil or crushed seeds 2x/day. Anti-inflammatory (NF-kB, COX-2 inhibition). For disc inflammation, nerve pain, general immunity.", "COSTUS (Qust al-Hindi / al-Bahri): Inhale steam or apply as oil externally. Anti-spasmodic for paraspinal muscle spasm. Apply warm on painful area with olive oil.", "OLIVE OIL (Zaitoon): External massage along spine before sleep. Internal: 1 tbsp morning empty stomach. Anti-inflammatory, nourishes nerves.", "HONEY (Shahad): 1 tbsp in warm water morning. Systemic anti-inflammatory, immune modulation, wound healing support.", "HENNA (Mehndi): Apply paste on inflamed vertebral area — cooling, anti-inflammatory poultice. Leave 30-60 min.", "SANA MAKKI (Senna): For bowel regulation — critical for disc patients (straining worsens herniation). Small dose before bed.", "TALBINA (Barley porridge): For chronic pain patients with depression/fatigue. Serotonin precursor. Daily breakfast.", "AJWA DATES (7 morning): Calcium, magnesium, potassium for bone health. Hadith: protective benefits."] }, { title: "Unani Clinical Framework (Mizaj)", content: "Assess the temperament of the spine condition to guide treatment selection.", steps: ["HOT condition (Haar): inflammation, redness, acute pain, fever — Treat with COLD therapies: Henna poultice, cold Hijama, cucumber, sandal oil", "COLD condition (Baarid): chronic stiffness, dull ache, worse in morning/winter — Treat with HOT therapies: warm Hijama, Costus, ginger oil, black seed", "WET condition (Ratab): swelling, edema, heavy feeling — Treat with DRY therapies: dry cupping, fasting, Sana Makki (drying)", "DRY condition (Yabis): degenerative, crackling, thin disc — Treat with WET therapies: olive oil massage, Talbina, hydration, honey", "Most spine conditions in working adults: COLD + DRY (degeneration) — treat with warming + nourishing: Hijama + olive oil + black seed + Talbina"] }, { title: "Salah Postures as Corrective Exercise Prescription", content: "Prescribe mindful Salah performance as a 5x/day spinal corrective routine.", steps: ["QIYAM (Standing): instruct patient to stand with feet hip-width, weight evenly distributed, spine neutral, chin slightly tucked. Builds postural awareness.", "RUKU (Bowing ~90 degrees): hip hinge with flat back. Stretches hamstrings + erector spinae. Decompresses lumbar.", "SUJOOD (Prostration): semi-inversion. Blood flow to brain. Cervical gentle traction. L5-S1 flexion stretch. Stretches thoracolumbar fascia.", "JULOOS (Sitting between sajdah): hip external rotation + flexor stretch. Opens SI joint. Stretches piriformis = anti-sciatica.", "TASHAHHUD (Final sitting / Tawarruk): deep hip rotation variation. Sustained stretch for hip capsule and piriformis.", "TASLEEM (Turning head right/left): cervical rotation. Maintains neck ROM. Prevents stiffness.", "Prescribe: perform Salah with FULL awareness of spine alignment. 5x daily = 25-35 min/day automatic corrective exercise."] }], patientSelfCare: [{ title: "Daily Prophetic Spine Care Routine", content: "Simple daily practices from Sunnah that support spine health.", steps: ["MORNING: 7 Ajwa dates + 1 tsp black seed with honey.", "SLEEP POSITION: Right side (Sunnah). Avoid stomach sleeping. Pillow between knees.", "EATING: 1/3 food, 1/3 water, 1/3 air (prevents obesity).", "WALKING: Walk to masjid for prayers when possible.", "OLIVE OIL: Apply warm olive oil along spine before sleep. Gentle self-massage 5 minutes.", "WUDU: Perform ablution mindfully — bending/stretching 5x/day keeps joints mobile.", "EARLY SLEEP: Sleep after Isha prayer. 7-8 hours quality sleep = disc rehydration."], safetyNote: "These are general wellness practices. Continue your prescribed medical treatment alongside." }, { title: "Healing Duas for Spine Pain", content: "Spiritual healing practices — recite with hand placed on painful area of spine.", steps: ["Place right hand on the painful area of your spine.", "Recite Bismillah 3 times.", "Then recite 7 times: A'udhu billahi wa qudratihi min sharri ma ajidu wa uhadhiru.", "Surah Al-Fatiha: recite once with intention of healing (Ruqyah).", "Morning/Evening Adhkar: maintain daily routine — reduces anxiety/cortisol.", "Sabr (patience) mindset: understand pain as a test (ibtila) — reframing reduces catastrophizing.", "Tawakkul (trust): after taking all medical means, trust the outcome to Allah."], safetyNote: "Spiritual healing is COMPLEMENTARY — not a replacement for medical treatment." }, { title: "Self-Hijama (Dry Cupping) at Home", content: "Safe dry cupping you can do at home with silicone cups.", steps: ["Purchase: silicone cupping set (available at pharmacy/online).", "Apply olive oil on upper back or lumbar area.", "Squeeze silicone cup and place on paravertebral muscle (not directly on bone/spine).", "Leave for 5-7 minutes maximum. Should feel pull but NOT pain.", "Remove gently. Wipe area with warm cloth.", "Frequency: 2-3x per week for muscle tension.", "AVOID: wet cupping at home. Only dry cupping self-use.", "After: drink warm water, rest 15 minutes."], safetyNote: "ONLY dry cupping at home. Wet cupping (Hijama with bloodletting) MUST be done by a trained professional." }], combinationProtocols: [{ condition: "Chronic Low Back Pain (Muslim Patient)", plan: "Hijama (lumbar + Kahil) biweekly x 6 + Black seed oil 2x/day + Mindful Salah + Olive oil massage nightly + Kati Basti weekly + Corrective exercises" }, { condition: "Cervical Spondylosis", plan: "Hijama Kahil + Akhda'ain monthly + Costus oil neck massage + Nasya + Mindful Salah (Ruku focus) + Greeva Basti + Physiotherapy" }, { condition: "Sciatica (Irq un-Nasa)", plan: "Hijama sacral + lumbar biweekly + Black seed + honey daily + Sujood/Tashahhud stretches + Tikta Ksheer Basti + Walking program" }], sop: { preparation: ["Assess Mizaj (temperament): Hot/Cold/Wet/Dry of the spine condition", "Screen: anemia (hemoglobin check for wet Hijama), anticoagulants, pregnancy", "Prepare Hijama equipment: cups, pump, sterile blades, antiseptic, bandages, gloves", "Prepare herbs: black seed oil, costus, olive oil, honey as applicable", "Patient in comfortable position (prone for lumbar Hijama)", "Confirm Sunnah timing: Monday/Tuesday/Thursday preferred; 17th/19th/21st of Islamic month ideal"], execution: ["Clean target area with antiseptic", "Apply oil to skin for cup seal", "DRY CUP first: 3 min on each Sunnah point (Kahil + affected level)", "Remove dry cups — make superficial scratches with sterile blade (for wet Hijama)", "Reapply cups on scratched area: 3-5 min (blood drawn into cup)", "Remove cups, clean with antiseptic, bandage", "Prescribe Prophetic herbs based on Mizaj assessment", "Teach mindful Salah posture corrections", "Total session: 30-45 min (Hijama) + 10 min herbal counseling"], postProcedure: ["Sites cleaned and bandaged (change next day)", "Advise: keep sites dry 24 hrs, avoid hot bath/shower", "Drink warm honey water immediately post-Hijama", "Record cup mark colors (diagnostic)", "Record VAS after treatment", "Next session: 2-4 weeks depending on condition severity", "Provide herbal prescription and Salah posture corrections"], documentation: ["Sunnah points treated (mark on body diagram)", "Cup mark colors per site (1-5 darkness scale)", "Approximate blood volume per site", "Mizaj assessment findings", "VAS before and after", "Herbs prescribed", "Salah corrections given"], safetyChecks: ["NEVER wet-cup patients on anticoagulants", "Check hemoglobin before wet cupping (Hb > 11 required)", "Use ONLY sterile single-use blades", "Dispose all sharps in biohazard container", "Monitor for excessive bleeding (press + elevate if needed)", "If patient faints: recline, legs elevated, cold compress on forehead"] }, equipment: [{ name: "Hijama Cup Set (plastic + pump)", cost: "₹2,000-4,000", essential: true, notes: "Vacuum cups with adjustable suction. Various sizes." }, { name: "Sterile Surgical Blades (box of 50)", cost: "₹300-500", essential: true, notes: "Single-use only. For wet cupping skin incisions." }, { name: "Antiseptic Solution (Betadine/Chlorhex)", cost: "₹200-400", essential: true, notes: "Pre and post procedure cleaning." }, { name: "Nitrile Gloves (box)", cost: "₹400/100", essential: true, notes: "Blood contact — mandatory PPE." }, { name: "Bandages + Cotton Pads", cost: "₹200-300", essential: true, notes: "Post-procedure wound care." }, { name: "Sharps/Biohazard Bin", cost: "₹200-400", essential: true, notes: "Safe blade disposal." }, { name: "Black Seed Oil (Habbatus Sauda)", cost: "₹300-600", essential: true, notes: "For prescription. Cold-pressed, organic." }, { name: "Costus (Qust al-Hindi)", cost: "₹200-400", essential: false, notes: "Powder or oil form. Anti-spasmodic." }, { name: "Olive Oil (extra virgin)", cost: "₹300-500", essential: true, notes: "External massage + internal prescription." }, { name: "Raw Honey (natural)", cost: "₹500-800", essential: true, notes: "Post-Hijama recovery. Anti-inflammatory." }], sessionChecklist: [{ step: "Mizaj assessed (Hot/Cold/Wet/Dry)", category: "Pre" }, { step: "Hemoglobin confirmed adequate (wet cupping)", category: "Pre" }, { step: "Contraindications screened", category: "Pre" }, { step: "VAS recorded (before)", category: "Pre" }, { step: "Consent for wet cupping obtained", category: "Pre" }, { step: "Sunnah points identified and cleaned", category: "Procedure" }, { step: "Dry cupping applied (3 min per point)", category: "Procedure" }, { step: "Superficial incisions made (sterile blade)", category: "Procedure" }, { step: "Wet cups applied (3-5 min)", category: "Procedure" }, { step: "Cups removed, sites cleaned and bandaged", category: "Post" }, { step: "Cup mark colors recorded", category: "Post" }, { step: "VAS recorded (after)", category: "Post" }, { step: "Herbs prescribed (black seed, olive oil, etc.)", category: "Post" }, { step: "Salah posture corrections taught", category: "Post" }, { step: "Aftercare instructions given (keep dry 24 hrs)", category: "Post" }, { step: "Next session scheduled (2-4 weeks)", category: "Post" }], pricing: { perSession: 1200, packageOptions: [{ name: "Single Hijama Session", sessions: 1, price: 1200, savings: "Includes all materials" }, { name: "Course (4 sessions, monthly)", sessions: 4, price: 4000, savings: "₹800 off" }, { name: "Hijama + Herbal Package (6)", sessions: 6, price: 6000, savings: "₹1,200 off + herbs included" }, { name: "Dry Cupping Only", sessions: 1, price: 600, savings: "Non-invasive option" }], breakEven: "3 patients/day × 25 days = 75 sessions × ₹1200 = ₹90,000/month. Higher consumable cost but strong demand.", revenuePerMonth: "Target: 50-75 sessions/month = ₹60,000-90,000", competitorComparison: "Hijama centers: ₹500-1500. Clinical Hijama with Unani assessment + AYUSH integration at ₹1200 is premium + differentiated." }, training: [{ level: "Beginner (Dry Cupping)", hours: "20-30 hours", certification: "Certificate in Cupping / Hijama Foundation", books: ["Ibn Al-Qayyim — Tibb-e-Nabawi (English translation)", "AlBedah — Clinical Hijama Guide"], courses: ["Hijama Foundation Certificate", "Basic Cupping Therapy Course"], skills: ["Dry cupping technique", "Sunnah point identification", "Mizaj assessment basics", "Safety and contraindications"] }, { level: "Intermediate (Wet Hijama)", hours: "60-100 hours", certification: "Certified Hijama Therapist / BUMS integration", books: ["Ibn Sina — Canon of Medicine (spine sections)", "Modern Hijama Research Compilation"], courses: ["Wet Cupping Certification (sterile technique)", "Unani Spine Treatment Course"], skills: ["Wet cupping sterile technique", "All 6 Sunnah spine points", "Herbal prescribing (black seed, costus, honey)", "Salah posture prescription"] }, { level: "Advanced", hours: "200+ hours (BUMS degree component)", certification: "Unani Medicine Practitioner / Hijama Specialist", books: ["Unani Pharmacopoeia", "Research: AlBedah, Aboushanab RCTs"], courses: ["BUMS (Unani Medicine degree)", "Hijama Instructor Training"], skills: ["Full Unani assessment + treatment", "Teaching/certification", "Research competency", "Complex chronic pain (Unani + AYUSH)"] }] },
  17: { title: "Law of Attraction (The Secret)", origin: "Universal / Modern (Rhonda Byrne, 2006)", icon: "🌟", category: "Mind-Body / Belief-Based", evidenceLevel: "Emerging (placebo neuroscience, belief-healing research)", evidenceScore: 50, overview: "The Law of Attraction, popularized by 'The Secret' (Rhonda Byrne), states that focused thought combined with elevated emotion creates physical reality. For spine healing, this translates to: your dominant thoughts about your spine BECOME your physical experience. Patients trapped in pain-focused thinking reinforce neural pain pathways. Shifting to healing-focused thought patterns (affirmations, visualization, gratitude, scripting) activates placebo neuroscience — measurably reducing pain and accelerating tissue repair.", history: "Concepts trace to New Thought movement (1800s), Neville Goddard, Napoleon Hill (Think and Grow Rich). Popularized globally by Rhonda Byrne's 'The Secret' (2006, 300M+ copies). Scientific backing from: placebo research (Harvard), neuroplasticity studies (Schwartz), psychoneuroimmunology (Ader & Cohen), and belief-healing connection (Langer, Benedetti).", mechanism: "Three validated mechanisms: 1) EXPECTATION EFFECT: Believing you will heal activates endorphin release, reduces cortisol, and upregulates healing genes (Benedetti 2014). 2) NEUROPLASTICITY: Repeated positive thought patterns literally rewire pain circuits in the brain (Moseley 2007). 3) PSYCHONEUROIMMUNOLOGY: Emotional states directly modulate inflammatory cytokines — gratitude and joy suppress TNF-alpha and IL-6 (Irwin 2015). The 'Ask-Believe-Receive' framework gives patients a simple structure to access these mechanisms.", spineIndications: ["Chronic pain with negative belief patterns / catastrophizing", "Patients stuck in 'pain identity' (I AM a back pain person)", "Fear-avoidance behavior (afraid to move)", "Low motivation for exercise/treatment compliance", "Failed multiple treatments (belief system needs resetting)", "Adjunct to ALL physical spine treatments (amplifies outcomes)", "Central sensitization (brain-mediated pain amplification)", "Depression/anxiety comorbid with spine pain"], contraindications: ["Not a substitute for structural pathology requiring surgery", "Delusional disorders (careful framing needed)", "Patients who reject the concept (forcing creates resistance)", "Use ALONGSIDE medical treatment, never instead of it"], measureTools: [{ name: "VAS Pain Scale (0-10)", how: "Track before/after implementing LOA practices daily", frequency: "Daily for 30 days" }, { name: "Healing Belief Score (1-10)", how: "Ask patient: On a scale of 1-10 how strongly do you BELIEVE your spine will fully heal?", frequency: "Baseline + weekly" }, { name: "Pain Catastrophizing Scale (PCS)", how: "13-item questionnaire measuring rumination, magnification, helplessness", frequency: "Baseline + monthly" }, { name: "Treatment Compliance Rate", how: "Track if LOA-engaged patients attend more sessions and do more homework", frequency: "Monthly" }, { name: "Patient Activation Measure (PAM)", how: "Measures patient knowledge, skill, confidence for self-management", frequency: "Baseline + monthly" }], ayushIntegration: "Law of Attraction aligns with: SANKALPA (intention/resolve) in Yoga Nidra, BHAVANA (creative visualization) in Ayurvedic Manasika Chikitsa, PRATIPAKSHA BHAVANA (replacing negative thoughts with positive — Yoga Sutra 2.33), and Joe Dispenza's meditation work (already in your system). Combine LOA daily practices with Dispenza's neuroscience framework for maximum mind-body healing.", doctorProtocol: [{ title: "Healing Belief Assessment & Intervention", content: "Assess and address the patient's belief system about their spine condition. Low belief = poor outcomes regardless of treatment quality.", steps: ["ASK: 'On a scale of 1-10, how strongly do you believe your spine CAN fully heal?' Record score.", "If score 1-4 (LOW BELIEF): Address first before any treatment. Say: 'Your belief directly affects your biology. Let me show you why healing is possible for you.'", "Show examples: share 3 cases of similar patients who recovered. Use before/after images if available.", "REFRAME their diagnosis: Instead of 'You have degenerative disc disease' say 'Your discs are currently dehydrated but can be rehydrated with the right approach.'", "LANGUAGE MATTERS: Never use permanence language (always, never, chronic). Use progress language (improving, regenerating, healing).", "Reassess belief score after 2 weeks of LOA practices. Target: move to 7+ before advancing treatment intensity."], tips: "A patient with belief score 8/10 receiving basic treatment will often outperform a patient with belief score 3/10 receiving the best treatment. Belief is the multiplier." }, { title: "Affirmation Prescription (Condition-Specific)", content: "Prescribe specific healing affirmations tailored to the patient's spine condition. These are repeated daily to reprogram the subconscious belief system.", steps: ["DISC HERNIATION: 'My L4-L5 disc is rehydrating and returning to its normal position. Every day it heals a little more.'", "SCIATICA: 'The nerve inflammation in my leg is reducing. My sciatic nerve is calming down and functioning normally.'", "CERVICAL SPONDYLOSIS: 'My neck is becoming more flexible and comfortable every day. The vertebrae in my neck are well-nourished and strong.'", "CHRONIC LOW BACK PAIN: 'My lower back is strong, stable, and pain-free. I trust my spine to support me fully.'", "GENERAL: 'Every cell in my spine is regenerating. I am healing faster than I expect. My body knows how to heal itself.'", "PRESCRIPTION: Write 3 affirmations on prescription pad. Patient reads aloud: 10x morning (upon waking), 10x evening (before sleep). Minimum 21 days."], tips: "Affirmations MUST be in present tense (not 'I will heal' but 'I AM healing'). Must feel believable — if patient cant believe it, start softer: 'I am open to the possibility that my spine can heal.'" }, { title: "Pain Story Interruption Protocol", content: "Many chronic pain patients unconsciously reinforce their pain by repeatedly telling their 'pain story' to family, friends, and doctors. Each retelling strengthens neural pain circuits.", steps: ["IDENTIFY: Ask patient 'How many times per day do you talk about or think about your pain? To how many people?'", "EXPLAIN: 'Every time you describe your pain in detail, your brain fires the same pain circuits. You are literally practicing pain.'", "INTERRUPT: Give patient a replacement script. When someone asks 'How's your back?' instead of describing pain, say: 'It's improving. I'm doing new things that are helping.'", "REDIRECT: When catching themselves thinking about pain, use pattern interrupt: touch a specific spot on their hand (anchor) and immediately think of their healing affirmation.", "SOCIAL MEDIA: Suggest unfollowing chronic pain groups/forums. These normalize and reinforce pain identity.", "NEW IDENTITY: Help patient shift from 'I am a person with back pain' to 'I am a person who is healing.'"], tips: "This is NOT about denying pain exists. It's about not AMPLIFYING it through repetition. Acknowledge → but don't dwell." }, { title: "Vision Board Prescription", content: "Prescribe creating a physical or digital vision board showing their healed future life. The brain cannot distinguish between vivid imagination and reality.", steps: ["ASSIGN as homework: 'Create a vision board showing your life with a completely healed spine.'", "INCLUDE images of: themselves being active (hiking, playing with kids, sports), standing with perfect posture, traveling, doing work without pain", "ADD text: their top 3 affirmations written on the board", "PLACEMENT: Where they see it first thing every morning and last thing at night", "INSTRUCTION: Look at the board for 2 minutes morning and evening. FEEL the emotions of already having that life.", "DIGITAL option: Set as phone wallpaper / screensaver. See it 50+ times per day.", "Review at next appointment: discuss how it makes them feel. Adjust if needed."] }, { title: "369 Method for Spine Healing", content: "The 369 manifestation method (attributed to Nikola Tesla's number significance): Write your healing intention 3 times in morning, 6 times in afternoon, 9 times before bed. The repetition programs the subconscious.", steps: ["CHOOSE one powerful statement: e.g., 'My spine is completely healed and I move with total freedom.'", "MORNING (within 17 seconds of waking): Write it 3 times by hand in a journal.", "AFTERNOON: Write the same statement 6 times.", "EVENING (before sleep): Write it 9 times.", "KEY: While writing, FEEL the emotion of it being true. Feeling is the fuel.", "DURATION: Minimum 33 days (3+6+9 = 18 → some say 33 or 45 days for physical body changes).", "IMPORTANT: Do not share with skeptics who might diminish your belief."] }], patientSelfCare: [{ title: "Morning LOA Routine for Spine (5 min)", content: "Start every day programming your mind for healing. Do this before checking phone or getting out of bed.", steps: ["1. GRATITUDE (1 min): While still lying down, say 'Thank you for my healing spine. Thank you for this new day of improvement.'", "2. AFFIRMATIONS (2 min): Repeat your 3 prescribed affirmations 5 times each. FEEL them as you say them.", "3. VISUALIZATION (2 min): Close eyes. See yourself moving freely today — bending, walking, sitting without pain. Make it vivid. Feel the freedom.", "4. DECISION: 'Today I choose to focus on healing, not on pain. I am getting better every single day.'", "5. GET UP with the energy and posture of your HEALED self. Walk to bathroom as if your spine is already perfect."], safetyNote: "This is a mindset practice — continue all prescribed physical treatments and exercises alongside." }, { title: "Vibration Check & Elevation (Throughout Day)", content: "Your emotional state (vibration) directly affects inflammation and healing speed. Monitor and elevate throughout the day.", steps: ["Set 3 phone alarms (10am, 2pm, 7pm) labeled 'Vibration Check'.", "When alarm rings: Rate your emotional state 1-10. (1=depressed/fearful, 10=joyful/grateful)", "If below 6: ELEVATE immediately using one of these:", "— Listen to a song that makes you happy (2 min)", "— Think of 3 things you're grateful for right now", "— Watch a funny video (laughter = instant vibration boost)", "— Go outside and feel sunlight on your face", "— Text someone you love and say something kind", "TARGET: Stay above 6/10 for most of the day. Above 7 = healing accelerates.", "LOG: Write your average daily vibration in your journal. Watch it rise over weeks."], safetyNote: "Low days are normal. Don't judge yourself. Just notice and gently elevate." }, { title: "Scripting Your Healed Future (Evening, 5 min)", content: "Write a journal entry AS IF you are already completely healed. Write in present tense, past tense about the journey, with gratitude.", steps: ["Open journal. Date it 6 months from today.", "Write: 'I am so grateful that my spine has completely healed. I remember when I used to have pain in my [area], and now it's just a memory.'", "Describe your day in detail: 'Today I woke up feeling amazing. I stretched with ease. I went for a long walk. I played with my children. I sat through a 3-hour meeting with zero discomfort.'", "Include EMOTIONS: 'I feel so free, so strong, so grateful. I can't believe how different my life is now.'", "Include SPECIFIC activities you couldn't do before but now can.", "Read it back to yourself. Let the emotions wash over you.", "Close the journal and release it — trust the process."], safetyNote: "This is not denial of current reality. It's CREATING a template for your brain to build toward. Athletes use this exact technique." }, { title: "Stop the Pain Story (Daily Awareness)", content: "Track and reduce how often you talk about, think about, or identify with your pain.", steps: ["DAY 1-3: Just NOTICE how often you mention your back pain to others. Count it. No judgment.", "DAY 4-7: Each time you catch yourself about to describe pain, PAUSE. Ask: 'Is this helping me heal?'", "REPLACEMENT: When asked 'How's your back?' respond with: 'Improving! I'm trying some new things.' (Even if progress is small)", "SOCIAL: Stop discussing pain in detail with friends/family. They mean well but sympathy reinforces the identity.", "INNER TALK: When you catch a pain thought, say 'Cancel, cancel' and replace with your affirmation.", "ADVANCED: Start telling a NEW story: 'I used to have back pain but I'm healing beautifully now.'", "21 DAYS: After 21 days of consistent story-change, your brain starts to believe the new narrative."], safetyNote: "You can still report symptoms accurately to your DOCTOR — this is about social/inner narrative, not medical reporting." }], combinationProtocols: [{ condition: "Chronic Pain + Catastrophizing", plan: "Healing Belief Assessment first → Affirmation Rx → Pain Story Interruption → Dispenza Open Focus meditation → Corrective exercises → Monthly belief score tracking. Target: PCS reduction + VAS reduction simultaneously." }, { condition: "Failed Multiple Treatments (Belief Issue)", plan: "369 Method (33 days) + Vision Board + Morning LOA routine + Vibration tracking + ONE simple physical treatment (walking + basic exercise). Goal: rebuild belief THEN layer in more treatments." }, { condition: "Any Spine Condition (Amplifier)", plan: "Add LOA practices ON TOP of existing treatment plan: affirmations + vibration check + scripting. Monitor if compliance and outcomes improve vs baseline. Cost: zero. Risk: zero. Potential upside: significant." }], sop: { preparation: ["Assess patient's Healing Belief Score (1-10)", "Identify their 'pain story' — how they describe their condition", "Check Pain Catastrophizing Scale (PCS) if chronic", "Prepare: affirmation cards, vision board examples, 369 journal template", "Room: positive, warm, no medical-looking equipment needed", "Set patient expectation: this is ADDITIONAL to physical treatment, not replacement"], execution: ["Explain mechanism (3 min): belief → endorphins → gene expression → healing", "Assess current belief score and pain story pattern", "Prescribe condition-specific affirmations (write on card)", "Demonstrate visualization technique (guided 2 min)", "Introduce 369 method or vision board (choose one)", "Address pain story pattern — teach replacement script", "Set daily practice schedule: morning routine + vibration checks + evening scripting", "Total session: 20-30 minutes (can combine with other therapy)"], postProcedure: ["Give patient take-home affirmation card", "Provide 369 journal template", "Set first vibration check alarm on their phone", "Schedule follow-up (1-2 weeks to assess compliance)", "Record Healing Belief Score (will track weekly)"], documentation: ["Healing Belief Score (baseline)", "PCS score if applicable", "Affirmations prescribed", "LOA practice assigned (369/vision board/scripting)", "Pain story pattern identified", "Compliance plan agreed"], safetyChecks: ["NEVER suggest stopping medical treatment", "Frame as COMPLEMENTARY — alongside physical therapy", "If patient is delusional: adjust approach, use PNE framing instead", "Don't force on resistant patients — plant seed gently", "Monitor for magical thinking replacing medical compliance"] }, equipment: [{ name: "Affirmation Cards (printable)", cost: "₹50/set", essential: true, notes: "Pre-printed cards with condition-specific affirmations. Patient takes home." }, { name: "369 Journal Template (printable)", cost: "₹100/pad", essential: false, notes: "Formatted journal pages for 33-day manifestation." }, { name: "Vision Board Supplies (or digital)", cost: "₹200-500", essential: false, notes: "Magazines, scissors, poster board. Or digital template link." }, { name: "Belief Score Tracking Sheet", cost: "₹50", essential: true, notes: "Weekly tracking form for Healing Belief Score." }], sessionChecklist: [{ step: "Healing Belief Score recorded (1-10)", category: "Pre" }, { step: "Pain story pattern identified", category: "Pre" }, { step: "VAS recorded", category: "Pre" }, { step: "Mechanism explained (belief → biology)", category: "Procedure" }, { step: "Affirmations prescribed and practiced", category: "Procedure" }, { step: "Visualization guided (2 min)", category: "Procedure" }, { step: "369/Vision Board assigned", category: "Procedure" }, { step: "Pain story replacement taught", category: "Procedure" }, { step: "Affirmation card given to patient", category: "Post" }, { step: "Daily schedule set (morning/evening)", category: "Post" }, { step: "Follow-up scheduled (1-2 weeks)", category: "Post" }], pricing: { perSession: 500, packageOptions: [{ name: "Belief Reset Course (4 sessions)", sessions: 4, price: 1800, savings: "₹200 off" }, { name: "LOA + Physical Therapy Combo (8)", sessions: 8, price: 4000, savings: "₹1,000 off (includes 4 physical sessions)" }, { name: "Group Workshop (5 patients)", sessions: 1, price: 300, savings: "Per person — group dynamic powerful" }], breakEven: "Zero equipment cost. Pure knowledge delivery. Can combine with any other session.", revenuePerMonth: "Best as ADD-ON to existing treatments. ₹500 × 80 = ₹40,000 extra/month on top of physical therapy revenue.", competitorComparison: "Life coaches: ₹2000-5000/session. LOA at ₹500 as clinical add-on is unique — no competitor in spine clinic space." }, training: [{ level: "Beginner (Self-study)", hours: "10-20 hours", certification: "No formal cert needed — integrate into existing practice", books: ["Byrne — The Secret", "Dispenza — You Are The Placebo", "Langer — Counterclockwise"], courses: ["Dispenza Online Workshop", "PNE (Pain Neuroscience Education) — overlaps significantly"], skills: ["Healing Belief Assessment", "Affirmation prescription", "Basic visualization guidance", "Pain story interruption"] }, { level: "Advanced (Certified)", hours: "50-100 hours", certification: "NLP Practitioner / Clinical Hypnosis / Dispenza Certified", books: ["Benedetti — Placebo Effects", "Moseley — Explain Pain Supercharged", "Schwartz — Mind and Brain"], courses: ["NLP Practitioner Training", "Clinical Hypnosis Certificate", "Dispenza Certification"], skills: ["Full belief system restructuring", "Advanced visualization", "NLP anchoring/reframing", "Research-backed placebo mechanisms"] }] },
  18: { title: "Neuroplasticity & Brain Retraining", origin: "Modern Neuroscience (Moseley, Butler, Flor, Nijs — 1990s-present)", icon: "🧬", category: "Clinical Neuroscience", evidenceLevel: "Strong (multiple RCTs, systematic reviews, clinical guidelines)", evidenceScore: 82, overview: "Neuroplasticity therapy for spine pain is based on the discovery that chronic pain fundamentally changes brain structure and function. The brain body map becomes smudged, pain alarm systems become hypersensitive (central sensitization), and pain persists even after tissue healing. Brain retraining reverses these changes through specific exercises that restore normal cortical representation, desensitize the alarm system, and retrain movement without fear.", history: "Founded on discoveries by: Lorimer Moseley (Explain Pain, 2003), David Butler (NOI Group), Herta Flor (cortical reorganization, 1997), Jo Nijs (central sensitization, 2014), Adriaan Louw (PNE for spine, 2011). Now part of clinical guidelines in Australia, Netherlands, Belgium for chronic spine pain.", mechanism: "1) CENTRAL SENSITIZATION: Spinal cord and brain amplify pain signals. 2) CORTICAL SMUDGING: Brain representation of painful body part becomes less precise. 3) FEAR-AVOIDANCE: Brain learns to associate movement with danger creating a vicious cycle. 4) NEUROPLASTIC REVERSAL: Specific training (GMI, sensory discrimination, graded exposure) reverses all three mechanisms.", spineIndications: ["Chronic low back pain (more than 3 months)", "Pain persisting after tissue healing time", "Central sensitization (widespread sensitivity)", "Failed back surgery syndrome", "Fear-avoidance / kinesiophobia", "Pain disproportionate to imaging findings", "High Pain Catastrophizing scores", "Fibromyalgia with spine involvement", "Chronic whiplash"], contraindications: ["Acute injury (first 6 weeks)", "Red flags (fracture, tumor, infection, cauda equina)", "Severe untreated psychiatric conditions", "Patient unwilling to accept pain-brain connection (educate gradually)"], measureTools: [{ name: "VAS Pain Scale", how: "Standard pain rating", frequency: "Every session + weekly" }, { name: "Pain Catastrophizing Scale (PCS)", how: "13-item questionnaire. High = more than 30/52", frequency: "Baseline + monthly" }, { name: "Tampa Scale Kinesiophobia (TSK)", how: "17-item fear of movement. High = more than 37/68", frequency: "Baseline + monthly" }, { name: "Two-Point Discrimination (TPD)", how: "Calipers on lumbar. Normal less than 40mm. Chronic more than 60mm.", frequency: "Baseline + biweekly" }, { name: "Left/Right Judgment Accuracy", how: "Flash images of backs. Accuracy% and reaction time.", frequency: "Baseline + weekly during GMI" }, { name: "Fear-Avoidance Beliefs (FABQ)", how: "16-item beliefs about activity/work causing pain", frequency: "Baseline + monthly" }], ayushIntegration: "PNE = Manasika Chikitsa (understanding disease removes fear). GMI body rotation = Yoga Nidra. Sensory discrimination = Marma awareness training. Graded exposure = progressive Yoga (Viniyoga). Novel movement = hundreds of Yoga postures. Pranayama = vagal nerve stimulation (calms central sensitization).", doctorProtocol: [{ title: "Pain Neuroscience Education (PNE)", content: "The MOST important first step. Educating the patient about how pain works reduces pain 20-30% immediately.", steps: ["ASK: 'Do you believe your pain means damage right now?' (Most say yes)", "ALARM METAPHOR: 'Pain is like a fire alarm. Alarm going off does NOT mean fire. Sometimes alarms malfunction.'", "TIMELINE: 'Discs heal in 6-12 weeks. If pain is older than this, tissues likely healed. Pain comes from alarm system.'", "CENTRAL SENSITIZATION: 'Your spinal cord turned up volume on pain signals. Normal signals are amplified into pain. Reversible.'", "BRAIN CHANGES: 'Chronic pain blurs your brain map of the back. Your brain cant sense your back precisely. We can fix this.'", "REFRAME: 'Pain does NOT equal damage. You are SAFE to move. Movement is the medicine.'", "CHECK: 'Scale 1-10 how much do you believe movement is safe?'"] }, { title: "Graded Motor Imagery (GMI) Protocol", content: "3-stage brain retraining: Left/Right discrimination, Imagined movements, Mirror therapy. 6 weeks minimum.", steps: ["STAGE 1 — LEFT/RIGHT (2 weeks): Show images of backs. Patient identifies left/right rotation. 3x5min/day. Target: 80% in 2 seconds.", "STAGE 2 — IMAGINED MOVEMENTS (2 weeks): Eyes closed, imagine pain-free bending/twisting/lifting. 3x3min/day.", "STAGE 3 — MIRROR THERAPY (2 weeks): Mirror at midline. Move less-painful side watching reflection. Brain sees pain-free movement. 2x10min/day."] }, { title: "Graded Exposure (Fear Ladder)", content: "Systematic desensitization of feared movements. Fear of movement is often BIGGER than tissue pathology.", steps: ["CREATE FEAR LADDER: List 10 avoided activities. Rate fear 0-10.", "START BOTTOM: Do lowest-fear activity daily. Rate fear BEFORE and AFTER.", "DOCUMENT: Fear before is almost always more than fear after. Show patient this pattern.", "PROGRESS: When activity drops below 3/10 fear, move to next rung.", "TIMELINE: One rung per 1-2 weeks. Full ladder = 3-6 months.", "SETBACKS: Flare-ups are normal, NOT damage. Alarm is recalibrating."] }, { title: "Sensory Discrimination Training", content: "Chronic pain smudges brain body map. This protocol sharpens it. Directly reduces pain (Wand 2011).", steps: ["TWO-POINT DISCRIMINATION: Baseline with calipers on lumbar. Find minimum distance detecting 2 points.", "LOCALIZATION: Patient prone, eyes closed. Touch a point. Patient points to where.", "GRAPHESTHESIA: Draw letters/numbers on back. Patient identifies. Start large, progress small.", "VIBRATION: Tuning fork at different vertebral levels. Patient identifies which level.", "COMBINE WITH MOVEMENT: Sensory tasks during gentle movements = faster reorganization.", "MEASURE: TPD every 2 weeks. Expect 5-10mm reduction per 2-4 weeks."] }, { title: "Threat vs Safety Rebalancing", content: "Brain constantly evaluates danger vs safety. In chronic pain balance tips toward THREAT. Rebalance toward SAFETY.", steps: ["THREAT BUCKET: What makes brain think spine is in danger? (words like degenerative, MRI findings, bad experience, stress)", "SAFETY BUCKET: What makes brain feel spine is SAFE? (understanding pain science, successful movements, doctor reassurance)", "REDUCE THREATS: Reframe imaging, stop googling, limit worst-case discussions.", "BUILD SAFETY: Document every successful pain-free movement. Review wins weekly.", "REFRAME MRI: 'Your MRI shows age-related changes that 60% of pain-FREE people also have. Normal aging.'"] }], patientSelfCare: [{ title: "Left/Right Brain Training (5 min, 3x daily)", content: "Train brain to precisely process spine positions without triggering pain.", steps: ["Find images of backs/spines in different positions.", "Identify: LEFT-rotated or RIGHT-rotated?", "Aim for SPEED + ACCURACY. Time yourself.", "Week 1: 20 images, 3 times daily.", "TARGET: 80% correct in 2 seconds per image.", "WHY: Pre-motor cortex activates without actual movement or pain."], safetyNote: "Completely painless brain exercise." }, { title: "Fear Ladder Self-Practice", content: "Prove to your brain that movement is SAFE.", steps: ["Write 10 avoided activities. Rate fear 0-10.", "This week: do the LOWEST fear activity.", "Rate fear BEFORE and AFTER. Notice: actual is less scary than predicted.", "Repeat daily until fear drops below 3.", "Next week: move up one rung.", "CELEBRATE: Every conquered activity = brain literally rewiring."], safetyNote: "Start very gently. Goal is confidence, not pushing through pain." }, { title: "Sensory Sharpening (Partner Exercise)", content: "Sharpen your brains blurred back map. When accuracy improves, pain reduces.", steps: ["Lie face down, eyes closed.", "Partner touches one point — you point to where you feel it.", "Partner draws a letter — you guess which.", "Partner touches 2 fingertips varying distance — you say 1 or 2.", "5 minutes daily. Track improvement.", "SOLO: Tennis ball against wall on back. Focus on exactly where you feel it."], safetyNote: "Gentle touch only. Stop if significantly increases pain." }, { title: "'Is It Dangerous?' Challenge", content: "Challenge your brains danger assessment when pain flares.", steps: ["Pain increases → PAUSE → Get journal.", "Ask 5 questions: 1) New injury? 2) Recently checked? 3) Same usual pain? 4) Triggered by stress/sleep/weather? 5) VERDICT: Alarm overreacting. I am SAFE.", "Then: Do something calming instead of lying down in fear.", "Track alarm accuracy over time."], safetyNote: "If pain is NEW or comes with numbness/weakness/bladder changes — see doctor immediately." }], combinationProtocols: [{ condition: "Chronic LBP (more than 3 months, no red flags)", plan: "Week 1-2: PNE + Left/Right training. Week 3-4: Imagined Movements + Sensory Discrimination. Week 5-6: Mirror Therapy + Graded Exposure. Week 7+: Progressive exercise. Combine with Kati Basti + Yoga + Dispenza." }, { condition: "Failed Back Surgery Syndrome", plan: "PNE (explain central sensitization post-surgery). Threat/Safety rebalancing. Full GMI (6 weeks). Graded Exposure from very gentle. Sensory discrimination daily. Panchakarma for nerve nourishment." }, { condition: "Kinesiophobia (Fear of Movement)", plan: "Tampa Scale first. Fear Ladder primary (3-6 months). PNE reframe movement as medicine. Daily journal. Walking meditation as non-threatening movement. Yoga with fear-aware teacher." }], sop: { preparation: ["Administer baseline questionnaires: PCS, TSK, FABQ (10 min)", "Measure Two-Point Discrimination (TPD) on lumbar spine", "Test Left/Right judgment (phone app or printed images)", "Assess patient's current understanding of their pain", "Prepare: back images (L/R judgment), mirror, calipers, education materials", "Set expectations: this is brain training, not physical treatment — different approach"], execution: ["SESSION 1-2: Pain Neuroscience Education (explain pain ≠ damage, alarm metaphor)", "Assess belief change after PNE (movement safety score 1-10)", "Introduce Left/Right discrimination training (demonstrate, set homework)", "SESSION 3-4: Add Imagined Movements (eyes closed, visualize pain-free movement)", "Begin Sensory Discrimination (TPD, localization, graphesthesia)", "SESSION 5-6: Mirror Therapy introduction (setup, technique, duration)", "Start Fear Ladder (identify 10 feared activities, rate, begin lowest)", "ONGOING: Progress each modality based on patient response", "Total course: 6-12 sessions over 6-12 weeks"], postProcedure: ["Update all scores: PCS, TSK, TPD, L/R accuracy after each session", "Set specific homework for next 3-7 days", "Celebrate improvements (brain is rewiring — show the data)", "Address setbacks: 'flare = alarm recalibrating, not new damage'", "Schedule next session (weekly for first 6 weeks, then biweekly)"], documentation: ["Questionnaire scores (PCS, TSK, FABQ) — track trend over time", "TPD measurement (mm) — should decrease over weeks", "L/R accuracy (% correct) and reaction time — should improve", "Fear Ladder progress (which rung achieved this week)", "VAS trend over entire course", "Patient homework compliance"], safetyChecks: ["Rule out red flags FIRST (this is not for acute pathology)", "If symptoms worsen significantly: reassess, consider imaging", "Don't push graded exposure too fast (patient controls pace)", "Watch for excessive distress during education (adjust language)", "Refer if psychiatric comorbidity is severe (anxiety/depression)"] }, equipment: [{ name: "Left/Right Judgment App (Recognise app)", cost: "Free-₹500", essential: true, notes: "NOI Group 'Recognise' app. Flash body images, patient identifies L/R." }, { name: "Calipers (two-point discrimination)", cost: "₹1,000-3,000", essential: true, notes: "Measure TPD on lumbar/cervical. Track objective cortical change." }, { name: "Mirror (full-length, portable)", cost: "₹1,000-2,000", essential: true, notes: "For mirror therapy. Place at body midline." }, { name: "Fear Ladder Worksheet (printable)", cost: "₹50/pad", essential: true, notes: "Patient ranks 10 feared activities. Tracks progress weekly." }, { name: "PNE Explanation Materials", cost: "₹500", essential: true, notes: "Printed metaphors, diagrams of pain system. Patient takes home." }, { name: "PCS + TSK Questionnaires (printed)", cost: "₹100/pad", essential: true, notes: "Baseline + monthly tracking. Validated questionnaires." }, { name: "Tuning Fork (128 Hz)", cost: "₹500-800", essential: false, notes: "For sensory discrimination — patient identifies which vertebral level." }], sessionChecklist: [{ step: "Questionnaires administered (PCS/TSK if due)", category: "Pre" }, { step: "TPD measured", category: "Pre" }, { step: "VAS recorded", category: "Pre" }, { step: "L/R accuracy tested (% + time)", category: "Pre" }, { step: "PNE delivered/reinforced", category: "Procedure" }, { step: "GMI stage practiced (L/R, Imagined, or Mirror)", category: "Procedure" }, { step: "Sensory discrimination performed", category: "Procedure" }, { step: "Fear Ladder reviewed and progressed", category: "Procedure" }, { step: "Homework set for next week", category: "Post" }, { step: "Improvements celebrated (show data)", category: "Post" }, { step: "All scores updated in file", category: "Post" }, { step: "Next session scheduled", category: "Post" }], pricing: { perSession: 600, packageOptions: [{ name: "Full Course (12 sessions)", sessions: 12, price: 6000, savings: "₹1,200 off" }, { name: "Standard (6 sessions)", sessions: 6, price: 3200, savings: "₹400 off" }, { name: "PNE + GMI Intensive (8)", sessions: 8, price: 4000, savings: "₹800 off" }], breakEven: "4 patients/day × 25 days = 100 sessions × ₹600 = ₹60,000/month. Minimal equipment cost. Knowledge-intensive.", revenuePerMonth: "Target: 50-80 sessions/month = ₹30,000-48,000. Best combined with physical treatments for comprehensive package.", competitorComparison: "Pain psychology: ₹2000-5000/session. Clinical neuroplasticity at ₹600 is accessible + evidence-based." }, training: [{ level: "Beginner (PNE)", hours: "16-30 hours", certification: "PNE Certificate / NOI Foundation", books: ["Moseley & Butler — Explain Pain", "Louw — Why Do I Hurt?"], courses: ["NOI Group Explain Pain Course (16 hrs)", "Pain Neuroscience Education Workshop"], skills: ["PNE delivery (alarm metaphor, timeline, etc.)", "Basic questionnaire administration", "Left/Right judgment training setup", "Patient education materials creation"] }, { level: "Intermediate (GMI + Graded Exposure)", hours: "60-100 hours", certification: "Advanced Pain Science Practitioner", books: ["Moseley — Explain Pain Supercharged", "Butler — The Sensitive Nervous System", "Nijs — Pain in Motion textbook"], courses: ["NOI GMI Course", "Graded Exposure Training (IASP)", "Central Sensitization Workshop"], skills: ["Full GMI protocol delivery", "Fear Ladder design and progression", "Sensory discrimination training", "Complex chronic pain case management"] }, { level: "Advanced (Researcher/Teacher)", hours: "200+ hours", certification: "PhD / Clinical Specialist in Pain Science", books: ["Flor — Neuroscience of Pain", "Moseley — Painful Yarns (narrative)"], courses: ["Research fellowship in pain neuroscience", "Teaching certification (university level)"], skills: ["Clinical research methodology", "Teaching PNE to other clinicians", "Complex central sensitization cases", "Publishing + advancing the field"] }] },
  19: { title: "Functional Neurology (Carrick)", origin: "USA (Dr. Ted Carrick, 1979-present)", icon: "🧠", category: "Clinical Neuroscience", evidenceLevel: "Moderate-Strong (growing RCT base, clinical validation)", evidenceScore: 75, overview: "Functional Neurology (Carrick Institute) treats spine pain by addressing the BRAIN's interpretation of pain rather than just local tissue. The brain receives proprioceptive input from spinal joints — if this input is faulty, the brain creates protective muscle guarding, altered movement patterns, and chronic pain. Specific sensory stimulation (eye movements, vestibular drills, balance exercises) rewires these maladaptive brain circuits.", history: "Developed by Dr. Ted Carrick (1979). Formalized through the Carrick Institute for Graduate Studies. Combines clinical neurology assessment with targeted rehabilitation. Now practiced globally with Board Certification (DACNB). Builds on work of Sherrington (proprioception), Jeannerod (motor imagery), and modern vestibular rehabilitation.", mechanism: "1) PROPRIOCEPTIVE MISMATCH: Spine joints send faulty signals to cerebellum → brain creates protective responses. 2) HEMISPHERIC IMBALANCE: One brain hemisphere under-fires → unilateral pain and postural dysfunction. 3) CEREBELLAR DYSFUNCTION: Poor timing/coordination of spine stabilizers → recurrent injury. 4) VESTIBULAR-CERVICAL LINK: C1-C2 proprioceptors directly feed vestibular nuclei → dizziness from neck problems.", spineIndications: ["Cervicogenic dizziness/vertigo (C1-C2)", "Chronic recurrent LBP with central sensitization", "Post-whiplash syndrome (persistent dizziness, neck pain, fog)", "Failed back surgery (brain didn't update pain map)", "Balance dysfunction from spine pathology", "Thoracic poor posture (desk workers)", "Fear-avoidance with deconditioning", "Unilateral spine pain (hemispheric origin)"], contraindications: ["Active BPPV (treat first with Epley)", "Acute cervical fracture/instability", "Severe vertigo during exercises (modify intensity)", "Epilepsy (OKN stimulation caution)", "Acute disc herniation with progressive neuro deficit (refer)"], measureTools: [{ name: "Joint Position Error (JPE)", how: "Laser on headband, eyes closed rotation to center. Normal less than 4.5 degrees error.", frequency: "Baseline + biweekly" }, { name: "Romberg (4 conditions)", how: "Feet together: eyes open, eyes closed, foam eyes open, foam eyes closed. Time in seconds.", frequency: "Every session" }, { name: "Fukuda Stepping Test", how: "50 steps marching in place eyes closed. Measure rotation degrees.", frequency: "Baseline + monthly" }, { name: "Saccade Accuracy", how: "Rapid eye jumps between 2 targets. Count errors out of 20.", frequency: "Every session" }, { name: "Smooth Pursuit Quality", how: "Grade 1-5 (1=jerky, 5=perfect smooth tracking)", frequency: "Every session" }, { name: "Gait Speed + Tandem Errors", how: "Timed 10m walk + tandem walk error count", frequency: "Baseline + biweekly" }], ayushIntegration: "Marma (Krikatika) primes cervical proprioceptors before drills. Nasya activates frontal cortex via olfactory-trigeminal pathway. Kati/Greeva Basti pacifies local Vata allowing better neural input to brain. Shirodhara reduces central sensitization (parasympathetic activation). Bhramari Pranayama stimulates vagus nerve as warm-up before drills.", doctorProtocol: [{ title: "Hemispheric Assessment Protocol", content: "Identify which brain hemisphere is under-functioning to guide treatment. Stimulate the WEAK side specifically.", steps: ["ARM SWING: Walk naturally — reduced swing = contralateral cortex weak", "PUPIL: Larger pupil side = ipsilateral sympathetic (stress/pain) dominance", "SACCADES: Inaccurate toward one side = ipsilateral cerebellum or contralateral frontal", "ROMBERG: Sway direction indicates weak vestibular or cerebellar side", "FINGER-NOSE: Intention tremor = ipsilateral cerebellar hemisphere weak", "CONCLUSION: Identify weak hemisphere → treat by stimulating opposite body side"] }, { title: "Vestibular-Cervical Rehabilitation", content: "Protocol for cervicogenic dizziness (most common neuro presentation from spine dysfunction).", steps: ["GAZE STABILITY (VOR×1): Focus on letter, turn head L-R. Keep letter clear. Start 1Hz, increase speed. 3×/day × 1 min.", "SMOOTH PURSUIT: Track finger in figure-8. Eyes only, head still. 30 sec each direction. 2×/day.", "JPE TRAINING: Eyes closed, turn head to side, return to center. Goal: less than 4.5 degree error. 10 reps × 3×/day.", "SINGLE-LEG + HEAD TURNS: Stand one leg, add head rotation. 30 sec × 3 sets. 2×/day.", "OKN STIMULATION: Moving stripes on phone. 30 sec each direction × 3 sets. For visual dependence."] }, { title: "Central Sensitization Neuro-Rehab", content: "For chronic pain patients where brain has amplified pain signals beyond tissue pathology.", steps: ["ANTI-SACCADE: Look OPPOSITE to stimulus. Trains frontal inhibition (suppresses pain overreaction). 2 min/day.", "MIRROR THERAPY: Spine at midline. Move pain-free side watching reflection. Brain sees pain-free movement. 5 min × 2/day.", "CROSS-BODY ACTIVATION: Stimulate opposite body side to weak hemisphere (smell, vibration, gaze). 60 sec × 3-4/day.", "TANDEM GAIT + COGNITIVE: Walk heel-to-toe while counting backwards. Builds dual-task capacity. 5 min/day.", "METRONOME TRAINING: Clap to beat. Improves timing circuits (basal ganglia + cerebellum). 3 min/day."] }], patientSelfCare: [{ title: "Morning Neuro-Spine Activation (5 min)", content: "Brain-priming routine before starting the day. Activates all sensory pathways that feed spine stability.", steps: ["1. Gaze Stability: hold finger at arm length, turn head 20× L-R keeping finger focused (60 sec)", "2. Smooth Pursuit: trace large figure-8 with eyes following finger, head still (30 sec)", "3. Single-Leg Stand: 15 sec each leg, then add head turns (60 sec total)", "4. Chin Tucks + eye movements: tuck chin (double-chin), hold while looking L-R (30 sec)", "5. Deep breath × 3 with eyes closed, feel balance and posture (30 sec)"], safetyNote: "Stop if dizziness is severe. Mild dizziness during exercises is normal and will improve." }, { title: "Desk Worker Neuro-Breaks (Every 2 Hours)", content: "Micro-drills to prevent thoracic slump and cervical proprioceptive degradation from prolonged sitting.", steps: ["EYE BREAK: Look at far distance object for 20 sec (relaxes convergence)", "SACCADES: Look rapidly between 2 objects 10× (wakes up frontal lobe)", "HEAD TURNS: Slow full rotation L-R × 5 each (cervical proprioceptive refresh)", "SINGLE-LEG: Stand on one leg 15 sec while reading screen (cerebellar activation)", "POSTURE RESET: Wall angel position 5 reps (thoracic extension with neuromuscular retraining)"], safetyNote: "All exercises safe at desk. If dizziness persists beyond 30 seconds after stopping, report to doctor." }], combinationProtocols: [{ condition: "Cervicogenic Dizziness (C1-C2)", plan: "Greeva Basti × 7 days → Add vestibular drills from Day 3 → Krikatika Marma before each drill session → Nasya × 7 (frontal activation) → Patient home: gaze stability + JPE training daily. Timeline: 4-6 weeks to resolution." }, { condition: "Chronic Recurrent LBP (Central Sensitization)", plan: "Pain Neuroscience Education first → Kati Basti + Basti karma (Vata pacification) → Anti-saccade + mirror therapy + metronome → Graded exercise progression → Patient: tandem gait + cross-body activation daily. Timeline: 6-8 weeks." }, { condition: "Post-Whiplash Syndrome", plan: "Week 1-2: Greeva Basti + gentle Nasya (tissue healing). Week 3-4: Add gaze stability + JPE training. Week 5-6: Progressive balance (foam, head turns). Week 7+: Full activity. Combine with Acupuncture GB20." }], sop: { preparation: ["Perform baseline neurological assessment: saccades, pursuit, Romberg, Fukuda, JPE", "Score all assessments numerically (for tracking progress)", "Identify which brain system is most affected: vestibular, cerebellar, hemispheric, or proprioceptive", "Select appropriate drills based on assessment findings", "Prepare equipment: foam pad, laser pointer, metronome app, OKN app", "Set patient expectations: this is brain training — subtle, progressive, requires daily homework"], execution: ["SESSION 1: Full assessment (20 min) + PNE education (10 min) + assign first drill", "SESSIONS 2-4: Reassess key measures → progress or modify drills → 2-3 drills per session", "Add complexity progressively: eyes open → closed → foam → head turns → dual-task", "Monitor for symptom provocation (mild dizziness OK, severe = reduce intensity)", "Each session: 20-30 min active drill work + 10 min education/homework setting", "Total course: 6-12 sessions over 4-8 weeks"], postProcedure: ["Record all assessment scores (compare to baseline)", "Set specific daily homework drills (written card)", "Explain progression criteria: when to advance", "Address any symptom provocation (reassure: mild dizziness is therapeutic)", "Schedule next session (weekly for first 4 weeks, then biweekly)"], documentation: ["All assessment scores: JPE degrees, Romberg seconds, Fukuda rotation, Saccade errors, Pursuit grade", "Drills prescribed and progression level", "Homework compliance (patient self-report)", "VAS before and after", "Symptom provocation during drills (dizziness 0-10)"], safetyChecks: ["If BPPV suspected: perform Dix-Hallpike → treat with Epley FIRST before any drills", "Stop any drill causing severe nausea or vomiting (modify intensity)", "Cervical instability (ligament laxity): avoid aggressive head movements", "Fall risk patients: always near wall or support for balance drills", "Refer if progressive neurological deficit (worsening weakness/numbness)"] }, equipment: [{ name: "Foam Balance Pad", cost: "₹500-1000", essential: true, notes: "For modified Romberg and progressive balance training." }, { name: "Laser Pointer + Headband", cost: "₹200-500 (DIY)", essential: true, notes: "Tape laser to headband for JPE measurement. Simple and effective." }, { name: "Metronome App (phone)", cost: "Free", essential: true, notes: "'Pro Metronome' app for timing/rhythm training." }, { name: "OKN Strip App (phone)", cost: "Free", essential: true, notes: "'OKN Drum' app for optokinetic stimulation." }, { name: "BOSU Ball", cost: "₹2,000-4,000", essential: false, notes: "Advanced balance training. Not needed initially." }, { name: "Mirror (full-length)", cost: "₹1,000-2,000", essential: false, notes: "For mirror therapy in central sensitization cases." }, { name: "Assessment Form (printable)", cost: "₹100", essential: true, notes: "Standardized scoring sheet for all 6 assessments." }], sessionChecklist: [{ step: "Key assessments performed (JPE, Romberg, Saccade, Pursuit)", category: "Pre" }, { step: "Scores recorded and compared to last session", category: "Pre" }, { step: "VAS recorded (before)", category: "Pre" }, { step: "Previous homework compliance checked", category: "Pre" }, { step: "Drills performed (2-3 per session, 5-8 min each)", category: "Procedure" }, { step: "Symptom provocation monitored (dizziness 0-10)", category: "Procedure" }, { step: "Progression applied where criteria met", category: "Procedure" }, { step: "New drill introduced if patient ready", category: "Procedure" }, { step: "VAS recorded (after)", category: "Post" }, { step: "Homework drills written on card", category: "Post" }, { step: "Progression criteria explained", category: "Post" }, { step: "Next session scheduled", category: "Post" }], pricing: { perSession: 700, packageOptions: [{ name: "Assessment + First Session", sessions: 1, price: 900, savings: "Full neuro assessment included" }, { name: "Standard Course (8 sessions)", sessions: 8, price: 4800, savings: "₹800 off" }, { name: "Intensive (12 sessions)", sessions: 12, price: 7000, savings: "₹1,400 off" }, { name: "Monthly Maintenance (4)", sessions: 4, price: 2500, savings: "₹300 off" }], breakEven: "3-4 patients/day × 25 days = 75-100 sessions × ₹700 = ₹52,500-70,000/month. Minimal equipment cost.", revenuePerMonth: "Target: 50-80 sessions/month = ₹35,000-56,000. Unique niche — no competitors locally.", competitorComparison: "Vestibular physio: ₹500-800. Neurologist consultation: ₹1000-2000. Functional Neurology at ₹700 is specialized + unique in AYUSH clinics." }, training: [{ level: "Beginner (Foundation)", hours: "40-60 hours", certification: "Certificate in Vestibular Rehabilitation / Functional Neurology Foundations", books: ["Herdman — Vestibular Rehabilitation", "Carrick Institute — Functional Neurology Foundations"], courses: ["Vestibular Rehab Foundation Course", "Carrick Institute Online Foundations"], skills: ["Gaze stability (VOR×1) prescription", "JPE assessment and training", "Basic Romberg assessment", "Balance exercise prescription"] }, { level: "Intermediate (Clinical)", hours: "200-300 hours", certification: "Diplomate in Functional Neurology (DACNB pathway)", books: ["Carrick — Clinical Neuroscience", "Afifi — Functional Neuroanatomy"], courses: ["Carrick Institute Clinical Modules (300 hrs)", "ACNB Board Preparation"], skills: ["Full hemispheric assessment", "OKN/saccade/pursuit analysis", "Central sensitization neuro-rehab", "Complex vestibular cases"] }, { level: "Advanced (Board Certified)", hours: "700+ hours", certification: "DACNB (Diplomate American Chiropractic Neurology Board)", books: ["Carrick Institute Complete Library", "Neuroplasticity research (Doidge, Merzenich)"], courses: ["Full Carrick Institute Fellowship (700+ hrs)", "ACNB Board Examination"], skills: ["Board-certified functional neurologist", "Teaching/supervising", "Research competency", "Running a functional neurology department"] }] },
};

// ─── Interactive Widget: Session Checklist ───
function SessionChecklistWidget({ items, therapyName }: { items: { step: string; category: string }[]; therapyName: string }) {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    setChecked(prev => { const n = new Set(prev); if (n.has(i)) n.delete(i); else n.add(i); return n; });
  };

  const pct = items.length > 0 ? Math.round((checked.size / items.length) * 100) : 0;
  const categories = ["Pre", "Procedure", "Post"];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Progress value={pct} className="h-2 w-32" />
          <span className="text-xs font-medium">{checked.size}/{items.length} ({pct}%)</span>
        </div>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" className="h-6 text-[10px]" onClick={() => setChecked(new Set())}>Reset</Button>
          <Button variant="outline" size="sm" className="h-6 text-[10px]" onClick={() => setChecked(new Set(items.map((_, i) => i)))}>All Done</Button>
        </div>
      </div>
      {categories.map(cat => {
        const catItems = items.map((item, i) => ({ ...item, idx: i })).filter(item => item.category === cat);
        if (catItems.length === 0) return null;
        return (
          <div key={cat}>
            <p className={`text-[10px] font-medium uppercase mb-1 ${cat === "Pre" ? "text-blue-600" : cat === "Procedure" ? "text-green-600" : "text-purple-600"}`}>{cat === "Pre" ? "Pre-Treatment" : cat === "Procedure" ? "During Procedure" : "Post-Treatment"}</p>
            <div className="space-y-0.5">
              {catItems.map(item => (
                <label key={item.idx} className={`flex items-center gap-2 p-1.5 rounded text-xs cursor-pointer transition ${checked.has(item.idx) ? "bg-green-50 line-through text-muted-foreground" : "hover:bg-muted/50"}`}>
                  <input type="checkbox" checked={checked.has(item.idx)} onChange={() => toggle(item.idx)} className="rounded" />
                  <span>{item.step}</span>
                </label>
              ))}
            </div>
          </div>
        );
      })}
      {pct === 100 && (
        <div className="p-2 bg-green-100 rounded text-center text-xs text-green-700 font-medium">
          <CheckCircle2 className="h-4 w-4 inline mr-1" /> All checklist items complete! Session documented.
        </div>
      )}
    </div>
  );
}

// ─── Interactive Widget: Case Log ───
function CaseLogWidget({ therapyId, therapyName }: { therapyId: number; therapyName: string }) {
  const [logs, setLogs] = useState<{ date: string; patient: string; condition: string; vasBefore: string; vasAfter: string; outcome: string; notes: string }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split("T")[0], patient: "", condition: "", vasBefore: "", vasAfter: "", outcome: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const addLog = async () => {
    if (!form.patient || !form.condition) { toast.error("Patient and condition required"); return; }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("spine_therapy_sessions").insert({
          patient_id: user.id,
          doctor_id: user.id,
          session_number: logs.length + 1,
          therapy_name: `Case Log: ${therapyName} — ${form.patient}`,
          duration_minutes: 30,
          status: "case_logged",
          pain_before: form.vasBefore ? parseInt(form.vasBefore) : null,
          pain_after: form.vasAfter ? parseInt(form.vasAfter) : null,
          doctor_notes: JSON.stringify({ type: "therapy_case_log", therapyId, ...form }),
        });
      }
    } catch (err) { /* continue even if DB save fails */ }

    setLogs(prev => [...prev, { ...form }]);
    setForm({ date: new Date().toISOString().split("T")[0], patient: "", condition: "", vasBefore: "", vasAfter: "", outcome: "", notes: "" });
    setShowForm(false);
    setSaving(false);
    toast.success("Case logged!");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{logs.length} cases logged this session</span>
        <Button size="sm" className="h-6 text-[10px] gap-1" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-3 w-3" /> Log Case
        </Button>
      </div>

      {showForm && (
        <div className="p-3 border rounded bg-rose-50/30 space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div><label className="text-[10px] font-medium">Date</label><Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="h-7 text-xs" /></div>
            <div><label className="text-[10px] font-medium">Patient Name</label><Input value={form.patient} onChange={e => setForm(p => ({ ...p, patient: e.target.value }))} className="h-7 text-xs" placeholder="Name/ID" /></div>
            <div><label className="text-[10px] font-medium">Condition</label><Input value={form.condition} onChange={e => setForm(p => ({ ...p, condition: e.target.value }))} className="h-7 text-xs" placeholder="e.g. Sciatica L5" /></div>
            <div className="grid grid-cols-2 gap-1">
              <div><label className="text-[10px] font-medium">VAS Pre</label><Input type="number" min="0" max="10" value={form.vasBefore} onChange={e => setForm(p => ({ ...p, vasBefore: e.target.value }))} className="h-7 text-xs" /></div>
              <div><label className="text-[10px] font-medium">VAS Post</label><Input type="number" min="0" max="10" value={form.vasAfter} onChange={e => setForm(p => ({ ...p, vasAfter: e.target.value }))} className="h-7 text-xs" /></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[10px] font-medium">Outcome</label><Input value={form.outcome} onChange={e => setForm(p => ({ ...p, outcome: e.target.value }))} className="h-7 text-xs" placeholder="e.g. 60% relief, ROM improved" /></div>
            <div><label className="text-[10px] font-medium">Notes</label><Input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className="h-7 text-xs" placeholder="Any adverse events, key observation" /></div>
          </div>
          <div className="flex justify-end gap-1">
            <Button variant="outline" size="sm" className="h-6 text-[10px]" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button size="sm" className="h-6 text-[10px] gap-1" onClick={addLog} disabled={saving}>
              <Save className="h-3 w-3" /> {saving ? "Saving..." : "Save Case"}
            </Button>
          </div>
        </div>
      )}

      {logs.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead><tr className="border-b text-muted-foreground"><th className="p-1 text-left">Date</th><th className="p-1 text-left">Patient</th><th className="p-1 text-left">Condition</th><th className="p-1 text-center">VAS</th><th className="p-1 text-left">Outcome</th></tr></thead>
            <tbody>
              {logs.map((log, i) => (
                <tr key={i} className="border-b"><td className="p-1">{log.date}</td><td className="p-1 font-medium">{log.patient}</td><td className="p-1">{log.condition}</td><td className="p-1 text-center">{log.vasBefore}→{log.vasAfter}</td><td className="p-1 text-green-700">{log.outcome}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {logs.length === 0 && !showForm && (
        <p className="text-[10px] text-muted-foreground text-center py-2">No cases logged yet. Click "Log Case" after each patient treatment to build your clinical audit.</p>
      )}
    </div>
  );
}

export default function SpineTherapyDetail() {
  const { therapyId } = useParams();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"doctor" | "patient">("doctor");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["overview"]));

  const id = parseInt(therapyId || "1");
  const baseTherapy = allTherapyData[id];

  // Merge extended doctor protocols for therapies 14-18
  const therapy = baseTherapy ? {
    ...baseTherapy,
    doctorProtocol: [
      ...baseTherapy.doctorProtocol,
      ...(extendedDoctorProtocols[id] || []),
    ],
  } : null;

  if (!therapy) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
        <h2 className="text-xl font-bold">Therapy Not Found</h2>
        <Button onClick={() => navigate("/hms/spine-therapies")} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Therapies
        </Button>
      </div>
    );
  }

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const expandAll = () => {
    const all = new Set(["overview", "mechanism", "indications", "measure", "ayush", ...therapy.doctorProtocol.map((_, i) => `doc-${i}`), ...therapy.patientSelfCare.map((_, i) => `pat-${i}`), "combinations"]);
    setExpandedSections(all);
  };

  const SectionHeader = ({ id, title, icon }: { id: string; title: string; icon: React.ReactNode }) => (
    <div className="flex items-center justify-between cursor-pointer p-3 hover:bg-muted/50 rounded-lg" onClick={() => toggleSection(id)}>
      <div className="flex items-center gap-2 font-medium text-sm">{icon} {title}</div>
      {expandedSections.has(id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/hms/spine-therapies")} className="h-8">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <span className="text-2xl">{therapy.icon}</span> {therapy.title}
            </h1>
            <p className="text-sm text-muted-foreground">Origin: {therapy.origin} · {therapy.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{therapy.evidenceLevel}</Badge>
          <Badge className="bg-green-100 text-green-700">{therapy.evidenceScore}% Evidence</Badge>
        </div>
      </div>

      {/* View Mode + Expand */}
      <div className="flex items-center justify-between">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "doctor" | "patient")}>
          <TabsList className="h-8">
            <TabsTrigger value="doctor" className="text-xs gap-1"><Stethoscope className="h-3 w-3" /> Doctor Training</TabsTrigger>
            <TabsTrigger value="patient" className="text-xs gap-1"><Heart className="h-3 w-3" /> Patient Self-Care</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button variant="outline" size="sm" onClick={expandAll} className="text-xs h-7">Expand All</Button>
      </div>

      {/* Overview */}
      <Card>
        <SectionHeader id="overview" title="Overview & Background" icon={<Globe className="h-4 w-4 text-indigo-600" />} />
        {expandedSections.has("overview") && (
          <CardContent className="pt-0 space-y-3">
            <p className="text-sm">{therapy.overview}</p>
            <div className="bg-muted/50 p-3 rounded text-xs"><strong>History:</strong> {therapy.history}</div>
          </CardContent>
        )}
      </Card>

      {/* Mechanism */}
      <Card>
        <SectionHeader id="mechanism" title="How It Works (Mechanism)" icon={<Brain className="h-4 w-4 text-purple-600" />} />
        {expandedSections.has("mechanism") && (
          <CardContent className="pt-0"><p className="text-sm">{therapy.mechanism}</p></CardContent>
        )}
      </Card>

      {/* Indications & Contraindications */}
      <Card>
        <SectionHeader id="indications" title="Spine Indications & Contraindications" icon={<Activity className="h-4 w-4 text-blue-600" />} />
        {expandedSections.has("indications") && (
          <CardContent className="pt-0 space-y-3">
            <div>
              <p className="text-xs font-medium text-green-700 mb-1">Indications:</p>
              <div className="flex flex-wrap gap-1">{therapy.spineIndications.map(i => <Badge key={i} variant="outline" className="text-[10px]">{i}</Badge>)}</div>
            </div>
            <div>
              <p className="text-xs font-medium text-red-700 mb-1">Contraindications:</p>
              <div className="flex flex-wrap gap-1">{therapy.contraindications.map(c => <Badge key={c} variant="outline" className="text-[10px] border-red-200 text-red-600">{c}</Badge>)}</div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Measurement Tools */}
      <Card className="border-green-200">
        <SectionHeader id="measure" title="Outcome Measurement Tools" icon={<Target className="h-4 w-4 text-green-600" />} />
        {expandedSections.has("measure") && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {therapy.measureTools.map((tool) => (
                <div key={tool.name} className="p-2 bg-green-50 rounded border border-green-100 text-xs">
                  <p className="font-medium">{tool.name}</p>
                  <p className="text-muted-foreground">{tool.how}</p>
                  <p className="text-green-600 mt-1">Frequency: {tool.frequency}</p>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* AYUSH Integration */}
      <Card className="border-amber-200">
        <SectionHeader id="ayush" title="AYUSH Integration Protocol" icon={<Leaf className="h-4 w-4 text-amber-600" />} />
        {expandedSections.has("ayush") && (
          <CardContent className="pt-0">
            <div className="bg-amber-50 p-3 rounded text-sm">{therapy.ayushIntegration}</div>
          </CardContent>
        )}
      </Card>

      {/* Doctor Protocol */}
      {viewMode === "doctor" && (
        <div className="space-y-2">
          <h3 className="font-semibold text-sm flex items-center gap-2 px-1">
            <Stethoscope className="h-4 w-4 text-purple-600" /> Doctor Training Protocol
          </h3>
          {therapy.doctorProtocol.map((proto, i) => (
            <Card key={i} className="border-purple-100">
              <SectionHeader id={`doc-${i}`} title={proto.title} icon={<BookOpen className="h-3.5 w-3.5 text-purple-500" />} />
              {expandedSections.has(`doc-${i}`) && (
                <CardContent className="pt-0 space-y-2">
                  <p className="text-sm text-muted-foreground">{proto.content}</p>
                  {proto.steps && (
                    <ol className="text-xs space-y-1 pl-4 list-decimal">
                      {proto.steps.map((s, j) => <li key={j}>{s}</li>)}
                    </ol>
                  )}
                  {proto.tips && (
                    <div className="bg-purple-50 p-2 rounded text-xs border border-purple-100">
                      <strong>Clinical Tip:</strong> {proto.tips}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Patient Self-Care */}
      {viewMode === "patient" && (
        <div className="space-y-2">
          <h3 className="font-semibold text-sm flex items-center gap-2 px-1">
            <Heart className="h-4 w-4 text-green-600" /> Patient Self-Treatment Guide
          </h3>
          {therapy.patientSelfCare.map((care, i) => (
            <Card key={i} className="border-green-100">
              <SectionHeader id={`pat-${i}`} title={care.title} icon={<Hand className="h-3.5 w-3.5 text-green-500" />} />
              {expandedSections.has(`pat-${i}`) && (
                <CardContent className="pt-0 space-y-2">
                  <p className="text-sm text-muted-foreground">{care.content}</p>
                  {care.steps && (
                    <ol className="text-xs space-y-1 pl-4 list-decimal">
                      {care.steps.map((s, j) => <li key={j}>{s}</li>)}
                    </ol>
                  )}
                  {care.safetyNote && (
                    <div className="bg-red-50 p-2 rounded text-xs border border-red-100">
                      <AlertTriangle className="h-3 w-3 inline text-red-500 mr-1" />
                      <strong>Safety:</strong> {care.safetyNote}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Combination Protocols */}
      <Card className="border-indigo-200">
        <SectionHeader id="combinations" title="Combination Protocols (AYUSH + This Therapy)" icon={<Zap className="h-4 w-4 text-indigo-600" />} />
        {expandedSections.has("combinations") && (
          <CardContent className="pt-0 space-y-2">
            {therapy.combinationProtocols.map((combo, i) => (
              <div key={i} className="p-2 bg-indigo-50 rounded border border-indigo-100 text-xs">
                <p className="font-medium text-indigo-700">{combo.condition}</p>
                <p className="text-indigo-900 mt-1">{combo.plan}</p>
              </div>
            ))}
          </CardContent>
        )}
      </Card>

      {/* ═══════ NEW SECTIONS: SOP, Equipment, Checklist, Pricing, Training, Case Log ═══════ */}

      {/* SOP (Standard Operating Procedure) */}
      {therapy.sop && (
        <Card className="border-orange-200">
          <SectionHeader id="sop" title="SOP — Standard Operating Procedure" icon={<ClipboardList className="h-4 w-4 text-orange-600" />} />
          {expandedSections.has("sop") && (
            <CardContent className="pt-0 space-y-3">
              {[
                { label: "Preparation", items: therapy.sop.preparation, color: "blue" },
                { label: "Execution", items: therapy.sop.execution, color: "green" },
                { label: "Post-Procedure", items: therapy.sop.postProcedure, color: "purple" },
                { label: "Documentation", items: therapy.sop.documentation, color: "amber" },
                { label: "Safety Checks", items: therapy.sop.safetyChecks, color: "red" },
              ].map(section => (
                <div key={section.label}>
                  <p className={`text-xs font-medium text-${section.color}-700 uppercase mb-1 flex items-center gap-1`}>
                    <Shield className="h-3 w-3" /> {section.label}
                  </p>
                  <ol className="space-y-0.5 text-xs pl-4 list-decimal">
                    {section.items.map((item, i) => (
                      <li key={i} className="text-muted-foreground">{item}</li>
                    ))}
                  </ol>
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      )}

      {/* Equipment & Setup */}
      {therapy.equipment && (
        <Card className="border-cyan-200">
          <SectionHeader id="equipment" title="Equipment & Setup Requirements" icon={<Package className="h-4 w-4 text-cyan-600" />} />
          {expandedSections.has("equipment") && (
            <CardContent className="pt-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left p-1.5">Equipment</th>
                      <th className="text-center p-1.5">Cost</th>
                      <th className="text-center p-1.5">Essential?</th>
                      <th className="text-left p-1.5">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {therapy.equipment.map((eq, i) => (
                      <tr key={i} className="border-b hover:bg-muted/30">
                        <td className="p-1.5 font-medium">{eq.name}</td>
                        <td className="p-1.5 text-center text-green-600">{eq.cost}</td>
                        <td className="p-1.5 text-center">{eq.essential ? <Badge className="bg-red-50 text-red-600 text-[8px]">Must Have</Badge> : <Badge variant="outline" className="text-[8px]">Optional</Badge>}</td>
                        <td className="p-1.5 text-muted-foreground">{eq.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-2 p-2 bg-cyan-50 rounded text-xs text-center">
                <strong>Total Essential Setup Cost:</strong> ~₹{therapy.equipment.filter(e => e.essential).reduce((s, e) => s + parseInt(e.cost.replace(/[^\d]/g, "")) || 0, 0).toLocaleString()} (approx)
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Interactive Session Checklist */}
      {therapy.sessionChecklist && (
        <Card className="border-green-200">
          <SectionHeader id="checklist" title="Session Checklist (Interactive)" icon={<CheckCircle2 className="h-4 w-4 text-green-600" />} />
          {expandedSections.has("checklist") && (
            <CardContent className="pt-0">
              <SessionChecklistWidget items={therapy.sessionChecklist} therapyName={therapy.title} />
            </CardContent>
          )}
        </Card>
      )}

      {/* Pricing Calculator */}
      {therapy.pricing && (
        <Card className="border-emerald-200">
          <SectionHeader id="pricing" title="Pricing & Packages" icon={<IndianRupee className="h-4 w-4 text-emerald-600" />} />
          {expandedSections.has("pricing") && (
            <CardContent className="pt-0 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {therapy.pricing.packageOptions.map((pkg, i) => (
                  <div key={i} className="p-2 rounded border text-center bg-emerald-50/30">
                    <p className="text-[10px] font-medium text-muted-foreground">{pkg.name}</p>
                    <p className="text-lg font-bold text-emerald-700">₹{pkg.price.toLocaleString()}</p>
                    <p className="text-[9px] text-muted-foreground">{pkg.sessions} sessions</p>
                    <Badge className="bg-green-100 text-green-700 text-[8px] mt-1">{pkg.savings}</Badge>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2 bg-muted/30 rounded"><strong>Per Session:</strong> ₹{therapy.pricing.perSession}</div>
                <div className="p-2 bg-muted/30 rounded"><strong>Break-Even:</strong> {therapy.pricing.breakEven}</div>
                <div className="p-2 bg-muted/30 rounded"><strong>Monthly Revenue:</strong> {therapy.pricing.revenuePerMonth}</div>
              </div>
              <div className="p-2 bg-amber-50 rounded text-xs border border-amber-100">
                <strong>vs Competitors:</strong> {therapy.pricing.competitorComparison}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Training Pathway */}
      {therapy.training && (
        <Card className="border-violet-200">
          <SectionHeader id="training" title="Training & Certification Pathway" icon={<GraduationCap className="h-4 w-4 text-violet-600" />} />
          {expandedSections.has("training") && (
            <CardContent className="pt-0 space-y-3">
              {therapy.training.map((level, i) => (
                <div key={i} className="p-3 rounded border bg-violet-50/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={`text-[9px] ${i === 0 ? "bg-green-100 text-green-700" : i === 1 ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>{level.level}</Badge>
                    <span className="text-xs text-muted-foreground">{level.hours}</span>
                    <Badge variant="outline" className="text-[9px]">{level.certification}</Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">
                    <div>
                      <p className="font-medium text-muted-foreground uppercase mb-0.5">Skills to Master</p>
                      {level.skills.map((s, j) => (
                        <div key={j} className="flex items-center gap-1"><CheckCircle2 className="h-2.5 w-2.5 text-green-500" />{s}</div>
                      ))}
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground uppercase mb-0.5">Recommended Courses</p>
                      {level.courses.map((c, j) => (
                        <div key={j} className="flex items-center gap-1"><GraduationCap className="h-2.5 w-2.5 text-violet-500" />{c}</div>
                      ))}
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground uppercase mb-0.5">Key Books</p>
                      {level.books.map((b, j) => (
                        <div key={j} className="flex items-center gap-1"><BookOpen className="h-2.5 w-2.5 text-blue-500" />{b}</div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      )}

      {/* Case Log (Interactive — saves to DB) */}
      <Card className="border-rose-200">
        <SectionHeader id="caselog" title="Case Log (Record & Track)" icon={<FileText className="h-4 w-4 text-rose-600" />} />
        {expandedSections.has("caselog") && (
          <CardContent className="pt-0">
            <CaseLogWidget therapyId={id} therapyName={therapy.title} />
          </CardContent>
        )}
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button variant="outline" onClick={() => navigate(`/hms/spine-therapies/${id - 1}`)} disabled={id <= 1} className="text-xs">
          <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Previous
        </Button>
        <span className="text-xs text-muted-foreground">Therapy {id} of 19</span>
        <Button variant="outline" onClick={() => navigate(`/hms/spine-therapies/${id + 1}`)} disabled={id >= 19} className="text-xs">
          Next <ChevronDown className="h-3.5 w-3.5 ml-1 -rotate-90" />
        </Button>
      </div>
    </div>
  );
}
