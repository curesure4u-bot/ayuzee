import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { ClipboardList, Plus, RotateCcw, CheckCircle } from "lucide-react";

type PrepItem = { id: string; text: string; done: boolean };
type PrepSession = { id: string; patient_name: string; date: string; items: PrepItem[]; completed: boolean };
const uid = () => crypto.randomUUID();

const DEFAULT_CHECKLIST = [
  "Review patient history & previous notes",
  "Check pending lab results",
  "Review current medications",
  "Check allergies and contraindications",
  "Prepare consultation room",
  "Review any imaging/X-rays",
  "Check follow-up instructions from last visit",
  "Prepare prescription pad / system",
];

const sampleSessions: PrepSession[] = [
  { id: uid(), patient_name: "Ramesh Kumar", date: new Date().toISOString().split("T")[0], items: DEFAULT_CHECKLIST.map(t => ({ id: uid(), text: t, done: Math.random() > 0.5 })), completed: false },
  { id: uid(), patient_name: "Mrs. Lakshmi Nair", date: new Date().toISOString().split("T")[0], items: DEFAULT_CHECKLIST.map(t => ({ id: uid(), text: t, done: true })), completed: true },
];

const TaskTrackerAppointmentPrep = () => {
  const [sessions, setSessions] = useState<PrepSession[]>(sampleSessions);
  const [newPatient, setNewPatient] = useState("");

  const createPrep = () => {
    if (!newPatient.trim()) { toast.error("Enter patient name"); return; }
    setSessions(prev => [{ id: uid(), patient_name: newPatient, date: new Date().toISOString().split("T")[0], items: DEFAULT_CHECKLIST.map(t => ({ id: uid(), text: t, done: false })), completed: false }, ...prev]);
    setNewPatient("");
    toast.success("Prep checklist created");
  };

  const toggleItem = (sessionId: string, itemId: string) => {
    setSessions(prev => prev.map(s => {
      if (s.id !== sessionId) return s;
      const newItems = s.items.map(i => i.id === itemId ? { ...i, done: !i.done } : i);
      return { ...s, items: newItems, completed: newItems.every(i => i.done) };
    }));
  };

  const resetSession = (sessionId: string) => {
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, items: s.items.map(i => ({ ...i, done: false })), completed: false } : s));
  };

  const active = sessions.filter(s => !s.completed);
  const completed = sessions.filter(s => s.completed);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2"><ClipboardList className="h-6 w-6 text-indigo-600" /> Appointment Prep</h1>
        <p className="text-sm text-muted-foreground">Per-patient preparation checklist before each consultation</p>
      </div>

      {/* New prep */}
      <Card className="border-indigo-200 bg-indigo-50/30">
        <CardContent className="p-4 flex gap-2">
          <Input value={newPatient} onChange={e => setNewPatient(e.target.value)} placeholder="Patient name for next appointment..." className="flex-1" onKeyDown={e => e.key === "Enter" && createPrep()} />
          <Button onClick={createPrep} className="bg-indigo-600 hover:bg-indigo-700"><Plus className="mr-1 h-4 w-4" /> Create Prep</Button>
        </CardContent>
      </Card>

      {/* Active preps */}
      {active.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold">In Progress ({active.length})</h2>
          {active.map(session => {
            const doneCount = session.items.filter(i => i.done).length;
            const pct = Math.round((doneCount / session.items.length) * 100);
            return (
              <Card key={session.id} className="border-indigo-200">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{session.patient_name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[9px]">{session.date}</Badge>
                      <Badge variant="secondary" className="text-[9px]">{doneCount}/{session.items.length}</Badge>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => resetSession(session.id)}><RotateCcw className="h-3 w-3" /></Button>
                    </div>
                  </div>
                  <Progress value={pct} className="h-1.5 mt-1" />
                </CardHeader>
                <CardContent className="space-y-1">
                  {session.items.map(item => (
                    <label key={item.id} className="flex items-center gap-2 text-xs cursor-pointer py-0.5 hover:bg-muted/30 rounded px-1">
                      <Checkbox checked={item.done} onCheckedChange={() => toggleItem(session.id, item.id)} />
                      <span className={item.done ? "line-through text-muted-foreground" : ""}>{item.text}</span>
                    </label>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-green-700 flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Completed ({completed.length})</h2>
          {completed.slice(0, 5).map(s => (
            <div key={s.id} className="flex items-center gap-2 text-xs py-1 px-3 border rounded bg-green-50/30">
              <CheckCircle className="h-3 w-3 text-green-500" /><span className="font-medium">{s.patient_name}</span><span className="ml-auto text-muted-foreground">{s.date}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskTrackerAppointmentPrep;
