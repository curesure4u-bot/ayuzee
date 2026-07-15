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
  Plus, IndianRupee, CheckCircle, Send,
} from "lucide-react";

type Consult = {
  id: string; patient: string; phone: string; doctor: string;
  scheduledAt: string; duration: string; type: string;
  status: "waiting" | "active" | "completed" | "no_show" | "scheduled";
  payment: string; notes: string;
};

const mockConsults: Consult[] = [
  { id: "1", patient: "Priya Menon (Dubai)", phone: "+971-50-1234567", doctor: "Dr. Arun Sharma", scheduledAt: "2026-07-15 11:00", duration: "—", type: "International Follow-up", status: "waiting", payment: "₹800 (Paid)", notes: "" },
  { id: "2", patient: "Rahul Kumar (Bangalore)", phone: "+91-9876500020", doctor: "Dr. Arun Sharma", scheduledAt: "2026-07-15 11:30", duration: "—", type: "New Consultation", status: "scheduled", payment: "₹500 (Paid)", notes: "" },
  { id: "3", patient: "Ananya S. (Chennai)", phone: "+91-9876500021", doctor: "Dr. Meena Patel", scheduledAt: "2026-07-15 12:00", duration: "—", type: "Panchakarma Review", status: "scheduled", payment: "₹400 (Paid)", notes: "" },
  { id: "4", patient: "Mohammed F. (Muscat)", phone: "+968-9876-5432", doctor: "Dr. Arun Sharma", scheduledAt: "2026-07-15 09:30", duration: "18 min", type: "Follow-up", status: "completed", payment: "₹800 (Paid)", notes: "Medicines continued. Advised local Panchakarma center." },
  { id: "5", patient: "Lakshmi Nair (Mumbai)", phone: "+91-9876500022", doctor: "Dr. Priya Das", scheduledAt: "2026-07-15 10:00", duration: "22 min", type: "New Consultation", status: "completed", payment: "₹500 (Paid)", notes: "Homeopathy case taken. Arsenicum Album 30C prescribed." },
  { id: "6", patient: "David Thomas (USA)", phone: "+1-408-555-1234", doctor: "Dr. Arun Sharma", scheduledAt: "2026-07-15 08:00", duration: "—", type: "International New", status: "no_show", payment: "₹1200 (Paid)", notes: "Patient did not join. WhatsApp sent." },
];

const HmsTeleconsult = () => {
  const [consults] = useState<Consult[]>(mockConsults);
  const [inCall, setInCall] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const waiting = consults.filter(c => c.status === "waiting").length;
  const completed = consults.filter(c => c.status === "completed").length;
  const totalRevenue = consults.filter(c => c.status !== "no_show").length * 600;

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
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card><CardContent className="p-3 text-center"><Calendar className="h-5 w-5 mx-auto text-blue-600" /><p className="text-xl font-bold mt-1">{consults.length}</p><p className="text-xs text-muted-foreground">Today's Sessions</p></CardContent></Card>
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
                {consults.map((c) => (
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
                {consults.filter(c => c.status === "completed").map(c => (
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
            <div><Label>Patient Name *</Label><Input placeholder="Patient name" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Phone / WhatsApp *</Label><Input placeholder="+91-XXXXX" /></div>
              <div><Label>Doctor</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="d1">Dr. Arun Sharma</SelectItem><SelectItem value="d2">Dr. Meena Patel</SelectItem><SelectItem value="d3">Dr. Priya Das</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date & Time</Label><Input type="datetime-local" /></div>
              <div><Label>Consultation Fee (₹)</Label><Input type="number" defaultValue="500" /></div>
            </div>
            <div><Label>Type</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="new">New Consultation</SelectItem><SelectItem value="followup">Follow-up</SelectItem><SelectItem value="pk_review">Panchakarma Review</SelectItem><SelectItem value="intl">International</SelectItem></SelectContent></Select></div>
            <div><Label>Notes</Label><Input placeholder="Brief reason for teleconsult" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Teleconsult scheduled. Payment link sent via WhatsApp."); setScheduleOpen(false); }}>Schedule & Send Link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HmsTeleconsult;
