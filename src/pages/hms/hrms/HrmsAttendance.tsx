import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  CalendarClock, Users, CheckCircle2, XCircle, Clock,
  CalendarOff, Loader2, ChevronLeft, ChevronRight, RefreshCw,
  Search, UserCheck, AlertTriangle,
} from "lucide-react";
import { useHrmsAttendance, type AttendanceStatus } from "@/hooks/hrms/useHrmsAttendance";

// ─── Status styling ──────────────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  present: { label: "Present", color: "text-green-700", bg: "bg-green-100" },
  absent: { label: "Absent", color: "text-red-700", bg: "bg-red-100" },
  half_day: { label: "Half Day", color: "text-blue-700", bg: "bg-blue-100" },
  late: { label: "Late", color: "text-amber-700", bg: "bg-amber-100" },
  early_departure: { label: "Early Out", color: "text-orange-700", bg: "bg-orange-100" },
  on_leave: { label: "On Leave", color: "text-purple-700", bg: "bg-purple-100" },
  weekly_off: { label: "Weekly Off", color: "text-gray-600", bg: "bg-gray-100" },
  holiday: { label: "Holiday", color: "text-indigo-700", bg: "bg-indigo-100" },
  on_duty: { label: "On Duty", color: "text-cyan-700", bg: "bg-cyan-100" },
  compensatory_off: { label: "Comp Off", color: "text-teal-700", bg: "bg-teal-100" },
};

const HrmsAttendance = () => {
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [deptFilter, setDeptFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { records, summary, loading, error, markAttendance, bulkMarkAttendance, refetch } =
    useHrmsAttendance(selectedDate, deptFilter);

  // Filtered records
  const filteredRecords = search
    ? records.filter(
        (r) =>
          r.employeeName.toLowerCase().includes(search.toLowerCase()) ||
          r.employeeCode.toLowerCase().includes(search.toLowerCase()) ||
          r.department.toLowerCase().includes(search.toLowerCase())
      )
    : records;

  // Date navigation
  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  // Mark single
  const handleMark = async (employeeId: string, status: AttendanceStatus) => {
    const success = await markAttendance(employeeId, status);
    if (success) toast.success("Attendance marked");
    else toast.error("Failed to mark attendance");
  };

  // Bulk mark
  const handleBulkMark = async (status: AttendanceStatus) => {
    if (selectedIds.size === 0) {
      toast.error("Select employees first");
      return;
    }
    const success = await bulkMarkAttendance(Array.from(selectedIds), status);
    if (success) {
      toast.success(`${selectedIds.size} employees marked as ${status}`);
      setSelectedIds(new Set());
    } else {
      toast.error("Bulk mark failed");
    }
  };

  // Toggle selection
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredRecords.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRecords.map((r) => r.employeeId)));
    }
  };

  // Unique departments
  const departments = [...new Set(records.map((r) => r.department))].sort();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarClock className="h-6 w-6 text-green-600" /> Attendance
          </h1>
          <p className="text-sm text-muted-foreground">Daily attendance marking, tracking & reports</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => changeDate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Input
            type="date"
            className="h-8 w-[150px] text-sm"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => changeDate(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          {selectedDate !== today && (
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setSelectedDate(today)}>
              Today
            </Button>
          )}
          <Button variant="outline" size="sm" className="h-8" onClick={refetch} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-10 gap-2">
        <Card className="border-blue-100"><CardContent className="p-2 text-center"><Users className="h-4 w-4 mx-auto text-blue-600" /><p className="text-lg font-bold mt-1">{summary.total}</p><p className="text-[9px] text-muted-foreground">Total</p></CardContent></Card>
        <Card className="border-green-100"><CardContent className="p-2 text-center"><CheckCircle2 className="h-4 w-4 mx-auto text-green-600" /><p className="text-lg font-bold mt-1 text-green-700">{summary.present}</p><p className="text-[9px] text-muted-foreground">Present</p></CardContent></Card>
        <Card className="border-red-100"><CardContent className="p-2 text-center"><XCircle className="h-4 w-4 mx-auto text-red-600" /><p className="text-lg font-bold mt-1 text-red-700">{summary.absent}</p><p className="text-[9px] text-muted-foreground">Absent</p></CardContent></Card>
        <Card className="border-purple-100"><CardContent className="p-2 text-center"><CalendarOff className="h-4 w-4 mx-auto text-purple-600" /><p className="text-lg font-bold mt-1 text-purple-700">{summary.onLeave}</p><p className="text-[9px] text-muted-foreground">Leave</p></CardContent></Card>
        <Card className="border-blue-100"><CardContent className="p-2 text-center"><Clock className="h-4 w-4 mx-auto text-blue-600" /><p className="text-lg font-bold mt-1 text-blue-700">{summary.halfDay}</p><p className="text-[9px] text-muted-foreground">Half Day</p></CardContent></Card>
        <Card className="border-amber-100"><CardContent className="p-2 text-center"><AlertTriangle className="h-4 w-4 mx-auto text-amber-600" /><p className="text-lg font-bold mt-1 text-amber-700">{summary.late}</p><p className="text-[9px] text-muted-foreground">Late</p></CardContent></Card>
        <Card className="border-gray-100"><CardContent className="p-2 text-center"><p className="text-lg font-bold mt-1 text-gray-600">{summary.weeklyOff}</p><p className="text-[9px] text-muted-foreground">Weekly Off</p></CardContent></Card>
        <Card className="border-indigo-100"><CardContent className="p-2 text-center"><p className="text-lg font-bold mt-1 text-indigo-700">{summary.holiday}</p><p className="text-[9px] text-muted-foreground">Holiday</p></CardContent></Card>
        <Card className="border-cyan-100"><CardContent className="p-2 text-center"><p className="text-lg font-bold mt-1 text-cyan-700">{summary.onDuty}</p><p className="text-[9px] text-muted-foreground">On Duty</p></CardContent></Card>
        <Card className="border-slate-100"><CardContent className="p-2 text-center"><p className="text-lg font-bold mt-1 text-slate-600">{summary.notMarked}</p><p className="text-[9px] text-muted-foreground">Not Marked</p></CardContent></Card>
      </div>

      {/* Error */}
      {error && !loading && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-2 text-xs text-amber-700 flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5" /> Showing demo data. {error}
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="daily">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="daily">Daily View</TabsTrigger>
          <TabsTrigger value="mark">Mark Attendance</TabsTrigger>
        </TabsList>

        {/* ─── Daily View Tab ─────────────────────────────────────────────── */}
        <TabsContent value="daily" className="space-y-3">
          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input className="pl-9 h-8 text-sm" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="h-8 w-[160px] text-xs"><SelectValue placeholder="All Departments" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm">Loading...</span>
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-muted/40">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium">Employee</th>
                        <th className="px-3 py-2 text-left text-xs font-medium">Department</th>
                        <th className="px-3 py-2 text-center text-xs font-medium">Status</th>
                        <th className="px-3 py-2 text-center text-xs font-medium">Check-in</th>
                        <th className="px-3 py-2 text-center text-xs font-medium">Check-out</th>
                        <th className="px-3 py-2 text-center text-xs font-medium">Hours</th>
                        <th className="px-3 py-2 text-center text-xs font-medium">Late</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.map((r) => {
                        const cfg = statusConfig[r.status] || statusConfig.absent;
                        return (
                          <tr key={r.id} className="border-b hover:bg-muted/20">
                            <td className="px-3 py-2">
                              <p className="font-medium text-sm">{r.employeeName}</p>
                              <p className="text-[10px] text-muted-foreground">{r.employeeCode}</p>
                            </td>
                            <td className="px-3 py-2 text-xs">{r.department}</td>
                            <td className="px-3 py-2 text-center">
                              <Badge className={`text-[10px] border-0 ${cfg.bg} ${cfg.color}`}>{cfg.label}</Badge>
                            </td>
                            <td className="px-3 py-2 text-center text-xs">
                              {r.checkIn ? new Date(r.checkIn).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}
                            </td>
                            <td className="px-3 py-2 text-center text-xs">
                              {r.checkOut ? new Date(r.checkOut).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}
                            </td>
                            <td className="px-3 py-2 text-center text-xs font-medium">
                              {r.workedHours > 0 ? `${r.workedHours}h` : "—"}
                            </td>
                            <td className="px-3 py-2 text-center text-xs">
                              {r.lateMinutes > 0 ? (
                                <span className="text-amber-600 font-medium">{r.lateMinutes}m</span>
                              ) : "—"}
                            </td>
                          </tr>
                        );
                      })}
                      {filteredRecords.length === 0 && (
                        <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">No records found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ─── Mark Attendance Tab ────────────────────────────────────────── */}
        <TabsContent value="mark" className="space-y-3">
          {/* Bulk Actions */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={selectedIds.size === filteredRecords.length && filteredRecords.length > 0}
                    onChange={toggleSelectAll}
                  />
                  <span className="text-sm text-muted-foreground">
                    {selectedIds.size > 0 ? `${selectedIds.size} selected` : "Select all"}
                  </span>
                </div>
                {selectedIds.size > 0 && (
                  <div className="flex items-center gap-1">
                    <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700" onClick={() => handleBulkMark("present")}>
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Present
                    </Button>
                    <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => handleBulkMark("absent")}>
                      <XCircle className="h-3 w-3 mr-1" /> Absent
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleBulkMark("half_day")}>
                      Half Day
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleBulkMark("on_leave")}>
                      Leave
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Mark Table */}
          {loading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm">Loading...</span>
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-muted/40">
                      <tr>
                        <th className="px-3 py-2 w-8"></th>
                        <th className="px-3 py-2 text-left text-xs font-medium">Employee</th>
                        <th className="px-3 py-2 text-left text-xs font-medium">Department</th>
                        <th className="px-3 py-2 text-center text-xs font-medium">Current</th>
                        <th className="px-3 py-2 text-center text-xs font-medium">Mark As</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.map((r) => {
                        const cfg = statusConfig[r.status] || statusConfig.absent;
                        return (
                          <tr key={r.id} className="border-b hover:bg-muted/20">
                            <td className="px-3 py-2">
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300"
                                checked={selectedIds.has(r.employeeId)}
                                onChange={() => toggleSelect(r.employeeId)}
                              />
                            </td>
                            <td className="px-3 py-2">
                              <p className="font-medium text-sm">{r.employeeName}</p>
                              <p className="text-[10px] text-muted-foreground">{r.employeeCode} &middot; {r.role}</p>
                            </td>
                            <td className="px-3 py-2 text-xs">{r.department}</td>
                            <td className="px-3 py-2 text-center">
                              <Badge className={`text-[10px] border-0 ${cfg.bg} ${cfg.color}`}>{cfg.label}</Badge>
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  size="sm" variant="ghost"
                                  className={`h-6 w-6 p-0 rounded-full ${r.status === "present" ? "bg-green-100 ring-2 ring-green-400" : ""}`}
                                  title="Present"
                                  onClick={() => handleMark(r.employeeId, "present")}
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                                </Button>
                                <Button
                                  size="sm" variant="ghost"
                                  className={`h-6 w-6 p-0 rounded-full ${r.status === "absent" ? "bg-red-100 ring-2 ring-red-400" : ""}`}
                                  title="Absent"
                                  onClick={() => handleMark(r.employeeId, "absent")}
                                >
                                  <XCircle className="h-3.5 w-3.5 text-red-600" />
                                </Button>
                                <Button
                                  size="sm" variant="ghost"
                                  className={`h-6 w-6 p-0 rounded-full ${r.status === "half_day" ? "bg-blue-100 ring-2 ring-blue-400" : ""}`}
                                  title="Half Day"
                                  onClick={() => handleMark(r.employeeId, "half_day")}
                                >
                                  <Clock className="h-3.5 w-3.5 text-blue-600" />
                                </Button>
                                <Button
                                  size="sm" variant="ghost"
                                  className={`h-6 w-6 p-0 rounded-full ${r.status === "on_leave" ? "bg-purple-100 ring-2 ring-purple-400" : ""}`}
                                  title="On Leave"
                                  onClick={() => handleMark(r.employeeId, "on_leave")}
                                >
                                  <CalendarOff className="h-3.5 w-3.5 text-purple-600" />
                                </Button>
                                <Button
                                  size="sm" variant="ghost"
                                  className={`h-6 w-6 p-0 rounded-full ${r.status === "late" ? "bg-amber-100 ring-2 ring-amber-400" : ""}`}
                                  title="Late"
                                  onClick={() => handleMark(r.employeeId, "late")}
                                >
                                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HrmsAttendance;
