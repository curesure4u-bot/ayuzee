import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, ListChecks, Calendar, Link2, ArrowRight } from "lucide-react";

type ActionType = "create_task" | "create_appointment_task" | "link_to_patient";

type Props = {
  /** Context info to pre-fill the form */
  context?: {
    title?: string;
    description?: string;
    patientName?: string;
    appointmentDate?: string;
    source?: string;
  };
  /** Which actions to show */
  actions?: ActionType[];
  /** Compact mode — show as icon buttons instead of full buttons */
  compact?: boolean;
};

/**
 * Cross-Module Actions — Quick action buttons that link between modules.
 * 
 * Usage examples:
 * - On Appointment page: "Create follow-up task"
 * - On Patient page: "Create task for this patient"
 * - On HMS OPD: "Link task to this consultation"
 * 
 * When clicked, opens a pre-filled dialog and navigates to task tracker.
 */
const CrossModuleActions = ({ context, actions = ["create_task"], compact = false }: Props) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<ActionType>("create_task");
  const [form, setForm] = useState({
    task_name: context?.title || "",
    description: context?.description || "",
    priority: "Medium",
    due_date: context?.appointmentDate || "",
  });
  const navigate = useNavigate();

  const openAction = (type: ActionType) => {
    setActionType(type);
    setForm({
      task_name: type === "create_appointment_task"
        ? `Follow-up: ${context?.patientName || "Patient"}`
        : context?.title || "",
      description: context?.description || (context?.source ? `From: ${context.source}` : ""),
      priority: type === "create_appointment_task" ? "High" : "Medium",
      due_date: context?.appointmentDate || "",
    });
    setDialogOpen(true);
  };

  const handleCreate = () => {
    if (!form.task_name.trim()) { toast.error("Task name required"); return; }
    // Store in sessionStorage for the task tracker to pick up
    sessionStorage.setItem("cross_module_task", JSON.stringify({
      task_name: form.task_name,
      description: form.description,
      priority: form.priority,
      due_date: form.due_date,
      source: context?.source || "Cross-module",
    }));
    toast.success("Task created! Redirecting to Task Tracker...");
    setDialogOpen(false);
    setTimeout(() => navigate("/task-tracker/variable-tasks"), 500);
  };

  const actionButtons = {
    create_task: {
      label: "Create Task",
      icon: ListChecks,
      description: "Create a new task in the Task Tracker",
      color: "text-teal-600 hover:bg-teal-50",
    },
    create_appointment_task: {
      label: "Follow-up Task",
      icon: Calendar,
      description: "Create a follow-up task from this appointment",
      color: "text-blue-600 hover:bg-blue-50",
    },
    link_to_patient: {
      label: "Link to Patient",
      icon: Link2,
      description: "Attach this to a patient record",
      color: "text-purple-600 hover:bg-purple-50",
    },
  };

  return (
    <>
      {/* Action Buttons */}
      <div className={`flex ${compact ? "gap-1" : "gap-2"}`}>
        {actions.map(action => {
          const config = actionButtons[action];
          return compact ? (
            <Button key={action} size="icon" variant="ghost" className={`h-7 w-7 ${config.color}`} title={config.label} onClick={() => openAction(action)}>
              <config.icon className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button key={action} size="sm" variant="outline" className={`text-xs ${config.color}`} onClick={() => openAction(action)}>
              <config.icon className="mr-1 h-3.5 w-3.5" /> {config.label}
            </Button>
          );
        })}
      </div>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-teal-700 flex items-center gap-2">
              <ListChecks className="h-5 w-5" />
              {actionType === "create_appointment_task" ? "Create Follow-up Task" : "Create Task"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Task Name *</Label>
              <Input value={form.task_name} onChange={e => setForm(f => ({ ...f, task_name: e.target.value }))} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Very High", "High", "Medium", "Low"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Due Date</Label>
                <Input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
              </div>
            </div>
            {context?.source && (
              <p className="text-[10px] text-muted-foreground">Source: {context.source}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} className="bg-teal-600 hover:bg-teal-700">
              <ArrowRight className="mr-1 h-3.5 w-3.5" /> Create & Go to Tasks
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CrossModuleActions;
