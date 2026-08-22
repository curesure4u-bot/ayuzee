import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Users, Plus, Search, Download, Loader2, Filter,
  Eye, MoreHorizontal, UserCheck, Clock, AlertTriangle,
} from "lucide-react";
import { useHrmsEmployees, type EmployeeFilters, type CreateEmployeeInput } from "@/hooks/hrms/useHrmsEmployees";
import { useHrmsPermissions, canViewSensitiveData } from "@/hooks/hrms/useHrmsPermissions";

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  probation: "bg-amber-100 text-amber-700",
  on_leave: "bg-blue-100 text-blue-700",
  notice_period: "bg-red-100 text-red-700",
  suspended: "bg-gray-100 text-gray-700",
  resigned: "bg-slate-100 text-slate-700",
  relieved: "bg-slate-100 text-slate-600",
  terminated: "bg-red-100 text-red-800",
};

const attendanceColors: Record<string, string> = {
  present: "text-green-600",
  absent: "text-red-600",
  leave: "text-amber-600",
  half_day: "text-blue-600",
  holiday: "text-gray-500",
};

const HrmsEmployees = () => {
  const navigate = useNavigate();
  const permissions = useHrmsPermissions();
  const showSalary = canViewSensitiveData(permissions);

  // Filters
  const [filters, setFilters] = useState<EmployeeFilters>({
    search: "",
    department: "all",
    status: "all",
    employmentType: "all",
    branch: "all",
  });
  const [showFilters, setShowFilters] = useState(false);

  const { employees, totalCount, departments, loading, error, addEmployee } = useHrmsEmployees(filters);

  // Add Employee Dialog
  const [addOpen, setAddOpen] = useState(false);
  const [newEmp, setNewEmp] = useState<Partial<CreateEmployeeInput>>({
    employmentType: "permanent",
    joinDate: new Date().toISOString().split("T")[0],
  });

  const handleAddEmployee = async () => {
    if (!newEmp.name || !newEmp.role || !newEmp.department) {
      toast.error("Name, role, and department are required");
      return;
    }
    const success = await addEmployee(newEmp as CreateEmployeeInput);
    if (success) {
      toast.success(`${newEmp.name} added successfully`);
      setAddOpen(false);
      setNewEmp({ employmentType: "permanent", joinDate: new Date().toISOString().split("T")[0] });
    } else {
      toast.error("Failed to add employee");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" /> Employees
          </h1>
          <p className="text-sm text-muted-foreground">
            {totalCount} employees &middot; Employee directory and management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-3.5 w-3.5 mr-1" /> Export
          </Button>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Employee
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9 h-9"
                placeholder="Search by name, code, role, department..."
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              />
            </div>
            <Button
              variant={showFilters ? "secondary" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-3.5 w-3.5 mr-1" /> Filters
            </Button>
          </div>

          {/* Filter Row */}
          {showFilters && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t">
              <Select value={filters.department} onValueChange={(v) => setFilters((f) => ({ ...f, department: v }))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Department" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filters.status} onValueChange={(v) => setFilters((f) => ({ ...f, status: v }))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="probation">Probation</SelectItem>
                  <SelectItem value="notice_period">Notice Period</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.employmentType} onValueChange={(v) => setFilters((f) => ({ ...f, employmentType: v }))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="permanent">Permanent</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="probation">Probation</SelectItem>
                  <SelectItem value="intern">Intern</SelectItem>
                  <SelectItem value="consultant">Consultant</SelectItem>
                  <SelectItem value="part_time">Part-time</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setFilters({ search: "", department: "all", status: "all", employmentType: "all", branch: "all" })}>
                Clear All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm">Loading employees...</span>
        </div>
      )}

      {/* Error Banner */}
      {error && !loading && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-2 text-xs text-amber-700 flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5" /> Showing demo data. {error}
          </CardContent>
        </Card>
      )}

      {/* Employee Table */}
      {!loading && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40">
                  <tr>
                    <th className="px-3 py-2.5 text-left font-medium text-xs">Employee</th>
                    <th className="px-3 py-2.5 text-left font-medium text-xs">Department</th>
                    <th className="px-3 py-2.5 text-left font-medium text-xs">Designation</th>
                    <th className="px-3 py-2.5 text-left font-medium text-xs">Joined</th>
                    <th className="px-3 py-2.5 text-left font-medium text-xs">Type</th>
                    <th className="px-3 py-2.5 text-left font-medium text-xs">Status</th>
                    <th className="px-3 py-2.5 text-center font-medium text-xs">Today</th>
                    {showSalary && <th className="px-3 py-2.5 text-right font-medium text-xs">Salary</th>}
                    <th className="px-3 py-2.5 text-center font-medium text-xs w-16">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr
                      key={emp.id}
                      className="border-b hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => navigate(`/hms/hrms/employees/${emp.id}`)}
                    >
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 grid place-items-center text-xs font-bold text-indigo-700 shrink-0">
                            {emp.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{emp.name}</p>
                            <p className="text-[10px] text-muted-foreground">{emp.employeeCode} &middot; {emp.phone || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-xs">{emp.department}</td>
                      <td className="px-3 py-2.5 text-xs">{emp.designation || emp.role}</td>
                      <td className="px-3 py-2.5 text-xs">
                        {emp.joinDate
                          ? new Date(emp.joinDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                          : "—"}
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {emp.employmentType.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge className={`text-[10px] border-0 capitalize ${statusColors[emp.employeeStatus] || "bg-gray-100 text-gray-700"}`}>
                          {emp.employeeStatus.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={`text-xs font-medium capitalize ${attendanceColors[emp.todayAttendance] || ""}`}>
                          {emp.todayAttendance === "present" ? <UserCheck className="h-3.5 w-3.5 inline text-green-600" /> :
                           emp.todayAttendance === "absent" ? <Clock className="h-3.5 w-3.5 inline text-red-500" /> :
                           emp.todayAttendance.replace("_", " ")}
                        </span>
                      </td>
                      {showSalary && (
                        <td className="px-3 py-2.5 text-right text-xs font-medium">
                          ₹{emp.salary.toLocaleString("en-IN")}
                        </td>
                      )}
                      <td className="px-3 py-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => navigate(`/hms/hrms/employees/${emp.id}`)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {employees.length === 0 && (
                    <tr>
                      <td colSpan={showSalary ? 9 : 8} className="px-3 py-12 text-center text-muted-foreground">
                        <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p>No employees found matching your filters</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Row */}
      {!loading && employees.length > 0 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>Showing {employees.length} of {totalCount} employees</span>
          {showSalary && (
            <span>Total Payroll: ₹{employees.reduce((s, e) => s + e.salary, 0).toLocaleString("en-IN")}/month</span>
          )}
        </div>
      )}

      {/* ─── Add Employee Dialog ──────────────────────────────────────────── */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
            <div className="space-y-1 col-span-2">
              <Label className="text-xs">Full Name *</Label>
              <Input className="h-8 text-sm" placeholder="e.g. Dr. Arun Kumar" value={newEmp.name || ""} onChange={(e) => setNewEmp((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Role/Position *</Label>
              <Input className="h-8 text-sm" placeholder="e.g. Senior Doctor" value={newEmp.role || ""} onChange={(e) => setNewEmp((p) => ({ ...p, role: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Department *</Label>
              <Select value={newEmp.department || ""} onValueChange={(v) => setNewEmp((p) => ({ ...p, department: v }))}>
                <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {(departments.length > 0 ? departments : ["Ayurveda", "Panchakarma", "Front Office", "IPD", "Pharmacy", "Laboratory", "Administration", "Nursing"]).map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Phone</Label>
              <Input className="h-8 text-sm" placeholder="9876543210" value={newEmp.phone || ""} onChange={(e) => setNewEmp((p) => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Email</Label>
              <Input className="h-8 text-sm" type="email" placeholder="name@hospital.com" value={newEmp.email || ""} onChange={(e) => setNewEmp((p) => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Gender</Label>
              <Select value={newEmp.gender || ""} onValueChange={(v) => setNewEmp((p) => ({ ...p, gender: v }))}>
                <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Date of Birth</Label>
              <Input className="h-8 text-sm" type="date" value={newEmp.dateOfBirth || ""} onChange={(e) => setNewEmp((p) => ({ ...p, dateOfBirth: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Joining Date *</Label>
              <Input className="h-8 text-sm" type="date" value={newEmp.joinDate || ""} onChange={(e) => setNewEmp((p) => ({ ...p, joinDate: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Employment Type</Label>
              <Select value={newEmp.employmentType || "permanent"} onValueChange={(v) => setNewEmp((p) => ({ ...p, employmentType: v }))}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="permanent">Permanent</SelectItem>
                  <SelectItem value="probation">Probation</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="intern">Intern</SelectItem>
                  <SelectItem value="consultant">Consultant</SelectItem>
                  <SelectItem value="part_time">Part-time</SelectItem>
                  <SelectItem value="temporary">Temporary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {showSalary && (
              <div className="space-y-1">
                <Label className="text-xs">Monthly Salary (₹)</Label>
                <Input className="h-8 text-sm" type="number" placeholder="25000" value={newEmp.salary || ""} onChange={(e) => setNewEmp((p) => ({ ...p, salary: Number(e.target.value) }))} />
              </div>
            )}
            <div className="space-y-1">
              <Label className="text-xs">Weekly Off</Label>
              <Select value={newEmp.weeklyOff || "Sunday"} onValueChange={(v) => setNewEmp((p) => ({ ...p, weeklyOff: v }))}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddEmployee}>Add Employee</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HrmsEmployees;
