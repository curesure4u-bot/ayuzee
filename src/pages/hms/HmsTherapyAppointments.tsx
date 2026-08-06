import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  CalendarClock, Plus, Brain, Pill, CheckSquare, MessageSquare,
  Phone, Bell, Package, Clock, MapPin, DoorOpen, Sparkles, Send,
  FileText, AlertTriangle, ChevronLeft, ChevronRight, Printer,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type TherapyAppointment = {
  id: string;
  patientName: string;
  patientPhone: string;
  therapy: string;
  therapist: string;
  doctor: string;
  room: string;
  date: string;
  time: string;
  duration: number; // minutes
  status: "scheduled" | "in-progress" | "completed" | "no-show" | "rescheduled";
  packageInfo?: { name: string; totalSessions: number; completedSessions: number; dayNumber: number };
  checklist: { item: string; done: boolean }[];
  pharmacyItems: { name: string; qty: string; prepared: boolean }[];
  instructions: string;
  consent: boolean;
  followUpDate?: string;
  aiNotes?: string;
};

const HOURS = Array.from({ length: 16 }, (_, i) => `${String(i + 7).padStart(2, "0")}:00`);

const THERAPY_ROOMS = ["THERAPY-1", "THERAPY-2", "THERAPY-3", "THERAPY-4", "THERAPY-5"];

const SAMPLE_APPOINTMENTS: TherapyAppointment[] = [
  {
    id: "TA1", patientName: "Ramesh Kumar", patientPhone: "9876543210",
    therapy: "Shirodhara", therapist: "Mrs. Priya", doctor: "Dr. Mohamad Saleem",
    room: "THERAPY-4", date: "2026-07-21", time: "09:00", duration: 45,
    status: "completed",
    packageInfo: { name: "7-Day Panchakarma Detox", totalSessions: 14, completedSessions: 7, dayNumber: 4 },
    checklist: [
      { item: "Patient vitals checked", done: true },
      { item: "Oil temperature verified (38-40C)", done: true },
      { item: "Consent form signed", done: true },
      { item: "Forehead cleaned & prepared", done: true },
      { item: "Duration timer set (45 min)", done: true },
      { item: "Post-therapy rest (15 min)", done: true },
    ],
    pharmacyItems: [
      { name: "Ksheerabala Tailam", qty: "200ml", prepared: true },
      { name: "Brahmi Oil", qty: "100ml", prepared: true },
    ],
    instructions: "Avoid head bath for 2 hours. Light diet recommended. Next: Abhyanga tomorrow 9AM.",
    consent: true,
    followUpDate: "2026-07-22",
    aiNotes: "Patient showing good response. Dosha imbalance reducing. Continue current protocol.",
  },
  {
    id: "TA2", patientName: "Lakshmi Devi", patientPhone: "8765432109",
    therapy: "Abhyanga + Swedana", therapist: "Mrs. Lakshmi", doctor: "Dr. Swathi",
    room: "THERAPY-2", date: "2026-07-21", time: "10:00", duration: 60,
    status: "in-progress",
    packageInfo: { name: "14-Day Full Panchakarma", totalSessions: 28, completedSessions: 12, dayNumber: 7 },
    checklist: [
      { item: "Patient vitals checked", done: true },
      { item: "Oil heated to body temperature", done: true },
      { item: "Massage sequence: Head > Body > Limbs", done: true },
      { item: "Swedana steam ready (10 min)", done: false },
      { item: "Post-therapy towel wrap", done: false },
      { item: "Diet instruction given", done: false },
    ],
    pharmacyItems: [
      { name: "Dhanwantharam Tailam", qty: "300ml", prepared: true },
      { name: "Dashamoola Kashayam (steam)", qty: "500ml", prepared: true },
      { name: "Herbal towel set", qty: "2 nos", prepared: false },
    ],
    instructions: "Full body Abhyanga followed by Bashpa Swedana. Avoid cold water. Warm rice kanji for lunch.",
    consent: true,
    followUpDate: "2026-07-22",
    aiNotes: "Day 7 - transition to Virechana prep from tomorrow. Inform doctor for Snehapana dosage.",
  },
  {
    id: "TA3", patientName: "Suresh Babu", patientPhone: "7654321098",
    therapy: "Vasti (Kashaya Vasti)", therapist: "Mr. Ravi", doctor: "Dr. Mohamad Saleem",
    room: "THERAPY-3", date: "2026-07-21", time: "11:00", duration: 30,
    status: "scheduled",
    packageInfo: { name: "8-Day Vasti Protocol", totalSessions: 8, completedSessions: 3, dayNumber: 4 },
    checklist: [
      { item: "Patient fasting confirmed", done: false },
      { item: "Vasti preparation mixed", done: false },
      { item: "Temperature check (37-38C)", done: false },
      { item: "Patient position: left lateral", done: false },
      { item: "Retention time monitored", done: false },
      { item: "Post-vasti observation (30 min)", done: false },
    ],
    pharmacyItems: [
      { name: "Erandamooladi Kashayam", qty: "480ml", prepared: false },
      { name: "Honey", qty: "50ml", prepared: false },
      { name: "Rock Salt", qty: "5g", prepared: false },
      { name: "Sesame Oil", qty: "60ml", prepared: false },
    ],
    instructions: "Kashaya Vasti day 4. Patient must be on empty stomach. Monitor retention 15+ min. Light food after 1 hour.",
    consent: true,
    aiNotes: "Alternate day pattern: Today Kashaya Vasti, tomorrow Anuvasana Vasti. Check stool pattern.",
  },
  {
    id: "TA4", patientName: "Meena K", patientPhone: "6543210987",
    therapy: "Njavara Kizhi", therapist: "Mr. Suresh", doctor: "Dr. Manish",
    room: "THERAPY-1", date: "2026-07-21", time: "14:00", duration: 60,
    status: "scheduled",
    checklist: [
      { item: "Njavara rice cooked in milk decoction", done: false },
      { item: "Bala moola kashayam prepared", done: false },
      { item: "Bolus prepared (4 nos)", done: false },
      { item: "Patient allergy check", done: false },
      { item: "Post-therapy bath preparation", done: false },
    ],
    pharmacyItems: [
      { name: "Njavara Rice", qty: "200g", prepared: false },
      { name: "Bala moola Kashayam", qty: "1L", prepared: false },
      { name: "Cow Milk", qty: "500ml", prepared: false },
    ],
    instructions: "Njavara Kizhi for joint stiffness. 4 boluses, reheat every 5 min. Gentle strokes on affected joints.",
    consent: false,
    aiNotes: "Patient has mild dairy sensitivity - use reduced milk proportion. Inform therapist.",
  },
  {
    id: "TA5", patientName: "Arun P", patientPhone: "5432109876",
    therapy: "Nasya", therapist: "Mr. Gab", doctor: "Dr. Mohamad Saleem",
    room: "THERAPY-1", date: "2026-07-21", time: "08:00", duration: 30,
    status: "completed",
    checklist: [
      { item: "Facial steam given (5 min)", done: true },
      { item: "Anu Tailam warmed", done: true },
      { item: "6 drops each nostril administered", done: true },
      { item: "Gentle face massage post-nasya", done: true },
      { item: "Dhoomapana (herbal smoke) offered", done: true },
    ],
    pharmacyItems: [
      { name: "Anu Tailam", qty: "10ml", prepared: true },
      { name: "Haridra Dhoomavarti", qty: "1 stick", prepared: true },
    ],
    instructions: "Avoid cold air, cold water, heavy meals for 2 hours. Speak less for 30 min.",
    consent: true,
    followUpDate: "2026-07-22",
  },
];

// ─── New Appointment Dialog ───────────────────────────────────────────────────
const NewAppointmentDialog = () => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-orange-500 hover:bg-orange-600 gap-1.5"><Plus className="h-4 w-4" /> New Appointment</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="text-orange-500">Book Therapy Appointment</DialogTitle></DialogHeader>
        <div className="space-y-4 py-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><Label className="text-xs">Patient *</Label><Input className="h-8" placeholder="Search patient by name/ID/phone" /></div>
            <div><Label className="text-xs">Therapy *</Label>
              <Select><SelectTrigger className="h-8"><SelectValue placeholder="Select therapy" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="shirodhara">Shirodhara</SelectItem>
                  <SelectItem value="abhyanga">Abhyanga</SelectItem>
                  <SelectItem value="swedana">Swedana</SelectItem>
                  <SelectItem value="vasti">Vasti</SelectItem>
                  <SelectItem value="virechana">Virechana</SelectItem>
                  <SelectItem value="nasya">Nasya</SelectItem>
                  <SelectItem value="kizhi">Njavara Kizhi</SelectItem>
                  <SelectItem value="pizhichil">Pizhichil</SelectItem>
                  <SelectItem value="lepa">Lepa</SelectItem>
                  <SelectItem value="thalam">Thalam</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Therapist *</Label>
              <Select><SelectTrigger className="h-8"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gab">Mr. Gab</SelectItem>
                  <SelectItem value="lakshmi">Mrs. Lakshmi</SelectItem>
                  <SelectItem value="ravi">Mr. Ravi</SelectItem>
                  <SelectItem value="priya">Mrs. Priya</SelectItem>
                  <SelectItem value="suresh">Mr. Suresh</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Assigned Doctor *</Label>
              <Select><SelectTrigger className="h-8"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="saleem">Dr. Mohamad Saleem</SelectItem>
                  <SelectItem value="swathi">Dr. Swathi</SelectItem>
                  <SelectItem value="priyanka">Dr. PRIYANKA</SelectItem>
                  <SelectItem value="manish">Dr. Manish</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Room *</Label>
              <Select><SelectTrigger className="h-8"><SelectValue placeholder="Select room" /></SelectTrigger>
                <SelectContent>
                  {THERAPY_ROOMS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Date *</Label><Input type="date" className="h-8" defaultValue="2026-07-21" /></div>
            <div><Label className="text-xs">Time *</Label><Input type="time" className="h-8" /></div>
            <div><Label className="text-xs">Duration (min)</Label><Input type="number" className="h-8" defaultValue="45" /></div>
          </div>
          <div>
            <Label className="text-xs">Package (if applicable)</Label>
            <Select><SelectTrigger className="h-8"><SelectValue placeholder="Select package or None" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Package (Single Session)</SelectItem>
                <SelectItem value="7day">7-Day Panchakarma Detox (14 sessions)</SelectItem>
                <SelectItem value="14day">14-Day Full Panchakarma (28 sessions)</SelectItem>
                <SelectItem value="8vasti">8-Day Vasti Protocol (8 sessions)</SelectItem>
                <SelectItem value="5shiro">5-Day Shirodhara Course (5 sessions)</SelectItem>
                <SelectItem value="21rejuv">21-Day Rejuvenation (42 sessions)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label className="text-xs">Instructions for Therapist</Label><Input className="h-8" placeholder="Special instructions from doctor..." /></div>
          <div className="flex items-center gap-2"><Checkbox /><Label className="text-xs">Patient consent obtained</Label></div>
          <div className="border-t pt-3 space-y-2">
            <p className="text-xs font-semibold flex items-center gap-1"><Brain className="h-3.5 w-3.5 text-purple-600" /> AI Auto-Actions on Save:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-[10px] text-muted-foreground">
              <span>- SMS/WhatsApp confirmation to patient</span>
              <span>- Schedule notification to therapist</span>
              <span>- Pharmacy preparation alert sent</span>
              <span>- Room availability confirmed</span>
              <span>- Checklist generated from therapy type</span>
              <span>- Follow-up auto-scheduled if package</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => { toast.success("Appointment booked! AI notifications sent to patient, therapist & pharmacy."); setOpen(false); }}>
            <Sparkles className="h-4 w-4 mr-1" /> Book & Notify All
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Calendar Day View ────────────────────────────────────────────────────────
const CalendarDayView = ({ appointments }: { appointments: TherapyAppointment[] }) => {
  const statusColor: Record<string, string> = {
    "scheduled": "bg-blue-100 border-blue-300 text-blue-800",
    "in-progress": "bg-yellow-100 border-yellow-300 text-yellow-800",
    "completed": "bg-green-100 border-green-300 text-green-800",
    "no-show": "bg-red-100 border-red-300 text-red-800",
    "rescheduled": "bg-purple-100 border-purple-300 text-purple-800",
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-teal-600 text-white text-center py-2 font-semibold text-sm">Tuesday</div>
      <div className="bg-green-50/50">
        {HOURS.map((hour) => {
          const appts = appointments.filter((a) => a.time === hour);
          return (
            <div key={hour} className="flex border-b min-h-[48px]">
              <div className="w-16 shrink-0 text-xs text-muted-foreground py-2 px-2 border-r bg-white">{hour}</div>
              <div className="flex-1 p-1 flex flex-wrap gap-1">
                {appts.map((appt) => (
                  <div key={appt.id} className={`rounded px-2 py-1 border text-[10px] ${statusColor[appt.status]}`}>
                    <span className="font-medium">{appt.patientName}</span> - {appt.therapy}
                    <span className="ml-1 opacity-70">({appt.room})</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Appointment Detail / Checklist Panel ─────────────────────────────────────
const AppointmentDetail = ({ appt }: { appt: TherapyAppointment }) => {
  const [checklist, setChecklist] = useState(appt.checklist);
  const completedCount = checklist.filter((c) => c.done).length;

  const toggleCheck = (idx: number) => {
    setChecklist((prev) => prev.map((c, i) => i === idx ? { ...c, done: !c.done } : c));
  };

  return (
    <Card className="border-l-4 border-l-orange-500">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-sm">{appt.patientName} - {appt.therapy}</h4>
            <p className="text-xs text-muted-foreground">{appt.time} | {appt.room} | Therapist: {appt.therapist}</p>
            <p className="text-xs text-muted-foreground">Doctor: {appt.doctor}</p>
          </div>
          <Badge className={`text-[10px] ${appt.status === "completed" ? "bg-green-100 text-green-700" : appt.status === "in-progress" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"}`}>
            {appt.status}
          </Badge>
        </div>

        {/* Package Progress */}
        {appt.packageInfo && (
          <div className="rounded-lg border bg-purple-50/30 p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold flex items-center gap-1"><Package className="h-3.5 w-3.5" /> {appt.packageInfo.name}</span>
              <span className="text-[10px] text-muted-foreground">Day {appt.packageInfo.dayNumber}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(appt.packageInfo.completedSessions / appt.packageInfo.totalSessions) * 100}%` }} />
              </div>
              <span className="text-[10px] font-medium">{appt.packageInfo.completedSessions}/{appt.packageInfo.totalSessions}</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Remaining: {appt.packageInfo.totalSessions - appt.packageInfo.completedSessions} sessions</p>
          </div>
        )}

        {/* AI Checklist */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold flex items-center gap-1"><CheckSquare className="h-3.5 w-3.5 text-green-600" /> Therapy Checklist</span>
            <span className="text-[10px] text-muted-foreground">{completedCount}/{checklist.length} done</span>
          </div>
          <div className="space-y-1.5">
            {checklist.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Checkbox checked={item.done} onCheckedChange={() => toggleCheck(idx)} />
                <span className={`text-xs ${item.done ? "line-through text-muted-foreground" : ""}`}>{item.item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pharmacy Items */}
        <div>
          <span className="text-xs font-semibold flex items-center gap-1 mb-2"><Pill className="h-3.5 w-3.5 text-blue-600" /> Pharmacy / Materials</span>
          <div className="space-y-1">
            {appt.pharmacyItems.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs rounded bg-muted/50 px-2 py-1">
                <span>{item.name} ({item.qty})</span>
                <Badge className={`text-[9px] ${item.prepared ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {item.prepared ? "Ready" : "Pending"}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="rounded-lg bg-orange-50/50 border border-orange-200 p-3">
          <span className="text-xs font-semibold flex items-center gap-1"><FileText className="h-3.5 w-3.5 text-orange-600" /> Doctor Instructions</span>
          <p className="text-xs mt-1">{appt.instructions}</p>
        </div>

        {/* AI Notes */}
        {appt.aiNotes && (
          <div className="rounded-lg bg-purple-50/50 border border-purple-200 p-3">
            <span className="text-xs font-semibold flex items-center gap-1"><Brain className="h-3.5 w-3.5 text-purple-600" /> AI Clinical Notes</span>
            <p className="text-xs mt-1">{appt.aiNotes}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          <Button size="sm" className="h-7 text-[10px] bg-green-600 hover:bg-green-700 gap-1" onClick={() => toast.success("Message sent to patient & therapist")}>
            <Send className="h-3 w-3" /> Notify Patient
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1" onClick={() => toast.info("WhatsApp schedule sent to therapist")}>
            <MessageSquare className="h-3 w-3" /> Message Therapist
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1" onClick={() => toast.info("Calling patient...")}>
            <Phone className="h-3 w-3" /> Call Patient
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1" onClick={() => toast.success("Pharmacy alert sent for preparation")}>
            <Pill className="h-3 w-3" /> Alert Pharmacy
          </Button>
          {appt.followUpDate && (
            <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1 text-purple-600">
              <CalendarClock className="h-3 w-3" /> Follow-up: {appt.followUpDate}
            </Button>
          )}
        </div>

        {/* Consent Warning */}
        {!appt.consent && (
          <div className="flex items-center gap-2 rounded bg-red-50 border border-red-200 p-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-xs text-red-700 font-medium">Consent not yet obtained! Get patient consent before proceeding.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const HmsTherapyAppointments = () => {
  const [selectedRoom, setSelectedRoom] = useState("all");
  const [selectedAppt, setSelectedAppt] = useState<TherapyAppointment | null>(SAMPLE_APPOINTMENTS[1]);
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");
  const [mainTab, setMainTab] = useState("calendar");

  const filteredAppts = selectedRoom === "all"
    ? SAMPLE_APPOINTMENTS
    : SAMPLE_APPOINTMENTS.filter((a) => a.room === selectedRoom);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <CalendarClock className="h-6 w-6 text-orange-500" /> Manage Therapy
          </h1>
          <p className="text-sm text-muted-foreground">Therapy scheduling with AI checklists, pharmacy integration & patient communication</p>
        </div>
        <div className="flex gap-2">
          <NewAppointmentDialog />
          <Button variant="outline" className="gap-1.5"><Printer className="h-4 w-4" /> Print</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div>
          <Label className="text-xs text-muted-foreground">Location</Label>
          <Select defaultValue="kadayanallur">
            <SelectTrigger className="h-8 w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="kadayanallur">#11, Main Road, Kadayanallur, .</SelectItem>
              <SelectItem value="tenkasi">Tenkasi Branch</SelectItem>
              <SelectItem value="rajapalayam">Rajapalayam Branch</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Room</Label>
          <Select value={selectedRoom} onValueChange={setSelectedRoom}>
            <SelectTrigger className="h-8 w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Rooms</SelectItem>
              {THERAPY_ROOMS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={mainTab} onValueChange={setMainTab}>
        <TabsList>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="list">Appointment List</TabsTrigger>
          <TabsTrigger value="packages">Active Packages</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
        </TabsList>

        {/* Calendar View */}
        <TabsContent value="calendar" className="mt-4 space-y-4">
          {/* Date Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-7 text-xs">today</Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><ChevronLeft className="h-4 w-4" /></Button>
              <span className="font-semibold text-base">July 21, 2026</span>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><ChevronRight className="h-4 w-4" /></Button>
            </div>
            <div className="flex gap-1">
              {(["month", "week", "day"] as const).map((m) => (
                <Button key={m} variant={viewMode === m ? "default" : "outline"} size="sm" className={`h-7 text-xs ${viewMode === m ? "bg-orange-500" : ""}`} onClick={() => setViewMode(m)}>
                  {m}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <CalendarDayView appointments={filteredAppts} />
            </div>
            {/* Detail Panel */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground">Click an appointment for details:</p>
              {filteredAppts.map((appt) => (
                <div
                  key={appt.id}
                  className={`rounded-lg border p-2 cursor-pointer transition hover:shadow-md ${selectedAppt?.id === appt.id ? "ring-2 ring-orange-500" : ""}`}
                  onClick={() => setSelectedAppt(appt)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{appt.time} - {appt.patientName}</span>
                    <Badge className={`text-[9px] ${appt.status === "completed" ? "bg-green-100 text-green-700" : appt.status === "in-progress" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"}`}>{appt.status}</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{appt.therapy} | {appt.room}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Appointment Detail */}
          {selectedAppt && <AppointmentDetail appt={selectedAppt} />}
        </TabsContent>

        {/* List View */}
        <TabsContent value="list" className="mt-4">
          <Card>
            <CardContent className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-orange-600 font-semibold">Time</TableHead>
                    <TableHead className="text-orange-600 font-semibold">Patient</TableHead>
                    <TableHead className="text-orange-600 font-semibold">Therapy</TableHead>
                    <TableHead className="text-orange-600 font-semibold">Therapist</TableHead>
                    <TableHead className="text-orange-600 font-semibold">Doctor</TableHead>
                    <TableHead className="text-orange-600 font-semibold">Room</TableHead>
                    <TableHead className="text-orange-600 font-semibold">Package Day</TableHead>
                    <TableHead className="text-orange-600 font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppts.map((a) => (
                    <TableRow key={a.id} className="cursor-pointer hover:bg-orange-50/50" onClick={() => { setSelectedAppt(a); setMainTab("calendar"); }}>
                      <TableCell className="text-sm font-medium">{a.time}</TableCell>
                      <TableCell className="text-sm">{a.patientName}</TableCell>
                      <TableCell className="text-sm">{a.therapy}</TableCell>
                      <TableCell className="text-sm">{a.therapist}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{a.doctor}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{a.room}</Badge></TableCell>
                      <TableCell className="text-xs">{a.packageInfo ? `Day ${a.packageInfo.dayNumber}` : "—"}</TableCell>
                      <TableCell><Badge className={`text-[9px] ${a.status === "completed" ? "bg-green-100 text-green-700" : a.status === "in-progress" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"}`}>{a.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Packages */}
        <TabsContent value="packages" className="mt-4 space-y-4">
          {SAMPLE_APPOINTMENTS.filter((a) => a.packageInfo).map((a) => (
            <Card key={a.id} className="border-l-4 border-l-purple-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-sm">{a.patientName}</h4>
                    <p className="text-xs text-muted-foreground">{a.packageInfo!.name}</p>
                  </div>
                  <Badge className="bg-purple-100 text-purple-700 text-xs">Day {a.packageInfo!.dayNumber}</Badge>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${(a.packageInfo!.completedSessions / a.packageInfo!.totalSessions) * 100}%` }} />
                  </div>
                  <span className="text-xs font-medium">{a.packageInfo!.completedSessions}/{a.packageInfo!.totalSessions} sessions</span>
                </div>
                <div className="flex flex-wrap gap-2 text-[10px]">
                  <span>Next: {a.therapy} on {a.followUpDate || "TBD"}</span>
                  <span>| Room: {a.room}</span>
                  <span>| Therapist: {a.therapist}</span>
                  <span>| Doctor: {a.doctor}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" className="h-6 text-[10px] bg-purple-600 hover:bg-purple-700 gap-0.5"><Bell className="h-3 w-3" /> Remind Patient</Button>
                  <Button size="sm" variant="outline" className="h-6 text-[10px] gap-0.5"><CalendarClock className="h-3 w-3" /> Confirm Next Date</Button>
                  <Button size="sm" variant="outline" className="h-6 text-[10px] gap-0.5"><Brain className="h-3 w-3" /> AI Suggest Next</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* AI Insights */}
        <TabsContent value="ai-insights" className="mt-4 space-y-4">
          <Card className="border-purple-200 bg-purple-50/20">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Brain className="h-4 w-4 text-purple-600" /> AI Therapy Intelligence</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-lg border bg-white p-3">
                  <p className="text-xs font-semibold text-green-700">Optimization Suggestion</p>
                  <p className="text-xs mt-1">Mr. Ravi (Vasti specialist) has a 30-min gap between 11:30-12:00. Consider scheduling Suresh Babu's Anuvasana Vasti here.</p>
                </div>
                <div className="rounded-lg border bg-white p-3">
                  <p className="text-xs font-semibold text-blue-700">Follow-up Alert</p>
                  <p className="text-xs mt-1">3 patients have pending therapy sessions from last week. Auto-reminder sent via WhatsApp. Awaiting confirmation.</p>
                </div>
                <div className="rounded-lg border bg-white p-3">
                  <p className="text-xs font-semibold text-orange-700">Pharmacy Sync</p>
                  <p className="text-xs mt-1">Tomorrow's 6 sessions need: Dhanwantharam 1.2L, Ksheerabala 400ml, Njavara 600g. Stock check: All available.</p>
                </div>
                <div className="rounded-lg border bg-white p-3">
                  <p className="text-xs font-semibold text-purple-700">Patient Outcome Tracking</p>
                  <p className="text-xs mt-1">Ramesh Kumar (Day 4/7) - VAS pain score reduced from 7 to 4. Recommend continuing current Shirodhara protocol.</p>
                </div>
              </div>
              <div className="rounded-lg border bg-white p-3">
                <p className="text-xs font-semibold">AI-Generated Daily Summary</p>
                <ul className="text-[10px] text-muted-foreground mt-1 space-y-0.5 list-disc list-inside">
                  <li>5 therapy sessions scheduled today | 1 completed, 1 in-progress, 3 pending</li>
                  <li>All pharmacy materials prepared for morning sessions</li>
                  <li>1 consent form pending (Meena K - Njavara Kizhi at 14:00)</li>
                  <li>Package tracking: 3 active packages on track, 0 delayed</li>
                  <li>Therapist utilization: 78% (target 85%) - suggest filling THERAPY-5 afternoon slot</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HmsTherapyAppointments;
