import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Clock, Plus, Users, Calendar, AlertTriangle, CheckCircle, ArrowLeftRight, FileText, Loader2 } from "lucide-react";
import { useShiftRoster } from "@/hooks/useShiftRoster";

type ShiftType = { id: string; name: string; time: string; color: string };

const shifts: ShiftType[] = [
  { id: "M", name: "Morning", time: "06:00-14:00", color: "bg-blue-100 text-blue-700" },
  { id: "A", name: "Afternoon", time: "14:00-22:00", color: "bg-amber-100 text-amber-700" },
  { id: "N", name: "Night", time: "22:00-06:00", color: "bg-purple-100 text-purple-700" },
  { id: "G", name: "General", time: "09:00-17:00", color: "bg-green-100 text-green-700" },
  { id: "O", name: "Off", time: "—", color: "bg-gray-100 text-gray-500" },
];

type SwapRequest = { id: string; from: string; to: string; date: string; shift: string; reason: string; status: "pending" | "approved" | "rejected" };
type LeaveEntry = { id: string; name: string; dept: string; fromDate: string; toDate: string; type: string; status: "pending" | "approved" | "rejected" };

const mockSwaps: SwapRequest[] = [
  { id: "SW-1", from: "Nurse Priya", to: "Nurse Anu", date: "2026-08-09", shift: "Morning", reason: "Family function", status: "pending" },
  { id: "SW-2", from: "Vikram R", to: "Anita D", date: "2026-08-10", shift: "Afternoon", reason: "Medical appointment", status: "approved" },
  { id: "SW-3", from: "Suresh Therapist", to: "Priya Therapist", date: "2026-08-11", shift: "General", reason: "Personal", status: "pending" },
];

const mockLeaves: LeaveEntry[] = [
  { id: "LV-1", name: "Nurse Kavitha", dept: "Panchakarma", fromDate: "2026-08-12", toDate: "2026-08-14", type: "Casual Leave", status: "approved" },
  { id: "LV-2", name: "Rajesh K", dept: "Front Office", fromDate: "2026-08-15", toDate: "2026-08-15", type: "Public Holiday", status: "approved" },
  { id: "LV-3", name: "Night Nurse Sita", dept: "IPD", fromDate: "2026-08-10", toDate: "2026-08-11", type: "Sick Leave", status: "pending" },
];

const HmsShiftRoster = () => {
  const { roster, loading, error, departments, totalStaff, overtimeStaff } = useShiftRoster();
  const [addOpen, setAddOpen] = useState(false);
  const [weekOf] = useState("Aug 7-13, 2026");
  const [filterDept, setFilterDept] = useState("all");

  const filteredRoster = filterDept === "all" ? roster : roster.filter(r => r.dept === filterDept);

  const getShiftBadge = (code: string) => {
    const s = shifts.find(sh => sh.id === code);
    if (!s) return <span>—</span>;
    return <Badge className={`text-[10px] ${s.color} border-0`}>{s.id}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Clock className="h-6 w-6 text-indigo-600" /> Staff Shift Rostering
          </h1>
          <p className="text-sm text-muted-foreground">Shift management, staff assignment, overlap detection & overtime tracking</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">← Prev Week</Button>
          <Badge variant="outline" className="px-3 py-1">{weekOf}</Badge>
          <Button variant="outline" size="sm">Next Week →</Button>
          <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="mr-1 h-4 w-4" /> Assign Shift</Button>
        </div>
      </div>

      {/* Shift Legend */}
      <div className="flex flex-wrap gap-2">
        {shifts.map(s => (
          <div key={s.id} className="flex items-center gap-1">
            <Badge className={`text-[10px] ${s.color} border-0`}>{s.id}</Badge>
            <span className="text-xs text-muted-foreground">{s.name} ({s.time})</span>
          </div>
        ))}
      </div>

      {/* Stats */}
      {loading && (
        <div className="flex items-center justify-center py-2 text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm">Loading roster...</span>
        </div>
      )}
      {error && !loading && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-2 text-xs text-amber-700">⚠ Using demo data. {error}</CardContent>
        </Card>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><Users className="h-5 w-5 mx-auto text-blue-600" /><p className="text-xl font-bold mt-1">{totalStaff}</p><p className="text-xs text-muted-foreground">Staff Rostered</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><CheckCircle className="h-5 w-5 mx-auto text-green-600" /><p className="text-xl font-bold mt-1">0</p><p className="text-xs text-muted-foreground">Overlaps</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><AlertTriangle className="h-5 w-5 mx-auto text-amber-600" /><p className="text-xl font-bold mt-1">{overtimeStaff}</p><p className="text-xs text-muted-foreground">Overtime ({">"} 48h)</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Calendar className="h-5 w-5 mx-auto text-purple-600" /><p className="text-xl font-bold mt-1">{mockLeaves.filter(l => l.status === "pending").length}</p><p className="text-xs text-muted-foreground">Leave Requests</p></CardContent></Card>
      </div>

      <Tabs defaultValue="roster">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full">
          <TabsTrigger value="roster">Weekly Roster</TabsTrigger>
          <TabsTrigger value="swaps">Swap Requests ({mockSwaps.filter(s => s.status === "pending").length})</TabsTrigger>
          <TabsTrigger value="leaves">Leave Calendar</TabsTrigger>
          <TabsTrigger value="overtime">Overtime & Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="roster" className="space-y-4">
          {/* Department Filter */}
          <div className="flex items-center gap-3">
            <Select value={filterDept} onValueChange={setFilterDept}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Departments" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">{filteredRoster.length} staff shown</span>
          </div>

          {/* Roster Grid */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Staff</th>
                      <th className="px-3 py-2 text-left font-medium">Role</th>
                      <th className="px-3 py-2 text-left font-medium">Dept</th>
                      <th className="px-3 py-2 text-center font-medium">Mon</th>
                      <th className="px-3 py-2 text-center font-medium">Tue</th>
                      <th className="px-3 py-2 text-center font-medium">Wed</th>
                      <th className="px-3 py-2 text-center font-medium">Thu</th>
                      <th className="px-3 py-2 text-center font-medium">Fri</th>
                      <th className="px-3 py-2 text-center font-medium">Sat</th>
                      <th className="px-3 py-2 text-center font-medium">Sun</th>
                      <th className="px-3 py-2 text-center font-medium">Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRoster.map((r) => {
                      const days = [r.mon, r.tue, r.wed, r.thu, r.fri, r.sat, r.sun];
                      const hours = days.filter(d => d !== "O").length * 8;
                      return (
                        <tr key={r.id} className={`border-b hover:bg-muted/30 ${hours > 48 ? "bg-red-50/30" : ""}`}>
                          <td className="px-3 py-2 font-medium">{r.name}</td>
                          <td className="px-3 py-2 text-xs">{r.role}</td>
                          <td className="px-3 py-2 text-xs">{r.dept}</td>
                          <td className="px-3 py-2 text-center">{getShiftBadge(r.mon)}</td>
                          <td className="px-3 py-2 text-center">{getShiftBadge(r.tue)}</td>
                          <td className="px-3 py-2 text-center">{getShiftBadge(r.wed)}</td>
                          <td className="px-3 py-2 text-center">{getShiftBadge(r.thu)}</td>
                          <td className="px-3 py-2 text-center">{getShiftBadge(r.fri)}</td>
                          <td className="px-3 py-2 text-center">{getShiftBadge(r.sat)}</td>
                          <td className="px-3 py-2 text-center">{getShiftBadge(r.sun)}</td>
                          <td className="px-3 py-2 text-center">
                            <span className={`font-medium ${hours > 48 ? "text-red-600" : ""}`}>{hours}h</span>
                            {hours > 48 && <AlertTriangle className="h-3 w-3 text-red-500 inline ml-1" />}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="swaps" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><ArrowLeftRight className="h-4 w-4" /> Shift Swap Requests</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockSwaps.map(swap => (
                  <div key={swap.id} className="p-3 rounded-lg border flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{swap.from} → {swap.to}</p>
                      <p className="text-xs text-muted-foreground">{swap.date} · {swap.shift} shift · {swap.reason}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={swap.status === "approved" ? "outline" : swap.status === "rejected" ? "destructive" : "secondary"} className={`text-xs capitalize ${swap.status === "approved" ? "text-green-600" : ""}`}>{swap.status}</Badge>
                      {swap.status === "pending" && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="h-6 text-xs text-green-600" onClick={() => toast.success("Swap approved")}><CheckCircle className="h-3 w-3" /></Button>
                          <Button size="sm" variant="outline" className="h-6 text-xs text-red-600" onClick={() => toast.info("Swap rejected")}><AlertTriangle className="h-3 w-3" /></Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaves" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" /> Leave Management</CardTitle></CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Staff</th>
                    <th className="px-3 py-2 text-left font-medium">Department</th>
                    <th className="px-3 py-2 text-left font-medium">From</th>
                    <th className="px-3 py-2 text-left font-medium">To</th>
                    <th className="px-3 py-2 text-left font-medium">Type</th>
                    <th className="px-3 py-2 text-left font-medium">Status</th>
                    <th className="px-3 py-2 text-center font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {mockLeaves.map(leave => (
                    <tr key={leave.id} className="border-b hover:bg-muted/30">
                      <td className="px-3 py-2 font-medium">{leave.name}</td>
                      <td className="px-3 py-2 text-xs">{leave.dept}</td>
                      <td className="px-3 py-2 text-xs">{leave.fromDate}</td>
                      <td className="px-3 py-2 text-xs">{leave.toDate}</td>
                      <td className="px-3 py-2"><Badge variant="outline" className="text-[10px]">{leave.type}</Badge></td>
                      <td className="px-3 py-2"><Badge variant={leave.status === "approved" ? "outline" : "secondary"} className={`text-xs capitalize ${leave.status === "approved" ? "text-green-600" : ""}`}>{leave.status}</Badge></td>
                      <td className="px-3 py-2 text-center">
                        {leave.status === "pending" && (
                          <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => toast.success("Leave approved")}>Approve</Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overtime" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Overtime & Compliance Report</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {roster.map(r => {
                const days = [r.mon, r.tue, r.wed, r.thu, r.fri, r.sat, r.sun];
                const hours = days.filter(d => d !== "O").length * 8;
                if (hours <= 40) return null;
                return (
                  <div key={r.id} className={`p-3 rounded-lg border ${hours > 48 ? "border-red-200 bg-red-50/30" : "border-amber-200 bg-amber-50/30"}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{r.name}</p>
                        <p className="text-xs text-muted-foreground">{r.role} · {r.dept}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${hours > 48 ? "text-red-600" : "text-amber-600"}`}>{hours}h / week</p>
                        <p className="text-[10px] text-muted-foreground">{hours - 40}h overtime</p>
                      </div>
                    </div>
                  </div>
                );
              }).filter(Boolean)}
              {roster.every(r => {
                const days = [r.mon, r.tue, r.wed, r.thu, r.fri, r.sat, r.sun];
                return days.filter(d => d !== "O").length * 8 <= 40;
              }) && <p className="text-sm text-muted-foreground text-center py-4">No overtime this week</p>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign Shift</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Staff Member *</Label>
              <Select><SelectTrigger><SelectValue placeholder="Select staff" /></SelectTrigger>
                <SelectContent>{roster.map(r => <SelectItem key={r.id} value={r.name}>{r.name} ({r.role})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date</Label><Input type="date" /></div>
              <div><Label>Shift *</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{shifts.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.time})</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Notes</Label><Input placeholder="Swap/overtime reason..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Shift assigned"); setAddOpen(false); }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HmsShiftRoster;
