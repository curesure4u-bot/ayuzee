import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Calendar, ChevronLeft, ChevronRight, Users, Clock,
  Plus, AlertTriangle, Loader2, Sun, Moon, Sunset, Coffee,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Shift {
  id: string;
  name: string;
  code: string;
  startTime: string;
  endTime: string;
  isNightShift: boolean;
  color: string;
}

interface RosterEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  role: string;
  date: string;
  shiftId: string | null;
  shiftCode: string | null;
  shiftName: string | null;
  status: string;
}

interface StaffMember {
  id: string;
  name: string;
  employeeCode: string;
  department: string;
  role: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_SHIFTS: Shift[] = [
  { id: "s1", name: "Morning Shift", code: "M", startTime: "06:00", endTime: "14:00", isNightShift: false, color: "#3B82F6" },
  { id: "s2", name: "General Shift", code: "G", startTime: "09:00", endTime: "17:00", isNightShift: false, color: "#22C55E" },
  { id: "s3", name: "Afternoon Shift", code: "A", startTime: "14:00", endTime: "22:00", isNightShift: false, color: "#F59E0B" },
  { id: "s4", name: "Night Shift", code: "N", startTime: "22:00", endTime: "06:00", isNightShift: true, color: "#8B5CF6" },
];

const MOCK_STAFF: StaffMember[] = [
  { id: "1", name: "Dr. Arun Sharma", employeeCode: "EMP-0001", department: "Ayurveda", role: "Senior Doctor" },
  { id: "2", name: "Dr. Meena Patel", employeeCode: "EMP-0002", department: "Panchakarma", role: "Doctor" },
  { id: "3", name: "Rajesh K", employeeCode: "EMP-0003", department: "Front Office", role: "Receptionist" },
  { id: "4", name: "Sunita M", employeeCode: "EMP-0004", department: "IPD", role: "Nurse" },
  { id: "5", name: "Vikram R", employeeCode: "EMP-0005", department: "Pharmacy", role: "Pharmacist" },
  { id: "6", name: "Anita D", employeeCode: "EMP-0006", department: "Laboratory", role: "Lab Technician" },
  { id: "7", name: "Suresh Therapist", employeeCode: "EMP-0007", department: "Panchakarma", role: "Therapist (Senior)" },
  { id: "8", name: "Priya Therapist", employeeCode: "EMP-0008", department: "Panchakarma", role: "Therapist" },
  { id: "9", name: "Mohan P", employeeCode: "EMP-0009", department: "Panchakarma", role: "Therapist" },
  { id: "10", name: "Kavita S", employeeCode: "EMP-0010", department: "Administration", role: "Admin Manager" },
];

const generateMockRoster = (weekStart: Date): RosterEntry[] => {
  const entries: RosterEntry[] = [];
  const shiftPattern = ["G", "G", "G", "G", "G", "G", "O", "M", "M", "M", "A", "A", "N", "O"];
  
  MOCK_STAFF.forEach((staff, si) => {
    for (let d = 0; d < 7; d++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + d);
      const code = shiftPattern[(si * 2 + d) % shiftPattern.length];
      const shift = MOCK_SHIFTS.find((s) => s.code === code);
      entries.push({
        id: `r-${staff.id}-${d}`,
        employeeId: staff.id,
        employeeName: staff.name,
        employeeCode: staff.employeeCode,
        department: staff.department,
        role: staff.role,
        date: date.toISOString().split("T")[0],
        shiftId: shift?.id || null,
        shiftCode: code === "O" ? "O" : (shift?.code || null),
        shiftName: code === "O" ? "Off" : (shift?.name || null),
        status: "scheduled",
      });
    }
  });
  return entries;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const formatWeekRange = (start: Date): string => {
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return `${start.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })} — ${end.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`;
};

const shiftIcon = (code: string) => {
  if (code === "M") return <Sun className="h-3 w-3" />;
  if (code === "A") return <Sunset className="h-3 w-3" />;
  if (code === "N") return <Moon className="h-3 w-3" />;
  if (code === "O") return <Coffee className="h-3 w-3" />;
  return <Clock className="h-3 w-3" />;
};

const shiftBgColor = (code: string | null): string => {
  if (code === "M") return "bg-blue-100 text-blue-700";
  if (code === "G") return "bg-green-100 text-green-700";
  if (code === "A") return "bg-amber-100 text-amber-700";
  if (code === "N") return "bg-purple-100 text-purple-700";
  if (code === "O") return "bg-gray-100 text-gray-500";
  return "bg-gray-50 text-gray-400";
};

// ─── Component ───────────────────────────────────────────────────────────────

const HrmsDutyRoster = () => {
  const [weekStart, setWeekStart] = useState(getWeekStart(new Date()));
  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [shifts, setShifts] = useState<Shift[]>(MOCK_SHIFTS);
  const [staff, setStaff] = useState<StaffMember[]>(MOCK_STAFF);
  const [deptFilter, setDeptFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Assign dialog
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignEmployee, setAssignEmployee] = useState("");
  const [assignDate, setAssignDate] = useState("");
  const [assignShift, setAssignShift] = useState("");

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const fetchRoster = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch shifts
      const { data: shiftRows } = await (supabase as any)
        .from("hrms_shifts")
        .select("*")
        .eq("is_active", true)
        .order("start_time");

      if (shiftRows && shiftRows.length > 0) {
        setShifts(shiftRows.map((s: any) => ({
          id: s.id, name: s.name, code: s.code,
          startTime: s.start_time, endTime: s.end_time,
          isNightShift: s.is_night_shift, color: s.color,
        })));
      }

      // Fetch staff
      const { data: staffRows } = await (supabase as any)
        .from("hms_staff")
        .select("id, name, employee_code, department, role")
        .eq("is_active", true)
        .order("name");

      if (staffRows && staffRows.length > 0) {
        setStaff(staffRows.map((s: any) => ({
          id: s.id, name: s.name, employeeCode: s.employee_code || "",
          department: s.department || "Unassigned", role: s.role,
        })));
      }

      // Fetch roster for the week
      const endDate = new Date(weekStart);
      endDate.setDate(endDate.getDate() + 6);

      const { data: rosterRows, error: rErr } = await (supabase as any)
        .from("hrms_duty_roster")
        .select("*, hrms_shifts(name, code, color)")
        .gte("roster_date", weekStart.toISOString().split("T")[0])
        .lte("roster_date", endDate.toISOString().split("T")[0])
        .order("roster_date");

      if (rErr) {
        setError(rErr.message);
        setRoster(generateMockRoster(weekStart));
        setLoading(false);
        return;
      }

      if (rosterRows && rosterRows.length > 0) {
        // Build from DB
        const staffList = staffRows || MOCK_STAFF.map((s) => ({
          id: s.id, name: s.name, employee_code: s.employeeCode, department: s.department, role: s.role,
        }));
        const rosterMap = new Map<string, any>();
        rosterRows.forEach((r: any) => rosterMap.set(`${r.employee_id}-${r.roster_date}`, r));

        const entries: RosterEntry[] = [];
        staffList.forEach((s: any) => {
          weekDays.forEach((day) => {
            const dateStr = day.toISOString().split("T")[0];
            const key = `${s.id}-${dateStr}`;
            const row = rosterMap.get(key);
            entries.push({
              id: row?.id || `pending-${key}`,
              employeeId: s.id,
              employeeName: s.name,
              employeeCode: s.employee_code || "",
              department: s.department || "Unassigned",
              role: s.role,
              date: dateStr,
              shiftId: row?.shift_id || null,
              shiftCode: row?.hrms_shifts?.code || null,
              shiftName: row?.hrms_shifts?.name || null,
              status: row?.status || "unassigned",
            });
          });
        });
        setRoster(entries);
      } else {
        setRoster(generateMockRoster(weekStart));
      }

      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setRoster(generateMockRoster(weekStart));
      setLoading(false);
    }
  }, [weekStart]);

  useEffect(() => {
    fetchRoster();
  }, [fetchRoster]);

  // Navigate weeks
  const changeWeek = (dir: number) => {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + dir * 7);
    setWeekStart(next);
  };

  // Filter
  const departments = [...new Set(staff.map((s) => s.department))].sort();
  const filteredStaff = deptFilter === "all" ? staff : staff.filter((s) => s.department === deptFilter);

  // Get roster entry for employee+date
  const getEntry = (employeeId: string, date: string): RosterEntry | undefined => {
    return roster.find((r) => r.employeeId === employeeId && r.date === date);
  };

  // Assign shift
  const handleAssign = async () => {
    if (!assignEmployee || !assignDate || !assignShift) {
      toast.error("Select employee, date, and shift");
      return;
    }

    const { error } = await (supabase as any)
      .from("hrms_duty_roster")
      .upsert({
        employee_id: assignEmployee,
        roster_date: assignDate,
        shift_id: assignShift === "off" ? null : assignShift,
        status: assignShift === "off" ? "cancelled" : "scheduled",
        department: staff.find((s) => s.id === assignEmployee)?.department,
      }, { onConflict: "employee_id,roster_date" });

    if (error) {
      toast.error("Failed to assign shift");
    } else {
      toast.success("Shift assigned");
      setAssignOpen(false);
      fetchRoster();
    }
  };

  // Quick assign by clicking a cell
  const handleCellClick = (employeeId: string, date: string) => {
    setAssignEmployee(employeeId);
    setAssignDate(date);
    setAssignShift("");
    setAssignOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-indigo-600" /> Duty Roster
          </h1>
          <p className="text-sm text-muted-foreground">Weekly shift scheduling & assignment</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => changeWeek(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Badge variant="outline" className="px-3 py-1 text-sm font-medium">
            {formatWeekRange(weekStart)}
          </Badge>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => changeWeek(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setWeekStart(getWeekStart(new Date()))}>
            This Week
          </Button>
          <Button size="sm" className="h-8" onClick={() => { setAssignEmployee(""); setAssignDate(""); setAssignShift(""); setAssignOpen(true); }}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Assign
          </Button>
        </div>
      </div>

      {/* Shift Legend */}
      <div className="flex flex-wrap items-center gap-3">
        {shifts.map((s) => (
          <div key={s.id} className="flex items-center gap-1.5">
            <Badge className={`text-[10px] border-0 ${shiftBgColor(s.code)}`}>
              {shiftIcon(s.code)} {s.code}
            </Badge>
            <span className="text-[10px] text-muted-foreground">{s.name} ({s.startTime}–{s.endTime})</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <Badge className="text-[10px] border-0 bg-gray-100 text-gray-500">
            <Coffee className="h-3 w-3" /> O
          </Badge>
          <span className="text-[10px] text-muted-foreground">Off Day</span>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="h-8 w-[180px] text-xs"><SelectValue placeholder="All Departments" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">{filteredStaff.length} staff</span>
      </div>

      {/* Error */}
      {error && !loading && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-2 text-xs text-amber-700 flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5" /> Showing demo roster. {error}
          </CardContent>
        </Card>
      )}

      {/* Roster Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-10 text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm">Loading roster...</span>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="border-b bg-muted/40 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium min-w-[180px] sticky left-0 bg-muted/40 z-10">Staff</th>
                    {weekDays.map((day) => {
                      const isToday = day.toISOString().split("T")[0] === new Date().toISOString().split("T")[0];
                      const isSunday = day.getDay() === 0;
                      return (
                        <th
                          key={day.toISOString()}
                          className={`px-2 py-2 text-center text-xs font-medium min-w-[80px] ${isToday ? "bg-blue-50" : ""} ${isSunday ? "bg-red-50/50" : ""}`}
                        >
                          <p className={`${isToday ? "text-blue-700 font-bold" : ""}`}>
                            {day.toLocaleDateString("en-IN", { weekday: "short" })}
                          </p>
                          <p className={`text-[10px] ${isToday ? "text-blue-600" : "text-muted-foreground"}`}>
                            {day.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                          </p>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((s) => (
                    <tr key={s.id} className="border-b hover:bg-muted/10">
                      <td className="px-3 py-2 sticky left-0 bg-white z-10">
                        <p className="font-medium text-xs">{s.name}</p>
                        <p className="text-[10px] text-muted-foreground">{s.role} &middot; {s.department}</p>
                      </td>
                      {weekDays.map((day) => {
                        const dateStr = day.toISOString().split("T")[0];
                        const entry = getEntry(s.id, dateStr);
                        const code = entry?.shiftCode;
                        const isToday = dateStr === new Date().toISOString().split("T")[0];

                        return (
                          <td
                            key={dateStr}
                            className={`px-1 py-2 text-center cursor-pointer hover:bg-blue-50/50 transition ${isToday ? "bg-blue-50/30" : ""}`}
                            onClick={() => handleCellClick(s.id, dateStr)}
                            title={`Click to assign shift for ${s.name} on ${dateStr}`}
                          >
                            {code ? (
                              <Badge className={`text-[10px] border-0 px-2 py-0.5 ${shiftBgColor(code)}`}>
                                {shiftIcon(code)}
                                <span className="ml-0.5">{code}</span>
                              </Badge>
                            ) : (
                              <span className="text-[10px] text-gray-300">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {shifts.map((s) => {
            const count = roster.filter((r) =>
              r.shiftCode === s.code &&
              filteredStaff.some((fs) => fs.id === r.employeeId)
            ).length;
            return (
              <Card key={s.id}>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg grid place-items-center" style={{ backgroundColor: `${s.color}20`, color: s.color }}>
                    {shiftIcon(s.code)}
                  </div>
                  <div>
                    <p className="text-lg font-bold">{count}</p>
                    <p className="text-[10px] text-muted-foreground">{s.name} slots</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ─── Assign Shift Dialog ──────────────────────────────────────────── */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Assign Shift</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Employee *</Label>
              <Select value={assignEmployee} onValueChange={setAssignEmployee}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Select staff" /></SelectTrigger>
                <SelectContent>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name} ({s.department})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Date *</Label>
              <input
                type="date"
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={assignDate}
                onChange={(e) => setAssignDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Shift *</Label>
              <Select value={assignShift} onValueChange={setAssignShift}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Select shift" /></SelectTrigger>
                <SelectContent>
                  {shifts.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      <span className="flex items-center gap-2">
                        {shiftIcon(s.code)} {s.name} ({s.startTime}–{s.endTime})
                      </span>
                    </SelectItem>
                  ))}
                  <SelectItem value="off">
                    <span className="flex items-center gap-2"><Coffee className="h-3 w-3" /> Day Off</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button>
            <Button onClick={handleAssign}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HrmsDutyRoster;
