import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Phone, Plus, Search, MessageSquare, Trash2 } from "lucide-react";

type CommEntry = { id: string; patient_name: string; type: "call" | "whatsapp" | "sms" | "email" | "in_person"; date: string; time: string; summary: string; follow_up: string };
const uid = () => crypto.randomUUID();

const sampleLog: CommEntry[] = [
  { id: uid(), patient_name: "Ramesh Kumar", type: "call", date: "2025-05-14", time: "10:30", summary: "Called to confirm tomorrow's appointment. He'll be 15 min late.", follow_up: "Adjust schedule" },
  { id: uid(), patient_name: "Mrs. Lakshmi Nair", type: "whatsapp", date: "2025-05-13", time: "16:00", summary: "Sent diet chart PDF. She confirmed receipt and asked about ghee.", follow_up: "Clarify ghee quantity in next visit" },
  { id: uid(), patient_name: "Priya Menon", type: "call", date: "2025-05-12", time: "09:15", summary: "Follow-up call — reported improvement in back pain after 5 sessions. Continuing protocol.", follow_up: "Schedule review next week" },
  { id: uid(), patient_name: "Mohammed F.", type: "in_person", date: "2025-05-11", time: "11:00", summary: "Walk-in complaint about wait time. Apologized, offered priority next visit.", follow_up: "Review scheduling" },
  { id: uid(), patient_name: "Suresh (Lab)", type: "call", date: "2025-05-10", time: "14:30", summary: "Called for Ramesh's blood report. Results normal. Will collect tomorrow.", follow_up: "Collect report" },
];

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  call: { label: "Phone Call", color: "bg-green-100 text-green-700" },
  whatsapp: { label: "WhatsApp", color: "bg-emerald-100 text-emerald-700" },
  sms: { label: "SMS", color: "bg-blue-100 text-blue-700" },
  email: { label: "Email", color: "bg-purple-100 text-purple-700" },
  in_person: { label: "In Person", color: "bg-amber-100 text-amber-700" },
};

const TaskTrackerCommLog = () => {
  const [log, setLog] = useState<CommEntry[]>(sampleLog);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ patient_name: "", type: "call" as CommEntry["type"], date: new Date().toISOString().split("T")[0], time: new Date().toTimeString().slice(0, 5), summary: "", follow_up: "" });

  const filtered = log.filter(e => !search || e.patient_name.toLowerCase().includes(search.toLowerCase()) || e.summary.toLowerCase().includes(search.toLowerCase()));

  const addEntry = () => {
    if (!form.patient_name.trim() || !form.summary.trim()) { toast.error("Patient name and summary required"); return; }
    setLog(prev => [{ id: uid(), ...form }, ...prev]);
    setDialogOpen(false);
    setForm({ patient_name: "", type: "call", date: new Date().toISOString().split("T")[0], time: new Date().toTimeString().slice(0, 5), summary: "", follow_up: "" });
    toast.success("Communication logged");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2"><MessageSquare className="h-6 w-6 text-green-600" /> Communication Log</h1>
          <p className="text-sm text-muted-foreground">Track calls, messages, and conversations with patients</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-green-600 hover:bg-green-700"><Plus className="mr-1 h-4 w-4" /> Log Communication</Button>
      </div>

      <div className="relative max-w-xs"><Search className="absolute left-2 top-1.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Search patient or content..." className="pl-7 h-8 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>

      <div className="space-y-2">
        {filtered.map(e => (
          <Card key={e.id} className="hover:shadow-sm">
            <CardContent className="p-3 flex items-start gap-3">
              <div className={`grid h-9 w-9 place-items-center rounded-lg shrink-0 ${TYPE_CONFIG[e.type].color}`}>
                {e.type === "call" || e.type === "in_person" ? <Phone className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><p className="font-semibold text-sm">{e.patient_name}</p><Badge className={`text-[9px] ${TYPE_CONFIG[e.type].color}`}>{TYPE_CONFIG[e.type].label}</Badge></div>
                <p className="text-xs mt-0.5">{e.summary}</p>
                <div className="flex gap-3 mt-1 text-[10px] text-muted-foreground">
                  <span>{e.date} at {e.time}</span>
                  {e.follow_up && <span className="text-amber-600 font-medium">Follow-up: {e.follow_up}</span>}
                </div>
              </div>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400 shrink-0" onClick={() => setLog(prev => prev.filter(x => x.id !== e.id))}><Trash2 className="h-3.5 w-3.5" /></Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="text-green-600">Log Communication</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Patient / Contact *</Label><Input value={form.patient_name} onChange={e => setForm(f => ({ ...f, patient_name: e.target.value }))} placeholder="Who did you talk to?" /></div>
            <div className="grid grid-cols-3 gap-2">
              <div><Label className="text-[10px]">Type</Label><Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as any }))}><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(TYPE_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select></div>
              <div><Label className="text-[10px]">Date</Label><Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="h-8 text-xs" /></div>
              <div><Label className="text-[10px]">Time</Label><Input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} className="h-8 text-xs" /></div>
            </div>
            <div><Label>Summary *</Label><Textarea value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} rows={2} placeholder="What was discussed?" /></div>
            <div><Label>Follow-up needed?</Label><Input value={form.follow_up} onChange={e => setForm(f => ({ ...f, follow_up: e.target.value }))} placeholder="Any action needed?" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={addEntry} className="bg-green-600 hover:bg-green-700">Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskTrackerCommLog;
