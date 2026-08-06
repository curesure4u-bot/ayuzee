import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Calendar, Clock, User, Plus, Search, CheckCircle2,
  XCircle, Phone, MapPin, Edit2, Trash2, Bell,
  Users, Home, Building2, Filter,
} from "lucide-react";

interface TimeSlot {
  id: string;
  time: string;
  capacity: number;
  booked: number;
  available: number;
}

interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  phone: string;
  date: string;
  time: string;
  testNames: string;
  type: "Walk-in" | "Online" | "Phone" | "Home Collection";
  location: string;
  status: "Confirmed" | "Checked In" | "Completed" | "Cancelled" | "No Show";
  bookedBy: string;
  notes?: string;
  reminderSent: boolean;
}

interface SlotConfig {
  day: string;
  startTime: string;
  endTime: string;
  slotDuration: number;
  maxPerSlot: number;
  homeCollectionSlots: number;
  isHoliday: boolean;
}

const mockSlots: TimeSlot[] = [
  { id: "s1", time: "07:00 AM", capacity: 8, booked: 6, available: 2 },
  { id: "s2", time: "07:30 AM", capacity: 8, booked: 8, available: 0 },
  { id: "s3", time: "08:00 AM", capacity: 8, booked: 7, available: 1 },
  { id: "s4", time: "08:30 AM", capacity: 8, booked: 5, available: 3 },
  { id: "s5", time: "09:00 AM", capacity: 8, booked: 4, available: 4 },
  { id: "s6", time: "09:30 AM", capacity: 8, booked: 3, available: 5 },
  { id: "s7", time: "10:00 AM", capacity: 6, booked: 2, available: 4 },
  { id: "s8", time: "10:30 AM", capacity: 6, booked: 1, available: 5 },
  { id: "s9", time: "11:00 AM", capacity: 6, booked: 0, available: 6 },
  { id: "s10", time: "11:30 AM", capacity: 4, booked: 0, available: 4 },
  { id: "s11", time: "04:00 PM", capacity: 6, booked: 2, available: 4 },
  { id: "s12", time: "04:30 PM", capacity: 6, booked: 1, available: 5 },
  { id: "s13", time: "05:00 PM", capacity: 4, booked: 0, available: 4 },
];

const mockAppointments: Appointment[] = [
  { id: "a1", patientName: "Mr. Rajesh Kumar", patientId: "AL-12543", phone: "+91 98765 43210", date: "2026-07-24", time: "07:00 AM", testNames: "RFT + Electrolytes", type: "Phone", location: "Kadayanallur", status: "Completed", bookedBy: "Reception", reminderSent: true },
  { id: "a2", patientName: "Mrs. Lakshmi Devi", patientId: "AL-14201", phone: "+91 87654 32109", date: "2026-07-24", time: "07:30 AM", testNames: "CBC + Iron Studies", type: "Walk-in", location: "Kadayanallur", status: "Completed", bookedBy: "Self", reminderSent: true },
  { id: "a3", patientName: "Mr. Suresh Babu", patientId: "AL-15320", phone: "+91 76543 21098", date: "2026-07-24", time: "08:00 AM", testNames: "Full Body Checkup", type: "Online", location: "Kadayanallur", status: "Checked In", bookedBy: "Patient App", reminderSent: true },
  { id: "a4", patientName: "Mrs. Priya Sharma", patientId: "AL-13105", phone: "+91 65432 10987", date: "2026-07-24", time: "07:00 AM", testNames: "Thyroid Profile", type: "Phone", location: "Kadayanallur", status: "Completed", bookedBy: "Reception", reminderSent: true },
  { id: "a5", patientName: "Mr. Venkat Rao", patientId: "AL-16025", phone: "+91 54321 09876", date: "2026-07-24", time: "09:00 AM", testNames: "Culture & Sensitivity", type: "Walk-in", location: "Kadayanallur", status: "Confirmed", bookedBy: "Dr. Referral", reminderSent: true },
  { id: "a6", patientName: "Ms. Kavitha R", patientId: "AL-16001", phone: "+91 43210 98765", date: "2026-07-24", time: "09:30 AM", testNames: "Urine Routine + Culture", type: "Online", location: "Kadayanallur", status: "Confirmed", bookedBy: "Patient App", reminderSent: false },
  { id: "a7", patientName: "Mr. Gopal K", patientId: "AL-18045", phone: "+91 94567 12345", date: "2026-07-24", time: "08:30 AM", testNames: "HbA1c + Lipid", type: "Home Collection", location: "Home - Rajapalayam", status: "Confirmed", bookedBy: "WhatsApp", reminderSent: true, notes: "Address: 45 North Street, Rajapalayam" },
  { id: "a8", patientName: "Mrs. Meena K", patientId: "AL-19201", phone: "+91 87654 98765", date: "2026-07-24", time: "08:00 AM", testNames: "Thyroid + HbA1c", type: "Phone", location: "Kadayanallur", status: "No Show", bookedBy: "Reception", reminderSent: true },
  { id: "a9", patientName: "Mr. Arjun P", patientId: "NEW", phone: "+91 99887 76655", date: "2026-07-25", time: "07:30 AM", testNames: "Full Body Checkup", type: "Online", location: "Kadayanallur", status: "Confirmed", bookedBy: "Website", reminderSent: false },
];

const AppointmentBooking = () => {
  const [slots] = useState<TimeSlot[]>(mockSlots);
  const [appointments] = useState<Appointment[]>(mockAppointments);
  const [activeTab, setActiveTab] = useState("today");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedDate, setSelectedDate] = useState("2026-07-24");

  const todayAppts = appointments.filter(a => a.date === selectedDate);
  const confirmedCount = todayAppts.filter(a => a.status === "Confirmed").length;
  const completedCount = todayAppts.filter(a => a.status === "Completed").length;
  const noShowCount = todayAppts.filter(a => a.status === "No Show").length;
  const homeCollCount = todayAppts.filter(a => a.type === "Home Collection").length;

  const filteredAppts = todayAppts.filter((a) => {
    const matchSearch = a.patientName.toLowerCase().includes(search.toLowerCase()) || a.phone.includes(search);
    const matchStatus = statusFilter === "ALL" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getStatusColor = (s: string) => {
    switch (s) { case "Confirmed": return "bg-blue-100 text-blue-700"; case "Checked In": return "bg-amber-100 text-amber-700"; case "Completed": return "bg-green-100 text-green-700"; case "Cancelled": return "bg-gray-100 text-gray-500"; case "No Show": return "bg-red-100 text-red-700"; default: return "bg-gray-100 text-gray-700"; }
  };

  const getTypeIcon = (type: string) => {
    switch (type) { case "Walk-in": return <User className="h-3 w-3 text-blue-600" />; case "Online": return <Building2 className="h-3 w-3 text-purple-600" />; case "Phone": return <Phone className="h-3 w-3 text-green-600" />; case "Home Collection": return <Home className="h-3 w-3 text-orange-600" />; default: return <User className="h-3 w-3" />; }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2">
          <Calendar className="h-5 w-5" /> Appointment / Slot Booking
        </h2>
        <Button size="sm" className="bg-green-600 hover:bg-green-700"><Plus className="mr-1 h-3 w-3" /> New Booking</Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="border-blue-200"><CardContent className="p-3 text-center"><Users className="h-4 w-4 mx-auto text-blue-600" /><p className="text-xl font-bold text-blue-600 mt-1">{todayAppts.length}</p><p className="text-[10px] text-muted-foreground">Total Today</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><CheckCircle2 className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold text-green-600 mt-1">{completedCount}</p><p className="text-[10px] text-muted-foreground">Completed</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><Clock className="h-4 w-4 mx-auto text-amber-600" /><p className="text-xl font-bold text-amber-600 mt-1">{confirmedCount}</p><p className="text-[10px] text-muted-foreground">Upcoming</p></CardContent></Card>
        <Card className="border-red-200"><CardContent className="p-3 text-center"><XCircle className="h-4 w-4 mx-auto text-red-600" /><p className="text-xl font-bold text-red-600 mt-1">{noShowCount}</p><p className="text-[10px] text-muted-foreground">No Show</p></CardContent></Card>
        <Card className="border-orange-200"><CardContent className="p-3 text-center"><Home className="h-4 w-4 mx-auto text-orange-600" /><p className="text-xl font-bold text-orange-600 mt-1">{homeCollCount}</p><p className="text-[10px] text-muted-foreground">Home Collection</p></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="today">Today's Schedule</TabsTrigger>
          <TabsTrigger value="slots">Slot Availability</TabsTrigger>
          <TabsTrigger value="settings">Slot Settings</TabsTrigger>
        </TabsList>

        {/* Today's Schedule */}
        <TabsContent value="today" className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Input type="date" className="h-8 text-xs w-[140px]" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            <div className="relative flex-1 max-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input className="pl-8 h-8 text-xs" placeholder="Search patient, phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
                <SelectItem value="Checked In">Checked In</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="No Show">No Show</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Card><CardContent className="p-0">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-3 py-2 text-left">Time</th>
                  <th className="px-3 py-2 text-left">Patient</th>
                  <th className="px-3 py-2 text-left">Tests</th>
                  <th className="px-3 py-2 text-center">Type</th>
                  <th className="px-3 py-2 text-left">Location</th>
                  <th className="px-3 py-2 text-center">Status</th>
                  <th className="px-3 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppts.sort((a, b) => a.time.localeCompare(b.time)).map((appt) => (
                  <tr key={appt.id} className={`border-b ${appt.status === "No Show" ? "bg-red-50 opacity-70" : ""}`}>
                    <td className="px-3 py-2 font-medium">{appt.time}</td>
                    <td className="px-3 py-2">
                      <p className="font-medium">{appt.patientName}</p>
                      <p className="text-[10px] text-muted-foreground">{appt.patientId} | {appt.phone}</p>
                    </td>
                    <td className="px-3 py-2">{appt.testNames}</td>
                    <td className="px-3 py-2 text-center"><div className="flex items-center justify-center gap-1">{getTypeIcon(appt.type)}<span className="text-[10px]">{appt.type}</span></div></td>
                    <td className="px-3 py-2 text-muted-foreground">{appt.location}</td>
                    <td className="px-3 py-2 text-center"><Badge className={`text-[9px] ${getStatusColor(appt.status)}`}>{appt.status}</Badge></td>
                    <td className="px-3 py-2 text-center">
                      <div className="flex gap-1 justify-center">
                        {appt.status === "Confirmed" && <Button size="sm" className="h-5 text-[9px] bg-amber-500 hover:bg-amber-600" onClick={() => toast.success("Checked in")}>Check In</Button>}
                        {appt.status === "Checked In" && <Button size="sm" className="h-5 text-[9px] bg-green-600" onClick={() => toast.success("Marked complete")}>Complete</Button>}
                        {!appt.reminderSent && <Button size="sm" variant="outline" className="h-5 text-[9px]" onClick={() => toast.info("Reminder sent")}><Bell className="h-3 w-3" /></Button>}
                        <Button size="sm" variant="outline" className="h-5 text-[9px] text-red-600" onClick={() => toast.warning("Cancelled")}><XCircle className="h-3 w-3" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>

        {/* Slot Availability */}
        <TabsContent value="slots" className="space-y-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Slot Availability — {selectedDate}</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-2">
                {slots.map((slot) => (
                  <div key={slot.id} className={`border rounded p-2 text-center cursor-pointer transition ${slot.available === 0 ? "bg-red-50 border-red-200 opacity-60" : slot.available <= 2 ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200 hover:border-green-400"}`} onClick={() => slot.available > 0 ? toast.info(`Book slot at ${slot.time}`) : toast.error("Slot full")}>
                    <p className="text-xs font-medium">{slot.time}</p>
                    <p className={`text-lg font-bold ${slot.available === 0 ? "text-red-600" : slot.available <= 2 ? "text-amber-600" : "text-green-600"}`}>{slot.available}</p>
                    <p className="text-[9px] text-muted-foreground">{slot.booked}/{slot.capacity} booked</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-3 text-[10px]">
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-200 border border-green-300" /> Available</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-amber-200 border border-amber-300" /> Almost Full</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-200 border border-red-300" /> Full</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Slot Settings */}
        <TabsContent value="settings" className="space-y-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Slot Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2"><label className="text-xs font-medium">Morning Start Time</label><Input className="h-8 text-xs" type="time" defaultValue="07:00" /></div>
                <div className="space-y-2"><label className="text-xs font-medium">Morning End Time</label><Input className="h-8 text-xs" type="time" defaultValue="12:00" /></div>
                <div className="space-y-2"><label className="text-xs font-medium">Evening Start Time</label><Input className="h-8 text-xs" type="time" defaultValue="16:00" /></div>
                <div className="space-y-2"><label className="text-xs font-medium">Evening End Time</label><Input className="h-8 text-xs" type="time" defaultValue="18:00" /></div>
                <div className="space-y-2"><label className="text-xs font-medium">Slot Duration (minutes)</label><Select defaultValue="30"><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="15">15 min</SelectItem><SelectItem value="30">30 min</SelectItem><SelectItem value="45">45 min</SelectItem><SelectItem value="60">60 min</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><label className="text-xs font-medium">Max Patients per Slot</label><Input className="h-8 text-xs" type="number" defaultValue="8" /></div>
                <div className="space-y-2"><label className="text-xs font-medium">Home Collection Slots/Day</label><Input className="h-8 text-xs" type="number" defaultValue="10" /></div>
                <div className="space-y-2"><label className="text-xs font-medium">Booking Lead Time (hours)</label><Input className="h-8 text-xs" type="number" defaultValue="2" /></div>
              </div>
              <div className="pt-3 border-t">
                <p className="text-xs font-medium mb-2">Booking Channels</p>
                <div className="grid sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-600" /> Walk-in (Reception)</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-600" /> Phone booking</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-600" /> WhatsApp booking</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-600" /> Online (Website/App)</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-600" /> Doctor referral auto-book</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-600" /> B2B client portal</div>
                </div>
              </div>
              <Button size="sm" className="bg-orange-600 hover:bg-orange-700" onClick={() => toast.success("Slot settings saved")}>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AppointmentBooking;
