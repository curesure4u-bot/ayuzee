import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  UserPlus, Users, UserX, Search, Pencil, Brain, Trophy,
  Stethoscope, Star, Calendar, Phone, Mail, Award, Sparkles,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Doctor = {
  dCode: string;
  name: string;
  mobile: string;
  email: string;
  speciality: string;
  gender: "M" | "F";
  location: string;
  loginId: string;
  role: string;
  status: "new" | "active" | "inactive";
  gamificationPoints: number;
  consultationsToday: number;
  rating: number;
};

const SAMPLE_DOCTORS: Doctor[] = [
  { dCode: "D_1", name: "Dr. Mohamad Saleem(Ayurvedic & Panchakarma Consultant)", mobile: "9842809689", email: "dr.saleem@alshifa.in", speciality: "Ayurveda & Panchakarma Consultant", gender: "M", location: "Kadayanallur", loginId: "drms", role: "MSc", status: "active", gamificationPoints: 2450, consultationsToday: 8, rating: 4.8 },
  { dCode: "D_17", name: "Dr. DR.Manish(Ayurvedic Therapist)", mobile: "9363498388", email: "", speciality: "Naturopathic", gender: "M", location: "Kadayanallur", loginId: "dr@m", role: "Therapist", status: "active", gamificationPoints: 1820, consultationsToday: 5, rating: 4.6 },
  { dCode: "D_3", name: "Dr. DR.PRIYANKA(Acupuncture)", mobile: "7871379910", email: "", speciality: "Acupuncture", gender: "F", location: "Kadayanallur", loginId: "drpriya", role: "DOCTOR", status: "active", gamificationPoints: 1650, consultationsToday: 6, rating: 4.7 },
  { dCode: "D_7", name: "Dr. JAWAHIRA BANU(Homeopathy)", mobile: "9842909686", email: "", speciality: "Homeopathy", gender: "F", location: "Kadayanallur", loginId: "drjb", role: "DOCTOR", status: "active", gamificationPoints: 1400, consultationsToday: 4, rating: 4.5 },
  { dCode: "D_8", name: "Dr. Swathi(Ayurveda & Panchakarma Consultant)", mobile: "8807698672", email: "", speciality: "Ayurveda & Panchakarma Consultant", gender: "F", location: "Olukkur, Theni", loginId: "drsw", role: "DOCTOR", status: "active", gamificationPoints: 1200, consultationsToday: 3, rating: 4.4 },
  { dCode: "D_22", name: "Dr. Gab, Panchakarma(Ayurvedic Therapist)", mobile: "7143735118", email: "", speciality: "Therapist", gender: "M", location: "Kadayanallur", loginId: "drgab", role: "Therapist", status: "active", gamificationPoints: 980, consultationsToday: 7, rating: 4.3 },
  { dCode: "D_10", name: "Dr. DR.PRIYANKA(Ayurvedic Physician)", mobile: "7871379910", email: "", speciality: "Ayurvedic Physician", gender: "F", location: "Kadayanallur", loginId: "drpri2", role: "DOCTOR", status: "inactive", gamificationPoints: 850, consultationsToday: 0, rating: 4.2 },
  { dCode: "D_11", name: "Dr. Ranjith(Naturopathic)", mobile: "9363498388", email: "", speciality: "Naturopathic", gender: "M", location: "Kadayanallur", loginId: "drranj", role: "DOCTOR", status: "inactive", gamificationPoints: 720, consultationsToday: 0, rating: 4.1 },
  { dCode: "D_12", name: "Dr. VASUMATHI(Ayurvedic)", mobile: "9843314008", email: "", speciality: "Ayurvedic", gender: "F", location: "Kadayanallur", loginId: "drvasu", role: "DOCTOR", status: "inactive", gamificationPoints: 600, consultationsToday: 0, rating: 4.0 },
  { dCode: "D_13", name: "Dr. Mohamad Saleem(Ayurvedic Physician)", mobile: "9842809689", email: "", speciality: "Ayurvedic Physician", gender: "M", location: "Kadayanallur, Punalkulam, Theni", loginId: "drms2", role: "DOCTOR", status: "inactive", gamificationPoints: 500, consultationsToday: 0, rating: 4.0 },
  { dCode: "D_NEW1", name: "Dr. Anitha(Siddha)", mobile: "9876543210", email: "anitha@hospital.in", speciality: "Siddha", gender: "F", location: "Tenkasi", loginId: "", role: "DOCTOR", status: "new", gamificationPoints: 0, consultationsToday: 0, rating: 0 },
  { dCode: "D_NEW2", name: "Dr. Kumar(Yoga & Naturopathy)", mobile: "8765432109", email: "", speciality: "Yoga Teacher", gender: "M", location: "Rajapalayam", loginId: "", role: "Therapist", status: "new", gamificationPoints: 0, consultationsToday: 0, rating: 0 },
];

// ─── Gamification Badges ──────────────────────────────────────────────────────
const GAMIFICATION_LEVELS = [
  { min: 0, label: "Starter", color: "bg-gray-100 text-gray-700" },
  { min: 500, label: "Bronze", color: "bg-amber-100 text-amber-700" },
  { min: 1000, label: "Silver", color: "bg-slate-100 text-slate-700" },
  { min: 1500, label: "Gold", color: "bg-yellow-100 text-yellow-700" },
  { min: 2000, label: "Platinum", color: "bg-purple-100 text-purple-700" },
  { min: 3000, label: "Diamond", color: "bg-blue-100 text-blue-700" },
];

const POINTS_ACTIONS = [
  { action: "Consultation completed", points: 10 },
  { action: "On-time arrival", points: 5 },
  { action: "Patient 5-star review", points: 20 },
  { action: "Prescription with AI assist", points: 8 },
  { action: "Follow-up completed", points: 12 },
  { action: "Panchakarma session supervised", points: 15 },
  { action: "Research paper submitted", points: 50 },
  { action: "CME attendance", points: 25 },
  { action: "Zero patient complaint (week)", points: 30 },
  { action: "Therapy plan adherence 100%", points: 20 },
];

function getGamificationLevel(points: number) {
  for (let i = GAMIFICATION_LEVELS.length - 1; i >= 0; i--) {
    if (points >= GAMIFICATION_LEVELS[i].min) return GAMIFICATION_LEVELS[i];
  }
  return GAMIFICATION_LEVELS[0];
}

// ─── Doctor Table Component ───────────────────────────────────────────────────
const DoctorTable = ({ doctors, showGamification = true }: { doctors: Doctor[]; showGamification?: boolean }) => {
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState("100");

  const filtered = doctors.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.dCode.toLowerCase().includes(search.toLowerCase()) ||
      d.speciality.toLowerCase().includes(search.toLowerCase()) ||
      d.mobile.includes(search)
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm">Show</span>
          <Select value={entries} onValueChange={setEntries}>
            <SelectTrigger className="w-20 h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm">entries</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">Search:</span>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input className="h-8 pl-8 w-56" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-orange-600 font-semibold">DCode</TableHead>
              <TableHead className="text-orange-600 font-semibold">Name</TableHead>
              <TableHead className="text-orange-600 font-semibold">Mobile</TableHead>
              <TableHead className="text-orange-600 font-semibold">Email</TableHead>
              <TableHead className="text-orange-600 font-semibold">Speciality</TableHead>
              <TableHead className="text-orange-600 font-semibold">Gender</TableHead>
              <TableHead className="text-orange-600 font-semibold">Location</TableHead>
              {showGamification && <TableHead className="text-orange-600 font-semibold">Points</TableHead>}
              <TableHead className="text-orange-600 font-semibold w-20">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.slice(0, Number(entries)).map((doc) => {
              const level = getGamificationLevel(doc.gamificationPoints);
              return (
                <TableRow key={doc.dCode}>
                  <TableCell className="text-sm font-medium">{doc.dCode}</TableCell>
                  <TableCell className="text-sm">{doc.name}</TableCell>
                  <TableCell className="text-sm">{doc.mobile}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{doc.email || "—"}</TableCell>
                  <TableCell className="text-sm">{doc.speciality}</TableCell>
                  <TableCell className="text-sm">{doc.gender}</TableCell>
                  <TableCell className="text-sm">{doc.location}</TableCell>
                  {showGamification && (
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Badge className={`text-[10px] ${level.color}`}>
                          <Trophy className="h-2.5 w-2.5 mr-0.5" />{doc.gamificationPoints}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">{level.label}</span>
                      </div>
                    </TableCell>
                  )}
                  <TableCell>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-orange-500">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">Showing 1 to {Math.min(filtered.length, Number(entries))} of {filtered.length} entries</p>
    </div>
  );
};

// ─── Add New Doctor Form ──────────────────────────────────────────────────────
const AddDoctorDialog = () => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-orange-500 hover:bg-orange-600 gap-1.5">
          <UserPlus className="h-4 w-4" /> Start As On
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-orange-500">Register New Doctor</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Personal Info */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Personal Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div><Label className="text-xs">First Name *</Label><Input className="h-8" placeholder="First name" /></div>
              <div><Label className="text-xs">Last Name</Label><Input className="h-8" placeholder="Last name" /></div>
              <div><Label className="text-xs">Gender *</Label>
                <Select><SelectTrigger className="h-8"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent><SelectItem value="M">Male</SelectItem><SelectItem value="F">Female</SelectItem><SelectItem value="O">Other</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Date of Birth</Label><Input type="date" className="h-8" /></div>
              <div><Label className="text-xs">Mobile *</Label><Input className="h-8" placeholder="Mobile number" /></div>
              <div><Label className="text-xs">Email</Label><Input className="h-8" type="email" placeholder="Email" /></div>
            </div>
          </div>

          {/* Doctor Info */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Doctor / Therapist Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div><Label className="text-xs">Speciality *</Label>
                <Select><SelectTrigger className="h-8"><SelectValue placeholder="Select speciality" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ayurvedic-physician">Ayurvedic Physician</SelectItem>
                    <SelectItem value="panchakarma">Ayurveda & Panchakarma</SelectItem>
                    <SelectItem value="siddha">Siddha</SelectItem>
                    <SelectItem value="unani">Unani</SelectItem>
                    <SelectItem value="homeopathy">Homeopathy</SelectItem>
                    <SelectItem value="naturopathic">Naturopathic</SelectItem>
                    <SelectItem value="acupuncture">Acupuncture</SelectItem>
                    <SelectItem value="yoga">Yoga & Naturopathy</SelectItem>
                    <SelectItem value="therapist">Ayurvedic Therapist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Qualification</Label><Input className="h-8" placeholder="e.g. BAMS, MD(Ay)" /></div>
              <div><Label className="text-xs">Registration No</Label><Input className="h-8" placeholder="Council Reg No" /></div>
              <div><Label className="text-xs">Experience (years)</Label><Input className="h-8" type="number" placeholder="Years" /></div>
              <div><Label className="text-xs">Consultation Fee</Label><Input className="h-8" type="number" placeholder="Fee in INR" /></div>
              <div><Label className="text-xs">Role</Label>
                <Select><SelectTrigger className="h-8"><SelectValue placeholder="Select role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="therapist">Therapist</SelectItem>
                    <SelectItem value="consultant">Consultant</SelectItem>
                    <SelectItem value="surgeon">Surgeon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Consultation Schedule</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div><Label className="text-xs">Working Days</Label><Input className="h-8" defaultValue="Mon, Tue, Wed, Thu, Fri, Sat" /></div>
              <div><Label className="text-xs">Consultation Hours</Label><Input className="h-8" defaultValue="09:00 - 17:00" /></div>
              <div><Label className="text-xs">Slot Duration (min)</Label><Input className="h-8" type="number" defaultValue="15" /></div>
              <div><Label className="text-xs">Max Patients/Day</Label><Input className="h-8" type="number" defaultValue="40" /></div>
            </div>
          </div>

          {/* Preferences */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Preferences & AI Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2"><Switch defaultChecked /><Label className="text-xs">Enable AI Prescription Assist</Label></div>
              <div className="flex items-center gap-2"><Switch defaultChecked /><Label className="text-xs">Online Consultation Enabled</Label></div>
              <div className="flex items-center gap-2"><Switch defaultChecked /><Label className="text-xs">WhatsApp Appointment Alerts</Label></div>
              <div className="flex items-center gap-2"><Switch defaultChecked /><Label className="text-xs">Gamification Enabled</Label></div>
              <div className="flex items-center gap-2"><Switch /><Label className="text-xs">Auto-assign Therapy Follow-ups</Label></div>
              <div className="flex items-center gap-2"><Switch defaultChecked /><Label className="text-xs">SMS Schedule Reminders</Label></div>
            </div>
          </div>

          {/* Leader Role / Permits */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Leader Role Permits</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div><Label className="text-xs">Designation</Label><Input className="h-8" placeholder="e.g. HOD, Chief Consultant" /></div>
              <div><Label className="text-xs">Department</Label>
                <Select><SelectTrigger className="h-8"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ayurveda">Ayurveda</SelectItem>
                    <SelectItem value="panchakarma">Panchakarma</SelectItem>
                    <SelectItem value="siddha">Siddha</SelectItem>
                    <SelectItem value="unani">Unani</SelectItem>
                    <SelectItem value="yoga">Yoga</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Permit Role Timings */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Permit Role Timings</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div><Label className="text-xs">Date</Label><Input type="date" className="h-8" /></div>
              <div><Label className="text-xs">Time</Label><Input type="time" className="h-8" /></div>
              <div><Label className="text-xs">OP/IP</Label>
                <Select><SelectTrigger className="h-8"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent><SelectItem value="op">OP</SelectItem><SelectItem value="ip">IP</SelectItem><SelectItem value="both">Both</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div><Label className="text-xs">Notes / Bio</Label><Textarea rows={3} placeholder="Additional notes about the doctor..." /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => { toast.success("Doctor registered successfully! AI scheduling activated."); setOpen(false); }}>
            <Sparkles className="h-4 w-4 mr-1" /> Register & Activate AI
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const HmsDoctorManagement = () => {
  const [tab, setTab] = useState("active");
  const newDoctors = SAMPLE_DOCTORS.filter((d) => d.status === "new");
  const activeDoctors = SAMPLE_DOCTORS.filter((d) => d.status === "active");
  const inactiveDoctors = SAMPLE_DOCTORS.filter((d) => d.status === "inactive");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-orange-500" /> Manage Doctor
          </h1>
          <p className="text-sm text-muted-foreground">Doctor & consultant management with AI scheduling and gamification</p>
        </div>
        <div className="flex items-center gap-2">
          <AddDoctorDialog />
          <Button variant="outline" className="gap-1.5 text-green-600 border-green-200">
            <Award className="h-4 w-4" /> Start As On
          </Button>
        </div>
      </div>

      {/* AI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">Total Doctors</p>
          <p className="text-2xl font-bold">{SAMPLE_DOCTORS.length}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">Active Today</p>
          <p className="text-2xl font-bold text-green-600">{activeDoctors.length}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">Consultations Today</p>
          <p className="text-2xl font-bold text-blue-600">{activeDoctors.reduce((s, d) => s + d.consultationsToday, 0)}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">Avg Rating</p>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <p className="text-2xl font-bold">{(activeDoctors.reduce((s, d) => s + d.rating, 0) / activeDoctors.length).toFixed(1)}</p>
          </div>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">AI Insights</p>
          <p className="text-xs text-green-600 font-medium mt-1">2 doctors under-utilized</p>
          <p className="text-xs text-orange-600">1 slot conflict detected</p>
        </Card>
      </div>

      {/* Gamification Leaderboard Quick View */}
      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm flex items-center gap-1.5">
              <Trophy className="h-4 w-4 text-purple-600" /> Gamification Leaderboard
            </h3>
            <Badge variant="outline" className="text-[10px]">This Month</Badge>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-1">
            {activeDoctors.sort((a, b) => b.gamificationPoints - a.gamificationPoints).slice(0, 5).map((doc, i) => {
              const level = getGamificationLevel(doc.gamificationPoints);
              return (
                <div key={doc.dCode} className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold text-purple-600">#{i + 1}</span>
                  <div>
                    <p className="text-xs font-medium truncate max-w-[140px]">{doc.name.split("(")[0]}</p>
                    <div className="flex items-center gap-1">
                      <Badge className={`text-[9px] px-1.5 py-0 ${level.color}`}>{level.label}</Badge>
                      <span className="text-[10px] text-muted-foreground">{doc.gamificationPoints} pts</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 border-t pt-2">
            <p className="text-[10px] text-muted-foreground font-medium">Points earning actions:</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {POINTS_ACTIONS.slice(0, 5).map((pa) => (
                <Badge key={pa.action} variant="outline" className="text-[9px]">
                  {pa.action}: +{pa.points}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Doctor Tabs: New / Active / Inactive */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="new" className="gap-1.5">
            <UserPlus className="h-3.5 w-3.5" /> New ({newDoctors.length})
          </TabsTrigger>
          <TabsTrigger value="active" className="gap-1.5">
            <Users className="h-3.5 w-3.5" /> Active ({activeDoctors.length})
          </TabsTrigger>
          <TabsTrigger value="inactive" className="gap-1.5">
            <UserX className="h-3.5 w-3.5" /> Inactive ({inactiveDoctors.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="mt-4">
          <Card>
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-base text-orange-500 text-center">New Doctor Registrations (Pending Approval)</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {newDoctors.length > 0 ? (
                <DoctorTable doctors={newDoctors} showGamification={false} />
              ) : (
                <p className="text-center text-muted-foreground py-8">No new registrations pending</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="mt-4">
          <Card>
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-base text-orange-500 text-center">Manage Doctor</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <DoctorTable doctors={activeDoctors} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inactive" className="mt-4">
          <Card>
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-base text-orange-500 text-center">Manage Inactive Doctor</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <DoctorTable doctors={inactiveDoctors} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HmsDoctorManagement;
