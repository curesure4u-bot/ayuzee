import { useState, useEffect } from "react";
import {
  Award,
  Calendar,
  CheckCircle2,
  Circle,
  ClipboardList,
  Eye,
  Flag,
  Lightbulb,
  ListChecks,
  Plus,
  Rocket,
  Save,
  Star,
  Target,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

// ════════════════════════════════════════════════════════════
// TODAY'S LIST TAB
// ════════════════════════════════════════════════════════════

function TodaysList() {
  const { addXP, recordStreak } = useBeyondGamification();
  const [tasks, setTasks] = useState<{ id: string; title: string; is_done: boolean }[]>([]);
  const [newTask, setNewTask] = useState("");
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return;
    const { data } = await (supabase as any).from("beyond_today_tasks")
      .select("id, title, is_done").eq("user_id", session.session.user.id).eq("date", today).order("sort_order");
    setTasks(data || []);
  };

  const addTask = async () => {
    if (!newTask.trim()) return;
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return;
    const { data } = await (supabase as any).from("beyond_today_tasks").insert({
      user_id: session.session.user.id, title: newTask.trim(), date: today, sort_order: tasks.length,
    }).select().single();
    if (data) setTasks((prev) => [...prev, data]);
    setNewTask("");
  };

  const toggleTask = async (id: string, done: boolean) => {
    await (supabase as any).from("beyond_today_tasks").update({ is_done: !done }).eq("id", id);
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, is_done: !done } : t));
    if (!done) { await addXP(5, "today_task", "Completed today's task"); }
  };

  const deleteTask = async (id: string) => {
    await (supabase as any).from("beyond_today_tasks").delete().eq("id", id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const doneCount = tasks.filter((t) => t.is_done).length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm flex items-center gap-2"><ListChecks className="h-4 w-4 text-orange-500" /> Today's List</CardTitle>
            <CardDescription className="text-xs">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short", year: "numeric" })} · {doneCount}/{tasks.length} done</CardDescription>
          </div>
          <Badge variant="outline" className="text-[10px]">Auto-resets daily</Badge>
        </div>
        {tasks.length > 0 && <Progress value={tasks.length > 0 ? (doneCount / tasks.length) * 100 : 0} className="h-2 mt-2" />}
      </CardHeader>
      <CardContent className="space-y-2">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center gap-2 rounded-lg border px-3 py-2">
            <button onClick={() => toggleTask(task.id, task.is_done)}>
              {task.is_done ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Circle className="h-5 w-5 text-muted-foreground/40" />}
            </button>
            <span className={`text-sm flex-1 ${task.is_done ? "line-through text-muted-foreground" : ""}`}>{task.title}</span>
            <button onClick={() => deleteTask(task.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        ))}
        <div className="flex gap-2 pt-1">
          <Input placeholder="+ Add Your Own Task" value={newTask} onChange={(e) => setNewTask(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTask()} />
          <Button size="sm" onClick={addTask}><Plus className="h-4 w-4" /></Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════
// TODO LIST TAB
// ════════════════════════════════════════════════════════════

function TodoList() {
  const [todos, setTodos] = useState<{ id: string; title: string; status: string; priority: number }[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [filter, setFilter] = useState<"all" | "in_progress" | "completed">("all");

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return;
    const { data } = await (supabase as any).from("beyond_todos")
      .select("id, title, status, priority").eq("user_id", session.session.user.id).order("priority", { ascending: false }).order("created_at", { ascending: false });
    setTodos(data || []);
  };

  const addTodo = async () => {
    if (!newTodo.trim()) return;
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return;
    const { data } = await (supabase as any).from("beyond_todos").insert({
      user_id: session.session.user.id, title: newTodo.trim(),
    }).select().single();
    if (data) setTodos((prev) => [data, ...prev]);
    setNewTodo("");
  };

  const toggleTodo = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "completed" ? "in_progress" : "completed";
    await (supabase as any).from("beyond_todos").update({
      status: newStatus, ...(newStatus === "completed" ? { completed_at: new Date().toISOString() } : { completed_at: null }),
    }).eq("id", id);
    setTodos((prev) => prev.map((t) => t.id === id ? { ...t, status: newStatus } : t));
  };

  const deleteTodo = async (id: string) => {
    await (supabase as any).from("beyond_todos").delete().eq("id", id);
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const filtered = filter === "all" ? todos : todos.filter((t) => t.status === filter);
  const completedCount = todos.filter((t) => t.status === "completed").length;
  const progressPct = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2"><ClipboardList className="h-4 w-4 text-blue-500" /> Todo List</CardTitle>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant={filter === "in_progress" ? "default" : "outline"} className="text-[10px] cursor-pointer" onClick={() => setFilter(filter === "in_progress" ? "all" : "in_progress")}>In Progress ({todos.filter((t) => t.status === "in_progress").length})</Badge>
          <Badge variant={filter === "completed" ? "default" : "outline"} className="text-[10px] cursor-pointer" onClick={() => setFilter(filter === "completed" ? "all" : "completed")}>Completed ({completedCount})</Badge>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[10px] text-muted-foreground">{completedCount}/{todos.length} completed</span>
          <Progress value={progressPct} className="flex-1 h-2" />
          <span className="text-[10px] font-medium">{progressPct}%</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {filtered.map((todo) => (
          <div key={todo.id} className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${todo.status === "completed" ? "bg-green-50 dark:bg-green-950/20" : ""}`}>
            <button onClick={() => toggleTodo(todo.id, todo.status)}>
              {todo.status === "completed" ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Circle className="h-5 w-5 text-muted-foreground/40" />}
            </button>
            <span className={`text-sm flex-1 ${todo.status === "completed" ? "line-through text-muted-foreground" : ""}`}>{todo.title}</span>
            <button onClick={() => deleteTodo(todo.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        ))}
        <div className="flex gap-2 pt-1">
          <Input placeholder="+ Add new todo" value={newTodo} onChange={(e) => setNewTodo(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTodo()} />
          <Button size="sm" onClick={addTodo}><Plus className="h-4 w-4" /></Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════
// GOALS TAB (Monthly / Quarterly / 3 Years)
// ════════════════════════════════════════════════════════════

function GoalsTab() {
  const [goals, setGoals] = useState<{ id: string; title: string; timeframe: string; status: string; progress_pct: number }[]>([]);
  const [newGoal, setNewGoal] = useState("");
  const [timeframe, setTimeframe] = useState("monthly");

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return;
    const { data } = await (supabase as any).from("beyond_goals")
      .select("id, title, timeframe, status, progress_pct").eq("user_id", session.session.user.id).order("created_at", { ascending: false });
    setGoals(data || []);
  };

  const addGoal = async () => {
    if (!newGoal.trim()) return;
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return;
    const { data } = await (supabase as any).from("beyond_goals").insert({
      user_id: session.session.user.id, title: newGoal.trim(), timeframe,
    }).select().single();
    if (data) setGoals((prev) => [data, ...prev]);
    setNewGoal("");
    toast.success("Milestone added!");
  };

  const completeGoal = async (id: string) => {
    await (supabase as any).from("beyond_goals").update({ status: "completed", progress_pct: 100 }).eq("id", id);
    setGoals((prev) => prev.map((g) => g.id === id ? { ...g, status: "completed", progress_pct: 100 } : g));
    toast.success("Goal completed! 🎉");
  };

  const deleteGoal = async (id: string) => {
    await (supabase as any).from("beyond_goals").delete().eq("id", id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2"><Flag className="h-4 w-4 text-purple-500" /> Goals & Milestones</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Timeframe Tabs */}
        <div className="flex gap-1">
          {[{ v: "monthly", l: "Monthly Milestones" }, { v: "quarterly", l: "Quarterly" }, { v: "3_years", l: "3 Years" }].map((t) => (
            <Button key={t.v} size="sm" variant={timeframe === t.v ? "default" : "outline"} className="text-xs flex-1" onClick={() => setTimeframe(t.v)}>
              {t.l}
            </Button>
          ))}
        </div>

        {/* Goals for selected timeframe */}
        {goals.filter((g) => g.timeframe === timeframe).length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No milestones yet. Create one to start tracking goals!</p>
        ) : (
          goals.filter((g) => g.timeframe === timeframe).map((goal) => (
            <div key={goal.id} className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${goal.status === "completed" ? "bg-green-50 dark:bg-green-950/20" : ""}`}>
              <button onClick={() => goal.status !== "completed" && completeGoal(goal.id)}>
                {goal.status === "completed" ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Target className="h-5 w-5 text-purple-500" />}
              </button>
              <span className={`text-sm flex-1 ${goal.status === "completed" ? "line-through text-muted-foreground" : ""}`}>{goal.title}</span>
              <button onClick={() => deleteGoal(goal.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          ))
        )}

        {/* Add Goal */}
        <div className="flex gap-2">
          <Input placeholder="+ New Milestone" value={newGoal} onChange={(e) => setNewGoal(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addGoal()} />
          <Button size="sm" onClick={addGoal}><Plus className="h-4 w-4" /></Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════
// VISION-MISSION TAB
// ════════════════════════════════════════════════════════════

function VisionMission() {
  const [vision, setVision] = useState("");
  const [mission, setMission] = useState("");
  const [lifePurpose, setLifePurpose] = useState("");
  const [fiveYearPicture, setFiveYearPicture] = useState("");
  const [coreValues, setCoreValues] = useState<string[]>([]);
  const [newValue, setNewValue] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return;
    const { data } = await (supabase as any).from("beyond_vision_mission")
      .select("*").eq("user_id", session.session.user.id).maybeSingle();
    if (data) {
      setVision(data.vision || "");
      setMission(data.mission || "");
      setLifePurpose(data.life_purpose || "");
      setFiveYearPicture(data.five_year_picture || "");
      setCoreValues(data.core_values || []);
    }
  };

  const save = async () => {
    setSaving(true);
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) { setSaving(false); return; }
    await (supabase as any).from("beyond_vision_mission").upsert({
      user_id: session.session.user.id,
      vision, mission, life_purpose: lifePurpose,
      five_year_picture: fiveYearPicture, core_values: coreValues,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
    toast.success("Vision & Mission saved!");
    setSaving(false);
  };

  const addValue = () => {
    if (!newValue.trim() || coreValues.length >= 7) return;
    setCoreValues((prev) => [...prev, newValue.trim()]);
    setNewValue("");
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2"><Eye className="h-4 w-4 text-indigo-500" /> Vision & Mission</CardTitle>
        <CardDescription className="text-xs">Define your north star. Revisit quarterly.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <label className="text-xs font-medium">My Vision (Who do I want to become?)</label>
          <Textarea placeholder="In 5 years, I see myself as..." value={vision} onChange={(e) => setVision(e.target.value)} rows={2} className="text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium">My Mission (What do I do daily to get there?)</label>
          <Textarea placeholder="Every day I commit to..." value={mission} onChange={(e) => setMission(e.target.value)} rows={2} className="text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium">Life Purpose (Why am I here?)</label>
          <Textarea placeholder="I exist to..." value={lifePurpose} onChange={(e) => setLifePurpose(e.target.value)} rows={2} className="text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium">5-Year Picture</label>
          <Textarea placeholder="In 2031, my life looks like..." value={fiveYearPicture} onChange={(e) => setFiveYearPicture(e.target.value)} rows={2} className="text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium">Core Values (max 7)</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {coreValues.map((v, i) => (
              <Badge key={i} variant="secondary" className="gap-1">
                {v} <button onClick={() => setCoreValues((prev) => prev.filter((_, idx) => idx !== i))} className="text-xs">✕</button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input placeholder="Add value (e.g. Integrity)" value={newValue} onChange={(e) => setNewValue(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addValue()} />
            <Button size="sm" variant="outline" onClick={addValue} disabled={coreValues.length >= 7}>Add</Button>
          </div>
        </div>
        <Button onClick={save} disabled={saving} className="w-full gap-2"><Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Vision & Mission"}</Button>
      </CardContent>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════
// DISCIPLINE CHECKLIST TAB
// ════════════════════════════════════════════════════════════

function DisciplineChecklist() {
  const { addXP } = useBeyondGamification();
  const [items, setItems] = useState<{ id: string; what_to_measure: string; day_of_week: string; time_of_day: string | null }[]>([]);
  const [logs, setLogs] = useState<{ item_id: string }[]>([]);
  const [newItem, setNewItem] = useState("");
  const [newDay, setNewDay] = useState("everyday");
  const [newTime, setNewTime] = useState("06:00");
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return;
    const [itemsRes, logsRes] = await Promise.all([
      (supabase as any).from("beyond_discipline_items").select("id, what_to_measure, day_of_week, time_of_day").eq("user_id", session.session.user.id).eq("is_active", true),
      (supabase as any).from("beyond_discipline_logs").select("item_id").eq("user_id", session.session.user.id).eq("date", today),
    ]);
    setItems(itemsRes.data || []);
    setLogs(logsRes.data || []);
  };

  const addItem = async () => {
    if (!newItem.trim()) return;
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return;
    const { data } = await (supabase as any).from("beyond_discipline_items").insert({
      user_id: session.session.user.id, what_to_measure: newItem.trim(), day_of_week: newDay, time_of_day: newTime,
    }).select().single();
    if (data) setItems((prev) => [...prev, data]);
    setNewItem("");
  };

  const toggleCheck = async (itemId: string) => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return;
    const checked = logs.some((l) => l.item_id === itemId);
    if (checked) {
      await (supabase as any).from("beyond_discipline_logs").delete().eq("user_id", session.session.user.id).eq("item_id", itemId).eq("date", today);
      setLogs((prev) => prev.filter((l) => l.item_id !== itemId));
    } else {
      await (supabase as any).from("beyond_discipline_logs").insert({ user_id: session.session.user.id, item_id: itemId, date: today });
      setLogs((prev) => [...prev, { item_id: itemId }]);
      await addXP(5, "discipline_check", "Discipline item done");
    }
  };

  const doneCount = logs.length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2"><ClipboardList className="h-4 w-4 text-orange-500" /> Discipline Checklist</CardTitle>
        <CardDescription className="text-xs">What gets measured gets managed. {doneCount}/{items.length} done today.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Items */}
        {items.map((item) => {
          const checked = logs.some((l) => l.item_id === item.id);
          return (
            <div key={item.id} className="flex items-center gap-3 rounded-lg border px-3 py-2">
              <button onClick={() => toggleCheck(item.id)}>
                {checked ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Circle className="h-5 w-5 text-muted-foreground/40" />}
              </button>
              <div className="flex-1">
                <p className={`text-sm ${checked ? "line-through text-muted-foreground" : ""}`}>{item.what_to_measure}</p>
                <p className="text-[10px] text-muted-foreground capitalize">{item.day_of_week} · {item.time_of_day || "anytime"}</p>
              </div>
            </div>
          );
        })}

        {/* Add Item */}
        <div className="flex flex-wrap gap-2 pt-2 items-end border-t">
          <Input placeholder="What to measure..." value={newItem} onChange={(e) => setNewItem(e.target.value)} className="flex-1 min-w-[150px]" />
          <Select value={newDay} onValueChange={setNewDay}>
            <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["everyday","monday","tuesday","wednesday","thursday","friday","saturday","sunday"].map((d) => (
                <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} className="w-[110px]" />
          <Button size="sm" onClick={addItem}>Save</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════
// MAIN LIFE PLANNER PAGE
// ════════════════════════════════════════════════════════════

const LifePlanner = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl flex items-center gap-2">
            <Rocket className="h-7 w-7 text-orange-500" />
            Life Planner
          </h1>
          <p className="text-muted-foreground">Plan today, track progress, build your future</p>
        </div>
        <Badge variant="outline" className="w-fit gap-1"><Award className="h-3 w-3" /> +5 XP per task</Badge>
      </div>

      <Tabs defaultValue="today" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="today" className="text-xs gap-1">
            <ListChecks className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Today</span>
          </TabsTrigger>
          <TabsTrigger value="todo" className="text-xs gap-1">
            <ClipboardList className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Todo</span>
          </TabsTrigger>
          <TabsTrigger value="goals" className="text-xs gap-1">
            <Flag className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Goals</span>
          </TabsTrigger>
          <TabsTrigger value="vision" className="text-xs gap-1">
            <Eye className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Vision</span>
          </TabsTrigger>
          <TabsTrigger value="discipline" className="text-xs gap-1">
            <Target className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Discipline</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today"><TodaysList /></TabsContent>
        <TabsContent value="todo"><TodoList /></TabsContent>
        <TabsContent value="goals"><GoalsTab /></TabsContent>
        <TabsContent value="vision"><VisionMission /></TabsContent>
        <TabsContent value="discipline"><DisciplineChecklist /></TabsContent>
      </Tabs>
    </div>
  );
};

export default LifePlanner;
