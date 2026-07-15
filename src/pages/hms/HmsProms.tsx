import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Smartphone, TrendingUp, CheckCircle, Calendar, Pill,
  Activity, AlertTriangle, Users, BarChart3,
} from "lucide-react";

type DailyLog = {
  date: string;
  painScore: number;
  stiffness: number;
  sleep: number;
  energy: number;
  mood: number;
  medicinesTaken: boolean;
  exerciseDone: boolean;
  dietFollowed: boolean;
  sideEffects: string;
  notes: string;
};

type PatientProm = {
  id: string; patient: string; condition: string;
  adherenceRate: number; logsThisWeek: number; totalLogs: number;
  trend: "improving" | "stable" | "worsening";
  latestSymptoms: { label: string; score: number; max: number; trend: string }[];
};

const mockLogs: DailyLog[] = [
  { date: "2026-07-15", painScore: 3, stiffness: 2, sleep: 7, energy: 6, mood: 7, medicinesTaken: true, exerciseDone: true, dietFollowed: true, sideEffects: "None", notes: "Feeling much better after Janu Basti" },
  { date: "2026-07-14", painScore: 4, stiffness: 3, sleep: 6, energy: 5, mood: 6, medicinesTaken: true, exerciseDone: true, dietFollowed: true, sideEffects: "None", notes: "" },
  { date: "2026-07-13", painScore: 4, stiffness: 3, sleep: 7, energy: 6, mood: 7, medicinesTaken: true, exerciseDone: false, dietFollowed: true, sideEffects: "None", notes: "Skipped exercise due to rain" },
  { date: "2026-07-12", painScore: 5, stiffness: 4, sleep: 5, energy: 5, mood: 5, medicinesTaken: true, exerciseDone: true, dietFollowed: false, sideEffects: "Mild acidity", notes: "Had curd at night - acidity" },
  { date: "2026-07-11", painScore: 5, stiffness: 4, sleep: 6, energy: 5, mood: 6, medicinesTaken: true, exerciseDone: true, dietFollowed: true, sideEffects: "None", notes: "" },
  { date: "2026-07-10", painScore: 6, stiffness: 5, sleep: 5, energy: 4, mood: 5, medicinesTaken: false, exerciseDone: false, dietFollowed: false, sideEffects: "None", notes: "Travelling - missed medicines" },
  { date: "2026-07-09", painScore: 5, stiffness: 4, sleep: 6, energy: 5, mood: 6, medicinesTaken: true, exerciseDone: true, dietFollowed: true, sideEffects: "None", notes: "" },
];

const mockPatients: PatientProm[] = [
  { id: "1", patient: "Ramesh Kumar", condition: "Sandhivata (OA Knee)", adherenceRate: 86, logsThisWeek: 6, totalLogs: 35, trend: "improving", latestSymptoms: [{ label: "Pain", score: 3, max: 10, trend: "↓" }, { label: "Stiffness", score: 2, max: 10, trend: "↓" }, { label: "Sleep", score: 7, max: 10, trend: "↑" }] },
  { id: "2", patient: "Lakshmi Devi", condition: "Gridhrasi (Sciatica)", adherenceRate: 92, logsThisWeek: 7, totalLogs: 21, trend: "improving", latestSymptoms: [{ label: "Pain", score: 4, max: 10, trend: "↓" }, { label: "Numbness", score: 3, max: 10, trend: "↓" }, { label: "Mobility", score: 6, max: 10, trend: "↑" }] },
  { id: "3", patient: "Sunil Menon", condition: "Amavata (RA)", adherenceRate: 71, logsThisWeek: 5, totalLogs: 42, trend: "stable", latestSymptoms: [{ label: "Pain", score: 5, max: 10, trend: "→" }, { label: "Morning stiffness", score: 5, max: 10, trend: "↓" }, { label: "Swelling", score: 4, max: 10, trend: "→" }] },
  { id: "4", patient: "Meera Nair", condition: "Kushtha (Psoriasis)", adherenceRate: 95, logsThisWeek: 7, totalLogs: 28, trend: "improving", latestSymptoms: [{ label: "Itching", score: 2, max: 10, trend: "↓" }, { label: "Scaling", score: 3, max: 10, trend: "↓" }, { label: "Area affected", score: 2, max: 10, trend: "↓" }] },
];

const HmsProms = () => {
  const [patients] = useState<PatientProm[]>(mockPatients);
  const [logs] = useState<DailyLog[]>(mockLogs);
  const [selectedPatient, setSelectedPatient] = useState<PatientProm>(patients[0]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Smartphone className="h-6 w-6 text-pink-600" /> Patient-Reported Outcomes (PROMs)
          </h1>
          <p className="text-sm text-muted-foreground">Daily symptom logs by patients, treatment adherence, efficacy tracking vs baseline</p>
        </div>
        <Badge className="bg-pink-100 text-pink-700 border-pink-300">Patient Self-Reporting</Badge>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><Users className="h-5 w-5 mx-auto text-blue-600" /><p className="text-xl font-bold mt-1">{patients.length}</p><p className="text-xs text-muted-foreground">Active Reporters</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><CheckCircle className="h-5 w-5 mx-auto text-green-600" /><p className="text-xl font-bold mt-1">{Math.round(patients.reduce((s, p) => s + p.adherenceRate, 0) / patients.length)}%</p><p className="text-xs text-muted-foreground">Avg Adherence</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><TrendingUp className="h-5 w-5 mx-auto text-emerald-600" /><p className="text-xl font-bold mt-1">{patients.filter(p => p.trend === "improving").length}/{patients.length}</p><p className="text-xs text-muted-foreground">Improving</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Calendar className="h-5 w-5 mx-auto text-purple-600" /><p className="text-xl font-bold mt-1">{patients.reduce((s, p) => s + p.totalLogs, 0)}</p><p className="text-xs text-muted-foreground">Total Logs</p></CardContent></Card>
      </div>

      <Tabs defaultValue="dashboard">
        <TabsList className="grid grid-cols-2 sm:grid-cols-3 w-full">
          <TabsTrigger value="dashboard">Patient Dashboard</TabsTrigger>
          <TabsTrigger value="logs">Daily Logs</TabsTrigger>
          <TabsTrigger value="entry">New Entry (Demo)</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Patient List */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Active Patients Reporting</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {patients.map((p) => (
                  <div key={p.id} className={`p-3 rounded-lg border cursor-pointer transition ${selectedPatient.id === p.id ? "border-primary bg-primary/5" : "hover:bg-muted/30"}`} onClick={() => setSelectedPatient(p)}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm">{p.patient}</p>
                        <p className="text-xs text-muted-foreground">{p.condition}</p>
                      </div>
                      <Badge variant={p.trend === "improving" ? "outline" : p.trend === "worsening" ? "destructive" : "secondary"} className={`text-xs capitalize ${p.trend === "improving" ? "text-green-600" : ""}`}>{p.trend}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span>Adherence: <strong>{p.adherenceRate}%</strong></span>
                      <span>Logs: <strong>{p.logsThisWeek}/7</strong> this week</span>
                    </div>
                    <Progress value={p.adherenceRate} className="h-1.5 mt-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Selected Patient Symptoms */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4" /> {selectedPatient.patient} — Latest Symptoms</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {selectedPatient.latestSymptoms.map((s) => (
                    <div key={s.label}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>{s.label}</span>
                        <div className="flex items-center gap-1">
                          <span className="font-bold">{s.score}/{s.max}</span>
                          <span className={s.trend === "↓" ? "text-green-600" : s.trend === "↑" ? "text-red-600" : "text-muted-foreground"}>{s.trend}</span>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3">
                        <div className={`h-3 rounded-full ${s.score <= 3 ? "bg-green-500" : s.score <= 6 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${(s.score / s.max) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2 pt-3 border-t">
                  <div className="text-center p-2 rounded bg-green-50 border border-green-200">
                    <Pill className="h-4 w-4 mx-auto text-green-600" />
                    <p className="text-[10px] mt-1 font-medium">Medicines</p>
                    <p className="text-xs text-green-700">{selectedPatient.adherenceRate}%</p>
                  </div>
                  <div className="text-center p-2 rounded bg-blue-50 border border-blue-200">
                    <Activity className="h-4 w-4 mx-auto text-blue-600" />
                    <p className="text-[10px] mt-1 font-medium">Exercise</p>
                    <p className="text-xs text-blue-700">71%</p>
                  </div>
                  <div className="text-center p-2 rounded bg-amber-50 border border-amber-200">
                    <CheckCircle className="h-4 w-4 mx-auto text-amber-600" />
                    <p className="text-[10px] mt-1 font-medium">Diet (Pathya)</p>
                    <p className="text-xs text-amber-700">86%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Daily Symptom Log — {selectedPatient.patient}</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-2 py-2 text-left font-medium">Date</th>
                      <th className="px-2 py-2 text-center font-medium">Pain</th>
                      <th className="px-2 py-2 text-center font-medium">Stiffness</th>
                      <th className="px-2 py-2 text-center font-medium">Sleep</th>
                      <th className="px-2 py-2 text-center font-medium">Energy</th>
                      <th className="px-2 py-2 text-center font-medium">Mood</th>
                      <th className="px-2 py-2 text-center font-medium">Meds</th>
                      <th className="px-2 py-2 text-center font-medium">Exercise</th>
                      <th className="px-2 py-2 text-center font-medium">Diet</th>
                      <th className="px-2 py-2 text-left font-medium">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.date} className="border-b hover:bg-muted/30">
                        <td className="px-2 py-2 font-mono">{log.date.slice(5)}</td>
                        <td className="px-2 py-2 text-center"><Badge className={`text-[9px] ${log.painScore <= 3 ? "bg-green-100 text-green-700" : log.painScore <= 6 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{log.painScore}</Badge></td>
                        <td className="px-2 py-2 text-center"><Badge className={`text-[9px] ${log.stiffness <= 3 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{log.stiffness}</Badge></td>
                        <td className="px-2 py-2 text-center">{log.sleep}h</td>
                        <td className="px-2 py-2 text-center">{log.energy}/10</td>
                        <td className="px-2 py-2 text-center">{log.mood}/10</td>
                        <td className="px-2 py-2 text-center">{log.medicinesTaken ? <CheckCircle className="h-3 w-3 text-green-500 mx-auto" /> : <AlertTriangle className="h-3 w-3 text-red-500 mx-auto" />}</td>
                        <td className="px-2 py-2 text-center">{log.exerciseDone ? <CheckCircle className="h-3 w-3 text-green-500 mx-auto" /> : <AlertTriangle className="h-3 w-3 text-amber-500 mx-auto" />}</td>
                        <td className="px-2 py-2 text-center">{log.dietFollowed ? <CheckCircle className="h-3 w-3 text-green-500 mx-auto" /> : <AlertTriangle className="h-3 w-3 text-amber-500 mx-auto" />}</td>
                        <td className="px-2 py-2 text-muted-foreground">{log.notes || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entry" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Smartphone className="h-4 w-4" /> Patient Daily Log Entry (Mobile-Friendly)</CardTitle></CardHeader>
            <CardContent className="max-w-md mx-auto space-y-4">
              <p className="text-xs text-muted-foreground text-center">This form is what patients fill daily from their WhatsApp link or mobile app</p>
              <div>
                <Label>How is your pain today? (0 = no pain, 10 = worst)</Label>
                <Slider defaultValue={[3]} max={10} step={1} className="mt-2" />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>No pain</span><span>Worst pain</span></div>
              </div>
              <div>
                <Label>Stiffness level (0-10)</Label>
                <Slider defaultValue={[2]} max={10} step={1} className="mt-2" />
              </div>
              <div>
                <Label>Hours of sleep last night</Label>
                <Input type="number" defaultValue="7" className="mt-1" />
              </div>
              <div>
                <Label>Energy level (0-10)</Label>
                <Slider defaultValue={[6]} max={10} step={1} className="mt-2" />
              </div>
              <div>
                <Label>Mood (0-10)</Label>
                <Slider defaultValue={[7]} max={10} step={1} className="mt-2" />
              </div>
              <div className="space-y-2 pt-2 border-t">
                <Label className="font-medium">Adherence Checklist</Label>
                <label className="flex items-center gap-2 text-sm"><Checkbox defaultChecked /><span>Took all medicines on time</span></label>
                <label className="flex items-center gap-2 text-sm"><Checkbox defaultChecked /><span>Did prescribed exercises / yoga</span></label>
                <label className="flex items-center gap-2 text-sm"><Checkbox defaultChecked /><span>Followed Pathya diet</span></label>
                <label className="flex items-center gap-2 text-sm"><Checkbox /><span>Applied oil / external therapy</span></label>
              </div>
              <div>
                <Label>Any side effects?</Label>
                <Input placeholder="None / Describe any issues..." className="mt-1" />
              </div>
              <div>
                <Label>Notes (optional)</Label>
                <Input placeholder="How are you feeling overall?" className="mt-1" />
              </div>
              <Button className="w-full" onClick={() => toast.success("Daily log submitted! Thank you.")}>
                Submit Today's Log
              </Button>
              <p className="text-[10px] text-muted-foreground text-center">Submitted via WhatsApp link or Ayuzee Patient App</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HmsProms;
