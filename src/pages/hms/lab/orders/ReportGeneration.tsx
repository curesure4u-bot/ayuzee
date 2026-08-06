import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Printer, FileText, Download, Send, Mail, MessageSquare,
  Phone, QrCode, Search, Eye, CheckCircle2, Clock,
  Building2, User, FlaskConical, Brain, Share2,
} from "lucide-react";

interface ReportData {
  id: string;
  orderNo: string;
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  phone: string;
  email?: string;
  referredBy: string;
  testName: string;
  department: string;
  sampleCollectedAt: string;
  reportDate: string;
  validatedBy: string;
  results: { parameter: string; value: string; unit: string; normalRange: string; flag: string }[];
  interpretation?: string;
  aiInterpretation?: string;
  status: "Ready" | "Printed" | "Dispatched" | "Sent";
  sentVia: string[];
}

const mockReports: ReportData[] = [
  {
    id: "1", orderNo: "ORD-2026-0042", patientId: "AL-12543", patientName: "Mr. Rajesh Kumar",
    age: 52, gender: "Male", phone: "+91 98765 43210", email: "rajesh@email.com",
    referredBy: "Dr. Mohamad Saleem", testName: "Renal Function Test (RFT)",
    department: "BIOCHEMISTRY", sampleCollectedAt: "2026-07-23 08:30 AM",
    reportDate: "2026-07-23 02:15 PM", validatedBy: "Dr. Mohamad Saleem",
    results: [
      { parameter: "Blood Urea", value: "45", unit: "mg/dL", normalRange: "15-40", flag: "High" },
      { parameter: "Serum Creatinine", value: "3.8", unit: "mg/dL", normalRange: "0.7-1.3", flag: "Critical High" },
      { parameter: "BUN", value: "45", unit: "mg/dL", normalRange: "7-20", flag: "High" },
      { parameter: "Uric Acid", value: "8.5", unit: "mg/dL", normalRange: "3.5-7.2", flag: "High" },
      { parameter: "Sodium", value: "138", unit: "mEq/L", normalRange: "136-145", flag: "Normal" },
      { parameter: "Potassium", value: "7.2", unit: "mEq/L", normalRange: "3.5-5.5", flag: "Critical High" },
      { parameter: "Chloride", value: "101", unit: "mEq/L", normalRange: "98-106", flag: "Normal" },
      { parameter: "Calcium", value: "8.2", unit: "mg/dL", normalRange: "8.5-10.5", flag: "Low" },
    ],
    interpretation: "Significantly elevated creatinine and potassium with impaired renal markers.",
    aiInterpretation: "Pattern consistent with acute kidney injury. Hyperkalemia requires urgent ECG.",
    status: "Ready", sentVia: [],
  },
  {
    id: "2", orderNo: "ORD-2026-0043", patientId: "AL-14201", patientName: "Mrs. Lakshmi Devi",
    age: 45, gender: "Female", phone: "+91 87654 32109",
    referredBy: "Dr. Anitha Kumari", testName: "Complete Blood Count (CBC)",
    department: "HAEMATOLOGY", sampleCollectedAt: "2026-07-23 09:00 AM",
    reportDate: "2026-07-23 11:45 AM", validatedBy: "Dr. Mohamad Saleem",
    results: [
      { parameter: "Hemoglobin", value: "5.2", unit: "g/dL", normalRange: "12-16", flag: "Critical Low" },
      { parameter: "RBC Count", value: "2.8", unit: "million/μL", normalRange: "3.8-5.1", flag: "Low" },
      { parameter: "WBC Count", value: "7800", unit: "/μL", normalRange: "4000-11000", flag: "Normal" },
      { parameter: "Platelet Count", value: "2.2", unit: "lakhs/μL", normalRange: "1.5-4.0", flag: "Normal" },
      { parameter: "PCV", value: "18", unit: "%", normalRange: "36-46", flag: "Critical Low" },
      { parameter: "MCV", value: "64", unit: "fL", normalRange: "80-100", flag: "Low" },
      { parameter: "MCH", value: "18.5", unit: "pg", normalRange: "27-32", flag: "Low" },
      { parameter: "MCHC", value: "28.9", unit: "g/dL", normalRange: "32-36", flag: "Low" },
    ],
    interpretation: "Severe microcytic hypochromic anemia. Iron deficiency likely.",
    aiInterpretation: "Severe anemia requiring transfusion. Suggest iron studies and peripheral smear.",
    status: "Printed", sentVia: ["print"],
  },
  {
    id: "3", orderNo: "ORD-2026-0044", patientId: "AL-15320", patientName: "Mr. Suresh Babu",
    age: 38, gender: "Male", phone: "+91 76543 21098", email: "suresh.b@email.com",
    referredBy: "Dr. Mohamad Saleem", testName: "Lipid Profile",
    department: "BIOCHEMISTRY", sampleCollectedAt: "2026-07-23 09:30 AM",
    reportDate: "2026-07-23 01:00 PM", validatedBy: "Dr. Mohamad Saleem",
    results: [
      { parameter: "Total Cholesterol", value: "245", unit: "mg/dL", normalRange: "<200", flag: "High" },
      { parameter: "Triglycerides", value: "280", unit: "mg/dL", normalRange: "<150", flag: "High" },
      { parameter: "HDL Cholesterol", value: "32", unit: "mg/dL", normalRange: ">40", flag: "Low" },
      { parameter: "LDL Cholesterol", value: "157", unit: "mg/dL", normalRange: "<100", flag: "High" },
      { parameter: "VLDL", value: "56", unit: "mg/dL", normalRange: "<30", flag: "High" },
      { parameter: "TC/HDL Ratio", value: "7.6", unit: "", normalRange: "<4.5", flag: "High" },
    ],
    interpretation: "Dyslipidemia with atherogenic pattern. High cardiovascular risk.",
    aiInterpretation: "Significant dyslipidemia. 10-year CV risk elevated. Statin initiation recommended.",
    status: "Dispatched", sentVia: ["print", "whatsapp"],
  },
];

const ReportGeneration = () => {
  const [reports, setReports] = useState<ReportData[]>(mockReports);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [previewMode, setPreviewMode] = useState(false);

  const filteredReports = reports.filter((r) => {
    const matchesSearch = r.patientName.toLowerCase().includes(search.toLowerCase()) ||
      r.orderNo.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handlePrint = (report: ReportData) => {
    setReports(reports.map((r) => r.id === report.id
      ? { ...r, status: "Printed", sentVia: [...new Set([...r.sentVia, "print"])] }
      : r
    ));
    toast.success(`Report printed for ${report.patientName}`);
  };

  const handleSendWhatsApp = (report: ReportData) => {
    setReports(reports.map((r) => r.id === report.id
      ? { ...r, status: "Sent", sentVia: [...new Set([...r.sentVia, "whatsapp"])] }
      : r
    ));
    toast.success(`Report sent via WhatsApp to ${report.phone}`);
  };

  const handleSendSMS = (report: ReportData) => {
    setReports(reports.map((r) => r.id === report.id
      ? { ...r, status: "Sent", sentVia: [...new Set([...r.sentVia, "sms"])] }
      : r
    ));
    toast.success(`Report link sent via SMS to ${report.phone}`);
  };

  const handleSendEmail = (report: ReportData) => {
    if (!report.email) { toast.error("No email on file"); return; }
    setReports(reports.map((r) => r.id === report.id
      ? { ...r, status: "Sent", sentVia: [...new Set([...r.sentVia, "email"])] }
      : r
    ));
    toast.success(`Report emailed to ${report.email}`);
  };

  const handleDispatch = (report: ReportData) => {
    setReports(reports.map((r) => r.id === report.id ? { ...r, status: "Dispatched" } : r));
    toast.success(`Report dispatched for ${report.patientName}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ready": return "bg-blue-100 text-blue-700";
      case "Printed": return "bg-amber-100 text-amber-700";
      case "Dispatched": return "bg-green-100 text-green-700";
      case "Sent": return "bg-purple-100 text-purple-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getFlagStyle = (flag: string) => {
    if (flag.includes("Critical")) return "text-red-700 font-bold bg-red-50";
    if (flag === "High") return "text-red-600 font-medium";
    if (flag === "Low") return "text-blue-600 font-medium";
    return "";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2">
          <FileText className="h-5 w-5" /> Report Generation & Dispatch
        </h2>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-blue-600">{reports.filter(r => r.status === "Ready").length} Ready</Badge>
          <Badge variant="outline" className="text-green-600">{reports.filter(r => r.status === "Dispatched" || r.status === "Sent").length} Sent</Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9 h-8 text-sm" placeholder="Search patient, order..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="Ready">Ready</SelectItem>
            <SelectItem value="Printed">Printed</SelectItem>
            <SelectItem value="Dispatched">Dispatched</SelectItem>
            <SelectItem value="Sent">Sent</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => toast.info("Bulk print initiated for all Ready reports")}>
          <Printer className="mr-1 h-3 w-3" /> Bulk Print
        </Button>
        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => toast.info("Bulk WhatsApp dispatch initiated")}>
          <MessageSquare className="mr-1 h-3 w-3" /> Bulk WhatsApp
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Report List */}
        <div className="space-y-3">
          {filteredReports.map((report) => (
            <Card key={report.id} className={`cursor-pointer transition hover:border-orange-300 ${selectedReport?.id === report.id ? "border-orange-500 bg-orange-50" : ""}`} onClick={() => { setSelectedReport(report); setPreviewMode(false); }}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{report.patientName}</p>
                    <p className="text-xs text-muted-foreground">{report.testName} | {report.department}</p>
                  </div>
                  <Badge className={`text-[10px] ${getStatusColor(report.status)}`}>{report.status}</Badge>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-muted-foreground">{report.orderNo} | {report.reportDate}</span>
                  <div className="flex gap-1">
                    {report.sentVia.includes("print") && <Printer className="h-3 w-3 text-gray-400" />}
                    {report.sentVia.includes("whatsapp") && <MessageSquare className="h-3 w-3 text-green-500" />}
                    {report.sentVia.includes("sms") && <Phone className="h-3 w-3 text-blue-500" />}
                    {report.sentVia.includes("email") && <Mail className="h-3 w-3 text-red-500" />}
                  </div>
                </div>
                <div className="flex gap-1 mt-2">
                  <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={(e) => { e.stopPropagation(); handlePrint(report); }}><Printer className="mr-1 h-3 w-3" /> Print</Button>
                  <Button size="sm" variant="outline" className="h-6 text-[10px] text-green-600" onClick={(e) => { e.stopPropagation(); handleSendWhatsApp(report); }}><MessageSquare className="mr-1 h-3 w-3" /> WA</Button>
                  <Button size="sm" variant="outline" className="h-6 text-[10px] text-blue-600" onClick={(e) => { e.stopPropagation(); handleSendSMS(report); }}><Phone className="mr-1 h-3 w-3" /> SMS</Button>
                  <Button size="sm" variant="outline" className="h-6 text-[10px] text-red-600" onClick={(e) => { e.stopPropagation(); handleSendEmail(report); }}><Mail className="mr-1 h-3 w-3" /> Email</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Report Preview */}
        <div>
          {!selectedReport ? (
            <Card><CardContent className="p-12 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select a report to preview</p>
            </CardContent></Card>
          ) : (
            <Card className="border-gray-300">
              <CardContent className="p-0">
                {/* Report Preview - Simulated printed report */}
                <div className="bg-white p-6 space-y-4 text-xs" id="report-preview">
                  {/* Letterhead */}
                  <div className="border-b-2 border-green-600 pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-green-700">AYUZEE DIAGNOSTICS</h3>
                        <p className="text-[10px] text-muted-foreground">#11, Main Road, Kadayanallur</p>
                        <p className="text-[10px] text-muted-foreground">Ph: +91 4634 123456 | NABL Accredited</p>
                      </div>
                      <div className="text-right">
                        <div className="h-12 w-12 border-2 border-dashed border-gray-300 flex items-center justify-center">
                          <QrCode className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-[9px] text-muted-foreground mt-1">Scan to verify</p>
                      </div>
                    </div>
                  </div>

                  {/* Patient Info */}
                  <div className="grid grid-cols-2 gap-2 bg-gray-50 p-2 rounded text-[11px]">
                    <div><span className="text-muted-foreground">Patient:</span> <strong>{selectedReport.patientName}</strong></div>
                    <div><span className="text-muted-foreground">ID:</span> {selectedReport.patientId}</div>
                    <div><span className="text-muted-foreground">Age/Gender:</span> {selectedReport.age}y / {selectedReport.gender}</div>
                    <div><span className="text-muted-foreground">Referred By:</span> {selectedReport.referredBy}</div>
                    <div><span className="text-muted-foreground">Sample Collected:</span> {selectedReport.sampleCollectedAt}</div>
                    <div><span className="text-muted-foreground">Report Date:</span> {selectedReport.reportDate}</div>
                    <div><span className="text-muted-foreground">Order No:</span> {selectedReport.orderNo}</div>
                    <div><span className="text-muted-foreground">Department:</span> {selectedReport.department}</div>
                  </div>

                  {/* Test Name */}
                  <div className="text-center py-1">
                    <h4 className="font-bold text-sm text-green-700">{selectedReport.testName}</h4>
                  </div>

                  {/* Results Table */}
                  <table className="w-full border text-[11px]">
                    <thead>
                      <tr className="bg-green-50 border-b">
                        <th className="px-2 py-1.5 text-left font-semibold">Parameter</th>
                        <th className="px-2 py-1.5 text-left font-semibold">Result</th>
                        <th className="px-2 py-1.5 text-left font-semibold">Unit</th>
                        <th className="px-2 py-1.5 text-left font-semibold">Normal Range</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedReport.results.map((r, idx) => (
                        <tr key={idx} className={`border-b ${getFlagStyle(r.flag)}`}>
                          <td className="px-2 py-1.5">{r.parameter}</td>
                          <td className="px-2 py-1.5 font-medium">
                            {r.value} {r.flag !== "Normal" && <span className="text-[9px]">({r.flag.replace("Critical ", "").charAt(0)})</span>}
                          </td>
                          <td className="px-2 py-1.5">{r.unit}</td>
                          <td className="px-2 py-1.5">{r.normalRange}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Interpretation */}
                  {selectedReport.interpretation && (
                    <div className="border rounded p-2">
                      <p className="font-semibold text-[11px]">Interpretation:</p>
                      <p className="text-[11px]">{selectedReport.interpretation}</p>
                    </div>
                  )}

                  {/* AI Interpretation */}
                  {selectedReport.aiInterpretation && (
                    <div className="border border-purple-200 rounded p-2 bg-purple-50">
                      <p className="font-semibold text-[11px] flex items-center gap-1">
                        <Brain className="h-3 w-3 text-purple-600" /> AI Clinical Insight:
                      </p>
                      <p className="text-[11px] text-purple-700">{selectedReport.aiInterpretation}</p>
                    </div>
                  )}

                  {/* Footer / Signature */}
                  <div className="border-t pt-3 mt-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] text-muted-foreground">H = High | L = Low | * = Critical</p>
                        <p className="text-[10px] text-muted-foreground mt-1">This is a computer-generated report.</p>
                      </div>
                      <div className="text-right">
                        <div className="border-t border-gray-400 pt-1 w-[150px]">
                          <p className="text-[11px] font-medium">{selectedReport.validatedBy}</p>
                          <p className="text-[10px] text-muted-foreground">Pathologist</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Bar below preview */}
                <div className="border-t p-3 flex items-center gap-2 flex-wrap bg-gray-50">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handlePrint(selectedReport)}>
                    <Printer className="mr-1 h-3 w-3" /> Print PDF
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toast.info("PDF download started")}>
                    <Download className="mr-1 h-3 w-3" /> Download
                  </Button>
                  <Button size="sm" variant="outline" className="text-green-600" onClick={() => handleSendWhatsApp(selectedReport)}>
                    <MessageSquare className="mr-1 h-3 w-3" /> WhatsApp
                  </Button>
                  <Button size="sm" variant="outline" className="text-blue-600" onClick={() => handleSendSMS(selectedReport)}>
                    <Phone className="mr-1 h-3 w-3" /> SMS Link
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleSendEmail(selectedReport)}>
                    <Mail className="mr-1 h-3 w-3" /> Email
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDispatch(selectedReport)}>
                    <Share2 className="mr-1 h-3 w-3" /> Mark Dispatched
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportGeneration;
