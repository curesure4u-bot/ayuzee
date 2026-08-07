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
import { Calendar, ChevronLeft, ChevronRight, Plus, Users, Clock, CheckCircle, Activity } from "lucide-react";

const therapists = ["Suresh (M)", "Priya (F)", "Arun (M)", "Kavitha (F)", "Rajesh (M)"];
const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];

type ScheduleEntry = {
  id: string;
  therapist: string;
  time: string;
  patient: string;
  therapy: string;
  room: string;
  duration: string;
  status: "scheduled" | "in-progress" | "completed" | "no-show";
  notes: string;
};

const rooms = ["R1 (Abhyanga)", "R2 (Shirodhara)", "R3 (Vasti)", "R4 (Nasya)", "R5 (Steam)"];

const mockSchedule: ScheduleEntry[] = [
  { id: "1", therapist: "Suresh (M)", time: "09:00", patient: "Ramesh K.", therapy: "Abhyanga", room: "R1", duration: "45 min", status: "completed", notes: "Day 3 of 7" },
  { id: "2", therapist: "Suresh (M)", time: "10:00", patient: "Anand S.", therapy: "Nasya", room: "R4", duration: "30 min", status: "in-progress", notes: "Day 5 of 7" },
  { id: "3", therapist: "Priya (F)", time: "09:00", patient: "Lakshmi D.", therapy: "Shirodhara", room: "R2", duration: "45 min", status: "completed", notes: "Day 7 of 7 (Last)" },
  { id: "4", therapist: "Priya (F)", time: "11:00", patient: "Meera N.", therapy: "Njavarakizhi", room: "R1", duration: "60 min", status: "scheduled", notes: "Day 2 of 14" },
  { id: "5", therapist: "Arun (M)", time: "10:00", patient: "Sunil M.", therapy: "Vasti (Kashaya)", room: "R3", duration: "30 min", status: "in-progress", notes: "Day 8 of 16" },
  { id: "6", therapist: "Arun (M)", time: "14:00", patient: "Ramesh K.", therapy: "Pizhichil", room: "R1", duration: "60 min", status: "scheduled", notes: "Day 3 of 7" },
  { id: "7", therapist: "Kavitha (F)", time: "11:00", patient: "Meera N.", therapy: "Pizhichil", room: "R1", duration: "60 min", status: "scheduled", notes: "Assist to Priya" },
  { id: "8", therapist: "Kavitha (F)", time: "15:00", patient: "Lakshmi D.", therapy: "Elakizhi", room: "R2", duration: "45 min", status: "scheduled", notes: "Discharge tomorrow" },
  { id: "9", therapist: "Rajesh (M)", time: "09:00", patient: "Vinod P.", therapy: "Udvarthanam", room: "R5", duration: "45 min", status: "completed", notes: "Day 5 of 7" },
  { id: "10", therapist: "Rajesh (M)", time: "11:00", patient: "Pradeep R.", therapy: "Kativasti", room: "R3", duration: "30 min", status: "scheduled", notes: "Day 1 of 7" },
];

const HmsPanchakarmaSchedule = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [viewMode, setViewMode] = useState<"therapist" | "room">("therapist");
  const [assignOpen, setAssignOpen] = useState(false);

  const completedCount = mockSchedule.filter(s => s.status === "completed").length;
  const inProgressCount = mockSchedule.filter(s => s.status === "in-progress").length;
  const scheduledCount = mockSchedule.filter(s => s.status === "scheduled").length;

  const getStatusColor = (status: string) => {
    if (status === "completed") return "bg-green-100 border-green-200 text-green-800";
    if (status === "in-progress") return "bg-blue-100 border-blue-200 text-blue-800";
    if (status === "no-show") return "bg-red-100 border-red-200 text-red-800";
    return "bg-primary/10 border-primary/20";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-amber-600" /> Therapy Schedule
          </h1>
          <p className="text-sm text-muted-foreground">
            Daily therapy allocation with therapist assignment, room management & progress tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setAssignOpen(true)}><Plus className="mr-1 h-4 w-4" /> Assign Therapy</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card><CardContent className="p-3 text-center"><Activity className="h-5 w-5 mx-auto text-blue-600" /><p className="text-xl font-bold mt-1">{mockSchedule.length}</p><p className="text-xs text-muted-foreground">Total Sessions</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><CheckCircle className="h-5 w-5 mx-auto text-green-600" /><p className="text-xl font-bold mt-1 text-green-600">{completedCount}</p><p className="text-xs text-muted-foreground">Completed</p></CardContent></Card>
        <Card className="border-blue-200"><CardContent className="p-3 text-center"><Clock className="h-5 w-5 mx-auto text-blue-600" /><p className="text-xl font-bold mt-1 text-blue-600">{inProgressCount}</p><p className="text-xs text-muted-foreground">In Progress</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Calendar className="h-5 w-5 mx-auto text-amber-600" /><p className="text-xl font-bold mt-1">{scheduledCount}</p><p className="text-xs text-muted-foreground">Upcoming</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Users className="h-5 w-5 mx-auto text-purple-600" /><p className="text-xl font-bold mt-1">{therapists.length}</p><p className="text-xs text-muted-foreground">Therapists</p></CardContent></Card>
      </div>

      {/* Date Navigation */}
      <Card>
        <CardContent className="p-3 flex items-center justify-between">
          <Button variant="ghost" size="sm"><ChevronLeft className="h-4 w-4" /></Button>
          <div className="text-center">
            <p className="font-medium">{new Date(selectedDate).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
          <Button variant="ghost" size="sm"><ChevronRight className="h-4 w-4" /></Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="grid">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full">
          <TabsTrigger value="grid">Therapist Grid</TabsTrigger>
          <TabsTrigger value="room">Room View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="workload">Workload</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-4">
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium w-[80px]">Time</th>
                    {therapists.map((t) => (
                      <th key={t} className="px-3 py-2 text-left font-medium">{t}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((time) => (
                    <tr key={time} className="border-b">
                      <td className="px-3 py-3 font-medium text-muted-foreground text-xs">{time}</td>
                      {therapists.map((therapist) => {
                        const entry = mockSchedule.find((s) => s.therapist === therapist && s.time === time);
                        return (
                          <td key={`${therapist}-${time}`} className="px-2 py-2">
                            {entry ? (
                              <div className={`rounded-md border p-2 text-xs ${getStatusColor(entry.status)}`}>
                                <p className="font-medium">{entry.patient}</p>
                                <p className="opacity-75">{entry.therapy} · {entry.duration}</p>
                                <div className="flex items-center gap-1 mt-1">
                                  <Badge variant="outline" className="text-[9px]">{entry.room}</Badge>
                                  <Badge variant="outline" className="text-[9px] capitalize">{entry.status}</Badge>
                                </div>
                              </div>
                            ) : (
                              <div className="rounded-md border border-dashed border-muted-foreground/20 p-2 text-xs text-center text-muted-foreground cursor-pointer hover:bg-muted/30" onClick={() => setAssignOpen(true)}>
                                +
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="room" className="space-y-4">
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium w-[80px]">Time</th>
                    {rooms.map((r) => (
                      <th key={r} className="px-3 py-2 text-left font-medium text-xs">{r}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((time) => (
                    <tr key={time} className="border-b">
                      <td className="px-3 py-3 font-medium text-muted-foreground text-xs">{time}</td>
                      {rooms.map((room) => {
                        const roomCode = room.split(" ")[0];
                        const entry = mockSchedule.find((s) => s.room === roomCode && s.time === time);
                        return (
                          <td key={`${room}-${time}`} className="px-2 py-2">
                            {entry ? (
                              <div className={`rounded-md border p-1.5 text-[10px] ${getStatusColor(entry.status)}`}>
                                <p className="font-medium">{entry.patient}</p>
                                <p className="opacity-75">{entry.therapy}</p>
                                <p className="opacity-60">{entry.therapist}</p>
                              </div>
                            ) : (
                              <div className="text-center text-muted-foreground text-[10px]">—</div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Time</th>
                    <th className="px-3 py-2 text-left font-medium">Patient</th>
                    <th className="px-3 py-2 text-left font-medium">Therapy</th>
                    <th className="px-3 py-2 text-left font-medium">Therapist</th>
                    <th className="px-3 py-2 text-left font-medium">Room</th>
                    <th className="px-3 py-2 text-left font-medium">Duration</th>
                    <th className="px-3 py-2 text-left font-medium">Day</th>
                    <th className="px-3 py-2 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockSchedule.sort((a, b) => a.time.localeCompare(b.time)).map((s) => (
                    <tr key={s.id} className="border-b hover:bg-muted/30">
                      <td className="px-3 py-2 font-medium text-xs">{s.time}</td>
                      <td className="px-3 py-2 font-medium">{s.patient}</td>
                      <td className="px-3 py-2 text-xs">{s.therapy}</td>
                      <td className="px-3 py-2 text-xs">{s.therapist}</td>
                      <td className="px-3 py-2"><Badge variant="outline" className="text-[10px]">{s.room}</Badge></td>
                      <td className="px-3 py-2 text-xs">{s.duration}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{s.notes}</td>
                      <td className="px-3 py-2"><Badge variant={s.status === "completed" ? "outline" : s.status === "in-progress" ? "default" : "secondary"} className={`text-[10px] capitalize ${s.status === "completed" ? "text-green-600" : ""}`}>{s.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workload" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {therapists.map((t) => {
              const sessions = mockSchedule.filter((s) => s.therapist === t);
              const done = sessions.filter(s => s.status === "completed").length;
              const totalMinutes = sessions.reduce((sum, s) => sum + parseInt(s.duration), 0);
              return (
                <Card key={t}>
                  <CardContent className="p-4">
                    <p className="text-sm font-medium">{t}</p>
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-xs"><span>Sessions</span><span className="font-bold">{sessions.length}</span></div>
                      <div className="flex justify-between text-xs"><span>Completed</span><span className="font-bold text-green-600">{done}</span></div>
                      <div className="flex justify-between text-xs"><span>Total Time</span><span className="font-bold">{totalMinutes} min</span></div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 mt-3">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${sessions.length > 0 ? (done / sessions.length) * 100 : 0}%` }} />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{sessions.length > 0 ? Math.round((done / sessions.length) * 100) : 0}% done today</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Assign Therapy Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign Therapy Session</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Patient *</Label><Input placeholder="Search patient..." /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Therapy *</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="abhyanga">Abhyanga</SelectItem>
                    <SelectItem value="shirodhara">Shirodhara</SelectItem>
                    <SelectItem value="vasti">Vasti (Kashaya/Sneha)</SelectItem>
                    <SelectItem value="nasya">Nasya</SelectItem>
                    <SelectItem value="pizhichil">Pizhichil</SelectItem>
                    <SelectItem value="njavarakizhi">Njavarakizhi</SelectItem>
                    <SelectItem value="elakizhi">Elakizhi</SelectItem>
                    <SelectItem value="udvarthanam">Udvarthanam</SelectItem>
                    <SelectItem value="kativasti">Kativasti</SelectItem>
                    <SelectItem value="januvasti">Januvasti</SelectItem>
                    <SelectItem value="greevavasti">Greevavasti</SelectItem>
                    <SelectItem value="lepam">Lepam</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Duration</Label>
                <Select><SelectTrigger><SelectValue placeholder="45 min" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                    <SelectItem value="60">60 min</SelectItem>
                    <SelectItem value="90">90 min</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Therapist *</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{therapists.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Room</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{rooms.map(r => <SelectItem key={r} value={r.split(" ")[0]}>{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Time Slot</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{timeSlots.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Day # of course</Label><Input placeholder="e.g., Day 3 of 7" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Therapy session assigned"); setAssignOpen(false); }}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HmsPanchakarmaSchedule;
