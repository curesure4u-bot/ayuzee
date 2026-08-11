import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ClipboardList, Plus, Calendar, CheckCircle, AlertTriangle, ArrowRight } from "lucide-react";

type StandupEntry = { id: string; date: string; done: string; blocked: string; planned: string; submitted_at: string };
const uid = () => crypto.randomUUID();

const sampleStandups: StandupEntry[] = [
  { id: uid(), date: new Date().toISOString().split("T")[0], done: "• Completed 12 patient consultations\n• Processed 3 insurance claims\n• Restocked Triphala (50 units arrived)", blocked: "• Waiting for lab report for Patient Ramesh\n• AC repair pending — room 2 too warm", planned: "• Morning: 8 appointments scheduled\n• Afternoon: Staff training on new billing system\n• Follow-up calls to 5 patients", submitted_at: new Date().toISOString() },
  { id: uid(), date: new Date(Date.now() - 86400000).toISOString().split("T")[0], done: "• 10 consultations completed\n• Monthly inventory audit done\n• Updated patient records backlog", blocked: "• Printer not working — can't print prescriptions\n• Vendor payment approval pending", planned: "• Get printer fixed\n• Process pending insurance claims\n• Review weekly feedback", submitted_at: new Date(Date.now() - 86400000).toISOString() },
];

const TaskTrackerStandup = () => {
  const [entries, setEntries] = useState<StandupEntry[]>(sampleStandups);
  const [done, setDone] = useState("");
  const [blocked, setBlocked] = useState("");
  const [planned, setPlanned] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const hasTodayEntry = entries.some(e => e.date === today);

  const submitStandup = () => {
    if (!done.trim() && !planned.trim()) { toast.error("Fill at least 'Done' or 'Planned' section"); return; }
    const existing = entries.findIndex(e => e.date === today);
    if (existing >= 0) {
      setEntries(prev => prev.map(e => e.date === today ? { ...e, done, blocked, planned, submitted_at: new Date().toISOString() } : e));
      toast.success("Today's standup updated");
    } else {
      setEntries(prev => [{ id: uid(), date: today, done, blocked, planned, submitted_at: new Date().toISOString() }, ...prev]);
      toast.success("Daily standup submitted!");
    }
    setDone(""); setBlocked(""); setPlanned("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2"><ClipboardList className="h-6 w-6 text-orange-600" /> Daily Standup / EOD Report</h1>
        <p className="text-sm text-muted-foreground">2-minute daily report: what done, what's blocked, what's planned</p>
      </div>

      {/* Today's Standup Form */}
      <Card className={`border-orange-200 ${hasTodayEntry ? "bg-green-50/30 border-green-200" : "bg-orange-50/30"}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="h-4 w-4" /> {hasTodayEntry ? "Update Today's Standup" : "Submit Today's Standup"}
            <Badge variant="outline" className="text-[9px] ml-auto">{today}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-500" /> What did I do today?</Label>
            <Textarea value={done} onChange={e => setDone(e.target.value)} rows={3} placeholder="• Completed X consultations&#10;• Processed Y claims&#10;• Finished Z task" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-amber-500" /> What's blocking me?</Label>
            <Textarea value={blocked} onChange={e => setBlocked(e.target.value)} rows={2} placeholder="• Waiting for...&#10;• Need approval for..." className="mt-1" />
          </div>
          <div>
            <Label className="text-xs flex items-center gap-1"><ArrowRight className="h-3 w-3 text-blue-500" /> What's planned for tomorrow?</Label>
            <Textarea value={planned} onChange={e => setPlanned(e.target.value)} rows={3} placeholder="• Morning: ...&#10;• Afternoon: ...&#10;• Priority: ..." className="mt-1" />
          </div>
          <Button onClick={submitStandup} className="w-full bg-orange-600 hover:bg-orange-700">
            {hasTodayEntry ? "Update Standup" : "Submit Standup"}
          </Button>
        </CardContent>
      </Card>

      {/* History */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold">Previous Reports</h2>
        {entries.map(e => (
          <Card key={e.id}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2"><Badge variant="outline" className="text-[9px]">{e.date}</Badge>{e.date === today && <Badge className="text-[9px] bg-green-100 text-green-700">Today</Badge>}</div>
              {e.done && <div><p className="text-[10px] font-bold text-green-700 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Done</p><p className="text-xs whitespace-pre-line ml-4">{e.done}</p></div>}
              {e.blocked && <div><p className="text-[10px] font-bold text-amber-700 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Blocked</p><p className="text-xs whitespace-pre-line ml-4">{e.blocked}</p></div>}
              {e.planned && <div><p className="text-[10px] font-bold text-blue-700 flex items-center gap-1"><ArrowRight className="h-3 w-3" /> Planned</p><p className="text-xs whitespace-pre-line ml-4">{e.planned}</p></div>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TaskTrackerStandup;
