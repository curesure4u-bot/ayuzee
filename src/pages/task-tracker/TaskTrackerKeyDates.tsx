import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Calendar, Plus, Trash2, Gift, Clock, AlertTriangle, Star } from "lucide-react";

type KeyDate = {
  id: string;
  title: string;
  date: string;
  type: "birthday" | "anniversary" | "renewal" | "deadline" | "event" | "custom";
  recurring_yearly: boolean;
  notes: string;
};

const uid = () => crypto.randomUUID();
const TYPE_CONFIG: Record<string, { emoji: string; color: string }> = {
  birthday: { emoji: "🎂", color: "bg-pink-100 text-pink-700" },
  anniversary: { emoji: "💍", color: "bg-rose-100 text-rose-700" },
  renewal: { emoji: "🔄", color: "bg-amber-100 text-amber-700" },
  deadline: { emoji: "⏰", color: "bg-red-100 text-red-700" },
  event: { emoji: "📅", color: "bg-blue-100 text-blue-700" },
  custom: { emoji: "⭐", color: "bg-purple-100 text-purple-700" },
};

const sampleDates: KeyDate[] = [
  { id: uid(), title: "Medical License Renewal", date: "2025-08-15", type: "renewal", recurring_yearly: true, notes: "Submit 3 months before expiry" },
  { id: uid(), title: "Dr. Kavitha's Birthday", date: "2025-06-22", type: "birthday", recurring_yearly: true, notes: "Colleague — send wishes" },
  { id: uid(), title: "Clinic Anniversary", date: "2025-09-01", type: "anniversary", recurring_yearly: true, notes: "3rd year! Plan celebration for patients" },
  { id: uid(), title: "CME Credits Deadline", date: "2025-12-31", type: "deadline", recurring_yearly: true, notes: "Need 40 points by year end" },
  { id: uid(), title: "Insurance Policy Renewal", date: "2025-07-10", type: "renewal", recurring_yearly: true, notes: "Compare rates before renewing" },
  { id: uid(), title: "Mom's Birthday", date: "2025-11-05", type: "birthday", recurring_yearly: true, notes: "" },
  { id: uid(), title: "AYUSH Conference 2025", date: "2025-10-18", type: "event", recurring_yearly: false, notes: "Submit abstract by Sep 1" },
  { id: uid(), title: "Staff Training Day", date: "2025-06-01", type: "event", recurring_yearly: false, notes: "Quarterly skill upgrade session" },
];

const TaskTrackerKeyDates = () => {
  const [dates, setDates] = useState<KeyDate[]>(sampleDates);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: "", date: "", type: "custom" as KeyDate["type"], recurring_yearly: false, notes: "" });

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  // Calculate days until each date
  const datesWithCountdown = useMemo(() => {
    return dates.map(d => {
      let targetDate = new Date(d.date);
      // For recurring yearly, find next occurrence
      if (d.recurring_yearly) {
        targetDate.setFullYear(today.getFullYear());
        if (targetDate < today) targetDate.setFullYear(today.getFullYear() + 1);
      }
      const daysUntil = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return { ...d, daysUntil, nextDate: targetDate.toISOString().split("T")[0] };
    }).sort((a, b) => a.daysUntil - b.daysUntil);
  }, [dates, todayStr]);

  const upcoming = datesWithCountdown.filter(d => d.daysUntil >= 0 && d.daysUntil <= 30);
  const thisWeek = datesWithCountdown.filter(d => d.daysUntil >= 0 && d.daysUntil <= 7);

  const addDate = () => {
    if (!form.title.trim() || !form.date) { toast.error("Title and date required"); return; }
    setDates(prev => [...prev, { id: uid(), ...form }]);
    setDialogOpen(false);
    setForm({ title: "", date: "", type: "custom", recurring_yearly: false, notes: "" });
    toast.success("Date added");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2"><Calendar className="h-6 w-6 text-rose-600" /> Key Dates & Birthdays</h1>
          <p className="text-sm text-muted-foreground">Never miss important dates — auto countdown & reminders</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-rose-600 hover:bg-rose-700"><Plus className="mr-1 h-4 w-4" /> Add Date</Button>
      </div>

      {/* This Week Alert */}
      {thisWeek.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/30">
          <CardContent className="p-4">
            <p className="text-sm font-bold text-amber-700 flex items-center gap-1 mb-2"><AlertTriangle className="h-4 w-4" /> This Week ({thisWeek.length})</p>
            <div className="space-y-1">
              {thisWeek.map(d => (
                <div key={d.id} className="flex items-center gap-2 text-xs">
                  <span>{TYPE_CONFIG[d.type].emoji}</span>
                  <span className="font-medium">{d.title}</span>
                  <Badge className="ml-auto text-[9px] bg-amber-200 text-amber-800">{d.daysUntil === 0 ? "TODAY!" : `${d.daysUntil} days`}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming 30 days */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Upcoming (Next 30 Days)</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {upcoming.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">No dates in the next 30 days</p>
            ) : upcoming.map(d => (
              <div key={d.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                <div className={`h-10 w-10 rounded-lg grid place-items-center text-lg ${TYPE_CONFIG[d.type].color}`}>
                  {TYPE_CONFIG[d.type].emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{d.title}</p>
                  <div className="flex gap-2 mt-0.5">
                    <Badge variant="outline" className="text-[9px]">{d.type}</Badge>
                    <span className="text-[10px] text-muted-foreground">{d.nextDate}</span>
                    {d.recurring_yearly && <Badge variant="secondary" className="text-[9px]">Yearly</Badge>}
                  </div>
                  {d.notes && <p className="text-[10px] text-muted-foreground mt-0.5">{d.notes}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-lg font-bold ${d.daysUntil <= 3 ? "text-red-600" : d.daysUntil <= 7 ? "text-amber-600" : "text-teal-600"}`}>{d.daysUntil}</p>
                  <p className="text-[9px] text-muted-foreground">days</p>
                </div>
                <Button size="icon" variant="ghost" className="h-6 w-6 text-red-400" onClick={() => { setDates(prev => prev.filter(x => x.id !== d.id)); }}><Trash2 className="h-3 w-3" /></Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All Dates */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">All Key Dates ({dates.length})</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[300px] overflow-y-auto">
            {datesWithCountdown.map(d => (
              <div key={d.id} className="flex items-center gap-2 px-4 py-2 border-b last:border-0 text-xs hover:bg-muted/30">
                <span>{TYPE_CONFIG[d.type].emoji}</span>
                <span className="font-medium flex-1">{d.title}</span>
                <Badge className={`text-[9px] ${TYPE_CONFIG[d.type].color}`}>{d.type}</Badge>
                <span className="text-muted-foreground">{d.nextDate}</span>
                <span className={`font-bold ${d.daysUntil < 0 ? "text-gray-400" : d.daysUntil <= 7 ? "text-red-600" : ""}`}>{d.daysUntil}d</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="text-rose-600">Add Key Date</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g., Mom's Birthday" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date *</Label><Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
              <div><Label>Type</Label><Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as any }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.keys(TYPE_CONFIG).map(t => <SelectItem key={t} value={t}>{TYPE_CONFIG[t].emoji} {t}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <label className="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" checked={form.recurring_yearly} onChange={e => setForm(f => ({ ...f, recurring_yearly: e.target.checked }))} className="rounded" /> Repeats every year</label>
            <div><Label>Notes</Label><Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional reminder notes" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={addDate} className="bg-rose-600 hover:bg-rose-700">Add</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskTrackerKeyDates;
