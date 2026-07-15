import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Building2, Plus, Search, Edit, Trash2, Users, IndianRupee } from "lucide-react";

type Department = {
  id: string;
  code: string;
  name: string;
  type: string;
  hod: string;
  location: string;
  consultFee: number;
  followUpFee: number;
  doctors: number;
  staff: number;
  timing: string;
  status: "active" | "inactive";
};

const TYPES = ["AYUSH Clinical", "Diagnostic", "Therapeutic", "Support", "Administrative"];

const mockDepts: Department[] = [
  { id: "1", code: "DEPT-AYU", name: "Ayurveda", type: "AYUSH Clinical", hod: "Dr. Arun Sharma", location: "Main Hospital - Block A, Floor 1", consultFee: 500, followUpFee: 300, doctors: 3, staff: 5, timing: "Mon-Sat 09:00-17:00", status: "active" },
  { id: "2", code: "DEPT-PK", name: "Panchakarma", type: "Therapeutic", hod: "Dr. Meena Patel", location: "Main Hospital - Block B", consultFee: 500, followUpFee: 300, doctors: 2, staff: 8, timing: "Mon-Sat 08:00-18:00", status: "active" },
  { id: "3", code: "DEPT-SID", name: "Siddha", type: "AYUSH Clinical", hod: "Dr. Tamil Selvan", location: "Main Hospital - Block A, Floor 2", consultFee: 400, followUpFee: 250, doctors: 1, staff: 2, timing: "Mon-Fri 09:00-16:00", status: "active" },
  { id: "4", code: "DEPT-HOM", name: "Homeopathy", type: "AYUSH Clinical", hod: "Dr. Priya Das", location: "City Center Branch", consultFee: 400, followUpFee: 250, doctors: 2, staff: 2, timing: "Mon-Sat 09:00-17:00", status: "active" },
  { id: "5", code: "DEPT-UNA", name: "Unani", type: "AYUSH Clinical", hod: "Dr. Faisal Khan", location: "Main Hospital - Block A, Floor 2", consultFee: 400, followUpFee: 250, doctors: 1, staff: 1, timing: "Mon-Wed-Fri 10:00-15:00", status: "active" },
  { id: "6", code: "DEPT-YOG", name: "Yoga & Naturopathy", type: "Therapeutic", hod: "Dr. Ananya S", location: "Wellness Wing", consultFee: 300, followUpFee: 200, doctors: 1, staff: 3, timing: "Mon-Sat 06:00-18:00", status: "active" },
  { id: "7", code: "DEPT-LAB", name: "Laboratory", type: "Diagnostic", hod: "Dr. Anita D", location: "Main Hospital - Ground Floor", consultFee: 0, followUpFee: 0, doctors: 0, staff: 4, timing: "Mon-Sat 07:00-20:00, Sun 08:00-12:00", status: "active" },
  { id: "8", code: "DEPT-RAD", name: "Radiology", type: "Diagnostic", hod: "Dr. Ravi Kumar", location: "Main Hospital - Ground Floor", consultFee: 0, followUpFee: 0, doctors: 1, staff: 2, timing: "Mon-Sat 08:00-18:00", status: "active" },
  { id: "9", code: "DEPT-PHR", name: "Pharmacy", type: "Support", hod: "Vikram R", location: "Main Hospital - Ground Floor", consultFee: 0, followUpFee: 0, doctors: 0, staff: 3, timing: "Mon-Sat 08:00-21:00, Sun 09:00-13:00", status: "active" },
  { id: "10", code: "DEPT-MFG", name: "Manufacturing", type: "Support", hod: "Dr. Suresh K", location: "Factory Unit - Industrial Area", consultFee: 0, followUpFee: 0, doctors: 0, staff: 12, timing: "Mon-Sat 08:00-17:00", status: "active" },
  { id: "11", code: "DEPT-ADM", name: "Administration", type: "Administrative", hod: "Kavita S", location: "Main Hospital - Floor 3", consultFee: 0, followUpFee: 0, doctors: 0, staff: 5, timing: "Mon-Sat 09:00-18:00", status: "active" },
  { id: "12", code: "DEPT-SUR", name: "Para-Surgical", type: "AYUSH Clinical", hod: "Dr. Nair", location: "Main Hospital - Block C", consultFee: 600, followUpFee: 300, doctors: 1, staff: 2, timing: "Mon-Sat 09:00-15:00", status: "active" },
];

const DepartmentMasterHms = () => {
  const [departments] = useState<Department[]>(mockDepts);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [addOpen, setAddOpen] = useState(false);

  const filtered = departments.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.hod.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || d.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6 text-indigo-600" /> Department Master
          </h1>
          <p className="text-sm text-muted-foreground">
            Create and organize hospital departments with HOD, fees, timing & staffing
          </p>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="mr-1 h-4 w-4" /> Add Department</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{departments.length}</p><p className="text-xs text-muted-foreground">Total Departments</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{departments.filter(d => d.type === "AYUSH Clinical").length}</p><p className="text-xs text-muted-foreground">AYUSH Clinical</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{departments.reduce((s, d) => s + d.doctors, 0)}</p><p className="text-xs text-muted-foreground">Total Doctors</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{departments.reduce((s, d) => s + d.staff, 0)}</p><p className="text-xs text-muted-foreground">Total Staff</p></CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search department or HOD..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">#</th>
                  <th className="px-3 py-2 text-left font-medium">Code</th>
                  <th className="px-3 py-2 text-left font-medium">Department</th>
                  <th className="px-3 py-2 text-left font-medium">Type</th>
                  <th className="px-3 py-2 text-left font-medium">HOD</th>
                  <th className="px-3 py-2 text-left font-medium">Location</th>
                  <th className="px-3 py-2 text-left font-medium">Consult Fee</th>
                  <th className="px-3 py-2 text-left font-medium">Doctors/Staff</th>
                  <th className="px-3 py-2 text-left font-medium">Timing</th>
                  <th className="px-3 py-2 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d, i) => (
                  <tr key={d.id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                    <td className="px-3 py-2 font-mono text-xs">{d.code}</td>
                    <td className="px-3 py-2 font-medium">{d.name}</td>
                    <td className="px-3 py-2"><Badge variant="outline" className="text-[10px]">{d.type}</Badge></td>
                    <td className="px-3 py-2 text-xs">{d.hod}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{d.location}</td>
                    <td className="px-3 py-2">{d.consultFee > 0 ? `₹${d.consultFee} / ₹${d.followUpFee}` : "—"}</td>
                    <td className="px-3 py-2 text-xs">{d.doctors}D / {d.staff}S</td>
                    <td className="px-3 py-2 text-[10px] text-muted-foreground">{d.timing}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Edit className="h-3 w-3" /></Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500"><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Department Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Department</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Department Code *</Label><Input placeholder="e.g., DEPT-AYU" /></div>
              <div><Label>Department Name *</Label><Input placeholder="Department name" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Type *</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Head of Department</Label><Input placeholder="HOD name" /></div>
            </div>
            <div><Label>Location</Label><Input placeholder="Building, Floor, Block" /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Consultation Fee (₹)</Label><Input type="number" placeholder="500" /></div>
              <div><Label>Follow-up Fee (₹)</Label><Input type="number" placeholder="300" /></div>
              <div><Label>Online Consult Fee (₹)</Label><Input type="number" placeholder="400" /></div>
            </div>
            <div><Label>Working Hours</Label><Input placeholder="e.g., Mon-Sat 09:00-17:00" /></div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2"><Switch defaultChecked /><Label>Active</Label></div>
              <div className="flex items-center gap-2"><Switch /><Label>Accept Online Booking</Label></div>
              <div className="flex items-center gap-2"><Switch /><Label>Token Enabled</Label></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Department created"); setAddOpen(false); }}>Save Department</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DepartmentMasterHms;
