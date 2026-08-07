import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Sparkles, Plus, Calendar, Users, Clock, Droplets,
  CheckCircle, ClipboardList, Loader2,
} from "lucide-react";
import { usePanchakarma } from "@/hooks/usePanchakarma";

const HmsPanchakarma = () => {
  const [addOpen, setAddOpen] = useState(false);
  const [recordOpen, setRecordOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // New session form
  const [newPatient, setNewPatient] = useState("");
  const [newTherapy, setNewTherapy] = useState("");
  const [newTherapist, setNewTherapist] = useState("");
  const [newRoom, setNewRoom] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newOil, setNewOil] = useState("");
  const [newOilQty, setNewOilQty] = useState("");

  const { sessions, packages, completedCount, inProgressCount, scheduledCount, loading, error, updateSessionStatus, addSession } = usePanchakarma();

  const handleAddSession = async () => {
    if (!newPatient || !newTherapy) {
      toast.error("Patient and therapy are required");
      return;
    }
    const success = await addSession({
      patientName: newPatient,
      therapy: newTherapy,
      therapist: newTherapist,
      room: newRoom,
      timeSlot: newTime,
      status: "scheduled",
      oilUsed: newOil,
      oilQty: newOilQty,
      notes: "",
    });
    if (success) {
      toast.success("Session scheduled");
      setAddOpen(false);
      setNewPatient(""); setNewTherapy(""); setNewTherapist(""); setNewRoom(""); setNewTime(""); setNewOil(""); setNewOilQty("");
    } else {
      toast.error("Failed to schedule session");
    }
  };

  const handleStart = async (id: string) => {
    const success = await updateSessionStatus(id, "in_progress");
    if (success) toast.success("Session started");
  };

  const handleComplete = async (id: string) => {
    const success = await updateSessionStatus(id, "completed");
    if (success) toast.success("Session completed");
    setRecordOpen(false);
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

      {loading && (
        <div className="flex items-center justify-center py-4 text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm">Loading therapy data...</span>
        </div>
      )}

      {error && !loading && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-2 text-xs text-amber-700">⚠ Could not load live data (showing demo). {error}</CardContent>
        </Card>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-green-200 bg-green-50/30">
          <CardContent className="p-3 text-center">
            <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
            <p className="text-2xl font-bold text-green-700 mt-1">{completedCount}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50/30">
          <CardContent className="p-3 text-center">
            <Clock className="h-5 w-5 text-blue-600 mx-auto" />
            <p className="text-2xl font-bold text-blue-700 mt-1">{inProgressCount}</p>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50/30">
          <CardContent className="p-3 text-center">
            <Calendar className="h-5 w-5 text-amber-600 mx-auto" />
            <p className="text-2xl font-bold text-amber-700 mt-1">{scheduledCount}</p>
            <p className="text-xs text-muted-foreground">Scheduled</p>
          </CardContent>
        </Card>
        <Card className="border-purple-200 bg-purple-50/30">
          <CardContent className="p-3 text-center">
            <Users className="h-5 w-5 text-purple-600 mx-auto" />
            <p className="text-2xl font-bold text-purple-700 mt-1">{packages.filter((p) => p.status === "active").length}</p>
            <p className="text-xs text-muted-foreground">Active Packages</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="today">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="today">Today's Schedule</TabsTrigger>
          <TabsTrigger value="packages">Active Packages</TabsTrigger>
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
                        {session.oilUsed && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            <Droplets className="inline h-3 w-3 mr-1" />
                            {session.oilUsed} ({session.oilQty})
                          </p>
                        )}
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
                        <Button size="sm" variant="ghost" onClick={() => handleStart(session.id)}>Start</Button>
                      )}
                      {session.status === "in_progress" && (
                        <Button size="sm" variant="ghost" onClick={() => { setSelectedSessionId(session.id); setRecordOpen(true); }}>Complete</Button>
                      )}
                    </div>
                  </div>
                ))}
                {sessions.length === 0 && (
                  <p className="text-center text-muted-foreground text-sm py-6">No sessions scheduled for today</p>
                )}
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
                      <Badge variant={pkg.status === "active" ? "default" : "outline"}>{pkg.status}</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress: {pkg.completedSessions}/{pkg.totalSessions} sessions</span>
                        <span>{Math.round((pkg.completedSessions / pkg.totalSessions) * 100)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${(pkg.completedSessions / pkg.totalSessions) * 100}%` }} />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Start: {pkg.startDate}</span>
                        <span>End: {pkg.endDate}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Session Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Schedule Therapy Session</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><label className="text-xs font-medium">Patient *</label><Input className="h-8 text-xs" value={newPatient} onChange={(e) => setNewPatient(e.target.value)} placeholder="Patient name" /></div>
            <div className="space-y-1"><label className="text-xs font-medium">Therapy *</label><Input className="h-8 text-xs" value={newTherapy} onChange={(e) => setNewTherapy(e.target.value)} placeholder="e.g. Abhyanga" /></div>
            <div className="space-y-1"><label className="text-xs font-medium">Therapist</label><Input className="h-8 text-xs" value={newTherapist} onChange={(e) => setNewTherapist(e.target.value)} placeholder="Therapist name" /></div>
            <div className="space-y-1"><label className="text-xs font-medium">Room</label><Select value={newRoom} onValueChange={setNewRoom}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="Room 1">Room 1</SelectItem><SelectItem value="Room 2">Room 2</SelectItem><SelectItem value="Room 3">Room 3</SelectItem><SelectItem value="Room 4">Room 4</SelectItem></SelectContent></Select></div>
            <div className="space-y-1"><label className="text-xs font-medium">Time Slot</label><Input className="h-8 text-xs" value={newTime} onChange={(e) => setNewTime(e.target.value)} placeholder="e.g. 09:00-10:00" /></div>
            <div className="space-y-1"><label className="text-xs font-medium">Oil/Material</label><Input className="h-8 text-xs" value={newOil} onChange={(e) => setNewOil(e.target.value)} placeholder="e.g. Dhanwantharam Tailam" /></div>
            <div className="space-y-1"><label className="text-xs font-medium">Quantity</label><Input className="h-8 text-xs" value={newOilQty} onChange={(e) => setNewOilQty(e.target.value)} placeholder="e.g. 200ml" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddSession}>Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Session Dialog */}
      <Dialog open={recordOpen} onOpenChange={setRecordOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Complete Session</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Mark this session as completed?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRecordOpen(false)}>Cancel</Button>
            <Button onClick={() => selectedSessionId && handleComplete(selectedSessionId)}>Mark Complete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HmsPanchakarma;
