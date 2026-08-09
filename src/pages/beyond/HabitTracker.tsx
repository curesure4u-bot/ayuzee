import { useState, useEffect } from "react";
import {
  Award,
  Check,
  Edit2,
  Flame,
  Plus,
  Save,
  Target,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

// ════════════════════════════════════════════════════════════
// COLORS — Each habit gets a unique pastel row color
// ════════════════════════════════════════════════════════════

const ROW_COLORS = [
  { bg: "bg-rose-100 dark:bg-rose-900/30", fill: "bg-rose-400 dark:bg-rose-500", border: "border-rose-200 dark:border-rose-800", text: "text-rose-700 dark:text-rose-300" },
  { bg: "bg-amber-100 dark:bg-amber-900/30", fill: "bg-amber-400 dark:bg-amber-500", border: "border-amber-200 dark:border-amber-800", text: "text-amber-700 dark:text-amber-300" },
  { bg: "bg-sky-100 dark:bg-sky-900/30", fill: "bg-sky-400 dark:bg-sky-500", border: "border-sky-200 dark:border-sky-800", text: "text-sky-700 dark:text-sky-300" },
  { bg: "bg-violet-100 dark:bg-violet-900/30", fill: "bg-violet-400 dark:bg-violet-500", border: "border-violet-200 dark:border-violet-800", text: "text-violet-700 dark:text-violet-300" },
  { bg: "bg-emerald-100 dark:bg-emerald-900/30", fill: "bg-emerald-400 dark:bg-emerald-500", border: "border-emerald-200 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-300" },
  { bg: "bg-pink-100 dark:bg-pink-900/30", fill: "bg-pink-400 dark:bg-pink-500", border: "border-pink-200 dark:border-pink-800", text: "text-pink-700 dark:text-pink-300" },
  { bg: "bg-teal-100 dark:bg-teal-900/30", fill: "bg-teal-400 dark:bg-teal-500", border: "border-teal-200 dark:border-teal-800", text: "text-teal-700 dark:text-teal-300" },
  { bg: "bg-orange-100 dark:bg-orange-900/30", fill: "bg-orange-400 dark:bg-orange-500", border: "border-orange-200 dark:border-orange-800", text: "text-orange-700 dark:text-orange-300" },
  { bg: "bg-indigo-100 dark:bg-indigo-900/30", fill: "bg-indigo-400 dark:bg-indigo-500", border: "border-indigo-200 dark:border-indigo-800", text: "text-indigo-700 dark:text-indigo-300" },
  { bg: "bg-lime-100 dark:bg-lime-900/30", fill: "bg-lime-400 dark:bg-lime-500", border: "border-lime-200 dark:border-lime-800", text: "text-lime-700 dark:text-lime-300" },
];

const CATEGORIES = [
  { value: "wellness", label: "Wellness" },
  { value: "productivity", label: "Productivity" },
  { value: "learning", label: "Learning" },
  { value: "finance", label: "Finance" },
  { value: "relationships", label: "Relationships" },
  { value: "clinical", label: "Clinical" },
];

interface Habit { id: string; name: string; category: string; frequency: string; current_streak: number; longest_streak: number; is_active: boolean; }
interface HabitLog { habit_id: string; date: string; }

const HabitTracker = () => {
  const { addXP, addCoins, recordStreak } = useBeyondGamification();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("wellness");
  const [showForm, setShowForm] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  // Date range (last 7 days)
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
      user_id: session.session.user.id, name: newName.trim(), category: newCategory,
    }).select().single();
    if (data) setHabits((prev) => [...prev, data]);
    setNewName(""); setShowForm(false);
    toast.success("Habit added!");
  };

  const startEdit = (habit: Habit) => { setEditingId(habit.id); setEditName(habit.name); };

  const saveEdit = async (habitId: string) => {
    if (!editName.trim()) return;
    await (supabase as any).from("beyond_habits").update({ name: editName.trim() }).eq("id", habitId);
    setHabits((prev) => prev.map((h) => h.id === habitId ? { ...h, name: editName.trim() } : h));
    setEditingId(null); setEditName("");
    toast.success("Habit renamed");
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
      await (supabase as any).from("beyond_habit_logs").delete().eq("user_id", userId).eq("habit_id", habitId).eq("date", date);
      setLogs((prev) => prev.filter((l) => !(l.habit_id === habitId && l.date === date)));
    } else {
      await (supabase as any).from("beyond_habit_logs").insert({ user_id: userId, habit_id: habitId, date });
      setLogs((prev) => [...prev, { habit_id: habitId, date }]);

      // Streak calculation
      let streak = 0;
      const d = new Date(date);
      while (true) {
        const dStr = d.toISOString().split("T")[0];
        const hasLog = logs.some((l) => l.habit_id === habitId && l.date === dStr) || dStr === date;
        if (hasLog) { streak++; d.setDate(d.getDate() - 1); } else break;
      }
      const habit = habits.find((h) => h.id === habitId);
      const newLongest = Math.max(habit?.longest_streak || 0, streak);
      await (supabase as any).from("beyond_habits").update({ current_streak: streak, longest_streak: newLongest }).eq("id", habitId);
      setHabits((prev) => prev.map((h) => h.id === habitId ? { ...h, current_streak: streak, longest_streak: newLongest } : h));

      if (date === today) {
        await addXP(10, "habit_checked", `Completed: ${habit?.name}`);
        await recordStreak("daily_login");
        const todayLogs = [...logs.filter((l) => l.date === today), { habit_id: habitId, date }];
        const allDone = habits.every((h) => todayLogs.some((l) => l.habit_id === h.id));
        if (allDone && habits.length >= 3) {
          await addCoins(15, "all_habits_done", "All habits done today!");
          toast.success("All habits done! +15 coins bonus");
        }
      }
    }
  };

  const isChecked = (habitId: string, date: string) => logs.some((l) => l.habit_id === habitId && l.date === date);
  const todayCompleted = habits.filter((h) => isChecked(h.id, today)).length;
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.current_streak), 0);

  if (loading) return <div className="grid min-h-[50vh] place-items-center"><p className="text-muted-foreground animate-pulse">Loading habits...</p></div>;

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
          <p className="text-2xl font-bold">{todayCompleted}/{habits.length}</p>
          <p className="text-xs text-muted-foreground">Today</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold flex items-center justify-center gap-1">
            <Flame className="h-4 w-4 text-orange-500" />{bestStreak}
          </p>
          <p className="text-xs text-muted-foreground">Best Streak</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold">{habits.length}</p>
          <p className="text-xs text-muted-foreground">Active Habits</p>
        </CardContent></Card>
      </div>

      {/* Colorful Habit Sheet */}
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
              <Target className="mx-auto h-8 w-8 text-muted-foreground/30" />
              <p className="mt-2 text-sm text-muted-foreground">No habits yet</p>
              <p className="text-xs text-muted-foreground">Add your first habit to start building chains</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* Column Headers */}
              <div className="flex items-end gap-0 mb-1 min-w-[600px]">
                <div className="w-[200px] shrink-0 text-[10px] text-muted-foreground font-medium px-2">HABIT</div>
                {last7Days.map((date) => {
                  const d = new Date(date);
                  const isToday = date === today;
                  return (
                    <div key={date} className={`flex-1 text-center ${isToday ? "font-bold" : ""}`}>
                      <p className="text-[10px] text-muted-foreground">{d.toLocaleDateString("en-IN", { weekday: "short" })}</p>
                      <p className={`text-xs ${isToday ? "text-foreground font-bold" : "text-muted-foreground"}`}>{d.getDate()}</p>
                    </div>
                  );
                })}
                <div className="w-[70px] shrink-0 text-center text-[10px] text-muted-foreground font-medium">STREAK</div>
              </div>

              {/* Habit Rows — Colorful */}
              {habits.map((habit, idx) => {
                const color = ROW_COLORS[idx % ROW_COLORS.length];
                const isEditing = editingId === habit.id;

                return (
                  <div
                    key={habit.id}
                    className={`flex items-center gap-0 min-w-[600px] rounded-lg mb-1 ${color.bg} ${color.border} border`}
                  >
                    {/* Habit Name (editable) */}
                    <div className="w-[200px] shrink-0 flex items-center gap-2 px-3 py-2.5">
                      {isEditing ? (
                        <div className="flex items-center gap-1 flex-1">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-7 text-xs bg-white dark:bg-gray-900"
                            onKeyDown={(e) => e.key === "Enter" && saveEdit(habit.id)}
                            autoFocus
                          />
                          <button onClick={() => saveEdit(habit.id)} className="text-green-600 hover:text-green-800">
                            <Save className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className={`text-sm font-medium truncate flex-1 ${color.text}`}>{habit.name}</span>
                          <button onClick={() => startEdit(habit)} className="opacity-0 group-hover:opacity-100 hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity" title="Edit">
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button onClick={() => deleteHabit(habit.id)} className="opacity-0 group-hover:opacity-100 hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity ml-1" title="Delete">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </>
                      )}
                    </div>

                    {/* Day Cells — Colorful filled squares */}
                    {last7Days.map((date) => {
                      const checked = isChecked(habit.id, date);
                      return (
                        <div key={date} className="flex-1 flex justify-center py-2">
                          <button
                            onClick={() => toggleDay(habit.id, date)}
                            className={`h-7 w-7 rounded-md flex items-center justify-center transition-all ${
                              checked
                                ? `${color.fill} text-white shadow-sm scale-100`
                                : "bg-white/60 dark:bg-gray-800/60 border border-dashed border-gray-300 dark:border-gray-600 hover:border-solid hover:scale-105"
                            }`}
                            title={checked ? "Completed! Click to undo" : "Click to mark done"}
                          >
                            {checked && <Check className="h-4 w-4" />}
                          </button>
                        </div>
                      );
                    })}

                    {/* Streak */}
                    <div className="w-[70px] shrink-0 text-center py-2">
                      <span className={`text-xs font-bold flex items-center justify-center gap-0.5 ${color.text}`}>
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
