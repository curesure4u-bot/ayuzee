import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Wind, Heart, Maximize, Footprints, Sparkles, CalendarClock,
  BookHeart, Users, Brain, Activity, Play, ChevronRight,
  Timer, Target, TrendingUp, Award, Flame, Star,
} from "lucide-react";

// ─── 10 Dispenza Meditation Tools ───
const meditationTools = [
  {
    id: 1, slug: "breathwork",
    title: "Breath Work (Spinal Energy)",
    subtitle: "Pulling the Mind Out of Body",
    description: "Rhythmic breathing that pulls energy up your spine, activates cerebrospinal fluid flow, and stimulates the pineal gland. Directly heals spinal structures.",
    icon: Wind, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200",
    duration: "25 min", difficulty: "Intermediate", bestTime: "Morning",
    spineTarget: "Full Spine (Sacrum → Brain)",
    keyBenefit: "Moves CSF along vertebral column — nourishes discs",
  },
  {
    id: 2, slug: "body-blessing",
    title: "Body Part Blessing",
    subtitle: "Healing Attention on Spinal Segments",
    description: "Place focused loving attention on each vertebral level. Where attention goes, energy flows. Activates the autonomic repair response for each spinal segment.",
    icon: Heart, color: "text-pink-600", bgColor: "bg-pink-50", borderColor: "border-pink-200",
    duration: "30 min", difficulty: "Beginner", bestTime: "AM & PM",
    spineTarget: "Cervical → Thoracic → Lumbar → Sacral",
    keyBenefit: "Increases blood flow to specific spinal segments",
  },
  {
    id: 3, slug: "open-focus",
    title: "Space-Time (Open Focus)",
    subtitle: "Dissolving Pain Through Expanded Awareness",
    description: "Shift awareness from pain to space. Brain waves move from high-beta (pain) to alpha/theta (healing). Breaks chronic pain cycles instantly.",
    icon: Maximize, color: "text-indigo-600", bgColor: "bg-indigo-50", borderColor: "border-indigo-200",
    duration: "20 min", difficulty: "Beginner", bestTime: "Anytime",
    spineTarget: "Cervical, Thoracic, Lumbar",
    keyBenefit: "Reduces pain perception by 40-60% via brainwave shift",
  },
  {
    id: 4, slug: "walking",
    title: "Walking Meditation",
    subtitle: "Posture Rehearsal & Mindful Movement",
    description: "Mentally rehearse perfect spinal alignment, then walk slowly with full awareness. Creates new neural pathways for correct posture permanently.",
    icon: Footprints, color: "text-green-600", bgColor: "bg-green-50", borderColor: "border-green-200",
    duration: "20 min", difficulty: "Beginner", bestTime: "Morning",
    spineTarget: "Lumbar, Thoracic, Cervical",
    keyBenefit: "Rewires motor cortex for correct posture during gait",
  },
  {
    id: 5, slug: "pineal",
    title: "Pineal Gland Activation",
    subtitle: "Kaleidoscope & Inner Vision",
    description: "Advanced technique to push energy to the pineal gland, releasing anti-inflammatory neurochemicals that promote deep spinal healing and tissue regeneration.",
    icon: Sparkles, color: "text-purple-600", bgColor: "bg-purple-50", borderColor: "border-purple-200",
    duration: "35 min", difficulty: "Advanced", bestTime: "Evening",
    spineTarget: "Cervical, Cranio-cervical Junction",
    keyBenefit: "Releases natural anti-inflammatory neurochemicals",
  },
  {
    id: 6, slug: "scheduler",
    title: "Meditation Scheduler",
    subtitle: "Morning & Evening Protocol Planning",
    description: "Structured AM/PM meditation schedules that adapt weekly based on your spinal condition, recovery stage, and progress level. 8-week progressive protocol.",
    icon: CalendarClock, color: "text-orange-600", bgColor: "bg-orange-50", borderColor: "border-orange-200",
    duration: "5 min setup", difficulty: "Beginner", bestTime: "Both",
    spineTarget: "Full Spine",
    keyBenefit: "80% compliance = measurable spine recovery in 8 weeks",
  },
  {
    id: 7, slug: "journal",
    title: "Elevated Emotion Journal",
    subtitle: "Gratitude, Love & Joy for Healing",
    description: "Daily journaling of elevated emotions (gratitude, love, joy) that create heart coherence signals. These signals activate genes for healing and tissue repair.",
    icon: BookHeart, color: "text-rose-600", bgColor: "bg-rose-50", borderColor: "border-rose-200",
    duration: "10 min", difficulty: "Beginner", bestTime: "AM & PM",
    spineTarget: "Full Spine",
    keyBenefit: "23% faster recovery when journaling daily",
  },
  {
    id: 8, slug: "coherence",
    title: "Coherence Healing (Group)",
    subtitle: "Collective Intention for Amplified Healing",
    description: "Group meditation where participants direct healing intention toward each person's spine. The coherent field amplifies individual healing exponentially.",
    icon: Users, color: "text-amber-600", bgColor: "bg-amber-50", borderColor: "border-amber-200",
    duration: "45 min", difficulty: "Intermediate", bestTime: "Evening",
    spineTarget: "Full Spine",
    keyBenefit: "Group field amplifies individual healing potential",
  },
  {
    id: 9, slug: "rehearsal",
    title: "Mental Rehearsal (Future Self)",
    subtitle: "Visualize Your Healed Spine & New Life",
    description: "Neuroplasticity tool: vividly imagine being your healed future self — moving freely, standing tall, pain-free. Installs new neural hardware before body changes.",
    icon: Brain, color: "text-violet-600", bgColor: "bg-violet-50", borderColor: "border-violet-200",
    duration: "25 min", difficulty: "Intermediate", bestTime: "Morning",
    spineTarget: "Full Spine",
    keyBenefit: "Motor cortex activation identical to physical practice",
  },
  {
    id: 10, slug: "score",
    title: "Brain-Heart Coherence Score",
    subtitle: "Track Your Healing Progress & Correlation",
    description: "Composite score (0-100) measuring meditation consistency, emotional elevation, pain reduction, and spine recovery correlation. Proves meditation is working.",
    icon: Activity, color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-200",
    duration: "5 min", difficulty: "Beginner", bestTime: "Anytime",
    spineTarget: "Full Spine",
    keyBenefit: "Data-driven proof linking meditation to spine healing",
  },
];

// ─── Quick Start 8-Week Protocol ───
const weeklyProtocol = [
  { week: "1-2", morning: "Open Focus (15 min)", evening: "Body Blessing (20 min)", goal: "Establish daily habit" },
  { week: "3-4", morning: "Breathwork (20 min)", evening: "Body Blessing (25 min)", goal: "Activate spinal energy" },
  { week: "5-6", morning: "Breathwork + Rehearsal (30 min)", evening: "Open Focus + Journal (25 min)", goal: "Neuroplasticity" },
  { week: "7-8", morning: "Pineal Activation (35 min)", evening: "Body Blessing + Walking (30 min)", goal: "Deep healing chemistry" },
];

export default function SpineDispenzaDashboard() {
  const navigate = useNavigate();
  const [coherenceScore] = useState(42); // Would come from Supabase in real usage
  const [streak] = useState(7);
  const [totalSessions] = useState(23);

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            🧠 Dr. Joe Dispenza — Meditative Tools
          </h1>
          <p className="text-gray-600 mt-1">
            Mind-body healing for spinal recovery through neuroplasticity, breath, and elevated emotions
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <Sparkles className="w-3 h-3 mr-1" /> 10 Tools
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Target className="w-3 h-3 mr-1" /> Spine-Integrated
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-4 text-center">
            <Flame className="w-6 h-6 text-orange-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-blue-900">{streak}</p>
            <p className="text-xs text-blue-600">Day Streak</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-4 text-center">
            <Timer className="w-6 h-6 text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-green-900">{totalSessions}</p>
            <p className="text-xs text-green-600">Total Sessions</p>
          </CardContent>
        </Card>
        <Card className="border-purple-200 bg-purple-50/50">
          <CardContent className="p-4 text-center">
            <Activity className="w-6 h-6 text-purple-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-purple-900">{coherenceScore}/100</p>
            <p className="text-xs text-purple-600">Coherence Score</p>
          </CardContent>
        </Card>
        <Card className="border-rose-200 bg-rose-50/50">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 text-rose-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-rose-900">-38%</p>
            <p className="text-xs text-rose-600">Pain Reduction</p>
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            How Dispenza Meditation Heals Your Spine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-3 bg-white/70 rounded-lg">
              <div className="text-2xl mb-1">🫁</div>
              <p className="font-semibold">1. Breathe</p>
              <p className="text-gray-600 text-xs">Move energy up spine via breath. CSF nourishes discs.</p>
            </div>
            <div className="text-center p-3 bg-white/70 rounded-lg">
              <div className="text-2xl mb-1">🧠</div>
              <p className="font-semibold">2. Rewire</p>
              <p className="text-gray-600 text-xs">Mental rehearsal creates new neural pathways for posture.</p>
            </div>
            <div className="text-center p-3 bg-white/70 rounded-lg">
              <div className="text-2xl mb-1">💜</div>
              <p className="font-semibold">3. Feel</p>
              <p className="text-gray-600 text-xs">Elevated emotions signal genes for tissue repair.</p>
            </div>
            <div className="text-center p-3 bg-white/70 rounded-lg">
              <div className="text-2xl mb-1">✨</div>
              <p className="font-semibold">4. Heal</p>
              <p className="text-gray-600 text-xs">Neurochemicals reduce inflammation & regenerate tissue.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 10 Meditation Tools Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500" />
          All 10 Meditation Tools
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {meditationTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card
                key={tool.id}
                className={`cursor-pointer hover:shadow-lg transition-all duration-200 ${tool.borderColor} hover:scale-[1.02]`}
                onClick={() => navigate(`/hms/spine-dispenza-${tool.slug}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${tool.bgColor}`}>
                      <Icon className={`w-6 h-6 ${tool.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{tool.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{tool.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-3 line-clamp-2">{tool.description}</p>
                  <div className="flex flex-wrap gap-1 mt-3">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      <Timer className="w-2.5 h-2.5 mr-0.5" /> {tool.duration}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {tool.difficulty}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {tool.bestTime}
                    </Badge>
                  </div>
                  <div className="mt-3 pt-2 border-t border-gray-100">
                    <p className="text-[11px] text-gray-500">
                      <span className="font-medium">Spine Target:</span> {tool.spineTarget}
                    </p>
                    <p className="text-[11px] text-green-700 mt-1 font-medium">
                      ✓ {tool.keyBenefit}
                    </p>
                  </div>
                  <Button
                    size="sm" variant="ghost"
                    className="w-full mt-3 text-xs"
                    onClick={(e) => { e.stopPropagation(); navigate(`/hms/spine-dispenza-${tool.slug}`); }}
                  >
                    <Play className="w-3 h-3 mr-1" /> Start Practice
                    <ChevronRight className="w-3 h-3 ml-auto" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* 8-Week Protocol */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-orange-500" />
            8-Week Progressive Protocol (Recommended)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {weeklyProtocol.map((w, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 border">
                <Badge className="bg-purple-100 text-purple-700 border-purple-200 shrink-0">
                  Week {w.week}
                </Badge>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="text-amber-600 font-medium">AM:</span> {w.morning}
                  </div>
                  <div>
                    <span className="text-indigo-600 font-medium">PM:</span> {w.evening}
                  </div>
                  <div>
                    <span className="text-green-600 font-medium">Goal:</span> {w.goal}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-4">
            After 8 weeks: Choose any 2 meditations daily based on what your body needs.
            Share progress with your doctor at follow-up visits.
          </p>
        </CardContent>
      </Card>

      {/* Doctor's Checklist */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="w-5 h-5 text-green-600" />
            Implementation Checklist (For Doctors & Staff)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {[
              "Assess patient's meditation readiness (anxiety level, willingness)",
              "Prescribe specific tools based on spinal condition (use Prescription feature)",
              "Start with beginner tools (Open Focus, Body Blessing, Journal)",
              "Schedule weekly group coherence sessions at the clinic",
              "Review coherence scores at each follow-up appointment",
              "Pair meditation prescription with corrective exercise plan",
              "Track pain correlation: meditation days vs non-meditation days",
              "Graduate patients from beginner → intermediate → advanced tools",
              "Use Walking Meditation alongside gait retraining protocols",
              "Celebrate milestones: 7-day streak, 30-day streak, score > 75",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded bg-green-50">
                <span className="text-green-600 font-bold shrink-0">☐</span>
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
