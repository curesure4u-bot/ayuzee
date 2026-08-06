import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import {
  Activity, BookOpen, ArrowLeft, CheckCircle2, Clock, Play,
  ChevronDown, ChevronUp, Leaf, Brain, Stethoscope, Heart,
  Users, AlertTriangle, FileText, Dumbbell, Eye, Zap,
} from "lucide-react";

// Full topic data for all 13 modules
const allModuleData: Record<number, { title: string; subtitle: string; level: string; ayush: string; duration: number; description: string; topics: { title: string; type: string; content: string; ayushContext?: string; doctorNote?: string; patientTip?: string }[] }> = {
  1: {
    title: "Posture Introduction", subtitle: "Foundation of Spinal Assessment",
    level: "beginner", ayush: "Integrative", duration: 45,
    description: "Understanding posture, postural control systems, developmental curves, and Janda's muscle imbalance theory from an AYUSH perspective.",
    topics: [
      { title: "Definition of Posture", type: "text", content: "Posture is the position of the body in space, maintained by the coordinated action of muscles working against gravity. In Ayurveda, posture reflects the state of Asthi (bone) and Mamsa (muscle) Dhatu.", ayushContext: "Sthira Sukham Asanam — steady & comfortable position (Yoga Sutra 2.46)", doctorNote: "Assess posture as part of Dashavidha Pareeksha", patientTip: "Good posture = less pain, more energy" },
      { title: "Good Posture vs Faulty Posture", type: "text", content: "Good posture: minimal stress on joints, efficient muscle use, proper alignment. Faulty posture: increased joint stress, muscle fatigue, pain over time.", ayushContext: "Good posture maintains Vata flow (Prana Vayu); faulty posture creates Sanga (obstruction)", doctorNote: "Document baseline posture before starting treatment" },
      { title: "Disadvantages of Upright Posture", type: "text", content: "Humans pay a price for bipedalism: increased spinal loading, disc degeneration, varicose veins, hernias. The spine bears the full weight of gravity.", ayushContext: "Gravity = Gurutva Guna; constant downward force increases Vata in spine" },
      { title: "Posture Control — Definition", type: "text", content: "Posture control is the ability to maintain the body's center of mass within the base of support using sensory, CNS, and musculoskeletal systems.", ayushContext: "Three pillars mirror Tridosha: Sensory=Pitta, CNS=Vata, Musculoskeletal=Kapha" },
      { title: "Sensory System in Posture", type: "text", content: "Visual, vestibular, and somatosensory systems provide input. Eyes detect horizon, inner ear senses head position, proprioceptors sense joint angles.", doctorNote: "Test all three systems in elderly patients — fall risk assessment" },
      { title: "CNS Processing & Motor Output", type: "text", content: "Brain integrates sensory input and sends motor commands. Cerebellum coordinates timing; basal ganglia regulate tone. Damage = postural dysfunction.", ayushContext: "Prana Vayu (CNS function) coordinates Vyana Vayu (motor output)" },
      { title: "Musculoskeletal Effectors", type: "text", content: "Muscles, bones, and joints execute postural adjustments. Strength, flexibility, and joint integrity determine postural capacity.", ayushContext: "Kapha Dosha maintains Sthiratva (stability) of musculoskeletal system" },
      { title: "Static vs Dynamic Posture", type: "text", content: "Static: maintaining a position (standing, sitting). Dynamic: maintaining alignment during movement (walking, lifting). Both require assessment.", patientTip: "Both sitting posture at work AND walking posture matter equally" },
      { title: "Developmental Curves", type: "text", content: "Primary curves (thoracic, sacral) present at birth — kyphotic. Secondary curves (cervical, lumbar) develop with lifting head and walking — lordotic.", ayushContext: "Spinal curves develop with Bala (strength) — linked to Kapha development in childhood" },
      { title: "Why Do Postural Assessment?", type: "text", content: "Provides baseline information, guides holistic treatment planning, saves clinical time, identifies root cause rather than just symptoms.", doctorNote: "Document before AND after treatment for evidence-based outcomes" },
      { title: "Case Examples", type: "case_study", content: "Back pain from anterior pelvic tilt, runner's knee from pronation, frozen shoulder from rounded posture — all postural origins.", patientTip: "Your pain source may not be where you feel the pain" },
      { title: "Contraindications for Assessment", type: "text", content: "Do NOT assess: anxious patients, those unable to stand, medically unstable, patients who refuse consent. Safety first.", doctorNote: "Always obtain verbal consent; document refusal if applicable" },
      { title: "Postural Muscle Characteristics", type: "text", content: "Type I fibers (slow-twitch), anti-gravity function, fatigue-resistant, tend to become tight/short when dysfunctional. Core stability muscles.", ayushContext: "Postural muscles = Sthira Mamsa; governed by Kapha for endurance" },
      { title: "Janda's Muscle Imbalance Theory", type: "text", content: "Vladimir Janda identified predictable patterns of tight and weak muscles. Tight muscles inhibit their antagonists, creating crossed patterns.", ayushContext: "Imbalance = Vaishamya; Janda's theory parallels Dosha Vaishamya concept", doctorNote: "This theory forms the basis for Modules 8-13 syndrome treatments" },
      { title: "Short/Tight Muscle → Weak Mechanism", type: "text", content: "Chronically shortened muscles develop increased tone, inhibit antagonists via reciprocal inhibition. Result: predictable weakness patterns.", patientTip: "Tight hip flexors → weak glutes → back pain (common in desk workers)" },
      { title: "Weak Muscle → Tight Mechanism", type: "text", content: "Weak muscles allow opposing muscles to shorten. Also, weak muscles may feel 'tight' due to protective spasm — not true shortness.", doctorNote: "Differentiate true shortness from protective spasm before stretching" },
      { title: "Chronically Lengthened Muscle Feels Tight", type: "text", content: "A muscle held in lengthened position (e.g., rhomboids in rounded shoulders) feels tight due to strain, but is actually overlengthened — do NOT stretch it.", patientTip: "Feeling tight ≠ needs stretching. Sometimes you need strengthening instead." },
      { title: "Equipment Required", type: "practical", content: "Assessment room with space, full-length mirror/grid, body crayons/stickers, posture chart, anatomical model, plumb line, camera.", doctorNote: "Minimal investment — can start with plumb line + camera + printed chart" },
      { title: "Anatomical Landmarks", type: "text", content: "Key landmarks: scapula (medial border, inferior angle), PSIS, spinous processes, olecranon, knee creases, calf midline, Achilles tendon.", ayushContext: "Many landmarks overlap with Marma points — PSIS near Kukundara Marma" },
    ],
  },
  2: {
    title: "Posterior View Assessment", subtitle: "Back View Observation & Analysis",
    level: "intermediate", ayush: "Integrative", duration: 60,
    description: "Complete posterior view posture assessment covering head to foot with AYUSH muscle correlation tables.",
    topics: [
      { title: "Posterior View Standard Alignment", type: "text", content: "Plumb line passes through: occiput, between scapulae, spinous processes, gluteal cleft, midline between knees, between ankles.", doctorNote: "Use this as baseline reference for all deviations" },
      { title: "Head Position — Torticollis", type: "text", content: "Wry neck: lateral flexion + rotation. Check SCM, upper trapezius. Can be congenital or acquired (Vata-type spasm).", ayushContext: "Greeva Stambha (neck stiffness) — Vata aggravation in Greeva Pradesh" },
      { title: "Shoulder Height Asymmetry", type: "text", content: "Elevated shoulder indicates upper trapezius tightness or contralateral weakness. Rule out scoliosis, leg length discrepancy.", doctorNote: "Palpate both AC joints simultaneously for accurate comparison" },
      { title: "Scapular Adduction & Abduction", type: "text", content: "Adducted scapulae: tight rhomboids/middle traps. Abducted: weak rhomboids, tight serratus anterior or pec minor.", ayushContext: "Scapular position reflects Prana Vayu flow through thoracic region" },
      { title: "How to Palpate Medial Border of Scapula", type: "practical", content: "Patient standing relaxed. Slide fingers along medial border from superior angle to inferior angle. Note distance from spine (normal: 7-8cm).", patientTip: "Stand relaxed with arms at sides — don't try to 'correct' your posture during assessment" },
      { title: "Inferior Angle of Scapula", type: "text", content: "Should be level bilaterally at T7-T8. Asymmetry suggests rotation or tilt of the scapula.", doctorNote: "Mark with body crayon for photo documentation" },
      { title: "Scapular Rotation (Upward/Downward)", type: "text", content: "Upward rotation: upper trap/serratus dominance. Downward rotation: levator scap/rhomboid dominance. Affects shoulder mechanics.", ayushContext: "Amsa Sandhi (shoulder joint) dysfunction relates to Vyana Vayu imbalance" },
      { title: "Muscle Length Changes — Scapular Position Table", type: "table", content: "Adducted: rhomboids short, serratus long. Abducted: serratus/pec minor short, rhomboids long. Upward rotated: upper trap short, levator long.", doctorNote: "This table guides your corrective exercise prescription directly" },
      { title: "Thoracic Spine Alignment", type: "text", content: "Should be straight in posterior view. Lateral deviation suggests scoliosis. Use fingernail trick: run finger down spinous processes.", ayushContext: "Thoracic deviation affects Prana & Udana Vayu — impacts breathing and voice" },
      { title: "Trunk Rotation", type: "text", content: "One side appears wider. Observe rib prominence, trunk shift. Right rotation: right side wider posteriorly. Associated muscle changes.", doctorNote: "Ask patient to bend forward (Adam's test) to confirm rotational component" },
      { title: "Trunk Rotation — Muscle Length Table", type: "table", content: "Right rotation: Right obliques short, left obliques long. Left rotation: Left obliques short, right obliques long. Affects core stability.", doctorNote: "Correlate with patient's dominant hand usage and occupational habits" },
      { title: "Skin Creases Asymmetry", type: "text", content: "Deeper skin folds on one side indicate lateral trunk shift or scoliosis. Observe waist creases, flank folds.", patientTip: "Uneven waist creases when wearing belt/sari is a self-check sign" },
      { title: "Thoracic Arm Distance", type: "text", content: "Space between arm and trunk. Asymmetry suggests lateral trunk shift. Greater space = trunk shifted away from that side." },
      { title: "Elbow Position", type: "text", content: "Compare olecranon process height bilaterally. Difference suggests shoulder or spine asymmetry above." },
      { title: "Hand Position", type: "text", content: "Observe hanging hand position — palms facing backward suggests internal rotation of humerus (rounded shoulder component)." },
      { title: "Lumbar Spine Observation", type: "text", content: "Lateral deviation, muscle bulk asymmetry, paravertebral fullness. Correlate with pelvic position below.", ayushContext: "Kati Pradesh (lumbar region) — primary seat of Vata Dosha" },
      { title: "Pelvis — Lateral Tilt", type: "text", content: "One iliac crest higher than other. Causes: leg length discrepancy, hip adductor tightness, habitual standing pattern.", doctorNote: "Measure with tape from ASIS to medial malleolus to confirm leg length difference" },
      { title: "Effects of Laterally Tilted Pelvis — Table", type: "table", content: "High side: hip adductors short, abductors long, lumbar concavity. Low side: hip abductors short, adductors long, lumbar convexity.", ayushContext: "Pelvic tilt disturbs Apana Vayu — affects elimination, menstruation, lower limb circulation" },
      { title: "PSIS Symmetry", type: "text", content: "Posterior Superior Iliac Spine should be level. Asymmetry confirms pelvic tilt or rotation. Dimples of Venus help locate.", patientTip: "The two dimples on your lower back should be at the same level" },
      { title: "Pelvic Rotation", type: "text", content: "One buttock appears larger/more prominent. Indicates pelvic rotation in transverse plane. Correlate with foot position.", doctorNote: "Palpate both ASIS from front AND PSIS from back to confirm rotation direction" },
      { title: "Buttock Crease Symmetry", type: "text", content: "Unequal gluteal folds may indicate muscle wasting, hip pathology, or pelvic obliquity." },
      { title: "Leg Length Difference", type: "text", content: "True (femur/tibia) vs Apparent (pelvic tilt causing). Measure: ASIS to medial malleolus (true), umbilicus to medial malleolus (apparent).", doctorNote: "Even 5mm difference can cause compensatory scoliosis over time" },
      { title: "Genu Varum & Genu Valgum", type: "text", content: "Varum (bow legs): gap between knees when ankles together. Valgum (knock knees): gap between ankles when knees together.", ayushContext: "Varum = Vata type (dryness in joint); Valgum = Kapha type (laxity in ligaments)" },
      { title: "Posterior Knee Observation", type: "text", content: "Hyperextension (genu recurvatum), popliteal swelling, calf muscle bulk comparison." },
      { title: "Calf Bulk Symmetry", type: "text", content: "Unequal calf size suggests disuse atrophy, neurological involvement (L5-S1), or previous injury." },
      { title: "Achilles Tendon Alignment", type: "text", content: "Should be vertical. Lateral bow = pronated foot (Pes Valgus). Medial bow = supinated foot (Pes Varus).", patientTip: "Check your shoe heel wear pattern — uneven wear reveals foot alignment" },
      { title: "Foot Position — Pes Valgus vs Pes Varus", type: "text", content: "Valgus (pronated): flat arch, medial ankle prominent, weight on inner foot. Varus (supinated): high arch, lateral ankle prominent, weight on outer foot.", ayushContext: "Pronation = Kapha excess (heaviness, collapse); Supination = Vata excess (rigidity)" },
      { title: "Table: Changes with Pes Valgus and Varus", type: "table", content: "Valgus: medial malleolus prominent, tibialis posterior weak, peronei short, weight medial. Varus: lateral malleolus prominent, peronei weak, tibialis short, weight lateral.", doctorNote: "Foot position affects entire kinetic chain — always assess in spine patients" },
      { title: "Other Posterior Observations", type: "text", content: "Note scars (surgical history), blemishes (skin conditions), taping (previous treatment), muscle wasting, swelling, or discoloration." },
    ],
  },
  3: {
    title: "Anterior View Assessment", subtitle: "Front View Observation & Analysis",
    level: "intermediate", ayush: "Integrative", duration: 50,
    description: "Full anterior posture assessment including face symmetry, clavicle position, carrying angle, Q-angle, and Prakriti correlation.",
    topics: [
      { title: "Face Symmetry", type: "text", content: "Observe eyes, ears, jaw alignment. Asymmetry may indicate TMJ dysfunction, cranial nerve involvement, or habitual head tilt.", ayushContext: "Face reflects Ojas level and overall Dosha balance — Mukha Pareeksha" },
      { title: "Head Position (Rotation, Tilt)", type: "text", content: "Rotation: chin not centered. Tilt: ear closer to one shoulder. Both affect cervical spine loading and upper trap tension." },
      { title: "Muscle Tone Observation", type: "text", content: "Visual assessment of muscle bulk symmetry — deltoids, pectorals, quadriceps. Wasting suggests disuse or neurological involvement.", doctorNote: "Compare bilateral muscle tone as part of Mamsa Dhatu assessment" },
      { title: "Clavicles (Level, Symmetry)", type: "text", content: "Should be level and symmetric. Elevated clavicle = upper trap tightness. Depressed = lower trap weakness or nerve involvement." },
      { title: "Shoulder Level", type: "text", content: "Confirm findings from posterior view. Rounded shoulders visible as anterior prominence of humeral head.", ayushContext: "Amsa Pradesh assessment — Vyana Vayu distribution to upper limbs" },
      { title: "Rounded Shoulders (Protraction)", type: "text", content: "Scapulae protracted, humeral heads visible anteriorly. Pec minor short, serratus anterior/rhomboids weak. Common in desk workers.", patientTip: "If you can see your shoulder ball from front, shoulders are rounded" },
      { title: "Trunk Alignment", type: "text", content: "Lateral shift visible from front. Correlate with posterior view findings. Note rib flare asymmetry." },
      { title: "Carrying Angle (Elbow)", type: "text", content: "Normal: 5-10° males, 10-15° females. Increased (cubitus valgus) or decreased (cubitus varus) affects arm mechanics.", doctorNote: "Increased carrying angle in females is normal — don't over-diagnose" },
      { title: "Arm Position (Internal/External Rotation)", type: "text", content: "Palm facing backward = internal rotation (subscapularis/pec tightness). Palm forward = neutral/external rotation.", patientTip: "Stand relaxed — if backs of hands face forward, shoulders are internally rotated" },
      { title: "Hand and Wrist Position", type: "text", content: "Observe for ulnar/radial deviation, finger alignment. May indicate neural tension or chronic postural adaptation." },
      { title: "Abdomen (Protrusion, Shape)", type: "text", content: "Lower abdominal protrusion suggests weak transversus abdominis. General protrusion may indicate anterior pelvic tilt.", ayushContext: "Udara Pradesh — Agni & Pachaka Pitta assessment. Protruding = Kapha accumulation" },
      { title: "Pelvis (ASIS Level, Rotation)", type: "text", content: "Palpate both ASIS — should be level and equidistant from midline. Asymmetry = rotation or lateral tilt." },
      { title: "Pelvic Rotation Effects — Table", type: "table", content: "Forward rotation of right ilium: right foot supinates, left foot pronates. Left ilium forward: left supinates, right pronates.", doctorNote: "Pelvic rotation is the missing link in many knee and foot problems" },
      { title: "Muscle Bulk Symmetry", type: "text", content: "Compare quadriceps, adductors, tibialis anterior bilaterally. >1cm difference in circumference is clinically significant." },
      { title: "Knee Alignment (Genu Valgum/Varum)", type: "text", content: "Confirm posterior view findings. From anterior, note patella position relative to foot alignment.", ayushContext: "Janu Sandhi (knee joint) — Shleshaka Kapha maintains lubrication and stability" },
      { title: "Knee Changes Table — Valgum and Varum", type: "table", content: "Valgum: MCL stretched, LCL short, lateral quad dominant. Varum: LCL stretched, MCL short, medial quad dominant." },
      { title: "Patellar Position", type: "text", content: "Should face forward. Squinting patella (inward facing) suggests femoral internal rotation or VMO weakness." },
      { title: "Tibia Position (Internal/External Rotation)", type: "text", content: "Tibial torsion affects foot position and knee mechanics. Internal rotation = toe-in gait. External = toe-out." },
      { title: "Craig's Test Concept", type: "text", content: "Determines femoral anteversion/retroversion. Excessive anteversion → internal rotation → medial knee stress.", doctorNote: "Important differential in young patients with knee pain" },
      { title: "Q-Angle", type: "text", content: "Angle between quadriceps pull line and patellar tendon. Normal: 13° males, 18° females. Increased = lateral patellar tracking.", patientTip: "Wide hips + knock knees = higher Q-angle = higher risk of knee pain" },
      { title: "Ankle Alignment", type: "text", content: "Observe malleoli position, ankle valgus/varus, Achilles alignment from front." },
      { title: "Foot Position — Pes Cavus & Pes Planus", type: "text", content: "Cavus (high arch): rigid, poor shock absorption, Vata type. Planus (flat): hypermobile, poor stability, Kapha type.", ayushContext: "Pes Cavus = Vata (rigidity/dryness); Pes Planus = Kapha (laxity/heaviness)" },
      { title: "Other Anterior Observations", type: "text", content: "Scars, skin changes, swelling, asymmetric hair patterns, nail changes — all provide clinical information." },
    ],
  },
  4: {
    title: "Lateral View Assessment", subtitle: "Side View & Plumb Line Analysis",
    level: "intermediate", ayush: "Integrative", duration: 35,
    description: "Lateral view standard alignment using plumb line — forward head, kyphosis, lordosis, pelvic tilt, and sway back.",
    topics: [
      { title: "Lateral View Standard Alignment", type: "text", content: "Plumb line passes through: ear lobe, acromion process, greater trochanter, just anterior to knee joint center, just anterior to lateral malleolus.", doctorNote: "This is the gold standard reference — any deviation is documented" },
      { title: "Head Position (Forward Head)", type: "text", content: "Ear anterior to plumb line = forward head posture. Every inch forward adds 10 lbs of cervical loading. Extremely common in device users.", ayushContext: "Forward head disrupts Prana Vayu flow through Greeva — causes Shiroroga (headache)", patientTip: "Ear should be directly above shoulder when viewed from side" },
      { title: "Cervical Spine Alignment", type: "text", content: "Normal cervical lordosis should be maintained. Reduced lordosis (military neck) or excessive lordosis — both problematic.", ayushContext: "Cervical lordosis maintains Dhamani (artery) flow to brain — reduced = Vata increase" },
      { title: "Cervicothoracic Junction", type: "text", content: "C7-T1 area: Dowager's hump (excessive prominence), buffalo hump (fat pad), or flattening. Common stress point.", doctorNote: "Cervicothoracic junction dysfunction is root of many UCS presentations" },
      { title: "Thoracic Kyphosis", type: "text", content: "Increased curvature = hyperkyphosis (Scheuermann's, osteoporosis, habitual). Decreased = flat back. Affects breathing capacity.", ayushContext: "Increased kyphosis compresses Hridaya (heart) and Phupphusa (lungs) — impacts Prana", patientTip: "Excessive rounding of upper back limits your breathing capacity by 30%" },
      { title: "Abdomen Observation", type: "text", content: "Protruding abdomen seen from lateral view indicates anterior pelvic tilt, weak core, or visceral obesity.", ayushContext: "Sthaulya (obesity) concentrated in Udara increases anterior pelvic tilt" },
      { title: "Lumbar Lordosis (Increased vs Decreased)", type: "text", content: "Increased: hyperlordosis (anterior pelvic tilt, weak abs). Decreased: flat back (posterior pelvic tilt, tight hamstrings).", doctorNote: "Measure with inclinometer or visual estimation against plumb line" },
      { title: "Pelvis Tilt — Anterior vs Posterior", type: "text", content: "Anterior: ASIS lower than PSIS (>10°). Posterior: ASIS higher than PSIS. Determines lumbar curve and muscle patterns.", patientTip: "Imagine your pelvis is a bowl of water — tipping forward spills front, backward spills back" },
      { title: "Anterior vs Posterior Pelvic Tilt Table", type: "table", content: "Anterior: ASIS down, lordosis increased, hip flexors/erectors short, abs/glutes long. Posterior: ASIS up, lordosis decreased, hamstrings/abs short, hip flexors/erectors long.", ayushContext: "Anterior tilt = Pitta-Kapha pattern (structural excess); Posterior = Vata pattern (wasting)" },
      { title: "Sway Back Posture", type: "text", content: "Pelvis displaces forward of plumb line, thorax displaces backward. Hip hyperextension, thoracolumbar kyphosis, forward head.", doctorNote: "Do not confuse with anterior tilt — sway back has POSTERIOR pelvic tilt with forward pelvis displacement" },
      { title: "Ankle Alignment", type: "text", content: "Plumb line should fall just anterior to lateral malleolus. Posterior = tendency to hyperextend knee. Anterior = flexed knee posture." },
      { title: "Other Lateral Observations", type: "text", content: "Edema (ankle/knee), toe deformities (hallux valgus), calcaneal position, overall postural pattern classification." },
    ],
  },
  5: {
    title: "Practical Assessment Skills", subtitle: "Hands-On Clinical Application",
    level: "intermediate", ayush: "Integrative", duration: 40,
    description: "Practical application of posture assessment in clinical setting with AYUSH documentation approach.",
    topics: [
      { title: "Practical Application Overview", type: "text", content: "Posture assessment should take 10-15 minutes once proficient. Integrate into first consultation alongside Ashtavidha Pareeksha.", doctorNote: "Combine with pulse/tongue assessment for comprehensive AYUSH evaluation" },
      { title: "Patient Setup (Clothing, Position)", type: "practical", content: "Minimal clothing (shorts + sports bra for females). Barefoot. Standing naturally — do NOT ask to 'stand straight'. Allow 30 seconds to settle.", patientTip: "Wear comfortable shorts/vest for assessment. Stand as you normally would." },
      { title: "Using the Plumb Line", type: "practical", content: "Attach weight (fishing sinker works) to string from ceiling or high point. Position at midline for posterior/anterior, at ankle for lateral.", doctorNote: "A ₹50 plumb line setup gives you clinical-grade posture assessment capability" },
      { title: "Marking Anatomical Landmarks", type: "practical", content: "Use body crayons or small stickers. Mark: C7, T7, scapular angles, PSIS, ASIS, greater trochanters, knee joint lines, malleoli.", ayushContext: "Many landmarks coincide with Marma points — dual documentation opportunity" },
      { title: "Photography Guidelines", type: "practical", content: "Take photos from all 3 views against a plain background or grid. Camera at waist height. Same distance each time. Include plumb line in frame.", doctorNote: "Photos provide before/after evidence for treatment outcomes — essential for research" },
      { title: "Observation Checklist", type: "practical", content: "Use systematic head-to-toe approach for each view. Don't skip sections. Document on standardized form. Note bilateral comparisons.", patientTip: "Your doctor will look at you from behind, front, and side — this is normal assessment procedure" },
      { title: "Documentation Format", type: "practical", content: "Use standardized posture assessment form. Include: date, all views documented, deviations noted, syndrome classification, treatment plan.", doctorNote: "Digital documentation with photos allows AI-assisted longitudinal tracking" },
      { title: "Palpation Tips", type: "practical", content: "Scapula: slide along medial border. PSIS: find dimples of Venus. ASIS: follow iliac crest forward. Spinous processes: feel midline prominences.", ayushContext: "Sparsha Pareeksha (palpation) is a key Ayurvedic examination method — assess for Ushna/Sheeta, Snigdha/Ruksha" },
      { title: "Common Mistakes to Avoid", type: "practical", content: "1. Asking patient to 'stand properly' (masks real posture). 2. Assessing through clothing. 3. Not documenting findings. 4. Skipping one view. 5. Not correlating views.", doctorNote: "Most common mistake: treating the painful area without assessing full postural chain" },
      { title: "Practical Case Examples", type: "case_study", content: "Case 1: IT professional with headache → forward head + UCS. Case 2: Tailor with knee pain → pronation distortion. Case 3: Farmer with back pain → LCS + anterior tilt.", patientTip: "Different occupations create different posture patterns — your work affects your spine" },
    ],
  },
  6: {
    title: "Functional Assessment", subtitle: "Movement Quality & Compensation",
    level: "intermediate", ayush: "Yoga & Naturopathy", duration: 30,
    description: "Assessing movement quality — stability, compensation patterns, and contraindications from Yoga perspective.",
    topics: [
      { title: "What is Functional Assessment?", type: "text", content: "Testing how the body moves rather than static position. Reveals compensations, instability, and mobility deficits not visible in static posture.", ayushContext: "Cheshta Pareeksha (movement examination) — assessing Vyana Vayu function" },
      { title: "What It Gives You", type: "text", content: "Movement quality assessment, compensation patterns, stability vs mobility differentiation, pain reproduction in functional tasks.", doctorNote: "Functional tests bridge the gap between posture assessment and exercise prescription" },
      { title: "Single Leg Stability / Pelvic Control", type: "exercise", content: "Stand on one leg for 30 seconds. Observe: Trendelenburg sign (pelvis drop), trunk sway, knee valgus collapse, ankle wobble.", ayushContext: "Tests Sthiratva (stability) — Kapha quality. Instability = Vata excess in lower limb", patientTip: "Try standing on one leg while brushing teeth — if pelvis drops, glutes need work" },
      { title: "Scapular Dyskinesia Test", type: "exercise", content: "Arms overhead repeatedly (flexion or push-up plus). Observe scapular winging, asymmetric motion, early shrugging, or lag.", doctorNote: "Grade I: subtle. Grade II: medial border prominence. Grade III: superior border prominence" },
      { title: "Seated Thoracic Rotation Test", type: "exercise", content: "Sit straddling a bench (eliminates pelvic rotation). Cross arms on chest. Rotate each side. Normal: 45° each side. Asymmetry is significant.", ayushContext: "Tests Vyana Vayu distribution through thoracic spine — restricted rotation = Vata Sanga" },
      { title: "Weighted Lunge Test for Dorsiflexion", type: "exercise", content: "Lunge position, front knee advances over toe with back knee touching floor. Measure wall distance. Normal: 10-12cm (knee to wall).", patientTip: "Limited ankle bend = your calf/Achilles is tight = affects your squat, stairs, and walking" },
      { title: "Contraindications for Functional Testing", type: "text", content: "Acute pain (>7/10 VAS), recent fracture, unstable joints, severe osteoporosis, cardiac conditions, pregnancy (modified only).", doctorNote: "Always assess pain level before functional tests. Stop if pain increases significantly." },
    ],
  },
  7: {
    title: "Corrective Exercise Introduction", subtitle: "4-Phase AYUSH Corrective Model",
    level: "beginner", ayush: "Integrative", duration: 40,
    description: "The AYUSH-oriented corrective exercise framework aligned with Panchakarma stages and traditional treatment principles.",
    topics: [
      { title: "What is Corrective Exercise?", type: "text", content: "Systematic approach to fix posture and movement problems based on assessment findings. Addresses muscle imbalance, poor posture, faulty movement, pain, and injury risk.", ayushContext: "Parallels Chikitsa approach: identify Dosha imbalance → apply specific correction", patientTip: "Corrective exercise is targeted — not random gym work. Based on YOUR specific assessment." },
      { title: "Why Use Corrective Exercise?", type: "text", content: "Addresses root cause of: muscle imbalance, poor posture, faulty movement patterns, chronic pain, and recurrent injury risk.", doctorNote: "Prescribe corrective exercise as you would medicine — specific to diagnosis" },
      { title: "4-Phase Corrective Model Overview", type: "text", content: "Phase 1: Mobility/Flexibility → Phase 2: Stability → Phase 3: Strength → Phase 4: Functional Integration. Always sequential.", ayushContext: "Mirrors Panchakarma: Phase 1=Poorvakarma (preparation), Phase 2=Pradhanakarma, Phase 3-4=Paschatkarma (rehabilitation)" },
      { title: "Phase 1: Mobility/Flexibility", type: "exercise", content: "Release tight muscles, improve ROM. Techniques: stretching, foam rolling, joint mobilization. Duration: 20-30 sec holds, 1-2 sets.", ayushContext: "Equivalent to Snehana + Swedana — softening and preparing tissues before correction", patientTip: "Always start with mobility work — never jump to strengthening without releasing tight areas first" },
      { title: "Phase 2: Stability", type: "exercise", content: "Activate weak muscles, develop holding capacity. Isometric holds, controlled small-range movements. 12-20 reps, 20-60 sec holds.", ayushContext: "Equivalent to Shamana — gentle restoration of function without aggravation" },
      { title: "Phase 3: Strength", type: "exercise", content: "Build muscle strength with progressive resistance. 2-4 sets, 4-8 reps, moderate to high load, 60-90 sec rest between sets.", ayushContext: "Equivalent to Brimhana (nourishment) — building Mamsa Dhatu (muscle tissue)" },
      { title: "Phase 4: Functional Integration", type: "exercise", content: "Apply corrections in real-world movement patterns. Compound movements, sport-specific, occupational movements with correct form.", ayushContext: "Equivalent to Rasayana — long-term maintenance and prevention of recurrence" },
      { title: "Important Rule: Sequence Matters", type: "text", content: "Mobility FIRST, then stability. Stability must include endurance. Strength without control is useless. Never skip phases.", doctorNote: "Most treatment failures occur because Phase 1 was skipped — tight muscles inhibit weak muscles" },
      { title: "Two Line Concept", type: "text", content: "Line 1: Assessment identifies the PROBLEM (which muscles are tight/weak). Line 2: Corrective exercise provides the SOLUTION (release/activate/strengthen).", patientTip: "Assessment tells us what's wrong; exercises fix it. Both needed — one without the other is incomplete." },
      { title: "Mobility Prescription Guidelines", type: "text", content: "1-2 sets, 8-12 reps or 20-30 second holds, very low load or bodyweight only. Focus on quality over quantity.", ayushContext: "Like Abhyanga — gentle, repeated, with proper direction and pressure" },
      { title: "Stability Prescription Guidelines", type: "text", content: "1-3 sets, 12-20 reps or 20-60 second holds, low load. Focus on endurance and proper activation pattern.", ayushContext: "Like Basti therapy — sustained, nourishing, building from within" },
      { title: "Strength Prescription Guidelines", type: "text", content: "2-4 sets, 4-8 reps, moderate to high load, rest 60-90 seconds between sets. Progressive overload principle applies.", ayushContext: "Like Rasayana — building robust tissues through graduated challenge" },
      { title: "Integration with AYUSH Therapies", type: "text", content: "Corrective exercise works best when combined with: Abhyanga before mobility work, Swedana for flexibility, Basti for Vata pacification, Yoga for maintenance.", doctorNote: "Prescribe Panchakarma for Phase 1 preparation, then corrective exercise for Phases 2-4" },
    ],
  },
  8: {
    title: "Upper Cross Syndrome (UCS)", subtitle: "Greeva-Amsa Vayu Vikara",
    level: "advanced", ayush: "Ayurveda", duration: 45,
    description: "UCS — Vata-dominant muscle imbalance of cervicothoracic region with AYUSH treatment protocols.",
    topics: [
      { title: "UCS Introduction", type: "text", content: "Janda's Upper Cross: tight upper trapezius/levator scap + tight pectorals CROSSED with weak deep neck flexors + weak lower trapezius/serratus anterior. Creates forward head + rounded shoulders.", ayushContext: "Greeva-Amsa Vikara (neck-shoulder disorder) — primarily Vata Dosha aggravation in upper body", patientTip: "If you have neck pain + headaches + rounded shoulders — this is likely your pattern" },
      { title: "Muscle Imbalance Pattern", type: "table", content: "TIGHT/SHORT: Upper trapezius, Levator scapulae, SCM, Suboccipitals, Pectoralis major/minor. WEAK/LONG: Deep neck flexors, Lower trapezius, Middle trapezius, Serratus anterior, Rhomboids.", doctorNote: "Release tight muscles FIRST, then activate weak ones. Order matters." },
      { title: "Manual Muscle Testing (MMT)", type: "exercise", content: "Test deep neck flexors (chin tuck hold), lower trap (prone Y-raise), serratus anterior (push-up plus), middle trap (prone T-raise). Grade 0-5.", doctorNote: "Grade 3 or below in any test = clinically significant weakness requiring targeted activation" },
      { title: "Muscle Length Testing", type: "exercise", content: "Upper trap: lateral neck flexion (normal 45°). Pec minor: supine arm overhead (should touch table). Levator scap: flex + rotate + lateral flex neck.", patientTip: "If you can't touch your ear to shoulder without lifting shoulder — upper trap is tight" },
      { title: "AYUSH Treatment Protocol", type: "text", content: "Phase 1: Greeva Basti + Nasya (oil therapy for Vata). Phase 2: Greeva Pichu + gentle traction. Phase 3: Corrective Yoga (Bhujangasana, Shalabhasana modified). Phase 4: Pranayama + postural awareness. Medicines: Maharasnadi Kashayam, Dhanwantaram Tailam.", ayushContext: "Treat Vata in Greeva Pradesh: Snehana (Greeva Basti) → Swedana (Nadi Sweda) → Nasya (Anu Taila) → Yoga → Basti (systemic Vata)", doctorNote: "7-day Greeva Basti protocol + 21-day medicine + daily corrective exercise = best outcomes" },
    ],
  },
  9: {
    title: "Lower Cross Syndrome (LCS)", subtitle: "Kati-Nitamba Vayu Vikara",
    level: "advanced", ayush: "Ayurveda", duration: 45,
    description: "LCS — Vata-Kapha lumbopelvic imbalance with Kati Basti and Basti Karma integration.",
    topics: [
      { title: "LCS Introduction", type: "text", content: "Janda's Lower Cross: tight hip flexors (iliopsoas) + tight erector spinae CROSSED with weak abdominals + weak gluteus maximus. Creates anterior pelvic tilt + hyperlordosis.", ayushContext: "Kati-Nitamba Vikara — Vata-Kapha involvement: Vata causes pain, Kapha causes structural change", patientTip: "If you have low back pain + protruding belly + tight hip flexors — this is your pattern" },
      { title: "Muscle Imbalance Pattern", type: "table", content: "TIGHT/SHORT: Iliopsoas, Rectus femoris, TFL/ITB, Lumbar erectors, Piriformis, Adductors. WEAK/LONG: Gluteus maximus, Gluteus medius, Transversus abdominis, Internal obliques, Multifidus.", doctorNote: "Iliopsoas is the KEY muscle — always test and release first in LCS" },
      { title: "Manual Muscle Testing (MMT)", type: "exercise", content: "Test glute max (prone hip extension), glute med (side-lying hip abduction), TrA (drawing in maneuver + pressure biofeedback), multifidus (prone with palpation). Grade 0-5.", doctorNote: "Use pressure biofeedback unit (PBU) at 40mmHg for accurate TrA testing" },
      { title: "Muscle Length Testing", type: "exercise", content: "Thomas test (hip flexor length), Ober's test (ITB/TFL), Sit-and-reach modified (hamstrings), Prone knee bend (rectus femoris).", patientTip: "Thomas test: lie on table edge, pull one knee to chest — if other thigh lifts off table, hip flexor is tight" },
      { title: "AYUSH Treatment Protocol", type: "text", content: "Phase 1: Kati Basti (7 days) + Abhyanga of lower limbs. Phase 2: Tikta Ksheer Basti (16 days). Phase 3: Corrective exercise (hip flexor release, glute activation, core stability). Phase 4: Yoga (Setu Bandhasana, modified Shalabhasana, Pawanmuktasana). Medicines: Yogaraja Guggulu, Rasnasaptakam.", ayushContext: "Kati Basti nourishes Asthi-Majja Dhatu locally; Tikta Ksheer Basti addresses systemic Vata-in-Asthi", doctorNote: "Kati Basti oil retention 30-40 min at 42°C + Patra Pinda Sweda = maximum Phase 1 response" },
    ],
  },
  10: {
    title: "Layered Syndrome (Double Cross)", subtitle: "Sarva-Shareera Vayu Vikara",
    level: "advanced", ayush: "Integrative", duration: 50,
    description: "Combined UCS + LCS pattern — whole-body Vata derangement requiring comprehensive approach.",
    topics: [
      { title: "Layered Syndrome Introduction", type: "text", content: "When UCS and LCS coexist, creating alternating layers of tight/weak muscles throughout the body. Most severe form of postural dysfunction. Common in elderly, sedentary, and chronic pain patients.", ayushContext: "Sarva-Shareera Vayu Vikara — systemic Vata vitiation affecting entire musculoskeletal system", patientTip: "If you have BOTH neck/shoulder AND low back problems simultaneously — this pattern explains why" },
      { title: "Combined Muscle Imbalance", type: "table", content: "LAYER 1 (posterior tight): suboccipitals, upper trap → LAYER 2 (anterior tight): pectorals → LAYER 3 (posterior weak): lower/mid trap → LAYER 4 (anterior tight): iliopsoas → LAYER 5 (posterior weak): glutes. Creates S-shaped postural distortion.", doctorNote: "Treat from periphery inward — start with most symptomatic region, then address connected layers" },
      { title: "Full Body MMT Protocol", type: "exercise", content: "Test ALL muscles from UCS + LCS protocols. Document on body chart. Priority weakness determines treatment sequence. Typically 8-10 muscles need attention.", doctorNote: "Create a comprehensive muscle imbalance chart — this becomes the treatment roadmap" },
      { title: "Comprehensive Muscle Length Testing", type: "exercise", content: "Combine all tests from M8 + M9. Add trunk rotation assessment, full spine lateral flexion. Document which tight muscles have most impact on posture.", patientTip: "Full assessment takes 20-30 minutes but gives complete picture — worth the time investment" },
      { title: "AYUSH Comprehensive Protocol", type: "text", content: "Phase 1: Sarvanga Abhyanga + Patra Pinda Sweda (full body). Phase 2: Greeva Basti + Kati Basti (sequential days). Phase 3: Tikta Ksheer Basti (16 days). Phase 4: Comprehensive Yoga sequence (Surya Namaskar modified + specific asanas). Phase 5: Graduated corrective exercise (3 months minimum). Medicines: Maharasnadi + Yogaraja Guggulu + Ashwagandha.", ayushContext: "Sarvanga Chikitsa (whole body treatment) — Panchakarma as foundation, Yoga as maintenance, Rasayana for tissue rebuilding", doctorNote: "Minimum 21-day intensive program recommended for Layered Syndrome. Monthly follow-up × 6 months." },
    ],
  },
  11: {
    title: "Pronation Distortion Syndrome", subtitle: "Pada-Jangha Vayu Vikara",
    level: "advanced", ayush: "Ayurveda", duration: 40,
    description: "Lower extremity chain dysfunction — foot pronation causing knee, hip, and spine compensation.",
    topics: [
      { title: "PDS Introduction", type: "text", content: "Excessive foot pronation creates internal rotation of tibia → knee valgus → femoral internal rotation → hip drop → lumbar compensation. The foot is the foundation — when it collapses, everything above compensates.", ayushContext: "Pada Vikara (foot disorder) affecting Jangha (leg), Janu (knee), and Kati (spine) — ascending chain of Vata vitiation", patientTip: "Flat feet or collapsing arches may be the hidden cause of your knee pain or back pain" },
      { title: "Muscle Imbalance Pattern", type: "table", content: "TIGHT/SHORT: Peroneals, lateral gastrocnemius, biceps femoris (short head), TFL/ITB, hip adductors. WEAK/LONG: Tibialis posterior, tibialis anterior, medial gastrocnemius, VMO, gluteus medius/maximus.", doctorNote: "Tibialis posterior is the KEY muscle — its weakness allows arch collapse and pronation" },
      { title: "Manual Muscle Testing (MMT)", type: "exercise", content: "Tibialis posterior (inversion in plantarflexion), VMO (terminal knee extension with palpation), Gluteus medius (side-lying hip abduction), single-leg squat quality assessment.", doctorNote: "Single leg squat is the best functional test — watch for knee valgus collapse" },
      { title: "Muscle Length Testing", type: "exercise", content: "Peroneals (inversion ROM), ITB/TFL (Ober's test), Gastrocnemius (wall stretch with knee straight), Soleus (wall stretch with knee bent).", patientTip: "If your feet roll inward when squatting or going downstairs — this syndrome applies to you" },
      { title: "AYUSH Treatment Protocol", type: "text", content: "Phase 1: Pada Abhyanga (foot oil massage) + Janu Basti if knee involved + Agnikarma on trigger points. Phase 2: Marma therapy (Pada Marma stimulation — Kshipra, Talahridaya, Kurcha). Phase 3: Arch strengthening Yoga (Tadasana, Vrksasana, towel curls). Phase 4: Custom orthotics if needed + gait retraining. Medicines: Yogaraja Guggulu, Gandha Tailam local.", ayushContext: "Agnikarma at trigger points + Marma stimulation activates intrinsic foot muscles; Pada Abhyanga with Ksheerabala Taila nourishes foot structures", doctorNote: "Combine Agnikarma (2-3 sessions) with daily arch exercises for fastest results. Review footwear." },
    ],
  },
  12: {
    title: "Flat Back Posture", subtitle: "Kati-Sthairya Vikara",
    level: "advanced", ayush: "Integrative", duration: 40,
    description: "Loss of lumbar lordosis — Kapha-dominant postural pattern with Naturopathy and Yoga integration.",
    topics: [
      { title: "Flat Back Introduction", type: "text", content: "Loss of normal lumbar lordosis with posterior pelvic tilt. Spine becomes straight (flat) in sagittal plane. Reduces shock absorption, increases disc loading in neutral positions.", ayushContext: "Kati-Sthairya (lumbar rigidity) — Kapha Dosha causing Stambha (stiffness) in lumbar region. Loss of natural curve reflects loss of Agni in local tissues.", patientTip: "If your lower back looks flat (no inward curve) when viewed from side — this module is for you" },
      { title: "Muscle Imbalance Pattern", type: "table", content: "TIGHT/SHORT: Hamstrings, Rectus abdominis, External obliques, Gluteus maximus (may be). WEAK/LONG: Iliopsoas, Lumbar erectors, Multifidus, Quadratus lumborum. Key finding: tight hamstrings pulling pelvis posterior.", doctorNote: "This is the OPPOSITE pattern of LCS — don't confuse. Here hamstrings are tight, hip flexors are weak." },
      { title: "Manual Muscle Testing (MMT)", type: "exercise", content: "Test lumbar erectors (prone trunk extension), iliopsoas (seated hip flexion against resistance), multifidus (prone with palpation during arm lift), QL (side-lying lateral trunk flexion).", doctorNote: "Iliopsoas weakness is counterintuitive to many — it's typically tight in most people (LCS). In flat back, it's WEAK." },
      { title: "Muscle Length Testing", type: "exercise", content: "Hamstrings (90/90 active knee extension test, normal >70°), Rectus abdominis (prone extension), Gluteus maximus (prone hip flexion ROM).", patientTip: "If you can't touch your toes AND your back is flat — hamstrings are definitely tight" },
      { title: "AYUSH Treatment Protocol", type: "text", content: "Phase 1: Kati Basti with Ushna Taila (warm oil retention to increase Agni). Phase 2: Agni-promoting therapies — Swedana, Pinda Sweda with Ushna herbs. Phase 3: Extension-based Yoga (Bhujangasana, Dhanurasana, Matsyasana). Phase 4: Lumbar extension strengthening, hip flexor activation. Naturopathy: Hot packs, hydrotherapy, Sun exposure. Medicines: Trayodashang Guggulu, Bala Tailam.", ayushContext: "Kapha-Stambha pattern — treat with Ushna (heat), Tikshna (sharp/penetrating), Ruksha (dry) qualities to restore lumbar Agni and mobility", doctorNote: "Focus on EXTENSION exercises. Avoid flexion-dominant programs. Kati Basti with Dhanwantaram + Sahacharadi Taila mix." },
    ],
  },
  13: {
    title: "Sway Back Posture", subtitle: "Kati-Chalana Vikara",
    level: "advanced", ayush: "Integrative", duration: 40,
    description: "Posterior displacement of pelvis — Vata-dominant postural deviation with stabilization approach.",
    topics: [
      { title: "Sway Back Introduction", type: "text", content: "Pelvis displaces FORWARD of plumb line while upper trunk leans backward. NOT the same as anterior tilt — here pelvis tilts POSTERIORLY but shifts forward. Hip hyperextension, thoracolumbar kyphosis, forward head.", ayushContext: "Kati-Chalana (lumbar instability/displacement) — Vata-dominant pattern with Chala (mobile/unstable) Guna excess. Loss of Sthiratva (stability) in pelvis.", patientTip: "If you tend to stand with hips pushed forward (like leaning on a counter) — this is your posture pattern" },
      { title: "Muscle Imbalance Pattern", type: "table", content: "TIGHT/SHORT: Hamstrings (upper), Thoracolumbar fascia, Upper abdominals, Hip extensors. WEAK/LONG: Iliopsoas, Rectus femoris, External obliques, Thoracic extensors, Lower abdominals. Key: hip hangs on ligaments (passive hip extension).", doctorNote: "Key distinction from flat back: in sway back, pelvis shifts ANTERIOR even though it tilts posterior. The hip 'hangs' on Y-ligament." },
      { title: "Manual Muscle Testing (MMT)", type: "exercise", content: "Test iliopsoas (seated active hip flexion — will be weak), lower abs (leg lowering test), thoracic extensors (prone upper trunk lift), external obliques (oblique curl-up).", doctorNote: "Leg lowering test: supine, lower straight legs from 90° — note angle where lumbar spine arches off table. <60° = poor lower ab control" },
      { title: "Muscle Length Testing", type: "exercise", content: "Hamstrings (especially upper fibers — passive SLR), upper rectus abdominis (passive trunk extension), thoracolumbar fascia (seated forward flexion quality).", patientTip: "Sway back is common in teenagers and tall people who 'slouch' by pushing hips forward" },
      { title: "AYUSH Treatment Protocol", type: "text", content: "Phase 1: Kati Basti + Sarvanga Abhyanga (Vata-pacifying oils — Bala, Ashwagandha). Phase 2: Stabilization-focused Basti Karma (Anuvasana + Niruha alternating). Phase 3: Core stability Yoga (Navasana modified, Plank, Bird-Dog). Phase 4: Hip flexor strengthening + lower ab endurance. Focus on STABILITY over mobility. Medicines: Ashwagandha Churna, Bala Tailam internal + external.", ayushContext: "Vata-Chala pattern — stabilize with Guru (heavy), Sthira (stable), Snigdha (unctuous) qualities. Basti is the supreme Vata treatment. Ashwagandha provides Bala (strength) to hold posture.", doctorNote: "Do NOT over-stretch in sway back — these patients need STABILITY not mobility. Strengthen hip flexors, lower abs, thoracic extensors. 21-day Basti protocol recommended." },
    ],
  },
};

export default function SpineAyushModuleDetail() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [expandedTopics, setExpandedTopics] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<"doctor" | "patient">("doctor");

  const id = parseInt(moduleId || "1");
  const moduleData = allModuleData[id];

  // Load saved progress from Supabase
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get the module UUID from spine_ayush_modules
        const { data: moduleRow } = await supabase
          .from("spine_ayush_modules")
          .select("id")
          .eq("module_number", id)
          .maybeSingle();

        if (!moduleRow) return;

        const { data } = await supabase
          .from("spine_ayush_user_progress")
          .select("notes, progress_pct")
          .eq("user_id", user.id)
          .eq("module_id", moduleRow.id)
          .is("topic_id", null)
          .maybeSingle();

        if (data?.notes) {
          try {
            const savedTopics = JSON.parse(data.notes);
            if (Array.isArray(savedTopics)) {
              setExpandedTopics(new Set(savedTopics));
            }
          } catch {}
        }
      } catch (err) {
        // Silent fail — progress just won't be pre-loaded
      }
    };
    loadProgress();
  }, [id]);

  // Save progress when topics change
  const saveProgress = async (topicIndices: Set<number>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || topicIndices.size === 0) return;

      const totalTopics = moduleData?.topics?.length || 0;
      const completionPct = totalTopics > 0 ? Math.round((topicIndices.size / totalTopics) * 100) : 0;

      // Get module UUID
      const { data: moduleRow } = await supabase
        .from("spine_ayush_modules")
        .select("id")
        .eq("module_number", id)
        .maybeSingle();

      if (!moduleRow) return;

      await supabase.from("spine_ayush_user_progress").upsert({
        user_id: user.id,
        module_id: moduleRow.id,
        topic_id: null,
        status: completionPct >= 100 ? "completed" : completionPct > 0 ? "in_progress" : "not_started",
        progress_pct: completionPct,
        notes: JSON.stringify(Array.from(topicIndices)),
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,module_id,topic_id" });
    } catch (err) {
      // Silent fail
    }
  };

  if (!moduleData) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
        <h2 className="text-xl font-bold">Module Not Found</h2>
        <p className="text-muted-foreground mt-2">Module {moduleId} does not exist.</p>
        <Button onClick={() => navigate("/hms/spine-modules")} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Modules
        </Button>
      </div>
    );
  }

  const toggleTopic = (index: number) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      saveProgress(next);
      return next;
    });
  };

  const expandAll = () => {
    const all = new Set(moduleData.topics.map((_, i) => i));
    setExpandedTopics(all);
    saveProgress(all);
  };

  const collapseAll = () => {
    setExpandedTopics(new Set());
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "exercise": return <Dumbbell className="h-3.5 w-3.5 text-green-600" />;
      case "practical": return <Stethoscope className="h-3.5 w-3.5 text-teal-600" />;
      case "table": return <FileText className="h-3.5 w-3.5 text-blue-600" />;
      case "case_study": return <Brain className="h-3.5 w-3.5 text-purple-600" />;
      default: return <BookOpen className="h-3.5 w-3.5 text-gray-600" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      text: "bg-gray-100 text-gray-700",
      exercise: "bg-green-100 text-green-700",
      practical: "bg-teal-100 text-teal-700",
      table: "bg-blue-100 text-blue-700",
      case_study: "bg-purple-100 text-purple-700",
      quiz: "bg-amber-100 text-amber-700",
    };
    return colors[type] || colors.text;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/hms/spine-modules")} className="h-8">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Module {id}: {moduleData.title}
            </h1>
            <p className="text-sm text-muted-foreground italic">{moduleData.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={moduleData.level === "advanced" ? "destructive" : moduleData.level === "intermediate" ? "default" : "secondary"}>
            {moduleData.level}
          </Badge>
          <Badge variant="outline" className="text-green-600 border-green-300">
            <Leaf className="h-3 w-3 mr-1" /> {moduleData.ayush}
          </Badge>
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" /> {moduleData.duration} min
          </Badge>
        </div>
      </div>

      {/* Module Overview Card */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardContent className="p-4">
          <p className="text-sm">{moduleData.description}</p>
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {moduleData.topics.length} Topics</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> ~{moduleData.duration} minutes</span>
            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Doctor & Patient</span>
          </div>
        </CardContent>
      </Card>

      {/* View Mode Toggle + Controls */}
      <div className="flex items-center justify-between">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "doctor" | "patient")}>
          <TabsList className="h-8">
            <TabsTrigger value="doctor" className="text-xs gap-1">
              <Stethoscope className="h-3 w-3" /> Doctor View
            </TabsTrigger>
            <TabsTrigger value="patient" className="text-xs gap-1">
              <Heart className="h-3 w-3" /> Patient View
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={expandAll} className="text-xs h-7">
            <ChevronDown className="h-3 w-3 mr-1" /> Expand All
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll} className="text-xs h-7">
            <ChevronUp className="h-3 w-3 mr-1" /> Collapse All
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progress: {expandedTopics.size} / {moduleData.topics.length} topics viewed</span>
          <span>{Math.round((expandedTopics.size / moduleData.topics.length) * 100)}%</span>
        </div>
        <Progress value={(expandedTopics.size / moduleData.topics.length) * 100} className="h-2" />
      </div>

      {/* Topics List */}
      <div className="space-y-2">
        {moduleData.topics.map((topic, index) => {
          const isExpanded = expandedTopics.has(index);
          return (
            <Card key={index} className={`transition-all ${isExpanded ? "border-blue-300 shadow-sm" : "hover:border-muted-foreground/30"}`}>
              <div
                className="flex items-center gap-3 p-3 cursor-pointer"
                onClick={() => toggleTopic(index)}
              >
                <span className="text-xs font-bold text-muted-foreground w-6 text-center">
                  {index + 1}
                </span>
                {getTypeIcon(topic.type)}
                <span className="flex-1 text-sm font-medium">{topic.title}</span>
                <Badge className={`text-[9px] ${getTypeBadge(topic.type)}`}>
                  {topic.type.replace("_", " ")}
                </Badge>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>

              {isExpanded && (
                <CardContent className="pt-0 pb-4 px-4 space-y-3">
                  <Separator />
                  {/* Main Content */}
                  <div className="bg-muted/50 p-3 rounded-md">
                    <p className="text-sm leading-relaxed">{topic.content}</p>
                  </div>

                  {/* AYUSH Context */}
                  {topic.ayushContext && (
                    <div className="bg-green-50 border border-green-200 p-3 rounded-md">
                      <p className="text-xs font-medium text-green-700 flex items-center gap-1 mb-1">
                        <Leaf className="h-3 w-3" /> AYUSH Context
                      </p>
                      <p className="text-xs text-green-800">{topic.ayushContext}</p>
                    </div>
                  )}

                  {/* Doctor Note (visible in doctor mode) */}
                  {viewMode === "doctor" && topic.doctorNote && (
                    <div className="bg-purple-50 border border-purple-200 p-3 rounded-md">
                      <p className="text-xs font-medium text-purple-700 flex items-center gap-1 mb-1">
                        <Stethoscope className="h-3 w-3" /> Doctor Note
                      </p>
                      <p className="text-xs text-purple-800">{topic.doctorNote}</p>
                    </div>
                  )}

                  {/* Patient Tip (visible in patient mode or always) */}
                  {topic.patientTip && (viewMode === "patient" || viewMode === "doctor") && (
                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-md">
                      <p className="text-xs font-medium text-amber-700 flex items-center gap-1 mb-1">
                        <Heart className="h-3 w-3" /> Patient Tip
                      </p>
                      <p className="text-xs text-amber-800">{topic.patientTip}</p>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => navigate(`/hms/spine-modules/${id - 1}`)}
          disabled={id <= 1}
          className="text-xs"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Previous Module
        </Button>
        <span className="text-xs text-muted-foreground">Module {id} of 13</span>
        <Button
          variant="outline"
          onClick={() => navigate(`/hms/spine-modules/${id + 1}`)}
          disabled={id >= 13}
          className="text-xs"
        >
          Next Module <ChevronDown className="h-3.5 w-3.5 ml-1 -rotate-90" />
        </Button>
      </div>
    </div>
  );
}
