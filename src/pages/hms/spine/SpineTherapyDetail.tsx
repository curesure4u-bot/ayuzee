import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity, ArrowLeft, Globe, Stethoscope, Heart, Brain, Clock,
  CheckCircle2, Leaf, Target, AlertTriangle, ChevronDown, ChevronUp,
  Users, Zap, Play, BookOpen, Hand,
} from "lucide-react";

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
  },
  11: { title: "Thai Massage & Sen Lines", origin: "Thailand", icon: "🇹🇭", category: "Manual Therapy", evidenceLevel: "Moderate", evidenceScore: 67, overview: "Thai Yoga Massage combines acupressure along Sen (energy) lines with assisted yoga stretching. Sen Sumana runs along the spine. Treatment on floor mat with patient fully clothed.", history: "Attributed to Jivaka Kumar Bhaccha (Buddha's physician, 2500 years ago). Influenced by Indian Ayurveda and Yoga, Chinese medicine, and indigenous Thai healing.", mechanism: "Combination of: point pressure (gate control), passive stretching (fascial release, muscle lengthening), joint mobilization (synovial nutrition), and compression (circulatory enhancement).", spineIndications: ["Stiffness/reduced mobility", "Mechanical back pain", "Hip-spine connection", "Postural correction", "Flexibility restoration"], contraindications: ["Acute disc herniation", "Fracture", "Severe osteoporosis", "DVT", "Pregnancy (modified only)"], measureTools: [{ name: "VAS Pain Scale", how: "Before/after session", frequency: "Every session" }, { name: "Sit-and-Reach", how: "Measure hamstring/spine flexibility", frequency: "Monthly" }, { name: "Spinal Rotation ROM", how: "Inclinometer", frequency: "Weekly" }], ayushIntegration: "Sen Sumana = Sushumna Nadi. Thai stretches = modified Yoga asanas. Combine with Pizhichil (warm oil pouring) before Thai stretching for lubricated deep flexibility work.", doctorProtocol: [{ title: "Sen Sumana (Spine Line) Protocol", content: "Thumb pressure along paraspinal muscles + assisted spinal twist + traction techniques.", steps: ["Patient prone on floor mat", "Palm press: walk palms along entire erector spinae", "Thumb press: both thumbs along Sen Sumana bilateral (1.5 cun from midline)", "Cobra stretch: lift patient's chest while pressing sacrum down", "Supine spinal twist: patient's knees to side, stabilize opposite shoulder", "Traction: pull both ankles with patient supine (axial decompression)", "Total: 60-90 min full session, 30 min spine-focused"] }], patientSelfCare: [{ title: "Self-Thai Yoga Spine Stretches (10 min)", content: "Adapted Thai stretches you can do alone at home for spine flexibility.", steps: ["Seated spinal twist: both directions, hold 30 sec each", "Cobra pose: prone, push up keeping hips down — hold 15 sec × 5", "Knee-to-chest: supine, hug one knee then both — 30 sec each", "Supine twist: knees to one side, shoulders flat — 30 sec each", "Cat-cow: on all fours, 10 slow repetitions with breath", "Child's pose: sit back on heels, arms forward — 60 sec"], safetyNote: "Move within comfort range. Never force rotation. Breathe throughout." }], combinationProtocols: [{ condition: "Chronic Stiffness", plan: "Thai massage full spine → Pizhichil → Patient self-stretches daily → Monthly maintenance Thai session" }] },
  12: { title: "Osteopathic & Chiropractic Concepts", origin: "USA/UK", icon: "🦴", category: "Manual Therapy", evidenceLevel: "Strong", evidenceScore: 82, overview: "Evidence-based manual techniques: Muscle Energy Technique (MET), positional release, craniosacral therapy, and myofascial unwinding. HVLA manipulation by trained practitioners only.", history: "Osteopathy: Andrew Taylor Still (1874). Chiropractic: DD Palmer (1895). Both evolved into evidence-based musculoskeletal medicine with manual therapy as core.", mechanism: "MET: isometric contraction against resistance → post-isometric relaxation → immediate ROM gain. Positional release: positioning joint at ease → resets abnormal neural reflexes → pain reduction.", spineIndications: ["Joint restriction/fixation", "SI joint dysfunction", "Facet joint pain", "Segmental hypomobility", "Post-trauma muscle guarding"], contraindications: ["HVLA: vertebrobasilar insufficiency", "Acute fracture", "Spinal malignancy", "Severe osteoporosis", "Cauda equina syndrome"], measureTools: [{ name: "VAS Pain Scale", how: "Before/after treatment", frequency: "Every session" }, { name: "Segmental ROM", how: "Passive motion testing at each vertebral level", frequency: "Every session" }, { name: "TART Assessment", how: "Tenderness, Asymmetry, Restricted ROM, Tissue texture changes", frequency: "Every visit" }], ayushIntegration: "MET parallels Meru Chikitsa (Ayurvedic spinal correction). Craniosacral rhythm assessment = Marma palpation of Adhipati Marma (cranium). Post-MET: apply warm oil + Nadi Sweda for sustained tissue response.", doctorProtocol: [{ title: "Muscle Energy Technique (MET) for Spine", content: "Patient actively contracts muscle against doctor's resistance → then passive stretch to new barrier. Restores joint motion safely.", steps: ["Identify restricted segment (passive motion testing)", "Position joint at restriction barrier", "Patient pushes against doctor's resistance: 20% effort, 5-7 seconds", "Patient relaxes completely", "Doctor takes joint to NEW barrier (further ROM)", "Repeat 3-5 times — each cycle gains more motion", "Final hold at new end-range for 30 seconds"] }, { title: "Positional Release (Counterstrain)", content: "Find tender point → position body until tenderness reduces 70% → hold 90 sec → slowly return. Resets neural loop.", steps: ["Locate tender point (typically anterior or posterior)", "Press point — note pain level (10/10 baseline)", "Slowly move patient's body seeking position that REDUCES tenderness to 3/10 or less", "Hold this 'position of comfort' for 90 seconds", "Return SLOWLY to neutral (do not snap back)", "Recheck tender point — should be dramatically less tender"] }], patientSelfCare: [{ title: "Self-MET for SI Joint", content: "Bridge + resist technique for SI joint self-correction at home.", steps: ["Lie on back, knees bent, feet flat", "Place fist between knees — squeeze GENTLY against fist 5 sec (adductors)", "Relax 5 sec", "Place belt/band around knees — push OUT against band 5 sec (abductors)", "Relax 5 sec", "Repeat squeeze-push cycle 5 times", "Finish: hug both knees to chest, rock gently side to side"], safetyNote: "Use only 20-30% effort — gentle resistance, never maximum force." }], combinationProtocols: [{ condition: "SI Joint Dysfunction", plan: "MET in clinic → Kati Basti → Patient self-MET bridge daily → Monthly professional reassessment" }, { condition: "Facet Joint Restriction", plan: "Positional release + MET → Meru Chikitsa → Agnikarma at facet level → Patient mobility exercises daily" }] },
  13: { title: "Sujok Therapy", origin: "South Korea (Prof. Park Jae Woo)", icon: "🌀", category: "Microsystem", evidenceLevel: "Low-Moderate", evidenceScore: 55, overview: "Hand and foot microsystem therapy using correspondence theory, Six Ki energy, twist therapy, and seed therapy. Middle finger = spine in standard correspondence. Extremely accessible and safe.", history: "Developed by Prof. Park Jae Woo (1987). Combines Korean, Chinese, and Indian philosophy. 'Su' = hand, 'Jok' = foot in Korean. Global following especially in India.", mechanism: "Correspondence stimulation + energy balance (Six Ki = similar to Panchamahabhuta). Seed on correspondence point provides continuous micro-stimulation. Twist therapy creates spiral energy alignment.", spineIndications: ["Quick accessible pain relief", "Energy imbalance correction", "Maintenance therapy", "Gentle/non-invasive option", "Children and elderly"], contraindications: ["Virtually none — extremely safe", "Local skin injury (avoid area)", "Severe peripheral neuropathy (reduced sensation)"], measureTools: [{ name: "VAS Pain Scale", how: "Before/after Sujok treatment", frequency: "Every session" }, { name: "Correspondence Tenderness", how: "Probe hand/foot points — document which respond", frequency: "Each visit" }], ayushIntegration: "Sujok Six Ki theory correlates with Ayurvedic Panchamahabhuta. Wind=Vata, Heat=Pitta, Humidity=Kapha. Combine Sujok seeds on hand with Marma oil application for dual microsystem stimulation.", doctorProtocol: [{ title: "Standard Correspondence Treatment", content: "Map spine pain to corresponding zone on hand. Stimulate with seeds, magnets, moxa, or needle.", steps: ["Standard: middle finger dorsum midline = spine (tip=head, base=lumbar)", "Insect: thumb = head, each finger = limb, palm = torso", "Locate spine problem zone on hand correspondence", "Apply diagnostic probe — find most tender point", "Treatment: seed + tape (continuous) OR moxa (warming) OR color pen (energy)", "Add Sujok ring on corresponding finger for ongoing stimulation"] }, { title: "Twist Therapy for Spine", content: "Spiral movement exercises that create energy flow along spine. Based on spiral/twist pattern of DNA and natural growth.", steps: ["Stand with feet shoulder-width apart", "Twist torso left-right slowly with arms relaxed (swinging)", "Head follows body twist — eyes look in direction of twist", "30 seconds slow twisting → gradually increase speed to comfortable pace", "Continue 3-5 minutes", "Principle: spiral movement restores natural energy flow in spine"] }], patientSelfCare: [{ title: "Seed Therapy Self-Application", content: "Apply seeds to hand spine points for 24/7 stimulation between doctor visits.", steps: ["Find spine line: dorsum (back) of middle finger, center line", "Place seed on most painful corresponding point", "Also add: seed on thumb tip (head) if headache present", "Press seeds 20-30 times whenever pain occurs", "Replace every 3-5 days", "Color: mark green pen on inflammation point, red on cold/weak point"], safetyNote: "Seeds are completely safe. Remove if skin irritation occurs." }, { title: "Daily Twist Therapy (5 min)", content: "Simple standing twist exercise for spine energy flow.", steps: ["Morning: stand relaxed, twist torso left-right 100 times", "Arms swing freely like wet rope", "Speed: comfortable rhythmic pace", "Focus: spine feels like wringing a towel — releasing tension", "Finish: stand still 30 seconds, feel energy flow"], safetyNote: "Start slow if acute pain. Avoid twisting if disc herniation is active." }], combinationProtocols: [{ condition: "General Spine Maintenance", plan: "Sujok seeds on hand spine zone + Twist therapy daily + Monthly Panchakarma maintenance + AYUSH herbs" }] },
  14: { title: "Marma Therapy (Ayurveda)", origin: "India (Sushruta Samhita, 600 BCE)", icon: "🙏", category: "Traditional System", evidenceLevel: "Traditional + Emerging Research", evidenceScore: 63, overview: "Marma are vital energy points (107 in body) where Prana concentrates. Spine-related Marmas control energy flow through the back. Stimulation with pressure, oil, heat, or mantra restores Pranic flow.", history: "Documented by Sushruta (surgeon, 600 BCE) as Marma Shastra for surgical safety. Ashtanga Hridaya lists therapeutic applications. Kalari martial arts uses Marma for combat and healing.", mechanism: "Marma points are neurovascular junctions where nerves, blood vessels, muscles, tendons, and bones concentrate. Stimulation activates neurohumoral responses, releases neuropeptides, and modulates autonomic function.", spineIndications: ["Vata-type spine pain", "Energy blockage (Prana obstruction)", "Chronic stiffness", "Nerve-related symptoms", "Post-Panchakarma maintenance", "Constitutional weakness"], contraindications: ["Directly over fracture", "Acute inflammation (gentle only)", "Sadyopranahar Marma (lethal points — heavy stimulation avoided)", "Pregnancy (abdominal Marma)"], measureTools: [{ name: "VAS Pain Scale", how: "Before/after Marma therapy", frequency: "Every session" }, { name: "Marma Tenderness Score (0-3)", how: "Palpation each Marma: 0=normal, 1=mild, 2=moderate, 3=severe tenderness", frequency: "Every session" }, { name: "Prana Flow Assessment", how: "Practitioner palpation + patient subjective energy level", frequency: "Monthly" }], ayushIntegration: "Core AYUSH therapy — directly part of Ayurvedic clinical practice. Integrate with: Abhyanga (oil massage amplifies Marma effect), Basti (Apana Vayu correction), Nasya (Prana Vayu), and Yoga (Prana channel opening).", doctorProtocol: [{ title: "15 Spine-Related Marma Points", content: "Key Marma points affecting spine health — location, stimulation method, and effect.", steps: ["Adhipati (crown) — governs all Marma, affects whole spine via CNS", "Krikatika (C1-C2 junction) — neck mobility, cervical nerve supply", "Amsa (shoulder tip) — upper back, arm supply", "Amsaphalaka (infrascapular) — thoracic spine, scapular control", "Brihati (T5-T6 level) — mid-back, respiratory connection", "Kukundara (sacral dimples/PSIS) — lumbar spine, Apana Vayu seat", "Katikataruna (hip joint) — hip-spine connection", "Nitamba (buttock center) — sciatic nerve, piriformis", "Parshvasandhi (lateral trunk) — lateral spine, QL", "Vitapa (inguinal) — psoas, hip flexor-spine connection", "Janu (knee) — lower limb chain to spine", "Gulpha (ankle) — foundation affecting entire spine alignment", "Nabhi (navel) — center of body, affects psoas and deep core", "Hridaya (chest center) — thoracic alignment, rib mobility", "Sthapani (between eyebrows) — CNS calming, pain modulation"] }, { title: "Marma Stimulation Techniques", content: "Different methods based on condition and Dosha.", steps: ["Clockwise circular pressure (30 sec): TONIFYING — for weakness/depletion", "Counter-clockwise circular (30 sec): REDUCING — for congestion/excess", "Sustained hold (60-90 sec): BALANCING — for general Dosha correction", "Oil application (warm til/sesame): SNEHANA — deep nourishment", "Gentle tapping: AWAKENING — for sluggish/Kapha-blocked Marma", "Frequency: hold each Marma 30-60 sec, work through spine Marmas sequentially"] }], patientSelfCare: [{ title: "Morning Marma Activation (7 points, 5 min)", content: "Self-press accessible spine-related Marma points daily for energy flow.", steps: ["1. Adhipati (top of head) — press gently 30 sec with fingertips", "2. Krikatika (base of skull, both sides) — circular press 30 sec", "3. Kukundara (sacral dimples) — press with thumbs 30 sec", "4. Katikataruna (hip creases) — press where leg meets trunk 30 sec", "5. Janu (center of knee back) — press 15 sec each side", "6. Gulpha (ankle joint center) — circular press 15 sec each", "7. Nabhi (navel center) — gentle clockwise massage 30 sec"], safetyNote: "Gentle to moderate pressure. Apply til taila (sesame oil) to fingertips for enhanced effect." }, { title: "Oil + Marma Self-Treatment (Evening)", content: "Warm sesame oil application on spine-related Marma for deep Vata pacification before bed.", steps: ["Warm 2 tbsp sesame/Mahanarayan oil in palms", "Apply to Kukundara Marma (sacral dimples) — massage 60 sec", "Apply along entire spine midline — long strokes downward", "Press Krikatika Marma (skull base) with oiled fingers — 60 sec", "Press Gulpha Marma (ankles) — 30 sec each", "Total: 5-7 minutes", "Best before bed — Vata pacification aids sleep"], safetyNote: "Use warm (not hot) oil. Place old towel on bed. Consistent daily practice gives best results." }], combinationProtocols: [{ condition: "Vata-type Chronic Back Pain", plan: "Full Marma therapy + Kati Basti + Basti karma + Patient self-Marma morning/evening + Ashwagandha + Yoga" }, { condition: "Post-Panchakarma Maintenance", plan: "Weekly Marma therapy + Patient daily self-Marma oil routine + Monthly follow-up + Rasayana herbs" }] },
  15: { title: "Pranic Healing & Energy Work", origin: "Philippines/India (Master Choa Kok Sui)", icon: "✨", category: "Energy-Based", evidenceLevel: "Low (energy-based, limited RCTs)", evidenceScore: 45, overview: "Energy-based healing working with the body's bioplasmic field (aura) and chakras along the spine. Techniques include scanning for congestion/depletion, sweeping (cleansing), and energizing (projecting prana).", history: "Systematized by Master Choa Kok Sui (Philippines, 1987). Draws from Indian Pranic concepts, Chinese Qi Gong, and Theosophical tradition. Now practiced in 120+ countries.", mechanism: "Theory: disease manifests first in energy body before physical body. Spine chakras (7 major) when congested or depleted affect corresponding vertebral segments. Clearing energy body supports physical healing.", spineIndications: ["Stress/emotional back pain", "Energy depletion", "Post-treatment energy restoration", "Psychosomatic spine conditions", "Chronic pain with emotional component", "Maintenance and prevention"], contraindications: ["Not a substitute for medical treatment (complementary only)", "Psychiatric conditions (modified approach)", "Critical/emergency conditions (refer to medical care first)"], measureTools: [{ name: "VAS Pain Scale", how: "Before/after energy healing session", frequency: "Every session" }, { name: "Chakra Activity Score", how: "Practitioner scanning — document size/congestion/depletion per chakra", frequency: "Every session" }, { name: "Stress/Anxiety Scale (GAD-7)", how: "Patient questionnaire", frequency: "Baseline + monthly" }], ayushIntegration: "Pranic concepts directly parallel Ayurvedic Prana Vayu/Ojas/Tejas framework. 7 Chakras = 7 key Marma clusters along spine. Energy sweeping = Marma-based Pranic cleansing. Combine with Yoga Pranayama for self-practice.", doctorProtocol: [{ title: "Spine Chakra Assessment & Treatment", content: "Scan 7 major chakras along spine for congestion or depletion. Treat accordingly.", steps: ["Scan: hands 4-6 inches from body, feel for heat/cold/tingling/heaviness along spine", "Root (L5-Coccyx): security, stability — congested = chronic pain/fear", "Sacral (L1-L3): creativity, reproduction — depleted = weakness", "Solar Plexus (T12-T8): power, digestion — congested = tension/anger", "Heart (T1-T4): emotions, respiration — depleted = upper back pain", "Throat (C4-C7): communication — congested = neck stiffness", "Treatment: SWEEP congested chakras (hand flicking away from body) × 30 sweeps", "ENERGIZE depleted chakras (project prana from palms) × 2-3 minutes"] }], patientSelfCare: [{ title: "Self Energy Hygiene for Spine (5 min)", content: "Basic energy self-care to keep spine chakras clear and balanced.", steps: ["Stand or sit quietly, close eyes", "Visualize bright white/golden light entering crown of head", "Guide this light DOWN your spine slowly — illuminating each vertebra", "Where you feel pain/heaviness: visualize light dissolving the darkness", "Continue light all the way to tailbone (coccyx)", "Exhale and visualize grey/dirty energy leaving through feet into earth", "Finish: 3 deep breaths, feeling spine light and energized"], safetyNote: "This is visualization/meditation — completely safe. Combine with physical treatments for best results." }, { title: "Twin Hearts Meditation (Spine Focus)", content: "Modified meditation activating heart and crown chakras — floods spine with healing energy.", steps: ["Sit comfortably, spine upright", "Focus on heart center (mid-chest) — feel love/compassion for 2 minutes", "Focus on crown (top of head) — feel connection to universal energy 2 minutes", "Visualize golden light flowing from crown DOWN through entire spine", "At each vertebral level: pause and project love/healing to that segment", "Continue to coccyx, then let energy flow into earth", "Rest in stillness 1 minute", "Total: 10-15 minutes, morning or evening"], safetyNote: "If dizziness or headache: stop and rest. Ground yourself by pressing feet firmly to floor." }], combinationProtocols: [{ condition: "Stress-Related Chronic Back Pain", plan: "Pranic healing sessions (weekly) + Shirodhara + Meditation instruction + Yoga + Patient daily spine energy visualization" }, { condition: "Emotional Component to Pain", plan: "Pranic chakra clearing + Counseling + Basti karma (Vata) + Ashwagandha + Patient Twin Hearts daily" }] },
};

export default function SpineTherapyDetail() {
  const { therapyId } = useParams();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"doctor" | "patient">("doctor");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["overview"]));

  const id = parseInt(therapyId || "1");
  const therapy = allTherapyData[id];

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

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button variant="outline" onClick={() => navigate(`/hms/spine-therapies/${id - 1}`)} disabled={id <= 1} className="text-xs">
          <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Previous
        </Button>
        <span className="text-xs text-muted-foreground">Therapy {id} of 15</span>
        <Button variant="outline" onClick={() => navigate(`/hms/spine-therapies/${id + 1}`)} disabled={id >= 15} className="text-xs">
          Next <ChevronDown className="h-3.5 w-3.5 ml-1 -rotate-90" />
        </Button>
      </div>
    </div>
  );
}
