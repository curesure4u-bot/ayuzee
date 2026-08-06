import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Clock, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown,
  Timer, Bell, Target, BarChart3, RefreshCw, Search,
  ArrowUp, ArrowDown, Minus, Activity,
} from "lucide-react";

interface TATRecord {
  id: string;
  orderNo: string;
  patientName: string;
  patientId: string;
  testName: string;
  department: string;
  priority: "Routine" | "Urgent" | "STAT";
  targetTAT: number; // in minutes
  actualTAT: number | null; // in minutes (null = still pending)
  sampleCollectedAt: string;
  resultEnteredAt?: string;
  validatedAt?: string;
  dispatchedAt?: string;
  status: "On Track" | "Warning" | "Breached" | "Completed";
  stage: "Sample Collected" | "In Progress" | "Result Entered" | "Validated" | "Dispatched";
  escalationLevel: 0 | 1 | 2 | 3;
}

interface TATDepartmentSummary {
  department: string;
  totalTests: number;
  withinTAT: number;
  breached: number;
  avgTAT: number;
  targetTAT: number;
  compliance: number; // percentage
}

interface TATEscalation {
  id: string;
  orderNo: string;
  patientName: string;
  testName: string;
  breachMinutes: number;
  escalatedTo: string;
  escalatedAt: string;
  level: 1 | 2 | 3;
  acknowledged: boolean;
}

const mockTATRecords: TATRecord[] = [
  { id: "1", orderNo: "ORD-2026-0047", patientName: "Mr. Rajesh Kumar", patientId: "AL-12543", testName: "Renal Function Test", department: "BIOCHEMISTRY", priority: "Urgent", targetTAT: 120, actualTAT: null, sampleCollectedAt: "2026-07-24 08:30", stage: "In Progress", status: "Warning", escalationLevel: 1 },
  { id: "2", orderNo: "ORD-2026-0048", patientName: "Mrs. Lakshmi Devi", patientId: "AL-14201", testName: "Complete Blood Count", department: "HAEMATOLOGY", priority: "Routine", targetTAT: 180, actualTAT: null, sampleCollectedAt: "2026-07-24 09:15", stage: "Result Entered", status: "On Track", escalationLevel: 0 },
  { id: "3", orderNo: "ORD-2026-0049", patientName: "Mr. Suresh Babu", patientId: "AL-15320", testName: "Lipid Profile", department: "BIOCHEMISTRY", priority: "STAT", targetTAT: 60, actualTAT: null, sampleCollectedAt: "2026-07-24 09:00", stage: "Sample Collected", status: "Breached", escalationLevel: 2 },
  { id: "4", orderNo: "ORD-2026-0045", patientName: "Mrs. Priya Sharma", patientId: "AL-13105", testName: "Thyroid Profile", department: "BIOCHEMISTRY", priority: "Routine", targetTAT: 240, actualTAT: 195, sampleCollectedAt: "2026-07-24 07:00", resultEnteredAt: "2026-07-24 09:45", validatedAt: "2026-07-24 10:00", dispatchedAt: "2026-07-24 10:15", stage: "Dispatched", status: "Completed", escalationLevel: 0 },
  { id: "5", orderNo: "ORD-2026-0046", patientName: "Mr. Arun Prasad", patientId: "AL-12980", testName: "HbA1c", department: "BIOCHEMISTRY", priority: "Routine", targetTAT: 180, actualTAT: 210, sampleCollectedAt: "2026-07-24 07:30", resultEnteredAt: "2026-07-24 10:30", validatedAt: "2026-07-24 10:45", dispatchedAt: "2026-07-24 11:00", stage: "Dispatched", status: "Breached", escalationLevel: 1 },
  { id: "6", orderNo: "ORD-2026-0050", patientName: "Ms. Kavitha R", patientId: "AL-16001", testName: "Urine Routine", department: "CLINICAL PATHOLOGY", priority: "Routine", targetTAT: 90, actualTAT: null, sampleCollectedAt: "2026-07-24 10:00", stage: "Sample Collected", status: "On Track", escalationLevel: 0 },
  { id: "7", orderNo: "ORD-2026-0051", patientName: "Mr. Venkat Rao", patientId: "AL-16025", testName: "Culture & Sensitivity", department: "MICROBIOLOGY", priority: "Routine", targetTAT: 4320, actualTAT: null, sampleCollectedAt: "2026-07-22 11:00", stage: "In Progress", status: "On Track", escalationLevel: 0 },
  { id: "8", orderNo: "ORD-2026-0052", patientName: "Mrs. Saraswathi", patientId: "AL-16050", testName: "Troponin I", department: "BIOCHEMISTRY", priority: "STAT", targetTAT: 45, actualTAT: null, sampleCollectedAt: "2026-07-24 10:30", stage: "In Progress", status: "On Track", escalationLevel: 0 },
];

const mockDeptSummary: TATDepartmentSummary[] = [
  { department: "BIOCHEMISTRY", totalTests: 85, withinTAT: 72, breached: 13, avgTAT: 145, targetTAT: 180, compliance: 84.7 },
  { department: "HAEMATOLOGY", totalTests: 42, withinTAT: 40, breached: 2, avgTAT: 95, targetTAT: 120, compliance: 95.2 },
  { department: "MICROBIOLOGY", totalTests: 12, withinTAT: 11, breached: 1, avgTAT: 3800, targetTAT: 4320, compliance: 91.7 },
  { department: "CLINICAL PATHOLOGY", totalTests: 28, withinTAT: 27, breached: 1, avgTAT: 55, targetTAT: 90, compliance: 96.4 },
  { department: "IMMUNOLOGY", totalTests: 15, withinTAT: 12, breached: 3, avgTAT: 200, targetTAT: 180, compliance: 80.0 },
];

const mockEscalations: TATEscalation[] = [
  { id: "e1", orderNo: "ORD-2026-0049", patientName: "Mr. Suresh Babu", testName: "Lipid Profile (STAT)", breachMinutes: 35, escalatedTo: "Lab Supervisor", escalatedAt: "2026-07-24 10:05", level: 1, acknowledged: true },
  { id: "e2", orderNo: "ORD-2026-0049", patientName: "Mr. Suresh Babu", testName: "Lipid Profile (STAT)", breachMinutes: 55, escalatedTo: "Lab Manager", escalatedAt: "2026-07-24 10:25", level: 2, acknowledged: false },
  { id: "e3", orderNo: "ORD-2026-0047", patientName: "Mr. Rajesh Kumar", testName: "RFT (Urgent)", breachMinutes: 15, escalatedTo: "Lab Supervisor", escalatedAt: "2026-07-24 10:45", level: 1, acknowledged: false },
];

const TATMonitoring = () => {
  const [records] = useState<TATRecord[]>(mockTATRecords);
  const [deptSummary] = useState<TATDepartmentSummary[]>(mockDeptSummary);
  const [escalations] = useState<TATEscalation[]>(mockEscalations);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const filteredRecords = records.filter((r) => {
    const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
    const matchDept = deptFilter === "ALL" || r.department === deptFilter;
    const matchSearch = r.patientName.toLowerCase().includes(search.toLowerCase()) ||
      r.orderNo.toLowerCase().includes(search.toLowerCase()) ||
      r.testName.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchDept && matchSearch;
  });

  const totalActive = records.filter(r => r.status !== "Completed").length;
  const breachedCount = records.filter(r => r.status === "Breached").length;
  const warningCount = records.filter(r => r.status === "Warning").length;
  const onTrackCount = records.filter(r => r.status === "On Track").length;
  const overallCompliance = deptSummary.reduce((sum, d) => sum + d.compliance, 0) / deptSummary.length;

  const formatMinutes = (mins: number) => {
    if (mins >= 1440) return `${(mins / 1440).toFixed(1)}d`;
    if (mins >= 60) return `${Math.floor(mins / 60)}h ${mins % 60}m`;
    return `${mins}m`;
  };

  const getElapsedMinutes = (startTime: string): number => {
    // Simulated - in real app would calculate from actual time
    const starts: Record<string, number> = {
      "2026-07-24 08:30": 135, "2026-07-24 09:15": 90, "2026-07-24 09:00": 105,
      "2026-07-24 10:00": 45, "2026-07-24 10:30": 15, "2026-07-22 11:00": 2835,
    };
    return starts[startTime] || 60;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "On Track": return "bg-green-100 text-green-700 border-green-300";
      case "Warning": return "bg-amber-100 text-amber-700 border-amber-300";
      case "Breached": return "bg-red-100 text-red-700 border-red-300";
      case "Completed": return "bg-blue-100 text-blue-700 border-blue-300";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) { case "STAT": return "bg-red-600 text-white"; case "Urgent": return "bg-amber-500 text-white"; default: return "bg-gray-200 text-gray-700"; }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2">
          <Timer className="h-5 w-5" /> TAT Monitoring Dashboard
        </h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => toast.info("Auto-refresh enabled: every 60s")}><RefreshCw className="mr-1 h-3 w-3" /> Auto Refresh</Button>
          <Badge variant="outline" className="text-red-600 border-red-300 flex items-center gap-1">
            <Bell className="h-3 w-3" /> {escalations.filter(e => !e.acknowledged).length} Active Escalations
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="border-blue-200">
          <CardContent className="p-3 text-center">
            <Activity className="h-4 w-4 mx-auto text-blue-600" />
            <p className="text-xl font-bold text-blue-600 mt-1">{totalActive}</p>
            <p className="text-[10px] text-muted-foreground">Active Tests</p>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardContent className="p-3 text-center">
            <CheckCircle2 className="h-4 w-4 mx-auto text-green-600" />
            <p className="text-xl font-bold text-green-600 mt-1">{onTrackCount}</p>
            <p className="text-[10px] text-muted-foreground">On Track</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200">
          <CardContent className="p-3 text-center">
            <AlertTriangle className="h-4 w-4 mx-auto text-amber-600" />
            <p className="text-xl font-bold text-amber-600 mt-1">{warningCount}</p>
            <p className="text-[10px] text-muted-foreground">Warning</p>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="p-3 text-center">
            <Clock className="h-4 w-4 mx-auto text-red-600" />
            <p className="text-xl font-bold text-red-600 mt-1">{breachedCount}</p>
            <p className="text-[10px] text-muted-foreground">Breached</p>
          </CardContent>
        </Card>
        <Card className="border-purple-200">
          <CardContent className="p-3 text-center">
            <Target className="h-4 w-4 mx-auto text-purple-600" />
            <p className="text-xl font-bold text-purple-600 mt-1">{overallCompliance.toFixed(1)}%</p>
            <p className="text-[10px] text-muted-foreground">Compliance</p>
          </CardContent>
        </Card>
      </div>

      {/* Department-wise Compliance */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4 text-blue-600" /> Department TAT Compliance</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {deptSummary.map((dept) => (
              <div key={dept.department} className="flex items-center gap-3">
                <span className="text-xs font-medium w-[140px] truncate">{dept.department}</span>
                <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden relative">
                  <div className={`h-full rounded-full transition-all ${dept.compliance >= 90 ? "bg-green-500" : dept.compliance >= 80 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${dept.compliance}%` }} />
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium">{dept.compliance}%</span>
                </div>
                <span className="text-[10px] text-muted-foreground w-[80px]">{dept.withinTAT}/{dept.totalTests} on time</span>
                <span className="text-[10px] text-muted-foreground w-[70px]">Avg: {formatMinutes(dept.avgTAT)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Escalations */}
      {escalations.filter(e => !e.acknowledged).length > 0 && (
        <Card className="border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-red-700">
              <Bell className="h-4 w-4" /> Active Escalations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {escalations.filter(e => !e.acknowledged).map((esc) => (
              <div key={esc.id} className="flex items-center justify-between bg-red-50 border border-red-200 rounded p-2">
                <div className="text-xs">
                  <span className="font-medium text-red-700">Level {esc.level}:</span> {esc.testName} - {esc.patientName}
                  <p className="text-[10px] text-red-600 mt-0.5">Breached by {esc.breachMinutes}min | Escalated to: {esc.escalatedTo} at {esc.escalatedAt}</p>
                </div>
                <Button size="sm" variant="outline" className="h-6 text-[10px] border-red-300 text-red-600" onClick={() => toast.success("Escalation acknowledged")}>Acknowledge</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Live Orders TAT Tracking */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Live TAT Tracking</CardTitle>
            <div className="flex gap-2">
              <div className="relative w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input className="pl-8 h-7 text-xs" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[100px] h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="On Track">On Track</SelectItem>
                  <SelectItem value="Warning">Warning</SelectItem>
                  <SelectItem value="Breached">Breached</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={deptFilter} onValueChange={setDeptFilter}>
                <SelectTrigger className="w-[130px] h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Depts</SelectItem>
                  <SelectItem value="BIOCHEMISTRY">Biochemistry</SelectItem>
                  <SelectItem value="HAEMATOLOGY">Haematology</SelectItem>
                  <SelectItem value="MICROBIOLOGY">Microbiology</SelectItem>
                  <SelectItem value="CLINICAL PATHOLOGY">Clin. Pathology</SelectItem>
                  <SelectItem value="IMMUNOLOGY">Immunology</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-xs">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">Patient / Order</th>
                <th className="px-3 py-2 text-left font-semibold">Test</th>
                <th className="px-3 py-2 text-left font-semibold">Priority</th>
                <th className="px-3 py-2 text-left font-semibold">Stage</th>
                <th className="px-3 py-2 text-left font-semibold">Elapsed</th>
                <th className="px-3 py-2 text-left font-semibold">Target</th>
                <th className="px-3 py-2 text-left font-semibold">Progress</th>
                <th className="px-3 py-2 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((rec) => {
                const elapsed = rec.actualTAT || getElapsedMinutes(rec.sampleCollectedAt);
                const progress = Math.min((elapsed / rec.targetTAT) * 100, 150);
                return (
                  <tr key={rec.id} className={`border-b ${rec.status === "Breached" ? "bg-red-50" : rec.status === "Warning" ? "bg-amber-50" : ""}`}>
                    <td className="px-3 py-2">
                      <p className="font-medium">{rec.patientName}</p>
                      <p className="text-[10px] text-muted-foreground">{rec.orderNo}</p>
                    </td>
                    <td className="px-3 py-2">{rec.testName}</td>
                    <td className="px-3 py-2"><Badge className={`text-[10px] ${getPriorityColor(rec.priority)}`}>{rec.priority}</Badge></td>
                    <td className="px-3 py-2"><Badge variant="outline" className="text-[10px]">{rec.stage}</Badge></td>
                    <td className="px-3 py-2 font-medium">{formatMinutes(elapsed)}</td>
                    <td className="px-3 py-2 text-muted-foreground">{formatMinutes(rec.targetTAT)}</td>
                    <td className="px-3 py-2 w-[120px]">
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${progress > 100 ? "bg-red-500" : progress > 80 ? "bg-amber-500" : "bg-green-500"}`} style={{ width: `${Math.min(progress, 100)}%` }} />
                      </div>
                      <p className="text-[9px] text-center mt-0.5">{progress.toFixed(0)}%</p>
                    </td>
                    <td className="px-3 py-2"><Badge className={`text-[10px] ${getStatusColor(rec.status)}`}>{rec.status}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Escalation Rules */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Escalation Rules</CardTitle></CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-3 text-xs">
            <div className="border rounded p-3 space-y-1">
              <p className="font-medium text-amber-700 flex items-center gap-1"><ArrowUp className="h-3 w-3" /> Level 1 - Warning</p>
              <p className="text-muted-foreground">Trigger: 80% of target TAT elapsed</p>
              <p className="text-muted-foreground">Action: Notify Lab Technician</p>
              <p className="text-muted-foreground">Channel: In-app notification</p>
            </div>
            <div className="border rounded p-3 space-y-1">
              <p className="font-medium text-orange-700 flex items-center gap-1"><ArrowUp className="h-3 w-3" /> Level 2 - Breach</p>
              <p className="text-muted-foreground">Trigger: Target TAT exceeded</p>
              <p className="text-muted-foreground">Action: Notify Lab Supervisor</p>
              <p className="text-muted-foreground">Channel: SMS + In-app</p>
            </div>
            <div className="border rounded p-3 space-y-1">
              <p className="font-medium text-red-700 flex items-center gap-1"><ArrowUp className="h-3 w-3" /> Level 3 - Critical</p>
              <p className="text-muted-foreground">Trigger: 150% of target TAT exceeded</p>
              <p className="text-muted-foreground">Action: Notify Lab Manager + HOD</p>
              <p className="text-muted-foreground">Channel: SMS + WhatsApp + Call</p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="mt-3 text-xs" onClick={() => toast.info("Escalation rules editor opening...")}>Configure Rules</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TATMonitoring;
