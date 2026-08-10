import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Calendar, Plus, Trash2, Target, CheckCircle } from "lucide-react";

type QuarterGoal = { id: string; text: string; done: boolean };
type MonthNote = { month: number; note: string; highlight: string };

const uid = () => crypto.randomUUID();
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const QUARTERS = ["Q1 (Jan-Mar)", "Q2 (Apr-Jun)", "Q3 (Jul-Sep)", "Q4 (Oct-Dec)"];

const TaskTrackerYearlyPlanner = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [yearTheme, setYearTheme] = useState("Growth & Service — Build the clinic, deepen clinical skills, publish research");
  const [quarterGoals, setQuarterGoals] = useState<QuarterGoal[][]>([
    [{ id: uid(), text: "Launch Panchakarma specialty program", done: false }, { id: uid(), text: "Hire 2nd therapist", done: true }, { id: uid(), text: "Complete 150 consultations", done: false }],
    [{ id: uid(), text: "Publish 2 research papers", done: false }, { id: uid(), text: "Attend AYUSH national conference", done: false }, { id: uid(), text: "Start online consultations", done: false }],
    [{ id: uid(), text: "Patient base: 500+ active", done: false }, { id: uid(), text: "Revenue: ₹5L/month target", done: false }, { id: uid(), text: "Train interns (batch 2)", done: false }],
    [{ id: uid(), text: "Year-end review & planning", done: false }, { id: uid(), text: "Staff appreciation event", done: false }, { id: uid(), text: "Prepare next year roadmap", done: false }],
  ]);
  const [monthNotes, setMonthNotes] = useState<MonthNote[]>(
    MONTHS.map((_, i) => ({ month: i, note: "", highlight: "" }))
  );
  const [newGoalText, setNewGoalText] = useState("");
  const [activeQuarter, setActiveQuarter] = useState(Math.floor(new Date().getMonth() / 3));

  const currentMonth = new Date().getMonth();
  const overallProgress = (() => {
    const all = quarterGoals.flat();
    if (all.length === 0) return 0;
    return Math.round((all.filter(g => g.done).length / all.length) * 100);
  })();

  const addGoal = (qi: number) => {
    if (!newGoalText.trim()) return;
    setQuarterGoals(prev => prev.map((q, i) => i === qi ? [...q, { id: uid(), text: newGoalText, done: false }] : q));
    setNewGoalText("");
  };

  const toggleGoal = (qi: number, goalId: string) => {
    setQuarterGoals(prev => prev.map((q, i) => i === qi ? q.map(g => g.id === goalId ? { ...g, done: !g.done } : g) : q));
  };

  const deleteGoal = (qi: number, goalId: string) => {
    setQuarterGoals(prev => prev.map((q, i) => i === qi ? q.filter(g => g.id !== goalId) : q));
  };

  const updateMonthNote = (monthIdx: number, field: "note" | "highlight", value: string) => {
    setMonthNotes(prev => prev.map(m => m.month === monthIdx ? { ...m, [field]: value } : m));
  };

  const quarterColors = ["bg-blue-50 border-blue-200", "bg-green-50 border-green-200", "bg-amber-50 border-amber-200", "bg-purple-50 border-purple-200"];
  const quarterTextColors = ["text-blue-700", "text-green-700", "text-amber-700", "text-purple-700"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2"><Calendar className="h-6 w-6 text-indigo-600" /> Yearly Planner</h1>
          <p className="text-sm text-muted-foreground">12-month bird's eye view with quarterly goals</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setYear(y => y - 1)}>←</Button>
          <Badge variant="outline" className="text-lg px-3 py-1 font-bold">{year}</Badge>
          <Button variant="outline" size="sm" onClick={() => setYear(y => y + 1)}>→</Button>
        </div>
      </div>

      {/* Year Theme */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardContent className="p-4">
          <p className="text-xs font-bold uppercase text-indigo-600 mb-1">Year Theme / Word</p>
          <Input value={yearTheme} onChange={e => setYearTheme(e.target.value)} className="border-0 bg-transparent text-sm font-medium text-indigo-800 focus-visible:ring-0 p-0" />
        </CardContent>
      </Card>

      {/* Overall Progress */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium">Annual Progress:</span>
        <Progress value={overallProgress} className="h-3 flex-1 max-w-sm" />
        <span className="text-sm font-bold text-indigo-700">{overallProgress}%</span>
        <Badge variant="outline">{quarterGoals.flat().filter(g => g.done).length}/{quarterGoals.flat().length} goals</Badge>
      </div>

      {/* Quarterly Goals */}
      <div className="grid gap-4 sm:grid-cols-2">
        {QUARTERS.map((qLabel, qi) => {
          const goals = quarterGoals[qi];
          const doneCount = goals.filter(g => g.done).length;
          const isCurrentQ = qi === activeQuarter;
          return (
            <Card key={qi} className={`${quarterColors[qi]} ${isCurrentQ ? "ring-2 ring-indigo-400" : ""}`}>
              <CardHeader className="pb-2">
                <CardTitle className={`text-sm ${quarterTextColors[qi]}`}>
                  {qLabel} {isCurrentQ && <Badge className="ml-2 text-[9px]">Current</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Progress value={goals.length > 0 ? (doneCount / goals.length) * 100 : 0} className="h-1.5" />
                <div className="space-y-1">
                  {goals.map(g => (
                    <div key={g.id} className="flex items-center gap-2 text-xs">
                      <input type="checkbox" checked={g.done} onChange={() => toggleGoal(qi, g.id)} className="rounded" />
                      <span className={`flex-1 ${g.done ? "line-through text-muted-foreground" : ""}`}>{g.text}</span>
                      <button onClick={() => deleteGoal(qi, g.id)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100"><Trash2 className="h-3 w-3" /></button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-1 mt-2">
                  <Input value={qi === activeQuarter ? newGoalText : ""} onChange={e => { setActiveQuarter(qi); setNewGoalText(e.target.value); }} onKeyDown={e => e.key === "Enter" && addGoal(qi)} placeholder="Add goal..." className="h-6 text-[10px]" onFocus={() => setActiveQuarter(qi)} />
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => addGoal(qi)}><Plus className="h-3 w-3" /></Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 12-Month Grid */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Monthly Overview</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {MONTHS.map((month, i) => {
              const isCurrent = i === currentMonth;
              const mn = monthNotes.find(m => m.month === i);
              return (
                <div key={i} className={`rounded-lg border p-2 text-center ${isCurrent ? "ring-2 ring-indigo-400 bg-indigo-50" : "hover:bg-muted/30"}`}>
                  <p className={`text-xs font-bold ${isCurrent ? "text-indigo-700" : ""}`}>{month.slice(0, 3)}</p>
                  <Input
                    value={mn?.highlight || ""}
                    onChange={e => updateMonthNote(i, "highlight", e.target.value)}
                    placeholder="Key focus..."
                    className="h-5 text-[9px] border-0 bg-transparent text-center focus-visible:ring-0 p-0 mt-1"
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskTrackerYearlyPlanner;
