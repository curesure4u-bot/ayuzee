import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Target, Plus, Pencil, Trash2, Trophy, TrendingUp, CheckCircle, Calendar } from "lucide-react";

type Goal = {
  id: string;
  title: string;
  description: string;
  goal_type: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
  target_date: string | null;
  progress: number;
  is_completed: boolean;
  created_at: string;
};

const uid = () => crypto.randomUUID();
const today = () => new Date().toISOString().split("T")[0];

const sampleGoals: Goal[] = [
  { id: uid(), title: "Complete 50 patient consultations", description: "Reach 50 patient consultations this quarter to hit growth target.", goal_type: "quarterly", target_date: "2025-06-30", progress: 68, is_completed: false, created_at: today() },
  { id: uid(), title: "Publish 4 health blog posts", description: "Write and publish one blog post per week on Ayurvedic wellness topics.", goal_type: "monthly", target_date: "2025-05-31", progress: 50, is_completed: false, created_at: today() },
  { id: uid(), title: "Finish Panchakarma certification module", description: "Complete all 12 modules of the advanced Panchakarma certification course.", goal_type: "quarterly", target_date: "2025-09-30", progress: 25, is_completed: false, created_at: today() },
  { id: uid(), title: "Daily meditation habit (30 days)", description: "Maintain daily 15-min meditation practice for a full month.", goal_type: "monthly", target_date: "2025-05-15", progress: 80, is_completed: false, created_at: today() },
  { id: uid(), title: "Reduce patient wait time to <15min", description: "Optimize scheduling and staff coordination to cut average wait time.", goal_type: "quarterly", target_date: "2025-06-30", progress: 40, is_completed: false, created_at: today() },
  { id: uid(), title: "Read 2 research papers weekly", description: "Stay current with Ayurvedic and integrative medicine research.", goal_type: "weekly", target_date: null, progress: 100, is_completed: true, created_at: today() },
];

const GOAL_TYPES = [
  { value: "daily", label: "Daily", color: "bg-blue-100 text-blue-700" },
  { value: "weekly", label: "Weekly", color: "bg-purple-100 text-purple-700" },
  { value: "monthly", label: "Monthly", color: "bg-teal-100 text-teal-700" },
  { value: "quarterly", label: "Quarterly", color: "bg-amber-100 text-amber-700" },
  { value: "yearly", label: "Yearly", color: "bg-red-100 text-red-700" },
];

const TaskTrackerGoals = () => {
  const [goals, setGoals] = useState<Goal[]>(sampleGoals);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", goal_type: "monthly" as Goal["goal_type"], target_date: "", progress: 0 });
  const [filterType, setFilterType] = useState("all");

  // Stats
  const activeGoals = goals.filter(g => !g.is_completed);
  const completedGoals = goals.filter(g => g.is_completed);
  const avgProgress = activeGoals.length > 0 ? Math.round(activeGoals.reduce((s, g) => s + g.progress, 0) / activeGoals.length) : 0;

  const filtered = filterType === "all" ? goals : goals.filter(g => g.goal_type === filterType);

  const openCreate = () => {
    setEditingId(null);
    setForm({ title: "", description: "", goal_type: "monthly", target_date: "", progress: 0 });
    setDialogOpen(true);
  };

  const openEdit = (goal: Goal) => {
    setEditingId(goal.id);
    setForm({ title: goal.title, description: goal.description, goal_type: goal.goal_type, target_date: goal.target_date || "", progress: goal.progress });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    if (editingId) {
      setGoals(prev => prev.map(g => g.id === editingId ? { ...g, ...form, target_date: form.target_date || null } : g));
      toast.success("Goal updated");
    } else {
      setGoals(prev => [...prev, { id: uid(), ...form, target_date: form.target_date || null, is_completed: false, created_at: new Date().toISOString() }]);
      toast.success("Goal created");
    }
    setDialogOpen(false);
  };

  const toggleComplete = (id: string) => {
    setGoals(prev => prev.map(g => {
      if (g.id !== id) return g;
      const newCompleted = !g.is_completed;
      if (newCompleted) toast.success("Goal achieved! 🎉");
      return { ...g, is_completed: newCompleted, progress: newCompleted ? 100 : g.progress };
    }));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    toast.success("Goal removed");
  };

  const getTypeConfig = (type: string) => GOAL_TYPES.find(t => t.value === type) || GOAL_TYPES[2];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-teal-600" /> Goals
          </h1>
          <p className="text-sm text-muted-foreground">Set and track your quarterly, monthly, and weekly goals</p>
        </div>
        <Button onClick={openCreate} className="bg-teal-600 hover:bg-teal-700">
          <Plus className="mr-1 h-4 w-4" /> New Goal
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-teal-100 text-teal-600"><Target className="h-5 w-5" /></div>
            <div><p className="text-2xl font-bold">{activeGoals.length}</p><p className="text-xs text-muted-foreground">Active Goals</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-green-100 text-green-600"><Trophy className="h-5 w-5" /></div>
            <div><p className="text-2xl font-bold">{completedGoals.length}</p><p className="text-xs text-muted-foreground">Achieved</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-amber-100 text-amber-600"><TrendingUp className="h-5 w-5" /></div>
            <div><p className="text-2xl font-bold">{avgProgress}%</p><p className="text-xs text-muted-foreground">Avg Progress</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Label className="text-[10px]">Filter by Type</Label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {GOAL_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {/* Goals Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(goal => {
          const typeConfig = getTypeConfig(goal.goal_type);
          return (
            <Card key={goal.id} className={`transition-all ${goal.is_completed ? "opacity-60 border-green-200 bg-green-50/20" : "hover:shadow-md"}`}>
              <CardContent className="p-4 space-y-3">
                {/* Top */}
                <div className="flex items-start justify-between">
                  <Badge className={`text-[10px] ${typeConfig.color}`}>{typeConfig.label}</Badge>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => openEdit(goal)}><Pencil className="h-3 w-3" /></Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500" onClick={() => deleteGoal(goal.id)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className={`font-semibold text-sm ${goal.is_completed ? "line-through" : ""}`}>{goal.title}</h3>
                  {goal.description && <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{goal.description}</p>}
                </div>

                {/* Progress */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-bold">{goal.progress}%</span>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                </div>

                {/* Target date */}
                {goal.target_date && (
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Target: {goal.target_date}
                  </div>
                )}

                {/* Complete button */}
                <Button
                  variant={goal.is_completed ? "outline" : "default"}
                  size="sm"
                  className={`w-full ${!goal.is_completed ? "bg-teal-600 hover:bg-teal-700" : ""}`}
                  onClick={() => toggleComplete(goal.id)}
                >
                  {goal.is_completed ? "↩ Reopen" : "✓ Mark Achieved"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <Card><CardContent className="py-12 text-center">
          <Target className="h-10 w-10 mx-auto text-teal-300 mb-3" />
          <p className="text-lg font-medium">No goals yet</p>
          <p className="text-sm text-muted-foreground">Set your first goal to start tracking progress!</p>
        </CardContent></Card>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="text-teal-700">{editingId ? "Edit Goal" : "New Goal"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g., Complete 50 consultations this quarter" /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Why is this goal important?" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <Select value={form.goal_type} onValueChange={v => setForm(f => ({ ...f, goal_type: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{GOAL_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Target Date</Label><Input type="date" value={form.target_date} onChange={e => setForm(f => ({ ...f, target_date: e.target.value }))} /></div>
            </div>
            <div><Label>Progress ({form.progress}%)</Label><Input type="range" min={0} max={100} step={5} value={form.progress} onChange={e => setForm(f => ({ ...f, progress: Number(e.target.value) }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-teal-600 hover:bg-teal-700">{editingId ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskTrackerGoals;
