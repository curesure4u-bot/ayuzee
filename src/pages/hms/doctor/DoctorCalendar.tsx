import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Calendar, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

type DayStatus = "working" | "leave" | "half-day" | "blocked" | "none";

const statusColors: Record<DayStatus, string> = {
  working: "bg-green-100 text-green-700 border-green-200",
  leave: "bg-red-100 text-red-700 border-red-200",
  "half-day": "bg-amber-100 text-amber-700 border-amber-200",
  blocked: "bg-gray-200 text-gray-600 border-gray-300",
  none: "bg-white text-gray-400 border-gray-100",
};

const statusLabels: Record<DayStatus, string> = {
  working: "Working", leave: "Leave", "half-day": "Half-day", blocked: "Blocked", none: "",
};

const generateMonth = (): { day: number; status: DayStatus }[] => {
  const days: { day: number; status: DayStatus }[] = [];
  for (let i = 1; i <= 31; i++) {
    let status: DayStatus = "working";
    if (i === 7 || i === 14 || i === 21 || i === 28) status = "leave"; // Sundays
    if (i === 10) status = "half-day";
    if (i === 25 || i === 26) status = "blocked";
    days.push({ day: i, status });
  }
  return days;
};

const DoctorCalendar = () => {
  const [days] = useState(generateMonth());
  const [leaveReason, setLeaveReason] = useState("");
  const [leaveDate, setLeaveDate] = useState("");

  const todaySlots = [
    { time: "09:00 - 09:30", patient: "Ramesh K.", type: "Follow-up" },
    { time: "09:30 - 10:00", patient: "Sunita M.", type: "New Consultation" },
    { time: "10:00 - 10:30", patient: "Ajay P.", type: "Procedure" },
    { time: "10:30 - 11:00", patient: "—", type: "Available" },
    { time: "11:00 - 11:30", patient: "Meera R.", type: "Teleconsult" },
  ];

  const handleLeaveRequest = () => {
    if (!leaveDate || !leaveReason.trim()) { toast.error("Fill date and reason"); return; }
    toast.success(`Leave request submitted for ${leaveDate}`);
    setLeaveDate("");
    setLeaveReason("");
  };

  const stats = {
    working: days.filter(d => d.status === "working").length,
    leave: days.filter(d => d.status === "leave").length,
    halfDay: days.filter(d => d.status === "half-day").length,
    blocked: days.filter(d => d.status === "blocked").length,
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Leave & Availability Calendar</h1>
        <Badge variant="outline" className="gap-1"><Calendar className="h-3 w-3" /> January 2024</Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3 text-center"><p className="text-2xl font-bold text-green-600">{stats.working}</p><p className="text-xs text-muted-foreground">Working Days</p></Card>
        <Card className="p-3 text-center"><p className="text-2xl font-bold text-red-600">{stats.leave}</p><p className="text-xs text-muted-foreground">Leave Days</p></Card>
        <Card className="p-3 text-center"><p className="text-2xl font-bold text-amber-600">{stats.halfDay}</p><p className="text-xs text-muted-foreground">Half Days</p></Card>
        <Card className="p-3 text-center"><p className="text-2xl font-bold text-gray-600">{stats.blocked}</p><p className="text-xs text-muted-foreground">Blocked</p></Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader><CardTitle className="text-sm">Monthly View</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => (
                <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
              ))}
              {/* Offset for first day (Wednesday) */}
              {[1, 2].map(i => <div key={`empty-${i}`} />)}
              {days.map((d) => (
                <div key={d.day} className={`text-center text-xs py-2 rounded border ${statusColors[d.status]} cursor-pointer hover:opacity-80`} title={statusLabels[d.status]}>
                  {d.day}
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-4 flex-wrap">
              {(["working", "leave", "half-day", "blocked"] as DayStatus[]).map(s => (
                <div key={s} className="flex items-center gap-1">
                  <div className={`w-3 h-3 rounded border ${statusColors[s]}`} />
                  <span className="text-xs capitalize">{s}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4" /> Today's Slots</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {todaySlots.map((s, i) => (
                <div key={i} className="flex items-center justify-between text-xs p-2 rounded border">
                  <span className="text-muted-foreground">{s.time}</span>
                  <span className="font-medium">{s.patient}</span>
                  <Badge variant="secondary" className="text-[10px]">{s.type}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Request Leave</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Input type="date" value={leaveDate} onChange={(e) => setLeaveDate(e.target.value)} />
              <Input placeholder="Reason" value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)} />
              <Button size="sm" className="w-full" onClick={handleLeaveRequest}>Submit Request</Button>
            </CardContent>
          </Card>

          <Card className="p-3">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Synced with appointments</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoctorCalendar;
