import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, RefreshCw, Pause, Play } from "lucide-react";
import type { RecurringTask, Priority, Importance, Urgency, Frequency, TaskTrackerSettings } from "./types";
import { getPriorityColor } from "./types";

const PRIORITIES: Priority[] = ["Very High", "High", "Medium", "Low", "Very Low", "On Hold"];
const IMPORTANCES: Importance[] = ["Important", "Not Important"];
const URGENCIES: Urgency[] = ["Urgent", "Not Urgent"];
const FREQUENCIES: Frequency[] = [
  "Daily", "Every Week", "Every 2 Weeks", "Every Month",
  "Every 2 Months", "Every 3 Months", "Every 4 Weeks", "Every 6 Months", "Yearly",
];

type Props = {
  recurringTasks: RecurringTask[];
  settings: TaskTrackerSettings;
  onAdd: (task: any) => void;
  onUpdate: (id: string, updates: Partial<RecurringTask>) => void;
  onDelete: (id: string) => void;
};

const emptyForm = {
  task_name: "", frequency: "Every Week" as Frequency, description: "",
  priority: "Medium" as Priority, person_in_charge: "",
  importance: "Not Important" as Importance, urgency: "Not Urgent" as Urgency,
  first_date: "", end_date: "", is_active: true, role_context: "general" as const,
};

const TaskTrackerRecurring = ({ recurringTasks, settings, onAdd, onUpdate, onDelete }: Props) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (task: RecurringTask) => {
    setEditingId(task.id);
    setForm({
      task_name: task.task_name,
      frequency: task.frequency,
      description: task.description,
      priority: task.priority,
      person_in_charge: task.person_in_charge,
      importance: task.importance,
      urgency: task.urgency,
      first_date: task.first_date,
      end_date: task.end_date || "",
      is_active: task.is_active,
      role_context: task.role_context,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.task_name.trim()) { toast.error("Task name is required"); return; }
    if (!form.first_date) { toast.error("First date is required"); return; }
    if (editingId) {
      onUpdate(editingId, { ...form, end_date: form.end_date || null });
      toast.success("Recurring task updated");
    } else {
      onAdd({ ...form, end_date: form.end_date || null });
      toast.success("Recurring task created");
    }
    setDialogOpen(false);
  };

  const activeCount = recurringTasks.filter(t => t.is_active).length;
  const pausedCount = recurringTasks.filter(t => !t.is_active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <RefreshCw className="h-6 w-6 text-teal-600" /> Recurring Tasks
          </h1>
          <p className="text-sm text-muted-foreground">Automate tasks that repeat on a schedule</p>
        </div>
        <Button onClick={openCreate} className="bg-teal-600 hover:bg-teal-700">
          <Plus className="mr-1 h-4 w-4" /> New Recurring Task
        </Button>
      </div>

      {/* Stats */}
      <div className="flex gap-3">
        <Badge variant="outline" className="px-3 py-1.5">
          <Play className="mr-1 h-3 w-3 text-green-500" /> {activeCount} Active
        </Badge>
        <Badge variant="outline" className="px-3 py-1.5">
          <Pause className="mr-1 h-3 w-3 text-amber-500" /> {pausedCount} Paused
        </Badge>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Task Definitions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-teal-700">Task Name</th>
                  <th className="px-3 py-2 text-left font-medium text-teal-700">Frequency</th>
                  <th className="px-3 py-2 text-left font-medium text-teal-700">Description</th>
                  <th className="px-3 py-2 text-left font-medium text-teal-700">Priority</th>
                  <th className="px-3 py-2 text-left font-medium text-teal-700">Person</th>
                  <th className="px-3 py-2 text-left font-medium text-teal-700">Importance</th>
                  <th className="px-3 py-2 text-left font-medium text-teal-700">Urgency</th>
                  <th className="px-3 py-2 text-left font-medium text-teal-700">1st Date</th>
                  <th className="px-3 py-2 text-left font-medium text-teal-700">End Date</th>
                  <th className="px-3 py-2 text-left font-medium text-teal-700">Status</th>
                  <th className="px-3 py-2 text-left font-medium text-teal-700 w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recurringTasks.length === 0 ? (
                  <tr><td colSpan={11} className="py-8 text-center text-muted-foreground">No recurring tasks defined. Create one to get started!</td></tr>
                ) : recurringTasks.map(task => (
                  <tr key={task.id} className={`border-b hover:bg-muted/30 ${!task.is_active ? "opacity-50" : ""}`}>
                    <td className="px-3 py-2 font-medium">{task.task_name}</td>
                    <td className="px-3 py-2"><Badge variant="secondary" className="text-[10px]">{task.frequency}</Badge></td>
                    <td className="px-3 py-2 text-muted-foreground max-w-[120px] truncate">{task.description}</td>
                    <td className="px-3 py-2"><Badge className={`text-[10px] ${getPriorityColor(task.priority)}`}>{task.priority}</Badge></td>
                    <td className="px-3 py-2">{task.person_in_charge}</td>
                    <td className="px-3 py-2">{task.importance}</td>
                    <td className="px-3 py-2">{task.urgency}</td>
                    <td className="px-3 py-2">{task.first_date}</td>
                    <td className="px-3 py-2">{task.end_date || "—"}</td>
                    <td className="px-3 py-2">
                      <Badge variant={task.is_active ? "default" : "secondary"} className="text-[10px]">
                        {task.is_active ? "Active" : "Paused"}
                      </Badge>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onUpdate(task.id, { is_active: !task.is_active })}>
                          {task.is_active ? <Pause className="h-3 w-3 text-amber-500" /> : <Play className="h-3 w-3 text-green-500" />}
                        </Button>
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => openEdit(task)}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500" onClick={() => { onDelete(task.id); toast.success("Deleted"); }}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-teal-700">{editingId ? "Edit Recurring Task" : "New Recurring Task"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Task Name *</Label>
              <Input value={form.task_name} onChange={e => setForm(f => ({ ...f, task_name: e.target.value }))} placeholder="e.g., Weekly Team Meeting" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Frequency *</Label>
                <Select value={form.frequency} onValueChange={v => setForm(f => ({ ...f, frequency: v as Frequency }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FREQUENCIES.map(freq => <SelectItem key={freq} value={freq}>{freq}</SelectItem>)}
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
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
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
                <Label>Importance</Label>
                <Select value={form.importance} onValueChange={v => setForm(f => ({ ...f, importance: v as Importance }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {IMPORTANCES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
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
                <Label>1st Occurrence Date *</Label>
                <Input type="date" value={form.first_date} onChange={e => setForm(f => ({ ...f, first_date: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>End Date (optional)</Label>
              <Input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
            </div>
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

export default TaskTrackerRecurring;
