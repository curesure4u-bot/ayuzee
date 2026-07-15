import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  UserCog, Plus, Search, Clock, Users, IndianRupee,
  Calendar, TrendingUp, Award, CheckCircle,
} from "lucide-react";

type Staff = {
  id: string;
  name: string;
  role: string;
  department: string;
  status: "present" | "absent" | "leave" | "half_day";
  phone: string;
  salary: number;
  joinDate: string;
  productivity: number;
};

const STAFF: Staff[] = [
  { id: "1", name: "Dr. Arun Sharma", role: "Senior Doctor", department: "Ayurveda", status: "present", phone: "9876543210", salary: 120000, joinDate: "2023-04-01", productivity: 92 },
  { id: "2", name: "Dr. Meena Patel", role: "Doctor", department: "Panchakarma", status: "present", phone: "9876543211", salary: 85000, joinDate: "2024-01-15", productivity: 88 },
  { id: "3", name: "Rajesh K", role: "Receptionist", department: "Front Office", status: "present", phone: "9876543212", salary: 25000, joinDate: "2024-06-01", productivity: 78 },
  { id: "4", name: "Sunita M", role: "Nurse", department: "IPD", status: "absent", phone: "9876543213", salary: 35000, joinDate: "2023-09-01", productivity: 85 },
  { id: "5", name: "Vikram R", role: "Pharmacist", department: "Pharmacy", status: "present", phone: "9876543214", salary: 40000, joinDate: "2024-03-01", productivity: 90 },
  { id: "6", name: "Anita D", role: "Lab Technician", department: "Laboratory", status: "present", phone: "9876543215", salary: 30000, joinDate: "2024-08-01", productivity: 82 },
  { id: "7", name: "Suresh Therapist", role: "Therapist (Senior)", department: "Panchakarma", status: "present", phone: "9876543216", salary: 35000, joinDate: "2022-01-10", productivity: 95 },
  { id: "8", name: "Priya Therapist", role: "Therapist", department: "Panchakarma", status: "present", phone: "9876543218", salary: 28000, joinDate: "2023-07-01", productivity: 91 },
  { id: "9", name: "Mohan P", role: "Therapist", department: "Panchakarma", status: "leave", phone: "9876543219", salary: 28000, joinDate: "2024-02-01", productivity: 75 },
  { id: "10", name: "Kavita S", role: "Admin Manager", department: "Administration", status: "present", phone: "9876543217", salary: 55000, joinDate: "2022-06-15", productivity: 87 },
];

const HmsHr = () => {
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const present = STAFF.filter((s) => s.status === "present").length;
  const absent = STAFF.filter((s) => s.status === "absent").length;
  const onLeave = STAFF.filter((s) => s.status === "leave").length;
  const totalPayroll = STAFF.reduce((s, st) => s + st.salary, 0);

  const filtered = STAFF.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.role.toLowerCase().includes(search.toLowerCase()) ||
    s.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <UserCog className="h-6 w-6 text-slate-600" /> HR & Payroll
          </h1>
          <p className="text-sm text-muted-foreground">
            Staff Management, Attendance, Leave, Payroll & Performance
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="mr-1 h-4 w-4" /> Add Staff
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card><CardContent className="p-3 text-center"><Users className="h-5 w-5 mx-auto text-blue-600" /><p className="text-xl font-bold mt-1">{STAFF.length}</p><p className="text-xs text-muted-foreground">Total Staff</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><CheckCircle className="h-5 w-5 mx-auto text-green-600" /><p className="text-xl font-bold mt-1 text-green-600">{present}</p><p className="text-xs text-muted-foreground">Present Today</p></CardContent></Card>
        <Card className="border-red-200"><CardContent className="p-3 text-center"><Clock className="h-5 w-5 mx-auto text-red-600" /><p className="text-xl font-bold mt-1 text-red-600">{absent}</p><p className="text-xs text-muted-foreground">Absent</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><Calendar className="h-5 w-5 mx-auto text-amber-600" /><p className="text-xl font-bold mt-1 text-amber-600">{onLeave}</p><p className="text-xs text-muted-foreground">On Leave</p></CardContent></Card>
        <Card className="border-purple-200"><CardContent className="p-3 text-center"><IndianRupee className="h-5 w-5 mx-auto text-purple-600" /><p className="text-lg font-bold mt-1 text-purple-600">₹{(totalPayroll/100000).toFixed(1)}L</p><p className="text-xs text-muted-foreground">Monthly Payroll</p></CardContent></Card>
      </div>

      <Tabs defaultValue="staff">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full">
          <TabsTrigger value="staff">Staff Directory</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
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
                    {filtered.map((s) => (
                      <tr key={s.id} className="border-b hover:bg-muted/30">
                        <td className="px-3 py-2 font-medium">{s.name}</td>
                        <td className="px-3 py-2">{s.role}</td>
                        <td className="px-3 py-2">{s.department}</td>
                        <td className="px-3 py-2 text-xs">{s.phone}</td>
                        <td className="px-3 py-2 text-xs">{new Date(s.joinDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</td>
                        <td className="px-3 py-2">
                          <Badge variant={s.status === "present" ? "outline" : s.status === "absent" ? "destructive" : "secondary"}
                            className={`text-xs capitalize ${s.status === "present" ? "text-green-600" : ""}`}>
                            {s.status.replace("_", " ")}
                          </Badge>
                        </td>
                      </tr>
                    ))}
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
                {STAFF.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-2 rounded-lg border">
                    <div>
                      <p className="text-sm font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.role} · {s.department}</p>
                    </div>
                    <Select defaultValue={s.status}>
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
              <Button className="mt-4 w-full" onClick={() => toast.success("Attendance saved")}>
                Save Attendance
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Monthly Payroll - July 2026</CardTitle>
                <Button size="sm" variant="outline">Generate Payslips</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Name</th>
                      <th className="px-3 py-2 text-left font-medium">Role</th>
                      <th className="px-3 py-2 text-left font-medium">Basic</th>
                      <th className="px-3 py-2 text-left font-medium">HRA</th>
                      <th className="px-3 py-2 text-left font-medium">Incentives</th>
                      <th className="px-3 py-2 text-left font-medium">Deductions</th>
                      <th className="px-3 py-2 text-left font-medium">Net Pay</th>
                    </tr>
                  </thead>
                  <tbody>
                    {STAFF.map((s) => {
                      const basic = Math.round(s.salary * 0.5);
                      const hra = Math.round(s.salary * 0.2);
                      const incentive = s.role.includes("Therapist") ? Math.round(s.productivity * 50) : 0;
                      const deduction = Math.round(s.salary * 0.12);
                      const net = basic + hra + (s.salary * 0.3) + incentive - deduction;
                      return (
                        <tr key={s.id} className="border-b">
                          <td className="px-3 py-2 font-medium">{s.name}</td>
                          <td className="px-3 py-2 text-xs">{s.role}</td>
                          <td className="px-3 py-2">₹{basic.toLocaleString("en-IN")}</td>
                          <td className="px-3 py-2">₹{hra.toLocaleString("en-IN")}</td>
                          <td className="px-3 py-2 text-green-600">{incentive > 0 ? `₹${incentive.toLocaleString("en-IN")}` : "—"}</td>
                          <td className="px-3 py-2 text-red-600">₹{deduction.toLocaleString("en-IN")}</td>
                          <td className="px-3 py-2 font-bold">₹{Math.round(net).toLocaleString("en-IN")}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Staff Performance Dashboard</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {STAFF.sort((a, b) => b.productivity - a.productivity).map((s) => (
                  <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg border">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{s.name}</p>
                        <div className="flex items-center gap-1">
                          {s.productivity >= 90 && <Award className="h-3 w-3 text-amber-500" />}
                          <span className="text-sm font-bold">{s.productivity}%</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{s.role} · {s.department}</p>
                      <div className="w-full bg-muted rounded-full h-2 mt-2">
                        <div
                          className={`h-2 rounded-full ${s.productivity >= 90 ? "bg-green-500" : s.productivity >= 75 ? "bg-blue-500" : "bg-amber-500"}`}
                          style={{ width: `${s.productivity}%` }}
                        />
                      </div>
                    </div>
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
          <DialogHeader><DialogTitle>Add New Staff Member</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Full Name</Label><Input placeholder="Enter name" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Role</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="nurse">Nurse</SelectItem>
                    <SelectItem value="therapist">Therapist</SelectItem>
                    <SelectItem value="pharmacist">Pharmacist</SelectItem>
                    <SelectItem value="lab_tech">Lab Technician</SelectItem>
                    <SelectItem value="receptionist">Receptionist</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="housekeeping">Housekeeping</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Department</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ayurveda">Ayurveda</SelectItem>
                    <SelectItem value="panchakarma">Panchakarma</SelectItem>
                    <SelectItem value="pharmacy">Pharmacy</SelectItem>
                    <SelectItem value="lab">Laboratory</SelectItem>
                    <SelectItem value="front_office">Front Office</SelectItem>
                    <SelectItem value="ipd">IPD</SelectItem>
                    <SelectItem value="admin">Administration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Phone</Label><Input placeholder="Mobile" /></div>
              <div><Label>Monthly Salary (₹)</Label><Input type="number" placeholder="Salary" /></div>
            </div>
            <div><Label>Join Date</Label><Input type="date" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Staff added"); setAddOpen(false); }}>Add Staff</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HmsHr;
