import { useState, useEffect } from "react";
import {
  Activity,
  Award,
  BookOpen,
  Clock,
  Coins,
  Compass,
  Heart,
  Plus,
  Save,
  Smile,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { earnXP, earnCoins, updateStreak, checkAndAwardBadges } from "@/services/beyondGamification";

type SpokeKey = "clinical" | "finance" | "time" | "leadership" | "relationships" | "family" | "wellness" | "joy";

interface SpokeConfig {
  key: SpokeKey;
  label: string;
  icon: typeof Target;
  color: string;
  description: string;
  lowScoreHint: string;
}

const SPOKES: SpokeConfig[] = [
  { key: "clinical", label: "Clinical Excellence", icon: Activity, color: "text-blue-500", description: "Skills, knowledge, patient outcomes", lowScoreHint: "Consider: CME courses, case studies, skill workshops" },
  { key: "finance", label: "Finance & Wealth", icon: Coins, color: "text-green-500", description: "Savings, investments, debt, tax planning", lowScoreHint: "Consider: Track expenses, start SIP, tax optimization" },
  { key: "time", label: "Time & Productivity", icon: Clock, color: "text-indigo-500", description: "Schedule control, deep work, efficiency", lowScoreHint: "Consider: Time blocking, Pomodoro technique, delegation" },
  { key: "leadership", label: "Leadership & Influence", icon: Compass, color: "text-amber-500", description: "Team leading, teaching, public speaking", lowScoreHint: "Consider: Leadership scenarios, communication practice" },
  { key: "relationships", label: "Relationships & Social", icon: Users, color: "text-pink-500", description: "Partner, friends, networking quality", lowScoreHint: "Consider: Schedule social time, join a community" },
  { key: "family", label: "Family & Presence", icon: Heart, color: "text-rose-500", description: "Time with kids/parents, being present", lowScoreHint: "Consider: Set boundaries, device-free family time" },
  { key: "wellness", label: "Health & Wellness", icon: Activity, color: "text-emerald-500", description: "Sleep, exercise, stress, burnout level", lowScoreHint: "Consider: Breathing exercises, sleep hygiene, micro-workouts" },
  { key: "joy", label: "Joy & Hobbies", icon: Smile, color: "text-orange-500", description: "Creative pursuits, travel, fun activities", lowScoreHint: "Consider: Pick up a hobby, schedule 'play time'" },
];

interface AssessmentHistory {
  id: string;
  clinical_score: number;
  finance_score: number;
  time_score: number;
  leadership_score: number;
  relationships_score: number;
  family_score: number;
  wellness_score: number;
  joy_score: number;
  total_score: number;
  notes: string | null;
  assessed_at: string;
}

const WheelOfLife = () => {
  const [scores, setScores] = useState<Record<SpokeKey, number>>({
    clinical: 5, finance: 5, time: 5, leadership: 5,
    relationships: 5, family: 5, wellness: 5, joy: 5,
  });
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<AssessmentHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return;

    const { data } = await (supabase as any)
      .from("beyond_wheel_assessments")
      .select("*")
      .eq("user_id", session.session.user.id)
      .order("assessed_at", { ascending: false })
      .limit(12);

    if (data) setHistory(data);
    setLoadingHistory(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      toast.error("Please sign in first");
      setSaving(false);
      return;
    }

    const { error } = await (supabase as any)
      .from("beyond_wheel_assessments")
      .insert({
        user_id: session.session.user.id,
        clinical_score: scores.clinical,
        finance_score: scores.finance,
        time_score: scores.time,
        leadership_score: scores.leadership,
        relationships_score: scores.relationships,
        family_score: scores.family,
        wellness_score: scores.wellness,
        joy_score: scores.joy,
        notes: notes || null,
      });

    if (error) {
      toast.error("Failed to save assessment");
      console.error(error);
    } else {
      // Gamification: earn XP, coins, update streak, check badges
      const userId = session.session.user.id;

      // Award XP
      const xpResult = await earnXP(userId, 100, "wheel_assessment", "Completed Wheel of Life assessment");

      // Award coins
      await earnCoins(userId, 25, "wheel_assessment", "Wheel of Life completion");

      // Update reflection streak
      await updateStreak(userId, "reflection");

      // Count total assessments for badge logic
      const { count } = await (supabase as any)
        .from("beyond_wheel_assessments")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId);

      // Check minimum spoke value for "Balanced Life" badge
      const minSpoke = Math.min(...Object.values(scores));

      // Check and award badges
      await checkAndAwardBadges(userId, {
        action: "wheel_assessment",
        wheelAssessmentCount: count || 1,
        allWheelAbove: minSpoke,
      });

      // Toast with XP info
      let toastMsg = "Wheel of Life assessment saved! +100 XP, +25 coins";
      if (xpResult.leveledUp) {
        toastMsg += ` 🎉 LEVEL UP → Level ${xpResult.newLevel} (${xpResult.newTitle})!`;
      }

      toast.success(toastMsg, {
        description: "Great self-awareness! Check back monthly to track your growth.",
      });

      setNotes("");
      loadHistory();
    }
    setSaving(false);
  };

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0) / 8;
  const weakSpokes = SPOKES.filter((s) => scores[s.key] <= 4);
  const strongSpokes = SPOKES.filter((s) => scores[s.key] >= 8);

  const radarData = SPOKES.map((spoke) => ({
    spoke: spoke.label.split(" ")[0],
    score: scores[spoke.key],
    fullMark: 10,
  }));

  // Previous assessment for comparison
  const previousAssessment = history.length > 0 ? history[0] : null;
  const previousRadarData = previousAssessment
    ? SPOKES.map((spoke) => ({
        spoke: spoke.label.split(" ")[0],
        score: (previousAssessment as any)[`${spoke.key}_score`] as number,
        fullMark: 10,
      }))
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl flex items-center gap-2">
            <Target className="h-7 w-7 text-violet-500" />
            Wheel of Life
          </h1>
          <p className="text-muted-foreground">Rate each area of your life (1-10) to see your balance</p>
        </div>
        <Badge variant="outline" className="w-fit gap-1">
          <Award className="h-3 w-3" /> +100 XP on completion
        </Badge>
      </div>

      <Tabs defaultValue="assess" className="space-y-6">
        <TabsList>
          <TabsTrigger value="assess">New Assessment</TabsTrigger>
          <TabsTrigger value="history">History ({history.length})</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* TAB: New Assessment */}
        <TabsContent value="assess" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
            {/* Scoring Sliders */}
            <Card>
              <CardHeader>
                <CardTitle>Rate Each Life Area</CardTitle>
                <CardDescription>
                  1 = Very unsatisfied · 5 = Neutral · 10 = Thriving
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {SPOKES.map((spoke) => (
                  <div key={spoke.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <spoke.icon className={`h-4 w-4 ${spoke.color}`} />
                        <span className="text-sm font-medium">{spoke.label}</span>
                      </div>
                      <span className="text-lg font-bold tabular-nums w-8 text-right">
                        {scores[spoke.key]}
                      </span>
                    </div>
                    <Slider
                      value={[scores[spoke.key]]}
                      onValueChange={([val]) => setScores((prev) => ({ ...prev, [spoke.key]: val }))}
                      min={1}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">{spoke.description}</p>
                  </div>
                ))}

                {/* Notes */}
                <div className="pt-2 space-y-2">
                  <label className="text-sm font-medium">Reflection Notes (optional)</label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="What's going well? What needs attention?"
                    rows={3}
                  />
                </div>

                {/* Save Button */}
                <Button onClick={handleSave} disabled={saving} className="w-full gap-2" size="lg">
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Assessment"}
                </Button>
              </CardContent>
            </Card>

            {/* Radar Chart */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-center">Your Wheel</CardTitle>
                  <div className="text-center">
                    <span className="text-3xl font-bold">{totalScore.toFixed(1)}</span>
                    <span className="text-muted-foreground text-sm">/10 average</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={320}>
                    <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                      <PolarGrid strokeDasharray="3 3" />
                      <PolarAngleAxis
                        dataKey="spoke"
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 10]}
                        tick={{ fontSize: 10 }}
                        tickCount={6}
                      />
                      <Radar
                        name="Current"
                        dataKey="score"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Quick Insights */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Quick Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {weakSpokes.length > 0 && (
                    <div className="rounded-lg bg-orange-50 dark:bg-orange-950/30 p-3">
                      <p className="text-xs font-medium text-orange-700 dark:text-orange-400">Needs Attention</p>
                      {weakSpokes.map((s) => (
                        <p key={s.key} className="text-xs text-orange-600 dark:text-orange-300 mt-1">
                          • {s.label} ({scores[s.key]}/10) — {s.lowScoreHint}
                        </p>
                      ))}
                    </div>
                  )}
                  {strongSpokes.length > 0 && (
                    <div className="rounded-lg bg-green-50 dark:bg-green-950/30 p-3">
                      <p className="text-xs font-medium text-green-700 dark:text-green-400">Strengths</p>
                      {strongSpokes.map((s) => (
                        <p key={s.key} className="text-xs text-green-600 dark:text-green-300 mt-1">
                          • {s.label} ({scores[s.key]}/10) — Keep it up!
                        </p>
                      ))}
                    </div>
                  )}
                  {weakSpokes.length === 0 && strongSpokes.length === 0 && (
                    <p className="text-xs text-muted-foreground">Adjust the sliders to see personalized insights.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB: History */}
        <TabsContent value="history" className="space-y-4">
          {loadingHistory ? (
            <p className="text-muted-foreground text-center py-8">Loading history...</p>
          ) : history.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">No assessments yet</p>
                <p className="text-sm text-muted-foreground">Complete your first assessment to start tracking</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {history.map((entry) => {
                const entryData = SPOKES.map((s) => ({
                  spoke: s.label.split(" ")[0],
                  score: (entry as any)[`${s.key}_score`] as number,
                  fullMark: 10,
                }));
                return (
                  <Card key={entry.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">
                          {new Date(entry.assessed_at).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </CardTitle>
                        <Badge variant="secondary">{Number(entry.total_score).toFixed(1)}/10</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <RadarChart data={entryData} cx="50%" cy="50%" outerRadius="70%">
                          <PolarGrid strokeDasharray="3 3" />
                          <PolarAngleAxis dataKey="spoke" tick={{ fontSize: 9 }} />
                          <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
                          <Radar
                            dataKey="score"
                            stroke="hsl(var(--primary))"
                            fill="hsl(var(--primary))"
                            fillOpacity={0.2}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                      {entry.notes && (
                        <p className="mt-2 text-xs text-muted-foreground italic">"{entry.notes}"</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* TAB: Insights */}
        <TabsContent value="insights" className="space-y-4">
          {history.length < 2 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <TrendingUp className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">Need at least 2 assessments</p>
                <p className="text-sm text-muted-foreground">Complete monthly assessments to see trends</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Trend Analysis
                  </CardTitle>
                  <CardDescription>Comparing your latest vs previous assessment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {SPOKES.map((spoke) => {
                      const current = (history[0] as any)[`${spoke.key}_score`] as number;
                      const previous = (history[1] as any)[`${spoke.key}_score`] as number;
                      const diff = current - previous;
                      return (
                        <div key={spoke.key} className="flex items-center justify-between rounded-lg border p-3">
                          <div className="flex items-center gap-2">
                            <spoke.icon className={`h-4 w-4 ${spoke.color}`} />
                            <span className="text-sm">{spoke.label.split(" ")[0]}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{current}/10</span>
                            {diff !== 0 && (
                              <Badge variant={diff > 0 ? "default" : "destructive"} className="text-xs">
                                {diff > 0 ? `+${diff}` : diff}
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations based on trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-violet-500" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {SPOKES.filter((s) => (history[0] as any)[`${s.key}_score`] <= 5).map((spoke) => (
                    <div key={spoke.key} className="rounded-lg bg-muted/60 p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <spoke.icon className={`h-4 w-4 ${spoke.color}`} />
                        <span className="text-sm font-medium">{spoke.label}</span>
                        <Badge variant="outline" className="text-xs ml-auto">Score: {(history[0] as any)[`${spoke.key}_score`]}/10</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{spoke.lowScoreHint}</p>
                    </div>
                  ))}
                  {SPOKES.filter((s) => (history[0] as any)[`${s.key}_score`] <= 5).length === 0 && (
                    <p className="text-sm text-muted-foreground">All areas are looking good! Keep maintaining balance.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WheelOfLife;
