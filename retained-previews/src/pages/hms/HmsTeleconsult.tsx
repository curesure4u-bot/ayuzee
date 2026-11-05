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
  Video, VideoOff, Mic, MicOff, Monitor, Phone, PhoneOff,
  MessageCircle, FileText, Users, Clock, Calendar,
  Plus, IndianRupee, CheckCircle, Send, Loader2,
} from "lucide-react";
import { useTeleconsult } from "@/hooks/useTeleconsult";

const HmsTeleconsult = () => {
  const { sessions, loading, error, waiting, completed, totalToday, scheduleSession } = useTeleconsult();
  const [inCall, setInCall] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  // Schedule form state
  const [newPatient, setNewPatient] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newDoctor, setNewDoctor] = useState("");
  const [newDateTime, setNewDateTime] = useState("");
  const [newFee, setNewFee] = useState("500");
  const [newType, setNewType] = useState("");

  const totalRevenue = sessions.filter(c => c.status !== "no_show").length * 600;

  const handleSchedule = async () => {
    if (!newPatient.trim() || !newPhone.trim()) return toast.error("Patient name and phone required");
    await scheduleSession({
      patient: newPatient, phone: newPhone,
      doctor: newDoctor || "Dr. Arun Sharma",
      scheduledAt: newDateTime || new Date().toISOString(),
      type: newType || "New Consultation",
      payment: `₹${newFee} (Pending)`,
    });
    toast.success("Teleconsult scheduled. Payment link sent via WhatsApp.");
    setScheduleOpen(false);
    setNewPatient(""); setNewPhone(""); setNewDoctor(""); setNewDateTime(""); setNewFee("500"); setNewType("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Video className="h-6 w-6 text-blue-600" /> Teleconsultation
          </h1>
          <p className="text-sm text-muted-foreground">Video consult room · Prescription during call · Screen share · Post-consult summary</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setScheduleOpen(true)}><Plus className="mr-1 h-4 w-4" /> Schedule Teleconsult</Button>
        </div>
      </div>

      {/* Stats */}
      {loading && (
        <div className="flex items-center justify-center py-2 text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm">Loading sessions...</span>
        </div>
      )}
      {error && !loading && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-2 text-xs text-amber-700">⚠ Using demo data. {error}</CardContent>
        </Card>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card><CardContent className="p-3 text-center"><Calendar className="h-5 w-5 mx-auto text-blue-600" /><p className="text-xl font-bold mt-1">{totalToday}</p><p className="text-xs text-muted-foreground">Today's Sessions</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><Video className="h-5 w-5 mx-auto text-green-600" /><p className="text-xl font-bold mt-1 text-green-600">{waiting}</p><p className="text-xs text-muted-foreground">Waiting Now</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><CheckCircle className="h-5 w-5 mx-auto text-purple-600" /><p className="text-xl font-bold mt-1">{completed}</p><p className="text-xs text-muted-foreground">Completed</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><IndianRupee className="h-5 w-5 mx-auto text-green-600" /><p className="text-lg font-bold mt-1">₹{totalRevenue.toLocaleString("en-IN")}</p><p className="text-xs text-muted-foreground">Revenue</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Clock className="h-5 w-5 mx-auto text-amber-600" /><p className="text-xl font-bold mt-1">20 min</p><p className="text-xs text-muted-foreground">Avg Duration</p></CardContent></Card>
      </div>

      <Tabs defaultValue="room">
        <TabsList className="grid grid-cols-2 sm:grid-cols-3 w-full">
          <TabsTrigger value="room">Video Consult Room</TabsTrigger>
          <TabsTrigger value="schedule">Today's Schedule</TabsTrigger>
          <TabsTrigger value="history">Session History</TabsTrigger>
        </TabsList>

        <TabsContent value="room" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Video Area */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-900 border-0 overflow-hidden">
                <CardContent className="p-0">
                  {!inCall ? (
                    <div className="aspect-video flex flex-col items-center justify-center text-white">
                      <Video className="h-16 w-16 text-white/30 mb-4" />
                      <p className="text-lg font-medium">No Active Call</p>
                      <p className="text-sm text-white/50 mt-1">Select a waiting patient to start consultation</p>
                      <Button className="mt-4" onClick={() => { setInCall(true); toast.success("Connecting to patient..."); }}>
                        <Phone className="mr-2 h-4 w-4" /> Start Next Consult
                      </Button>
                    </div>
                  ) : (
                    <div className="aspect-video relative bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                      {/* Patient video placeholder */}
                      <div className="text-center text-white">
                        <div className="h-24 w-24 rounded-full bg-primary/20 grid place-items-center mx-auto mb-3">
                          <Users className="h-12 w-12 text-primary" />
                        </div>
                        <p className="font-medium">Priya Menon (Dubai)</p>
                        <p className="text-sm text-white/50">Connected · 03:42</p>
                      </div>
                      {/* Doctor self-view */}
                      <div className="absolute bottom-4 right-4 w-32 h-24 rounded-lg bg-slate-700 border border-white/20 flex items-center justify-center">
                        <p className="text-[10px] text-white/50">You</p>
                      </div>
                      {/* Call Controls */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
                        <Button size="sm" variant={micOn ? "outline" : "destructive"} className="rounded-full h-10 w-10 p-0 border-white/30 text-white" onClick={() => setMicOn(!micOn)}>
                          {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                        </Button>
                        <Button size="sm" variant={videoOn ? "outline" : "destructive"} className="rounded-full h-10 w-10 p-0 border-white/30 text-white" onClick={() => setVideoOn(!videoOn)}>
                          {videoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                        </Button>
                        <Button size="sm" variant="outline" className="rounded-full h-10 w-10 p-0 border-white/30 text-white" onClick={() => toast.info("Screen sharing started")}>
                          <Monitor className="h-4 w-4" />
                        </Button>
                        <Button size="sm" className="rounded-full h-10 w-10 p-0 bg-red-600 hover:bg-red-700" onClick={() => { setInCall(false); toast.success("Call ended. Post-consult summary ready."); }}>
                          <PhoneOff className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Side Panel - Notes / Prescription */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">During-Consult Notes</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div><Label className="text-xs">Chief Complaint</Label><Input className="h-7 text-xs" placeholder="Patient's complaint..." /></div>
                <div><Label className="text-xs">Examination Notes</Label><Textarea className="text-xs" rows={3} placeholder="Observed findings via video..." /></div>
                <div><Label className="text-xs">Diagnosis</Label><Input className="h-7 text-xs" placeholder="AYUSH + Modern" /></div>
                <div><Label className="text-xs">Quick Prescription</Label><Textarea className="text-xs" rows={3} placeholder="Medicine - Dose - Frequency - Duration" /></div>
                <div><Label className="text-xs">Advice</Label><Input className="h-7 text-xs" placeholder="Diet, lifestyle, follow-up..." /></div>
                <div className="flex gap-2 pt-2 border-t">
                  <Button size="sm" className="flex-1 text-xs" onClick={() => toast.success("Prescription generated")}><FileText className="mr-1 h-3 w-3" /> Generate Rx</Button>
                  <Button size="sm" variant="outline" className="text-xs" onClick={() => toast.success("Summary sent via WhatsApp")}><Send className="h-3 w-3" /></Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card><CardContent className="p-0"><div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50"><tr>
                <th className="px-3 py-2 text-left font-medium">Time</th>
                <th className="px-3 py-2 text-left font-medium">Patient</th>
                <th className="px-3 py-2 text-left font-medium">Type</th>
                <th className="px-3 py-2 text-left font-medium">Doctor</th>
                <th className="px-3 py-2 text-left font-medium">Payment</th>
                <th className="px-3 py-2 text-left font-medium">Status</th>
                <th className="px-3 py-2 text-left font-medium">Actions</th>
              </tr></thead>
              <tbody>
                {sessions.map((c) => (
                  <tr key={c.id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2 font-mono text-xs">{c.scheduledAt.split(" ")[1]}</td>
                    <td className="px-3 py-2"><p className="font-medium text-xs">{c.patient}</p><p className="text-[10px] text-muted-foreground">{c.phone}</p></td>
                    <td className="px-3 py-2"><Badge variant="outline" className="text-[10px]">{c.type}</Badge></td>
                    <td className="px-3 py-2 text-xs">{c.doctor}</td>
                    <td className="px-3 py-2 text-xs">{c.payment}</td>
                    <td className="px-3 py-2"><Badge variant={c.status === "completed" ? "outline" : c.status === "waiting" ? "default" : c.status === "no_show" ? "destructive" : "secondary"} className={`text-[10px] capitalize ${c.status === "completed" ? "text-green-600" : ""}`}>{c.status.replace("_", " ")}</Badge></td>
                    <td className="px-3 py-2">
                      {c.status === "waiting" && <Button size="sm" className="text-xs h-6" onClick={() => { setInCall(true); toast.success("Joining call..."); }}><Video className="mr-1 h-3 w-3" /> Join</Button>}
                      {c.status === "scheduled" && <Button size="sm" variant="outline" className="text-xs h-6"><MessageCircle className="mr-1 h-3 w-3" /> Remind</Button>}
                      {c.status === "completed" && <Button size="sm" variant="ghost" className="text-xs h-6">View Notes</Button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div></CardContent></Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-base">Completed Sessions</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sessions.filter(c => c.status === "completed").map(c => (
                  <div key={c.id} className="p-3 rounded-lg border">
                    <div className="flex items-center justify-between mb-1">
                      <div><p className="font-medium text-sm">{c.patient}</p><p className="text-xs text-muted-foreground">{c.doctor} · {c.scheduledAt} · {c.duration}</p></div>
                      <Badge variant="outline" className="text-xs text-green-600">Completed</Badge>
                    </div>
                    {c.notes && <p className="text-xs text-muted-foreground mt-1">{c.notes}</p>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Schedule Teleconsultation</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Patient Name *</Label><Input placeholder="Patient name" value={newPatient} onChange={(e) => setNewPatient(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Phone / WhatsApp *</Label><Input placeholder="+91-XXXXX" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} /></div>
              <div><Label>Doctor</Label><Select value={newDoctor} onValueChange={setNewDoctor}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="Dr. Arun Sharma">Dr. Arun Sharma</SelectItem><SelectItem value="Dr. Meena Patel">Dr. Meena Patel</SelectItem><SelectItem value="Dr. Priya Das">Dr. Priya Das</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date & Time</Label><Input type="datetime-local" value={newDateTime} onChange={(e) => setNewDateTime(e.target.value)} /></div>
              <div><Label>Consultation Fee (₹)</Label><Input type="number" value={newFee} onChange={(e) => setNewFee(e.target.value)} /></div>
            </div>
            <div><Label>Type</Label><Select value={newType} onValueChange={setNewType}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="New Consultation">New Consultation</SelectItem><SelectItem value="Follow-up">Follow-up</SelectItem><SelectItem value="Panchakarma Review">Panchakarma Review</SelectItem><SelectItem value="International">International</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleOpen(false)}>Cancel</Button>
            <Button onClick={handleSchedule}>Schedule & Send Link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HmsTeleconsult;
