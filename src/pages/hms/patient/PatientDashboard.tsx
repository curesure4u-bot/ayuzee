import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  User, Phone, Calendar, MapPin, Heart, FileText, Brain, Sparkles,
  Plus, Search, List, Printer, Edit, Mail, MessageSquare, CheckCircle,
  Activity, Pill, ClipboardList, ArrowRight, AlertCircle, Shield,
} from "lucide-react";
import { assessPatientRisk } from "@/services/patientAiService";
import PatientContextHeader from "@/components/hms/PatientContextHeader";
import type { AIPatientInsight } from "@/types/patient-hms";

// Mock patient data
const patientInfo = {
  name: "Mr. Nagaraj 14233",
  id: "AL-8472",
  age: "65 years 1 months 16 days",
  gender: "M",
  mobile: "9443314670",
  dob: "05/06/1961",
  regDate: "13/04/2023 14:26",
  status: "Active",
  address: "THIRUTHANGAL\nTirunelveli",
  source: "family",
  guardian: "",
  familyId: "",
  membership: null,
  groupTag: "",
  photo: null,
};

const medicalHistory = {
  medical: "",
  family: "",
  drug: "",
  social: "",
  allergies: "",
  habits: "",
  surgical: "",
};

const opVisits = [
  { id: "v1", complaint: "Consultation", doctor: "Dr. Mohamad Saleem MD (AYURVEDA)", date: "21/07/2026 14:52", balance: 0, location: "#11, Ma..., Kadayanallur." },
  { id: "v2", complaint: "lower hip pain..", doctor: "Dr. Mohamad Saleem MD (AYURVEDA)", date: "21/07/2026 13:11", balance: 0, location: "195, LA..., PACR SALAI, Rajapalayam" },
  { id: "v3", complaint: "Consultation", doctor: "none", date: "12/07/2026 13:26", balance: 0, location: "43, Mir..., Old GH Road, Theni" },
  { id: "v4", complaint: "op treatment", doctor: "none", date: "31/05/2026 14:39", balance: 0, location: "No 47, Kulavanikar Puram Road, . T" },
  { id: "v5", complaint: "diagnostic", doctor: "Dr. Mohamad Saleem MD (AYURVEDA)", date: "21/07/2026 13:11", balance: 0, location: "4, Dura..., Keelkattalai, Chennai" },
  { id: "v6", complaint: "Diagnostic", doctor: "Dr. sahana fathima B.A.M.S", date: "11/04/2026 11:37", balance: 0, location: "62, B, R..., ., Tenkasi" },
];

const ipSummary = [
  { ipNo: 14, doa: "17/04/2025", dod: "23/04/2025", doctor: "Dr. Vasumathi BAMS", date: "17/04/2025 11:40", billClosed: true },
  { ipNo: 25, doa: "15/05/2023", dod: "", doctor: "Dr. Mohamad Saleem MD (AYURVEDA)", date: "15/05/2023 16:14", billClosed: true },
];

const followUpVisits = [
  { id: "f1", complaint: "Consultation", doctor: "Dr. Mohamad Saleem MD (AYURVEDA)", date: "21/07/2026 14:52" },
  { id: "f2", complaint: "lower hip pain..", doctor: "Dr. Mohamad Saleem MD (AYURVEDA)", date: "21/07/2026 13:11" },
  { id: "f3", complaint: "Consultation", doctor: "none", date: "12/07/2026 13:26" },
  { id: "f4", complaint: "op treatment", doctor: "none", date: "31/05/2026 14:39" },
  { id: "f5", complaint: "diagnostic", doctor: "none", date: "11/04/2026 12:21" },
  { id: "f6", complaint: "Diagnostic", doctor: "Dr. sahana fathima B.A.M.S", date: "11/04/2026 11:37" },
  { id: "f7", complaint: "op treatment", doctor: "Dr. sahana fathima B.A.M.S", date: "11/04/2026 10:17" },
  { id: "f8", complaint: "pain in low back", doctor: "Dr. Vasumathi BAMS", date: "25/01/2026 10:29" },
];

const PatientDashboard = () => {
  const [showNewVisitDialog, setShowNewVisitDialog] = useState(false);
  const [showFollowUpDialog, setShowFollowUpDialog] = useState(false);
  const [visitFilter, setVisitFilter] = useState("All");
  const [aiInsight, setAiInsight] = useState<AIPatientInsight | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const handleAiAssess = async () => {
    setLoadingAi(true);
    const result = await assessPatientRisk(undefined, undefined, 65);
    setAiInsight(result);
    setLoadingAi(false);
  };

  const handleNewVisit = () => setShowNewVisitDialog(true);

  return (
    <div className="space-y-6">
      {/* Patient Context Header with Navigation */}
      <div>
        <PatientContextHeader
          patientName={patientInfo.name}
          patientId={patientInfo.id}
          age={patientInfo.age}
          gender={patientInfo.gender}
          mobile={patientInfo.mobile}
          activeTab="dashboard"
        />
      </div>

      {/* AI Insight Panel */}
      <Card className="border-violet-200 bg-gradient-to-r from-violet-50 to-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-violet-600" />
              <span className="font-semibold text-violet-700">AI Patient Insights</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleAiAssess}
              disabled={loadingAi}
              className="text-violet-600 border-violet-300"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              {loadingAi ? "Analyzing..." : "Generate Insights"}
            </Button>
          </div>
          {aiInsight && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={aiInsight.riskLevel === "Low" ? "secondary" : aiInsight.riskLevel === "High" ? "destructive" : "default"}>
                  Risk: {aiInsight.riskLevel}
                </Badge>
              </div>
              <ul className="text-sm space-y-1">
                {aiInsight.insights.map((insight, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <AlertCircle className="h-3 w-3 mt-1 text-violet-500" />
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
              {aiInsight.suggestedActions.length > 0 && (
                <div className="pt-2 border-t">
                  <p className="text-xs font-medium text-violet-600 mb-1">Suggested Actions:</p>
                  <ul className="text-xs space-y-1">
                    {aiInsight.suggestedActions.map((action, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <ArrowRight className="h-3 w-3 mt-0.5 text-green-500" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Next-Best-Action Quick Actions */}
      <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-white">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <span className="font-semibold text-sm text-emerald-700">AI Suggested Next Actions</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-auto py-2 px-3 text-left justify-start border-emerald-200 hover:bg-emerald-50"
              onClick={() => toast.info("Recording vitals...")}
            >
              <div>
                <p className="text-xs font-medium">Record Vitals</p>
                <p className="text-[10px] text-muted-foreground">BP was borderline last visit</p>
              </div>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-auto py-2 px-3 text-left justify-start border-amber-200 hover:bg-amber-50"
              onClick={() => toast.info("Opening lab orders...")}
            >
              <div>
                <p className="text-xs font-medium">Order HbA1c</p>
                <p className="text-[10px] text-muted-foreground">Last done 3 months ago</p>
              </div>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-auto py-2 px-3 text-left justify-start border-blue-200 hover:bg-blue-50"
              onClick={() => toast.info("Opening prescription...")}
            >
              <div>
                <p className="text-xs font-medium">Refill Prescription</p>
                <p className="text-[10px] text-muted-foreground">30-day Rx ending in 5 days</p>
              </div>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-auto py-2 px-3 text-left justify-start border-violet-200 hover:bg-violet-50"
              onClick={() => toast.info("Scheduling follow-up...")}
            >
              <div>
                <p className="text-xs font-medium">Book Follow-up</p>
                <p className="text-[10px] text-muted-foreground">Review due in 5 days</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Personal Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span>Personal Details <Edit className="inline h-3 w-3 ml-1" /> 🖨️</span>
              <Badge className="bg-green-600 text-white text-xs">Print ID</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium text-muted-foreground">Photo:</span>
              <span className="text-orange-600 hover:underline cursor-pointer">Take Photo Now</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-muted-foreground">Patient Status:</span>
              <Badge className="bg-green-100 text-green-700">{patientInfo.status}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-muted-foreground">Family ID:</span>
              <span>{patientInfo.familyId || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-muted-foreground">Reg Date:</span>
              <span>{patientInfo.regDate} <Edit className="inline h-3 w-3 text-muted-foreground" /></span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-muted-foreground">Membership:</span>
              <Badge variant="destructive" className="text-xs">No membership card</Badge>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-muted-foreground">Group/Tag:</span>
              <span>{patientInfo.groupTag || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-muted-foreground">DOB:</span>
              <span>{patientInfo.dob}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-muted-foreground">Address:</span>
              <span className="text-right whitespace-pre-line">{patientInfo.address}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="font-medium text-muted-foreground">Emergency Contact Details:</span>
              <span>—</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-muted-foreground">Source:</span>
              <span>{patientInfo.source}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-muted-foreground">Guardian:</span>
              <span>{patientInfo.guardian || "—"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Center: Medical History + IP Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              Medical History <Edit className="h-3 w-3" />
              <span className="text-orange-600 text-xs hover:underline cursor-pointer">▼ Diab Record</span>
              <span className="text-orange-600 text-xs hover:underline cursor-pointer">≡ Diab Report</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {Object.entries(medicalHistory).map(([key, val]) => (
              <div key={key} className="flex justify-between">
                <span className="font-medium text-muted-foreground capitalize">{key}:</span>
                <span>{val || "—"}</span>
              </div>
            ))}
          </CardContent>

          <Separator className="my-2" />

          {/* IP/Emergency Summary */}
          <CardHeader className="pb-3 pt-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              IP/Emergency Summary
              <Button size="sm" className="h-6 text-xs bg-green-600 hover:bg-green-700">
                <Plus className="h-3 w-3 mr-1" /> New Admission
              </Button>
              <List className="h-3 w-3 text-muted-foreground cursor-pointer" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {ipSummary.map((ip) => (
              <div key={ip.ipNo} className="border rounded-md p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">IP No:{ip.ipNo} 🖨️</span>
                  <div className="flex gap-3 text-xs">
                    <span><strong>DOA:</strong> {ip.doa}</span>
                    <span><strong>DOD:</strong> {ip.dod || "—"} 🖨️</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-green-600 text-white text-xs">Casesheet</Badge>
                  <Badge className="bg-orange-500 text-white text-xs">🏠 Discharge Summary ▼</Badge>
                </div>
                {ip.dod && <span className="text-orange-600 text-xs">Print</span>}
                {ip.billClosed && <Badge variant="outline" className="text-xs">Bill Closed</Badge>}
                <div className="text-xs text-right text-muted-foreground">
                  {ip.doctor} ✏️<br />{ip.date} ✏️
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Right: OP Visit Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span>OP Visit Summary</span>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  className="h-6 text-xs bg-green-600 hover:bg-green-700"
                  onClick={handleNewVisit}
                >
                  <Plus className="h-3 w-3 mr-1" /> New Visit
                </Button>
                <Button size="sm" variant="outline" className="h-6 text-xs">All</Button>
                <Button size="sm" variant="outline" className="h-6 text-xs">
                  <Search className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline" className="h-6 text-xs">
                  <List className="h-3 w-3" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm max-h-[500px] overflow-y-auto">
            {opVisits.map((visit) => (
              <div key={visit.id} className="border rounded-md p-3 space-y-2">
                <div className="text-orange-600 font-medium text-xs">
                  Chief Complaints: {visit.complaint}
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" className="h-5 w-5 p-0"><Edit className="h-3 w-3" /></Button>
                  <Button size="sm" variant="outline" className="h-5 w-5 p-0"><Printer className="h-3 w-3" /></Button>
                  <Button size="sm" variant="outline" className="h-5 w-5 p-0"><Mail className="h-3 w-3" /></Button>
                  <Button size="sm" variant="outline" className="h-5 w-5 p-0"><MessageSquare className="h-3 w-3" /></Button>
                  <Button size="sm" variant="outline" className="h-5 w-5 p-0"><CheckCircle className="h-3 w-3" /></Button>
                  <Button size="sm" variant="outline" className="h-5 w-5 p-0 text-red-600">C→</Button>
                </div>
                <Badge variant="outline" className="text-xs">Balance: {visit.balance.toFixed(2)}</Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>{visit.doctor}</span>
                </div>
                <div className="text-xs text-right text-muted-foreground flex items-center justify-end gap-1">
                  <ArrowRight className="h-3 w-3" />
                  {visit.location}
                </div>
                <div className="text-xs text-right text-muted-foreground">
                  {visit.date} ✏️
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* New Visit Dialog */}
      <Dialog open={showNewVisitDialog} onOpenChange={setShowNewVisitDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Visit</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Please select whether you want to create a new visit for patient or clone the details from the previous visit!
          </p>
          <div className="flex gap-3 pt-4">
            <Button
              className="bg-red-500 hover:bg-red-600 flex-1"
              onClick={() => {
                setShowNewVisitDialog(false);
                toast.success("New Visit created");
              }}
            >
              New Visit
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 flex-1"
              onClick={() => {
                setShowNewVisitDialog(false);
                setShowFollowUpDialog(true);
              }}
            >
              Follow-up Visit
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Follow-Up Visit Dialog */}
      <Dialog open={showFollowUpDialog} onOpenChange={setShowFollowUpDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Follow-up Visit</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Click any of the following visits to copy its details and use it in a new visit
          </p>
          <p className="text-sm font-medium">
            <strong>Patient Name:</strong> {patientInfo.name}, <strong>ID:</strong> {patientInfo.id}
          </p>
          <div className="space-y-3 mt-4">
            {followUpVisits.map((visit) => (
              <div
                key={visit.id}
                className="border-l-4 border-l-orange-400 rounded-md p-3 flex items-center justify-between hover:bg-muted/30 cursor-pointer"
                onClick={() => {
                  setShowFollowUpDialog(false);
                  toast.success(`Follow-up created from: ${visit.complaint}`);
                }}
              >
                <div>
                  <p className="text-sm font-medium text-orange-600">
                    Chief Complaints: {visit.complaint}
                  </p>
                  <Button size="sm" className="h-6 text-xs bg-green-600 hover:bg-green-700 mt-1">
                    Create Follow-up Visit
                  </Button>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p>{visit.doctor}</p>
                  <p>{visit.date}</p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientDashboard;
