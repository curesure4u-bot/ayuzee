import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Scale, Plus, Trash2, Search, Star, Clock, IndianRupee,
  Target, TrendingUp, Shield, Zap, Heart, Brain, Activity,
  CheckCircle2, XCircle, AlertTriangle, ArrowUpDown, Filter,
  Award, BarChart3, Users, Leaf,
} from "lucide-react";

// ─── Therapy Database ───
interface TherapyData {
  id: string;
  name: string;
  category: string;
  type: string;
  duration: string;
  durationMinutes: number;
  sessionsNeeded: string;
  costPerSession: number;
  totalCost: string;
  successRate: number;
  painReliefPercent: number;
  onsetOfRelief: string;
  indications: string[];
  contraindications: string[];
  sideEffects: string[];
  evidenceLevel: string;
  patientCompliance: number;
  needsDoctor: boolean;
  repeatability: string;
  bestFor: string;
  notFor: string;
  ayurvedicPrinciple: string;
  combinationSynergy: string[];
}

const therapyDatabase: TherapyData[] = [
  {
    id: "agnikarma",
    name: "Agnikarma",
    category: "Level 1",
    type: "Thermal Cauterization",
    duration: "15 min",
    durationMinutes: 15,
    sessionsNeeded: "3-5 sessions (weekly)",
    costPerSession: 800,
    totalCost: "₹2,400-4,000",
    successRate: 78,
    painReliefPercent: 55,
    onsetOfRelief: "Immediate (within minutes)",
    indications: ["Myofascial trigger points", "Chronic pain", "Sciatica (gluteal TrPs)", "Tennis elbow", "Plantar fasciitis", "Knee pain (TrPs)"],
    contraindications: ["Bleeding disorders", "Pregnancy", "Diabetes (uncontrolled)", "Skin infections at site", "Pitta prakruti (relative)"],
    sideEffects: ["Temporary burn mark (3-5 days)", "Mild pain at site", "Hyperpigmentation (resolves in 2-4 weeks)"],
    evidenceLevel: "Moderate (Classical + RCT evidence)",
    patientCompliance: 70,
    needsDoctor: true,
    repeatability: "Weekly × 3-5, then monthly maintenance",
    bestFor: "Acute flares, trigger point pain, patients wanting instant relief",
    notFor: "Pain-phobic patients, cosmetically sensitive areas, Pitta-dominant",
    ayurvedicPrinciple: "Agni destroys Ama + Vata Sanga at local level. Samyak Dagdha = optimal cautery depth.",
    combinationSynergy: ["Kati Basti (before Agnikarma)", "Trigger Point Therapy (locate → then burn)", "Patra Pinda Sweda (next day recovery)"],
  },
  {
    id: "kati-basti",
    name: "Kati Basti",
    category: "Level 2 (PK)",
    type: "Oil Retention Therapy",
    duration: "45 min",
    durationMinutes: 45,
    sessionsNeeded: "7-14 days (daily)",
    costPerSession: 1200,
    totalCost: "₹8,400-16,800",
    successRate: 87,
    painReliefPercent: 65,
    onsetOfRelief: "Gradual (Day 3-5 noticeable)",
    indications: ["Low back pain", "Sciatica", "Disc bulge/herniation", "Lumbar spondylosis", "SI joint pain", "Post-surgical rehab"],
    contraindications: ["Skin lesions on back", "Fever", "Acute infection", "Open wounds"],
    sideEffects: ["Oil staining on clothes", "Mild warmth/redness (normal)", "Rare: skin irritation from oil"],
    evidenceLevel: "Strong (Multiple RCTs + classical evidence)",
    patientCompliance: 85,
    needsDoctor: false,
    repeatability: "Daily × 7-14, then monthly maintenance",
    bestFor: "Chronic low back pain, disc issues, patients who can commit 7+ days",
    notFor: "Acute trauma (first 48hr), patients who can't lie prone 45 min",
    ayurvedicPrinciple: "Warm medicated oil nourishes Asthi-Majja Dhatu, pacifies Vata in Kati region. Snehana + Swedana combined.",
    combinationSynergy: ["Tikta Ksheer Basti (after Kati Basti course)", "Agnikarma (for residual TrPs)", "Patra Pinda Sweda (before Kati Basti)"],
  },
  {
    id: "tikta-ksheer-basti",
    name: "Tikta Ksheer Basti",
    category: "Level 2 (PK)",
    type: "Medicated Enema (16-day)",
    duration: "45 min",
    durationMinutes: 45,
    sessionsNeeded: "16 days (alternating schedule)",
    costPerSession: 750,
    totalCost: "₹12,000",
    successRate: 80,
    painReliefPercent: 60,
    onsetOfRelief: "Gradual (Week 2 onwards)",
    indications: ["Chronic sciatica", "Disc degeneration", "Osteoporosis", "Avascular necrosis", "Vata in Asthi-Majja", "Non-healing fractures"],
    contraindications: ["Diarrhea", "Rectal bleeding", "Pregnancy", "Severe weakness", "Ama condition (undigested toxins)"],
    sideEffects: ["Mild abdominal discomfort", "Increased bowel movements", "Fatigue (first 2-3 days)"],
    evidenceLevel: "Strong (Classical gold standard for bone/nerve diseases)",
    patientCompliance: 65,
    needsDoctor: false,
    repeatability: "16-day course, repeat after 3-6 months if needed",
    bestFor: "Deep Vata disorders, disc degeneration, bone diseases, nerve damage",
    notFor: "Patients who can't commit 16 days, acute conditions, Kapha excess",
    ayurvedicPrinciple: "Tikta Rasa (bitter) nourishes Asthi Dhatu. Ksheer (milk) nourishes Majja. Combined = bone + nerve repair.",
    combinationSynergy: ["Kati Basti (before starting Basti)", "Abhyanga + Swedana (daily before Basti)", "Yoga therapy (Phase 3 after Basti)"],
  },
  {
    id: "acupuncture",
    name: "Acupuncture",
    category: "Integrative",
    type: "Needle Therapy (TCM)",
    duration: "30 min",
    durationMinutes: 30,
    sessionsNeeded: "10-12 sessions (2-3×/week)",
    costPerSession: 600,
    totalCost: "₹6,000-7,200",
    successRate: 75,
    painReliefPercent: 50,
    onsetOfRelief: "Moderate (Session 3-4 noticeable)",
    indications: ["All spine pain", "Sciatica", "Neck pain", "Headache", "Knee pain", "Frozen shoulder", "Neuropathy"],
    contraindications: ["Bleeding disorders", "Severe needle phobia", "Pregnancy (certain points)", "Pacemaker (for electroacupuncture)"],
    sideEffects: ["Mild bruising", "Temporary soreness", "Rare: fainting (needle sensitive)", "Drowsiness"],
    evidenceLevel: "Strong (WHO-recognized, multiple meta-analyses)",
    patientCompliance: 75,
    needsDoctor: true,
    repeatability: "2-3×/week × 4-6 weeks, then weekly maintenance",
    bestFor: "All pain conditions, patients open to integrative medicine, chronic pain",
    notFor: "Extreme needle phobia, very acute trauma",
    ayurvedicPrinciple: "Sira Vedha (vein puncture) correlation. Stimulates Prana flow through Nadis. Equivalent to Marma stimulation.",
    combinationSynergy: ["Kati Basti (same day — oil then needles)", "Moxibustion (warming cold-type pain)", "Cupping (after needle removal)"],
  },
  {
    id: "marma-therapy",
    name: "Marma Therapy",
    category: "Level 1",
    type: "Vital Point Stimulation",
    duration: "30 min",
    durationMinutes: 30,
    sessionsNeeded: "6-10 sessions (alternate days)",
    costPerSession: 600,
    totalCost: "₹3,600-6,000",
    successRate: 72,
    painReliefPercent: 35,
    onsetOfRelief: "Moderate (builds over sessions)",
    indications: ["Energy blockage", "Chronic pain", "Frozen shoulder", "Sciatica", "Headache", "Joint stiffness", "Post-stroke recovery"],
    contraindications: ["Fractures at site", "Deep vein thrombosis", "Cancer at site", "Acute inflammation"],
    sideEffects: ["Temporary tenderness", "Emotional release", "Mild fatigue", "Rare: bruising"],
    evidenceLevel: "Moderate (Classical evidence + pilot studies)",
    patientCompliance: 90,
    needsDoctor: true,
    repeatability: "Alternate days × 10, then weekly",
    bestFor: "Energy-sensitive patients, elderly, gentle approach needed, prevention",
    notFor: "Patients wanting instant dramatic relief, very acute pain",
    ayurvedicPrinciple: "107 Marma = Prana junction points. Stimulation removes Sanga (blockage) and restores Vayu flow through Srotas.",
    combinationSynergy: ["Abhyanga (before Marma)", "Pranayama (after Marma)", "Nasya (for head Marma sessions)"],
  },
  {
    id: "trigger-point",
    name: "Trigger Point Therapy",
    category: "Level 1",
    type: "Myofascial Release",
    duration: "20 min",
    durationMinutes: 20,
    sessionsNeeded: "4-8 sessions (2×/week)",
    costPerSession: 500,
    totalCost: "₹2,000-4,000",
    successRate: 74,
    painReliefPercent: 45,
    onsetOfRelief: "Fast (same session relief)",
    indications: ["Myofascial pain", "Referred pain patterns", "Neck/shoulder pain", "Low back pain", "Headache (muscular)", "ITB syndrome"],
    contraindications: ["Blood thinners", "Local infection", "Acute disc herniation (over nerve root)", "Fibromyalgia (relative)"],
    sideEffects: ["Post-treatment soreness (24-48hr)", "Bruising (rare)", "Temporary increased pain"],
    evidenceLevel: "Strong (Well-established in physiotherapy literature)",
    patientCompliance: 80,
    needsDoctor: true,
    repeatability: "2×/week × 4 weeks, then as needed",
    bestFor: "Muscular pain, desk workers, athletes, identifiable trigger points",
    notFor: "Nerve pain (radiculopathy), joint pain (not muscular), very sensitive patients",
    ayurvedicPrinciple: "Correlates to Granthi (knots) in Mamsa Dhatu. Ischemic compression releases Ama accumulated in Sira (vessels).",
    combinationSynergy: ["Agnikarma (on persistent TrPs after manual release fails)", "Dry Needling (precise TrP access)", "Stretching protocol (post-release)"],
  },
  {
    id: "cupping",
    name: "Hijama / Cupping",
    category: "Level 1",
    type: "Vacuum Therapy (Wet/Dry)",
    duration: "30 min",
    durationMinutes: 30,
    sessionsNeeded: "4-6 sessions (weekly)",
    costPerSession: 1000,
    totalCost: "₹4,000-6,000",
    successRate: 73,
    painReliefPercent: 42,
    onsetOfRelief: "Fast (same day improvement)",
    indications: ["Back pain", "Shoulder pain", "Blood stagnation", "Muscle spasm", "Detoxification", "Headache"],
    contraindications: ["Bleeding disorders", "Pregnancy", "Skin conditions at site", "Anemia", "Blood thinners"],
    sideEffects: ["Circular marks (7-14 days)", "Mild pain during wet cupping", "Dizziness (if too many cups)", "Skin irritation"],
    evidenceLevel: "Moderate (Growing evidence base, Unani/TCM tradition)",
    patientCompliance: 70,
    needsDoctor: true,
    repeatability: "Weekly × 4-6, then monthly",
    bestFor: "Blood stagnation, Kapha/Pitta types, muscle spasm, patients wanting visible results",
    notFor: "Anemic patients, very thin patients, those concerned about marks",
    ayurvedicPrinciple: "Raktamokshana (bloodletting) equivalent. Removes Dushta Rakta (vitiated blood) and Pitta from local tissues.",
    combinationSynergy: ["Acupuncture (before cupping on same points)", "Abhyanga (oil before dry cupping)", "Agnikarma (different session — don't combine same day)"],
  },
  {
    id: "greeva-basti",
    name: "Greeva Basti",
    category: "Level 2 (PK)",
    type: "Cervical Oil Retention",
    duration: "45 min",
    durationMinutes: 45,
    sessionsNeeded: "7-14 days (daily)",
    costPerSession: 1200,
    totalCost: "₹8,400-16,800",
    successRate: 85,
    painReliefPercent: 62,
    onsetOfRelief: "Gradual (Day 2-3 noticeable)",
    indications: ["Cervical spondylosis", "Neck pain", "Frozen shoulder (C5-T2)", "Cervicogenic headache", "Arm numbness", "Disc bulge (cervical)"],
    contraindications: ["Neck skin lesions", "Fever", "Acute whiplash (first 72hr)", "Cervical fracture"],
    sideEffects: ["Oil on hair/clothes", "Mild warmth", "Rare: headache if oil too hot"],
    evidenceLevel: "Strong (Multiple RCTs for cervical spondylosis)",
    patientCompliance: 82,
    needsDoctor: false,
    repeatability: "Daily × 7-14, monthly maintenance",
    bestFor: "Cervical conditions, desk workers, arm numbness, headache from neck",
    notFor: "Acute whiplash, cervical fracture, patients who can't sit still 45 min",
    ayurvedicPrinciple: "Same as Kati Basti but for Greeva (neck). Snehana nourishes cervical Asthi-Majja, pacifies local Vata.",
    combinationSynergy: ["Nasya (after Greeva Basti — enhances Prana Vayu)", "Shirodhara (for stress-related neck pain)", "MET (post-Basti for ROM recovery)"],
  },
  {
    id: "patra-pinda",
    name: "Patra Pinda Sweda",
    category: "Level 2 (PK)",
    type: "Herbal Bolus Fomentation",
    duration: "45 min",
    durationMinutes: 45,
    sessionsNeeded: "7-14 days (daily)",
    costPerSession: 1000,
    totalCost: "₹7,000-14,000",
    successRate: 75,
    painReliefPercent: 48,
    onsetOfRelief: "Gradual (Day 2-3)",
    indications: ["Muscle spasm", "Stiffness", "Inflammation", "Arthritis", "Post-Basti recovery", "Kapha-Vata conditions"],
    contraindications: ["Fever", "Acute inflammation (red/hot/swollen)", "Skin burns", "Open wounds"],
    sideEffects: ["Skin redness (normal — resolves in 1hr)", "Sweating", "Mild fatigue", "Thirst"],
    evidenceLevel: "Moderate (Classical + clinical observations)",
    patientCompliance: 88,
    needsDoctor: false,
    repeatability: "Daily × 7-14, can repeat courses",
    bestFor: "Stiffness, Kapha types, elderly, preparation for deeper therapies",
    notFor: "Pitta-dominant inflammation (use cooling instead), acute fractures",
    ayurvedicPrinciple: "Patra (leaves) + Pinda (bolus) = Snehana + Swedana combined. Anti-Vata herbs penetrate through sweat-opened channels.",
    combinationSynergy: ["Kati Basti (Patra Pinda before Kati Basti)", "Abhyanga (oil first, then bolus)", "Basti therapy (PPS as Purvakarma)"],
  },
  {
    id: "dry-needling",
    name: "Dry Needling",
    category: "Integrative",
    type: "Intramuscular Stimulation",
    duration: "20 min",
    durationMinutes: 20,
    sessionsNeeded: "4-8 sessions (1-2×/week)",
    costPerSession: 700,
    totalCost: "₹2,800-5,600",
    successRate: 76,
    painReliefPercent: 52,
    onsetOfRelief: "Fast (local twitch → relief in 24-48hr)",
    indications: ["Deep trigger points", "Myofascial pain", "Chronic muscle tightness", "Multifidus dysfunction", "Piriformis syndrome"],
    contraindications: ["Needle phobia", "Bleeding disorders", "Infection at site", "Pregnancy (abdominal/lumbar)", "Pneumothorax risk (thoracic)"],
    sideEffects: ["Post-needling soreness (24-48hr)", "Bruising", "Muscle twitch response", "Rare: pneumothorax (thoracic area)"],
    evidenceLevel: "Strong (Multiple systematic reviews)",
    patientCompliance: 72,
    needsDoctor: true,
    repeatability: "1-2×/week × 4 weeks, then as needed",
    bestFor: "Deep muscles unreachable by manual therapy, precise TrP deactivation",
    notFor: "Needle phobic, superficial pain, nerve pain (not muscular)",
    ayurvedicPrinciple: "Similar to Viddha Karma but targeting Mamsa Dhatu (muscle) specifically. Releases Granthi (muscular knots).",
    combinationSynergy: ["Trigger Point Therapy (manual first, needle persistent ones)", "Stretching (immediately after)", "Heat therapy (post-needling recovery)"],
  },
  {
    id: "nasya",
    name: "Nasya",
    category: "Level 2 (PK)",
    type: "Nasal Oil Administration",
    duration: "30 min",
    durationMinutes: 30,
    sessionsNeeded: "7 days (daily)",
    costPerSession: 500,
    totalCost: "₹3,500",
    successRate: 83,
    painReliefPercent: 45,
    onsetOfRelief: "Fast (same day for headache, Day 3 for cervical)",
    indications: ["Cervicogenic headache", "Cervical spondylosis", "Sinusitis", "Frozen shoulder (C5 nerve)", "Facial palsy", "Migraine"],
    contraindications: ["Nasal polyps (severe)", "Active sinusitis (acute)", "Pregnancy", "Just after meals", "During menstruation"],
    sideEffects: ["Throat irritation (temporary)", "Sneezing", "Watery eyes", "Mild headache (Day 1-2)"],
    evidenceLevel: "Strong (Classical — 'Nasa hi Shiraso Dwaram')",
    patientCompliance: 78,
    needsDoctor: false,
    repeatability: "7-day course, repeat monthly or seasonally",
    bestFor: "All head/neck conditions, Prana Vayu disorders, cervical nerve root issues",
    notFor: "Nasal obstruction, very young children, immediately after eating",
    ayurvedicPrinciple: "'Nasa hi Shiraso Dwaram' — Nose is the gateway to the head. Anu Taila nourishes Prana Vayu and cranial nerves directly.",
    combinationSynergy: ["Greeva Basti (Nasya after Greeva Basti session)", "Shirodhara (Nasya morning + Shirodhara evening)", "Marma therapy (head Marma + Nasya)"],
  },
  {
    id: "yoga-therapy",
    name: "Spine Yoga Therapy",
    category: "Yoga/Exercise",
    type: "Therapeutic Yoga Protocol",
    duration: "45 min",
    durationMinutes: 45,
    sessionsNeeded: "21+ days (daily practice)",
    costPerSession: 300,
    totalCost: "₹6,000-9,000 (course)",
    successRate: 72,
    painReliefPercent: 40,
    onsetOfRelief: "Slow (Week 2-3 for significant relief)",
    indications: ["All chronic spine conditions", "Prevention", "Maintenance", "Posture correction", "Core weakness", "Stress-related pain"],
    contraindications: ["Acute disc herniation (modify)", "Unstable fracture", "Severe osteoporosis (modify)", "Acute inflammation"],
    sideEffects: ["Mild muscle soreness (initial)", "Rare: aggravation if wrong poses selected"],
    evidenceLevel: "Strong (Multiple RCTs, NICE guidelines support)",
    patientCompliance: 60,
    needsDoctor: false,
    repeatability: "Daily lifelong practice (self-maintenance)",
    bestFor: "Long-term management, prevention, empowering patients, low cost solution",
    notFor: "Patients wanting passive treatment only, very acute pain, non-compliant patients",
    ayurvedicPrinciple: "Yoga = Vata Shamana through controlled movement + Pranayama. Builds Agni, strengthens Dhatus, calms Manas.",
    combinationSynergy: ["All therapies (Yoga as Phase 3 maintenance)", "Pranayama + Meditation (stress component)", "Corrective exercise (specific muscle activation)"],
  },
];

// ─── Component ───
export default function SpineTherapyComparison() {
  const [selectedTherapies, setSelectedTherapies] = useState<string[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterCondition, setFilterCondition] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("successRate");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter therapies
  const filteredTherapies = useMemo(() => {
    let list = [...therapyDatabase];
    if (filterCategory !== "all") {
      list = list.filter(t => t.category === filterCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.indications.some(ind => ind.toLowerCase().includes(q)) ||
        t.type.toLowerCase().includes(q)
      );
    }
    if (filterCondition) {
      const q = filterCondition.toLowerCase();
      list = list.filter(t => t.indications.some(ind => ind.toLowerCase().includes(q)));
    }
    // Sort
    list.sort((a, b) => {
      switch (sortBy) {
        case "successRate": return b.successRate - a.successRate;
        case "cost": return a.costPerSession - b.costPerSession;
        case "painRelief": return b.painReliefPercent - a.painReliefPercent;
        case "compliance": return b.patientCompliance - a.patientCompliance;
        case "duration": return a.durationMinutes - b.durationMinutes;
        default: return 0;
      }
    });
    return list;
  }, [filterCategory, searchQuery, filterCondition, sortBy]);

  const selectedData = selectedTherapies.map(id => therapyDatabase.find(t => t.id === id)).filter(Boolean) as TherapyData[];

  const toggleSelection = (id: string) => {
    setSelectedTherapies(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 4 ? [...prev, id] : prev
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-700";
    if (score >= 60) return "bg-blue-100 text-blue-700";
    if (score >= 40) return "bg-amber-100 text-amber-700";
    return "bg-red-100 text-red-700";
  };

  // Best-in-class highlights
  const getBestInClass = (field: keyof TherapyData) => {
    if (selectedData.length < 2) return null;
    let best = selectedData[0];
    for (const t of selectedData) {
      if (field === "costPerSession") {
        if ((t[field] as number) < (best[field] as number)) best = t;
      } else {
        if ((t[field] as number) > (best[field] as number)) best = t;
      }
    }
    return best.id;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Scale className="h-6 w-6 text-orange-600" />
            Therapy Comparison Engine
          </h1>
          <p className="text-muted-foreground mt-1">
            Compare spine therapies side-by-side on cost, duration, success rate, indications & evidence
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-orange-100 text-orange-700">
            <Brain className="h-3 w-3 mr-1" /> Tool #4 of 5
          </Badge>
          {selectedTherapies.length > 0 && (
            <Badge variant="outline" className="gap-1">
              <Scale className="h-3 w-3" /> {selectedTherapies.length}/4 selected
            </Badge>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <div className="col-span-2 sm:col-span-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search therapy..."
                className="pl-9"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Level 1">Level 1 (Quick)</SelectItem>
                  <SelectItem value="Level 2 (PK)">Level 2 (Panchakarma)</SelectItem>
                  <SelectItem value="Integrative">Integrative</SelectItem>
                  <SelectItem value="Yoga/Exercise">Yoga/Exercise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={filterCondition} onValueChange={setFilterCondition}>
                <SelectTrigger><SelectValue placeholder="Condition" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Conditions</SelectItem>
                  <SelectItem value="sciatica">Sciatica</SelectItem>
                  <SelectItem value="low back">Low Back Pain</SelectItem>
                  <SelectItem value="neck">Neck Pain</SelectItem>
                  <SelectItem value="disc">Disc Issues</SelectItem>
                  <SelectItem value="headache">Headache</SelectItem>
                  <SelectItem value="shoulder">Shoulder Pain</SelectItem>
                  <SelectItem value="knee">Knee Pain</SelectItem>
                  <SelectItem value="stiffness">Stiffness</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger><SelectValue placeholder="Sort by" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="successRate">Success Rate ↓</SelectItem>
                  <SelectItem value="cost">Cost (Low→High)</SelectItem>
                  <SelectItem value="painRelief">Pain Relief % ↓</SelectItem>
                  <SelectItem value="compliance">Patient Compliance ↓</SelectItem>
                  <SelectItem value="duration">Duration (Short→Long)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectedTherapies.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => setSelectedTherapies([])} className="gap-1">
                <Trash2 className="h-3 w-3" /> Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Therapy Selection Grid */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Select Therapies to Compare (max 4)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {filteredTherapies.map(therapy => {
              const isSelected = selectedTherapies.includes(therapy.id);
              return (
                <button
                  key={therapy.id}
                  onClick={() => toggleSelection(therapy.id)}
                  className={`p-3 rounded-lg border text-left transition ${
                    isSelected
                      ? "bg-orange-50 border-orange-400 ring-2 ring-orange-200"
                      : "hover:bg-muted border-border"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{therapy.name}</span>
                    {isSelected && <CheckCircle2 className="h-4 w-4 text-orange-600" />}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{therapy.type}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant="secondary" className="text-[9px]">{therapy.category}</Badge>
                    <span className={`text-[10px] font-bold ${getScoreColor(therapy.successRate)}`}>{therapy.successRate}%</span>
                    <span className="text-[10px] text-muted-foreground">₹{therapy.costPerSession}</span>
                    <span className="text-[10px] text-muted-foreground">{therapy.duration}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      {selectedData.length >= 2 && (
        <Card className="border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Scale className="h-4 w-4 text-orange-600" /> Head-to-Head Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 w-[140px] font-medium text-muted-foreground">Parameter</th>
                    {selectedData.map(t => (
                      <th key={t.id} className="text-center p-2 font-bold">{t.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Category */}
                  <tr className="border-b hover:bg-muted/30">
                    <td className="p-2 font-medium text-muted-foreground">Category</td>
                    {selectedData.map(t => <td key={t.id} className="p-2 text-center"><Badge variant="secondary" className="text-[9px]">{t.category}</Badge></td>)}
                  </tr>
                  {/* Success Rate */}
                  <tr className="border-b hover:bg-muted/30">
                    <td className="p-2 font-medium text-muted-foreground flex items-center gap-1"><Star className="h-3 w-3 text-amber-500" /> Success Rate</td>
                    {selectedData.map(t => (
                      <td key={t.id} className="p-2 text-center">
                        <span className={`font-bold ${getScoreColor(t.successRate)} ${getBestInClass("successRate") === t.id ? "underline" : ""}`}>
                          {t.successRate}%
                        </span>
                        {getBestInClass("successRate") === t.id && <Award className="h-3 w-3 text-amber-500 inline ml-1" />}
                      </td>
                    ))}
                  </tr>
                  {/* Pain Relief */}
                  <tr className="border-b hover:bg-muted/30">
                    <td className="p-2 font-medium text-muted-foreground flex items-center gap-1"><TrendingUp className="h-3 w-3 text-green-500" /> Pain Relief %</td>
                    {selectedData.map(t => (
                      <td key={t.id} className="p-2 text-center">
                        <span className={`font-bold ${getScoreColor(t.painReliefPercent)}`}>{t.painReliefPercent}%</span>
                        {getBestInClass("painReliefPercent") === t.id && <Award className="h-3 w-3 text-amber-500 inline ml-1" />}
                      </td>
                    ))}
                  </tr>
                  {/* Cost */}
                  <tr className="border-b hover:bg-muted/30">
                    <td className="p-2 font-medium text-muted-foreground flex items-center gap-1"><IndianRupee className="h-3 w-3 text-green-600" /> Cost/Session</td>
                    {selectedData.map(t => (
                      <td key={t.id} className="p-2 text-center">
                        <span className={getBestInClass("costPerSession") === t.id ? "font-bold text-green-600" : ""}>₹{t.costPerSession}</span>
                        {getBestInClass("costPerSession") === t.id && <Award className="h-3 w-3 text-amber-500 inline ml-1" />}
                      </td>
                    ))}
                  </tr>
                  {/* Total Cost */}
                  <tr className="border-b hover:bg-muted/30">
                    <td className="p-2 font-medium text-muted-foreground">Total Course Cost</td>
                    {selectedData.map(t => <td key={t.id} className="p-2 text-center">{t.totalCost}</td>)}
                  </tr>
                  {/* Duration */}
                  <tr className="border-b hover:bg-muted/30">
                    <td className="p-2 font-medium text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3 text-blue-500" /> Session Duration</td>
                    {selectedData.map(t => <td key={t.id} className="p-2 text-center">{t.duration}</td>)}
                  </tr>
                  {/* Sessions Needed */}
                  <tr className="border-b hover:bg-muted/30">
                    <td className="p-2 font-medium text-muted-foreground">Sessions Needed</td>
                    {selectedData.map(t => <td key={t.id} className="p-2 text-center text-[10px]">{t.sessionsNeeded}</td>)}
                  </tr>
                  {/* Onset */}
                  <tr className="border-b hover:bg-muted/30">
                    <td className="p-2 font-medium text-muted-foreground flex items-center gap-1"><Zap className="h-3 w-3 text-amber-500" /> Onset of Relief</td>
                    {selectedData.map(t => <td key={t.id} className="p-2 text-center text-[10px]">{t.onsetOfRelief}</td>)}
                  </tr>
                  {/* Compliance */}
                  <tr className="border-b hover:bg-muted/30">
                    <td className="p-2 font-medium text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3 text-purple-500" /> Patient Compliance</td>
                    {selectedData.map(t => (
                      <td key={t.id} className="p-2 text-center">
                        <span className={`font-bold ${getScoreColor(t.patientCompliance)}`}>{t.patientCompliance}%</span>
                        {getBestInClass("patientCompliance") === t.id && <Award className="h-3 w-3 text-amber-500 inline ml-1" />}
                      </td>
                    ))}
                  </tr>
                  {/* Evidence */}
                  <tr className="border-b hover:bg-muted/30">
                    <td className="p-2 font-medium text-muted-foreground flex items-center gap-1"><Shield className="h-3 w-3 text-indigo-500" /> Evidence Level</td>
                    {selectedData.map(t => <td key={t.id} className="p-2 text-center text-[10px]">{t.evidenceLevel}</td>)}
                  </tr>
                  {/* Needs Doctor */}
                  <tr className="border-b hover:bg-muted/30">
                    <td className="p-2 font-medium text-muted-foreground">Needs Doctor?</td>
                    {selectedData.map(t => (
                      <td key={t.id} className="p-2 text-center">
                        {t.needsDoctor
                          ? <Badge className="bg-red-50 text-red-600 text-[9px]">Doctor only</Badge>
                          : <Badge className="bg-green-50 text-green-600 text-[9px]">Therapist can do</Badge>
                        }
                      </td>
                    ))}
                  </tr>
                  {/* Best For */}
                  <tr className="border-b hover:bg-muted/30">
                    <td className="p-2 font-medium text-muted-foreground flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-500" /> Best For</td>
                    {selectedData.map(t => <td key={t.id} className="p-2 text-[10px] text-green-700">{t.bestFor}</td>)}
                  </tr>
                  {/* Not For */}
                  <tr className="border-b hover:bg-muted/30">
                    <td className="p-2 font-medium text-muted-foreground flex items-center gap-1"><XCircle className="h-3 w-3 text-red-500" /> Not For</td>
                    {selectedData.map(t => <td key={t.id} className="p-2 text-[10px] text-red-600">{t.notFor}</td>)}
                  </tr>
                  {/* Ayurvedic Principle */}
                  <tr className="border-b hover:bg-muted/30">
                    <td className="p-2 font-medium text-muted-foreground flex items-center gap-1"><Leaf className="h-3 w-3 text-green-600" /> Ayurvedic Principle</td>
                    {selectedData.map(t => <td key={t.id} className="p-2 text-[10px] italic">{t.ayurvedicPrinciple}</td>)}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Visual Score Comparison */}
      {selectedData.length >= 2 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-1">
              <BarChart3 className="h-3.5 w-3.5" /> Visual Score Comparison
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Success Rate", field: "successRate" as keyof TherapyData, max: 100, color: "bg-green-500" },
              { label: "Pain Relief %", field: "painReliefPercent" as keyof TherapyData, max: 100, color: "bg-blue-500" },
              { label: "Patient Compliance", field: "patientCompliance" as keyof TherapyData, max: 100, color: "bg-purple-500" },
            ].map(metric => (
              <div key={metric.label}>
                <p className="text-[10px] font-medium text-muted-foreground mb-1">{metric.label}</p>
                <div className="space-y-1">
                  {selectedData.map(t => (
                    <div key={t.id} className="flex items-center gap-2">
                      <span className="text-[10px] w-[100px] truncate">{t.name}</span>
                      <div className="flex-1 h-4 bg-muted rounded overflow-hidden">
                        <div
                          className={`h-full ${metric.color} rounded transition-all`}
                          style={{ width: `${((t[metric.field] as number) / metric.max) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold w-[35px] text-right">{t[metric.field] as number}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Cost Comparison (inverted — lower is better) */}
            <div>
              <p className="text-[10px] font-medium text-muted-foreground mb-1">Cost per Session (lower = better)</p>
              <div className="space-y-1">
                {selectedData.map(t => {
                  const maxCost = Math.max(...selectedData.map(x => x.costPerSession));
                  return (
                    <div key={t.id} className="flex items-center gap-2">
                      <span className="text-[10px] w-[100px] truncate">{t.name}</span>
                      <div className="flex-1 h-4 bg-muted rounded overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded transition-all"
                          style={{ width: `${(t.costPerSession / maxCost) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold w-[45px] text-right">₹{t.costPerSession}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Indications & Contraindications Detail */}
      {selectedData.length >= 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> Indications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedData.map(t => (
                <div key={t.id}>
                  <p className="text-xs font-medium mb-1">{t.name}</p>
                  <div className="flex flex-wrap gap-1">
                    {t.indications.map(ind => (
                      <Badge key={ind} className="bg-green-50 text-green-700 text-[9px]">{ind}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5 text-red-500" /> Contraindications & Side Effects
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedData.map(t => (
                <div key={t.id}>
                  <p className="text-xs font-medium mb-1">{t.name}</p>
                  <div className="flex flex-wrap gap-1 mb-1">
                    {t.contraindications.map(c => (
                      <Badge key={c} className="bg-red-50 text-red-600 text-[9px]">{c}</Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {t.sideEffects.map(s => (
                      <Badge key={s} variant="outline" className="text-[9px] text-amber-600">{s}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Synergy Recommendations */}
      {selectedData.length >= 2 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 text-amber-500" /> Combination Synergies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {selectedData.map(t => (
              <div key={t.id} className="p-2 rounded border bg-amber-50/30">
                <p className="text-xs font-medium">{t.name} combines well with:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {t.combinationSynergy.map(syn => (
                    <Badge key={syn} variant="secondary" className="text-[9px]">{syn}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {selectedData.length < 2 && (
        <Card>
          <CardContent className="py-10 text-center">
            <Scale className="h-12 w-12 mx-auto text-muted-foreground/20 mb-3" />
            <h3 className="font-medium text-muted-foreground">Select 2-4 Therapies to Compare</h3>
            <p className="text-xs text-muted-foreground mt-1">Click on therapy cards above to add them to the comparison</p>
            <p className="text-xs text-muted-foreground mt-0.5">Use filters to narrow by category, condition, or sort by success rate/cost</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
