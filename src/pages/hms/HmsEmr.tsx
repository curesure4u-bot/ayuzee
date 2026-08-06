import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  FileText, Save, Mic, MicOff, Camera, Upload, History,
  TrendingUp, Pen, Pill, FlaskConical, Calendar, Printer, Plus,
  Leaf, Brain, ArrowRight,
} from "lucide-react";

type Prescription = {
  id: string;
  medicine: string;
  dose: string;
  frequency: string;
  duration: string;
  instructions: string;
};

type LabResult = {
  id: string;
  test: string;
  value: string;
  unit: string;
  refRange: string;
  date: string;
  status: "normal" | "abnormal" | "critical";
};

type VisitHistory = {
  id: string;
  date: string;
  type: string;
  diagnosis: string;
  doctor: string;
};

const mockLabResults: LabResult[] = [
  { id: "1", test: "Hemoglobin", value: "13.2", unit: "g/dL", refRange: "12-16", date: "2026-07-10", status: "normal" },
  { id: "2", test: "Blood Sugar (Fasting)", value: "142", unit: "mg/dL", refRange: "70-110", date: "2026-07-10", status: "abnormal" },
  { id: "3", test: "ESR", value: "28", unit: "mm/hr", refRange: "0-20", date: "2026-07-10", status: "abnormal" },
  { id: "4", test: "Cholesterol (Total)", value: "210", unit: "mg/dL", refRange: "< 200", date: "2026-07-10", status: "abnormal" },
  { id: "5", test: "Creatinine", value: "0.9", unit: "mg/dL", refRange: "0.6-1.2", date: "2026-07-10", status: "normal" },
];

const mockHistory: VisitHistory[] = [
  { id: "1", date: "2026-07-10", type: "OPD Follow-up", diagnosis: "Amavata (Rheumatoid Arthritis)", doctor: "Dr. Sharma" },
  { id: "2", date: "2026-06-25", type: "OPD New Visit", diagnosis: "Amavata (Rheumatoid Arthritis)", doctor: "Dr. Sharma" },
  { id: "3", date: "2026-06-10", type: "Panchakarma Admission", diagnosis: "Sandhivata (OA Knee)", doctor: "Dr. Nair" },
  { id: "4", date: "2026-05-15", type: "OPD Consultation", diagnosis: "Gridhrasi (Sciatica)", doctor: "Dr. Sharma" },
];

const HmsEmr = () => {
  const navigate = useNavigate();
  const [patientName, setPatientName] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  // SOAP Notes
  const [subjective, setSubjective] = useState("");
  const [objective, setObjective] = useState("");
  const [assessment, setAssessment] = useState("");
  const [plan, setPlan] = useState("");

  // Vitals
  const [bp, setBp] = useState("");
  const [pulse, setPulse] = useState("");
  const [temp, setTemp] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [spo2, setSpo2] = useState("");
  const [rr, setRr] = useState("");

  // Prescription
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([
    { id: "1", medicine: "Simhanada Guggulu", dose: "2 tablets", frequency: "BD", duration: "30 days", instructions: "After food with warm water" },
    { id: "2", medicine: "Rasna Saptak Kwath", dose: "20ml", frequency: "BD", duration: "30 days", instructions: "Before food with honey" },
    { id: "3", medicine: "Yogaraja Guggulu", dose: "2 tablets", frequency: "TDS", duration: "30 days", instructions: "After food" },
  ]);

  // Follow-up
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpNotes, setFollowUpNotes] = useState("");

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast.info("Voice recording started. Speak your notes...");
    } else {
      toast.success("Voice recording stopped. Transcription in progress...");
    }
  };

  const handleSave = () => {
    if (!patientName.trim()) return toast.error("Select a patient");
    toast.success("EMR record saved successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" /> Electronic Medical Record
          </h1>
          <p className="text-sm text-muted-foreground">
            SOAP Notes, Prescriptions, Lab Integration & Clinical Documentation
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/hms/patient/casesheet")}>
            <Leaf className="mr-1 h-4 w-4 text-green-600" /> Ayurveda Case Sheet
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate("/hms/patient/prescription")}>
            <Brain className="mr-1 h-4 w-4 text-violet-600" /> AI Prescription
          </Button>
          <Button variant="outline" onClick={() => toast.info("Printing EMR...")}>
            <Printer className="mr-1 h-4 w-4" /> Print
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-1 h-4 w-4" /> Save Record
          </Button>
        </div>
      </div>

      {/* Patient Selection & Vitals */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <Label>Patient Name / UHID</Label>
              <Input value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="Search patient by name or UHID" />
            </div>
            <div>
              <Label>Visit Type</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New Visit</SelectItem>
                  <SelectItem value="followup">Follow-up</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="panchakarma">Panchakarma Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
            </div>
          </div>

          {/* Vitals Row */}
          <div className="pt-3 border-t">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Vitals</Label>
            <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 mt-2">
              <div>
                <Label className="text-xs">BP</Label>
                <Input value={bp} onChange={(e) => setBp(e.target.value)} placeholder="120/80" className="h-8 text-xs" />
              </div>
              <div>
                <Label className="text-xs">Pulse</Label>
                <Input value={pulse} onChange={(e) => setPulse(e.target.value)} placeholder="72" className="h-8 text-xs" />
              </div>
              <div>
                <Label className="text-xs">Temp (°F)</Label>
                <Input value={temp} onChange={(e) => setTemp(e.target.value)} placeholder="98.6" className="h-8 text-xs" />
              </div>
              <div>
                <Label className="text-xs">Weight (kg)</Label>
                <Input value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="70" className="h-8 text-xs" />
              </div>
              <div>
                <Label className="text-xs">Height (cm)</Label>
                <Input value={height} onChange={(e) => setHeight(e.target.value)} placeholder="170" className="h-8 text-xs" />
              </div>
              <div>
                <Label className="text-xs">SpO2 (%)</Label>
                <Input value={spo2} onChange={(e) => setSpo2(e.target.value)} placeholder="98" className="h-8 text-xs" />
              </div>
              <div>
                <Label className="text-xs">RR</Label>
                <Input value={rr} onChange={(e) => setRr(e.target.value)} placeholder="16" className="h-8 text-xs" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="soap">
        <TabsList className="grid grid-cols-2 sm:grid-cols-6 w-full">
          <TabsTrigger value="soap">SOAP Notes</TabsTrigger>
          <TabsTrigger value="prescription">Prescription</TabsTrigger>
          <TabsTrigger value="labs">Lab Results</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
          <TabsTrigger value="history">Visit History</TabsTrigger>
          <TabsTrigger value="followup">Follow-up</TabsTrigger>
        </TabsList>

        {/* SOAP Notes */}
        <TabsContent value="soap" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">SOAP Documentation</CardTitle>
                <Button
                  variant={isRecording ? "destructive" : "outline"}
                  size="sm"
                  onClick={toggleRecording}
                >
                  {isRecording ? <MicOff className="mr-1 h-4 w-4" /> : <Mic className="mr-1 h-4 w-4" />}
                  {isRecording ? "Stop Recording" : "Voice-to-Text"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isRecording && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-sm text-red-700">Recording... Speak your clinical notes</span>
                </div>
              )}
              <div>
                <Label className="font-medium">S - Subjective (Chief Complaint & History)</Label>
                <Textarea
                  value={subjective}
                  onChange={(e) => setSubjective(e.target.value)}
                  placeholder="Patient's chief complaints, history of present illness, past history, family history, personal history..."
                  rows={4}
                />
              </div>
              <div>
                <Label className="font-medium">O - Objective (Examination Findings)</Label>
                <Textarea
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="Physical examination findings, vital signs observations, systemic examination, local examination..."
                  rows={4}
                />
              </div>
              <div>
                <Label className="font-medium">A - Assessment (Diagnosis)</Label>
                <Textarea
                  value={assessment}
                  onChange={(e) => setAssessment(e.target.value)}
                  placeholder="Provisional/confirmed diagnosis (both modern and AYUSH terminology), differential diagnosis..."
                  rows={3}
                />
              </div>
              <div>
                <Label className="font-medium">P - Plan (Treatment Plan)</Label>
                <Textarea
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  placeholder="Medications, procedures, investigations ordered, diet advice, lifestyle modifications, referral if needed..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prescription */}
        <TabsContent value="prescription" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Pill className="h-4 w-4" /> Current Prescription
                </CardTitle>
                <Button size="sm" variant="outline" onClick={() => {
                  setPrescriptions([...prescriptions, { id: String(Date.now()), medicine: "", dose: "", frequency: "", duration: "", instructions: "" }]);
                }}>
                  <Plus className="mr-1 h-3 w-3" /> Add Medicine
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">#</th>
                      <th className="px-3 py-2 text-left font-medium">Medicine</th>
                      <th className="px-3 py-2 text-left font-medium">Dose</th>
                      <th className="px-3 py-2 text-left font-medium">Frequency</th>
                      <th className="px-3 py-2 text-left font-medium">Duration</th>
                      <th className="px-3 py-2 text-left font-medium">Instructions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptions.map((rx, i) => (
                      <tr key={rx.id} className="border-b">
                        <td className="px-3 py-2">{i + 1}</td>
                        <td className="px-3 py-2 font-medium">{rx.medicine || <Input placeholder="Medicine name" className="h-7 text-xs w-40" />}</td>
                        <td className="px-3 py-2">{rx.dose || <Input placeholder="Dose" className="h-7 text-xs w-20" />}</td>
                        <td className="px-3 py-2">{rx.frequency || <Input placeholder="BD/TDS" className="h-7 text-xs w-16" />}</td>
                        <td className="px-3 py-2">{rx.duration || <Input placeholder="Days" className="h-7 text-xs w-20" />}</td>
                        <td className="px-3 py-2 text-muted-foreground">{rx.instructions || <Input placeholder="Instructions" className="h-7 text-xs w-32" />}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline">
                  <Printer className="mr-1 h-3 w-3" /> Print Prescription
                </Button>
                <Button size="sm" variant="outline">
                  <Pen className="mr-1 h-3 w-3" /> Digital Signature
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lab Results */}
        <TabsContent value="labs" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <FlaskConical className="h-4 w-4" /> Lab Results
                </CardTitle>
                <Button size="sm" variant="outline">Order New Test</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Test</th>
                      <th className="px-3 py-2 text-left font-medium">Value</th>
                      <th className="px-3 py-2 text-left font-medium">Unit</th>
                      <th className="px-3 py-2 text-left font-medium">Ref. Range</th>
                      <th className="px-3 py-2 text-left font-medium">Date</th>
                      <th className="px-3 py-2 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockLabResults.map((lab) => (
                      <tr key={lab.id} className="border-b">
                        <td className="px-3 py-2 font-medium">{lab.test}</td>
                        <td className="px-3 py-2 font-bold">{lab.value}</td>
                        <td className="px-3 py-2 text-muted-foreground">{lab.unit}</td>
                        <td className="px-3 py-2 text-muted-foreground">{lab.refRange}</td>
                        <td className="px-3 py-2 text-muted-foreground">{lab.date}</td>
                        <td className="px-3 py-2">
                          <Badge variant={lab.status === "normal" ? "outline" : lab.status === "critical" ? "destructive" : "secondary"}>
                            {lab.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4">
                <Button size="sm" variant="outline">
                  <TrendingUp className="mr-1 h-3 w-3" /> View Trend Graphs
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attachments */}
        <TabsContent value="attachments" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Clinical Attachments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 cursor-pointer transition">
                  <Camera className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Clinical Images</p>
                  <p className="text-xs text-muted-foreground">Capture or upload clinical photographs</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Camera className="mr-1 h-3 w-3" /> Take Photo
                  </Button>
                </div>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 cursor-pointer transition">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Upload Documents</p>
                  <p className="text-xs text-muted-foreground">PDF reports, previous records, scans</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Upload className="mr-1 h-3 w-3" /> Upload PDF
                  </Button>
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-sm font-medium mb-3">Uploaded Files</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Blood_Report_July2026.pdf</span>
                    </div>
                    <Badge variant="outline" className="text-xs">Jul 10, 2026</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Camera className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Joint_Photo_Before.jpg</span>
                    </div>
                    <Badge variant="outline" className="text-xs">Jun 25, 2026</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-red-500" />
                      <span className="text-sm">XRay_Knee_Report.pdf</span>
                    </div>
                    <Badge variant="outline" className="text-xs">Jun 10, 2026</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Visit History */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <History className="h-4 w-4" /> Visit History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockHistory.map((visit) => (
                  <div key={visit.id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/30 cursor-pointer transition">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{visit.type}</p>
                        <p className="text-xs text-muted-foreground">{visit.diagnosis}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{new Date(visit.date).toLocaleDateString("en-IN")}</p>
                      <p className="text-xs text-muted-foreground">{visit.doctor}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Follow-up */}
        <TabsContent value="followup" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Follow-up Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Next Follow-up Date</Label>
                  <Input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} />
                </div>
                <div>
                  <Label>Follow-up Type</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="routine">Routine Review</SelectItem>
                      <SelectItem value="lab_review">Lab Report Review</SelectItem>
                      <SelectItem value="panchakarma">Post-Panchakarma Review</SelectItem>
                      <SelectItem value="medicine_review">Medicine Efficacy Review</SelectItem>
                      <SelectItem value="discharge">Discharge Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Follow-up Instructions</Label>
                <Textarea
                  value={followUpNotes}
                  onChange={(e) => setFollowUpNotes(e.target.value)}
                  placeholder="Instructions for the patient before next visit, tests to be done, lifestyle changes to report on..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Remind Patient Via</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="call">Phone Call</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="all">All channels</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Reminder Days Before</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day before</SelectItem>
                      <SelectItem value="2">2 days before</SelectItem>
                      <SelectItem value="3">3 days before</SelectItem>
                      <SelectItem value="7">1 week before</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HmsEmr;
