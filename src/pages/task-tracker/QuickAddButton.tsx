import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import type { Priority, Importance, Urgency, TaskTrackerSettings } from "./types";

type Props = {
  settings: TaskTrackerSettings;
  onAdd: (task: any) => void;
};

/**
 * Floating Quick-Add button that appears on every page.
 * Lets users quickly create a task without navigating to Variable Tasks.
 */
const QuickAddButton = ({ settings, onAdd }: Props) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    task_name: "",
    priority: "Medium" as Priority,
    due_date: "",
    person_in_charge: "",
    kanban_category: settings.kanban_categories[0] || "Backlog",
  });

  const handleSubmit = () => {
    if (!form.task_name.trim()) { toast.error("Task name is required"); return; }
    onAdd({
      task_name: form.task_name,
      description: "",
      status: "To do",
      priority: form.priority,
      person_in_charge: form.person_in_charge,
      start_date: new Date().toISOString().split("T")[0],
      due_date: form.due_date || null,
      kanban_category: form.kanban_category,
      importance: "Not Important" as Importance,
      urgency: "Not Urgent" as Urgency,
      progress: 0,
      notes: "",
      is_completed: false,
      completed_at: null,
      gantt_color: "",
      project_name: "",
      role_context: "general",
    });
    toast.success(`Task "${form.task_name}" created!`);
    setForm({ task_name: "", priority: "Medium", due_date: "", person_in_charge: "", kanban_category: settings.kanban_categories[0] || "Backlog" });
    setOpen(false);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all"
        title="Quick Add Task"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Quick Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-teal-700 flex items-center gap-2">
              <Plus className="h-5 w-5" /> Quick Add Task
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>What needs to be done? *</Label>
              <Input
                value={form.task_name}
                onChange={e => setForm(f => ({ ...f, task_name: e.target.value }))}
                placeholder="Task name..."
                autoFocus
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Priority</Label>
                <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v as Priority }))}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Very High", "High", "Medium", "Low", "Very Low"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Due Date</Label>
                <Input type="date" className="h-8 text-xs" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Assign To</Label>
                <Select value={form.person_in_charge} onValueChange={v => setForm(f => ({ ...f, person_in_charge: v }))}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Optional" /></SelectTrigger>
                  <SelectContent>
                    {settings.people_in_charge.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Category</Label>
                <Select value={form.kanban_category} onValueChange={v => setForm(f => ({ ...f, kanban_category: v }))}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {settings.kanban_categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSubmit} className="bg-teal-600 hover:bg-teal-700">Add Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuickAddButton;
