import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Flame, Plus, Trash2, Calendar, Trophy, Target, Zap } from "lucide-react";

type Habit = {
  id: string;
  habit_name: string;
  emoji: string;
  frequency: "daily" | "weekdays" | "weekends" | "custom";
  custom_days: string[];
  current_streak: number;
  longest_streak: number;
  is_active: boolean;
  completions: string[]; // dates completed
};

const EMOJIS = ["💪", "🧘", "📖", "💧", "🏃", "🧠", "🎯", "✍️", "🌿", "💤", "🍎", "🧹", "📝", "🎵", "🧘‍♀️", "☀️"];
const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const uid = () => crypto.randomUUID();

const sampleHabits: Habit[] = [
  { id: uid(), habit_name: "Morning meditation", emoji: "🧘", frequency: "daily", custom_days: [], current_streak: 5, longest_streak: 12, is_active: true, completions: generateCompletions(5) },
  { id: uid(), habit_name: "Drink 8 glasses of water", emoji: "💧", frequency: "daily", custom_days: [], current_streak: 3, longest_streak: 21, is_active: true, completions: generateCompletions(3) },
  { id: uid(), habit_name: "Read 30 minutes", emoji: "📖", frequency: "daily", custom_days: [], current_streak: 0, longest_streak: 8, is_active: true, completions: generateCompletions(0) },
  { id: uid(), habit_name: "Exercise", emoji: "🏃", frequency: "weekdays", custom_days: [], current_streak: 2, longest_streak: 15, is_active: true, completions: generateCompletions(2) },
  { id: uid(), habit_name: "Journal entry", emoji: "✍️", frequency: "daily", custom_days: [], current_streak: 7, longest_streak: 30, is_active: true, completions: generateCompletions(7) },
  { id: uid(), habit_name: "Yoga practice", emoji: "🧘‍♀️", frequency: "custom", custom_days: ["monday", "wednesday", "friday"], current_streak: 1, longest_streak: 10, is_active: true, completions: generateCompletions(1) },
];

function generateCompletions(streak: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 0; i < streak; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split("T")[0]);
  }
  // Add some random older completions
  for (let i = streak + 2; i < streak + 8; i++) {
    if (Math.random() > 0.4) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split("T")[0]);
    }
  }
  return dates;
}

const TaskTrackerHabits = () => {
  const [habits, setHabits] = useState<Habit[]>(sampleHabits);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    habit_name: "",
    emoji: "💪",
    frequency: "daily" as Habit["frequency"],
    custom_days: [] as string[],
  });

  const today = new Date().toISOString().split("T")[0];

  // Generate last 30 days for the heatmap
  const last30Days = useMemo(() => {
    const days: string[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split("T")[0]);
    }
    return days;
  }, []);

  // Stats
  const activeHabits = habits.filter(h => h.is_active);
  const todayCompleted = habits.filter(h => h.completions.includes(today)).length;
  const totalStreak = habits.reduce((sum, h) => sum + h.current_streak, 0);
  const bestStreak = Math.max(...habits.map(h => h.longest_streak), 0);

  const toggleToday = (habitId: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== habitId) return h;
      const isCompleted = h.completions.includes(today);
      let newCompletions: string[];
      let newStreak: number;
      let newLongest: number;

      if (isCompleted) {
        // Undo
        newCompletions = h.completions.filter(d => d !== today);
        newStreak = Math.max(0, h.current_streak - 1);
        newLongest = h.longest_streak;
      } else {
        // Complete
        newCompletions = [...h.completions, today];
        newStreak = h.current_streak + 1;
        newLongest = Math.max(h.longest_streak, newStreak);
        toast.success(`${h.emoji} ${h.habit_name} — Day ${newStreak}!`);
      }

      return { ...h, completions: newCompletions, current_streak: newStreak, longest_streak: newLongest };
    }));
  };

  const addHabit = () => {
    if (!form.habit_name.trim()) { toast.error("Name is required"); return; }
    setHabits(prev => [...prev, {
      id: uid(),
      ...form,
      current_streak: 0,
      longest_streak: 0,
      is_active: true,
      completions: [],
    }]);
    setDialogOpen(false);
    setForm({ habit_name: "", emoji: "💪", frequency: "daily", custom_days: [] });
    toast.success("Habit created! Start building your streak.");
  };

  const deleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
    toast.success("Habit removed");
  };

  const toggleCustomDay = (day: string) => {
    setForm(f => ({
      ...f,
      custom_days: f.custom_days.includes(day)
        ? f.custom_days.filter(d => d !== day)
        : [...f.custom_days, day],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Flame className="h-6 w-6 text-orange-500" /> Habits Tracker
          </h1>
          <p className="text-sm text-muted-foreground">Build daily habits with streak tracking</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-orange-500 hover:bg-orange-600">
          <Plus className="mr-1 h-4 w-4" /> New Habit
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-orange-100 text-orange-600">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeHabits.length}</p>
              <p className="text-xs text-muted-foreground">Active Habits</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-green-100 text-green-600">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{todayCompleted}/{activeHabits.length}</p>
              <p className="text-xs text-muted-foreground">Done Today</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-amber-100 text-amber-600">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalStreak}</p>
              <p className="text-xs text-muted-foreground">Total Streak Days</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-purple-100 text-purple-600">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{bestStreak}</p>
              <p className="text-xs text-muted-foreground">Best Streak</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Habits List */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {habits.filter(h => h.is_active).map(habit => {
          const completedToday = habit.completions.includes(today);
          return (
            <Card key={habit.id} className={`transition-all ${completedToday ? "border-green-300 bg-green-50/30" : "hover:border-orange-200"}`}>
              <CardContent className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{habit.emoji}</span>
                    <div>
                      <p className="font-semibold text-sm">{habit.habit_name}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">{habit.frequency === "custom" ? habit.custom_days.map(d => d.slice(0, 3)).join(", ") : habit.frequency}</p>
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-red-500" onClick={() => deleteHabit(habit.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Streak */}
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-orange-600 flex items-center gap-1">
                      <Flame className="h-4 w-4" /> {habit.current_streak}
                    </p>
                    <p className="text-[9px] text-muted-foreground">Current</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-purple-600">{habit.longest_streak}</p>
                    <p className="text-[9px] text-muted-foreground">Best</p>
                  </div>
                </div>

                {/* 30-day heatmap */}
                <div>
                  <p className="text-[9px] text-muted-foreground mb-1">Last 30 days</p>
                  <div className="grid grid-cols-15 gap-[2px]">
                    {last30Days.map(date => {
                      const done = habit.completions.includes(date);
                      const isToday2 = date === today;
                      return (
                        <div
                          key={date}
                          className={`h-3 w-3 rounded-sm ${
                            done ? "bg-green-500" :
                            isToday2 ? "bg-orange-200 border border-orange-400" :
                            "bg-gray-100"
                          }`}
                          title={`${date}${done ? " ✓" : ""}`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Today's toggle */}
                <Button
                  className={`w-full ${completedToday ? "bg-green-600 hover:bg-green-700" : "bg-orange-500 hover:bg-orange-600"}`}
                  size="sm"
                  onClick={() => toggleToday(habit.id)}
                >
                  {completedToday ? "✓ Done Today" : "Mark as Done"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty state */}
      {habits.filter(h => h.is_active).length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Flame className="h-10 w-10 mx-auto text-orange-300 mb-3" />
            <p className="text-lg font-medium">No habits yet</p>
            <p className="text-sm text-muted-foreground">Create your first habit to start building streaks!</p>
            <Button className="mt-4 bg-orange-500 hover:bg-orange-600" onClick={() => setDialogOpen(true)}>
              <Plus className="mr-1 h-4 w-4" /> Create Habit
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-orange-600 flex items-center gap-2">
              <Flame className="h-5 w-5" /> New Habit
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Habit Name *</Label>
              <Input
                value={form.habit_name}
                onChange={e => setForm(f => ({ ...f, habit_name: e.target.value }))}
                placeholder="e.g., Morning meditation, Drink water..."
              />
            </div>
            <div>
              <Label>Emoji</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {EMOJIS.map(e => (
                  <button
                    key={e}
                    className={`text-xl p-1 rounded ${form.emoji === e ? "bg-orange-100 ring-2 ring-orange-400" : "hover:bg-muted"}`}
                    onClick={() => setForm(f => ({ ...f, emoji: e }))}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Frequency</Label>
              <Select value={form.frequency} onValueChange={v => setForm(f => ({ ...f, frequency: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Every Day</SelectItem>
                  <SelectItem value="weekdays">Weekdays Only</SelectItem>
                  <SelectItem value="weekends">Weekends Only</SelectItem>
                  <SelectItem value="custom">Custom Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.frequency === "custom" && (
              <div>
                <Label>Select Days</Label>
                <div className="grid grid-cols-4 gap-2 mt-1">
                  {DAYS.map(day => (
                    <label key={day} className="flex items-center gap-1.5 text-xs cursor-pointer">
                      <Checkbox checked={form.custom_days.includes(day)} onCheckedChange={() => toggleCustomDay(day)} />
                      <span className="capitalize">{day.slice(0, 3)}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={addHabit} className="bg-orange-500 hover:bg-orange-600">Create Habit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskTrackerHabits;
