import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  QrCode, MapPin, Clock, Users, CheckCircle, XCircle,
  Smartphone, Calendar, Download, RefreshCw, AlertTriangle,
  Timer, TrendingUp
} from "lucide-react";

type AttendanceEntry = {
  id: string;
  staff_name: string;
  role: string;
  check_in: string;
  check_out: string | null;
  hours_worked: string;
  location_valid: boolean;
  location_name: string;
  method: "qr_scan" | "mobile_app" | "manual";
  status: "present" | "late" | "half_day" | "absent";
};

type StaffSummary = {
  total: number;
  present: number;
  late: number;
  absent: number;
  onLeave: number;
};

const mockAttendance: AttendanceEntry[] = [
  { id: "1", staff_name: "Dr. Saleem", role: "Doctor", check_in: "08:45 AM", check_out: "05:30 PM", hours_worked: "8h 45m", location_valid: true, location_name: "Main Clinic, Kadayanallur", method: "qr_scan", status: "present" },
  { id: "2", staff_name: "Nurse Priya", role: "Nurse", check_in: "09:05 AM", check_out: "06:00 PM", hours_worked: "8h 55m", location_valid: true, location_name: "Main Clinic, Kadayanallur", method: "mobile_app", status: "late" },
  { id: "3", staff_name: "Receptionist Kumar", role: "Front Desk", check_in: "08:55 AM", check_out: null, hours_worked: "6h 30m+", location_valid: true, location_name: "Main Clinic, Kadayanallur", method: "qr_scan", status: "present" },
  { id: "4", staff_name: "Therapist Ravi", role: "Panchakarma", check_in: "09:00 AM", check_out: "01:00 PM", hours_worked: "4h 00m", location_valid: true, location_name: "PK Center", method: "qr_scan", status: "half_day" },
  { id: "5", staff_name: "Dr. Meena Patel", role: "Doctor", check_in: "—", check_out: null, hours_worked: "—", location_valid: false, location_name: "—", method: "manual", status: "absent" },
  { id: "6", staff_name: "Pharmacist Anitha", role: "Pharmacy", check_in: "08:50 AM", check_out: null, hours_worked: "6h 45m+", location_valid: true, location_name: "Pharmacy Counter", method: "mobile_app", status: "present" },
  { id: "7", staff_name: "Lab Tech Suresh", role: "Lab", check_in: "09:10 AM", check_out: "05:45 PM", hours_worked: "8h 35m", location_valid: false, location_name: "Outside geofence", method: "mobile_app", status: "late" },
];

const summary: StaffSummary = { total: 12, present: 7, late: 2, absent: 2, onLeave: 1 };

const statusConfig = {
  present: { color: "bg-green-100 text-green-800", icon: CheckCircle },
  late: { color: "bg-amber-100 text-amber-800", icon: Clock },
  half_day: { color: "bg-blue-100 text-blue-800", icon: Timer },
  absent: { color: "bg-red-100 text-red-800", icon: XCircle },
};

const HmsQrAttendance = () => {
  const [attendance] = useState<AttendanceEntry[]>(mockAttendance);
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = attendance.filter(a => {
    const matchRole = filterRole === "all" || a.role === filterRole;
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    return matchRole && matchStatus;
  });

  const handleGenerateQR = () => {
    toast.success("QR Code generated for today's attendance. Display on reception screen or print.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <QrCode className="h-6 w-6 text-primary" /> QR Attendance & Geolocation
          </h1>
          <p className="text-sm text-muted-foreground">
            Staff scan QR via mobile app · GPS validated · Auto work-hour tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => window.location.href = "/hms/staff-attendance"}>Classic View</Button>
          <Button size="sm" variant="outline"><Download className="mr-1 h-4 w-4" /> Export</Button>
          <Button size="sm" onClick={handleGenerateQR}><QrCode className="mr-1 h-4 w-4" /> Generate QR</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{summary.total}</p><p className="text-xs text-muted-foreground">Total Staff</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-green-600">{summary.present}</p><p className="text-xs text-muted-foreground">Present</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-amber-600">{summary.late}</p><p className="text-xs text-muted-foreground">Late</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-red-600">{summary.absent}</p><p className="text-xs text-muted-foreground">Absent</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-blue-600">{summary.onLeave}</p><p className="text-xs text-muted-foreground">On Leave</p></CardContent></Card>
      </div>

      {/* QR Display Section */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex items-center gap-6">
          <div className="border-2 border-dashed border-primary/30 rounded-xl p-6 flex flex-col items-center gap-2">
            <QrCode className="h-20 w-20 text-primary" />
            <p className="text-xs text-muted-foreground font-mono">AYU-ATT-2026-07-30</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">How QR Attendance Works</h3>
            <ol className="text-sm text-muted-foreground space-y-1">
              <li>1. Display this QR at reception or print it for each shift</li>
              <li>2. Staff scan using Ayuzee mobile app (or camera)</li>
              <li>3. GPS validates they're within clinic geofence (100m radius)</li>
              <li>4. Check-in time auto-recorded with location proof</li>
              <li>5. Scan again at end of shift for check-out</li>
            </ol>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="text-xs"><MapPin className="h-3 w-3 mr-1" /> Geofence: 100m radius</Badge>
              <Badge variant="outline" className="text-xs"><Smartphone className="h-3 w-3 mr-1" /> Mobile App Scan</Badge>
              <Badge variant="outline" className="text-xs"><Clock className="h-3 w-3 mr-1" /> Late after: 9:00 AM</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex gap-3">
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All Roles" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="Doctor">Doctor</SelectItem>
            <SelectItem value="Nurse">Nurse</SelectItem>
            <SelectItem value="Front Desk">Front Desk</SelectItem>
            <SelectItem value="Panchakarma">Panchakarma</SelectItem>
            <SelectItem value="Pharmacy">Pharmacy</SelectItem>
            <SelectItem value="Lab">Lab</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="present">Present</SelectItem>
            <SelectItem value="late">Late</SelectItem>
            <SelectItem value="half_day">Half Day</SelectItem>
            <SelectItem value="absent">Absent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Attendance Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" /> Today's Attendance ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filtered.map(entry => {
              const config = statusConfig[entry.status];
              const StatusIcon = config.icon;
              return (
                <div key={entry.id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/20">
                  <div className="flex items-center gap-3">
                    <Badge className={`${config.color} w-20 justify-center`}>{entry.status}</Badge>
                    <div>
                      <p className="font-medium text-sm">{entry.staff_name}</p>
                      <p className="text-xs text-muted-foreground">{entry.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>In: <strong>{entry.check_in}</strong></span>
                    <span>Out: <strong>{entry.check_out ?? "—"}</strong></span>
                    <span>Hours: <strong>{entry.hours_worked}</strong></span>
                    <span className="flex items-center gap-1">
                      {entry.location_valid ? <MapPin className="h-3 w-3 text-green-500" /> : <AlertTriangle className="h-3 w-3 text-red-500" />}
                      {entry.location_name}
                    </span>
                    <Badge variant="outline" className="text-[10px]">{entry.method.replace("_", " ")}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HmsQrAttendance;
