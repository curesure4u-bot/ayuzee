import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity, BookOpen, Eye, User, ArrowRight, Hand, Zap, Dumbbell,
  AlertTriangle, Layers, Footprints, MinusCircle, TrendingDown,
  Search, GraduationCap, Stethoscope, Heart, Brain, Clock, Users,
  CheckCircle2, Lock, Play, ChevronRight, Leaf,
} from "lucide-react";

export default function SpineAyushModules() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");

  const modules = [
    {
      id: 1, title: "Posture Introduction", subtitle: "Foundation of Spinal Assessment",
      topics: 18, duration: 45, level: "beginner", category: "posture_theory",
      icon: BookOpen, color: "blue", ayush: "Integrative",
      description: "Definition of posture, postural control, Janda's muscle imbalance theory, developmental curves, and assessment basics from AYUSH perspective.",
      keyTopics: ["Good vs Faulty Posture", "Postural Muscles (Type I Fibers)", "Janda's Theory", "COM, BOS & Plumb Line", "Equipment & Landmarks"],
      doshaRelevance: "Vata governs movement & posture control; Kapha provides structural stability",
    },
    {
      id: 2, title: "Posterior View Assessment", subtitle: "Back View Observation & Analysis",
      topics: 29, duration: 60, level: "intermediate", category: "posture_assessment",
      icon: Eye, color: "green", ayush: "Integrative",
      description: "Complete posterior assessment — head position, scapular alignment, thoracic spine, pelvic tilt, knee & foot evaluation with AYUSH correlation.",
      keyTopics: ["Torticollis & Head Position", "Scapular Rotation & Adduction", "Genu Varum/Valgum", "Pes Valgus/Varus", "Pelvic Lateral Tilt"],
      doshaRelevance: "Vata imbalance → asymmetry; Kapha excess → heaviness & drooping",
    },
    {
      id: 3, title: "Anterior View Assessment", subtitle: "Front View Observation & Analysis",
      topics: 23, duration: 50, level: "intermediate", category: "posture_assessment",
      icon: User, color: "purple", ayush: "Integrative",
      description: "Full anterior view — face symmetry, clavicles, carrying angle, pelvic rotation, Q-angle, Craig's test, and foot alignment with Prakriti correlation.",
      keyTopics: ["Carrying Angle & Arm Position", "Pelvic Rotation Effects", "Q-Angle Assessment", "Craig's Test Concept", "Pes Cavus & Pes Planus"],
      doshaRelevance: "Pitta types show more inflammatory joint changes; Vata shows asymmetry",
    },
    {
      id: 4, title: "Lateral View Assessment", subtitle: "Side View & Plumb Line Analysis",
      topics: 12, duration: 35, level: "intermediate", category: "posture_assessment",
      icon: ArrowRight, color: "orange", ayush: "Integrative",
      description: "Lateral alignment using plumb line — forward head, kyphosis, lordosis, anterior/posterior pelvic tilt, and sway back from AYUSH lens.",
      keyTopics: ["Plumb Line Standard Alignment", "Forward Head Posture", "Thoracic Kyphosis", "Anterior vs Posterior Pelvic Tilt", "Sway Back Identification"],
      doshaRelevance: "Vata → forward head & kyphosis; Kapha → excessive lordosis & heaviness",
    },
    {
      id: 5, title: "Practical Assessment Skills", subtitle: "Hands-On Clinical Application",
      topics: 10, duration: 40, level: "intermediate", category: "posture_assessment",
      icon: Hand, color: "teal", ayush: "Integrative",
      description: "Setting up patient, plumb line use, marking landmarks, photography guidelines, documentation, palpation tips, and common mistakes.",
      keyTopics: ["Patient Setup & Positioning", "Photography Guidelines", "Palpation Techniques", "Documentation Format", "Common Mistakes to Avoid"],
      doshaRelevance: "Marma points overlap with anatomical landmarks used in posture assessment",
    },
    {
      id: 6, title: "Functional Assessment", subtitle: "Movement Quality & Compensation",
      topics: 7, duration: 30, level: "intermediate", category: "functional_assessment",
      icon: Zap, color: "indigo", ayush: "Yoga & Naturopathy",
      description: "Movement quality testing — Single Leg Stability, Scapular Dyskinesia, Thoracic Rotation, Dorsiflexion. Stability vs mobility from Yoga perspective.",
      keyTopics: ["Single Leg Pelvic Control", "Scapular Dyskinesia Test", "Seated Thoracic Rotation", "Weighted Lunge Dorsiflexion", "Contraindications"],
      doshaRelevance: "Yoga-based functional testing reveals Vata (instability) vs Kapha (rigidity) patterns",
    },
    {
      id: 7, title: "Corrective Exercise Introduction", subtitle: "4-Phase AYUSH Corrective Model",
      topics: 13, duration: 40, level: "beginner", category: "corrective_exercise",
      icon: Dumbbell, color: "red", ayush: "Integrative",
      description: "AYUSH-oriented corrective model: Mobility → Stability → Strength → Integration. Aligned with Panchakarma therapy stages & exercise prescription.",
      keyTopics: ["4 Phase Corrective Model", "Mobility First Principle", "Exercise Prescription Guidelines", "Panchakarma Stage Alignment", "Two Line Concept"],
      doshaRelevance: "Phase 1 (Mobility) = Shodhana; Phase 2 (Stability) = Shamana; Phase 3-4 = Rasayana",
    },
    {
      id: 8, title: "Upper Cross Syndrome (UCS)", subtitle: "Greeva-Amsa Vayu Vikara",
      topics: 5, duration: 45, level: "advanced", category: "syndrome_treatment",
      icon: AlertTriangle, color: "amber", ayush: "Ayurveda",
      description: "UCS — Vata-dominant cervicothoracic imbalance. Includes MMT, muscle length testing, and AYUSH treatment (Greeva Basti, Nasya, therapeutic Yoga).",
      keyTopics: ["Muscle Imbalance Pattern", "Manual Muscle Testing", "Muscle Length Testing", "Greeva Basti Protocol", "Corrective Yoga Asanas"],
      doshaRelevance: "Vata-predominant disorder; treat with Snehana (Greeva Basti) + Nasya + Basti",
    },
    {
      id: 9, title: "Lower Cross Syndrome (LCS)", subtitle: "Kati-Nitamba Vayu Vikara",
      topics: 5, duration: 45, level: "advanced", category: "syndrome_treatment",
      icon: AlertTriangle, color: "rose", ayush: "Ayurveda",
      description: "LCS — Vata-Kapha lumbopelvic imbalance. MMT protocols, length testing, Kati Basti, Basti Karma, and therapeutic Yoga sequences.",
      keyTopics: ["Lumbopelvic Imbalance", "Hip Flexor Tightness", "Glute Weakness Pattern", "Kati Basti Protocol", "Basti Karma Integration"],
      doshaRelevance: "Vata-Kapha involvement; Kati Basti + Tikta Ksheer Basti for Asthi-Majja Dhatu",
    },
    {
      id: 10, title: "Layered Syndrome (Double Cross)", subtitle: "Sarva-Shareera Vayu Vikara",
      topics: 5, duration: 50, level: "advanced", category: "syndrome_treatment",
      icon: Layers, color: "violet", ayush: "Integrative",
      description: "Combined UCS + LCS — whole-body Vata derangement. Comprehensive Panchakarma, Yoga sequences, and graduated corrective protocols.",
      keyTopics: ["Combined Pattern Recognition", "Full Body MMT", "Panchakarma Sequence", "Progressive Yoga Protocol", "Graduated Exercise Plan"],
      doshaRelevance: "Tridosha involvement with Vata predominance; requires Sarvanga treatment approach",
    },
    {
      id: 11, title: "Pronation Distortion Syndrome", subtitle: "Pada-Jangha Vayu Vikara",
      topics: 5, duration: 40, level: "advanced", category: "syndrome_treatment",
      icon: Footprints, color: "cyan", ayush: "Ayurveda",
      description: "Lower extremity chain dysfunction — excessive pronation causing knee, hip & spine compensation. Marma therapy, Agnikarma, corrective Yoga.",
      keyTopics: ["Foot Pronation Assessment", "Kinetic Chain Effects", "Marma Point Therapy", "Agnikarma Application", "Pada Abhyanga & Yoga"],
      doshaRelevance: "Kapha accumulation in lower limbs; treat with Agnikarma + Ruksha Sweda + Yoga",
    },
    {
      id: 12, title: "Flat Back Posture", subtitle: "Kati-Sthairya Vikara",
      topics: 5, duration: 40, level: "advanced", category: "syndrome_treatment",
      icon: MinusCircle, color: "slate", ayush: "Integrative",
      description: "Loss of lumbar lordosis — Kapha-dominant postural pattern. Assessment, imbalance mapping, Kati Basti variations, Yoga backbends, Naturopathy.",
      keyTopics: ["Decreased Lordosis Pattern", "Posterior Pelvic Tilt", "Hamstring Dominance", "Kati Basti Variations", "Extension-Based Yoga"],
      doshaRelevance: "Kapha-dominant rigidity pattern; stimulate Agni with Ushna therapies + backbends",
    },
    {
      id: 13, title: "Sway Back Posture", subtitle: "Kati-Chalana Vikara",
      topics: 5, duration: 40, level: "advanced", category: "syndrome_treatment",
      icon: TrendingDown, color: "emerald", ayush: "Integrative",
      description: "Posterior pelvic displacement — Vata-dominant deviation. Assessment, muscle mapping, corrective protocol with Yoga, Panchakarma & exercises.",
      keyTopics: ["Posterior Pelvis Displacement", "Hip Extension Pattern", "Upper Trunk Compensation", "Stabilization Exercises", "Vata-Pacifying Protocol"],
      doshaRelevance: "Vata-dominant instability; ground with Basti + stability Yoga + Abhyanga",
    },
  ];

  const categories = [
    { value: "all", label: "All Modules" },
    { value: "posture_theory", label: "Posture Theory" },
    { value: "posture_assessment", label: "Posture Assessment" },
    { value: "functional_assessment", label: "Functional Assessment" },
    { value: "corrective_exercise", label: "Corrective Exercise" },
    { value: "syndrome_treatment", label: "Syndrome Treatment" },
  ];

  const levels = [
    { value: "all", label: "All Levels" },
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
  ];

  const filtered = modules.filter((m) => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === "all" || m.category === filterCategory;
    const matchLevel = filterLevel === "all" || m.level === filterLevel;
    return matchSearch && matchCat && matchLevel;
  });

  const totalTopics = modules.reduce((s, m) => s + m.topics, 0);

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "beginner": return <Badge className="bg-green-100 text-green-700 text-[10px]">Beginner</Badge>;
      case "intermediate": return <Badge className="bg-blue-100 text-blue-700 text-[10px]">Intermediate</Badge>;
      case "advanced": return <Badge className="bg-red-100 text-red-700 text-[10px]">Advanced</Badge>;
      default: return null;
    }
  };

  const getCategoryLabel = (cat: string) => {
    return categories.find(c => c.value === cat)?.label || cat;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6 text-blue-600" />
            Spine AYUSH — Learning Modules
          </h1>
          <p className="text-muted-foreground mt-1">
            13 Modules · {totalTopics} Topics · Posture Assessment & Corrective Exercise · AYUSH-Oriented
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600 border-green-300">
            <Leaf className="h-3 w-3 mr-1" /> AYUSH Integrated
          </Badge>
          <Badge variant="outline" className="text-purple-600 border-purple-300">
            <GraduationCap className="h-3 w-3 mr-1" /> CME Ready
          </Badge>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card><CardContent className="p-3 text-center">
          <BookOpen className="h-5 w-5 mx-auto text-blue-600" />
          <p className="text-xl font-bold mt-1">13</p>
          <p className="text-xs text-muted-foreground">Modules</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <CheckCircle2 className="h-5 w-5 mx-auto text-green-600" />
          <p className="text-xl font-bold mt-1">{totalTopics}</p>
          <p className="text-xs text-muted-foreground">Total Topics</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <Clock className="h-5 w-5 mx-auto text-orange-600" />
          <p className="text-xl font-bold mt-1">{Math.round(modules.reduce((s, m) => s + m.duration, 0) / 60)}h</p>
          <p className="text-xs text-muted-foreground">Total Duration</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <Stethoscope className="h-5 w-5 mx-auto text-purple-600" />
          <p className="text-xl font-bold mt-1">6</p>
          <p className="text-xs text-muted-foreground">Syndromes Covered</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <Users className="h-5 w-5 mx-auto text-indigo-600" />
          <p className="text-xl font-bold mt-1">Both</p>
          <p className="text-xs text-muted-foreground">Doctor & Patient</p>
        </CardContent></Card>
      </div>

      {/* Learning Path Overview */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Brain className="h-4 w-4 text-blue-600" /> AYUSH Learning Path — Spine Health
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
            <div className="flex items-center gap-2 p-2 bg-white rounded border">
              <span className="font-bold text-blue-600">1</span>
              <span>Theory & Basics (M1)</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white rounded border">
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
              <span className="font-bold text-green-600">2</span>
              <span>Assessment (M2-M6)</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white rounded border">
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
              <span className="font-bold text-red-600">3</span>
              <span>Corrective Intro (M7)</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white rounded border">
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
              <span className="font-bold text-amber-600">4</span>
              <span>Syndrome Protocols (M8-M13)</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white rounded border">
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
              <span className="font-bold text-purple-600">5</span>
              <span>Clinical Application</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search modules, topics, syndromes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs value={filterCategory} onValueChange={setFilterCategory}>
          <TabsList className="h-9">
            {categories.map(c => (
              <TabsTrigger key={c.value} value={c.value} className="text-xs px-2">
                {c.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Tabs value={filterLevel} onValueChange={setFilterLevel}>
          <TabsList className="h-9">
            {levels.map(l => (
              <TabsTrigger key={l.value} value={l.value} className="text-xs px-2">
                {l.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((mod) => {
          const Icon = mod.icon;
          return (
            <Card
              key={mod.id}
              className="hover:shadow-md transition-shadow cursor-pointer group border-l-4"
              style={{ borderLeftColor: `var(--${mod.color}-500, #3b82f6)` }}
              onClick={() => navigate(`/hms/spine-modules/${mod.id}`)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`grid h-9 w-9 place-items-center rounded-lg bg-${mod.color}-100`}>
                      <Icon className={`h-5 w-5 text-${mod.color}-600`} />
                    </div>
                    <div>
                      <CardTitle className="text-sm leading-tight group-hover:text-blue-600 transition-colors">
                        {mod.title}
                      </CardTitle>
                      <p className="text-[10px] text-muted-foreground italic">{mod.subtitle}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    M{mod.id}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground line-clamp-2">{mod.description}</p>

                <div className="flex flex-wrap gap-1">
                  {mod.keyTopics.slice(0, 3).map((t) => (
                    <Badge key={t} variant="outline" className="text-[9px] px-1.5 py-0">
                      {t}
                    </Badge>
                  ))}
                  {mod.keyTopics.length > 3 && (
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-muted-foreground">
                      +{mod.keyTopics.length - 3} more
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" /> {mod.topics} topics
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {mod.duration} min
                  </span>
                  {getLevelBadge(mod.level)}
                </div>

                <div className="text-[10px] text-muted-foreground bg-amber-50 p-1.5 rounded border border-amber-100">
                  <span className="font-medium text-amber-700">Dosha:</span> {mod.doshaRelevance}
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-[9px]">
                    <Leaf className="h-2.5 w-2.5 mr-0.5" /> {mod.ayush}
                  </Badge>
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 text-blue-600">
                    <Play className="h-3 w-3" /> Start Module
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No modules found matching your filters.</p>
        </div>
      )}

      {/* Doctor Quick Reference */}
      <Card className="border-purple-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-purple-600" />
            Doctor Quick Reference — Prescribe Modules to Patients
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-2">
              <p className="font-medium text-purple-700">Common Prescriptions:</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2 p-2 bg-purple-50 rounded">
                  <CheckCircle2 className="h-3 w-3 text-purple-600" />
                  <span><strong>Cervical Pain:</strong> M1 → M2 → M4 → M8 (UCS)</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-purple-50 rounded">
                  <CheckCircle2 className="h-3 w-3 text-purple-600" />
                  <span><strong>Low Back Pain:</strong> M1 → M2 → M4 → M9 (LCS)</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-purple-50 rounded">
                  <CheckCircle2 className="h-3 w-3 text-purple-600" />
                  <span><strong>Sciatica:</strong> M1 → M4 → M6 → M9 → M7</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-purple-50 rounded">
                  <CheckCircle2 className="h-3 w-3 text-purple-600" />
                  <span><strong>Knee Pain (Postural):</strong> M1 → M3 → M11 (PDS)</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-purple-700">Patient Self-Guided Paths:</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                  <Heart className="h-3 w-3 text-green-600" />
                  <span><strong>Prevention:</strong> M1 → M5 → M6 → M7</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                  <Heart className="h-3 w-3 text-green-600" />
                  <span><strong>Desk Workers:</strong> M1 → M4 → M8 → M7</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                  <Heart className="h-3 w-3 text-green-600" />
                  <span><strong>Post-Treatment:</strong> M6 → M7 → Syndrome Module</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                  <Heart className="h-3 w-3 text-green-600" />
                  <span><strong>Full Course:</strong> M1 → M13 (Sequential)</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
