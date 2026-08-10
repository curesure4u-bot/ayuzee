import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { FileText, Plus, Trash2, Users, Calendar, CheckSquare, ChevronDown, ChevronUp } from "lucide-react";

type ActionItem = { id: string; text: string; assignee: string; done: boolean };
type Meeting = {
  id: string;
  title: string;
  date: string;
  attendees: string[];
  agenda: string;
  notes: string;
  action_items: ActionItem[];
  created_at: string;
};

const uid = () => crypto.randomUUID();

const sampleMeetings: Meeting[] = [
  {
    id: uid(), title: "Monday Morning Clinic Sync", date: new Date().toISOString().split("T")[0],
    attendees: ["Dr. Saleem", "Nurse Priya", "Receptionist Vignesh"],
    agenda: "1. Review weekend emergency cases\n2. This week's appointment load\n3. Stock shortages\n4. Patient feedback review",
    notes: "Weekend had 3 emergency walk-ins. Stock of Triphala Churna running low — reorder today. Patient Mrs. Lakshmi praised the new waiting area.",
    action_items: [
      { id: uid(), text: "Reorder Triphala Churna (50 units)", assignee: "Vignesh", done: false },
      { id: uid(), text: "Call Mrs. Lakshmi for follow-up appointment", assignee: "Priya", done: false },
      { id: uid(), text: "Review Thursday's schedule — overbooked", assignee: "Dr. Saleem", done: true },
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: uid(), title: "Case Discussion: Chronic Back Pain", date: new Date(Date.now() - 86400000 * 3).toISOString().split("T")[0],
    attendees: ["Dr. Saleem", "Dr. Kavitha", "Therapist Raju"],
    agenda: "1. Patient history review\n2. Imaging results\n3. Panchakarma protocol planning\n4. Follow-up schedule",
    notes: "Patient (Male, 42) with L4-L5 disc bulge. Conservative approach agreed: Kati Basti x10 sessions + Abhyanga. Review after 2 weeks. If no improvement, refer for MRI repeat.",
    action_items: [
      { id: uid(), text: "Schedule 10 Kati Basti sessions for patient", assignee: "Raju", done: true },
      { id: uid(), text: "Prepare Panchakarma consent form", assignee: "Priya", done: false },
    ],
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

type Props = {
  onCreateTask?: (text: string) => void;
};

const TaskTrackerMeetingMinutes = ({ onCreateTask }: Props) => {
  const [meetings, setMeetings] = useState<Meeting[]>(sampleMeetings);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(meetings[0]?.id || null);
  const [form, setForm] = useState({
    title: "", date: new Date().toISOString().split("T")[0],
    attendees: "", agenda: "", notes: "",
  });
  const [newActionText, setNewActionText] = useState("");
  const [newActionAssignee, setNewActionAssignee] = useState("");

  const createMeeting = () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    const meeting: Meeting = {
      id: uid(), title: form.title, date: form.date,
      attendees: form.attendees.split(",").map(a => a.trim()).filter(Boolean),
      agenda: form.agenda, notes: form.notes, action_items: [],
      created_at: new Date().toISOString(),
    };
    setMeetings(prev => [meeting, ...prev]);
    setDialogOpen(false);
    setForm({ title: "", date: new Date().toISOString().split("T")[0], attendees: "", agenda: "", notes: "" });
    setExpandedId(meeting.id);
    toast.success("Meeting created");
  };

  const addActionItem = (meetingId: string) => {
    if (!newActionText.trim()) return;
    setMeetings(prev => prev.map(m => m.id === meetingId ? {
      ...m, action_items: [...m.action_items, { id: uid(), text: newActionText, assignee: newActionAssignee, done: false }]
    } : m));
    setNewActionText("");
    setNewActionAssignee("");
  };

  const toggleAction = (meetingId: string, actionId: string) => {
    setMeetings(prev => prev.map(m => m.id === meetingId ? {
      ...m, action_items: m.action_items.map(a => a.id === actionId ? { ...a, done: !a.done } : a)
    } : m));
  };

  const convertActionToTask = (item: ActionItem) => {
    if (onCreateTask) onCreateTask(item.text);
    toast.success(`"${item.text}" → added to Variable Tasks`);
  };

  const deleteMeeting = (id: string) => {
    setMeetings(prev => prev.filter(m => m.id !== id));
    toast.success("Meeting deleted");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" /> Meeting Minutes
          </h1>
          <p className="text-sm text-muted-foreground">Structured notes with action items that auto-create tasks</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-1 h-4 w-4" /> New Meeting
        </Button>
      </div>

      {/* Meetings List */}
      <div className="space-y-3">
        {meetings.map(meeting => {
          const isExpanded = expandedId === meeting.id;
          const doneActions = meeting.action_items.filter(a => a.done).length;
          return (
            <Card key={meeting.id} className="overflow-hidden">
              <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : meeting.id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    <div>
                      <CardTitle className="text-sm">{meeting.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[9px]"><Calendar className="mr-0.5 h-2.5 w-2.5" />{meeting.date}</Badge>
                        <Badge variant="secondary" className="text-[9px]"><Users className="mr-0.5 h-2.5 w-2.5" />{meeting.attendees.length}</Badge>
                        <Badge variant="outline" className="text-[9px]"><CheckSquare className="mr-0.5 h-2.5 w-2.5" />{doneActions}/{meeting.action_items.length} actions</Badge>
                      </div>
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400" onClick={e => { e.stopPropagation(); deleteMeeting(meeting.id); }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>
              {isExpanded && (
                <CardContent className="pt-0 space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Attendees</p>
                      <div className="flex flex-wrap gap-1">{meeting.attendees.map(a => <Badge key={a} variant="secondary" className="text-[10px]">{a}</Badge>)}</div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Agenda</p>
                      <p className="text-xs whitespace-pre-line text-muted-foreground">{meeting.agenda}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Notes</p>
                    <p className="text-xs whitespace-pre-line bg-muted/30 rounded p-2">{meeting.notes}</p>
                  </div>
                  {/* Action Items */}
                  <div>
                    <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2">Action Items</p>
                    <div className="space-y-1.5">
                      {meeting.action_items.map(item => (
                        <div key={item.id} className="flex items-center gap-2 text-xs py-1 border-b last:border-0">
                          <input type="checkbox" checked={item.done} onChange={() => toggleAction(meeting.id, item.id)} className="rounded" />
                          <span className={`flex-1 ${item.done ? "line-through text-muted-foreground" : ""}`}>{item.text}</span>
                          {item.assignee && <Badge variant="outline" className="text-[9px]">{item.assignee}</Badge>}
                          {!item.done && <Button size="sm" variant="ghost" className="h-5 text-[9px] text-teal-600" onClick={() => convertActionToTask(item)}>→ Task</Button>}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Input value={newActionText} onChange={e => setNewActionText(e.target.value)} placeholder="New action item..." className="h-7 text-xs flex-1" onKeyDown={e => e.key === "Enter" && addActionItem(meeting.id)} />
                      <Input value={newActionAssignee} onChange={e => setNewActionAssignee(e.target.value)} placeholder="Assignee" className="h-7 text-xs w-24" />
                      <Button size="sm" className="h-7 text-xs" onClick={() => addActionItem(meeting.id)}>Add</Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="text-blue-600">New Meeting</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g., Monday Clinic Sync" /></div>
              <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
            </div>
            <div><Label>Attendees (comma-separated)</Label><Input value={form.attendees} onChange={e => setForm(f => ({ ...f, attendees: e.target.value }))} placeholder="Dr. Saleem, Nurse Priya, ..." /></div>
            <div><Label>Agenda</Label><Textarea value={form.agenda} onChange={e => setForm(f => ({ ...f, agenda: e.target.value }))} rows={3} placeholder="1. Topic A&#10;2. Topic B" /></div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} placeholder="Key discussions and decisions..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={createMeeting} className="bg-blue-600 hover:bg-blue-700">Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskTrackerMeetingMinutes;
