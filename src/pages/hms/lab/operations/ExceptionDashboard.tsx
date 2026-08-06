import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  AlertTriangle, Clock, XCircle, RefreshCw, CheckCircle2,
  FlaskConical, Activity, Cpu, TrendingUp, Bell,
  Eye, ArrowRight, Shield, Zap,
} from "lucide-react";

interface ExceptionItem {
  id: string;
  category: "Critical Value" | "TAT Breach" | "QC Failure" | "Delta Check" | "Machine Error" | "Unmatched Result" | "Pending Validation" | "Payment Overdue" | "Expired Reagent" | "Calibration Due";
  severity: "Critical" | "High" | "Medium" | "Low";
  title: string;
  description: string;
  patientName?: string;
  patientId?: string;
  orderNo?: string;
  timestamp: string;
  assignedTo?: string;
  status: "Open" | "Acknowledged" | "In Progress" | "Resolved";
  actionRequired: string;
}

const mockExceptions: ExceptionItem[] = [
  { id: "e1", category: "Critical Value", severity: "Critical", title: "Potassium 7.2 mEq/L", description: "Life-threatening hyperkalemia detected", patientName: "Mr. Rajesh Kumar", patientId: "AL-12543", orderNo: "ORD-2026-0047", timestamp: "2026-07-24 10:45 AM", assignedTo: "Dr. Mohamad Saleem", status: "Acknowledged", actionRequired: "Notify treating physician immediately" },
  { id: "e2", category: "Critical Value", severity: "Critical", title: "Hemoglobin 5.2 g/dL", description: "Severe anemia - transfusion may be needed", patientName: "Mrs. Lakshmi Devi", patientId: "AL-14201", orderNo: "ORD-2026-0048", timestamp: "2026-07-24 11:00 AM", status: "Open", actionRequired: "Confirm with peripheral smear, alert doctor" },
  { id: "e3", category: "TAT Breach", severity: "High", title: "Lipid Profile - STAT (35min overdue)", description: "Target TAT 60min exceeded by 35 minutes", patientName: "Mr. Suresh Babu", patientId: "AL-15320", orderNo: "ORD-2026-0049", timestamp: "2026-07-24 10:35 AM", assignedTo: "Tech. Arun", status: "In Progress", actionRequired: "Expedite processing, escalate to supervisor" },
  { id: "e4", category: "QC Failure", severity: "High", title: "Hematology QC Level 1 - 2-2S Violation", description: "Westgard rule 2-2S violated for Hemoglobin", timestamp: "2026-07-24 09:50 AM", assignedTo: "Tech. Meena", status: "In Progress", actionRequired: "Repeat QC, recalibrate if fails again" },
  { id: "e5", category: "Delta Check", severity: "Medium", title: "Creatinine jump: 1.2 → 3.8 mg/dL", description: "142% increase from previous value - possible sample error or acute condition", patientName: "Mr. Rajesh Kumar", patientId: "AL-12543", orderNo: "ORD-2026-0047", timestamp: "2026-07-24 10:42 AM", status: "Acknowledged", actionRequired: "Verify sample identity, consider re-run" },
  { id: "e6", category: "Machine Error", severity: "High", title: "Siemens Dimension EXL - Communication Timeout", description: "3 consecutive timeouts - no ACK received", timestamp: "2026-07-24 10:10 AM", assignedTo: "IT Support", status: "In Progress", actionRequired: "Check cable/network, restart interface" },
  { id: "e7", category: "Unmatched Result", severity: "Medium", title: "Sample ID S2026045 not found in LIS", description: "Machine result received but sample ID doesn't match any order", timestamp: "2026-07-24 09:50 AM", status: "Open", actionRequired: "Check barcode, manually match or reject" },
  { id: "e8", category: "Pending Validation", severity: "Medium", title: "12 results awaiting pathologist validation", description: "Results entered >2 hours ago, not yet validated", timestamp: "2026-07-24 10:00 AM", assignedTo: "Dr. Mohamad Saleem", status: "Open", actionRequired: "Validate or assign to another pathologist" },
  { id: "e9", category: "Expired Reagent", severity: "Medium", title: "Lipid Calibrator Set - Expired Jul 20", description: "Reagent used for calibration has expired 4 days ago", timestamp: "2026-07-24 08:00 AM", status: "Open", actionRequired: "Replace with new lot, re-calibrate" },
  { id: "e10", category: "Calibration Due", severity: "Low", title: "Electronic Balance - Calibration Overdue", description: "Last calibrated Jan 2026, was due Jul 10", timestamp: "2026-07-24 08:00 AM", status: "Open", actionRequired: "Schedule calibration with NABL-accredited agency" },
  { id: "e11", category: "Payment Overdue", severity: "Low", title: "Star Health Insurance - ₹4.16L overdue", description: "Invoice INV-B2B-2026-06-003 past due date by 9 days", timestamp: "2026-07-24 08:00 AM", status: "Open", actionRequired: "Send reminder, escalate to accounts" },
  { id: "e12", category: "TAT Breach", severity: "Medium", title: "RFT Urgent - 15min overdue", description: "Target TAT 120min exceeded", patientName: "Mr. Rajesh Kumar", patientId: "AL-12543", orderNo: "ORD-2026-0047", timestamp: "2026-07-24 10:45 AM", status: "Acknowledged", actionRequired: "Result entry pending" },
];

const ExceptionDashboard = () => {
  const [exceptions] = useState<ExceptionItem[]>(mockExceptions);
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState("ALL");

  const filtered = exceptions.filter((e) => {
    const matchCat = categoryFilter === "ALL" || e.category === categoryFilter;
    const matchSev = severityFilter === "ALL" || e.severity === severityFilter;
    return matchCat && matchSev;
  });

  const criticalCount = exceptions.filter(e => e.severity === "Critical").length;
  const highCount = exceptions.filter(e => e.severity === "High").length;
  const openCount = exceptions.filter(e => e.status === "Open").length;
  const totalActive = exceptions.filter(e => e.status !== "Resolved").length;

  const getSeverityColor = (s: string) => {
    switch (s) { case "Critical": return "bg-red-600 text-white"; case "High": return "bg-orange-500 text-white"; case "Medium": return "bg-amber-100 text-amber-800"; case "Low": return "bg-blue-100 text-blue-700"; default: return "bg-gray-100 text-gray-700"; }
  };

  const getStatusColor = (s: string) => {
    switch (s) { case "Open": return "bg-red-100 text-red-700"; case "Acknowledged": return "bg-amber-100 text-amber-700"; case "In Progress": return "bg-blue-100 text-blue-700"; case "Resolved": return "bg-green-100 text-green-700"; default: return "bg-gray-100 text-gray-700"; }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "Critical Value": return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "TAT Breach": return <Clock className="h-4 w-4 text-orange-600" />;
      case "QC Failure": return <XCircle className="h-4 w-4 text-red-500" />;
      case "Delta Check": return <TrendingUp className="h-4 w-4 text-amber-600" />;
      case "Machine Error": return <Cpu className="h-4 w-4 text-red-600" />;
      case "Unmatched Result": return <FlaskConical className="h-4 w-4 text-purple-600" />;
      case "Pending Validation": return <CheckCircle2 className="h-4 w-4 text-blue-600" />;
      case "Payment Overdue": return <Activity className="h-4 w-4 text-gray-600" />;
      case "Expired Reagent": return <Shield className="h-4 w-4 text-amber-600" />;
      case "Calibration Due": return <RefreshCw className="h-4 w-4 text-blue-500" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2">
          <Zap className="h-5 w-5" /> Exception Dashboard
        </h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => toast.info("Auto-refreshing every 30s")}><RefreshCw className="mr-1 h-3 w-3" /> Live</Button>
          <Badge variant="outline" className="text-red-600 border-red-300"><Bell className="h-3 w-3 mr-1" /> {openCount} Open</Badge>
        </div>
      </div>

      {/* Severity Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-red-300 bg-red-50"><CardContent className="p-3 text-center"><AlertTriangle className="h-5 w-5 mx-auto text-red-600" /><p className="text-2xl font-bold text-red-600 mt-1">{criticalCount}</p><p className="text-xs text-red-700">Critical</p></CardContent></Card>
        <Card className="border-orange-200"><CardContent className="p-3 text-center"><AlertTriangle className="h-5 w-5 mx-auto text-orange-600" /><p className="text-2xl font-bold text-orange-600 mt-1">{highCount}</p><p className="text-xs text-muted-foreground">High</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><Clock className="h-5 w-5 mx-auto text-amber-600" /><p className="text-2xl font-bold text-amber-600 mt-1">{openCount}</p><p className="text-xs text-muted-foreground">Unresolved</p></CardContent></Card>
        <Card className="border-blue-200"><CardContent className="p-3 text-center"><Activity className="h-5 w-5 mx-auto text-blue-600" /><p className="text-2xl font-bold text-blue-600 mt-1">{totalActive}</p><p className="text-xs text-muted-foreground">Total Active</p></CardContent></Card>
      </div>

      {/* Category breakdown mini-badges */}
      <div className="flex flex-wrap gap-2">
        {["Critical Value", "TAT Breach", "QC Failure", "Delta Check", "Machine Error", "Unmatched Result", "Pending Validation", "Expired Reagent", "Calibration Due", "Payment Overdue"].map((cat) => {
          const count = exceptions.filter(e => e.category === cat).length;
          if (count === 0) return null;
          return <Badge key={cat} variant="outline" className="text-[10px] cursor-pointer" onClick={() => setCategoryFilter(cat)}>{getCategoryIcon(cat)}<span className="ml-1">{cat} ({count})</span></Badge>;
        })}
        {categoryFilter !== "ALL" && <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => setCategoryFilter("ALL")}>Clear Filter</Button>}
      </div>

      {/* Exception List */}
      <div className="space-y-2">
        {filtered.map((exc) => (
          <Card key={exc.id} className={`${exc.severity === "Critical" ? "border-red-400 bg-red-50" : exc.severity === "High" ? "border-orange-300 bg-orange-50" : ""}`}>
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getCategoryIcon(exc.category)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{exc.title}</span>
                    <Badge className={`text-[9px] ${getSeverityColor(exc.severity)}`}>{exc.severity}</Badge>
                    <Badge className={`text-[9px] ${getStatusColor(exc.status)}`}>{exc.status}</Badge>
                    <Badge variant="outline" className="text-[9px]">{exc.category}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{exc.description}</p>
                  <div className="flex items-center gap-4 mt-1 text-[10px] text-muted-foreground">
                    {exc.patientName && <span>Patient: {exc.patientName} ({exc.patientId})</span>}
                    {exc.orderNo && <span>Order: {exc.orderNo}</span>}
                    {exc.assignedTo && <span>Assigned: {exc.assignedTo}</span>}
                    <span>{exc.timestamp}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowRight className="h-3 w-3 text-orange-600" />
                    <span className="text-[10px] font-medium text-orange-700">{exc.actionRequired}</span>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  {exc.status === "Open" && (
                    <Button size="sm" variant="outline" className="h-6 text-[9px]" onClick={() => toast.success("Exception acknowledged")}>Acknowledge</Button>
                  )}
                  {(exc.status === "Open" || exc.status === "Acknowledged") && (
                    <Button size="sm" className="h-6 text-[9px] bg-green-600 hover:bg-green-700" onClick={() => toast.success("Marked as resolved")}>Resolve</Button>
                  )}
                  <Button size="sm" variant="outline" className="h-6 text-[9px]"><Eye className="h-3 w-3" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ExceptionDashboard;
