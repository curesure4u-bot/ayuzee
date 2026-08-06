import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { CalendarClock, Plus, Settings, Users, Clock, Trash2 } from "lucide-react";

const mockDoctors = [
  { id: "D1", name: "Dr. Mohamad Saleem", dept: "Ayurveda", slots: [
    { id: "S1", day: "Mon-Sat", from: "09:00", to: "13:00", duration: 15, maxPatients: 16, type: "OP", online: true },
    { id: "S2", day: "Mon-Sat", from: "17:00", to: "20:00", duration: 20, maxPatients: 9, type: "OP", online: true },
    { id: "S3", day: "Sun", from: "10:00", to: "12:00", duration: 15, maxPatients: 8, type: "Emergency", online: false },
  ]},
  { id: "D2", name: "Dr. Sahana Fathima", dept: "Siddha", slots: [
    { id: "S4", day: "Mon-Fri", from: "09:30", to: "13:30", duration: 20, maxPatients: 12, type: "OP", online: true },
    { id: "S5", day: "Mon-Fri", from: "16:00", to: "19:00", duration: 20, maxPatients: 9, type: "OP", online: false },
  ]},
  { id: "D3", name: "Dr. Arun Kumar", dept: "Panchakarma", slots: [
    { id: "S6", day: "Mon-Sat", from: "08:00", to: "12:00", duration: 30, maxPatients: 8, type: "Procedure", online: false },
    { id: "S7", day: "Mon-Sat", from: "14:00", to: "17:00", duration: 45, maxPatients: 4, type: "Panchakarma", online: false },
  ]},
];

const HmsAppointmentSlotConfig = () => {
  const [selectedDoctor, setSelectedDoctor] = useState("D1");
  const doctor = mockDoctors.find(d => d.id === selectedDoctor)!;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Appointment Slot Configuration</h1><p className="text-sm text-muted-foreground">Define doctor-wise time slots, duration, max patients, online booking availability</p></div>
        <Button onClick={() => toast.success("New slot added")}><Plus className="mr-2 h-4 w-4" />Add Slot</Button>
      </div>

      <div className="flex gap-3 items-center">
        <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
          <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
          <SelectContent>{mockDoctors.map(d => <SelectItem key={d.id} value={d.id}>{d.name} ({d.dept})</SelectItem>)}</SelectContent>
        </Select>
        <Badge variant="outline">{doctor.slots.length} slots configured</Badge>
      </div>

      <div className="grid gap-3">
        {doctor.slots.map(slot => (
          <Card key={slot.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10"><Clock className="h-5 w-5 text-primary" /></div>
                  <div>
                    <p className="font-semibold">{slot.day} | {slot.from} — {slot.to}</p>
                    <p className="text-sm text-muted-foreground">{slot.duration} min/patient | Max {slot.maxPatients} patients | Type: {slot.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">Online Booking</span><Switch checked={slot.online} /></div>
                  <Badge className={slot.type === "OP" ? "bg-green-100 text-green-800" : slot.type === "Panchakarma" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}>{slot.type}</Badge>
                  <Button variant="ghost" size="sm" onClick={() => toast.info("Edit slot")}><Settings className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card><CardHeader><CardTitle>Slot Rules</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
        <div className="flex justify-between p-2 bg-muted/50 rounded"><span>Buffer time between patients</span><span className="font-medium">5 min</span></div>
        <div className="flex justify-between p-2 bg-muted/50 rounded"><span>Overbooking allowed</span><span className="font-medium">+2 patients max</span></div>
        <div className="flex justify-between p-2 bg-muted/50 rounded"><span>Online booking cut-off</span><span className="font-medium">2 hours before slot</span></div>
        <div className="flex justify-between p-2 bg-muted/50 rounded"><span>Auto-confirm WhatsApp</span><span className="font-medium">Enabled (24hr before)</span></div>
        <div className="flex justify-between p-2 bg-muted/50 rounded"><span>No-show penalty</span><span className="font-medium">Block after 3 no-shows</span></div>
      </CardContent></Card>
    </div>
  );
};
export default HmsAppointmentSlotConfig;
