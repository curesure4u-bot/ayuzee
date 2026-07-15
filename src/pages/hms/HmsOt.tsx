import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Syringe, Plus, Calendar, Clock, Users, CheckCircle,
  AlertTriangle, Activity,
} from "lucide-react";

type OtSchedule = {
  id: string;
  otRoom: string;
  patient: string;
  procedure: string;
  surgeon: string;
  anesthetist: string;
  nursingTeam: string;
  scheduledTime: string;
  duration: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled" | "delayed";
  type: "elective" | "emergency";
};

type OtRoom = {
  id: string;
  name: string;
  type: string;
  status: "available" | "in_use" | "cleaning" | "maintenance";
  currentCase: string;
  utilizationToday: number;
};

const mockRooms: OtRoom[] = [
  { id: "1", name: "OT-1 (Major)", type: "General Surgery", status: "in_use", currentCase: "Ksharasutra - Fistula", utilizationToday: 75 },
  { id: "2", name: "OT-2 (Minor)", type: "Minor Procedures", status: "available", currentCase: "", utilizationToday: 40 },
  { id: "3", name: "OT-3 (Panchakarma Surgical)", type: "Ayurveda Para-Surgical", status: "cleaning", currentCase: "", utilizationToday: 60 },
  { id: "4", name: "OT-4 (Emergency)", type: "Emergency", status: "available", currentCase: "", utilizationToday: 20 },
];

const mockSchedule: OtSchedule[] = [
  { id: "1", otRoom: "OT-1", patient: "Sunil Menon", procedure: "Ksharasutra Application (Fistula)", surgeon: "Dr. Nair", anesthetist: "Dr. Anand (LA)", nursingTeam: "Nurse Priya, Nurse Anu", scheduledTime: "09:00-10:30", duration: "90 min", status: "in_progress", type: "elective" },
  { id: "2", otRoom: "OT-3", patient: "Ramesh Kumar", procedure: "Agnikarma - Bilateral Heel", surgeon: "Dr. Nair", anesthetist: "N/A (Local)", nursingTeam: "Nurse Kavitha", scheduledTime: "10:00-10:30", duration: "30 min", status: "completed", type: "elective" },
  { id: "3", otRoom: "OT-2", patient: "Lakshmi Devi", procedure: "Jalaukavacharana (Leech Therapy)", surgeon: "Dr. Sharma", anesthetist: "N/A", nursingTeam: "Nurse Priya", scheduledTime: "11:00-11:45", duration: "45 min", status: "scheduled", type: "elective" },
  { id: "4", otRoom: "OT-1", patient: "Anand Sharma", procedure: "Raktamokshana (Bloodletting)", surgeon: "Dr. Nair", anesthetist: "N/A (Local)", nursingTeam: "Nurse Anu", scheduledTime: "11:30-12:00", duration: "30 min", status: "scheduled", type: "elective" },
  { id: "5", otRoom: "OT-3", patient: "Meera Nair", procedure: "Kshara Karma - Cervical Erosion", surgeon: "Dr. Meena", anesthetist: "Dr. Anand (SA)", nursingTeam: "Nurse Kavitha, Nurse Sita", scheduledTime: "14:00-15:30", duration: "90 min", status: "scheduled", type: "elective" },
];

const HmsOt = () => {
  const [rooms] = useState<OtRoom[]>(mockRooms);
  const [schedule] = useState<OtSchedule[]>(mockSchedule);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const inProgress = schedule.filter(s => s.status === "in_progress").length;
  const completed = schedule.filter(s => s.status === "completed").length;
  const upcoming = schedule.filter(s => s.status === "scheduled").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Syringe className="h-6 w-6 text-rose-600" /> Operation Theater Management
          </h1>
          <p className="text-sm text-muted-foreground">Multi-OT scheduling, surgical team assignment, utilization & procedure tracking</p>
        </div>
        <Button size="sm" onClick={() => setScheduleOpen(true)}><Plus className="mr-1 h-4 w-4" /> Schedule Procedure</Button>
      </div>

      {/* OT Room Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {rooms.map((room) => (
          <Card key={room.id} className={room.status === "in_use" ? "border-red-300 bg-red-50/20" : room.status === "cleaning" ? "border-amber-300 bg-amber-50/20" : "border-green-200 bg-green-50/20"}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-sm">{room.name}</p>
                <Badge variant={room.status === "in_use" ? "destructive" : room.status === "available" ? "outline" : "secondary"} className={`text-xs capitalize ${room.status === "available" ? "text-green-600" : ""}`}>{room.status.replace("_", " ")}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{room.type}</p>
              {room.currentCase && <p className="text-xs font-medium mt-1 text-red-700">{room.currentCase}</p>}
              <div className="mt-2">
                <div className="flex justify-between text-[10px] mb-0.5"><span>Utilization</span><span>{room.utilizationToday}%</span></div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${room.utilizationToday > 70 ? "bg-green-500" : room.utilizationToday > 40 ? "bg-amber-500" : "bg-red-400"}`} style={{ width: `${room.utilizationToday}%` }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><Activity className="h-5 w-5 mx-auto text-red-600" /><p className="text-xl font-bold mt-1">{inProgress}</p><p className="text-xs text-muted-foreground">In Progress</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Calendar className="h-5 w-5 mx-auto text-blue-600" /><p className="text-xl font-bold mt-1">{upcoming}</p><p className="text-xs text-muted-foreground">Upcoming</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><CheckCircle className="h-5 w-5 mx-auto text-green-600" /><p className="text-xl font-bold mt-1">{completed}</p><p className="text-xs text-muted-foreground">Completed</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Clock className="h-5 w-5 mx-auto text-purple-600" /><p className="text-xl font-bold mt-1">{schedule.length}</p><p className="text-xs text-muted-foreground">Total Today</p></CardContent></Card>
      </div>

      {/* Schedule Table */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Today's OT Schedule</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Time</th>
                  <th className="px-3 py-2 text-left font-medium">OT Room</th>
                  <th className="px-3 py-2 text-left font-medium">Patient</th>
                  <th className="px-3 py-2 text-left font-medium">Procedure</th>
                  <th className="px-3 py-2 text-left font-medium">Surgeon</th>
                  <th className="px-3 py-2 text-left font-medium">Anesthesia</th>
                  <th className="px-3 py-2 text-left font-medium">Team</th>
                  <th className="px-3 py-2 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((s) => (
                  <tr key={s.id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2 font-mono text-xs">{s.scheduledTime}<br/><span className="text-muted-foreground">{s.duration}</span></td>
                    <td className="px-3 py-2"><Badge variant="outline" className="text-xs">{s.otRoom}</Badge></td>
                    <td className="px-3 py-2 font-medium">{s.patient}</td>
                    <td className="px-3 py-2 text-xs">{s.procedure}</td>
                    <td className="px-3 py-2 text-xs">{s.surgeon}</td>
                    <td className="px-3 py-2 text-xs">{s.anesthetist}</td>
                    <td className="px-3 py-2 text-[10px] text-muted-foreground">{s.nursingTeam}</td>
                    <td className="px-3 py-2">
                      <Badge variant={s.status === "in_progress" ? "default" : s.status === "completed" ? "outline" : s.status === "cancelled" ? "destructive" : "secondary"} className={`text-xs capitalize ${s.status === "completed" ? "text-green-600" : ""}`}>{s.status.replace("_", " ")}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Dialog */}
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Schedule OT Procedure</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Patient *</Label><Input placeholder="Search patient / IP No" /></div>
            <div><Label>Procedure *</Label>
              <Select><SelectTrigger><SelectValue placeholder="Select procedure" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ksharasutra">Ksharasutra Application</SelectItem>
                  <SelectItem value="agnikarma">Agnikarma (Thermal Cautery)</SelectItem>
                  <SelectItem value="raktamokshana">Raktamokshana (Bloodletting)</SelectItem>
                  <SelectItem value="jalaukavacharana">Jalaukavacharana (Leech)</SelectItem>
                  <SelectItem value="kshara_karma">Kshara Karma</SelectItem>
                  <SelectItem value="vrana_karma">Vrana Karma (Wound care)</SelectItem>
                  <SelectItem value="marma_chikitsa">Marma Chikitsa</SelectItem>
                  <SelectItem value="other">Other Procedure</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>OT Room *</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{rooms.map(r => <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Type</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent><SelectItem value="elective">Elective</SelectItem><SelectItem value="emergency">Emergency</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date & Time</Label><Input type="datetime-local" /></div>
              <div><Label>Est. Duration</Label><Input placeholder="e.g., 60 min" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Surgeon *</Label><Input placeholder="Surgeon name" /></div>
              <div><Label>Anesthetist</Label><Input placeholder="Anesthetist / N/A" /></div>
            </div>
            <div><Label>Nursing Team</Label><Input placeholder="Assigned nurses (comma separated)" /></div>
            <div><Label>Special Instructions</Label><Input placeholder="Pre-op / post-op notes" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Procedure scheduled"); setScheduleOpen(false); }}>Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HmsOt;
