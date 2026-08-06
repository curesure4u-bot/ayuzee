import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  CalendarDays, ChevronLeft, ChevronRight, GripVertical,
  Clock, User, RefreshCw, Plus, Eye
} from "lucide-react";

type Appointment = {
  id: string;
  patient_name: string;
  doctor: string;
  time_slot: string;
  duration: number; // minutes
  type: "consultation" | "follow_up" | "panchakarma" | "teleconsult";
  status: "confirmed" | "checked_in" | "in_progress" | "completed" | "no_show";
};

type TimeSlot = {
  time: string;
  hour: number;
  appointments: Appointment[];
};

const typeColors: Record<string, string> = {
  consultation: "bg-blue-100 border-blue-300 text-blue-800",
  follow_up: "bg-green-100 border-green-300 text-green-800",
  panchakarma: "bg-purple-100 border-purple-300 text-purple-800",
  teleconsult: "bg-orange-100 border-orange-300 text-orange-800",
};

const doctors = ["Dr. Saleem", "Dr. Meena Patel", "Dr. Anitha", "Dr. Ravi Kumar"];

const generateMockAppointments = (): Appointment[] => [
  { id: "a1", patient_name: "Rajesh Kumar", doctor: "Dr. Saleem", time_slot: "09:00", duration: 30, type: "consultation", status: "confirmed" },
  { id: "a2", patient_name: "Priya Sharma", doctor: "Dr. Saleem", time_slot: "09:30", duration: 30, type: "follow_up", status: "checked_in" },
  { id: "a3", patient_name: "Amit Patel", doctor: "Dr. Saleem", time_slot: "10:00", duration: 60, type: "panchakarma", status: "confirmed" },
  { id: "a4", patient_name: "Sunita Devi", doctor: "Dr. Meena Patel", time_slot: "09:00", duration: 30, type: "consultation", status: "confirmed" },
  { id: "a5", patient_name: "Vikram Singh", doctor: "Dr. Meena Patel", time_slot: "10:00", duration: 30, type: "teleconsult", status: "confirmed" },
  { id: "a6", patient_name: "Meera Devi", doctor: "Dr. Saleem", time_slot: "11:00", duration: 30, type: "follow_up", status: "confirmed" },
  { id: "a7", patient_name: "Lakshmi N.", doctor: "Dr. Anitha", time_slot: "09:30", duration: 30, type: "consultation", status: "in_progress" },
  { id: "a8", patient_name: "Arun K.", doctor: "Dr. Saleem", time_slot: "11:30", duration: 30, type: "consultation", status: "confirmed" },
  { id: "a9", patient_name: "Deepa M.", doctor: "Dr. Ravi Kumar", time_slot: "10:00", duration: 60, type: "panchakarma", status: "confirmed" },
  { id: "a10", patient_name: "Suresh P.", doctor: "Dr. Anitha", time_slot: "11:00", duration: 30, type: "teleconsult", status: "confirmed" },
];

const timeSlots = Array.from({ length: 10 }, (_, i) => {
  const hour = 9 + i;
  const h = hour > 12 ? hour - 12 : hour;
  const ampm = hour >= 12 ? "PM" : "AM";
  return { time: `${String(hour).padStart(2, "0")}:00`, label: `${h}:00 ${ampm}`, hour };
});

const halfSlots = Array.from({ length: 20 }, (_, i) => {
  const hour = 9 + Math.floor(i / 2);
  const min = i % 2 === 0 ? "00" : "30";
  return `${String(hour).padStart(2, "0")}:${min}`;
});

const HmsAppointmentCalendar = () => {
  const [appointments, setAppointments] = useState<Appointment[]>(generateMockAppointments());
  const [selectedDoctor, setSelectedDoctor] = useState("all");
  const [view, setView] = useState<"doctor" | "hospital">("hospital");
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<{ doctor: string; time: string } | null>(null);

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const filteredDoctors = selectedDoctor === "all" ? doctors : [selectedDoctor];

  const getAppointmentsForSlot = (doctor: string, time: string) => {
    return appointments.filter(a => a.doctor === doctor && a.time_slot === time);
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, appointmentId: string) => {
    setDraggedId(appointmentId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", appointmentId);
  };

  const handleDragOver = (e: React.DragEvent, doctor: string, time: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverSlot({ doctor, time });
  };

  const handleDragLeave = () => {
    setDragOverSlot(null);
  };

  const handleDrop = (e: React.DragEvent, targetDoctor: string, targetTime: string) => {
    e.preventDefault();
    setDragOverSlot(null);
    const appointmentId = e.dataTransfer.getData("text/plain") || draggedId;
    if (!appointmentId) return;

    const apt = appointments.find(a => a.id === appointmentId);
    if (!apt) return;

    if (apt.doctor === targetDoctor && apt.time_slot === targetTime) {
      setDraggedId(null);
      return;
    }

    // Check for conflicts
    const existing = getAppointmentsForSlot(targetDoctor, targetTime);
    if (existing.length >= 2) {
      toast.error(`Slot ${targetTime} for ${targetDoctor} is full. Cannot reschedule here.`);
      setDraggedId(null);
      return;
    }

    // Reschedule
    setAppointments(prev => prev.map(a =>
      a.id === appointmentId
        ? { ...a, doctor: targetDoctor, time_slot: targetTime }
        : a
    ));

    const oldTime = apt.time_slot;
    const oldDoc = apt.doctor;
    toast.success(
      `Rescheduled: ${apt.patient_name} moved from ${oldTime} (${oldDoc}) → ${targetTime} (${targetDoctor})`,
      { description: "Patient will be notified via WhatsApp automatically." }
    );
    setDraggedId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverSlot(null);
  };

  const totalAppointments = appointments.length;
  const confirmedCount = appointments.filter(a => a.status === "confirmed").length;
  const checkedInCount = appointments.filter(a => a.status === "checked_in" || a.status === "in_progress").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-primary" /> Appointment Calendar
          </h1>
          <p className="text-sm text-muted-foreground">
            {dateStr} · Drag & drop to reschedule appointments between slots
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline"><ChevronLeft className="h-4 w-4" /></Button>
          <Button size="sm" variant="outline">Today</Button>
          <Button size="sm" variant="outline"><ChevronRight className="h-4 w-4" /></Button>
          <Button size="sm" variant="outline" onClick={() => window.location.href = "/hms/appointments"}>List View</Button>
          <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New</Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1">
          <Button size="sm" variant={view === "hospital" ? "default" : "outline"} onClick={() => setView("hospital")}>
            <Eye className="mr-1 h-3 w-3" /> Hospital View
          </Button>
          <Button size="sm" variant={view === "doctor" ? "default" : "outline"} onClick={() => setView("doctor")}>
            <User className="mr-1 h-3 w-3" /> Doctor View
          </Button>
        </div>
        <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
          <SelectTrigger className="w-48"><SelectValue placeholder="All Doctors" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Doctors</SelectItem>
            {doctors.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex gap-2 ml-auto text-xs">
          <Badge className={typeColors.consultation}>Consultation</Badge>
          <Badge className={typeColors.follow_up}>Follow-up</Badge>
          <Badge className={typeColors.panchakarma}>Panchakarma</Badge>
          <Badge className={typeColors.teleconsult}>Teleconsult</Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{totalAppointments}</p><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold text-blue-600">{confirmedCount}</p><p className="text-xs text-muted-foreground">Confirmed</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold text-green-600">{checkedInCount}</p><p className="text-xs text-muted-foreground">Checked In</p></CardContent></Card>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Header Row - Doctor Names */}
            <div className="grid border-b bg-muted/30 sticky top-0" style={{ gridTemplateColumns: `80px repeat(${filteredDoctors.length}, 1fr)` }}>
              <div className="p-2 text-xs font-semibold text-muted-foreground border-r flex items-center">
                <Clock className="h-3 w-3 mr-1" /> Time
              </div>
              {filteredDoctors.map(doctor => (
                <div key={doctor} className="p-2 text-xs font-semibold text-center border-r last:border-r-0">
                  {doctor}
                </div>
              ))}
            </div>

            {/* Time Slots */}
            {halfSlots.map((time) => (
              <div key={time} className="grid border-b last:border-b-0" style={{ gridTemplateColumns: `80px repeat(${filteredDoctors.length}, 1fr)` }}>
                {/* Time label */}
                <div className="p-1.5 text-xs text-muted-foreground border-r bg-muted/10 flex items-center justify-center font-mono">
                  {time}
                </div>

                {/* Doctor columns */}
                {filteredDoctors.map(doctor => {
                  const slotAppts = getAppointmentsForSlot(doctor, time);
                  const isDropTarget = dragOverSlot?.doctor === doctor && dragOverSlot?.time === time;

                  return (
                    <div
                      key={`${doctor}-${time}`}
                      className={`p-1 border-r last:border-r-0 min-h-[44px] transition-colors ${
                        isDropTarget ? "bg-primary/10 ring-1 ring-primary ring-inset" : "hover:bg-muted/20"
                      }`}
                      onDragOver={(e) => handleDragOver(e, doctor, time)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, doctor, time)}
                    >
                      {slotAppts.map(apt => (
                        <div
                          key={apt.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, apt.id)}
                          onDragEnd={handleDragEnd}
                          className={`rounded px-2 py-1 mb-0.5 border text-xs cursor-grab active:cursor-grabbing flex items-center gap-1 ${typeColors[apt.type]} ${
                            draggedId === apt.id ? "opacity-50 scale-95" : ""
                          }`}
                        >
                          <GripVertical className="h-3 w-3 opacity-40 shrink-0" />
                          <span className="truncate font-medium">{apt.patient_name}</span>
                          <span className="text-[10px] opacity-70 ml-auto shrink-0">{apt.duration}m</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <p className="text-xs text-muted-foreground text-center">
        Drag an appointment card to a different time slot or doctor column to reschedule. Patient is auto-notified via WhatsApp.
      </p>
    </div>
  );
};

export default HmsAppointmentCalendar;
