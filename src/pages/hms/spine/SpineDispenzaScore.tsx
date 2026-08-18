import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Activity, ArrowLeft, TrendingUp, Target, Flame, Brain,
  Heart, Timer, Award, ChevronRight, BarChart3, Star,
} from "lucide-react";
import { PremiumLockOverlay } from "@/components/dispenza/PremiumLockOverlay";
import { useDispenzaAccess } from "@/hooks/useDispenzaAccess";

const scoreFactors = [
  { name: "Consistency (Streak)", weight: "25%", current: 70, description: "How many consecutive days you've meditated. 7-day = 70%, 30-day = 100%", icon: Flame, color: "orange" },
  { name: "Session Depth", weight: "25%", current: 55, description: "Your average depth rating across sessions. Rating 7+ out of 10 = excellent.", icon: Brain, color: "purple" },
  { name: "Pain Reduction", weight: "25%", current: 38, description: "Pain-before vs pain-after scores improving week over week.", icon: Heart, color: "rose" },
  { name: "Spine Recovery Correlation", weight: "25%", current: 45, description: "How closely your meditation practice correlates with physical recovery metrics.", icon: Activity, color: "emerald" },
];

const milestones = [
  { score: 25, label: "First Steps", badge: "🌱", description: "You've started a practice. Keep going!", achieved: true },
  { score: 50, label: "Building Momentum", badge: "🔥", description: "Your body is starting to respond. Neuroplasticity is happening.", achieved: false },
  { score: 75, label: "Healer in Training", badge: "⚡", description: "Clear pain reduction & posture improvement. Doctor sees changes.", achieved: false },
  { score: 100, label: "Mastery", badge: "🏆", description: "Full coherence. Meditation clearly correlates with spine healing.", achieved: false },
];

const weeklyData = [
  { week: "Week 1", score: 12, sessions: 4, painDelta: -5 },
  { week: "Week 2", score: 22, sessions: 6, painDelta: -12 },
  { week: "Week 3", score: 35, sessions: 7, painDelta: -18 },
  { week: "Week 4", score: 42, sessions: 6, painDelta: -25 },
  { week: "Week 5", score: 52, sessions: 7, painDelta: -32 },
];

export default function SpineDispenzaScore() {
  const navigate = useNavigate();
  const [coherenceScore] = useState(42);
  const [trend] = useState("improving");

  // Check real premium access from Supabase
  const { hasPremiumAccess } = useDispenzaAccess();

  const getScoreColor = (score: number) => {
    if (score <= 25) return { bg: "bg-red-100", text: "text-red-700", border: "border-red-300", label: "Beginning" };
    if (score <= 50) return { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-300", label: "Building" };
    if (score <= 75) return { bg: "bg-green-100", text: "text-green-700", border: "border-green-300", label: "Established" };
    return { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-300", label: "Mastery" };
  };

  const scoreStyle = getScoreColor(coherenceScore);

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Premium Lock */}
      {!hasPremiumAccess && <PremiumLockOverlay type="premium" toolName="Brain-Heart Coherence Score" />}

      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/hms/spine-dispenza")}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-600" />
            Brain-Heart Coherence Score
          </h1>
          <p className="text-sm text-gray-600">Track Your Healing Progress & Correlation</p>
        </div>
        <Badge className="bg-emerald-100 text-emerald-700">Updated Daily</Badge>
      </div>

      {/* Big Score Display */}
      <Card className={`${scoreStyle.border} ${scoreStyle.bg}`}>
        <CardContent className="p-6 text-center">
          <p className="text-6xl font-bold mb-2">{coherenceScore}</p>
          <p className="text-sm font-medium text-gray-600">out of 100</p>
          <Badge className={`mt-2 ${scoreStyle.bg} ${scoreStyle.text} ${scoreStyle.border}`}>
            {scoreStyle.label}
          </Badge>
          <div className="flex items-center justify-center gap-2 mt-3">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-600 font-medium">Trend: {trend}</span>
          </div>
          <Progress value={coherenceScore} className="mt-4 h-3" />
        </CardContent>
      </Card>

      {/* 4 Score Factors */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Score Breakdown (4 Factors)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {scoreFactors.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 text-${f.color}-500`} />
                    <span className="text-sm font-medium">{f.name}</span>
                    <Badge variant="outline" className="text-[10px]">{f.weight}</Badge>
                  </div>
                  <span className="text-sm font-bold">{f.current}%</span>
                </div>
                <Progress value={f.current} className="h-2" />
                <p className="text-xs text-gray-500">{f.description}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Weekly Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            Weekly Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {weeklyData.map((w, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2 rounded bg-gray-50 border">
                <span className="text-xs font-medium w-16">{w.week}</span>
                <div className="flex-1">
                  <Progress value={w.score} className="h-2" />
                </div>
                <Badge variant="outline" className="text-[10px]">Score: {w.score}</Badge>
                <Badge variant="outline" className="text-[10px] text-green-600">{w.painDelta}% pain</Badge>
                <Badge variant="outline" className="text-[10px]">{w.sessions} sessions</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Milestones */}
      <Card className="border-amber-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Milestones & Badges
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {milestones.map((m, idx) => (
            <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg border ${
              m.achieved ? "border-green-200 bg-green-50" : "border-gray-200"
            }`}>
              <span className="text-2xl">{m.badge}</span>
              <div className="flex-1">
                <p className={`text-sm font-semibold ${m.achieved ? "text-green-700" : "text-gray-700"}`}>
                  Score {m.score}: {m.label}
                </p>
                <p className="text-xs text-gray-500">{m.description}</p>
              </div>
              {m.achieved && <Badge className="bg-green-100 text-green-700 text-[10px]">Achieved!</Badge>}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* How to Improve */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-500" />
            How to Improve Your Score
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-gray-700 space-y-1">
          <p>• <strong>Meditate EVERY day</strong> — even 10 minutes. Consistency &gt; duration.</p>
          <p>• <strong>Log sessions honestly</strong> — depth, pain levels, emotions. Data drives your score.</p>
          <p>• <strong>Combine meditation with corrective exercises</strong> for fastest spine recovery correlation.</p>
          <p>• <strong>Share your score with your doctor</strong> — they can adjust treatment based on your meditation progress.</p>
          <p>• <strong>Join group sessions</strong> — coherence healing sessions boost individual scores.</p>
        </CardContent>
      </Card>
    </div>
  );
}
