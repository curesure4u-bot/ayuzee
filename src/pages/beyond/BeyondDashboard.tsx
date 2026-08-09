import { Link } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  Compass,
  Flame,
  Heart,
  Lightbulb,
  RefreshCw,
  Rocket,
  Smile,
  Sparkles,
  Target,
  Timer,
  TrendingDown,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useBeyondDashboardData } from "@/hooks/useBeyondDashboardData";
import type { SpokeKey } from "@/services/beyondCrossModule";
import type { BriefingPriority } from "@/services/beyondDailyBriefing";
import type { Recommendation } from "@/services/beyondRecommendations";

// ════════════════════════════════════════════════════════════
// CONSTANTS & HELPERS
// ════════════════════════════════════════════════════════════

const SPOKE_ICONS: Record<SpokeKey, typeof Target> = {
  clinical: Activity,
  finance: Coins,
  time: Clock,
  leadership: Compass,
  relationships: Users,
  family: Heart,
  wellness: Sparkles,
  joy: Smile,
};

const SPOKE_COLORS: Record<SpokeKey, string> = {
  clinical: "text-blue-500",
  finance: "text-green-500",
  time: "text-indigo-500",
  leadership: "text-amber-500",
  relationships: "text-pink-500",
  family: "text-rose-500",
  wellness: "text-emerald-500",
  joy: "text-orange-500",
};

const SPOKE_BG: Record<SpokeKey, string> = {
  clinical: "bg-blue-100 dark:bg-blue-900/40",
  finance: "bg-green-100 dark:bg-green-900/40",
  time: "bg-indigo-100 dark:bg-indigo-900/40",
  leadership: "bg-amber-100 dark:bg-amber-900/40",
  relationships: "bg-pink-100 dark:bg-pink-900/40",
  family: "bg-rose-100 dark:bg-rose-900/40",
  wellness: "bg-emerald-100 dark:bg-emerald-900/40",
  joy: "bg-orange-100 dark:bg-orange-900/40",
};

const quickTools = [
  { to: "/beyond/wheel-of-life", label: "Wheel of Life", icon: Target, color: "bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400", desc: "Assess balance" },
  { to: "/beyond/time-management", label: "Time Planner", icon: Timer, color: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400", desc: "Focus sessions" },
  { to: "/beyond/leadership", label: "Leadership Lab", icon: Compass, color: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400", desc: "Scenarios" },
  { to: "/beyond/books", label: "Book Library", icon: BookOpen, color: "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400", desc: "Curated reads" },
  { to: "/beyond/wellness", label: "Wellness Hub", icon: Heart, color: "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400", desc: "Breathe & recover" },
  { to: "/beyond/pathways", label: "Guided Pathways", icon: Rocket, color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400", desc: "Structured growth" },
  { to: "/beyond/finance", label: "Finance Toolkit", icon: Coins, color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400", desc: "Track wealth" },
  { to: "/beyond/writing", label: "Writer's Studio", icon: Brain, color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/40 dark:text-cyan-400", desc: "Publish papers" },
];

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function getPriorityIcon(priority: BriefingPriority) {
  switch (priority.icon) {
    case "flame": return <Flame className="h-4 w-4 text-orange-500" />;
    case "target": return <Target className="h-4 w-4 text-violet-500" />;
    case "alert-triangle": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case "compass": return <Compass className="h-4 w-4 text-blue-500" />;
    default: return <Lightbulb className="h-4 w-4 text-amber-500" />;
  }
}

function getUrgencyColor(urgency: string) {
  switch (urgency) {
    case "high": return "border-red-200 bg-red-50/50 dark:border-red-900/40 dark:bg-red-950/20";
    case "medium": return "border-amber-200 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20";
    default: return "border-border bg-background";
  }
}

// ════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════

const BeyondDashboard = () => {
  const {
    snapshot,
    briefing,
    recommendations,
    gamification,
    recentActivity,
    activeGoals,
    activeChallenges,
    loading,
    refresh,
  } = useBeyondDashboardData();

  // XP progress calculation
  const levelThresholds = [0, 500, 1500, 3500, 7000, 12000, 20000, 35000, 55000, 80000];
  const currentLevelIdx = gamification.currentLevel - 1;
  const currentThreshold = levelThresholds[currentLevelIdx] || 0;
  const nextThreshold = levelThresholds[currentLevelIdx + 1] || 80000;
  const xpInLevel = gamification.totalXp - currentThreshold;
  const xpNeeded = nextThreshold - currentThreshold;
  const progressPct = Math.min(Math.round((xpInLevel / xpNeeded) * 100), 100);

  // Wheel radar data from snapshot
  const wheelData = snapshot?.spokes.map((s) => ({
    spoke: s.label.split(" ")[0],
    score: s.wheelScore,
    activity: s.activityScore,
    fullMark: 10,
  })) || null;

  // Best streak
  const bestStreak = gamification.streaks.reduce(
    (best, s) => (s.current_count > best.current_count ? s : best),
    { streak_type: "daily_login", current_count: 0, longest_count: 0 }
  );

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
          <p className="text-muted-foreground animate-pulse">Loading your interconnected dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ═══ HEADER + GREETING ═══ */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Beyond.Praxis</h1>
          {briefing && (
            <p className="text-muted-foreground text-sm sm:text-base">{briefing.greeting}</p>
          )}
          {briefing?.todayFocus && (
            <p className="text-sm font-medium text-violet-600 dark:text-violet-400">
              {briefing.todayFocus}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="gap-1">
            <Flame className="h-3 w-3 text-orange-500" />
            {bestStreak.current_count}d streak
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Coins className="h-3 w-3 text-yellow-500" />
            {gamification.coins}
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Zap className="h-3 w-3 text-violet-500" />
            Lv.{gamification.currentLevel}
          </Badge>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={refresh} aria-label="Refresh dashboard">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* ═══ XP PROGRESS BAR ═══ */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-xs font-bold">
                {gamification.currentLevel}
              </div>
              <div>
                <p className="text-sm font-medium">{gamification.levelTitle}</p>
                <p className="text-xs text-muted-foreground">{gamification.totalXp} XP total</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Next level</p>
              <p className="text-sm font-medium">{gamification.xpToNext} XP</p>
            </div>
          </div>
          <Progress value={progressPct} className="h-3" />
          <div className="flex justify-between mt-1">
            <p className="text-xs text-muted-foreground">{progressPct}% to Level {gamification.currentLevel + 1}</p>
            {briefing?.activitySummary && (
              <p className="text-xs text-muted-foreground">
                +{briefing.activitySummary.xpToday} XP today · {briefing.activitySummary.modulesActive} modules active
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ═══ PRIORITIES (Daily Briefing) ═══ */}
      {briefing && briefing.priorities.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Today's Priorities
            </CardTitle>
            <CardDescription>Things that need your attention right now</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {briefing.priorities.slice(0, 4).map((priority) => (
                <Link
                  key={priority.id}
                  to={priority.actionRoute}
                  className={`flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent ${getUrgencyColor(priority.urgency)}`}
                >
                  <div className="shrink-0">{getPriorityIcon(priority)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{priority.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{priority.description}</p>
                  </div>
                  <Badge variant={priority.urgency === "high" ? "destructive" : "outline"} className="text-xs shrink-0">
                    {priority.urgency}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ═══ MAIN GRID: Recommendations + Wheel ═══ */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Smart Recommendations */}
          {recommendations && recommendations.topPicks.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Lightbulb className="h-5 w-5 text-amber-500" />
                      Smart Recommendations
                    </CardTitle>
                    <CardDescription className="mt-1">{recommendations.summary}</CardDescription>
                  </div>
                  {recommendations.focusSpoke && (
                    <Badge variant="outline" className="gap-1 shrink-0">
                      Focus: {recommendations.focusSpokeLabel.split(" ")[0]}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recommendations.topPicks.map((rec: Recommendation) => {
                    const SpokeIcon = SPOKE_ICONS[rec.spoke];
                    return (
                      <Link
                        key={rec.id}
                        to={rec.route}
                        className="flex items-start gap-3 rounded-xl border p-4 transition-all hover:bg-accent hover:shadow-sm"
                      >
                        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${SPOKE_BG[rec.spoke]} ${SPOKE_COLORS[rec.spoke]}`}>
                          <SpokeIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold">{rec.title}</p>
                            {rec.impact === "high" && (
                              <Badge variant="secondary" className="text-[10px] h-4 px-1">High Impact</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{rec.description}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />{rec.estimatedMinutes}min
                            </span>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Zap className="h-3 w-3" />+{rec.xpPotential} XP
                            </span>
                            <span className="text-[10px] text-muted-foreground capitalize">{rec.category.replace("_", " ")}</span>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Spoke Health Grid — Cross-Module Data */}
          {snapshot && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="h-5 w-5 text-violet-500" />
                  Spoke Health — Cross-Module View
                </CardTitle>
                <CardDescription>
                  Real-time data from all modules (60% self-assessment + 40% actual activity)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 sm:grid-cols-2">
                  {snapshot.spokes.map((spoke) => {
                    const Icon = SPOKE_ICONS[spoke.spoke];
                    const TrendIcon = spoke.trend === "up" ? TrendingUp : spoke.trend === "down" ? TrendingDown : Activity;
                    const trendColor = spoke.trend === "up" ? "text-green-500" : spoke.trend === "down" ? "text-red-500" : "text-muted-foreground";
                    const healthPct = Math.round(spoke.combinedScore * 10);
                    return (
                      <div
                        key={spoke.spoke}
                        className="flex items-center gap-3 rounded-lg border p-3"
                      >
                        <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${SPOKE_BG[spoke.spoke]} ${SPOKE_COLORS[spoke.spoke]}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-medium truncate">{spoke.label}</p>
                            <div className="flex items-center gap-1">
                              <TrendIcon className={`h-3 w-3 ${trendColor}`} />
                              <span className="text-xs font-bold">{spoke.combinedScore}</span>
                            </div>
                          </div>
                          <Progress value={healthPct} className="h-1.5 mt-1" />
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {spoke.totalActions7d} actions this week
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Tools Grid */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5 text-violet-500" />
                Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2">
                {quickTools.map((tool) => (
                  <Link
                    key={tool.to}
                    to={tool.to}
                    className="flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-accent"
                  >
                    <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${tool.color}`}>
                      <tool.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{tool.label}</p>
                      <p className="text-xs text-muted-foreground">{tool.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Challenges */}
          {activeChallenges.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Trophy className="h-5 w-5 text-orange-500" />
                    Active Challenges
                  </CardTitle>
                  <Link to="/beyond/challenges" className="text-xs text-primary hover:underline">View all</Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {activeChallenges.slice(0, 4).map((challenge) => (
                    <div key={challenge.id} className="flex items-center gap-3 rounded-lg border p-3">
                      <Flame className="h-4 w-4 text-orange-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{challenge.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{challenge.description}</p>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0">+{challenge.xp_reward} XP</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ═══ RIGHT SIDEBAR ═══ */}
        <div className="space-y-4">
          {/* Mini Wheel Radar */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Your Wheel</CardTitle>
                <Link to="/beyond/wheel-of-life" className="text-xs text-primary hover:underline">
                  {wheelData ? "Update" : "Start"}
                </Link>
              </div>
              {snapshot?.daysSinceAssessment !== null && snapshot?.daysSinceAssessment !== undefined && (
                <p className="text-[10px] text-muted-foreground">
                  Last assessed {snapshot.daysSinceAssessment === 0 ? "today" : `${snapshot.daysSinceAssessment}d ago`}
                </p>
              )}
            </CardHeader>
            <CardContent className="pb-3">
              {wheelData ? (
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={wheelData} cx="50%" cy="50%" outerRadius="75%">
                    <PolarGrid strokeDasharray="3 3" />
                    <PolarAngleAxis dataKey="spoke" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fontSize: 9 }} />
                    <Radar name="Self-Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                    <Radar name="Activity" dataKey="activity" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeDasharray="4 2" />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="grid h-[180px] place-items-center text-center">
                  <div>
                    <Target className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Take your first assessment</p>
                    <Link to="/beyond/wheel-of-life">
                      <Button size="sm" className="mt-2">Start Now</Button>
                    </Link>
                  </div>
                </div>
              )}
              {wheelData && (
                <div className="flex justify-between text-[10px] text-muted-foreground px-2 mt-1">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-violet-500" /> Self-Score
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> Activity
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-2">
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold">{gamification.totalXp}</p>
                <p className="text-[10px] text-muted-foreground">Total XP</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold">{gamification.badgeCount}</p>
                <p className="text-[10px] text-muted-foreground">Badges</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold">{snapshot?.overallHealth.toFixed(1) || "—"}</p>
                <p className="text-[10px] text-muted-foreground">Health Score</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold">{snapshot?.activeModuleCount || 0}</p>
                <p className="text-[10px] text-muted-foreground">Active Modules</p>
              </CardContent>
            </Card>
          </div>

          {/* Active Goals */}
          {activeGoals.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-1">
                  <Target className="h-3.5 w-3.5 text-violet-500" />
                  Active Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {activeGoals.slice(0, 4).map((goal) => {
                  const Icon = SPOKE_ICONS[goal.spoke as SpokeKey] || Target;
                  const progressGoal = Math.round(((goal.currentScore) / goal.targetScore) * 100);
                  return (
                    <div key={goal.id} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-3 w-3 ${SPOKE_COLORS[goal.spoke as SpokeKey] || "text-muted-foreground"}`} />
                        <p className="text-xs truncate flex-1">{goal.goalText}</p>
                        <span className="text-[10px] text-muted-foreground">{goal.currentScore}/{goal.targetScore}</span>
                      </div>
                      <Progress value={progressGoal} className="h-1" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Recent Activity Feed */}
          {recentActivity.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-1">
                  <Activity className="h-3.5 w-3.5 text-green-500" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentActivity.slice(0, 6).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />
                      <p className="text-xs truncate flex-1">{item.description || item.source}</p>
                      <div className="flex items-center gap-1 shrink-0">
                        <Badge variant="outline" className="text-[9px] h-4 px-1">+{item.amount}</Badge>
                        <span className="text-[9px] text-muted-foreground">{formatTimeAgo(item.earnedAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Motivational Insight */}
          {briefing?.motivationalInsight && (
            <Card className="bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/20 dark:to-indigo-950/20 border-violet-200 dark:border-violet-800/40">
              <CardContent className="p-4">
                <div className="flex gap-2">
                  <Sparkles className="h-4 w-4 text-violet-500 shrink-0 mt-0.5" />
                  <p className="text-xs italic text-violet-700 dark:text-violet-300">
                    "{briefing.motivationalInsight}"
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default BeyondDashboard;
