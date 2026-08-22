import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Stethoscope, Video, CalendarClock, UserPlus, Users, ClipboardList,
  BedDouble, Brain, Send, Phone, MessageSquare, ArrowRight, FileText,
  CheckCircle2, Clock, AlertTriangle, Sparkles, RefreshCw, Heart,
  Pill, ExternalLink, Star, Activity, Loader2,
} from "lucide-react";
import { useOpdQueue } from "@/hooks/useOpdQueue";

// ─── Types ────────────────────────────────────────────────────────────────────
type Consultation = {
  id: string;
  tokenNo: number;
  patientName: string;
  patientId: string;
  phone: string;
  age: number;
  gender: "M" | "F";
  type: "new" | "follow-up" | "review" | "online";
  doctor: string;
  department: string;
  time: string;
  status: "waiting" | "in-consultation" | "completed" | "no-show";
  chiefComplaint: string;
  vitals?: { bp: string; pulse: string; temp: string; weight: string };
};

type FollowUp = {
  id: string;
  patientName: string;
  phone: string;
  doctor: string;
  lastVisit: string;
  nextDue: string;
  reason: string;
  status: "pending" | "confirmed" | "rescheduled" | "completed" | "missed";
  aiInstruction: string;
  assignedTo: "front-desk" | "helpdesk" | "doctor" | "therapist";
  channel: "sms" | "whatsapp" | "call" | "app";
};

type Referral = {
  id: string;
  patientName: string;
  fromDoctor: string;
  toDoctor: string;
  toDepartment: string;
  reason: string;
  date: string;
  status: "pending" | "accepted" | "completed";
  priority: "routine" | "urgent" | "emergency";
};

type IpReview = {
  id: string;
  patientName: string;
  ipNo: string;
  ward: string;
  bedNo: string;
  admissionDate: string;
  doctor: string;
  diagnosis: string;
  dayOfAdmission: number;
  nextReview: string;
  status: "stable" | "improving" | "critical" | "discharge-ready";
  aiSummary: string;
};

// ─── Sample Data ──────────────────────────────────────────────────────────────
const CONSULTATIONS: Consultation[] = [
  { id: "C1", tokenNo: 1, patientName: "Ramesh Kumar", patientId: "P-1023", phone: "9876543210", age: 45, gender: "M", type: "follow-up", doctor: "Dr. Mohamad Saleem", department: "Ayurveda", time: "09:00", status: "completed", chiefComplaint: "Knee joint pain - Day 7 follow-up after Panchakarma", vitals: { bp: "130/85", pulse: "78", temp: "98.4", weight: "72" } },
  { id: "C2", tokenNo: 2, patientName: "Lakshmi Devi", patientId: "P-1045", phone: "8765432109", age: 38, gender: "F", type: "review", doctor: "Dr. Swathi", department: "Panchakarma", time: "09:30", status: "in-consultation", chiefComplaint: "14-day Panchakarma review - Day 7 assessment", vitals: { bp: "120/80", pulse: "72", temp: "98.2", weight: "58" } },
  { id: "C3", tokenNo: 3, patientName: "Suresh Babu", patientId: "P-1089", phone: "7654321098", age: 52, gender: "M", type: "follow-up", doctor: "Dr. Mohamad Saleem", department: "Ayurveda", time: "10:00", status: "waiting", chiefComplaint: "Vasti protocol Day 4 - bowel assessment", vitals: { bp: "140/90", pulse: "82", temp: "98.6", weight: "80" } },
  { id: "C4", tokenNo: 4, patientName: "Meena K", patientId: "P-NEW", phone: "6543210987", age: 30, gender: "F", type: "new", doctor: "Dr. Manish", department: "Naturopathy", time: "10:30", status: "waiting", chiefComplaint: "Chronic lower back pain, requesting Kizhi therapy" },
  { id: "C5", tokenNo: 5, patientName: "Arun P", patientId: "P-0987", phone: "5432109876", age: 28, gender: "M", type: "online", doctor: "Dr. Mohamad Saleem", department: "Ayurveda", time: "11:00", status: "waiting", chiefComplaint: "Post-Nasya follow-up - sinus improvement check" },
  { id: "C6", tokenNo: 6, patientName: "Priya S", patientId: "P-NEW", phone: "4321098765", age: 35, gender: "F", type: "new", doctor: "Dr. DR.PRIYANKA", department: "Acupuncture", time: "11:30", status: "waiting", chiefComplaint: "Migraine - seeking acupuncture treatment" },
];

const ONLINE_CONSULTATIONS: Consultation[] = [
  { id: "OC1", tokenNo: 101, patientName: "Arun P", patientId: "P-0987", phone: "5432109876", age: 28, gender: "M", type: "online", doctor: "Dr. Mohamad Saleem", department: "Ayurveda", time: "11:00", status: "waiting", chiefComplaint: "Post-Nasya follow-up" },
  { id: "OC2", tokenNo: 102, patientName: "Vijay R", patientId: "P-0654", phone: "9988776655", age: 40, gender: "M", type: "online", doctor: "Dr. Swathi", department: "Panchakarma", time: "11:30", status: "waiting", chiefComplaint: "Diet consultation for Virechana prep" },
  { id: "OC3", tokenNo: 103, patientName: "Deepa M", patientId: "P-0712", phone: "8877665544", age: 33, gender: "F", type: "online", doctor: "Dr. Mohamad Saleem", department: "Ayurveda", time: "14:00", status: "waiting", chiefComplaint: "Prakriti assessment + lifestyle guidance" },
];

const FOLLOW_UPS: FollowUp[] = [
  { id: "FU1", patientName: "Ramesh Kumar", phone: "9876543210", doctor: "Dr. Mohamad Saleem", lastVisit: "2026-07-21", nextDue: "2026-07-24", reason: "Post-Shirodhara check, pain scale assessment", status: "confirmed", aiInstruction: "Check VAS pain score. If reduced to <3, proceed to maintenance phase. If >5, extend Shirodhara 3 more days.", assignedTo: "front-desk", channel: "whatsapp" },
  { id: "FU2", patientName: "Lakshmi Devi", phone: "8765432109", doctor: "Dr. Swathi", lastVisit: "2026-07-21", nextDue: "2026-07-22", reason: "Daily Panchakarma review - Day 8 Virechana prep", status: "confirmed", aiInstruction: "Start Snehapana today. Give ghee 30ml morning empty stomach. Monitor stools. Inform if any nausea.", assignedTo: "therapist", channel: "sms" },
  { id: "FU3", patientName: "Suresh Babu", phone: "7654321098", doctor: "Dr. Mohamad Saleem", lastVisit: "2026-07-21", nextDue: "2026-07-22", reason: "Vasti Day 5 - alternate day Anuvasana", status: "pending", aiInstruction: "Anuvasana Vasti with Sesame oil 60ml. Ensure empty stomach. Monitor retention time (target 6+ hrs).", assignedTo: "front-desk", channel: "call" },
  { id: "FU4", patientName: "Mohan G", phone: "3210987654", doctor: "Dr. Manish", lastVisit: "2026-07-18", nextDue: "2026-07-21", reason: "Yoga therapy progress check", status: "missed", aiInstruction: "Patient missed scheduled follow-up. Re-contact and reschedule within 2 days. Check adherence to home exercises.", assignedTo: "helpdesk", channel: "call" },
  { id: "FU5", patientName: "Anitha R", phone: "2109876543", doctor: "Dr. DR.PRIYANKA", lastVisit: "2026-07-19", nextDue: "2026-07-26", reason: "Acupuncture session 4 of 6", status: "pending", aiInstruction: "Continue same point protocol. Add LI-4, ST-36 if shoulder pain persists. 20 min needle retention.", assignedTo: "doctor", channel: "whatsapp" },
  { id: "FU6", patientName: "Kavitha P", phone: "1098765432", doctor: "Dr. Mohamad Saleem", lastVisit: "2026-07-15", nextDue: "2026-07-22", reason: "1-week post-discharge review (Panchakarma)", status: "pending", aiInstruction: "Post-Panchakarma diet adherence check. Assess Agni (digestion). Continue Rasayana for 30 days. Blood work if needed.", assignedTo: "front-desk", channel: "whatsapp" },
];

const REFERRALS: Referral[] = [
  { id: "R1", patientName: "Meena K", fromDoctor: "Dr. Manish", toDoctor: "Dr. Mohamad Saleem", toDepartment: "Panchakarma", reason: "Chronic LBP - needs Kati Vasti assessment", date: "2026-07-21", status: "pending", priority: "routine" },
  { id: "R2", patientName: "Suresh Babu", fromDoctor: "Dr. Mohamad Saleem", toDoctor: "Dr. DR.PRIYANKA", toDepartment: "Acupuncture", reason: "Add acupuncture to Vasti protocol for nerve pain", date: "2026-07-21", status: "accepted", priority: "routine" },
  { id: "R3", patientName: "Arun P", fromDoctor: "Dr. Mohamad Saleem", toDoctor: "Dr. Swathi", toDepartment: "Panchakarma", reason: "Post-Nasya - needs Abhyanga course for full body detox", date: "2026-07-20", status: "completed", priority: "routine" },
  { id: "R4", patientName: "Vijay R", fromDoctor: "Dr. Swathi", toDoctor: "Dr. Mohamad Saleem", toDepartment: "Ayurveda", reason: "Elevated Pitta post-Virechana - needs internal medicine consult", date: "2026-07-21", status: "pending", priority: "urgent" },
];

const IP_REVIEWS: IpReview[] = [
  { id: "IP1", patientName: "Gopal N", ipNo: "IP-2026-0045", ward: "Panchakarma Ward", bedNo: "PK-3", admissionDate: "2026-07-17", doctor: "Dr. Mohamad Saleem", diagnosis: "Rheumatoid Arthritis - Amavata", dayOfAdmission: 5, nextReview: "2026-07-22 09:00", status: "improving", aiSummary: "Day 5: Snehapana phase completed. Adequate sneha features observed. Start Virechana tomorrow. Continue Rasnadi Kashayam." },
  { id: "IP2", patientName: "Saroja M", ipNo: "IP-2026-0048", ward: "General Ward", bedNo: "GW-7", admissionDate: "2026-07-19", doctor: "Dr. Swathi", diagnosis: "Cervical Spondylosis - Greeva Stambha", dayOfAdmission: 3, nextReview: "2026-07-21 14:00", status: "stable", aiSummary: "Day 3: Greeva Vasti ongoing. Pain VAS reduced 7→5. Continue same protocol. Add Nasya from Day 5 if neck mobility improves." },
  { id: "IP3", patientName: "Murugan K", ipNo: "IP-2026-0050", ward: "Panchakarma Ward", bedNo: "PK-1", admissionDate: "2026-07-20", doctor: "Dr. Mohamad Saleem", diagnosis: "Lumbar Disc Prolapse - Kati Shoola", dayOfAdmission: 2, nextReview: "2026-07-22 10:00", status: "stable", aiSummary: "Day 2: Kati Vasti with Mahanarayan Tailam started. Patient comfortable. Monitor for any radiating pain increase. Bed rest advised." },
];

// ─── Active Consultations Tab ─────────────────────────────────────────────────
const ActiveConsultationsTab = () => {
  const { visits, loading, updateVisitStatus } = useOpdQueue();

  const statusColor: Record<string, string> = {
    checked_in: "bg-yellow-100 text-yellow-700",
    in_consultation: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    no_show: "bg-red-100 text-red-700",
    checked_out: "bg-gray-100 text-gray-600",
  };

  const handleStart = async (visitId: string) => {
    try {
      await updateVisitStatus(visitId, "in_consultation");
      toast.success("Consultation started");
    } catch (e: any) {
      toast.error(e.message || "Failed to update status");
    }
  };

  const handleComplete = async (visitId: string) => {
    try {
      await updateVisitStatus(visitId, "completed");
      toast.success("Consultation completed");
    } catch (e: any) {
      toast.error(e.message || "Failed to update status");
    }
  };

  if (loading) return <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3"><p className="text-xs text-muted-foreground">Total Today</p><p className="text-2xl font-bold">{visits.length}</p></Card>
        <Card className="p-3"><p className="text-xs text-muted-foreground">Waiting</p><p className="text-2xl font-bold text-yellow-600">{visits.filter(v => v.status === "checked_in").length}</p></Card>
        <Card className="p-3"><p className="text-xs text-muted-foreground">In Consultation</p><p className="text-2xl font-bold text-blue-600">{visits.filter(v => v.status === "in_consultation").length}</p></Card>
        <Card className="p-3"><p className="text-xs text-muted-foreground">Completed</p><p className="text-2xl font-bold text-green-600">{visits.filter(v => v.status === "completed").length}</p></Card>
      </div>
      {visits.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No patients checked in today. Register a patient to start the queue.</CardContent></Card>
      ) : (
      <Card>
        <CardContent className="pt-4">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-orange-600 font-semibold">Token</TableHead>
                <TableHead className="text-orange-600 font-semibold">Patient</TableHead>
                <TableHead className="text-orange-600 font-semibold">Type</TableHead>
                <TableHead className="text-orange-600 font-semibold">Doctor</TableHead>
                <TableHead className="text-orange-600 font-semibold">Time</TableHead>
                <TableHead className="text-orange-600 font-semibold">Complaint</TableHead>
                <TableHead className="text-orange-600 font-semibold">Status</TableHead>
                <TableHead className="text-orange-600 font-semibold">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visits.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-bold text-sm">{v.session_token}</TableCell>
                  <TableCell>
                    <div><span className="text-sm font-medium">{v.patient_name}</span></div>
                    <span className="text-[10px] text-muted-foreground">{v.patient_display_id} | {v.patient_age || "—"}{v.patient_gender?.[0] || ""} | {v.patient_phone || ""}</span>
                  </TableCell>
                  <TableCell><Badge variant="outline" className={`text-[10px] ${v.mode_visit === "Direct" ? "border-green-300 text-green-700" : v.mode_visit === "Teleconsult" ? "border-purple-300 text-purple-700" : "border-blue-300 text-blue-700"}`}>{v.mode_visit}</Badge></TableCell>
                  <TableCell className="text-xs">{v.doctor_name || "Unassigned"}</TableCell>
                  <TableCell className="text-sm">{new Date(v.check_in_time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</TableCell>
                  <TableCell className="text-xs max-w-[200px] truncate">{v.chief_complaint || "—"}</TableCell>
                  <TableCell><Badge className={`text-[9px] ${statusColor[v.status] || "bg-gray-100"}`}>{v.status.replace("_", " ")}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {v.status === "checked_in" && (
                        <Button size="sm" className="h-6 text-[10px] bg-green-600 hover:bg-green-700" onClick={() => handleStart(v.id)}>Start</Button>
                      )}
                      {v.status === "in_consultation" && (
                        <Button size="sm" className="h-6 text-[10px] bg-blue-600 hover:bg-blue-700" onClick={() => handleComplete(v.id)}>Complete</Button>
                      )}
                      {v.mode_visit === "Teleconsult" && <Button size="sm" variant="outline" className="h-6 text-[10px] gap-0.5"><Video className="h-3 w-3" /></Button>}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      )}
    </div>
  );
};

// ─── Online Consultation Tab ──────────────────────────────────────────────────
const OnlineConsultationTab = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      <Card className="p-3"><p className="text-xs text-muted-foreground">Scheduled Today</p><p className="text-2xl font-bold">{ONLINE_CONSULTATIONS.length}</p></Card>
      <Card className="p-3"><p className="text-xs text-muted-foreground">Avg Duration</p><p className="text-2xl font-bold text-blue-600">12 min</p></Card>
      <Card className="p-3"><p className="text-xs text-muted-foreground">Platform</p><p className="text-xs font-medium text-green-600 mt-1">Video + Chat ready</p></Card>
    </div>
    {ONLINE_CONSULTATIONS.map((oc) => (
      <Card key={oc.id} className="border-l-4 border-l-purple-500">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-sm">{oc.patientName} <Badge variant="outline" className="text-[9px] ml-1">{oc.patientId}</Badge></h4>
              <p className="text-xs text-muted-foreground">{oc.chiefComplaint}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Doctor: {oc.doctor} | Time: {oc.time} | Dept: {oc.department}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="h-7 text-xs bg-purple-600 hover:bg-purple-700 gap-1"><Video className="h-3.5 w-3.5" /> Start Video</Button>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1"><MessageSquare className="h-3.5 w-3.5" /> Chat</Button>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1"><Phone className="h-3.5 w-3.5" /> Call</Button>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Button size="sm" variant="outline" className="h-6 text-[10px] gap-0.5"><FileText className="h-3 w-3" /> View History</Button>
            <Button size="sm" variant="outline" className="h-6 text-[10px] gap-0.5"><Brain className="h-3 w-3" /> AI Summary</Button>
            <Button size="sm" variant="outline" className="h-6 text-[10px] gap-0.5"><Pill className="h-3 w-3" /> Prescribe</Button>
            <Button size="sm" variant="outline" className="h-6 text-[10px] gap-0.5"><CalendarClock className="h-3 w-3" /> Schedule Follow-up</Button>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

// ─── Book Appointment Tab ─────────────────────────────────────────────────────
const BookAppointmentTab = () => {
  const [patientType, setPatientType] = useState<"new" | "existing">("existing");
  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        <Button variant={patientType === "existing" ? "default" : "outline"} className={patientType === "existing" ? "bg-orange-500 hover:bg-orange-600" : ""} onClick={() => setPatientType("existing")}>
          <Users className="h-4 w-4 mr-1.5" /> Existing Patient
        </Button>
        <Button variant={patientType === "new" ? "default" : "outline"} className={patientType === "new" ? "bg-green-600 hover:bg-green-700" : ""} onClick={() => setPatientType("new")}>
          <UserPlus className="h-4 w-4 mr-1.5" /> New Patient
        </Button>
      </div>

      <Card>
        <CardContent className="pt-4 space-y-4">
          {patientType === "existing" ? (
            <div className="space-y-4">
              <div><Label className="text-xs">Search Patient (ID / Name / Phone)</Label><Input className="h-9" placeholder="Type patient name, ID, or phone..." /></div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground mb-2">Recent Patients:</p>
                <div className="space-y-2">
                  {["Ramesh Kumar (P-1023) - Last: 21/07/2026", "Lakshmi Devi (P-1045) - Last: 21/07/2026", "Suresh Babu (P-1089) - Last: 21/07/2026"].map((p, i) => (
                    <div key={i} className="flex items-center justify-between rounded bg-white border p-2">
                      <span className="text-xs">{p}</span>
                      <Button size="sm" className="h-6 text-[10px] bg-orange-500 hover:bg-orange-600">Select</Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div><Label className="text-xs">Full Name *</Label><Input className="h-8" placeholder="Patient name" /></div>
              <div><Label className="text-xs">Phone *</Label><Input className="h-8" placeholder="Mobile number" /></div>
              <div><Label className="text-xs">Age *</Label><Input className="h-8" type="number" placeholder="Age" /></div>
              <div><Label className="text-xs">Gender *</Label>
                <Select><SelectTrigger className="h-8"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent><SelectItem value="M">Male</SelectItem><SelectItem value="F">Female</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Email</Label><Input className="h-8" placeholder="Email (optional)" /></div>
              <div><Label className="text-xs">Address</Label><Input className="h-8" placeholder="City" /></div>
            </div>
          )}

          <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div><Label className="text-xs">Consultation Type *</Label>
              <Select><SelectTrigger className="h-8"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">General Consultation</SelectItem>
                  <SelectItem value="follow-up">Follow-up Visit</SelectItem>
                  <SelectItem value="therapy-review">Therapy Review</SelectItem>
                  <SelectItem value="online">Online Consultation</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Doctor *</Label>
              <Select><SelectTrigger className="h-8"><SelectValue placeholder="Select doctor" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="saleem">Dr. Mohamad Saleem (Ayurveda)</SelectItem>
                  <SelectItem value="swathi">Dr. Swathi (Panchakarma)</SelectItem>
                  <SelectItem value="priyanka">Dr. PRIYANKA (Acupuncture)</SelectItem>
                  <SelectItem value="manish">Dr. Manish (Naturopathy)</SelectItem>
                  <SelectItem value="jawahira">Dr. Jawahira Banu (Homeopathy)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Date *</Label><Input type="date" className="h-8" defaultValue="2026-07-21" /></div>
            <div><Label className="text-xs">Time Slot</Label>
              <Select><SelectTrigger className="h-8"><SelectValue placeholder="Select slot" /></SelectTrigger>
                <SelectContent>
                  {["09:00", "09:15", "09:30", "09:45", "10:00", "10:15", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00"].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2"><Label className="text-xs">Chief Complaint</Label><Input className="h-8" placeholder="Brief complaint or reason for visit..." /></div>
          </div>

          <div className="border-t pt-3 flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2"><Checkbox defaultChecked /><Label className="text-xs">Send SMS confirmation</Label></div>
            <div className="flex items-center gap-2"><Checkbox defaultChecked /><Label className="text-xs">WhatsApp reminder</Label></div>
            <div className="flex items-center gap-2"><Checkbox /><Label className="text-xs">Request advance payment</Label></div>
          </div>

          <Button className="bg-orange-500 hover:bg-orange-600 w-full md:w-auto" onClick={() => toast.success("Appointment booked! Confirmation sent to patient via SMS & WhatsApp.")}>
            <CalendarClock className="h-4 w-4 mr-1.5" /> Book Appointment
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

// ─── Follow-ups Tab ───────────────────────────────────────────────────────────
const FollowUpsTab = () => {
  const statusColor: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-green-100 text-green-700",
    rescheduled: "bg-blue-100 text-blue-700",
    completed: "bg-gray-100 text-gray-700",
    missed: "bg-red-100 text-red-700",
  };
  const assignColor: Record<string, string> = {
    "front-desk": "bg-orange-100 text-orange-700",
    helpdesk: "bg-purple-100 text-purple-700",
    doctor: "bg-blue-100 text-blue-700",
    therapist: "bg-green-100 text-green-700",
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-3"><p className="text-xs text-muted-foreground">Total Due</p><p className="text-2xl font-bold">{FOLLOW_UPS.length}</p></Card>
        <Card className="p-3"><p className="text-xs text-muted-foreground">Confirmed</p><p className="text-2xl font-bold text-green-600">{FOLLOW_UPS.filter(f => f.status === "confirmed").length}</p></Card>
        <Card className="p-3"><p className="text-xs text-muted-foreground">Pending</p><p className="text-2xl font-bold text-yellow-600">{FOLLOW_UPS.filter(f => f.status === "pending").length}</p></Card>
        <Card className="p-3"><p className="text-xs text-muted-foreground">Missed</p><p className="text-2xl font-bold text-red-600">{FOLLOW_UPS.filter(f => f.status === "missed").length}</p></Card>
        <Card className="p-3"><p className="text-xs text-muted-foreground">AI Status</p><p className="text-[10px] text-green-600 font-medium mt-1">All instructions generated</p><p className="text-[10px] text-blue-600">4 auto-reminders sent</p></Card>
      </div>

      {FOLLOW_UPS.map((fu) => (
        <Card key={fu.id} className={`border-l-4 ${fu.status === "missed" ? "border-l-red-500" : fu.status === "confirmed" ? "border-l-green-500" : "border-l-yellow-500"}`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm">{fu.patientName}</h4>
                  <Badge className={`text-[9px] ${statusColor[fu.status]}`}>{fu.status}</Badge>
                  <Badge className={`text-[9px] ${assignColor[fu.assignedTo]}`}>{fu.assignedTo}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{fu.reason}</p>
                <p className="text-[10px] text-muted-foreground">Doctor: {fu.doctor} | Due: {fu.nextDue} | Channel: {fu.channel}</p>
              </div>
              <div className="flex gap-1.5">
                <Button size="sm" variant="outline" className="h-6 text-[10px] gap-0.5" onClick={() => toast.info(`Calling ${fu.patientName}...`)}><Phone className="h-3 w-3" /></Button>
                <Button size="sm" variant="outline" className="h-6 text-[10px] gap-0.5" onClick={() => toast.success("WhatsApp reminder sent")}><MessageSquare className="h-3 w-3" /></Button>
                <Button size="sm" variant="outline" className="h-6 text-[10px] gap-0.5" onClick={() => toast.success("SMS sent")}><Send className="h-3 w-3" /></Button>
              </div>
            </div>

            {/* AI Instruction */}
            <div className="mt-3 rounded-lg bg-purple-50/50 border border-purple-200 p-2.5">
              <span className="text-[10px] font-semibold text-purple-700 flex items-center gap-1"><Brain className="h-3 w-3" /> AI Follow-up Instruction:</span>
              <p className="text-xs mt-1">{fu.aiInstruction}</p>
            </div>

            <div className="flex gap-2 mt-3">
              <Button size="sm" className="h-6 text-[10px] bg-green-600 hover:bg-green-700 gap-0.5" onClick={() => toast.success("Marked as confirmed")}><CheckCircle2 className="h-3 w-3" /> Confirm</Button>
              <Button size="sm" variant="outline" className="h-6 text-[10px] gap-0.5"><CalendarClock className="h-3 w-3" /> Reschedule</Button>
              <Button size="sm" variant="outline" className="h-6 text-[10px] gap-0.5"><ArrowRight className="h-3 w-3" /> Transfer to Helpdesk</Button>
              <Button size="sm" variant="outline" className="h-6 text-[10px] gap-0.5"><Stethoscope className="h-3 w-3" /> Assign to Doctor</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// ─── Therapy Review Tab ───────────────────────────────────────────────────────
const TherapyReviewTab = () => (
  <div className="space-y-4">
    <Card className="border-orange-200 bg-orange-50/20">
      <CardContent className="p-4">
        <h3 className="font-semibold text-sm flex items-center gap-1.5 mb-3"><Heart className="h-4 w-4 text-orange-500" /> Therapy Patients Pending Doctor Review</h3>
        <div className="space-y-3">
          {[
            { patient: "Lakshmi Devi", therapy: "14-Day Panchakarma", day: 7, therapist: "Mrs. Lakshmi", note: "Mid-protocol assessment needed. Check dosha balance and adjust if needed." },
            { patient: "Suresh Babu", therapy: "8-Day Vasti", day: 4, therapist: "Mr. Ravi", note: "Alternate day review. Check bowel clearance and retention time." },
            { patient: "Ramesh Kumar", therapy: "Shirodhara Course", day: 4, therapist: "Mrs. Priya", note: "VAS pain assessment. Consider adding Abhyanga if sleep quality not improving." },
          ].map((item, i) => (
            <div key={i} className="rounded-lg border bg-white p-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-sm">{item.patient}</span>
                  <span className="text-xs text-muted-foreground ml-2">{item.therapy} - Day {item.day}</span>
                </div>
                <Badge className="bg-orange-100 text-orange-700 text-[9px]">Review Due</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Therapist: {item.therapist}</p>
              <div className="mt-2 rounded bg-purple-50 border border-purple-100 p-2">
                <span className="text-[10px] font-semibold text-purple-700 flex items-center gap-1"><Brain className="h-2.5 w-2.5" /> AI Note:</span>
                <p className="text-[10px] mt-0.5">{item.note}</p>
              </div>
              <div className="flex gap-2 mt-2">
                <Button size="sm" className="h-6 text-[10px] bg-green-600 hover:bg-green-700">Start Review</Button>
                <Button size="sm" variant="outline" className="h-6 text-[10px]">View Progress</Button>
                <Button size="sm" variant="outline" className="h-6 text-[10px]">Message Therapist</Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// ─── IP Review Tab ────────────────────────────────────────────────────────────
const IpReviewTab = () => {
  const statusColor: Record<string, string> = {
    stable: "bg-blue-100 text-blue-700",
    improving: "bg-green-100 text-green-700",
    critical: "bg-red-100 text-red-700",
    "discharge-ready": "bg-purple-100 text-purple-700",
  };
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3"><p className="text-xs text-muted-foreground">IP Patients</p><p className="text-2xl font-bold">{IP_REVIEWS.length}</p></Card>
        <Card className="p-3"><p className="text-xs text-muted-foreground">Reviews Today</p><p className="text-2xl font-bold text-blue-600">2</p></Card>
        <Card className="p-3"><p className="text-xs text-muted-foreground">Improving</p><p className="text-2xl font-bold text-green-600">{IP_REVIEWS.filter(i => i.status === "improving").length}</p></Card>
        <Card className="p-3"><p className="text-xs text-muted-foreground">Discharge Ready</p><p className="text-2xl font-bold text-purple-600">0</p></Card>
      </div>

      {IP_REVIEWS.map((ip) => (
        <Card key={ip.id} className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm">{ip.patientName}</h4>
                  <Badge className={`text-[9px] ${statusColor[ip.status]}`}>{ip.status}</Badge>
                  <Badge variant="outline" className="text-[9px]">{ip.ipNo}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{ip.diagnosis}</p>
                <p className="text-[10px] text-muted-foreground">Ward: {ip.ward} | Bed: {ip.bedNo} | Day {ip.dayOfAdmission} | Doctor: {ip.doctor}</p>
                <p className="text-[10px] text-muted-foreground">Next Review: {ip.nextReview}</p>
              </div>
              <Button size="sm" className="h-7 text-xs bg-blue-600 hover:bg-blue-700 gap-1"><ClipboardList className="h-3.5 w-3.5" /> Review</Button>
            </div>
            <div className="mt-3 rounded-lg bg-purple-50/50 border border-purple-200 p-2.5">
              <span className="text-[10px] font-semibold text-purple-700 flex items-center gap-1"><Brain className="h-3 w-3" /> AI Clinical Summary:</span>
              <p className="text-xs mt-1">{ip.aiSummary}</p>
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="outline" className="h-6 text-[10px] gap-0.5"><FileText className="h-3 w-3" /> Notes</Button>
              <Button size="sm" variant="outline" className="h-6 text-[10px] gap-0.5"><Pill className="h-3 w-3" /> Medications</Button>
              <Button size="sm" variant="outline" className="h-6 text-[10px] gap-0.5"><Activity className="h-3 w-3" /> Vitals</Button>
              <Button size="sm" variant="outline" className="h-6 text-[10px] gap-0.5"><Brain className="h-3 w-3" /> AI Suggest</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// ─── Referrals Tab ────────────────────────────────────────────────────────────
const ReferralsTab = () => {
  const statusColor: Record<string, string> = { pending: "bg-yellow-100 text-yellow-700", accepted: "bg-blue-100 text-blue-700", completed: "bg-green-100 text-green-700" };
  const priorityColor: Record<string, string> = { routine: "bg-gray-100 text-gray-700", urgent: "bg-orange-100 text-orange-700", emergency: "bg-red-100 text-red-700" };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Doctor & Therapist Referrals</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-orange-500 hover:bg-orange-600 gap-1"><ExternalLink className="h-3.5 w-3.5" /> New Referral</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="text-orange-500">Create Referral</DialogTitle></DialogHeader>
            <div className="space-y-3 py-3">
              <div><Label className="text-xs">Patient *</Label><Input className="h-8" placeholder="Search patient..." /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">From Doctor</Label><Input className="h-8" defaultValue="Dr. Mohamad Saleem" readOnly /></div>
                <div><Label className="text-xs">To Doctor/Dept *</Label>
                  <Select><SelectTrigger className="h-8"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="panchakarma">Panchakarma - Dr. Swathi</SelectItem>
                      <SelectItem value="acupuncture">Acupuncture - Dr. PRIYANKA</SelectItem>
                      <SelectItem value="naturopathy">Naturopathy - Dr. Manish</SelectItem>
                      <SelectItem value="homeopathy">Homeopathy - Dr. Jawahira</SelectItem>
                      <SelectItem value="yoga">Yoga Therapy</SelectItem>
                      <SelectItem value="therapist">Therapist (Direct)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label className="text-xs">Reason / Instructions</Label><Textarea rows={3} placeholder="Referral reason and instructions..." /></div>
              <div><Label className="text-xs">Priority</Label>
                <Select defaultValue="routine"><SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="routine">Routine</SelectItem><SelectItem value="urgent">Urgent</SelectItem><SelectItem value="emergency">Emergency</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => toast.success("Referral created! Notification sent to receiving doctor.")}>
                <Send className="h-4 w-4 mr-1" /> Send Referral
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {REFERRALS.map((ref) => (
        <Card key={ref.id} className={`border-l-4 ${ref.priority === "urgent" ? "border-l-orange-500" : ref.priority === "emergency" ? "border-l-red-500" : "border-l-gray-300"}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm">{ref.patientName}</h4>
                  <Badge className={`text-[9px] ${statusColor[ref.status]}`}>{ref.status}</Badge>
                  <Badge className={`text-[9px] ${priorityColor[ref.priority]}`}>{ref.priority}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{ref.reason}</p>
                <p className="text-[10px] text-muted-foreground">From: {ref.fromDoctor} → To: {ref.toDoctor} ({ref.toDepartment}) | {ref.date}</p>
              </div>
              <div className="flex gap-1.5">
                {ref.status === "pending" && <Button size="sm" className="h-6 text-[10px] bg-green-600 hover:bg-green-700">Accept</Button>}
                <Button size="sm" variant="outline" className="h-6 text-[10px]">View</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// ─── AI Instructions Tab ──────────────────────────────────────────────────────
const AiInstructionsTab = () => (
  <div className="space-y-4">
    <Card className="border-purple-200 bg-purple-50/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2"><Brain className="h-4 w-4 text-purple-600" /> AI-Generated Instructions & Workflow</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">AI generates personalized follow-up instructions based on patient history, treatment protocol, and progress. These are automatically routed to the appropriate staff member.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Front Desk Instructions */}
          <div className="rounded-lg border p-3">
            <h4 className="text-xs font-semibold text-orange-700 flex items-center gap-1 mb-2"><Users className="h-3.5 w-3.5" /> Front Desk Tasks (Today)</h4>
            <div className="space-y-2">
              {[
                "Call Suresh Babu to confirm Vasti appointment for tomorrow 11AM",
                "Collect advance payment from Meena K before Kizhi session",
                "Print consent form for new patient Priya S (Acupuncture)",
                "Send WhatsApp reminder to Kavitha P for 1-week post-discharge review",
              ].map((task, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Checkbox />
                  <span className="text-[11px]">{task}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Helpdesk Instructions */}
          <div className="rounded-lg border p-3">
            <h4 className="text-xs font-semibold text-purple-700 flex items-center gap-1 mb-2"><Phone className="h-3.5 w-3.5" /> Helpdesk Tasks (Today)</h4>
            <div className="space-y-2">
              {[
                "Re-contact Mohan G (missed yoga follow-up) - reschedule within 2 days",
                "Confirm online consultation time with Deepa M (14:00)",
                "Follow up with Vijay R about diet adherence for Virechana prep",
                "Collect feedback from completed Shirodhara patients this week",
              ].map((task, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Checkbox />
                  <span className="text-[11px]">{task}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Doctor Instructions */}
          <div className="rounded-lg border p-3">
            <h4 className="text-xs font-semibold text-blue-700 flex items-center gap-1 mb-2"><Stethoscope className="h-3.5 w-3.5" /> Doctor Review Tasks</h4>
            <div className="space-y-2">
              {[
                "Review Lakshmi Devi (Day 7) - transition to Virechana? Decide Snehapana dose",
                "Check Gopal N IP review at 09:00 - Virechana readiness assessment",
                "Approve referral for Suresh Babu → Acupuncture (nerve pain adjunct)",
                "Review lab reports for Saroja M before adjusting Greeva Vasti protocol",
              ].map((task, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Checkbox />
                  <span className="text-[11px]">{task}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Therapist Instructions */}
          <div className="rounded-lg border p-3">
            <h4 className="text-xs font-semibold text-green-700 flex items-center gap-1 mb-2"><Heart className="h-3.5 w-3.5" /> Therapist Instructions</h4>
            <div className="space-y-2">
              {[
                "Mrs. Priya: Prepare Ksheerabala 200ml for Ramesh (Shirodhara 09:00)",
                "Mrs. Lakshmi: Extra time for Abhyanga today - patient has stiff joints",
                "Mr. Ravi: Kashaya Vasti mix ready by 10:30 - fasting confirmation needed",
                "Mr. Suresh: Reduce milk proportion for Meena K (mild dairy sensitivity)",
              ].map((task, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Checkbox />
                  <span className="text-[11px]">{task}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Auto-generated Workflow */}
        <div className="rounded-lg border bg-white p-4">
          <h4 className="text-xs font-semibold mb-3">AI Follow-up Workflow Engine</h4>
          <div className="flex items-center gap-2 flex-wrap text-[10px]">
            <Badge className="bg-green-100 text-green-700">Patient Visit</Badge>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <Badge className="bg-purple-100 text-purple-700">AI Generates Instructions</Badge>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <Badge className="bg-orange-100 text-orange-700">Routes to Staff</Badge>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <Badge className="bg-blue-100 text-blue-700">Auto SMS/WhatsApp</Badge>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <Badge className="bg-yellow-100 text-yellow-700">Confirmation Tracked</Badge>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <Badge className="bg-green-100 text-green-700">Follow-up Completed</Badge>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">Missed follow-ups are auto-escalated: Front Desk → Helpdesk → Doctor (after 48hrs)</p>
        </div>

        <Button className="bg-purple-600 hover:bg-purple-700 gap-1.5" onClick={() => toast.success("AI instructions regenerated for today!")}>
          <Sparkles className="h-4 w-4" /> Regenerate Today's Instructions
        </Button>
      </CardContent>
    </Card>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const HmsConsultationHub = () => {
  const [mainTab, setMainTab] = useState("consultations");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-orange-500" /> Consultation Hub
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage consultations, online visits, appointments, follow-ups, referrals & AI instructions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-100 text-green-700 text-xs gap-1"><CheckCircle2 className="h-3 w-3" /> AI Active</Badge>
          <Badge variant="outline" className="text-xs gap-1"><Clock className="h-3 w-3" /> 21/07/2026</Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Card className="p-3 cursor-pointer hover:shadow-md" onClick={() => setMainTab("consultations")}>
          <p className="text-[10px] text-muted-foreground">In-Person</p>
          <p className="text-xl font-bold">{CONSULTATIONS.length}</p>
        </Card>
        <Card className="p-3 cursor-pointer hover:shadow-md" onClick={() => setMainTab("online")}>
          <p className="text-[10px] text-muted-foreground">Online</p>
          <p className="text-xl font-bold text-purple-600">{ONLINE_CONSULTATIONS.length}</p>
        </Card>
        <Card className="p-3 cursor-pointer hover:shadow-md" onClick={() => setMainTab("follow-ups")}>
          <p className="text-[10px] text-muted-foreground">Follow-ups Due</p>
          <p className="text-xl font-bold text-yellow-600">{FOLLOW_UPS.filter(f => f.status === "pending").length}</p>
        </Card>
        <Card className="p-3 cursor-pointer hover:shadow-md" onClick={() => setMainTab("therapy-review")}>
          <p className="text-[10px] text-muted-foreground">Therapy Reviews</p>
          <p className="text-xl font-bold text-orange-600">3</p>
        </Card>
        <Card className="p-3 cursor-pointer hover:shadow-md" onClick={() => setMainTab("ip-review")}>
          <p className="text-[10px] text-muted-foreground">IP Reviews</p>
          <p className="text-xl font-bold text-blue-600">{IP_REVIEWS.length}</p>
        </Card>
        <Card className="p-3 cursor-pointer hover:shadow-md" onClick={() => setMainTab("referrals")}>
          <p className="text-[10px] text-muted-foreground">Referrals</p>
          <p className="text-xl font-bold text-red-600">{REFERRALS.filter(r => r.status === "pending").length}</p>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={mainTab} onValueChange={setMainTab}>
        <TabsList className="flex-wrap h-auto gap-0.5">
          <TabsTrigger value="consultations" className="text-xs gap-1"><Stethoscope className="h-3 w-3" /> Consultations</TabsTrigger>
          <TabsTrigger value="online" className="text-xs gap-1"><Video className="h-3 w-3" /> Online</TabsTrigger>
          <TabsTrigger value="book" className="text-xs gap-1"><CalendarClock className="h-3 w-3" /> Book Appointment</TabsTrigger>
          <TabsTrigger value="follow-ups" className="text-xs gap-1"><RefreshCw className="h-3 w-3" /> Follow-ups</TabsTrigger>
          <TabsTrigger value="therapy-review" className="text-xs gap-1"><Heart className="h-3 w-3" /> Therapy Review</TabsTrigger>
          <TabsTrigger value="ip-review" className="text-xs gap-1"><BedDouble className="h-3 w-3" /> IP Review</TabsTrigger>
          <TabsTrigger value="referrals" className="text-xs gap-1"><ExternalLink className="h-3 w-3" /> Referrals</TabsTrigger>
          <TabsTrigger value="ai-instructions" className="text-xs gap-1"><Brain className="h-3 w-3" /> AI Instructions</TabsTrigger>
        </TabsList>

        <TabsContent value="consultations" className="mt-4"><ActiveConsultationsTab /></TabsContent>
        <TabsContent value="online" className="mt-4"><OnlineConsultationTab /></TabsContent>
        <TabsContent value="book" className="mt-4"><BookAppointmentTab /></TabsContent>
        <TabsContent value="follow-ups" className="mt-4"><FollowUpsTab /></TabsContent>
        <TabsContent value="therapy-review" className="mt-4"><TherapyReviewTab /></TabsContent>
        <TabsContent value="ip-review" className="mt-4"><IpReviewTab /></TabsContent>
        <TabsContent value="referrals" className="mt-4"><ReferralsTab /></TabsContent>
        <TabsContent value="ai-instructions" className="mt-4"><AiInstructionsTab /></TabsContent>
      </Tabs>
    </div>
  );
};

export default HmsConsultationHub;
