import { useState, useEffect, useRef, useCallback } from "react";
import {
  Award,
  Battery,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  Clock,
  LayoutGrid,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Save,
  Timer,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useBeyondGamification } from "@/hooks/useBeyondGamification";

const CATEGORIES = [
  { value: "clinical", label: "Clinical", color: "bg-blue-500" },
  { value: "admin", label: "Admin", color: "bg-gray-500" },
  { value: "study", label: "Study", color: "bg-purple-500" },
  { value: "personal_growth", label: "Personal Growth", color: "bg-indigo-500" },
  { value: "family", label: "Family", color: "bg-rose-500" },
  { value: "wellness", label: "Wellness", color: "bg-green-500" },
  { value: "social", label: "Social", color: "bg-pink-500" },
  { value: "commute", label: "Commute", color: "bg-yellow-500" },
  { value: "rest", label: "Rest", color: "bg-emerald-500" },
  { value: "wasted", label: "Wasted", color: "bg-red-500" },
  { value: "other", label: "Other", color: "bg-slate-500" },
];

const ENERGY_LEVELS = [
  { value: 1, label: "Very Low", icon: BatteryLow, color: "text-red-500" },
  { value: 2, label: "Low", icon: BatteryLow, color: "text-orange-500" },
  { value: 3, label: "Medium", icon: BatteryMedium, color: "text-yellow-500" },
  { value: 4, label: "High", icon: Battery, color: "text-green-500" },
  { value: 5, label: "Peak", icon: BatteryFull, color: "text-emerald-500" },
];

interface PomodoroSession {
  id: string;
  task_name: string;
  category: string;
  duration_minutes: number;
  completed: boolean;
  date: string;
}

// ════════════════════════════════════════════════════════════
// POMODORO TIMER COMPONENT
// ════════════════════════════════════════════════════════════

function PomodoroTimer() {
  const { addXP, addCoins, recordStreak } = useBeyondGamification();
  const [taskName, setTaskName] = useState("");
  const [category, setCategory] = useState("study");
  const [duration, setDuration] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsToday, setSessionsToday] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadTodaySessions();
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      handleComplete();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft]);

  const loadTodaySessions = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return;
    const today = new Date().toISOString().split("T")[0];
    const { count } = await (supabase as any)
      .from("beyond_pomodoro_sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", session.session.user.id)
      .eq("date", today)
      .eq("completed", true);
    setSessionsToday(count || 0);
  };

  const handleComplete = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return;

    await (supabase as any).from("beyond_pomodoro_sessions").insert({
      user_id: session.session.user.id,
      task_name: taskName || "Focus session",
      category,
      duration_minutes: duration,
      completed: true,
      completed_at: new Date().toISOString(),
    });

    // Gamification
    await addXP(15, "pomodoro_completed", `Completed ${duration}-min focus session`);
    await addCoins(5, "pomodoro_completed");
    await recordStreak("planning");

    setSessionsToday((prev) => prev + 1);
    toast.success(`Pomodoro complete! +15 XP`, {
      description: `${taskName || "Focus session"} done. Take a 5-min break.`,
    });

    // Reset
    setTimeLeft(duration * 60);
  };

  const startTimer = () => {
    if (!taskName.trim()) {
      toast.error("Enter a task name first");
      return;
    }
    setIsRunning(true);
  };

  const pauseTimer = () => setIsRunning(false);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(duration * 60);
  };

  const changeDuration = (mins: number) => {
    setDuration(mins);
    if (!isRunning) setTimeLeft(mins * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPct = ((duration * 60 - timeLeft) / (duration * 60)) * 100;

  return (
    <div className="space-y-4">
      {/* Timer Display */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            {/* Session counter */}
            <div className="flex items-center justify-center gap-2">
              <Badge variant="outline">Today: {sessionsToday} sessions</Badge>
              <Badge variant="secondary" className="gap-1">
                <Award className="h-3 w-3" /> +15 XP each
              </Badge>
            </div>

            {/* Big timer */}
            <div className="relative mx-auto w-48 h-48 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
                <circle
                  cx="50" cy="50" r="45" fill="none"
                  stroke="hsl(var(--primary))" strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - progressPct / 100)}`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="text-center z-10">
                <p className="text-4xl font-mono font-bold tabular-nums">
                  {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isRunning ? "Focusing..." : "Ready"}
                </p>
              </div>
            </div>

            {/* Duration selector */}
            <div className="flex items-center justify-center gap-2">
              {[15, 25, 45, 60].map((m) => (
                <Button
                  key={m}
                  variant={duration === m ? "default" : "outline"}
                  size="sm"
                  onClick={() => changeDuration(m)}
                  disabled={isRunning}
                >
                  {m}m
                </Button>
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              {!isRunning ? (
                <Button onClick={startTimer} size="lg" className="gap-2">
                  <Play className="h-4 w-4" /> Start
                </Button>
              ) : (
                <Button onClick={pauseTimer} size="lg" variant="secondary" className="gap-2">
                  <Pause className="h-4 w-4" /> Pause
                </Button>
              )}
              <Button onClick={resetTimer} size="lg" variant="outline" className="gap-2">
                <RotateCcw className="h-4 w-4" /> Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Input */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="What are you working on?"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              disabled={isRunning}
              className="flex-1"
            />
            <Select value={category} onValueChange={setCategory} disabled={isRunning}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// ENERGY TRACKER COMPONENT
// ════════════════════════════════════════════════════════════

function EnergyTracker() {
  const { addXP, recordStreak } = useBeyondGamification();
  const [energyLogs, setEnergyLogs] = useState<{ hour_of_day: number; energy_level: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodayEnergy();
  }, []);

  const loadTodayEnergy = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) { setLoading(false); return; }
    const today = new Date().toISOString().split("T")[0];
    const { data } = await (supabase as any)
      .from("beyond_energy_logs")
      .select("hour_of_day, energy_level")
      .eq("user_id", session.session.user.id)
      .eq("date", today)
      .order("hour_of_day");
    setEnergyLogs(data || []);
    setLoading(false);
  };

  const logEnergy = async (hour: number, level: number) => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return;
    const today = new Date().toISOString().split("T")[0];

    await (supabase as any)
      .from("beyond_energy_logs")
      .upsert({
        user_id: session.session.user.id,
        hour_of_day: hour,
        energy_level: level,
        date: today,
      }, { onConflict: "user_id,date,hour_of_day" });

    setEnergyLogs((prev) => {
      const filtered = prev.filter((l) => l.hour_of_day !== hour);
      return [...filtered, { hour_of_day: hour, energy_level: level }].sort((a, b) => a.hour_of_day - b.hour_of_day);
    });

    // First log of the day earns XP
    if (energyLogs.length === 0) {
      await addXP(10, "energy_logged", "Logged energy level");
      await recordStreak("planning");
    }
  };

  const currentHour = new Date().getHours();
  const hours = Array.from({ length: 18 }, (_, i) => i + 5); // 5 AM to 10 PM

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-500" />
          Energy Map
        </CardTitle>
        <CardDescription>
          Tap each hour to rate your energy (1-5). Find your peak hours for deep work.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
        ) : (
          <div className="space-y-1">
            {hours.map((hour) => {
              const log = energyLogs.find((l) => l.hour_of_day === hour);
              const isNow = hour === currentHour;
              return (
                <div
                  key={hour}
                  className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${
                    isNow ? "bg-primary/5 ring-1 ring-primary/20" : ""
                  }`}
                >
                  <span className="text-xs font-mono w-12 text-muted-foreground">
                    {String(hour).padStart(2, "0")}:00
                  </span>
                  <div className="flex gap-1 flex-1">
                    {ENERGY_LEVELS.map((level) => (
                      <button
                        key={level.value}
                        onClick={() => logEnergy(hour, level.value)}
                        className={`h-6 flex-1 rounded text-xs font-medium transition-all ${
                          log?.energy_level === level.value
                            ? "bg-primary text-primary-foreground scale-105"
                            : "bg-muted hover:bg-muted/80 text-muted-foreground"
                        }`}
                        title={level.label}
                      >
                        {level.value}
                      </button>
                    ))}
                  </div>
                  {log && (
                    <span className="text-xs w-14 text-right">
                      {ENERGY_LEVELS.find((l) => l.value === log.energy_level)?.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {energyLogs.length > 3 && (
          <div className="mt-4 rounded-lg bg-muted/60 p-3">
            <p className="text-xs font-medium">Peak Hours</p>
            <p className="text-xs text-muted-foreground mt-1">
              {energyLogs
                .filter((l) => l.energy_level >= 4)
                .map((l) => `${String(l.hour_of_day).padStart(2, "0")}:00`)
                .join(", ") || "Log more hours to see your peak pattern"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════
// WEEKLY PLANNER COMPONENT
// ════════════════════════════════════════════════════════════

interface TimeBlock {
  start: string;
  end: string;
  activity: string;
  category: string;
}

function WeeklyPlanner() {
  const { addXP, recordStreak } = useBeyondGamification();
  const [blocks, setBlocks] = useState<TimeBlock[]>([]);
  const [newBlock, setNewBlock] = useState<TimeBlock>({ start: "08:00", end: "09:00", activity: "", category: "clinical" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadWeekPlan();
  }, []);

  const getWeekStart = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.setDate(diff)).toISOString().split("T")[0];
  };

  const loadWeekPlan = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return;
    const weekStart = getWeekStart();
    const { data } = await (supabase as any)
      .from("beyond_time_weekly_plans")
      .select("plan_data")
      .eq("user_id", session.session.user.id)
      .eq("week_start", weekStart)
      .maybeSingle();
    if (data?.plan_data) setBlocks(data.plan_data);
  };

  const addBlock = () => {
    if (!newBlock.activity.trim()) {
      toast.error("Enter an activity name");
      return;
    }
    setBlocks((prev) => [...prev, { ...newBlock }].sort((a, b) => a.start.localeCompare(b.start)));
    setNewBlock({ start: "08:00", end: "09:00", activity: "", category: "clinical" });
  };

  const removeBlock = (idx: number) => {
    setBlocks((prev) => prev.filter((_, i) => i !== idx));
  };

  const savePlan = async () => {
    setSaving(true);
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) { setSaving(false); return; }
    const weekStart = getWeekStart();

    await (supabase as any)
      .from("beyond_time_weekly_plans")
      .upsert({
        user_id: session.session.user.id,
        week_start: weekStart,
        plan_data: blocks,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,week_start" });

    await addXP(20, "weekly_plan_saved", "Saved weekly time plan");
    await recordStreak("planning");
    toast.success("Weekly plan saved! +20 XP");
    setSaving(false);
  };

  const getCategoryColor = (cat: string) =>
    CATEGORIES.find((c) => c.value === cat)?.color || "bg-slate-500";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 text-indigo-500" />
          Weekly Plan
        </CardTitle>
        <CardDescription>
          Block your time for the week. Structured doctors are productive doctors.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Block Form */}
        <div className="flex flex-wrap gap-2 items-end rounded-lg border p-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Start</label>
            <Input
              type="time"
              value={newBlock.start}
              onChange={(e) => setNewBlock((p) => ({ ...p, start: e.target.value }))}
              className="w-[110px]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">End</label>
            <Input
              type="time"
              value={newBlock.end}
              onChange={(e) => setNewBlock((p) => ({ ...p, end: e.target.value }))}
              className="w-[110px]"
            />
          </div>
          <div className="space-y-1 flex-1 min-w-[150px]">
            <label className="text-xs text-muted-foreground">Activity</label>
            <Input
              placeholder="e.g. OPD, Study, Exercise..."
              value={newBlock.activity}
              onChange={(e) => setNewBlock((p) => ({ ...p, activity: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Category</label>
            <Select value={newBlock.category} onValueChange={(v) => setNewBlock((p) => ({ ...p, category: v }))}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={addBlock} size="sm" className="gap-1">
            <Plus className="h-3 w-3" /> Add
          </Button>
        </div>

        {/* Blocks List */}
        {blocks.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <Clock className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No time blocks yet</p>
            <p className="text-xs text-muted-foreground">Add blocks above or use a template below</p>
          </div>
        ) : (
          <div className="space-y-1">
            {blocks.map((block, idx) => (
              <div key={idx} className="flex items-center gap-2 rounded-lg border px-3 py-2">
                <div className={`h-3 w-3 rounded-full ${getCategoryColor(block.category)}`} />
                <span className="text-xs font-mono text-muted-foreground w-24">
                  {block.start} - {block.end}
                </span>
                <span className="text-sm font-medium flex-1">{block.activity}</span>
                <Badge variant="outline" className="text-xs">{block.category}</Badge>
                <button
                  onClick={() => removeBlock(idx)}
                  className="text-xs text-muted-foreground hover:text-destructive"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Save */}
        {blocks.length > 0 && (
          <Button onClick={savePlan} disabled={saving} className="w-full gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Weekly Plan"}
          </Button>
        )}

        {/* Category Legend */}
        <div className="flex flex-wrap gap-2 pt-2">
          {CATEGORIES.slice(0, 8).map((c) => (
            <div key={c.value} className="flex items-center gap-1">
              <div className={`h-2.5 w-2.5 rounded-full ${c.color}`} />
              <span className="text-xs text-muted-foreground">{c.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════
// TEMPLATES COMPONENT
// ════════════════════════════════════════════════════════════

function TemplatesBrowser({ onApply }: { onApply: (blocks: TimeBlock[]) => void }) {
  const [templates, setTemplates] = useState<{ id: string; name: string; description: string; career_stage: string; blocks: TimeBlock[] }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const { data } = await (supabase as any)
      .from("beyond_time_templates")
      .select("id, name, description, career_stage, blocks")
      .eq("is_default", true)
      .order("name");
    setTemplates(data || []);
    setLoading(false);
  };

  if (loading) return <p className="text-sm text-muted-foreground p-4">Loading templates...</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 text-green-500" />
          Schedule Templates
        </CardTitle>
        <CardDescription>
          Pre-built time plans for different medical career stages. Apply one to your weekly plan.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {templates.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No templates available. Run the SQL seed script first.
          </p>
        ) : (
          templates.map((tmpl) => (
            <div key={tmpl.id} className="rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{tmpl.name}</p>
                  <p className="text-xs text-muted-foreground">{tmpl.description}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onApply(tmpl.blocks as TimeBlock[]);
                    toast.success(`Applied "${tmpl.name}" template`);
                  }}
                >
                  Apply
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                <Badge variant="secondary" className="text-xs capitalize">{tmpl.career_stage.replace("_", " ")}</Badge>
                <Badge variant="outline" className="text-xs">{(tmpl.blocks as TimeBlock[]).length} blocks</Badge>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════
// MAIN TIME MANAGEMENT PAGE
// ════════════════════════════════════════════════════════════

const TimeManagement = () => {
  const [planBlocks, setPlanBlocks] = useState<TimeBlock[]>([]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl flex items-center gap-2">
            <Timer className="h-7 w-7 text-blue-500" />
            Time Management
          </h1>
          <p className="text-muted-foreground">Master your schedule — every minute counts</p>
        </div>
        <Badge variant="outline" className="w-fit gap-1">
          <Award className="h-3 w-3" /> +15-20 XP per action
        </Badge>
      </div>

      <Tabs defaultValue="pomodoro" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pomodoro" className="gap-1">
            <Timer className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Pomodoro</span>
          </TabsTrigger>
          <TabsTrigger value="planner" className="gap-1">
            <LayoutGrid className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Planner</span>
          </TabsTrigger>
          <TabsTrigger value="energy" className="gap-1">
            <Zap className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Energy</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Templates</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pomodoro">
          <PomodoroTimer />
        </TabsContent>

        <TabsContent value="planner">
          <WeeklyPlanner />
        </TabsContent>

        <TabsContent value="energy">
          <EnergyTracker />
        </TabsContent>

        <TabsContent value="templates">
          <TemplatesBrowser onApply={(blocks) => setPlanBlocks(blocks)} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TimeManagement;
