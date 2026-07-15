import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Wrench, Plus, CheckCircle, Clock, AlertTriangle } from "lucide-react";

type Job = {
  id: string; jobNo: string; title: string; department: string;
  location: string; priority: "low" | "medium" | "high" | "critical";
  reportedBy: string; assignedTo: string; reportedDate: string;
  dueDate: string; status: "open" | "in_progress" | "completed" | "overdue";
  type: "corrective" | "preventive" | "periodic";
};

const mockJobs: Job[] = [
  { id: "1", jobNo: "MNT-0234", title: "AC not cooling - PK Room 2", department: "Panchakarma", location: "Block B, PK-2", priority: "high", reportedBy: "Nurse Kavitha", assignedTo: "Rajesh (Electrician)", reportedDate: "2026-07-15 08:30", dueDate: "2026-07-15", status: "in_progress", type: "corrective" },
  { id: "2", jobNo: "MNT-0233", title: "Shirodhara pot stand loose bolt", department: "Panchakarma", location: "Block B, PK-1", priority: "medium", reportedBy: "Therapist Suresh", assignedTo: "Mohan (Fitter)", reportedDate: "2026-07-14", dueDate: "2026-07-15", status: "open", type: "corrective" },
  { id: "3", jobNo: "MNT-0232", title: "Water heater not working - Room 201", department: "IPD", location: "2nd Floor, Room 201", priority: "high", reportedBy: "Front Office", assignedTo: "Rajesh (Electrician)", reportedDate: "2026-07-14", dueDate: "2026-07-14", status: "overdue", type: "corrective" },
  { id: "4", jobNo: "MNT-0231", title: "Monthly generator service", department: "Admin", location: "Generator Room", priority: "medium", reportedBy: "System (Auto)", assignedTo: "External Vendor", reportedDate: "2026-07-15", dueDate: "2026-07-20", status: "open", type: "periodic" },
  { id: "5", jobNo: "MNT-0230", title: "Fire extinguisher refill (Block A)", department: "Safety", location: "All floors - Block A", priority: "medium", reportedBy: "System (Auto)", assignedTo: "Fire Safety Co.", reportedDate: "2026-07-01", dueDate: "2026-07-31", status: "in_progress", type: "periodic" },
  { id: "6", jobNo: "MNT-0229", title: "Plumbing leak fixed - Kitchen", department: "Kitchen", location: "Ground Floor Kitchen", priority: "high", reportedBy: "Kitchen Manager", assignedTo: "Vijay (Plumber)", reportedDate: "2026-07-13", dueDate: "2026-07-13", status: "completed", type: "corrective" },
];

const HmsMaintenance = () => {
  const [jobs] = useState<Job[]>(mockJobs);
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Wrench className="h-6 w-6 text-slate-600" /> Maintenance & Facilities
          </h1>
          <p className="text-sm text-muted-foreground">Job tracking, periodic auto-jobs, department requests, completion reports</p>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="mr-1 h-4 w-4" /> Raise Job</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-red-200"><CardContent className="p-3 text-center"><AlertTriangle className="h-5 w-5 mx-auto text-red-600" /><p className="text-xl font-bold mt-1 text-red-600">{jobs.filter(j => j.status === "overdue").length}</p><p className="text-xs text-muted-foreground">Overdue</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Clock className="h-5 w-5 mx-auto text-amber-600" /><p className="text-xl font-bold mt-1">{jobs.filter(j => j.status === "open" || j.status === "in_progress").length}</p><p className="text-xs text-muted-foreground">Active Jobs</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><CheckCircle className="h-5 w-5 mx-auto text-green-600" /><p className="text-xl font-bold mt-1">{jobs.filter(j => j.status === "completed").length}</p><p className="text-xs text-muted-foreground">Completed</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold mt-1">{jobs.filter(j => j.type === "periodic").length}</p><p className="text-xs text-muted-foreground">Periodic/Scheduled</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-0"><div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50"><tr>
              <th className="px-3 py-2 text-left font-medium">Job #</th>
              <th className="px-3 py-2 text-left font-medium">Title</th>
              <th className="px-3 py-2 text-left font-medium">Location</th>
              <th className="px-3 py-2 text-left font-medium">Type</th>
              <th className="px-3 py-2 text-left font-medium">Priority</th>
              <th className="px-3 py-2 text-left font-medium">Assigned To</th>
              <th className="px-3 py-2 text-left font-medium">Due</th>
              <th className="px-3 py-2 text-left font-medium">Status</th>
              <th className="px-3 py-2 text-left font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.id} className={`border-b hover:bg-muted/30 ${j.status === "overdue" ? "bg-red-50/30" : ""}`}>
                  <td className="px-3 py-2 font-mono text-xs">{j.jobNo}</td>
                  <td className="px-3 py-2"><p className="font-medium text-xs">{j.title}</p><p className="text-[10px] text-muted-foreground">By: {j.reportedBy}</p></td>
                  <td className="px-3 py-2 text-xs">{j.location}</td>
                  <td className="px-3 py-2"><Badge variant="outline" className="text-[10px] capitalize">{j.type}</Badge></td>
                  <td className="px-3 py-2"><Badge variant={j.priority === "critical" || j.priority === "high" ? "destructive" : "secondary"} className="text-[10px] capitalize">{j.priority}</Badge></td>
                  <td className="px-3 py-2 text-xs">{j.assignedTo}</td>
                  <td className="px-3 py-2 text-xs">{j.dueDate}</td>
                  <td className="px-3 py-2"><Badge variant={j.status === "completed" ? "outline" : j.status === "overdue" ? "destructive" : "secondary"} className={`text-[10px] capitalize ${j.status === "completed" ? "text-green-600" : ""}`}>{j.status.replace("_", " ")}</Badge></td>
                  <td className="px-3 py-2">
                    {j.status !== "completed" && <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => toast.success("Job updated")}>{j.status === "open" ? "Start" : "Complete"}</Button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div></CardContent>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Raise Maintenance Job</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Job Title *</Label><Input placeholder="Describe the issue" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Department</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="pk">Panchakarma</SelectItem><SelectItem value="ipd">IPD</SelectItem><SelectItem value="opd">OPD</SelectItem><SelectItem value="kitchen">Kitchen</SelectItem><SelectItem value="admin">Admin/General</SelectItem><SelectItem value="safety">Safety</SelectItem></SelectContent></Select></div>
              <div><Label>Location</Label><Input placeholder="Room/Area" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Priority</Label><Select><SelectTrigger><SelectValue placeholder="Medium" /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="critical">Critical</SelectItem></SelectContent></Select></div>
              <div><Label>Type</Label><Select><SelectTrigger><SelectValue placeholder="Corrective" /></SelectTrigger><SelectContent><SelectItem value="corrective">Corrective (Breakdown)</SelectItem><SelectItem value="preventive">Preventive</SelectItem><SelectItem value="periodic">Periodic (Scheduled)</SelectItem></SelectContent></Select></div>
            </div>
            <div><Label>Assign To</Label><Input placeholder="Technician / Vendor" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Maintenance job raised"); setAddOpen(false); }}>Submit Job</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HmsMaintenance;
