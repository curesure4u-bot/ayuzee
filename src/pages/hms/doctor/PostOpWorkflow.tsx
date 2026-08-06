import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Activity, CheckCircle2, Clock, AlertCircle, Users } from "lucide-react";
import { useState } from "react";

type TaskStatus = "done" | "due" | "overdue";
type DayTask = { task: string; status: TaskStatus };
type Patient = {
  name: string; procedure: string; day: number; nextAction: string;
  dayTasks: DayTask[];
  dischargeCriteria: { label: string; met: boolean }[];
  samsarjana?: { currentDay: string; restrictions: string; daysLeft: number };
};

const patients: Patient[] = [
  {
    name: "Mr. Rajesh Kumar", procedure: "Ksharasutra", day: 3, nextAction: "Wound check + Dressing",
    dayTasks: [
      { task: "Vitals", status: "done" }, { task: "Wound check", status: "due" },
      { task: "Dressing change", status: "due" }, { task: "Diet progression", status: "done" },
      { task: "Pain assessment", status: "done" }, { task: "Complications screen", status: "due" },
    ],
    dischargeCriteria: [
      { label: "No active bleeding", met: true }, { label: "Pain < 3/10", met: true },
      { label: "No signs of infection", met: true }, { label: "Tolerating diet", met: true },
      { label: "Thread check normal", met: false },
    ],
  },
  {
    name: "Mrs. Lakshmi Devi", procedure: "Vamana", day: 5, nextAction: "Samsarjana Krama - Vilepi",
    dayTasks: [
      { task: "Vitals", status: "done" }, { task: "Wound check", status: "done" },
      { task: "Dressing change", status: "done" }, { task: "Diet progression", status: "done" },
      { task: "Pain assessment", status: "done" }, { task: "Complications screen", status: "done" },
    ],
    dischargeCriteria: [
      { label: "Appetite restored", met: true }, { label: "No nausea/vomiting", met: true },
      { label: "Samsarjana complete", met: false }, { label: "Pathya counseling done", met: true },
      { label: "Follow-up scheduled", met: true },
    ],
    samsarjana: { currentDay: "Vilepi (Day 2)", restrictions: "No spicy, oily, heavy food", daysLeft: 3 },
  },
  {
    name: "Mr. Suresh Babu", procedure: "Agnikarma", day: 1, nextAction: "Vitals + Pain assessment",
    dayTasks: [
      { task: "Vitals", status: "due" }, { task: "Wound check", status: "due" },
      { task: "Dressing change", status: "overdue" }, { task: "Diet progression", status: "due" },
      { task: "Pain assessment", status: "overdue" }, { task: "Complications screen", status: "due" },
    ],
    dischargeCriteria: [
      { label: "No blistering", met: false }, { label: "Pain < 4/10", met: false },
      { label: "No infection signs", met: true }, { label: "Ghrita application tolerated", met: true },
      { label: "Patient counseled", met: false },
    ],
  },
];

const statusIcon = (s: TaskStatus) => {
  if (s === "done") return <CheckCircle2 className="h-4 w-4 text-green-600" />;
  if (s === "due") return <Clock className="h-4 w-4 text-amber-600" />;
  return <AlertCircle className="h-4 w-4 text-red-600" />;
};

const PostOpWorkflow = () => {
  const [completed, setCompleted] = useState<Record<string, Set<string>>>({});

  const markComplete = (pName: string, task: string) => {
    setCompleted((prev) => {
      const s = new Set(prev[pName] || []);
      s.add(task);
      return { ...prev, [pName]: s };
    });
    toast.success(`${task} marked complete`);
  };

  const allGreen = (p: Patient) => p.dischargeCriteria.every((c) => c.met);

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="h-6 w-6" /> Post-Op / Post-Panchakarma Care
        </h1>
        <Badge variant="outline" className="text-xs">
          <Users className="h-3 w-3 mr-1" /> {patients.length} Active
        </Badge>
      </div>

      {/* Patient List Overview */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Active Post-Op Patients</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-xs">
            <thead className="border-b">
              <tr><th className="text-left py-2">Patient</th><th className="text-left py-2">Procedure</th><th className="text-center py-2">Day</th><th className="text-left py-2">Next Action</th></tr>
            </thead>
            <tbody>{patients.map((p) => (
              <tr key={p.name} className="border-b hover:bg-muted/50">
                <td className="py-2 font-medium">{p.name}</td>
                <td className="py-2"><Badge variant="outline" className="text-[9px]">{p.procedure}</Badge></td>
                <td className="py-2 text-center font-bold">{p.day}</td>
                <td className="py-2 text-muted-foreground">{p.nextAction}</td>
              </tr>
            ))}</tbody>
          </table>
        </CardContent>
      </Card>

      {/* Per-Patient Workflow Cards */}
      {patients.map((p) => (
        <Card key={p.name} className="border-l-4 border-l-primary/60">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">{p.name}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[9px]">{p.procedure}</Badge>
                <Badge className="bg-blue-100 text-blue-700 text-[9px]">Day {p.day}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Day-wise checklist */}
            <div>
              <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1">Day {p.day} Checklist</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {p.dayTasks.map((t) => {
                  const isDone = t.status === "done" || completed[p.name]?.has(t.task);
                  return (
                    <div key={t.task} className="flex items-center gap-2 border rounded-md p-2">
                      {isDone ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : statusIcon(t.status)}
                      <span className={`text-xs flex-1 ${isDone ? "line-through text-muted-foreground" : ""}`}>{t.task}</span>
                      {!isDone && (
                        <Button size="sm" variant="ghost" className="h-5 px-1 text-[9px]" onClick={() => markComplete(p.name, t.task)}>Done</Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Samsarjana Krama (AYUSH-specific) */}
            {p.samsarjana && (
              <div className="bg-green-50 border border-green-200 rounded-md p-2">
                <p className="text-[10px] font-semibold text-green-800 mb-1">Samsarjana Krama (Post-PK Diet Tracker)</p>
                <div className="flex items-center gap-4 text-xs">
                  <span>Stage: <strong>{p.samsarjana.currentDay}</strong></span>
                  <span>Days left: <strong>{p.samsarjana.daysLeft}</strong></span>
                </div>
                <p className="text-[10px] text-green-700 mt-1">Pathya: {p.samsarjana.restrictions}</p>
                <div className="flex gap-1 mt-2">
                  {["Peya", "Vilepi", "Yusha", "Normal"].map((stage, i) => (
                    <Badge key={stage} className={`text-[8px] ${i <= 1 ? "bg-green-200 text-green-800" : "bg-gray-100 text-gray-600"}`}>{stage}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Discharge Criteria */}
            <div>
              <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1">Discharge Criteria</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                {p.dischargeCriteria.map((c) => (
                  <div key={c.label} className="flex items-center gap-1 text-xs">
                    {c.met ? <CheckCircle2 className="h-3 w-3 text-green-600" /> : <AlertCircle className="h-3 w-3 text-red-500" />}
                    <span className={c.met ? "text-green-700" : "text-red-600"}>{c.label}</span>
                  </div>
                ))}
              </div>
              <Button
                size="sm" className="mt-2" disabled={!allGreen(p)}
                onClick={() => toast.success(`${p.name} marked ready for discharge`)}
              >
                {allGreen(p) ? "Ready for Discharge" : "Criteria Not Met"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PostOpWorkflow;
