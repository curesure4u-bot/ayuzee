import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { CheckCircle2, AlertTriangle, Activity, TrendingUp, Plus } from "lucide-react";

type QCRun = {
  id: string;
  test: string;
  level: string;
  date: string;
  value: number;
  mean: number;
  sd: number;
  status: "pass" | "warning" | "fail";
};

const mockQCRuns: QCRun[] = [
  { id: "1", test: "Glucose", level: "Level 1 (Normal)", date: "2026-08-07 08:00", value: 98, mean: 100, sd: 5, status: "pass" },
  { id: "2", test: "Glucose", level: "Level 2 (High)", date: "2026-08-07 08:00", value: 248, mean: 250, sd: 8, status: "pass" },
  { id: "3", test: "Creatinine", level: "Level 1", date: "2026-08-07 08:15", value: 1.05, mean: 1.0, sd: 0.05, status: "pass" },
  { id: "4", test: "Creatinine", level: "Level 2", date: "2026-08-07 08:15", value: 4.8, mean: 4.5, sd: 0.15, status: "warning" },
  { id: "5", test: "Hemoglobin", level: "Level 1", date: "2026-08-07 07:45", value: 12.2, mean: 12.5, sd: 0.3, status: "pass" },
  { id: "6", test: "Hemoglobin", level: "Level 2", date: "2026-08-07 07:45", value: 8.1, mean: 8.0, sd: 0.2, status: "pass" },
  { id: "7", test: "ESR", level: "Level 1", date: "2026-08-06 08:00", value: 12, mean: 10, sd: 2, status: "pass" },
  { id: "8", test: "Total Cholesterol", level: "Level 1", date: "2026-08-06 08:30", value: 215, mean: 200, sd: 6, status: "fail" },
];

const QualityControl = () => {
  const [filterTest, setFilterTest] = useState("all");
  const passCount = mockQCRuns.filter(r => r.status === "pass").length;
  const passRate = Math.round((passCount / mockQCRuns.length) * 100);

  const filtered = filterTest === "all"
    ? mockQCRuns
    : mockQCRuns.filter(r => r.test === filterTest);

  const tests = [...new Set(mockQCRuns.map(r => r.test))];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Activity className="h-5 w-5 text-orange-600" /> Quality Control
          </h2>
          <p className="text-sm text-muted-foreground">
            Internal QC (IQC), Levy-Jennings tracking, Westgard rules & EQAS
          </p>
        </div>
        <Button size="sm" onClick={() => toast.success("New QC run recorded")}>
          <Plus className="mr-1 h-3 w-3" /> Record QC Run
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <CheckCircle2 className="h-5 w-5 mx-auto text-green-600" />
            <p className="text-2xl font-bold mt-1 text-green-600">{passRate}%</p>
            <p className="text-xs text-muted-foreground">IQC Pass Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <AlertTriangle className="h-5 w-5 mx-auto text-amber-600" />
            <p className="text-2xl font-bold mt-1 text-amber-600">
              {mockQCRuns.filter(r => r.status === "warning").length}
            </p>
            <p className="text-xs text-muted-foreground">Warnings (1-2 SD)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <AlertTriangle className="h-5 w-5 mx-auto text-red-600" />
            <p className="text-2xl font-bold mt-1 text-red-600">
              {mockQCRuns.filter(r => r.status === "fail").length}
            </p>
            <p className="text-xs text-muted-foreground">Failures ({">"} 2 SD)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Badge className="bg-green-600">EQAS</Badge>
            <p className="text-lg font-bold mt-1">Active</p>
            <p className="text-xs text-muted-foreground">External QA</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="runs">
        <TabsList className="grid grid-cols-2 sm:grid-cols-3 w-full">
          <TabsTrigger value="runs">QC Runs</TabsTrigger>
          <TabsTrigger value="lj">Levy-Jennings</TabsTrigger>
          <TabsTrigger value="eqas">EQAS Records</TabsTrigger>
        </TabsList>

        <TabsContent value="runs" className="space-y-4">
          <div className="flex items-center gap-3">
            <Select value={filterTest} onValueChange={setFilterTest}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Tests" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tests</SelectItem>
                {tests.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">{filtered.length} runs</span>
          </div>

          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Test</th>
                    <th className="px-3 py-2 text-left font-medium">Level</th>
                    <th className="px-3 py-2 text-left font-medium">Date/Time</th>
                    <th className="px-3 py-2 text-right font-medium">Value</th>
                    <th className="px-3 py-2 text-right font-medium">Mean ± SD</th>
                    <th className="px-3 py-2 text-center font-medium">Deviation</th>
                    <th className="px-3 py-2 text-center font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => {
                    const deviation = ((r.value - r.mean) / r.sd).toFixed(1);
                    return (
                      <tr key={r.id} className={`border-b hover:bg-muted/30 ${r.status === "fail" ? "bg-red-50/30" : r.status === "warning" ? "bg-amber-50/30" : ""}`}>
                        <td className="px-3 py-2 font-medium">{r.test}</td>
                        <td className="px-3 py-2 text-xs">{r.level}</td>
                        <td className="px-3 py-2 text-xs">{r.date}</td>
                        <td className="px-3 py-2 text-right font-bold">{r.value}</td>
                        <td className="px-3 py-2 text-right text-xs text-muted-foreground">{r.mean} ± {r.sd}</td>
                        <td className="px-3 py-2 text-center">
                          <span className={`font-bold ${Math.abs(parseFloat(deviation)) > 2 ? "text-red-600" : Math.abs(parseFloat(deviation)) > 1 ? "text-amber-600" : "text-green-600"}`}>
                            {deviation} SD
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <Badge variant={r.status === "pass" ? "outline" : r.status === "warning" ? "secondary" : "destructive"} className={`text-[10px] capitalize ${r.status === "pass" ? "text-green-600" : ""}`}>{r.status}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lj" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Levy-Jennings Chart — Glucose (Level 1)</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Mean: 100 mg/dL</span>
                  <span>SD: 5 mg/dL</span>
                  <span>Target: ± 2 SD (90-110)</span>
                </div>
                {/* Simulated LJ chart as bars */}
                <div className="relative border rounded-lg p-4 bg-muted/20">
                  <div className="absolute top-2 right-2 flex gap-2 text-[9px]">
                    <span className="text-red-500">— +2SD (110)</span>
                    <span className="text-amber-500">— +1SD (105)</span>
                    <span className="text-green-500">— Mean (100)</span>
                  </div>
                  <div className="flex items-end justify-around gap-1 h-32 pt-6">
                    {[98, 102, 99, 101, 97, 100, 103, 98, 105, 101, 99, 98, 100, 102].map((v, i) => {
                      const pct = ((v - 85) / 30) * 100;
                      const color = v > 110 || v < 90 ? "bg-red-500" : v > 105 || v < 95 ? "bg-amber-500" : "bg-green-500";
                      return <div key={i} className={`w-4 rounded-t ${color}`} style={{ height: `${pct}%` }} title={`Day ${i + 1}: ${v}`} />;
                    })}
                  </div>
                  <p className="text-center text-[10px] text-muted-foreground mt-2">Last 14 days · Westgard rules: No violations detected</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="eqas" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">External Quality Assurance (EQAS)</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { program: "NABL Proficiency Testing (Cycle 3)", status: "Submitted", due: "2026-08-15", score: "95/100", grade: "A" },
                  { program: "NABL Proficiency Testing (Cycle 2)", status: "Passed", due: "2026-05-15", score: "92/100", grade: "A" },
                  { program: "NABL Proficiency Testing (Cycle 1)", status: "Passed", due: "2026-02-15", score: "88/100", grade: "B+" },
                  { program: "RIQAS Immunoassay (Monthly)", status: "Active", due: "Monthly", score: "Z-score: 0.8", grade: "Acceptable" },
                ].map((e, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="text-sm font-medium">{e.program}</p>
                      <p className="text-xs text-muted-foreground">Due: {e.due}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={e.status === "Passed" ? "outline" : "secondary"} className={`text-xs ${e.status === "Passed" ? "text-green-600" : ""}`}>{e.status}</Badge>
                      <p className="text-xs font-bold mt-0.5">{e.score} ({e.grade})</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QualityControl;
