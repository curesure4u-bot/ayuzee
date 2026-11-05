import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Building2, Plus, Search, Edit, Trash2, Users, IndianRupee, MoreHorizontal, Stethoscope, FlaskConical, Recycle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
  const [departments, setDepartments] = useState<Department[]>(mockDepts);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { loadDepartments(); }, []);

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("hms_departments")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setDepartments(data.map((d: any) => ({
          id: d.id,
          code: d.department_code || "—",
          name: d.department_name,
          type: d.ayush_system || "General",
          hod: d.head_doctor_name || "—",
          location: d.floor_or_room || "—",
          consultFee: 0,
          followUpFee: 0,
          doctors: 0,
          staff: 0,
          timing: "Mon-Sat",
          status: d.is_active ? "active" : "inactive",
        })));
      }
    } catch (err: any) {
      console.error("Dept load error:", err);
    }
    setLoading(false);
  };
  const [filterType, setFilterType] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [tab, setTab] = useState("dr-dept");
  const [newDeptName, setNewDeptName] = useState("");

  // Sub-module data
  const drDepts = [
    { name: "LAB", createdBy: "" },
    { name: "pharmacy", createdBy: "" },
    { name: "reception", createdBy: "" },
    { name: "Therapy", createdBy: "Al Shifa Ayush Hospital" },
    { name: "Ayurveda", createdBy: "Admin" },
    { name: "Panchakarma", createdBy: "Admin" },
    { name: "Siddha", createdBy: "Admin" },
    { name: "Homeopathy", createdBy: "Admin" },
    { name: "Yoga & Naturopathy", createdBy: "Admin" },
    { name: "General Medicine", createdBy: "Admin" },
  ];

  const userDepts = [
    { name: "consultation", createdBy: "" },
    { name: "FrontOffice", createdBy: "Admin" },
    { name: "Accounts", createdBy: "Admin" },
    { name: "Pharmacy", createdBy: "Admin" },
    { name: "Lab", createdBy: "Admin" },
    { name: "Nursing", createdBy: "Admin" },
    { name: "HR", createdBy: "Admin" },
    { name: "IT", createdBy: "Admin" },
    { name: "Housekeeping", createdBy: "Admin" },
    { name: "Store", createdBy: "Admin" },
  ];

  const bioWasteDepts = [
    { name: "General Ward", createdBy: "Admin" },
    { name: "Panchakarma Wing", createdBy: "Admin" },
    { name: "Laboratory", createdBy: "Admin" },
    { name: "OT", createdBy: "Admin" },
    { name: "Pharmacy", createdBy: "Admin" },
  ];

  const filtered = departments.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.hod.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || d.type === filterType;
    return matchSearch && matchType;
  });

  // Reusable manage department section
  const renderManageDept = (data: {name: string; createdBy: string}[], title: string) => (
    <Card>
      <CardHeader className="pb-2 border-b bg-primary/5">
        <CardTitle className="text-base text-center text-primary">Manage {title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <div>
            <Label className="font-semibold">Department Name</Label>
            <Input value={newDeptName} onChange={e => setNewDeptName(e.target.value)} placeholder="Name" className="w-[220px]" />
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 mt-5" onClick={() => { if (!newDeptName.trim()) return toast.error("Name required"); toast.success(`${title} "${newDeptName}" added!`); setNewDeptName(""); }}>Add</Button>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm">Show <select className="border rounded px-2 py-1 text-xs"><option>100</option></select> entries</div>
          <div className="relative w-48"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-9 h-8" placeholder="Search..." /></div>
        </div>
        <Table>
          <TableHeader><TableRow>
            <TableHead className="text-orange-600">Name</TableHead>
            <TableHead className="text-orange-600">Created By</TableHead>
            <TableHead className="text-orange-600"></TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {data.map((d, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{d.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{d.createdBy}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && <TableRow><TableCell colSpan={3} className="text-center py-6 text-muted-foreground">No data available in table</TableCell></TableRow>}
          </TableBody>
        </Table>
        <p className="text-xs text-muted-foreground">Showing 1 to {data.length} of {data.length} entries</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6 text-indigo-600" /> Department Master
          </h1>
          <p className="text-sm text-muted-foreground">
            Create and organize hospital departments — Dr, User, Bio-Waste, Diagnosis & Test mapping
          </p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="dr-dept">🩺 Dr Department</TabsTrigger>
          <TabsTrigger value="user-dept">👥 User Department</TabsTrigger>
          <TabsTrigger value="biowaste-dept">♻️ Bio-Waste Department</TabsTrigger>
          <TabsTrigger value="diagnosis-mapping">🔬 Diagnosis Mapping</TabsTrigger>
          <TabsTrigger value="test-mapping">🧪 Test Mapping</TabsTrigger>
          <TabsTrigger value="all-depts">📋 All Departments</TabsTrigger>
        </TabsList>

        {/* DR DEPARTMENT */}
        <TabsContent value="dr-dept">{renderManageDept(drDepts, "Department")}</TabsContent>

        {/* USER DEPARTMENT */}
        <TabsContent value="user-dept">{renderManageDept(userDepts, "Department")}</TabsContent>

        {/* BIO-WASTE DEPARTMENT */}
        <TabsContent value="biowaste-dept">{renderManageDept(bioWasteDepts, "Department")}</TabsContent>

        {/* DIAGNOSIS MAPPING */}
        <TabsContent value="diagnosis-mapping" className="space-y-4">
          <Card>
            <CardHeader className="pb-2 border-b bg-primary/5">
              <CardTitle className="text-base text-center text-primary">Department Wise Diagnosis</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <Tabs defaultValue="new">
                <TabsList><TabsTrigger value="new">New</TabsTrigger><TabsTrigger value="manage">Manage MRD Diagnosis</TabsTrigger></TabsList>
                <TabsContent value="new" className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div><Label>Name *</Label><Input placeholder="Name" /></div>
                    <div><Label>Department</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{drDepts.map(d => <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>)}</SelectContent></Select></div>
                    <div><Label>Gender</Label><Select defaultValue="Both"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Both">Both</SelectItem><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent></Select></div>
                  </div>
                  <div><Label>Description</Label><Textarea rows={4} placeholder="Diagnosis description with rich text..." /></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><Label>ICD10</Label><Input placeholder="Select ICD10" /></div>
                    <div className="flex items-end gap-2"><div className="flex-1"><Label>Additional Findings</Label><Input placeholder="Additional Findings" /></div><Button className="bg-emerald-600 hover:bg-emerald-700">Add</Button></div>
                  </div>
                  <Table><TableHeader><TableRow><TableHead className="text-orange-600">S.No</TableHead><TableHead className="text-orange-600">Chapter</TableHead><TableHead className="text-orange-600">Section Ref</TableHead><TableHead className="text-orange-600">Section</TableHead><TableHead className="text-orange-600">Sub Section</TableHead><TableHead className="text-orange-600">Additional Findings</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell colSpan={6} className="text-center py-4 text-muted-foreground">No ICD10 mappings added yet</TableCell></TableRow></TableBody></Table>
                  <div className="flex justify-center"><Button className="bg-orange-500 hover:bg-orange-600 px-8">Submit</Button></div>
                </TabsContent>
                <TabsContent value="manage" className="pt-4">
                  <p className="text-sm text-muted-foreground text-center py-8">Manage existing MRD Diagnosis mappings. Select a department to view mappings.</p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TEST MAPPING */}
        <TabsContent value="test-mapping" className="space-y-4">
          <Card>
            <CardHeader className="pb-2 border-b bg-primary/5">
              <CardTitle className="text-base text-center text-primary">Department Wise Tests</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-4">
                <Select><SelectTrigger className="w-[250px]"><SelectValue placeholder="Select Department" /></SelectTrigger><SelectContent>{drDepts.map(d => <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>)}</SelectContent></Select>
                <Select defaultValue="Both"><SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Both">Both</SelectItem><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent></Select>
                <Button className="bg-orange-500 hover:bg-orange-600">Go</Button>
              </div>
              <p className="text-sm text-muted-foreground text-center py-8">Select a department and click "Go" to view/map tests for that department.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ALL DEPARTMENTS (original full table) */}
        <TabsContent value="all-depts" className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{departments.length}</p><p className="text-xs text-muted-foreground">Total Departments</p></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{departments.filter(d => d.type === "AYUSH Clinical").length}</p><p className="text-xs text-muted-foreground">AYUSH Clinical</p></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{departments.reduce((s, d) => s + d.doctors, 0)}</p><p className="text-xs text-muted-foreground">Total Doctors</p></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{departments.reduce((s, d) => s + d.staff, 0)}</p><p className="text-xs text-muted-foreground">Total Staff</p></CardContent></Card>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search department or HOD..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <Select value={filterType} onValueChange={setFilterType}><SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Types</SelectItem>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
            <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="mr-1 h-4 w-4" /> Add Department</Button>
          </div>
          <Card><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left font-medium">#</th><th className="px-3 py-2 text-left font-medium">Code</th><th className="px-3 py-2 text-left font-medium">Department</th><th className="px-3 py-2 text-left font-medium">Type</th><th className="px-3 py-2 text-left font-medium">HOD</th><th className="px-3 py-2 text-left font-medium">Consult Fee</th><th className="px-3 py-2 text-left font-medium">Doctors/Staff</th><th className="px-3 py-2 text-left font-medium">Actions</th></tr></thead><tbody>{filtered.map((d, i) => (<tr key={d.id} className="border-b hover:bg-muted/30"><td className="px-3 py-2">{i+1}</td><td className="px-3 py-2 font-mono text-xs">{d.code}</td><td className="px-3 py-2 font-medium">{d.name}</td><td className="px-3 py-2"><Badge variant="outline" className="text-[10px]">{d.type}</Badge></td><td className="px-3 py-2 text-xs">{d.hod}</td><td className="px-3 py-2">{d.consultFee > 0 ? `₹${d.consultFee}` : "—"}</td><td className="px-3 py-2 text-xs">{d.doctors}D / {d.staff}S</td><td className="px-3 py-2"><Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Edit className="h-3 w-3" /></Button></td></tr>))}</tbody></table></div></CardContent></Card>
        </TabsContent>
      </Tabs>

      {/* Add Department Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Department</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3"><div><Label>Code *</Label><Input placeholder="DEPT-AYU" /></div><div><Label>Name *</Label><Input placeholder="Department name" /></div></div>
            <div className="grid grid-cols-2 gap-3"><div><Label>Type *</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div><div><Label>HOD</Label><Input placeholder="Head of Department" /></div></div>
            <div><Label>Location</Label><Input placeholder="Building, Floor" /></div>
            <div className="grid grid-cols-2 gap-3"><div><Label>Consult Fee (₹)</Label><Input type="number" placeholder="500" /></div><div><Label>Follow-up Fee (₹)</Label><Input type="number" placeholder="300" /></div></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button><Button onClick={() => { toast.success("Department created"); setAddOpen(false); }}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DepartmentMasterHms;
