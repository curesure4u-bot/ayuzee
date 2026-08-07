import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  UserCog, Plus, Search, Clock, Users, IndianRupee,
  Calendar, CheckCircle, Loader2,
} from "lucide-react";
import { useHrStaff } from "@/hooks/useHrStaff";

const HmsHr = () => {
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newDept, setNewDept] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newSalary, setNewSalary] = useState("");

  const { staff, totalStaff, present, absent, onLeave, totalPayroll, loading, error, addStaff, updateAttendance } = useHrStaff(search);

  const handleAddStaff = async () => {
    if (!newName || !newRole || !newDept) {
      toast.error("Name, role, and department are required");
      return;
    }
    const success = await addStaff({
      name: newName,
      role: newRole,
      department: newDept,
      phone: newPhone,
      salary: Number(newSalary) || 0,
      joinDate: new Date().toISOString().split("T")[0],
      status: "present",
    });
    if (success) {
      toast.success("Staff member added");
      setAddOpen(false);
      setNewName(""); setNewRole(""); setNewDept(""); setNewPhone(""); setNewSalary("");
    } else {
      toast.error("Failed to add staff");
    }
  };

  const handleAttendanceChange = async (id: string, value: string) => {
    const success = await updateAttendance(id, value);
    if (success) toast.success("Attendance updated");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <UserCog className="h-6 w-6 text-slate-600" /> HR & Payroll
          </h1>
          <p className="text-sm text-muted-foreground">Staff Management, Attendance, Leave & Payroll</p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="mr-1 h-4 w-4" /> Add Staff
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-4 text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm">Loading staff data...</span>
        </div>
      )}

      {error && !loading && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-2 text-xs text-amber-700">⚠ Could not load live data (showing demo). {error}</CardContent>
        </Card>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card><CardContent className="p-3 text-center"><Users className="h-5 w-5 mx-auto text-blue-600" /><p className="text-xl font-bold mt-1">{totalStaff}</p><p className="text-xs text-muted-foreground">Total Staff</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><CheckCircle className="h-5 w-5 mx-auto text-green-600" /><p className="text-xl font-bold mt-1 text-green-600">{present}</p><p className="text-xs text-muted-foreground">Present</p></CardContent></Card>
        <Card className="border-red-200"><CardContent className="p-3 text-center"><Clock className="h-5 w-5 mx-auto text-red-600" /><p className="text-xl font-bold mt-1 text-red-600">{absent}</p><p className="text-xs text-muted-foreground">Absent</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><Calendar className="h-5 w-5 mx-auto text-amber-600" /><p className="text-xl font-bold mt-1 text-amber-600">{onLeave}</p><p className="text-xs text-muted-foreground">On Leave</p></CardContent></Card>
        <Card className="border-purple-200"><CardContent className="p-3 text-center"><IndianRupee className="h-5 w-5 mx-auto text-purple-600" /><p className="text-lg font-bold mt-1 text-purple-600">₹{(totalPayroll / 100000).toFixed(1)}L</p><p className="text-xs text-muted-foreground">Monthly Payroll</p></CardContent></Card>
      </div>

      <Tabs defaultValue="staff">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="staff">Staff Directory</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="staff" className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search staff..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Name</th>
                      <th className="px-3 py-2 text-left font-medium">Role</th>
                      <th className="px-3 py-2 text-left font-medium">Department</th>
                      <th className="px-3 py-2 text-left font-medium">Phone</th>
                      <th className="px-3 py-2 text-left font-medium">Joined</th>
                      <th className="px-3 py-2 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.map((s) => (
                      <tr key={s.id} className="border-b hover:bg-muted/30">
                        <td className="px-3 py-2 font-medium">{s.name}</td>
                        <td className="px-3 py-2">{s.role}</td>
                        <td className="px-3 py-2">{s.department}</td>
                        <td className="px-3 py-2 text-xs">{s.phone}</td>
                        <td className="px-3 py-2 text-xs">{s.joinDate ? new Date(s.joinDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "—"}</td>
                        <td className="px-3 py-2">
                          <Badge variant={s.status === "present" ? "outline" : s.status === "absent" ? "destructive" : "secondary"}
                            className={`text-xs capitalize ${s.status === "present" ? "text-green-600" : ""}`}>
                            {s.status.replace("_", " ")}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    {staff.length === 0 && (
                      <tr><td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">No staff found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Today's Attendance</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {staff.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-2 rounded-lg border">
                    <div>
                      <p className="text-sm font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.role} · {s.department}</p>
                    </div>
                    <Select value={s.status} onValueChange={(v) => handleAttendanceChange(s.id, v)}>
                      <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="present">Present</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                        <SelectItem value="leave">On Leave</SelectItem>
                        <SelectItem value="half_day">Half Day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Staff Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Staff Member</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><label className="text-xs font-medium">Name *</label><Input className="h-8 text-xs" value={newName} onChange={(e) => setNewName(e.target.value)} /></div>
            <div className="space-y-1"><label className="text-xs font-medium">Role *</label><Input className="h-8 text-xs" value={newRole} onChange={(e) => setNewRole(e.target.value)} /></div>
            <div className="space-y-1"><label className="text-xs font-medium">Department *</label><Input className="h-8 text-xs" value={newDept} onChange={(e) => setNewDept(e.target.value)} /></div>
            <div className="space-y-1"><label className="text-xs font-medium">Phone</label><Input className="h-8 text-xs" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} /></div>
            <div className="space-y-1"><label className="text-xs font-medium">Salary (₹)</label><Input className="h-8 text-xs" type="number" value={newSalary} onChange={(e) => setNewSalary(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddStaff}>Add Staff</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HmsHr;
