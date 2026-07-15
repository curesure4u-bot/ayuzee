import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Sparkles, Plus, Calendar, Users, Clock, Droplets,
  CheckCircle, AlertTriangle, BedDouble, ClipboardList,
} from "lucide-react";

type TherapySession = {
  id: string;
  patientName: string;
  therapy: string;
  therapist: string;
  room: string;
  timeSlot: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  oilUsed: string;
  oilQty: string;
  notes: string;
};

type ActivePackage = {
  id: string;
  patientName: string;
  packageName: string;
  totalSessions: number;
  completedSessions: number;
  startDate: string;
  endDate: string;
  status: "active" | "completed" | "paused";
};

const mockSessions: TherapySession[] = [
  { id: "1", patientName: "Ramesh Kumar", therapy: "Abhyanga", therapist: "Suresh (M)", room: "Room 1", timeSlot: "09:00-10:00", status: "completed", oilUsed: "Dhanwantharam Tailam", oilQty: "200ml", notes: "" },
  { id: "2", patientName: "Lakshmi Devi", therapy: "Shirodhara", therapist: "Priya (F)", room: "Room 2", timeSlot: "09:30-10:30", status: "in_progress", oilUsed: "Ksheerabala Tailam", oilQty: "500ml", notes: "" },
  { id: "3", patientName: "Sunil Menon", therapy: "Vasti (Kashaya)", therapist: "Arun (M)", room: "Room 3", timeSlot: "10:00-11:00", status: "scheduled", oilUsed: "Dashamoola Kashaya", oilQty: "400ml", notes: "" },
  { id: "4", patientName: "Meera Nair", therapy: "Pizhichil", therapist: "Kavitha (F)", room: "Room 1", timeSlot: "11:00-12:30", status: "scheduled", oilUsed: "Murivenna", oilQty: "1000ml", notes: "" },
  { id: "5", patientName: "Anand Sharma", therapy: "Nasya", therapist: "Suresh (M)", room: "Room 4", timeSlot: "10:30-11:00", status: "scheduled", oilUsed: "Anu Tailam", oilQty: "10ml", notes: "" },
];

const mockPackages: ActivePackage[] = [
  { id: "1", patientName: "Ramesh Kumar", packageName: "14-day Panchakarma (Full)", totalSessions: 42, completedSessions: 28, startDate: "2026-07-01", endDate: "2026-07-14", status: "active" },
  { id: "2", patientName: "Lakshmi Devi", packageName: "7-day Shirodhara Course", totalSessions: 7, completedSessions: 5, startDate: "2026-07-09", endDate: "2026-07-15", status: "active" },
  { id: "3", patientName: "Sunil Menon", packageName: "21-day Detox Program", totalSessions: 63, completedSessions: 12, startDate: "2026-07-05", endDate: "2026-07-25", status: "active" },
];

const HmsPanchakarma = () => {
  const [sessions, setSessions] = useState<TherapySession[]>(mockSessions);
  const [packages] = useState<ActivePackage[]>(mockPackages);
  const [addOpen, setAddOpen] = useState(false);
  const [recordOpen, setRecordOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<TherapySession | null>(null);

  // New session form
  const [newPatient, setNewPatient] = useState("");
  const [newTherapy, setNewTherapy] = useState("");
  const [newTherapist, setNewTherapist] = useState("");
  const [newRoom, setNewRoom] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newOil, setNewOil] = useState("");
  const [newOilQty, setNewOilQty] = useState("");

  // Daily record
  const [recordNotes, setRecordNotes] = useState("");
  const [recordBP, setRecordBP] = useState("");
  const [recordPulse, setRecordPulse] = useState("");
  const [recordReaction, setRecordReaction] = useState("");

  const todaysCompleted = sessions.filter((s) => s.status === "completed").length;
  const todaysInProgress = sessions.filter((s) => s.status === "in_progress").length;
  const todaysScheduled = sessions.filter((s) => s.status === "scheduled").length;

  const updateSessionStatus = (id: string, status: TherapySession["status"]) => {
    setSessions(sessions.map((s) => s.id === id ? { ...s, status } : s));
    toast.success(`Session marked as ${status}`);
  };

  const addSession = () => {
    if (!newPatient || !newTherapy) return toast.error("Patient and therapy are required");
    const newS: TherapySession = {
      id: String(Date.now()),
      patientName: newPatient,
      therapy: newTherapy,
      therapist: newTherapist,
      room: newRoom,
      timeSlot: newTime,
      status: "scheduled",
      oilUsed: newOil,
      oilQty: newOilQty,
      notes: "",
    };
    setSessions([...sessions, newS]);
    toast.success("Session scheduled");
    setAddOpen(false);
    setNewPatient(""); setNewTherapy(""); setNewTherapist(""); setNewRoom(""); setNewTime(""); setNewOil(""); setNewOilQty("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-amber-600" /> Panchakarma Management
          </h1>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })} · {sessions.length} sessions today
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="mr-1 h-4 w-4" /> Schedule Session
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-green-200 bg-green-50/30">
          <CardContent className="p-3 text-center">
            <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
            <p className="text-2xl font-bold text-green-700 mt-1">{todaysCompleted}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50/30">
          <CardContent className="p-3 text-center">
            <Clock className="h-5 w-5 text-blue-600 mx-auto" />
            <p className="text-2xl font-bold text-blue-700 mt-1">{todaysInProgress}</p>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50/30">
          <CardContent className="p-3 text-center">
            <Calendar className="h-5 w-5 text-amber-600 mx-auto" />
            <p className="text-2xl font-bold text-amber-700 mt-1">{todaysScheduled}</p>
            <p className="text-xs text-muted-foreground">Scheduled</p>
          </CardContent>
        </Card>
        <Card className="border-purple-200 bg-purple-50/30">
          <CardContent className="p-3 text-center">
            <Users className="h-5 w-5 text-purple-600 mx-auto" />
            <p className="text-2xl font-bold text-purple-700 mt-1">{packages.filter(p => p.status === "active").length}</p>
            <p className="text-xs text-muted-foreground">Active Packages</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="today">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full">
          <TabsTrigger value="today">Today's Schedule</TabsTrigger>
          <TabsTrigger value="packages">Active Packages</TabsTrigger>
          <TabsTrigger value="rooms">Room Allocation</TabsTrigger>
          <TabsTrigger value="oils">Oil & Material Usage</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardList className="h-4 w-4" /> Today's Therapy Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/30 transition">
                    <div className="flex items-center gap-4">
                      <div className="text-center min-w-[70px]">
                        <p className="text-xs text-muted-foreground">Time</p>
                        <p className="text-sm font-medium">{session.timeSlot}</p>
                      </div>
                      <div>
                        <p className="font-medium">{session.patientName}</p>
                        <p className="text-sm text-muted-foreground">
                          {session.therapy} · {session.therapist} · {session.room}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          <Droplets className="inline h-3 w-3 mr-1" />
                          {session.oilUsed} ({session.oilQty})
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        session.status === "completed" ? "outline" :
                        session.status === "in_progress" ? "default" :
                        session.status === "cancelled" ? "destructive" : "secondary"
                      }>
                        {session.status.replace("_", " ")}
                      </Badge>
                      {session.status === "scheduled" && (
                        <Button size="sm" variant="ghost" onClick={() => updateSessionStatus(session.id, "in_progress")}>
                          Start
                        </Button>
                      )}
                      {session.status === "in_progress" && (
                        <Button size="sm" variant="ghost" onClick={() => {
                          setSelectedSession(session);
                          setRecordOpen(true);
                        }}>
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="packages" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Active Treatment Packages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {packages.map((pkg) => (
                  <div key={pkg.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium">{pkg.patientName}</p>
                        <p className="text-sm text-muted-foreground">{pkg.packageName}</p>
                      </div>
                      <Badge variant={pkg.status === "active" ? "default" : "outline"}>
                        {pkg.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress: {pkg.completedSessions}/{pkg.totalSessions} sessions</span>
                        <span>{Math.round((pkg.completedSessions / pkg.totalSessions) * 100)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${(pkg.completedSessions / pkg.totalSessions) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Started: {new Date(pkg.startDate).toLocaleDateString("en-IN")}</span>
                        <span>Ends: {new Date(pkg.endDate).toLocaleDateString("en-IN")}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rooms" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BedDouble className="h-4 w-4" /> Therapy Room Allocation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {["Room 1", "Room 2", "Room 3", "Room 4"].map((room) => {
                  const roomSessions = sessions.filter((s) => s.room === room);
                  const currentSession = roomSessions.find((s) => s.status === "in_progress");
                  return (
                    <Card key={room} className={currentSession ? "border-blue-300 bg-blue-50/30" : "border-green-200 bg-green-50/20"}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-sm">{room}</p>
                          <Badge variant={currentSession ? "default" : "outline"} className="text-xs">
                            {currentSession ? "Occupied" : "Available"}
                          </Badge>
                        </div>
                        {currentSession ? (
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{currentSession.patientName}</p>
                            <p className="text-xs text-muted-foreground">{currentSession.therapy}</p>
                            <p className="text-xs text-muted-foreground">{currentSession.therapist}</p>
                            <p className="text-xs text-muted-foreground">{currentSession.timeSlot}</p>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">No active session</p>
                        )}
                        <div className="mt-2 pt-2 border-t">
                          <p className="text-xs text-muted-foreground">
                            Today: {roomSessions.length} sessions scheduled
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="oils" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Droplets className="h-4 w-4" /> Oil & Material Usage Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Oil/Material</th>
                      <th className="px-4 py-2 text-left font-medium">Used For</th>
                      <th className="px-4 py-2 text-left font-medium">Quantity</th>
                      <th className="px-4 py-2 text-left font-medium">Patient</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((s) => (
                      <tr key={s.id} className="border-b">
                        <td className="px-4 py-2 font-medium">{s.oilUsed}</td>
                        <td className="px-4 py-2">{s.therapy}</td>
                        <td className="px-4 py-2">{s.oilQty}</td>
                        <td className="px-4 py-2">{s.patientName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <p className="text-sm font-medium text-amber-700">Low Stock Alert</p>
                </div>
                <p className="text-xs text-amber-600 mt-1">
                  Ksheerabala Tailam: Only 2L remaining. Dhanwantharam Tailam: 1.5L remaining.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Schedule Session Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Schedule Panchakarma Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Patient Name *</Label>
              <Input value={newPatient} onChange={(e) => setNewPatient(e.target.value)} placeholder="Search patient" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Therapy *</Label>
                <Select value={newTherapy} onValueChange={setNewTherapy}>
                  <SelectTrigger><SelectValue placeholder="Select therapy" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Abhyanga">Abhyanga (Oil massage)</SelectItem>
                    <SelectItem value="Shirodhara">Shirodhara</SelectItem>
                    <SelectItem value="Pizhichil">Pizhichil</SelectItem>
                    <SelectItem value="Njavarakizhi">Njavarakizhi</SelectItem>
                    <SelectItem value="Elakizhi">Elakizhi</SelectItem>
                    <SelectItem value="Podikizhi">Podikizhi</SelectItem>
                    <SelectItem value="Udwarthanam">Udwarthanam</SelectItem>
                    <SelectItem value="Vasti (Kashaya)">Vasti (Kashaya)</SelectItem>
                    <SelectItem value="Vasti (Sneha)">Vasti (Sneha)</SelectItem>
                    <SelectItem value="Nasya">Nasya</SelectItem>
                    <SelectItem value="Vamana">Vamana</SelectItem>
                    <SelectItem value="Virechana">Virechana</SelectItem>
                    <SelectItem value="Raktamokshana">Raktamokshana</SelectItem>
                    <SelectItem value="Thalam">Thalam</SelectItem>
                    <SelectItem value="Lepanam">Lepanam</SelectItem>
                    <SelectItem value="Kativasti">Kativasti</SelectItem>
                    <SelectItem value="Januvasti">Januvasti</SelectItem>
                    <SelectItem value="Greevavasti">Greevavasti</SelectItem>
                    <SelectItem value="Netra Tarpana">Netra Tarpana</SelectItem>
                    <SelectItem value="Karnapoorana">Karnapoorana</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Therapist</Label>
                <Select value={newTherapist} onValueChange={setNewTherapist}>
                  <SelectTrigger><SelectValue placeholder="Assign" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Suresh (M)">Suresh (M)</SelectItem>
                    <SelectItem value="Priya (F)">Priya (F)</SelectItem>
                    <SelectItem value="Arun (M)">Arun (M)</SelectItem>
                    <SelectItem value="Kavitha (F)">Kavitha (F)</SelectItem>
                    <SelectItem value="Rajesh (M)">Rajesh (M)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Room</Label>
                <Select value={newRoom} onValueChange={setNewRoom}>
                  <SelectTrigger><SelectValue placeholder="Select room" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Room 1">Room 1 (General)</SelectItem>
                    <SelectItem value="Room 2">Room 2 (Shirodhara)</SelectItem>
                    <SelectItem value="Room 3">Room 3 (Vasti)</SelectItem>
                    <SelectItem value="Room 4">Room 4 (Nasya)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Time Slot</Label>
                <Input value={newTime} onChange={(e) => setNewTime(e.target.value)} placeholder="e.g., 09:00-10:00" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Oil/Material</Label>
                <Input value={newOil} onChange={(e) => setNewOil(e.target.value)} placeholder="e.g., Dhanwantharam Tailam" />
              </div>
              <div>
                <Label>Quantity</Label>
                <Input value={newOilQty} onChange={(e) => setNewOilQty(e.target.value)} placeholder="e.g., 200ml" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={addSession}>Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Daily Record Dialog */}
      <Dialog open={recordOpen} onOpenChange={setRecordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Session & Record</DialogTitle>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm font-medium">{selectedSession.patientName}</p>
                <p className="text-xs text-muted-foreground">{selectedSession.therapy} · {selectedSession.therapist}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>BP (Before/After)</Label>
                  <Input value={recordBP} onChange={(e) => setRecordBP(e.target.value)} placeholder="120/80 → 118/78" />
                </div>
                <div>
                  <Label>Pulse (Before/After)</Label>
                  <Input value={recordPulse} onChange={(e) => setRecordPulse(e.target.value)} placeholder="78 → 72" />
                </div>
              </div>
              <div>
                <Label>Patient Reaction</Label>
                <Select value={recordReaction} onValueChange={setRecordReaction}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="good">Good tolerance, no issues</SelectItem>
                    <SelectItem value="mild_discomfort">Mild discomfort</SelectItem>
                    <SelectItem value="sweating">Sweating observed</SelectItem>
                    <SelectItem value="nausea">Nausea/vomiting urge</SelectItem>
                    <SelectItem value="allergic">Allergic reaction</SelectItem>
                    <SelectItem value="relaxed">Very relaxed/slept</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Session Notes</Label>
                <Textarea
                  value={recordNotes}
                  onChange={(e) => setRecordNotes(e.target.value)}
                  placeholder="Treatment observations, patient feedback, any issues..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRecordOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              if (selectedSession) {
                updateSessionStatus(selectedSession.id, "completed");
                setRecordOpen(false);
                setSelectedSession(null);
                setRecordNotes(""); setRecordBP(""); setRecordPulse(""); setRecordReaction("");
              }
            }}>
              Mark Completed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HmsPanchakarma;
