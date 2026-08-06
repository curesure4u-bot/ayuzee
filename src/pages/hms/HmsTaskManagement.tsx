import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  ClipboardList, Plus, Calendar, Clock, User, Phone,
  CheckCircle, AlertTriangle, Search, Filter,
} from "lucide-react";

type Task = {
  id: string; subject: string; patientOrLead: string; mobile: string;
  dueDate: string; dueTime: string; department: string; assignedTo: string;
  status: "Not Started" | "In Progress" | "Completed" | "On Hold" | "Cancelled";
  priority: "High" | "Medium" | "Low"; description: string; createdBy: string; createdAt: string;
  location: string;
};

const mockTasks: Task[] = [
  { id: "1", subject: "Follow-up call — Panchakarma inquiry", patientOrLead: "Priya Menon", mobile: "+91-9876500010", dueDate: "2026-07-22", dueTime: "10:00", department: "Reception", assignedTo: "Vignesh", status: "In Progress", priority: "High", description: "Patient inquired about 14-day Panchakarma package. Call back with pricing.", createdBy: "Dr. Meena Patel", createdAt: "2026-07-21", location: "Kadayanallur" },
  { id: "2", subject: "Insurance claim submission — Rahul Kumar", patientOrLead: "Rahul Kumar", mobile: "+91-9876500011", dueDate: "2026-07-22", dueTime: "14:00", department: "Accounts", assignedTo: "Cashier", status: "Not Started", priority: "High", description: "Submit insurance claim for IP stay (5 days). Docs ready.", createdBy: "Admin", createdAt: "2026-07-20", location: "Kadayanallur" },
  { id: "3", subject: "Lab equipment calibration", patientOrLead: "", mobile: "", dueDate: "2026-07-23", dueTime: "09:00", department: "LAB", assignedTo: "Lab Tech", status: "Not Started", priority: "Medium", description: "Monthly calibration of hematology analyzer. Service engineer confirmed.", createdBy: "Lab Manager", createdAt: "2026-07-19", location: "Kadayanallur" },
  { id: "4", subject: "Restock Rasnasaptakam Kashayam", patientOrLead: "", mobile: "", dueDate: "2026-07-22", dueTime: "11:00", department: "Pharmacy", assignedTo: "Sindhu", status: "Completed", priority: "Medium", description: "Stock below reorder level. PO raised with AVN Arogya.", createdBy: "Sindhu", createdAt: "2026-07-20", location: "Kadayanallur" },
  { id: "5", subject: "Patient complaint — long wait time", patientOrLead: "Mohammed F.", mobile: "+91-9876500013", dueDate: "2026-07-22", dueTime: "17:00", department: "Consultation", assignedTo: "Dr. Arun Sharma", status: "In Progress", priority: "High", description: "Patient complained about 45min wait. Need to review scheduling.", createdBy: "Reception", createdAt: "2026-07-21", location: "Kadayanallur" },
  { id: "6", subject: "New doctor onboarding paperwork", patientOrLead: "Dr. Kavitha R.", mobile: "+91-9876500016", dueDate: "2026-07-25", dueTime: "10:00", department: "Accounts", assignedTo: "HR", status: "Not Started", priority: "Low", description: "Collect certificates, ID proof, bank details for new homeopathy doctor.", createdBy: "Admin", createdAt: "2026-07-21", location: "Kadayanallur" },
  { id: "7", subject: "Birthday wishes — VIP patient", patientOrLead: "Lakshmi Nair", mobile: "+91-9876500014", dueDate: "2026-07-24", dueTime: "08:00", department: "Reception", assignedTo: "Vignesh", status: "Not Started", priority: "Low", description: "Send birthday wishes + 10% discount coupon via WhatsApp.", createdBy: "System (Auto)", createdAt: "2026-07-22", location: "Kadayanallur" },
];

const HmsTaskManagement = () => {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [createOpen, setCreateOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDept, setFilterDept] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredTasks = tasks.filter(t => {
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (filterDept !== "all" && t.department !== filterDept) return false;
    if (searchText && !t.subject.toLowerCase().includes(searchText.toLowerCase()) && !t.patientOrLead.toLowerCase().includes(searchText.toLowerCase())) return false;
    if (activeTab === "due-today") return t.dueDate === "2026-07-22";
    if (activeTab === "overdue") return t.dueDate < "2026-07-22" && t.status !== "Completed";
    if (activeTab === "completed") return t.status === "Completed";
    return true;
  });

  const pendingCount = tasks.filter(t => t.status !== "Completed" && t.status !== "Cancelled").length;
  const dueToday = tasks.filter(t => t.dueDate === "2026-07-22" && t.status !== "Completed").length;
  const overdue = tasks.filter(t => t.dueDate < "2026-07-22" && t.status !== "Completed" && t.status !== "Cancelled").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-orange-600" /> Task Management
          </h1>
          <p className="text-sm text-muted-foreground">Create, assign & track tasks · Filter by department, status, patient</p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-1 h-4 w-4" /> New Task
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><ClipboardList className="h-5 w-5 mx-auto text-blue-600" /><p className="text-xl font-bold mt-1">{pendingCount}</p><p className="text-xs text-muted-foreground">Pending Tasks</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Calendar className="h-5 w-5 mx-auto text-amber-600" /><p className="text-xl font-bold mt-1">{dueToday}</p><p className="text-xs text-muted-foreground">Due Today</p></CardContent></Card>
        <Card className="border-red-200"><CardContent className="p-3 text-center"><AlertTriangle className="h-5 w-5 mx-auto text-red-600" /><p className="text-xl font-bold mt-1 text-red-600">{overdue}</p><p className="text-xs text-muted-foreground">Overdue</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><CheckCircle className="h-5 w-5 mx-auto text-green-600" /><p className="text-xl font-bold mt-1 text-green-600">{tasks.filter(t => t.status === "Completed").length}</p><p className="text-xs text-muted-foreground">Completed</p></CardContent></Card>
      </div>

      {/* Tabs & Filters */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <TabsList>
            <TabsTrigger value="all">All Tasks</TabsTrigger>
            <TabsTrigger value="due-today">Due Today</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          <div className="flex gap-2 flex-1">
            <div className="relative flex-1 max-w-[250px]">
              <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search subject or patient..." className="pl-8 h-8 text-xs" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
            </div>
            <Select value={filterDept} onValueChange={setFilterDept}>
              <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Department" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Depts</SelectItem>
                <SelectItem value="Reception">Reception</SelectItem>
                <SelectItem value="Accounts">Accounts</SelectItem>
                <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                <SelectItem value="LAB">LAB</SelectItem>
                <SelectItem value="Consultation">Consultation</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Not Started">Not Started</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50"><tr>
                    <th className="px-3 py-2 text-left font-medium text-orange-700">S.No</th>
                    <th className="px-3 py-2 text-left font-medium text-orange-700">Subject</th>
                    <th className="px-3 py-2 text-left font-medium text-orange-700">Patient/Lead</th>
                    <th className="px-3 py-2 text-left font-medium text-orange-700">Due Date</th>
                    <th className="px-3 py-2 text-left font-medium text-orange-700">Department</th>
                    <th className="px-3 py-2 text-left font-medium text-orange-700">Assigned To</th>
                    <th className="px-3 py-2 text-left font-medium text-orange-700">Priority</th>
                    <th className="px-3 py-2 text-left font-medium text-orange-700">Status</th>
                    <th className="px-3 py-2 text-left font-medium text-orange-700">Actions</th>
                  </tr></thead>
                  <tbody>
                    {filteredTasks.length === 0 ? (
                      <tr><td colSpan={9} className="px-3 py-8 text-center text-muted-foreground">No tasks found</td></tr>
                    ) : filteredTasks.map((t, idx) => (
                      <tr key={t.id} className={`border-b hover:bg-muted/30 ${t.dueDate < "2026-07-22" && t.status !== "Completed" ? "bg-red-50/30" : ""}`}>
                        <td className="px-3 py-2 text-xs">{idx + 1}</td>
                        <td className="px-3 py-2"><p className="font-medium text-xs">{t.subject}</p><p className="text-[10px] text-muted-foreground">{t.description.slice(0, 50)}...</p></td>
                        <td className="px-3 py-2 text-xs">{t.patientOrLead || "—"}{t.mobile && <p className="text-[10px] text-muted-foreground">{t.mobile}</p>}</td>
                        <td className="px-3 py-2 text-xs">{t.dueDate}<br/><span className="text-muted-foreground">{t.dueTime}</span></td>
                        <td className="px-3 py-2 text-xs">{t.department}</td>
                        <td className="px-3 py-2 text-xs">{t.assignedTo}</td>
                        <td className="px-3 py-2"><Badge variant={t.priority === "High" ? "destructive" : t.priority === "Medium" ? "default" : "secondary"} className="text-[10px]">{t.priority}</Badge></td>
                        <td className="px-3 py-2"><Badge variant={t.status === "Completed" ? "outline" : t.status === "In Progress" ? "default" : "secondary"} className={`text-[10px] ${t.status === "Completed" ? "text-green-600" : ""}`}>{t.status}</Badge></td>
                        <td className="px-3 py-2">
                          <div className="flex gap-1">
                            {t.status !== "Completed" && <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => { setTasks(prev => prev.map(task => task.id === t.id ? { ...task, status: "Completed" } : task)); toast.success("Task completed"); }}>Done</Button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-3 py-2 border-t text-xs text-muted-foreground">Showing {filteredTasks.length} of {tasks.length} tasks</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Task Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="text-orange-600">New Task</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Location *</Label><Select><SelectTrigger><SelectValue placeholder="Kadayanallur" /></SelectTrigger><SelectContent><SelectItem value="loc1">location1 - Kadayanallur, .</SelectItem></SelectContent></Select></div>
              <div><Label>Subject *</Label><Input placeholder="Subject" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Patient or Lead</Label><Input placeholder="Patient or Lead" /></div>
              <div><Label>Mobile</Label><div className="flex gap-1"><span className="flex items-center px-2 border rounded-l bg-muted text-xs">+91</span><Input placeholder="Mobile" className="rounded-l-none" /></div></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Due Date *</Label><Input type="date" defaultValue="2026-07-22" /></div>
              <div><Label>Time</Label><Input type="time" defaultValue="17:46" /></div>
              <div><Label>Status *</Label><Select><SelectTrigger><SelectValue placeholder="Not Started" /></SelectTrigger><SelectContent><SelectItem value="not-started">Not Started</SelectItem><SelectItem value="in-progress">In Progress</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="on-hold">On Hold</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Department *</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="accounts">Accounts</SelectItem><SelectItem value="reception">Reception</SelectItem><SelectItem value="pharmacy">Pharmacy</SelectItem><SelectItem value="lab">LAB</SelectItem><SelectItem value="consultation">Consultation</SelectItem><SelectItem value="therapy">Therapy</SelectItem></SelectContent></Select></div>
              <div><Label>Select User</Label><Select><SelectTrigger><SelectValue placeholder="Select User" /></SelectTrigger><SelectContent><SelectItem value="vignesh">Vignesh</SelectItem><SelectItem value="sindhu">Sindhu</SelectItem><SelectItem value="bhavani">Bhavani</SelectItem><SelectItem value="cashier">Cashier</SelectItem></SelectContent></Select></div>
            </div>
            <div><Label>Priority *</Label><Select><SelectTrigger><SelectValue placeholder="High" /></SelectTrigger><SelectContent><SelectItem value="high">High</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="low">Low</SelectItem></SelectContent></Select></div>
            <div><Label>Description</Label><Textarea placeholder="Description" rows={3} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => { toast.success("Task created successfully"); setCreateOpen(false); }}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HmsTaskManagement;
