import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { ClipboardList, Plus, Copy, Trash2, Play, CheckCircle, RotateCcw } from "lucide-react";

type SOPStep = { id: string; text: string; done: boolean };
type SOPTemplate = { id: string; name: string; description: string; steps: string[]; created_at: string };
type SOPInstance = { id: string; template_id: string; template_name: string; steps: SOPStep[]; started_at: string; completed_at: string | null };

const uid = () => crypto.randomUUID();

const sampleTemplates: SOPTemplate[] = [
  { id: uid(), name: "Clinic Opening Procedure", description: "Daily morning checklist for reception staff", steps: ["Unlock premises and turn on lights", "Boot up computer systems and check internet", "Verify appointment schedule is loaded", "Check waiting area cleanliness", "Confirm pharmacy stock for today's prescriptions", "Turn on AC/fans in consultation rooms", "Place 'Open' sign and update Google status", "Brief morning prayer / team intention"], created_at: new Date().toISOString() },
  { id: uid(), name: "Patient Consultation Workflow", description: "Standard consultation flow for doctors", steps: ["Review patient history and previous notes", "Greet patient and confirm chief complaint", "Perform Ashtavidha Pariksha (8-fold examination)", "Assess Prakriti and Vikriti", "Determine diagnosis and differential", "Plan treatment protocol", "Write prescription and explain to patient", "Schedule follow-up and log in system"], created_at: new Date().toISOString() },
  { id: uid(), name: "Panchakarma Session Prep", description: "Pre-session preparation for therapists", steps: ["Confirm patient has fasted as instructed", "Check therapy room temperature (warm)", "Prepare medicated oils (heat to body temp)", "Lay fresh sheets on therapy table", "Verify consent form is signed", "Check for any contraindications", "Set timer for session duration", "Prepare post-therapy rest area"], created_at: new Date().toISOString() },
  { id: uid(), name: "Clinic Closing Procedure", description: "End-of-day shutdown checklist", steps: ["Confirm all patients have left", "Reconcile billing for the day", "Lock pharmacy cabinet", "Backup patient data", "Turn off all equipment and AC", "Check all windows and doors", "Set security alarm", "Update next-day prep notes"], created_at: new Date().toISOString() },
];

const TaskTrackerSOP = () => {
  const [templates, setTemplates] = useState<SOPTemplate[]>(sampleTemplates);
  const [instances, setInstances] = useState<SOPInstance[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", steps: "" });

  const createTemplate = () => {
    if (!form.name.trim() || !form.steps.trim()) { toast.error("Name and steps required"); return; }
    const steps = form.steps.split("\n").map(s => s.trim()).filter(Boolean);
    setTemplates(prev => [{ id: uid(), name: form.name, description: form.description, steps, created_at: new Date().toISOString() }, ...prev]);
    setDialogOpen(false);
    setForm({ name: "", description: "", steps: "" });
    toast.success("Template created");
  };

  const stampInstance = (template: SOPTemplate) => {
    const instance: SOPInstance = {
      id: uid(), template_id: template.id, template_name: template.name,
      steps: template.steps.map(s => ({ id: uid(), text: s, done: false })),
      started_at: new Date().toISOString(), completed_at: null,
    };
    setInstances(prev => [instance, ...prev]);
    toast.success(`"${template.name}" started — check off steps as you go`);
  };

  const toggleStep = (instanceId: string, stepId: string) => {
    setInstances(prev => prev.map(inst => {
      if (inst.id !== instanceId) return inst;
      const newSteps = inst.steps.map(s => s.id === stepId ? { ...s, done: !s.done } : s);
      const allDone = newSteps.every(s => s.done);
      return { ...inst, steps: newSteps, completed_at: allDone ? new Date().toISOString() : null };
    }));
  };

  const deleteTemplate = (id: string) => { setTemplates(prev => prev.filter(t => t.id !== id)); toast.success("Template deleted"); };
  const deleteInstance = (id: string) => { setInstances(prev => prev.filter(i => i.id !== id)); };

  const activeInstances = instances.filter(i => !i.completed_at);
  const completedInstances = instances.filter(i => i.completed_at);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2"><ClipboardList className="h-6 w-6 text-orange-600" /> SOP Checklists</h1>
          <p className="text-sm text-muted-foreground">Reusable procedure templates — stamp a fresh copy each time</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-orange-600 hover:bg-orange-700"><Plus className="mr-1 h-4 w-4" /> New Template</Button>
      </div>

      {/* Active Instances */}
      {activeInstances.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-orange-700">In Progress ({activeInstances.length})</h2>
          {activeInstances.map(inst => {
            const doneCount = inst.steps.filter(s => s.done).length;
            const pct = Math.round((doneCount / inst.steps.length) * 100);
            return (
              <Card key={inst.id} className="border-orange-200">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{inst.template_name}</p>
                      <p className="text-[10px] text-muted-foreground">Started: {new Date(inst.started_at).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{doneCount}/{inst.steps.length}</Badge>
                      <Button size="icon" variant="ghost" className="h-6 w-6 text-red-400" onClick={() => deleteInstance(inst.id)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </div>
                  <Progress value={pct} className="h-2" />
                  <div className="space-y-1">
                    {inst.steps.map((step, i) => (
                      <label key={step.id} className="flex items-center gap-2 text-xs cursor-pointer py-0.5">
                        <Checkbox checked={step.done} onCheckedChange={() => toggleStep(inst.id, step.id)} />
                        <span className={`${step.done ? "line-through text-muted-foreground" : ""}`}>{i + 1}. {step.text}</span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Completed */}
      {completedInstances.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-green-700 flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Completed ({completedInstances.length})</h2>
          {completedInstances.slice(0, 5).map(inst => (
            <div key={inst.id} className="flex items-center gap-2 text-xs py-1 px-3 border rounded bg-green-50/30">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span className="font-medium">{inst.template_name}</span>
              <span className="text-muted-foreground ml-auto">{inst.completed_at && new Date(inst.completed_at).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}

      {/* Templates */}
      <div>
        <h2 className="text-sm font-bold mb-3">Templates ({templates.length})</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {templates.map(tpl => (
            <Card key={tpl.id} className="hover:shadow-sm">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm">{tpl.name}</p>
                    <p className="text-[10px] text-muted-foreground">{tpl.description}</p>
                  </div>
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-red-400" onClick={() => deleteTemplate(tpl.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
                <div className="text-[10px] text-muted-foreground">{tpl.steps.length} steps</div>
                <ol className="text-[10px] space-y-0.5 max-h-24 overflow-y-auto list-decimal list-inside text-muted-foreground">
                  {tpl.steps.map((s, i) => <li key={i}>{s}</li>)}
                </ol>
                <Button size="sm" className="w-full bg-orange-600 hover:bg-orange-700" onClick={() => stampInstance(tpl)}>
                  <Play className="mr-1 h-3 w-3" /> Start Checklist
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Create Template Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="text-orange-600">New SOP Template</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Template Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g., Clinic Opening Procedure" /></div>
            <div><Label>Description</Label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description..." /></div>
            <div><Label>Steps (one per line) *</Label><textarea className="w-full min-h-[120px] rounded-md border px-3 py-2 text-sm" value={form.steps} onChange={e => setForm(f => ({ ...f, steps: e.target.value }))} placeholder={"Step 1: Do this\nStep 2: Then this\nStep 3: Finally this"} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={createTemplate} className="bg-orange-600 hover:bg-orange-700">Create Template</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskTrackerSOP;
