import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Award, FileText, CheckCircle2, AlertTriangle, Clock,
  Upload, Download, Calendar, Shield, ClipboardCheck,
  Wrench, FlaskConical, Target, Eye, Plus,
} from "lucide-react";

interface SOPDocument {
  id: string;
  title: string;
  sopNo: string;
  department: string;
  version: string;
  effectiveDate: string;
  reviewDate: string;
  preparedBy: string;
  approvedBy: string;
  status: "Active" | "Under Review" | "Expired" | "Draft";
  category: "Pre-analytical" | "Analytical" | "Post-analytical" | "Safety" | "Equipment" | "General";
}

interface QCRecord {
  id: string;
  testName: string;
  department: string;
  controlType: "IQC" | "EQC" | "EQAS" | "PT";
  level: string;
  lotNumber: string;
  date: string;
  targetValue: number;
  obtainedValue: number;
  sd: number;
  cv: number;
  status: "Pass" | "Warning" | "Fail" | "Westgard Violation";
  rule?: string;
}

interface CalibrationLog {
  id: string;
  equipmentName: string;
  equipmentId: string;
  department: string;
  calibrationDate: string;
  nextDueDate: string;
  calibratedBy: string;
  certificateNo: string;
  status: "Calibrated" | "Due" | "Overdue" | "Not Applicable";
  traceable: boolean;
}

interface NABLChecklist {
  id: string;
  section: string;
  requirement: string;
  clause: string;
  status: "Compliant" | "Partial" | "Non-Compliant" | "Not Applicable";
  evidence?: string;
  lastAuditDate?: string;
  remarks?: string;
}

const mockSOPs: SOPDocument[] = [
  { id: "s1", title: "Sample Collection & Handling", sopNo: "SOP-PRE-001", department: "All", version: "3.0", effectiveDate: "2026-01-15", reviewDate: "2027-01-15", preparedBy: "Tech. Arun", approvedBy: "Dr. Mohamad Saleem", status: "Active", category: "Pre-analytical" },
  { id: "s2", title: "CBC Analysis - Sysmex XN-1000", sopNo: "SOP-ANA-005", department: "HAEMATOLOGY", version: "2.1", effectiveDate: "2026-03-01", reviewDate: "2027-03-01", preparedBy: "Tech. Meena", approvedBy: "Dr. Mohamad Saleem", status: "Active", category: "Analytical" },
  { id: "s3", title: "Biochemistry Analyser Operation", sopNo: "SOP-ANA-012", department: "BIOCHEMISTRY", version: "4.0", effectiveDate: "2026-02-01", reviewDate: "2027-02-01", preparedBy: "Tech. Arun", approvedBy: "Dr. Mohamad Saleem", status: "Active", category: "Analytical" },
  { id: "s4", title: "Critical Value Communication", sopNo: "SOP-POST-003", department: "All", version: "2.0", effectiveDate: "2025-11-01", reviewDate: "2026-11-01", preparedBy: "Dr. Mohamad Saleem", approvedBy: "Dr. Mohamad Saleem", status: "Active", category: "Post-analytical" },
  { id: "s5", title: "Waste Disposal & Biosafety", sopNo: "SOP-SAF-002", department: "All", version: "1.5", effectiveDate: "2025-06-01", reviewDate: "2026-06-01", preparedBy: "Safety Officer", approvedBy: "Lab Director", status: "Expired", category: "Safety" },
  { id: "s6", title: "IQC Procedure - Levey-Jennings", sopNo: "SOP-ANA-020", department: "All", version: "3.2", effectiveDate: "2026-04-01", reviewDate: "2027-04-01", preparedBy: "QC Manager", approvedBy: "Dr. Mohamad Saleem", status: "Active", category: "Analytical" },
  { id: "s7", title: "Report Validation & Dispatch", sopNo: "SOP-POST-007", department: "All", version: "2.5", effectiveDate: "2026-05-15", reviewDate: "2027-05-15", preparedBy: "Lab Manager", approvedBy: "Dr. Mohamad Saleem", status: "Under Review", category: "Post-analytical" },
];

const mockQCRecords: QCRecord[] = [
  { id: "q1", testName: "Glucose", department: "BIOCHEMISTRY", controlType: "IQC", level: "Level 1 (Normal)", lotNumber: "QC-GLU-2026-L1", date: "2026-07-24", targetValue: 95.0, obtainedValue: 97.2, sd: 3.5, cv: 3.6, status: "Pass" },
  { id: "q2", testName: "Glucose", department: "BIOCHEMISTRY", controlType: "IQC", level: "Level 2 (Abnormal)", lotNumber: "QC-GLU-2026-L2", date: "2026-07-24", targetValue: 250.0, obtainedValue: 248.5, sd: 8.0, cv: 3.2, status: "Pass" },
  { id: "q3", testName: "Hemoglobin", department: "HAEMATOLOGY", controlType: "IQC", level: "Level 1", lotNumber: "QC-HEM-2026-L1", date: "2026-07-24", targetValue: 12.5, obtainedValue: 11.2, sd: 0.3, cv: 2.4, status: "Westgard Violation", rule: "2-2S rule" },
  { id: "q4", testName: "Creatinine", department: "BIOCHEMISTRY", controlType: "IQC", level: "Level 1", lotNumber: "QC-CRE-2026-L1", date: "2026-07-24", targetValue: 1.1, obtainedValue: 1.08, sd: 0.05, cv: 4.5, status: "Pass" },
  { id: "q5", testName: "TSH", department: "BIOCHEMISTRY", controlType: "EQC", level: "EQAS Cycle 3", lotNumber: "EQAS-2026-C3", date: "2026-07-15", targetValue: 4.2, obtainedValue: 4.35, sd: 0.4, cv: 9.5, status: "Pass" },
  { id: "q6", testName: "WBC Count", department: "HAEMATOLOGY", controlType: "IQC", level: "Level 2", lotNumber: "QC-WBC-2026-L2", date: "2026-07-24", targetValue: 15000, obtainedValue: 15800, sd: 500, cv: 3.3, status: "Warning" },
];

const mockCalibrations: CalibrationLog[] = [
  { id: "c1", equipmentName: "Sysmex XN-1000", equipmentId: "EQ-HEM-001", department: "HAEMATOLOGY", calibrationDate: "2026-06-15", nextDueDate: "2026-12-15", calibratedBy: "Sysmex India", certificateNo: "CAL-SYS-2026-042", status: "Calibrated", traceable: true },
  { id: "c2", equipmentName: "Beckman AU680", equipmentId: "EQ-BIO-001", department: "BIOCHEMISTRY", calibrationDate: "2026-05-01", nextDueDate: "2026-11-01", calibratedBy: "Beckman Service", certificateNo: "CAL-BCK-2026-018", status: "Calibrated", traceable: true },
  { id: "c3", equipmentName: "Electronic Balance", equipmentId: "EQ-GEN-005", department: "General", calibrationDate: "2026-01-10", nextDueDate: "2026-07-10", calibratedBy: "NABL Lab", certificateNo: "CAL-BAL-2026-003", status: "Overdue", traceable: true },
  { id: "c4", equipmentName: "Centrifuge - Remi R8C", equipmentId: "EQ-GEN-002", department: "General", calibrationDate: "2026-04-20", nextDueDate: "2026-10-20", calibratedBy: "Remi Service", certificateNo: "CAL-CEN-2026-009", status: "Calibrated", traceable: true },
  { id: "c5", equipmentName: "Pipettes (Set of 6)", equipmentId: "EQ-GEN-010", department: "General", calibrationDate: "2026-03-01", nextDueDate: "2026-09-01", calibratedBy: "Eppendorf India", certificateNo: "CAL-PIP-2026-015", status: "Due", traceable: true },
  { id: "c6", equipmentName: "Refrigerator (2-8°C)", equipmentId: "EQ-GEN-003", department: "General", calibrationDate: "2026-06-01", nextDueDate: "2027-06-01", calibratedBy: "In-house", certificateNo: "CAL-REF-2026-022", status: "Calibrated", traceable: false },
];

const mockChecklist: NABLChecklist[] = [
  { id: "n1", section: "4.1 Organization", clause: "ISO 15189:2022 Cl 4.1", requirement: "Lab legally identifiable entity with defined structure", status: "Compliant", evidence: "Registration certificate uploaded", lastAuditDate: "2026-06-15" },
  { id: "n2", section: "4.2 Quality Management System", clause: "ISO 15189:2022 Cl 4.2", requirement: "Documented QMS with quality manual", status: "Compliant", evidence: "Quality Manual v5.0", lastAuditDate: "2026-06-15" },
  { id: "n3", section: "5.1 Personnel", clause: "ISO 15189:2022 Cl 5.1", requirement: "Competent personnel with documented qualifications", status: "Compliant", evidence: "Staff files with competency records", lastAuditDate: "2026-06-15" },
  { id: "n4", section: "5.3 Equipment", clause: "ISO 15189:2022 Cl 5.3", requirement: "Calibrated and maintained equipment", status: "Partial", evidence: "1 equipment overdue for calibration", lastAuditDate: "2026-06-15", remarks: "Electronic balance calibration pending" },
  { id: "n5", section: "5.5 Examination Processes", clause: "ISO 15189:2022 Cl 5.5", requirement: "Validated methods with IQC/EQC participation", status: "Compliant", evidence: "Method validation records + EQAS participation", lastAuditDate: "2026-06-15" },
  { id: "n6", section: "5.7 Post-examination", clause: "ISO 15189:2022 Cl 5.7", requirement: "Result reporting with reference intervals", status: "Compliant", evidence: "Report templates with ranges", lastAuditDate: "2026-06-15" },
  { id: "n7", section: "6.1 Internal Audit", clause: "ISO 15189:2022 Cl 6.1", requirement: "Regular internal audits conducted", status: "Compliant", evidence: "Audit report Jun 2026", lastAuditDate: "2026-06-15" },
  { id: "n8", section: "5.4 Pre-examination", clause: "ISO 15189:2022 Cl 5.4", requirement: "Documented sample collection procedures", status: "Compliant", evidence: "SOP-PRE-001 active", lastAuditDate: "2026-06-15" },
  { id: "n9", section: "4.14 Document Control", clause: "ISO 15189:2022 Cl 4.14", requirement: "Controlled document system with version tracking", status: "Partial", evidence: "1 SOP expired - needs renewal", lastAuditDate: "2026-06-15", remarks: "SOP-SAF-002 expired" },
];

const NABLCompliance = () => {
  const [sops] = useState<SOPDocument[]>(mockSOPs);
  const [qcRecords] = useState<QCRecord[]>(mockQCRecords);
  const [calibrations] = useState<CalibrationLog[]>(mockCalibrations);
  const [checklist] = useState<NABLChecklist[]>(mockChecklist);
  const [activeTab, setActiveTab] = useState("checklist");

  const compliantCount = checklist.filter(c => c.status === "Compliant").length;
  const partialCount = checklist.filter(c => c.status === "Partial").length;
  const nonCompliantCount = checklist.filter(c => c.status === "Non-Compliant").length;
  const complianceScore = ((compliantCount / checklist.length) * 100).toFixed(0);
  const expiredSOPs = sops.filter(s => s.status === "Expired").length;
  const overdueCalibrations = calibrations.filter(c => c.status === "Overdue").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Compliant": case "Active": case "Calibrated": case "Pass": return "bg-green-100 text-green-700";
      case "Partial": case "Under Review": case "Due": case "Warning": return "bg-amber-100 text-amber-700";
      case "Non-Compliant": case "Expired": case "Overdue": case "Fail": case "Westgard Violation": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2">
          <Award className="h-5 w-5" /> NABL / Accreditation Compliance
        </h2>
        <Badge variant="outline" className="text-green-600 border-green-300">
          <Award className="h-3 w-3 mr-1" /> NABL Accredited
        </Badge>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="border-green-200">
          <CardContent className="p-3 text-center">
            <Target className="h-4 w-4 mx-auto text-green-600" />
            <p className="text-xl font-bold text-green-600 mt-1">{complianceScore}%</p>
            <p className="text-[10px] text-muted-foreground">Compliance Score</p>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardContent className="p-3 text-center">
            <CheckCircle2 className="h-4 w-4 mx-auto text-green-600" />
            <p className="text-xl font-bold text-green-600 mt-1">{compliantCount}</p>
            <p className="text-[10px] text-muted-foreground">Compliant</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200">
          <CardContent className="p-3 text-center">
            <AlertTriangle className="h-4 w-4 mx-auto text-amber-600" />
            <p className="text-xl font-bold text-amber-600 mt-1">{partialCount}</p>
            <p className="text-[10px] text-muted-foreground">Partial</p>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="p-3 text-center">
            <FileText className="h-4 w-4 mx-auto text-red-600" />
            <p className="text-xl font-bold text-red-600 mt-1">{expiredSOPs}</p>
            <p className="text-[10px] text-muted-foreground">Expired SOPs</p>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="p-3 text-center">
            <Wrench className="h-4 w-4 mx-auto text-red-600" />
            <p className="text-xl font-bold text-red-600 mt-1">{overdueCalibrations}</p>
            <p className="text-[10px] text-muted-foreground">Overdue Calibrations</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="checklist">NABL Checklist</TabsTrigger>
          <TabsTrigger value="sops">SOPs</TabsTrigger>
          <TabsTrigger value="qc">IQC / EQC Records</TabsTrigger>
          <TabsTrigger value="calibration">Calibration</TabsTrigger>
        </TabsList>

        {/* NABL Checklist */}
        <TabsContent value="checklist" className="space-y-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><ClipboardCheck className="h-4 w-4 text-blue-600" /> ISO 15189:2022 Compliance Checklist</CardTitle></CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-3 py-2 text-left">Section</th>
                    <th className="px-3 py-2 text-left">Clause</th>
                    <th className="px-3 py-2 text-left">Requirement</th>
                    <th className="px-3 py-2 text-center">Status</th>
                    <th className="px-3 py-2 text-left">Evidence</th>
                    <th className="px-3 py-2 text-left">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {checklist.map((item) => (
                    <tr key={item.id} className={`border-b ${item.status === "Non-Compliant" ? "bg-red-50" : item.status === "Partial" ? "bg-amber-50" : ""}`}>
                      <td className="px-3 py-2 font-medium">{item.section}</td>
                      <td className="px-3 py-2 text-muted-foreground">{item.clause}</td>
                      <td className="px-3 py-2 max-w-[200px]">{item.requirement}</td>
                      <td className="px-3 py-2 text-center"><Badge className={`text-[10px] ${getStatusColor(item.status)}`}>{item.status}</Badge></td>
                      <td className="px-3 py-2 text-muted-foreground max-w-[150px] truncate">{item.evidence || "-"}</td>
                      <td className="px-3 py-2 text-muted-foreground">{item.remarks || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SOPs Tab */}
        <TabsContent value="sops" className="space-y-3">
          <div className="flex items-center justify-between">
            <Select defaultValue="ALL">
              <SelectTrigger className="w-[150px] h-8 text-xs"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                <SelectItem value="Pre-analytical">Pre-analytical</SelectItem>
                <SelectItem value="Analytical">Analytical</SelectItem>
                <SelectItem value="Post-analytical">Post-analytical</SelectItem>
                <SelectItem value="Safety">Safety</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" className="bg-green-600 hover:bg-green-700"><Plus className="mr-1 h-3 w-3" /> New SOP</Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-3 py-2 text-left">SOP No</th>
                    <th className="px-3 py-2 text-left">Title</th>
                    <th className="px-3 py-2 text-left">Category</th>
                    <th className="px-3 py-2 text-left">Version</th>
                    <th className="px-3 py-2 text-left">Review Date</th>
                    <th className="px-3 py-2 text-center">Status</th>
                    <th className="px-3 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sops.map((sop) => (
                    <tr key={sop.id} className={`border-b ${sop.status === "Expired" ? "bg-red-50" : ""}`}>
                      <td className="px-3 py-2 font-medium">{sop.sopNo}</td>
                      <td className="px-3 py-2">{sop.title}</td>
                      <td className="px-3 py-2"><Badge variant="outline" className="text-[10px]">{sop.category}</Badge></td>
                      <td className="px-3 py-2">v{sop.version}</td>
                      <td className="px-3 py-2">{sop.reviewDate}</td>
                      <td className="px-3 py-2 text-center"><Badge className={`text-[10px] ${getStatusColor(sop.status)}`}>{sop.status}</Badge></td>
                      <td className="px-3 py-2 text-center">
                        <div className="flex gap-1 justify-center">
                          <Button size="sm" variant="outline" className="h-5 text-[9px]"><Eye className="h-3 w-3" /></Button>
                          <Button size="sm" variant="outline" className="h-5 text-[9px]"><Download className="h-3 w-3" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* IQC/EQC Records */}
        <TabsContent value="qc" className="space-y-3">
          <div className="flex items-center gap-2">
            <Select defaultValue="ALL">
              <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="IQC">IQC</SelectItem>
                <SelectItem value="EQC">EQC</SelectItem>
                <SelectItem value="EQAS">EQAS</SelectItem>
              </SelectContent>
            </Select>
            <Input type="date" className="h-8 text-xs w-[130px]" defaultValue="2026-07-24" />
          </div>
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-3 py-2 text-left">Test</th>
                    <th className="px-3 py-2 text-left">Type</th>
                    <th className="px-3 py-2 text-left">Level</th>
                    <th className="px-3 py-2 text-right">Target</th>
                    <th className="px-3 py-2 text-right">Obtained</th>
                    <th className="px-3 py-2 text-right">SD</th>
                    <th className="px-3 py-2 text-right">CV%</th>
                    <th className="px-3 py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {qcRecords.map((qc) => (
                    <tr key={qc.id} className={`border-b ${qc.status === "Westgard Violation" || qc.status === "Fail" ? "bg-red-50" : qc.status === "Warning" ? "bg-amber-50" : ""}`}>
                      <td className="px-3 py-2 font-medium">{qc.testName}</td>
                      <td className="px-3 py-2"><Badge variant="outline" className="text-[10px]">{qc.controlType}</Badge></td>
                      <td className="px-3 py-2">{qc.level}</td>
                      <td className="px-3 py-2 text-right">{qc.targetValue}</td>
                      <td className="px-3 py-2 text-right font-medium">{qc.obtainedValue}</td>
                      <td className="px-3 py-2 text-right">{qc.sd}</td>
                      <td className="px-3 py-2 text-right">{qc.cv}%</td>
                      <td className="px-3 py-2 text-center">
                        <Badge className={`text-[10px] ${getStatusColor(qc.status)}`}>{qc.status}</Badge>
                        {qc.rule && <p className="text-[9px] text-red-600 mt-0.5">{qc.rule}</p>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calibration Tab */}
        <TabsContent value="calibration" className="space-y-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Wrench className="h-4 w-4 text-blue-600" /> Equipment Calibration Log</CardTitle></CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-3 py-2 text-left">Equipment</th>
                    <th className="px-3 py-2 text-left">ID</th>
                    <th className="px-3 py-2 text-left">Last Calibration</th>
                    <th className="px-3 py-2 text-left">Next Due</th>
                    <th className="px-3 py-2 text-left">Calibrated By</th>
                    <th className="px-3 py-2 text-left">Certificate</th>
                    <th className="px-3 py-2 text-center">Traceable</th>
                    <th className="px-3 py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {calibrations.map((cal) => (
                    <tr key={cal.id} className={`border-b ${cal.status === "Overdue" ? "bg-red-50" : cal.status === "Due" ? "bg-amber-50" : ""}`}>
                      <td className="px-3 py-2 font-medium">{cal.equipmentName}</td>
                      <td className="px-3 py-2 text-muted-foreground">{cal.equipmentId}</td>
                      <td className="px-3 py-2">{cal.calibrationDate}</td>
                      <td className="px-3 py-2">{cal.nextDueDate}</td>
                      <td className="px-3 py-2">{cal.calibratedBy}</td>
                      <td className="px-3 py-2 text-muted-foreground">{cal.certificateNo}</td>
                      <td className="px-3 py-2 text-center">{cal.traceable ? <CheckCircle2 className="h-3 w-3 text-green-600 mx-auto" /> : <span className="text-muted-foreground">-</span>}</td>
                      <td className="px-3 py-2 text-center"><Badge className={`text-[10px] ${getStatusColor(cal.status)}`}>{cal.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NABLCompliance;
