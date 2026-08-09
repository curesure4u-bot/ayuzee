import { useState, useEffect } from "react";
import {
  Award,
  CheckCircle2,
  Circle,
  Flame,
  Plus,
  Target,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  { value: "wellness", label: "Wellness", color: "bg-emerald-500" },
  { value: "productivity", label: "Productivity", color: "bg-blue-500" },
  { value: "learning", label: "Learning", color: "bg-purple-500" },
  { value: "finance", label: "Finance", color: "bg-green-500" },
  { value: "relationships", label: "Relationships", color: "bg-pink-500" },
  { value: "clinical", label: "Clinical", color: "bg-indigo-500" },
];

interface Habit {
  id: string;
  name: string;
  category: string;
  frequency: string;
  current_streak: number;
  longest_streak: number;
  is_active: boolean;
}

interface HabitLog {
  habit_id: string;
  date: string;
}

const HabitTracker = () => {
  const { addXP, addCoins, recordStreak } = useBeyondGamification();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);

  // New habit form
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("wellness");
  const [showForm, setShowForm] = useState(false);

  // Date navigation (last 7 days)
  const today = new Date().toISOString().split("T")[0];
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) { setLoading(false); return; }
    const userId = session.session.user.id;
    const weekAgo = last7Days[0];

    const [habitsRes, logsRes] = await Promise.all([
      (supabase as any).from("beyond_habits").select("*").eq("user_id", userId).eq("is_active", true).order("created_at"),
      (supabase as any).from("beyond_habit_logs").select("habit_id, date").eq("user_id", userId).gte("date", weekAgo),
    ]);
    setHabits(habitsRes.data || []);
    setLogs(logsRes.data || []);
    setLoading(false);
  };

  const addHabit = async () => {
    if (!newName.trim()) { toast.error("Enter a habit name"); return; }
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return;

    const { data } = await (supabase as any).from("beyond_habits").insert({
      user_id: session.session.user.id,
      name: newName.trim(),
      category: newCategory,
    }).select().single();

    if (data) setHabits((prev) => [...prev, data]);
    setNewName("");
    setShowForm(false);
    toast.success("Habit added! Build the chain.");
  };

  const deleteHabit = async (habitId: string) => {
    await (supabase as any).from("beyond_habits").update({ is_active: false }).eq("id", habitId);
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
    toast("Habit archived");
  };

  const toggleDay = async (habitId: string, date: string) => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return;
    const userId = session.session.user.id;

    const existing = logs.find((l) => l.habit_id === habitId && l.date === date);

    if (existing) {
      // Uncheck
      await (supabase as any).from("beyond_habit_logs").delete().eq("user_id", userId).eq("habit_id", habitId).eq("date", date);
      setLogs((prev) => prev.filter((l) => !(l.habit_id === habitId && l.date === date)));
    } else {
      // Check
      await (supabase as any).from("beyond_habit_logs").insert({ user_id: userId, habit_id: habitId, date });
      setLogs((prev) => [...prev, { habit_id: habitId, date }]);

      // Calculate streak
      let streak = 0;
      const d = new Date(date);
      while (true) {
        const dStr = d.toISOString().split("T")[0];
        const hasLog = logs.some((l) => l.habit_id === habitId && l.date === dStr) || dStr === date;
        if (hasLog) { streak++; d.setDate(d.getDate() - 1); } else break;
      }

      // Update streak on habit
      const habit = habits.find((h) => h.id === habitId);
      const newLongest = Math.max(habit?.longest_streak || 0, streak);
      await (supabase as any).from("beyond_habits").update({ current_streak: streak, longest_streak: newLongest }).eq("id", habitId);
      setHabits((prev) => prev.map((h) => h.id === habitId ? { ...h, current_streak: streak, longest_streak: newLongest } : h));

      // XP for today's habits
      if (date === today) {
        await addXP(10, "habit_checked", `Completed habit: ${habit?.name}`);
        await recordStreak("daily_login");

        // Check if all habits done today
        const todayLogs = [...logs.filter((l) => l.date === today), { habit_id: habitId, date }];
        const allDone = habits.every((h) => todayLogs.some((l) => l.habit_id === h.id));
        if (allDone && habits.length >= 3) {
          await addCoins(15, "all_habits_done", "All habits completed today!");
          toast.success("All habits done today! +15 coins bonus 🔥");
        }
      }
    }
  };

  const isChecked = (habitId: string, date: string) => logs.some((l) => l.habit_id === habitId && l.date === date);

  const todayCompleted = habits.filter((h) => isChecked(h.id, today)).length;
  const totalHabits = habits.length;
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.current_streak), 0);

  if (loading) {
    return <div className="grid min-h-[50vh] place-items-center"><p className="text-muted-foreground animate-pulse">Loading habits...</p></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl flex items-center gap-2">
            <Target className="h-7 w-7 text-emerald-500" />
            Habit Tracker
          </h1>
          <p className="text-muted-foreground">Don't break the chain — small daily wins compound</p>
        </div>
        <Badge variant="outline" className="w-fit gap-1">
          <Award className="h-3 w-3" /> +10 XP per habit
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid gap-3 grid-cols-3">
        <Card><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold">{todayCompleted}/{totalHabits}</p>
          <p className="text-xs text-muted-foreground">Today</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold flex items-center justify-center gap-1">
            <Flame className="h-4 w-4 text-orange-500" />{bestStreak}
          </p>
          <p className="text-xs text-muted-foreground">Best Streak</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold">{totalHabits}</p>
          <p className="text-xs text-muted-foreground">Active Habits</p>
        </CardContent></Card>
      </div>

      {/* Habit Grid */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Your Habits</CardTitle>
            <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => setShowForm(!showForm)}>
              <Plus className="h-3 w-3" /> Add Habit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Add Habit Form */}
          {showForm && (
            <div className="flex gap-2 mb-4 p-3 rounded-lg border border-dashed">
              <Input placeholder="e.g. Read 10 pages" value={newName} onChange={(e) => setNewName(e.target.value)} className="flex-1" />
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={addHabit}>Add</Button>
            </div>
          )}

          {habits.length === 0 ? (
            <div className="text-center py-8">
              <Target className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">No habits yet</p>
              <p className="text-xs text-muted-foreground">Add your first habit to start building chains</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* Day Headers */}
              <div className="flex items-center gap-0 mb-2 min-w-[500px]">
                <div className="w-[180px] shrink-0" />
                {last7Days.map((date) => {
                  const d = new Date(date);
                  const isToday = date === today;
                  return (
                    <div key={date} className={`flex-1 text-center text-[10px] ${isToday ? "font-bold text-primary" : "text-muted-foreground"}`}>
                      <p>{d.toLocaleDateString("en-IN", { weekday: "short" })}</p>
                      <p>{d.getDate()}</p>
                    </div>
                  );
                })}
                <div className="w-[60px] shrink-0 text-center text-[10px] text-muted-foreground">Streak</div>
              </div>

              {/* Habit Rows */}
              {habits.map((habit) => {
                const catColor = CATEGORIES.find((c) => c.value === habit.category)?.color || "bg-gray-500";
                return (
                  <div key={habit.id} className="flex items-center gap-0 py-1.5 border-t min-w-[500px]">
                    <div className="w-[180px] shrink-0 flex items-center gap-2 pr-2">
                      <div className={`h-2.5 w-2.5 rounded-full ${catColor} shrink-0`} />
                      <span className="text-sm truncate">{habit.name}</span>
                      <button onClick={() => deleteHabit(habit.id)} className="ml-auto text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    {last7Days.map((date) => {
                      const checked = isChecked(habit.id, date);
                      return (
                        <div key={date} className="flex-1 flex justify-center">
                          <button
                            onClick={() => toggleDay(habit.id, date)}
                            className="transition-transform hover:scale-110"
                          >
                            {checked ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground/40 hover:text-muted-foreground" />
                            )}
                          </button>
                        </div>
                      );
                    })}
                    <div className="w-[60px] shrink-0 text-center">
                      <span className="text-xs font-medium flex items-center justify-center gap-0.5">
                        {habit.current_streak > 0 && <Flame className="h-3 w-3 text-orange-500" />}
                        {habit.current_streak}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardContent className="p-4">
          <p className="text-xs font-medium flex items-center gap-1 mb-1">
            <TrendingUp className="h-3 w-3 text-green-500" /> Habit Tips (Atomic Habits)
          </p>
          <div className="grid gap-2 sm:grid-cols-2 text-xs text-muted-foreground">
            <p>• <strong>Stack it:</strong> "After I brush my teeth, I will meditate 2 min"</p>
            <p>• <strong>Make it easy:</strong> Start with 2 minutes, not 30</p>
            <p>• <strong>Never miss twice:</strong> One miss is okay, two is a new pattern</p>
            <p>• <strong>Track it:</strong> What gets measured gets managed</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HabitTracker;
