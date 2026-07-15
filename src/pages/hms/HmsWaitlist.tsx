import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Clock, Users, Bell, CheckCircle, Plus, Phone, MessageCircle, ArrowUp } from "lucide-react";

type WaitlistEntry = {
  id: string; patient: string; phone: string; department: string;
  doctor: string; preferredDate: string; preferredTime: string;
  priority: "normal" | "urgent" | "vip"; reason: string;
  addedDate: string; status: "waiting" | "notified" | "booked" | "expired";
  position: number;
};

const mockWaitlist: WaitlistEntry[] = [
  { id: "1", patient: "Priya Menon", phone: "+91-9876500010", department: "Panchakarma", doctor: "Dr. Meena Patel", preferredDate: "2026-07-16", preferredTime: "Morning", priority: "normal", reason: "All Panchakarma slots full for this week", addedDate: "2026-07-14", status: "notified", position: 1 },
  { id: "2", patient: "Rahul Kumar", phone: "+91-9876500011", department: "Ayurveda", doctor: "Dr. Arun Sharma", preferredDate: "2026-07-16", preferredTime: "Any", priority: "urgent", reason: "Doctor on leave Jul 15. Rescheduled.", addedDate: "2026-07-13", status: "waiting", position: 2 },
  { id: "3", patient: "Ananya S.", phone: "+91-9876500012", department: "Panchakarma", doctor: "Dr. Meena Patel", preferredDate: "2026-07-17", preferredTime: "Afternoon", priority: "normal", reason: "Shirodhara room occupied", addedDate: "2026-07-15", status: "waiting", position: 3 },
  { id: "4", patient: "Mohammed F.", phone: "+91-9876500013", department: "Ayurveda", doctor: "Dr. Arun Sharma", preferredDate: "2026-07-18", preferredTime: "Morning", priority: "vip", reason: "Follow-up after Panchakarma, next available", addedDate: "2026-07-15", status: "waiting", position: 4 },
  { id: "5", patient: "Lakshmi Nair", phone: "+91-9876500014", department: "Homeopathy", doctor: "Dr. Priya Das", preferredDate: "2026-07-16", preferredTime: "Evening", priority: "normal", reason: "All evening slots booked", addedDate: "2026-07-12", status: "booked", position: 0 },
  { id: "6", patient: "David Thomas", phone: "+971-50-1234567", department: "Teleconsult", doctor: "Dr. Arun Sharma", preferredDate: "2026-07-20", preferredTime: "IST 8 PM", priority: "normal", reason: "International time zone - limited slots", addedDate: "2026-07-14", status: "waiting", position: 5 },
];

const HmsWaitlist = () => {
  const [waitlist] = useState<WaitlistEntry[]>(mockWaitlist);
  const [addOpen, setAddOpen] = useState(false);

  const active = waitlist.filter(w => w.status === "waiting" || w.status === "notified").length;
  const notified = waitlist.filter(w => w.status === "notified").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Clock className="h-6 w-6 text-amber-600" /> Waitlist Management
          </h1>
          <p className="text-sm text-muted-foreground">Auto-notify on cancellation · Priority queue · WhatsApp alerts · Smart slot matching</p>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="mr-1 h-4 w-4" /> Add to Waitlist</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><Users className="h-5 w-5 mx-auto text-amber-600" /><p className="text-xl font-bold mt-1">{active}</p><p className="text-xs text-muted-foreground">Active Waitlist</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Bell className="h-5 w-5 mx-auto text-blue-600" /><p className="text-xl font-bold mt-1">{notified}</p><p className="text-xs text-muted-foreground">Notified (Slot Open)</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><CheckCircle className="h-5 w-5 mx-auto text-green-600" /><p className="text-xl font-bold mt-1">{waitlist.filter(w => w.status === "booked").length}</p><p className="text-xs text-muted-foreground">Converted to Booking</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold mt-1">2.1 hrs</p><p className="text-xs text-muted-foreground">Avg Wait Time</p></CardContent></Card>
      </div>

      {/* Waitlist Table */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Active Waitlist Queue</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50"><tr>
                <th className="px-3 py-2 text-left font-medium">#</th>
                <th className="px-3 py-2 text-left font-medium">Patient</th>
                <th className="px-3 py-2 text-left font-medium">Department</th>
                <th className="px-3 py-2 text-left font-medium">Doctor</th>
                <th className="px-3 py-2 text-left font-medium">Preferred</th>
                <th className="px-3 py-2 text-left font-medium">Priority</th>
                <th className="px-3 py-2 text-left font-medium">Reason</th>
                <th className="px-3 py-2 text-left font-medium">Status</th>
                <th className="px-3 py-2 text-left font-medium">Actions</th>
              </tr></thead>
              <tbody>
                {waitlist.filter(w => w.status !== "expired").sort((a, b) => a.position - b.position).map((w) => (
                  <tr key={w.id} className={`border-b hover:bg-muted/30 ${w.status === "notified" ? "bg-blue-50/30" : ""}`}>
                    <td className="px-3 py-2 font-bold">{w.position || "—"}</td>
                    <td className="px-3 py-2"><p className="font-medium">{w.patient}</p><p className="text-[10px] text-muted-foreground">{w.phone}</p></td>
                    <td className="px-3 py-2 text-xs">{w.department}</td>
                    <td className="px-3 py-2 text-xs">{w.doctor}</td>
                    <td className="px-3 py-2 text-xs">{w.preferredDate}<br/>{w.preferredTime}</td>
                    <td className="px-3 py-2"><Badge variant={w.priority === "urgent" ? "destructive" : w.priority === "vip" ? "default" : "secondary"} className="text-[10px] capitalize">{w.priority}</Badge></td>
                    <td className="px-3 py-2 text-xs text-muted-foreground max-w-[150px] truncate">{w.reason}</td>
                    <td className="px-3 py-2"><Badge variant={w.status === "notified" ? "default" : w.status === "booked" ? "outline" : "secondary"} className={`text-[10px] capitalize ${w.status === "booked" ? "text-green-600" : ""}`}>{w.status}</Badge></td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        {w.status === "waiting" && <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => toast.success("WhatsApp sent: slot available")}><MessageCircle className="h-3 w-3 text-green-600" /></Button>}
                        {w.status === "notified" && <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => toast.success("Converted to booking!")}>Book Now</Button>}
                        {w.status === "waiting" && <Button size="sm" variant="ghost" className="h-6 w-6 p-0"><ArrowUp className="h-3 w-3" /></Button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Auto-notification info */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardContent className="p-3 flex items-start gap-2">
          <Bell className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
          <div className="text-xs text-blue-700">
            <p className="font-medium">Smart Auto-Notification</p>
            <p className="text-blue-600 mt-0.5">When a patient cancels or a slot opens, the next person on the waitlist is automatically notified via WhatsApp within 60 seconds. They have 2 hours to confirm, after which the next person is notified.</p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add to Waitlist</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Patient Name *</Label><Input placeholder="Search patient" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Department</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="ayurveda">Ayurveda</SelectItem><SelectItem value="panchakarma">Panchakarma</SelectItem><SelectItem value="homeopathy">Homeopathy</SelectItem><SelectItem value="teleconsult">Teleconsult</SelectItem></SelectContent></Select></div>
              <div><Label>Doctor</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="d1">Dr. Arun Sharma</SelectItem><SelectItem value="d2">Dr. Meena Patel</SelectItem><SelectItem value="d3">Dr. Priya Das</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Preferred Date</Label><Input type="date" /></div>
              <div><Label>Preferred Time</Label><Select><SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger><SelectContent><SelectItem value="any">Any time</SelectItem><SelectItem value="morning">Morning</SelectItem><SelectItem value="afternoon">Afternoon</SelectItem><SelectItem value="evening">Evening</SelectItem></SelectContent></Select></div>
            </div>
            <div><Label>Priority</Label><Select><SelectTrigger><SelectValue placeholder="Normal" /></SelectTrigger><SelectContent><SelectItem value="normal">Normal</SelectItem><SelectItem value="urgent">Urgent</SelectItem><SelectItem value="vip">VIP</SelectItem></SelectContent></Select></div>
            <div><Label>Reason for Waitlist</Label><Input placeholder="e.g., All slots full, doctor on leave..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Added to waitlist. Will be notified when slot opens."); setAddOpen(false); }}>Add to Waitlist</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HmsWaitlist;
