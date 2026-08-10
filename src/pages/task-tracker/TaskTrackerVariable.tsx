import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2, CheckSquare, Filter, Download } from "lucide-react";
import type { VariableTask, Priority, Importance, Urgency, TaskTrackerSettings } from "./types";
import { getDaysLeft, getPriorityColor, getDecisionColor, getDecision } from "./types";
import { exportTaskListPdf } from "./exportPdf";

const PRIORITIES: Priority[] = ["Very High", "High", "Medium", "Low", "Very Low", "On Hold"];
const IMPORTANCES: Importance[] = ["Important", "Not Important"];
const URGENCIES: Urgency[] = ["Urgent", "Not Urgent"];
const COLORS = ["#0d9488", "#f59e0b", "#ef4444", "#8b5cf6", "#3b82f6", "#10b981", "#6b7280", "#ec4899"];

type Props = {
  tasks: VariableTask[];
  settings: TaskTrackerSettings;
  onAdd: (task: any) => void;
  onUpdate: (id: string, updates: Partial<VariableTask>) => void;
  onDelete: (id: string) => void;
};

const emptyForm = {
  task_name: "", description: "", status: "To do", priority: "Medium" as Priority,
  person_in_charge: "", start_date: "", due_date: "", kanban_category: "Backlog",
  importance: "Not Important" as Importance, urgency: "Not Urgent" as Urgency,
  progress: 0, notes: "", is_completed: false, completed_at: null,
  gantt_color: "", project_name: "", role_context: "general" as const,
};

const TaskTrackerVariable = ({ tasks, settings, onAdd, onUpdate, onDelete }: Props) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [searchText, setSearchText] = useState("");
  const [highlightTask, setHighlightTask] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const completedCount = tasks.filter(t => t.is_completed).length;
  const dueTodayCount = tasks.filter(t => t.due_date === today && !t.is_completed).length;

  // Filter
  const filteredTasks = tasks.filter(t => {
    if (searchText && !t.task_name.toLowerCase().includes(searchText.toLowerCase())) return false;
    return true;
  });

  // Charts data
  const statusData = (() => {
    const counts: Record<string, number> = {};
    tasks.forEach(t => { counts[t.status] = (counts[t.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  })();

  const priorityData = PRIORITIES.map(p => ({
    name: p, count: tasks.filter(t => t.priority === p).length,
  }));

  const personData = (() => {
    const counts: Record<string, number> = {};
    tasks.forEach(t => { if (t.person_in_charge) counts[t.person_in_charge] = (counts[t.person_in_charge] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  })();

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (task: VariableTask) => {
    setEditingId(task.id);
    setForm({
      task_name: task.task_name,
      description: task.description,
      status: task.status,
      priority: task.priority,
      person_in_charge: task.person_in_charge,
      start_date: task.start_date || "",
      due_date: task.due_date || "",
      kanban_category: task.kanban_category,
      importance: task.importance,
      urgency: task.urgency,
      progress: task.progress,
      notes: task.notes,
      is_completed: task.is_completed,
      completed_at: task.completed_at,
      gantt_color: task.gantt_color,
      project_name: task.project_name,
      role_context: task.role_context,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.task_name.trim()) { toast.error("Task name is required"); return; }
    if (editingId) {
      onUpdate(editingId, { ...form, start_date: form.start_date || null, due_date: form.due_date || null });
      toast.success("Task updated");
    } else {
      onAdd({ ...form, start_date: form.start_date || null, due_date: form.due_date || null });
      toast.success("Task created");
    }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Variable Tasks</h1>
          <p className="text-sm text-muted-foreground">Manage your one-time tasks with full details</p>
        </div>
        <Button onClick={openCreate} className="bg-teal-600 hover:bg-teal-700">
          <Plus className="mr-1 h-4 w-4" /> New Task
        </Button>
        <Button variant="outline" size="sm" onClick={() => exportTaskListPdf(tasks)}>
          <Download className="mr-1 h-4 w-4" /> Export PDF
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card><CardContent className="p-3 text-center">
          <p className="text-xs text-muted-foreground">Task Filter</p>
          <div className="mt-1 relative">
            <Search className="absolute left-2 top-1.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-7 h-7 text-xs" value={searchText} onChange={e => setSearchText(e.target.value)} />
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-xs text-muted-foreground">Overall Completed</p>
          <p className="text-lg font-bold text-teal-700">{completedCount} of {tasks.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-xs text-muted-foreground">Due Today</p>
          <p className="text-lg font-bold text-amber-600">{dueTodayCount}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <p className="text-xs text-muted-foreground">Highlight Task</p>
          <Select value={highlightTask} onValueChange={setHighlightTask}>
            <SelectTrigger className="h-7 text-xs mt-1"><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              {tasks.slice(0, 10).map(t => <SelectItem key={t.id} value={t.id}>{t.task_name}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent></Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-1"><CardTitle className="text-xs">Task Status</CardTitle></CardHeader>
          <CardContent className="h-28">
            <ResponsiveContainer>
              <PieChart><Pie data={statusData} innerRadius={20} outerRadius={40} dataKey="value">
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie><Tooltip /></PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1"><CardTitle className="text-xs">Task Priority</CardTitle></CardHeader>
          <CardContent className="h-28">
            <ResponsiveContainer>
              <BarChart data={priorityData}>
                <XAxis dataKey="name" tick={{ fontSize: 8 }} />
                <YAxis hide />
                <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} />
                <Tooltip />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1"><CardTitle className="text-xs">Task Distribution</CardTitle></CardHeader>
          <CardContent className="h-28">
            <ResponsiveContainer>
              <PieChart><Pie data={personData} innerRadius={20} outerRadius={40} dataKey="value">
                {personData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie><Tooltip /></PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tasks Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b bg-muted/50 sticky top-0">
                <tr>
                  <th className="px-2 py-2 text-left w-8">
                    <CheckSquare className="h-3.5 w-3.5 text-teal-600" />
                  </th>
                  <th className="px-2 py-2 text-left font-medium text-teal-700">Task Name</th>
                  <th className="px-2 py-2 text-left font-medium text-teal-700">Description</th>
                  <th className="px-2 py-2 text-left font-medium text-teal-700">Status</th>
                  <th className="px-2 py-2 text-left font-medium text-teal-700">Priority</th>
                  <th className="px-2 py-2 text-left font-medium text-teal-700">Person</th>
                  <th className="px-2 py-2 text-left font-medium text-teal-700">Start</th>
                  <th className="px-2 py-2 text-left font-medium text-teal-700">Due</th>
                  <th className="px-2 py-2 text-left font-medium text-teal-700">Days Left</th>
                  <th className="px-2 py-2 text-left font-medium text-teal-700">Category</th>
                  <th className="px-2 py-2 text-left font-medium text-teal-700">Decision</th>
                  <th className="px-2 py-2 text-left font-medium text-teal-700">Progress</th>
                  <th className="px-2 py-2 text-left font-medium text-teal-700 w-20">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.length === 0 ? (
                  <tr><td colSpan={13} className="py-8 text-center text-muted-foreground">No tasks found. Create your first task!</td></tr>
                ) : filteredTasks.map(task => {
                  const daysLeft = getDaysLeft(task.due_date);
                  const isHighlighted = task.id === highlightTask;
                  return (
                    <tr key={task.id} className={`border-b hover:bg-muted/30 ${isHighlighted ? "bg-yellow-50" : ""} ${task.is_completed ? "opacity-60" : ""}`}>
                      <td className="px-2 py-2">
                        <Checkbox
                          checked={task.is_completed}
                          onCheckedChange={(checked) => onUpdate(task.id, { is_completed: !!checked })}
                        />
                      </td>
                      <td className="px-2 py-2 font-medium max-w-[140px] truncate">{task.task_name}</td>
                      <td className="px-2 py-2 text-muted-foreground max-w-[120px] truncate">{task.description}</td>
                      <td className="px-2 py-2">
                        <Badge variant="outline" className="text-[10px]">{task.status}</Badge>
                      </td>
                      <td className="px-2 py-2">
                        <Badge className={`text-[10px] ${getPriorityColor(task.priority)}`}>{task.priority}</Badge>
                      </td>
                      <td className="px-2 py-2">{task.person_in_charge}</td>
                      <td className="px-2 py-2">{task.start_date || "—"}</td>
                      <td className="px-2 py-2">{task.due_date || "—"}</td>
                      <td className="px-2 py-2">
                        {daysLeft !== null && (
                          <span className={`font-medium ${daysLeft < 0 ? "text-red-600" : daysLeft <= 3 ? "text-amber-600" : "text-green-600"}`}>
                            {daysLeft}
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-2"><Badge variant="secondary" className="text-[10px]">{task.kanban_category}</Badge></td>
                      <td className="px-2 py-2">
                        <Badge className={`text-[10px] ${getDecisionColor(task.decision)}`}>{task.decision}</Badge>
                      </td>
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-1">
                          <Progress value={task.progress} className="h-1.5 w-12" />
                          <span className="text-[10px]">{task.progress}%</span>
                        </div>
                      </td>
                      <td className="px-2 py-2">
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => openEdit(task)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500" onClick={() => { onDelete(task.id); toast.success("Task deleted"); }}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-2 border-t text-xs text-muted-foreground">
            Showing {filteredTasks.length} of {tasks.length} tasks
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-teal-700">{editingId ? "Edit Task" : "New Variable Task"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Task Name *</Label>
                <Input value={form.task_name} onChange={e => setForm(f => ({ ...f, task_name: e.target.value }))} placeholder="Enter task name..." />
              </div>
              <div className="sm:col-span-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the task..." rows={2} />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {settings.statuses.map(s => (
                      <SelectItem key={s.name} value={s.name}>{s.emoji} {s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v as Priority }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Person in Charge</Label>
                <Select value={form.person_in_charge} onValueChange={v => setForm(f => ({ ...f, person_in_charge: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {settings.people_in_charge.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Kanban Category</Label>
                <Select value={form.kanban_category} onValueChange={v => setForm(f => ({ ...f, kanban_category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {settings.kanban_categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Start Date</Label>
                <Input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
              </div>
              <div>
                <Label>Due Date</Label>
                <Input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
              </div>
              <div>
                <Label>Importance</Label>
                <Select value={form.importance} onValueChange={v => setForm(f => ({ ...f, importance: v as Importance }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {IMPORTANCES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Urgency</Label>
                <Select value={form.urgency} onValueChange={v => setForm(f => ({ ...f, urgency: v as Urgency }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {URGENCIES.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Progress ({form.progress}%)</Label>
                <Input type="range" min={0} max={100} step={5} value={form.progress} onChange={e => setForm(f => ({ ...f, progress: Number(e.target.value) }))} className="mt-1" />
              </div>
              <div>
                <Label>Decision (auto)</Label>
                <Input disabled value={getDecision(form.importance, form.urgency)} className="bg-muted" />
              </div>
              <div className="sm:col-span-2">
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Additional notes..." rows={2} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-teal-600 hover:bg-teal-700">
              {editingId ? "Update Task" : "Create Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskTrackerVariable;
