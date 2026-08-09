import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  Award,
  BookOpen,
  Brain,
  CheckCircle2,
  Circle,
  Clock,
  Coins,
  Compass,
  Flame,
  Heart,
  Rocket,
  Smile,
  Target,
  Timer,
  Trophy,
  TrendingUp,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";

interface DashboardData {
  totalXp: number;
  currentLevel: number;
  levelTitle: string;
  xpToNext: number;
  coins: number;
  streaks: { streak_type: string; current_count: number }[];
  badgeCount: number;
  latestWheel: {
    clinical_score: number;
    finance_score: number;
    time_score: number;
    leadership_score: number;
    relationships_score: number;
    family_score: number;
    wellness_score: number;
    joy_score: number;
    total_score: number;
    assessed_at: string;
  } | null;
  challenges: { id: string; title: string; description: string; xp_reward: number; type: string; status?: string }[];
}

const quickTools = [
  { to: "/beyond/wheel-of-life", label: "Wheel of Life", icon: Target, color: "bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400", desc: "Assess life balance" },
  { to: "/beyond/time-management", label: "Time Planner", icon: Timer, color: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400", desc: "Plan your week" },
  { to: "/beyond/leadership", label: "Leadership Lab", icon: Compass, color: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400", desc: "Practice scenarios" },
  { to: "/beyond/books", label: "Book Library", icon: BookOpen, color: "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400", desc: "Curated reads" },
  { to: "/beyond/wellness", label: "Wellness Hub", icon: Heart, color: "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400", desc: "Breathe & recover" },
  { to: "/beyond/pathways", label: "Guided Pathways", icon: Rocket, color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400", desc: "Structured growth" },
  { to: "/beyond/finance", label: "Finance Toolkit", icon: Coins, color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400", desc: "Track wealth" },
  { to: "/beyond/writing", label: "Writer's Studio", icon: Brain, color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/40 dark:text-cyan-400", desc: "Publish papers" },
];

const streakIcons: Record<string, { icon: typeof Flame; label: string }> = {
  daily_login: { icon: Flame, label: "Login" },
  learning: { icon: Brain, label: "Learning" },
  wellness: { icon: Heart, label: "Wellness" },
  planning: { icon: Clock, label: "Planning" },
  reading: { icon: BookOpen, label: "Reading" },
  reflection: { icon: Smile, label: "Reflection" },
  finance: { icon: Coins, label: "Finance" },
};

const BeyondDashboard = () => {
  const [data, setData] = useState<DashboardData>({
    totalXp: 0,
    currentLevel: 1,
    levelTitle: "Intern",
    xpToNext: 500,
    coins: 0,
    streaks: [],
    badgeCount: 0,
    latestWheel: null,
    challenges: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      setLoading(false);
      return;
    }
    const userId = session.session.user.id;

    // Parallel fetches
    const [xpRes, coinRes, streakRes, badgeRes, wheelRes, challengeRes] = await Promise.all([
      (supabase as any).from("beyond_user_xp").select("total_xp, current_level, level_title, xp_to_next_level").eq("user_id", userId).maybeSingle(),
      (supabase as any).from("beyond_coin_balance").select("balance").eq("user_id", userId).maybeSingle(),
      (supabase as any).from("beyond_streaks").select("streak_type, current_count").eq("user_id", userId),
      (supabase as any).from("beyond_user_badges").select("id").eq("user_id", userId),
      (supabase as any).from("beyond_wheel_assessments").select("*").eq("user_id", userId).order("assessed_at", { ascending: false }).limit(1),
      (supabase as any).from("beyond_challenges").select("id, title, description, xp_reward, type").eq("is_active", true).limit(6),
    ]);

    setData({
      totalXp: xpRes.data?.total_xp || 0,
      currentLevel: xpRes.data?.current_level || 1,
      levelTitle: xpRes.data?.level_title || "Intern",
      xpToNext: xpRes.data?.xp_to_next_level || 500,
      coins: coinRes.data?.balance || 0,
      streaks: streakRes.data || [],
      badgeCount: badgeRes.data?.length || 0,
      latestWheel: wheelRes.data?.[0] || null,
      challenges: challengeRes.data || [],
    });
    setLoading(false);
  };

  // XP progress
  const levelThresholds = [0, 500, 1500, 3500, 7000, 12000, 20000, 35000, 55000, 80000];
  const currentLevelIdx = data.currentLevel - 1;
  const currentThreshold = levelThresholds[currentLevelIdx] || 0;
  const nextThreshold = levelThresholds[currentLevelIdx + 1] || 80000;
  const xpInLevel = data.totalXp - currentThreshold;
  const xpNeeded = nextThreshold - currentThreshold;
  const progressPct = Math.min(Math.round((xpInLevel / xpNeeded) * 100), 100);

  // Wheel radar data
  const wheelData = data.latestWheel
    ? [
        { spoke: "Clinical", score: data.latestWheel.clinical_score },
        { spoke: "Finance", score: data.latestWheel.finance_score },
        { spoke: "Time", score: data.latestWheel.time_score },
        { spoke: "Leadership", score: data.latestWheel.leadership_score },
        { spoke: "Relations", score: data.latestWheel.relationships_score },
        { spoke: "Family", score: data.latestWheel.family_score },
        { spoke: "Wellness", score: data.latestWheel.wellness_score },
        { spoke: "Joy", score: data.latestWheel.joy_score },
      ]
    : null;

  // Best streak
  const bestStreak = data.streaks.reduce(
    (best, s) => (s.current_count > best.current_count ? s : best),
    { streak_type: "daily_login", current_count: 0 }
  );

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <div className="animate-pulse text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Beyond.Praxis</h1>
          <p className="text-muted-foreground">Your life operating system — beyond the white coat</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="gap-1">
            <Flame className="h-3 w-3 text-orange-500" />
            {bestStreak.current_count} day streak
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Coins className="h-3 w-3 text-yellow-500" />
            {data.coins} coins
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Zap className="h-3 w-3 text-violet-500" />
            Lv.{data.currentLevel} {data.levelTitle}
          </Badge>
        </div>
      </div>

      {/* XP Progress Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-xs font-bold">
                {data.currentLevel}
              </div>
              <div>
                <p className="text-sm font-medium">{data.levelTitle}</p>
                <p className="text-xs text-muted-foreground">{data.totalXp} XP total</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Next level in</p>
              <p className="text-sm font-medium">{data.xpToNext} XP</p>
            </div>
          </div>
          <Progress value={progressPct} className="h-3" />
          <p className="text-xs text-muted-foreground mt-1 text-center">{progressPct}% to Level {data.currentLevel + 1}</p>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold">{data.totalXp}</p>
                <p className="text-xs text-muted-foreground">Total XP</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold">{bestStreak.current_count}</p>
                <p className="text-xs text-muted-foreground">Best Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold">{data.badgeCount}</p>
                <p className="text-xs text-muted-foreground">Badges</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold">
                  {data.latestWheel ? Number(data.latestWheel.total_score).toFixed(1) : "—"}
                </p>
                <p className="text-xs text-muted-foreground">Wheel Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content: Tools + Wheel */}
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
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
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Flame className="h-5 w-5 text-orange-500" />
                  Active Challenges
                </CardTitle>
                <Link to="/beyond/challenges" className="text-xs text-primary hover:underline">View all</Link>
              </div>
            </CardHeader>
            <CardContent>
              {data.challenges.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No active challenges</p>
              ) : (
                <div className="space-y-2">
                  {data.challenges.slice(0, 5).map((challenge) => (
                    <div key={challenge.id} className="flex items-center gap-3 rounded-lg border p-3">
                      <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{challenge.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{challenge.description}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Badge variant="outline" className="text-xs whitespace-nowrap">
                          +{challenge.xp_reward} XP
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Streaks */}
          {data.streaks.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Active Streaks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {data.streaks.filter(s => s.current_count > 0).map((streak) => {
                    const config = streakIcons[streak.streak_type] || { icon: Flame, label: streak.streak_type };
                    const Icon = config.icon;
                    return (
                      <div key={streak.streak_type} className="flex items-center gap-3 rounded-lg border p-3">
                        <Icon className="h-4 w-4 text-orange-500" />
                        <div>
                          <p className="text-sm font-medium">{config.label}</p>
                          <p className="text-xs text-muted-foreground">{streak.current_count} days</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Sidebar: Wheel + Badges */}
        <div className="space-y-4">
          {/* Mini Wheel */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Your Wheel</CardTitle>
                <Link to="/beyond/wheel-of-life" className="text-xs text-primary hover:underline">
                  {wheelData ? "Update" : "Start"}
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {wheelData ? (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={wheelData} cx="50%" cy="50%" outerRadius="70%">
                      <PolarGrid strokeDasharray="3 3" />
                      <PolarAngleAxis dataKey="spoke" tick={{ fontSize: 9 }} />
                      <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
                      <Radar
                        dataKey="score"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.25}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{Number(data.latestWheel!.total_score).toFixed(1)}/10</p>
                    <p className="text-xs text-muted-foreground">
                      Last assessed: {new Date(data.latestWheel!.assessed_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                </>
              ) : (
                <div className="py-8 text-center">
                  <Target className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">No assessment yet</p>
                  <Button asChild variant="outline" size="sm" className="mt-3">
                    <Link to="/beyond/wheel-of-life">Take Assessment</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Badges Showcase */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Badges</CardTitle>
                <Link to="/beyond/badges" className="text-xs text-primary hover:underline">All badges</Link>
              </div>
            </CardHeader>
            <CardContent>
              {data.badgeCount > 0 ? (
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-500" />
                  <span className="text-sm">{data.badgeCount} earned</span>
                </div>
              ) : (
                <div className="py-4 text-center">
                  <Award className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Complete your first Wheel assessment to earn "Mirror Mirror" badge!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recommended Book */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-green-500" />
                Suggested Read
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-muted/60 p-3">
                <p className="text-sm font-medium">Atomic Habits</p>
                <p className="text-xs text-muted-foreground">James Clear</p>
                <p className="text-xs text-muted-foreground mt-1">
                  "Small changes, remarkable results" — perfect for building daily streaks.
                </p>
              </div>
              <Button asChild variant="ghost" size="sm" className="w-full mt-2">
                <Link to="/beyond/books">Browse Library →</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BeyondDashboard;
