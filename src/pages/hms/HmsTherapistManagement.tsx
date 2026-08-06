import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  UserPlus, Users, UserX, Search, Pencil, Brain, Trophy, Heart,
  Sparkles, Star, DoorOpen, CalendarClock, MessageSquare, Phone, Award,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Therapist = {
  id: string;
  code: string;
  name: string;
  mobile: string;
  speciality: string;
  gender: "M" | "F";
  assignedRoom: string;
  assignedDoctor: string;
  status: "new" | "active" | "inactive";
  points: number;
  sessionsToday: number;
  rating: number;
  certifications: string[];
};

type TherapyRoom = {
  id: string;
  name: string;
  location: string;
  capacity: number;
  equipment: string[];
  status: "available" | "occupied" | "maintenance";
  currentTherapist: string | null;
};

const SAMPLE_THERAPISTS: Therapist[] = [
  { id: "T1", code: "TH_01", name: "Mr. Gab (Panchakarma Therapist)", mobile: "7143735118", speciality: "Panchakarma", gender: "M", assignedRoom: "THERAPY-1", assignedDoctor: "Dr. Mohamad Saleem", status: "active", points: 1850, sessionsToday: 6, rating: 4.7, certifications: ["Abhyanga", "Shirodhara", "Vasti"] },
  { id: "T2", code: "TH_02", name: "Mrs. Lakshmi (Ayurvedic Therapist)", mobile: "9876543210", speciality: "Abhyanga & Swedana", gender: "F", assignedRoom: "THERAPY-2", assignedDoctor: "Dr. Swathi", status: "active", points: 1620, sessionsToday: 5, rating: 4.6, certifications: ["Abhyanga", "Swedana", "Pizhichil"] },
  { id: "T3", code: "TH_03", name: "Mr. Ravi (Vasti Specialist)", mobile: "8765432109", speciality: "Vasti & Virechana", gender: "M", assignedRoom: "THERAPY-3", assignedDoctor: "Dr. Mohamad Saleem", status: "active", points: 1450, sessionsToday: 4, rating: 4.5, certifications: ["Vasti", "Virechana", "Nasya"] },
  { id: "T4", code: "TH_04", name: "Mrs. Priya (Shirodhara Expert)", mobile: "7654321098", speciality: "Shirodhara & Takradhara", gender: "F", assignedRoom: "THERAPY-4", assignedDoctor: "Dr. DR.PRIYANKA", status: "active", points: 1320, sessionsToday: 3, rating: 4.8, certifications: ["Shirodhara", "Takradhara", "Thalam"] },
  { id: "T5", code: "TH_05", name: "Mr. Suresh (Kizhi Therapist)", mobile: "6543210987", speciality: "Kizhi & Pichu", gender: "M", assignedRoom: "THERAPY-1", assignedDoctor: "Dr. Manish", status: "active", points: 1100, sessionsToday: 4, rating: 4.3, certifications: ["Kizhi", "Pichu", "Lepa"] },
  { id: "T6", code: "TH_06", name: "Mrs. Anitha (Naturopathy)", mobile: "5432109876", speciality: "Mud Therapy & Hydro", gender: "F", assignedRoom: "", assignedDoctor: "", status: "new", points: 0, sessionsToday: 0, rating: 0, certifications: ["Mud Therapy", "Hydrotherapy"] },
  { id: "T7", code: "TH_07", name: "Mr. Babu (General Therapist)", mobile: "4321098765", speciality: "General Panchakarma", gender: "M", assignedRoom: "", assignedDoctor: "", status: "inactive", points: 680, sessionsToday: 0, rating: 4.0, certifications: ["Abhyanga", "Swedana"] },
];

const THERAPY_ROOMS: TherapyRoom[] = [
  { id: "R1", name: "THERAPY-1", location: "Ground Floor, Room 101", capacity: 2, equipment: ["Droni", "Steam Chamber", "Shirodhara Stand"], status: "occupied", currentTherapist: "Mr. Gab" },
  { id: "R2", name: "THERAPY-2", location: "Ground Floor, Room 102", capacity: 1, equipment: ["Massage Table", "Oil Warmer", "Steam Box"], status: "occupied", currentTherapist: "Mrs. Lakshmi" },
  { id: "R3", name: "THERAPY-3", location: "First Floor, Room 201", capacity: 2, equipment: ["Vasti Table", "Enema Kit", "Heater"], status: "occupied", currentTherapist: "Mr. Ravi" },
  { id: "R4", name: "THERAPY-4", location: "First Floor, Room 202", capacity: 1, equipment: ["Shirodhara Pot", "Droni", "Timer"], status: "occupied", currentTherapist: "Mrs. Priya" },
  { id: "R5", name: "THERAPY-5", location: "First Floor, Room 203", capacity: 2, equipment: ["Massage Table", "Kizhi Materials"], status: "available", currentTherapist: null },
  { id: "R6", name: "THERAPY-6", location: "Ground Floor, Room 103", capacity: 1, equipment: ["Yoga Mat", "Hydro Tub"], status: "maintenance", currentTherapist: null },
];

// ─── Gamification ─────────────────────────────────────────────────────────────
const THERAPIST_POINTS = [
  { action: "Session completed on time", points: 10 },
  { action: "Patient satisfaction 5-star", points: 15 },
  { action: "Zero rescheduling (week)", points: 25 },
  { action: "New therapy certification", points: 50 },
  { action: "Package completion (all sessions)", points: 30 },
  { action: "Follow-up checklist 100%", points: 12 },
  { action: "Oil/material prepared on time", points: 8 },
  { action: "Room cleanup before next patient", points: 5 },
];

function getLevel(pts: number) {
  if (pts >= 2000) return { label: "Platinum", color: "bg-purple-100 text-purple-700" };
  if (pts >= 1500) return { label: "Gold", color: "bg-yellow-100 text-yellow-700" };
  if (pts >= 1000) return { label: "Silver", color: "bg-slate-100 text-slate-700" };
  if (pts >= 500) return { label: "Bronze", color: "bg-amber-100 text-amber-700" };
  return { label: "Starter", color: "bg-gray-100 text-gray-700" };
}

// ─── TherapistTable ───────────────────────────────────────────────────────────
const TherapistTable = ({ therapists }: { therapists: Therapist[] }) => {
  const [search, setSearch] = useState("");
  const filtered = therapists.filter(
    (t) => t.name.toLowerCase().includes(search.toLowerCase()) || t.speciality.toLowerCase().includes(search.toLowerCase()) || t.code.includes(search)
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Badge variant="outline" className="text-xs">{filtered.length} therapists</Badge>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input className="h-8 pl-8 w-56" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-orange-600 font-semibold">Code</TableHead>
              <TableHead className="text-orange-600 font-semibold">Name</TableHead>
              <TableHead className="text-orange-600 font-semibold">Mobile</TableHead>
              <TableHead className="text-orange-600 font-semibold">Speciality</TableHead>
              <TableHead className="text-orange-600 font-semibold">Room</TableHead>
              <TableHead className="text-orange-600 font-semibold">Assigned Doctor</TableHead>
              <TableHead className="text-orange-600 font-semibold">Points</TableHead>
              <TableHead className="text-orange-600 font-semibold">Sessions</TableHead>
              <TableHead className="text-orange-600 font-semibold w-16">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((t) => {
              const level = getLevel(t.points);
              return (
                <TableRow key={t.id}>
                  <TableCell className="text-sm font-medium">{t.code}</TableCell>
                  <TableCell className="text-sm">{t.name}</TableCell>
                  <TableCell className="text-sm">{t.mobile}</TableCell>
                  <TableCell className="text-sm">{t.speciality}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{t.assignedRoom || "—"}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{t.assignedDoctor || "Unassigned"}</TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] ${level.color}`}><Trophy className="h-2.5 w-2.5 mr-0.5" />{t.points}</Badge>
                  </TableCell>
                  <TableCell className="text-sm font-medium">{t.sessionsToday}</TableCell>
                  <TableCell><Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-orange-500"><Pencil className="h-3.5 w-3.5" /></Button></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

// ─── Room Status Panel ────────────────────────────────────────────────────────
const RoomStatusPanel = () => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm flex items-center gap-2">
        <DoorOpen className="h-4 w-4 text-orange-500" /> Therapy Room Status
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {THERAPY_ROOMS.map((room) => (
          <div key={room.id} className={`rounded-lg border p-3 ${room.status === "available" ? "border-green-200 bg-green-50/50" : room.status === "occupied" ? "border-orange-200 bg-orange-50/30" : "border-red-200 bg-red-50/30"}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-sm">{room.name}</span>
              <Badge className={`text-[9px] ${room.status === "available" ? "bg-green-100 text-green-700" : room.status === "occupied" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"}`}>
                {room.status}
              </Badge>
            </div>
            <p className="text-[10px] text-muted-foreground">{room.location}</p>
            {room.currentTherapist && <p className="text-xs mt-1 font-medium">{room.currentTherapist}</p>}
            <div className="flex flex-wrap gap-1 mt-1.5">
              {room.equipment.map((eq) => (
                <Badge key={eq} variant="outline" className="text-[8px] px-1 py-0">{eq}</Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// ─── Front Desk Coordination Panel ───────────────────────────────────────────
const FrontDeskCoordination = () => (
  <Card className="border-blue-200 bg-blue-50/20">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-blue-600" /> Front Desk Coordination (AI-Assisted)
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-lg border bg-white p-3">
          <p className="text-xs font-semibold text-blue-700">Next Patient Alert</p>
          <p className="text-sm mt-1">Ramesh Kumar - Shirodhara (10:30 AM)</p>
          <p className="text-[10px] text-muted-foreground">Room: THERAPY-4 | Therapist: Mrs. Priya</p>
          <div className="flex gap-2 mt-2">
            <Button size="sm" className="h-6 text-[10px] bg-green-600 hover:bg-green-700">Confirm Arrival</Button>
            <Button size="sm" variant="outline" className="h-6 text-[10px]">Notify Therapist</Button>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-3">
          <p className="text-xs font-semibold text-orange-700">AI Recommendation</p>
          <p className="text-xs mt-1">Patient Lakshmi (Package: 7-day Panchakarma) - Day 4</p>
          <p className="text-[10px] text-muted-foreground">Today: Vasti + Abhyanga | Oil: Dhanwantharam Tailam</p>
          <div className="flex gap-2 mt-2">
            <Button size="sm" className="h-6 text-[10px] bg-purple-600 hover:bg-purple-700"><Brain className="h-3 w-3 mr-1" />AI Checklist</Button>
            <Button size="sm" variant="outline" className="h-6 text-[10px]"><Phone className="h-3 w-3 mr-1" />Call Patient</Button>
          </div>
        </div>
      </div>
      <div className="rounded-lg border bg-white p-3">
        <p className="text-xs font-semibold">Today's Therapy Schedule Summary</p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-2">
          {["08:00", "09:00", "10:00", "11:00", "14:00", "15:00"].map((time) => (
            <div key={time} className="text-center rounded bg-muted/50 py-1">
              <p className="text-[10px] font-medium">{time}</p>
              <p className="text-[9px] text-muted-foreground">{Math.floor(Math.random() * 4) + 1} sessions</p>
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const HmsTherapistManagement = () => {
  const [tab, setTab] = useState("active");
  const [addOpen, setAddOpen] = useState(false);

  const newTherapists = SAMPLE_THERAPISTS.filter((t) => t.status === "new");
  const activeTherapists = SAMPLE_THERAPISTS.filter((t) => t.status === "active");
  const inactiveTherapists = SAMPLE_THERAPISTS.filter((t) => t.status === "inactive");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Heart className="h-6 w-6 text-orange-500" /> Manage Therapist
          </h1>
          <p className="text-sm text-muted-foreground">Therapist management with room coordination, AI scheduling & gamification</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600 gap-1.5"><UserPlus className="h-4 w-4" /> Add Therapist</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="text-orange-500">Register New Therapist</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><Label className="text-xs">Full Name *</Label><Input className="h-8" placeholder="Therapist name" /></div>
                <div><Label className="text-xs">Mobile *</Label><Input className="h-8" placeholder="Mobile" /></div>
                <div><Label className="text-xs">Gender</Label>
                  <Select><SelectTrigger className="h-8"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent><SelectItem value="M">Male</SelectItem><SelectItem value="F">Female</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Speciality *</Label>
                  <Select><SelectTrigger className="h-8"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="panchakarma">Panchakarma</SelectItem>
                      <SelectItem value="abhyanga">Abhyanga & Swedana</SelectItem>
                      <SelectItem value="shirodhara">Shirodhara</SelectItem>
                      <SelectItem value="vasti">Vasti & Virechana</SelectItem>
                      <SelectItem value="kizhi">Kizhi & Pichu</SelectItem>
                      <SelectItem value="naturopathy">Naturopathy</SelectItem>
                      <SelectItem value="yoga">Yoga Therapy</SelectItem>
                      <SelectItem value="acupuncture">Acupuncture</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Assign Room</Label>
                  <Select><SelectTrigger className="h-8"><SelectValue placeholder="Select room" /></SelectTrigger>
                    <SelectContent>
                      {THERAPY_ROOMS.map((r) => <SelectItem key={r.id} value={r.name}>{r.name} - {r.location}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Assign Doctor (Supervisor)</Label>
                  <Select><SelectTrigger className="h-8"><SelectValue placeholder="Select doctor" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dr-saleem">Dr. Mohamad Saleem</SelectItem>
                      <SelectItem value="dr-swathi">Dr. Swathi</SelectItem>
                      <SelectItem value="dr-priyanka">Dr. DR.PRIYANKA</SelectItem>
                      <SelectItem value="dr-manish">Dr. Manish</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Experience (years)</Label><Input className="h-8" type="number" /></div>
                <div><Label className="text-xs">Certifications</Label><Input className="h-8" placeholder="e.g. Abhyanga, Shirodhara" /></div>
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-semibold">AI & Notification Settings</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2"><Switch defaultChecked /><Label className="text-xs">Schedule SMS alerts</Label></div>
                  <div className="flex items-center gap-2"><Switch defaultChecked /><Label className="text-xs">WhatsApp appointment info</Label></div>
                  <div className="flex items-center gap-2"><Switch defaultChecked /><Label className="text-xs">AI checklist reminders</Label></div>
                  <div className="flex items-center gap-2"><Switch defaultChecked /><Label className="text-xs">Gamification enabled</Label></div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => { toast.success("Therapist registered! Room & doctor assigned."); setAddOpen(false); }}>
                <Sparkles className="h-4 w-4 mr-1" /> Register
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-3"><p className="text-xs text-muted-foreground">Total Therapists</p><p className="text-2xl font-bold">{SAMPLE_THERAPISTS.length}</p></Card>
        <Card className="p-3"><p className="text-xs text-muted-foreground">Active</p><p className="text-2xl font-bold text-green-600">{activeTherapists.length}</p></Card>
        <Card className="p-3"><p className="text-xs text-muted-foreground">Sessions Today</p><p className="text-2xl font-bold text-blue-600">{activeTherapists.reduce((s, t) => s + t.sessionsToday, 0)}</p></Card>
        <Card className="p-3"><p className="text-xs text-muted-foreground">Rooms Available</p><p className="text-2xl font-bold text-orange-600">{THERAPY_ROOMS.filter((r) => r.status === "available").length}/{THERAPY_ROOMS.length}</p></Card>
        <Card className="p-3"><p className="text-xs text-muted-foreground">AI Status</p><p className="text-xs text-green-600 font-medium mt-1">All checklists sent</p><p className="text-xs text-blue-600">3 follow-ups scheduled</p></Card>
      </div>

      {/* Front Desk Coordination */}
      <FrontDeskCoordination />

      {/* Room Status */}
      <RoomStatusPanel />

      {/* Gamification Quick View */}
      <Card className="border-purple-200 bg-purple-50/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm flex items-center gap-1.5"><Trophy className="h-4 w-4 text-purple-600" /> Therapist Leaderboard</h3>
            <Badge variant="outline" className="text-[10px]">This Month</Badge>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-1">
            {activeTherapists.sort((a, b) => b.points - a.points).map((t, i) => {
              const level = getLevel(t.points);
              return (
                <div key={t.id} className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold text-purple-600">#{i + 1}</span>
                  <div>
                    <p className="text-xs font-medium truncate max-w-[130px]">{t.name.split("(")[0]}</p>
                    <Badge className={`text-[9px] px-1.5 py-0 ${level.color}`}>{level.label} · {t.points}pts</Badge>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {THERAPIST_POINTS.slice(0, 4).map((p) => (
              <Badge key={p.action} variant="outline" className="text-[9px]">{p.action}: +{p.points}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Therapist Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="new" className="gap-1.5"><UserPlus className="h-3.5 w-3.5" /> New ({newTherapists.length})</TabsTrigger>
          <TabsTrigger value="active" className="gap-1.5"><Users className="h-3.5 w-3.5" /> Active ({activeTherapists.length})</TabsTrigger>
          <TabsTrigger value="inactive" className="gap-1.5"><UserX className="h-3.5 w-3.5" /> Inactive ({inactiveTherapists.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="new" className="mt-4"><Card><CardHeader className="pb-2 border-b"><CardTitle className="text-base text-orange-500 text-center">New Therapist Registrations</CardTitle></CardHeader><CardContent className="pt-4"><TherapistTable therapists={newTherapists} /></CardContent></Card></TabsContent>
        <TabsContent value="active" className="mt-4"><Card><CardHeader className="pb-2 border-b"><CardTitle className="text-base text-orange-500 text-center">Active Therapists</CardTitle></CardHeader><CardContent className="pt-4"><TherapistTable therapists={activeTherapists} /></CardContent></Card></TabsContent>
        <TabsContent value="inactive" className="mt-4"><Card><CardHeader className="pb-2 border-b"><CardTitle className="text-base text-orange-500 text-center">Inactive Therapists</CardTitle></CardHeader><CardContent className="pt-4"><TherapistTable therapists={inactiveTherapists} /></CardContent></Card></TabsContent>
      </Tabs>
    </div>
  );
};

export default HmsTherapistManagement;
