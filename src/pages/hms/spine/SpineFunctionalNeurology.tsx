import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Brain, Eye, Activity, Target, Zap, CheckCircle2,
  AlertTriangle, Clock, Star, Users, Heart, Shield,
  ArrowRight, ChevronDown, ChevronUp, Lightbulb,
  Move, Ear, Footprints, Gauge, BookOpen,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════
// M19: FUNCTIONAL NEUROLOGY (CARRICK) — Brain-Based Spine Rehab
// ═══════════════════════════════════════════════════════════════

// ─── Tab A: Theory & Principles ───
const principles = [
  {
    title: "The Carrick Model",
    desc: "Dr. Ted Carrick's Functional Neurology treats spine pain by addressing the BRAIN's interpretation of pain, not just the local tissue. The brain receives proprioceptive input from spinal joints → if this input is faulty, the brain creates protective muscle guarding, altered movement patterns, and chronic pain perception.",
    keyPoints: [
      "Spine = largest proprioceptive organ in the body",
      "Each vertebral segment sends thousands of signals/sec to cerebellum",
      "Dysfunction at C1-C2 alone can alter ENTIRE body balance",
      "Chronic pain = maladaptive neuroplasticity (brain learned to hurt)",
      "Treatment = specific sensory stimulation to 're-wire' brain circuits",
    ],
  },
  {
    title: "Hemispheric Integration",
    desc: "The brain has two hemispheres with different functions. Spine pain often correlates with hemispheric imbalance — one side under-fires. Functional neurology identifies which side is weak and stimulates it specifically.",
    keyPoints: [
      "Left hemisphere: analytical, sequential, right-body motor control",
      "Right hemisphere: spatial, emotional, left-body motor control, posture/tone",
      "Right hemisphere weakness → left-sided spine complaints, poor posture",
      "Left hemisphere weakness → right-sided pain, poor coordination",
      "Assessment: eye movements, arm swing, standing balance reveal hemisphere",
    ],
  },
  {
    title: "Cerebellum & Spine",
    desc: "The cerebellum receives 40× more input from the body than it sends out. It's the 'coordinator' of spine stability. Cerebellar dysfunction = poor spinal proprioception = chronic recurrence of pain.",
    keyPoints: [
      "Cerebellar signs: overshooting movements, poor balance, wide gait",
      "Vermis (midline cerebellum) → core stability + trunk control",
      "Lateral cerebellum → limb coordination + fine motor",
      "Flocculonodular lobe → vestibular (dizziness, vertigo from C-spine)",
      "Rehab: specific eye movements + balance drills stimulate cerebellum",
    ],
  },
  {
    title: "Pain Neuroscience Education (PNE)",
    desc: "Teaching patients that pain is an OUTPUT of the brain (not just input from tissues) reduces fear-avoidance and chronification. Combined with Carrick drills, this accelerates recovery.",
    keyPoints: [
      "Pain ≠ damage (MRI findings don't always correlate with pain)",
      "Chronic pain = central sensitization (brain amplifies signals)",
      "Explaining neuroscience reduces pain by 10-20% alone (evidence-based)",
      "Combine PNE + graded motor imagery + Carrick drills for best results",
      "Patients who understand their pain recover 3× faster",
    ],
  },
];

// ─── Tab B: Assessment Tools ───
interface AssessmentTool {
  name: string;
  what: string;
  how: string;
  normalFinding: string;
  abnormalMeaning: string;
  spineRelevance: string;
  category: string;
}

const assessmentTools: AssessmentTool[] = [
  {
    name: "Smooth Pursuit Eye Test",
    what: "Tests flocculonodular cerebellum + frontal eye fields",
    how: "Patient tracks a slowly moving finger/pen (H-pattern) while keeping head still. Observe smoothness of eye movement.",
    normalFinding: "Eyes follow smoothly without jerks (saccadic intrusions)",
    abnormalMeaning: "Jerky pursuit = cerebellar dysfunction on that side, or frontal lobe integration issue",
    spineRelevance: "Cervical proprioception feeds eye movement centers. C1-C2 dysfunction → abnormal pursuit",
    category: "Eye Movements",
  },
  {
    name: "Saccade Accuracy Test",
    what: "Tests parietal lobe + brainstem saccade generators",
    how: "Hold 2 fingers 30cm apart. Ask patient to look rapidly between them. Watch for overshooting or undershooting.",
    normalFinding: "Accurate, single-step jumps to target",
    abnormalMeaning: "Hypometria (undershoot) = cerebellar issue. Hypermetria (overshoot) = opposite cerebellar hemisphere weak",
    spineRelevance: "Cervical spine proprioception calibrates saccade accuracy. Neck pain → inaccurate saccades",
    category: "Eye Movements",
  },
  {
    name: "Optokinetic Nystagmus (OKN)",
    what: "Tests parieto-occipital cortex + vestibular nuclei",
    how: "Show moving stripes (phone app or spinning drum). Observe nystagmus pattern — should be symmetric both directions.",
    normalFinding: "Equal nystagmus in both directions",
    abnormalMeaning: "Asymmetric OKN = parietal lesion or vestibular imbalance on hypo-reactive side",
    spineRelevance: "Cervicogenic dizziness shows asymmetric OKN from altered neck proprioception to vestibular nuclei",
    category: "Eye Movements",
  },
  {
    name: "Romberg Test (Modified)",
    what: "Tests proprioception vs vestibular vs visual balance",
    how: "Stand feet together: (1) eyes open, (2) eyes closed, (3) on foam eyes closed, (4) tandem stance eyes closed.",
    normalFinding: "Stable for 30 sec in all positions",
    abnormalMeaning: "Sway with eyes closed = proprioceptive deficit. Sway on foam = vestibular. Side-sway = cerebellar hemisphere",
    spineRelevance: "Lumbar/cervical dysfunction reduces spinal proprioception → positive Romberg, fall risk",
    category: "Balance",
  },
  {
    name: "Fukuda Stepping Test",
    what: "Tests vestibulospinal tract + cerebellar vermis",
    how: "Patient marches in place (eyes closed, arms extended) for 50 steps. Observe rotation and drift.",
    normalFinding: "< 30° rotation, < 0.5m drift from start position",
    abnormalMeaning: "> 30° rotation toward one side = ipsilateral vestibular hypofunction or cerebellar weakness",
    spineRelevance: "Upper cervical dysfunction (C1-C2) directly affects vestibular nuclei → abnormal stepping",
    category: "Balance",
  },
  {
    name: "Finger-to-Nose Test (Cerebellar)",
    what: "Tests ipsilateral cerebellar hemisphere coordination",
    how: "Patient touches nose then your finger (held at arm's length). Repeat rapidly. Watch for tremor or past-pointing.",
    normalFinding: "Accurate, smooth, no tremor at endpoints",
    abnormalMeaning: "Intention tremor or past-pointing = ipsilateral cerebellar hemisphere dysfunction",
    spineRelevance: "Thoracic/cervical proprioceptive loss reduces cerebellar calibration → poor limb coordination",
    category: "Coordination",
  },
  {
    name: "Head Impulse Test (HIT)",
    what: "Tests vestibulo-ocular reflex (VOR) — semicircular canals",
    how: "Patient fixates on your nose. Rapidly rotate their head 15-20° to one side. Watch if eyes stay on target.",
    normalFinding: "Eyes stay fixed on target (VOR intact)",
    abnormalMeaning: "Corrective saccade (catch-up eye movement) = VOR deficit on that side",
    spineRelevance: "Cervicogenic dizziness vs true vestibular pathology. C-spine patients often have cervicogenic VOR alteration.",
    category: "Vestibular",
  },
  {
    name: "Arm Swing Observation",
    what: "Tests hemispheric cortical output + basal ganglia",
    how: "Ask patient to walk naturally. Observe arm swing symmetry, stride length, and trunk rotation.",
    normalFinding: "Equal bilateral arm swing, reciprocal pattern",
    abnormalMeaning: "Reduced arm swing on one side = contralateral cortical or ipsilateral cerebellar hypofunction",
    spineRelevance: "Chronic spine pain patients often show reduced arm swing on affected side — brain protective mechanism",
    category: "Gait",
  },
  {
    name: "Pupil Light Reflex Asymmetry",
    what: "Tests autonomic nervous system (sympathetic/parasympathetic balance)",
    how: "Shine light in each eye in dim room. Compare pupil size and reaction speed. Note any anisocoria.",
    normalFinding: "Equal pupil size, equal brisk constriction",
    abnormalMeaning: "Larger pupil = sympathetic dominance (stress/pain). Sluggish = parasympathetic. Asymmetry = lateralized autonomic issue.",
    spineRelevance: "T1-T2 sympathetic chain → pupil dilation. Thoracic spine dysfunction can cause pupil asymmetry.",
    category: "Autonomic",
  },
  {
    name: "Blind Spot Mapping",
    what: "Tests occipital cortex and visual field integrity",
    how: "Patient covers one eye. Slowly move a pen from periphery toward center. Mark where patient first detects it in all 4 quadrants.",
    normalFinding: "Symmetric visual fields, normal blind spot size",
    abnormalMeaning: "Enlarged blind spot or field cut = cortical or optic pathway issue. Also seen in raised ICP.",
    spineRelevance: "Upper cervical pathology can alter blood flow to visual cortex via vertebral artery → visual field changes.",
    category: "Visual",
  },
];

// ─── Tab C: Rehabilitation Drills ───
interface RehabDrill {
  name: string;
  target: string;
  spineCondition: string;
  instructions: string[];
  frequency: string;
  duration: string;
  progression: string;
  contraindications: string;
  category: string;
  difficulty: string;
}

const rehabDrills: RehabDrill[] = [
  {
    name: "Gaze Stability Exercise (VOR×1)",
    target: "Vestibulo-ocular reflex, Cervical proprioception",
    spineCondition: "Cervicogenic dizziness, C1-C2 dysfunction, Post-whiplash",
    instructions: [
      "Hold a business card at arm's length with a letter/word",
      "Focus on the letter — keep it CLEAR",
      "Rotate head LEFT and RIGHT while keeping letter focused",
      "Start slow (1 Hz), increase speed as tolerated",
      "Letter must stay CLEAR — if blurry, slow down",
    ],
    frequency: "3×/day",
    duration: "1 minute per set (builds to 2 min)",
    progression: "Increase speed → add busy background → standing → walking",
    contraindications: "Active vertigo (wait until subsides), acute neck trauma",
    category: "Vestibular",
    difficulty: "Beginner",
  },
  {
    name: "Smooth Pursuit Training (Figure-8)",
    target: "Flocculonodular cerebellum, Frontal eye fields",
    spineCondition: "Chronic neck pain, Headache, Poor concentration with spine pain",
    instructions: [
      "Hold a pen/finger at arm's length",
      "Slowly move it in a figure-8 pattern (horizontal then vertical)",
      "Follow with eyes ONLY — head stays completely still",
      "Focus on smoothness — no jerks or jumps",
      "Do both clockwise and counter-clockwise",
    ],
    frequency: "2×/day",
    duration: "30 seconds each direction",
    progression: "Increase speed → larger figure-8 → add head movement (VOR×2)",
    contraindications: "Nausea/vomiting during exercise (reduce amplitude)",
    category: "Eye Movements",
    difficulty: "Beginner",
  },
  {
    name: "Saccade Training (Anti-Saccade)",
    target: "Frontal lobe (DLPFC), Inhibitory control",
    spineCondition: "Chronic pain with fear-avoidance, Central sensitization",
    instructions: [
      "Partner holds up left OR right hand randomly",
      "Patient must look to the OPPOSITE side (not toward the hand)",
      "This trains frontal inhibitory control (suppresses pain reflexes)",
      "Start slow (1 per 2 seconds), increase speed",
      "Score: count correct responses out of 20",
    ],
    frequency: "1×/day",
    duration: "2 minutes (20-30 trials)",
    progression: "Increase speed → add cognitive load (count backwards while doing)",
    contraindications: "Severe migraine (may worsen), epilepsy history",
    category: "Eye Movements",
    difficulty: "Intermediate",
  },
  {
    name: "Single-Leg Stance with Head Turns",
    target: "Cerebellar vermis, Vestibulospinal tract, Core stability",
    spineCondition: "Lumbar instability, SI joint dysfunction, Recurrent LBP",
    instructions: [
      "Stand on one leg (affected side first)",
      "Once stable (10 sec), add slow head turns LEFT-RIGHT",
      "Maintain balance while head moves — eyes stay level",
      "If wobbling: reduce head speed, touch wall lightly",
      "Advanced: close eyes while turning head",
    ],
    frequency: "2×/day",
    duration: "30 sec each leg × 3 sets",
    progression: "Eyes open → eyes closed → foam pad → head turns → BOSU ball",
    contraindications: "Acute disc herniation with radiculopathy (fall risk), severe balance deficit (use wall support)",
    category: "Balance",
    difficulty: "Intermediate",
  },
  {
    name: "Cervical Joint Position Error (JPE) Training",
    target: "Cervical proprioception, Deep neck flexors",
    spineCondition: "Cervical spondylosis, Whiplash, Cervicogenic headache",
    instructions: [
      "Sit facing wall. Place laser pointer on headband (or use finger targeting)",
      "Close eyes. Turn head fully RIGHT, then return to center (eyes closed)",
      "Open eyes — check if you returned to exact center",
      "Normal: < 4.5° error. Abnormal: > 4.5° deviation",
      "Practice returning to center from all directions (L, R, flexion, extension)",
    ],
    frequency: "3×/day",
    duration: "10 repetitions each direction",
    progression: "Reduce error progressively → add speed → add distractions",
    contraindications: "Acute cervical disc herniation (limit ROM), vertebral artery insufficiency signs",
    category: "Proprioception",
    difficulty: "Beginner",
  },
  {
    name: "Tandem Gait with Cognitive Load",
    target: "Cerebellar vermis, Prefrontal cortex, Dual-task processing",
    spineCondition: "Chronic LBP with deconditioning, Elderly spine patients, Fear of falling",
    instructions: [
      "Walk heel-to-toe in straight line (tandem walking)",
      "While walking, count backwards from 100 by 7s (or name animals A-Z)",
      "Maintain balance AND cognitive task simultaneously",
      "10 steps forward, turn, 10 steps back = 1 set",
      "If stumbling: reduce cognitive load first, then speed",
    ],
    frequency: "1×/day",
    duration: "5 minutes (3-4 sets)",
    progression: "Increase speed → harder math → carry object → eyes partially closed (squinting)",
    contraindications: "Active vertigo, severe neuropathy (fall risk — supervise)",
    category: "Gait",
    difficulty: "Intermediate",
  },
  {
    name: "Optokinetic Stimulation (OKN Training)",
    target: "Parietal cortex, Vestibular nuclei, Sensory reweighting",
    spineCondition: "Cervicogenic dizziness, Visual dependence, Chronic motion sensitivity",
    instructions: [
      "Use OKN stripe app on phone/tablet (moving stripes)",
      "Hold device at arm's length, stripes moving LEFT",
      "Watch stripes for 30 sec — allow nystagmus to occur",
      "Then switch direction (stripes RIGHT) for 30 sec",
      "If nauseous: reduce speed/duration. Build tolerance gradually.",
    ],
    frequency: "2×/day",
    duration: "30 sec each direction × 3 sets",
    progression: "Increase stripe speed → stand while viewing → add head movement",
    contraindications: "Active BPPV (treat first), seizure history (flashing lights trigger)",
    category: "Vestibular",
    difficulty: "Advanced",
  },
  {
    name: "Cross-Body Activation (Contralateral Stimulation)",
    target: "Weak hemisphere activation, Corpus callosum integration",
    spineCondition: "Unilateral chronic pain, Hemispheric imbalance, Post-stroke spine",
    instructions: [
      "Identify WEAK hemisphere (from assessment: reduced arm swing side, etc.)",
      "Stimulate OPPOSITE body side to activate that hemisphere:",
      "— Smell strong essential oil in opposite nostril",
      "— Vibration/tapping on opposite hand/foot",
      "— Look toward the weak hemisphere side (gaze activates ipsilateral)",
      "— Listen to music in opposite ear (earphone one side only)",
      "Combine 2-3 stimuli for 60 seconds",
    ],
    frequency: "3-4×/day",
    duration: "60 seconds per stimulation",
    progression: "Single stimulus → combined → add movement → integrate with spine exercises",
    contraindications: "None significant. Avoid strong smells if migraine-prone.",
    category: "Hemispheric",
    difficulty: "Beginner",
  },
  {
    name: "Interactive Metronome / Rhythmic Entrainment",
    target: "Timing circuits (basal ganglia, cerebellum), Motor planning",
    spineCondition: "Chronic pain with poor motor timing, Deconditioning, Fibromyalgia-type",
    instructions: [
      "Use metronome app (start at 60 BPM)",
      "Clap/tap hands exactly on each beat (both hands together)",
      "Then alternate: LEFT-RIGHT-LEFT-RIGHT on beat",
      "Then add foot tap in sync",
      "Goal: minimize timing error (< 15ms off beat = excellent)",
    ],
    frequency: "1×/day",
    duration: "3 minutes",
    progression: "Increase BPM (60→80→100) → add asymmetric patterns → incorporate spine movements (rotation on beat)",
    contraindications: "None. Simplify for cognitively impaired patients.",
    category: "Timing",
    difficulty: "Beginner",
  },
  {
    name: "Mirror Therapy for Unilateral Spine Pain",
    target: "Premotor cortex, Body schema, Reduces central sensitization",
    spineCondition: "Unilateral radiculopathy, CRPS-type pain, Failed surgery (persistent pain)",
    instructions: [
      "Place mirror at midline of body (spine as dividing line)",
      "Move the PAIN-FREE side while watching its reflection",
      "Brain perceives the painful side moving without pain",
      "Perform gentle spine movements: rotation, lateral flexion",
      "Observe the mirror — imagine the affected side moving freely",
    ],
    frequency: "2×/day",
    duration: "5 minutes per session",
    progression: "Observation only → add affected side small movements → remove mirror gradually",
    contraindications: "None. May cause initial discomfort — normal (brain remapping).",
    category: "Neuroplasticity",
    difficulty: "Beginner",
  },
];

// ─── Tab D: Condition-Specific Protocols ───
interface ConditionProtocol {
  condition: string;
  spineLevel: string;
  neuralMechanism: string;
  assessments: string[];
  drills: string[];
  frequency: string;
  expectedTimeline: string;
  integration: string;
}

const conditionProtocols: ConditionProtocol[] = [
  {
    condition: "Cervicogenic Dizziness / Vertigo",
    spineLevel: "C1-C2 (Upper Cervical)",
    neuralMechanism: "Faulty proprioceptive input from upper cervical facets → vestibular nucleus mismatch → dizziness, unsteadiness",
    assessments: ["Head Impulse Test", "Smooth Pursuit", "Romberg (foam)", "Fukuda Stepping", "JPE Test"],
    drills: ["Gaze Stability (VOR×1)", "Smooth Pursuit Figure-8", "JPE Training", "Single-Leg + Head Turns", "OKN Stimulation"],
    frequency: "2-3×/day, 10-15 min total",
    expectedTimeline: "Improvement in 1-2 weeks. Resolution in 4-6 weeks.",
    integration: "Combine with Greeva Basti (C1-C2 focus) + Krikatika Marma stimulation before drills",
  },
  {
    condition: "Chronic Recurrent LBP (Central Sensitization)",
    spineLevel: "L1-L5 (Global brain involvement)",
    neuralMechanism: "Prolonged pain → brain cortical reorganization (smudging of body map) → amplified pain perception even without new tissue damage",
    assessments: ["Romberg (all 4 levels)", "Arm Swing", "Pupil Asymmetry", "Tandem Gait", "Saccade Accuracy"],
    drills: ["Anti-Saccade Training", "Mirror Therapy", "Tandem Gait + Cognitive Load", "Cross-Body Activation", "Interactive Metronome"],
    frequency: "1-2×/day, 15-20 min total",
    expectedTimeline: "Neuroplastic changes start in 2-3 weeks. Significant pain reduction in 6-8 weeks.",
    integration: "Combine with Pain Neuroscience Education + Kati Basti + Yoga therapy (Phase 3)",
  },
  {
    condition: "Post-Whiplash Syndrome",
    spineLevel: "C2-C6 (Cervical)",
    neuralMechanism: "Whiplash damages cervical proprioceptors + causes vestibular concussion → persistent dizziness, neck stiffness, headache, cognitive fog",
    assessments: ["JPE Test", "Smooth Pursuit", "Head Impulse Test", "Saccade Accuracy", "Romberg foam"],
    drills: ["Gaze Stability (VOR×1)", "JPE Training", "Smooth Pursuit", "Single-Leg Stance", "Tandem Gait"],
    frequency: "3×/day (short sessions), 5-8 min each",
    expectedTimeline: "Early improvement in 2 weeks (if < 3 months post-injury). Chronic: 8-12 weeks.",
    integration: "Greeva Basti first (tissue healing) → then add neuro drills from Week 2. Nasya for head clarity.",
  },
  {
    condition: "Failed Back Surgery Syndrome (Persistent post-surgical pain)",
    spineLevel: "L4-S1 typically",
    neuralMechanism: "Surgery fixed structure but brain didn't 'update' its pain map. Central sensitization persists. Also: deconditioning + fear-avoidance.",
    assessments: ["Arm Swing", "Pupil Asymmetry", "Romberg", "Finger-Nose", "Tandem Gait"],
    drills: ["Mirror Therapy", "Anti-Saccade (frontal activation)", "Cross-Body Stimulation", "Metronome", "Graded motor imagery"],
    frequency: "2×/day, 10-15 min",
    expectedTimeline: "Slow — 8-12 weeks minimum. Set expectations clearly with patient.",
    integration: "PNE education FIRST → then neuro drills + Tikta Ksheer Basti (nerve nourishment) + Gentle yoga",
  },
  {
    condition: "Thoracic Spine + Poor Posture (Desk Workers)",
    spineLevel: "T4-T8, Upper Cross Syndrome",
    neuralMechanism: "Prolonged flexion posture → cerebellum receives 'flexion-biased' input → brain perceives flexion as normal → extension becomes 'threatening'",
    assessments: ["Arm Swing", "Saccade Accuracy", "Wall Angel test", "Romberg", "Postural observation"],
    drills: ["Single-Leg + Head Turns", "Metronome (with extension)", "Tandem Gait", "Cross-Body Activation", "Smooth Pursuit (standing)"],
    frequency: "Every 2 hours at desk (micro-drills) + 1 full session/day",
    expectedTimeline: "Posture improvement in 2-3 weeks. Pain resolution in 4-6 weeks.",
    integration: "Combine with Prishtha Basti + Thoracic foam roller + Wall angels + Ergonomic correction",
  },
];

// ─── Tab E: Equipment & Integration ───
const equipmentList = [
  { name: "OKN Strip/App", cost: "Free (phone app)", use: "Optokinetic nystagmus testing and training", source: "App Store: 'OKN Drum' or make DIY stripe drum" },
  { name: "Foam Pad (Balance)", cost: "₹500-1000", use: "Modified Romberg test, balance progression", source: "Any physiotherapy supply store" },
  { name: "Laser Pointer (headband)", cost: "₹200-500", use: "Joint Position Error measurement", source: "DIY: tape laser to headband" },
  { name: "Metronome App", cost: "Free", use: "Timing/rhythm training for basal ganglia", source: "App Store: 'Pro Metronome'" },
  { name: "Mirror (full-length)", cost: "₹1000-2000", use: "Mirror therapy for unilateral pain", source: "Any furniture store" },
  { name: "Finger chart (Snellen / near card)", cost: "₹50-100", use: "Saccade and convergence testing", source: "Medical supply" },
  { name: "Vibration device (tuning fork 128Hz)", cost: "₹500-800", use: "Proprioceptive testing + cross-body stimulation", source: "Medical supply" },
  { name: "BOSU Ball", cost: "₹2000-4000", use: "Advanced balance training", source: "Sports/fitness store" },
];

const integrationWithAyush = [
  { ayushTherapy: "Marma Therapy (Krikatika)", neuroApplication: "Stimulate C1-C2 proprioceptors BEFORE gaze stability drills — primes vestibular nuclei", timing: "Marma first → drills 5 min later" },
  { ayushTherapy: "Nasya (Anu Taila)", neuroApplication: "Nasal oil stimulates olfactory cortex + trigeminal nerve → frontal lobe activation for anti-saccade training", timing: "Nasya morning → neuro drills 30 min after" },
  { ayushTherapy: "Kati Basti / Greeva Basti", neuroApplication: "Warm oil pacifies local Vata → reduces protective guarding → allows better proprioceptive input to brain", timing: "Basti session → neuro drills same evening" },
  { ayushTherapy: "Shirodhara", neuroApplication: "Rhythmic oil flow → activates parasympathetic → reduces central sensitization → brain more receptive to re-training", timing: "Shirodhara on Day 1-3 → introduce drills from Day 4" },
  { ayushTherapy: "Acupuncture (GB20, GV20)", neuroApplication: "GB20 stimulates vestibular nuclei directly. GV20 activates cortical arousal. Both enhance neuro-drill effectiveness.", timing: "Acupuncture → drills in same session (post-needle)" },
  { ayushTherapy: "Pranayama (Bhramari)", neuroApplication: "Humming vibration stimulates vagus nerve → parasympathetic activation → reduces pain gate. Also improves interoception.", timing: "Bhramari as warm-up → neuro drills → Bhramari as cool-down" },
];

// ─── Component ───
export default function SpineFunctionalNeurology() {
  const [activeTab, setActiveTab] = useState("theory");
  const [expandedDrill, setExpandedDrill] = useState<string | null>(null);
  const [expandedProtocol, setExpandedProtocol] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-indigo-600" />
            M19: Functional Neurology (Carrick)
          </h1>
          <p className="text-muted-foreground mt-1">
            Brain-based spine rehabilitation — Eye movements, Vestibular drills, Balance protocols & Hemispheric assessment
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-indigo-100 text-indigo-700"><Brain className="h-3 w-3 mr-1" /> Module 19</Badge>
          <Badge variant="outline">Advanced</Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <Card><CardContent className="pt-3 pb-2 text-center"><p className="text-lg font-bold text-indigo-600">10</p><p className="text-[9px] text-muted-foreground">Assessment Tools</p></CardContent></Card>
        <Card><CardContent className="pt-3 pb-2 text-center"><p className="text-lg font-bold text-blue-600">10</p><p className="text-[9px] text-muted-foreground">Rehab Drills</p></CardContent></Card>
        <Card><CardContent className="pt-3 pb-2 text-center"><p className="text-lg font-bold text-purple-600">5</p><p className="text-[9px] text-muted-foreground">Condition Protocols</p></CardContent></Card>
        <Card><CardContent className="pt-3 pb-2 text-center"><p className="text-lg font-bold text-green-600">6</p><p className="text-[9px] text-muted-foreground">AYUSH Integrations</p></CardContent></Card>
        <Card><CardContent className="pt-3 pb-2 text-center"><p className="text-lg font-bold text-amber-600">₹0</p><p className="text-[9px] text-muted-foreground">Equipment Cost (mostly free)</p></CardContent></Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="theory" className="text-xs gap-1"><Lightbulb className="h-3 w-3" /> Theory</TabsTrigger>
          <TabsTrigger value="assess" className="text-xs gap-1"><Eye className="h-3 w-3" /> Assessment</TabsTrigger>
          <TabsTrigger value="drills" className="text-xs gap-1"><Activity className="h-3 w-3" /> Drills</TabsTrigger>
          <TabsTrigger value="protocols" className="text-xs gap-1"><Target className="h-3 w-3" /> Protocols</TabsTrigger>
          <TabsTrigger value="integrate" className="text-xs gap-1"><Zap className="h-3 w-3" /> Integration</TabsTrigger>
        </TabsList>

        {/* TAB A: Theory */}
        <TabsContent value="theory" className="space-y-4">
          {principles.map((p, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Brain className="h-4 w-4 text-indigo-500" /> {p.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs leading-relaxed text-muted-foreground mb-3">{p.desc}</p>
                <div className="space-y-1">
                  {p.keyPoints.map((kp, j) => (
                    <div key={j} className="flex items-start gap-2 text-xs">
                      <CheckCircle2 className="h-3 w-3 text-indigo-500 mt-0.5 shrink-0" />
                      <span>{kp}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* TAB B: Assessment */}
        <TabsContent value="assess" className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1 mb-2">
            {["All", "Eye Movements", "Balance", "Vestibular", "Coordination", "Gait", "Autonomic", "Visual"].map(cat => (
              <Badge key={cat} variant="outline" className="text-[9px] justify-center cursor-pointer hover:bg-muted">{cat}</Badge>
            ))}
          </div>
          {assessmentTools.map((tool, i) => (
            <Card key={i}>
              <CardContent className="pt-3 pb-2">
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center shrink-0">
                    {tool.category === "Eye Movements" ? <Eye className="h-4 w-4 text-blue-600" /> :
                     tool.category === "Balance" ? <Footprints className="h-4 w-4 text-blue-600" /> :
                     tool.category === "Vestibular" ? <Ear className="h-4 w-4 text-blue-600" /> :
                     <Activity className="h-4 w-4 text-blue-600" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-xs">{tool.name}</p>
                      <Badge variant="secondary" className="text-[9px]">{tool.category}</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{tool.what}</p>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                      <div className="p-1.5 rounded bg-blue-50"><strong>How:</strong> {tool.how}</div>
                      <div className="p-1.5 rounded bg-green-50"><strong>Normal:</strong> {tool.normalFinding}</div>
                      <div className="p-1.5 rounded bg-red-50"><strong>Abnormal:</strong> {tool.abnormalMeaning}</div>
                      <div className="p-1.5 rounded bg-purple-50"><strong>Spine Link:</strong> {tool.spineRelevance}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* TAB C: Drills */}
        <TabsContent value="drills" className="space-y-2">
          {rehabDrills.map((drill, i) => (
            <Card key={i} className="overflow-hidden">
              <div
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/30"
                onClick={() => setExpandedDrill(expandedDrill === drill.name ? null : drill.name)}
              >
                <div className="flex items-center gap-2">
                  <Badge className={`text-[9px] ${drill.difficulty === "Beginner" ? "bg-green-100 text-green-700" : drill.difficulty === "Intermediate" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                    {drill.difficulty}
                  </Badge>
                  <span className="font-medium text-xs">{drill.name}</span>
                  <Badge variant="secondary" className="text-[9px]">{drill.category}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-muted-foreground">{drill.frequency}</span>
                  {expandedDrill === drill.name ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </div>
              {expandedDrill === drill.name && (
                <CardContent className="pt-0 pb-3 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground uppercase">Target</p>
                      <p>{drill.target}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground uppercase">Best For</p>
                      <p className="text-indigo-700">{drill.spineCondition}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase mb-1">Instructions</p>
                    <ol className="space-y-0.5">
                      {drill.instructions.map((step, j) => (
                        <li key={j} className="text-xs flex items-start gap-1.5">
                          <span className="text-indigo-500 font-bold shrink-0">{j + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    <div className="p-1.5 bg-blue-50 rounded"><strong>Frequency:</strong> {drill.frequency}</div>
                    <div className="p-1.5 bg-green-50 rounded"><strong>Duration:</strong> {drill.duration}</div>
                    <div className="p-1.5 bg-purple-50 rounded"><strong>Progression:</strong> {drill.progression}</div>
                  </div>
                  {drill.contraindications && (
                    <div className="p-1.5 bg-red-50 rounded text-[10px] flex items-start gap-1">
                      <AlertTriangle className="h-3 w-3 text-red-500 mt-0.5 shrink-0" />
                      <span><strong>Contraindication:</strong> {drill.contraindications}</span>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </TabsContent>

        {/* TAB D: Protocols */}
        <TabsContent value="protocols" className="space-y-3">
          {conditionProtocols.map((cp, i) => (
            <Card key={i}>
              <div
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/30"
                onClick={() => setExpandedProtocol(expandedProtocol === cp.condition ? null : cp.condition)}
              >
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-500" />
                  <span className="font-medium text-sm">{cp.condition}</span>
                  <Badge variant="outline" className="text-[9px]">{cp.spineLevel}</Badge>
                </div>
                {expandedProtocol === cp.condition ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
              {expandedProtocol === cp.condition && (
                <CardContent className="pt-0 pb-3 space-y-3">
                  <div className="p-2 bg-indigo-50 rounded text-xs">
                    <p className="font-medium text-indigo-700 text-[10px] uppercase">Neural Mechanism</p>
                    <p className="mt-0.5">{cp.neuralMechanism}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground uppercase mb-1">Assessments to Perform</p>
                      <div className="flex flex-wrap gap-1">
                        {cp.assessments.map(a => <Badge key={a} variant="outline" className="text-[9px]">{a}</Badge>)}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground uppercase mb-1">Prescribed Drills</p>
                      <div className="flex flex-wrap gap-1">
                        {cp.drills.map(d => <Badge key={d} className="bg-blue-50 text-blue-700 text-[9px]">{d}</Badge>)}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    <div className="p-1.5 bg-green-50 rounded"><strong>Frequency:</strong> {cp.frequency}</div>
                    <div className="p-1.5 bg-amber-50 rounded"><strong>Timeline:</strong> {cp.expectedTimeline}</div>
                    <div className="p-1.5 bg-purple-50 rounded"><strong>Integration:</strong> {cp.integration}</div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </TabsContent>

        {/* TAB E: Integration */}
        <TabsContent value="integrate" className="space-y-4">
          {/* AYUSH Integration */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" /> Integration with AYUSH Therapies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {integrationWithAyush.map((item, i) => (
                <div key={i} className="p-2 rounded border bg-amber-50/30 text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-green-100 text-green-700 text-[9px]">{item.ayushTherapy}</Badge>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <Badge className="bg-indigo-100 text-indigo-700 text-[9px]">Neuro Drill</Badge>
                  </div>
                  <p className="text-muted-foreground">{item.neuroApplication}</p>
                  <p className="text-[10px] mt-1 text-indigo-600 font-medium"><Clock className="h-3 w-3 inline mr-0.5" /> {item.timing}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Equipment */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-500" /> Equipment Needed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b text-muted-foreground text-[10px]">
                      <th className="text-left p-1.5">Equipment</th>
                      <th className="text-center p-1.5">Cost</th>
                      <th className="text-left p-1.5">Use</th>
                      <th className="text-left p-1.5">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {equipmentList.map((eq, i) => (
                      <tr key={i} className="border-b hover:bg-muted/30">
                        <td className="p-1.5 font-medium">{eq.name}</td>
                        <td className="p-1.5 text-center text-green-600">{eq.cost}</td>
                        <td className="p-1.5 text-muted-foreground">{eq.use}</td>
                        <td className="p-1.5 text-muted-foreground">{eq.source}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 text-center">Total setup cost: under ₹5,000 — Most drills need NO equipment</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
