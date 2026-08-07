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
import { Wrench, Plus, CheckCircle, Clock, AlertTriangle, Calendar, BarChart3, Search, Loader2 } from "lucide-react";
import { useMaintenance } from "@/hooks/useMaintenance";

const HmsMaintenance = () => {
  const { jobs, loading, error, activeCount, overdueCount, completedCount, periodicCount, updateStatus, createJob } = useMaintenance();
  const [addOpen, setAddOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");

  const filteredJobs = jobs.filter(j => {
    if (filterStatus !== "all" && j.status !== filterStatus) return false;
    if (search && !j.title.toLowerCase().includes(search.toLowerCase()) && !j.jobNo.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const preventiveSchedule = [
    { asset: "Generator (100 KVA)", nextDue: "2026-08-20", frequency: "Monthly", vendor: "PowerGen Services", lastDone: "2026-07-20" },
    { asset: "Fire Extinguishers (Block A & B)", nextDue: "2026-08-31", frequency: "Quarterly", vendor: "Fire Safety Co.", lastDone: "2026-06-01" },
    { asset: "Elevator Inspection", nextDue: "2026-09-01", frequency: "6-Monthly", vendor: "ThyssenKrupp", lastDone: "2026-03-01" },
    { asset: "UPS Battery Check", nextDue: "2026-08-15", frequency: "Monthly", vendor: "APC Services", lastDone: "2026-07-15" },
    { asset: "AC Servicing (All Units)", nextDue: "2026-09-10", frequency: "Quarterly", vendor: "Cool Air HVAC", lastDone: "2026-06-10" },
    { asset: "Water Tank Cleaning", nextDue: "2026-08-25", frequency: "Monthly", vendor: "Internal Team", lastDone: "2026-07-25" },
    { asset: "Pest Control", nextDue: "2026-08-10", frequency: "Monthly", vendor: "Pest-Free Services", lastDone: "2026-07-10" },
    { asset: "Shirodhara Equipment Calibration", nextDue: "2026-09-01", frequency: "Quarterly", vendor: "Ayush Equip Co.", lastDone: "2026-06-01" },
  ];

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
        <Card className="border-red-200"><CardContent className="p-3 text-center"><AlertTriangle className="h-5 w-5 mx-auto text-red-600" /><p className="text-xl font-bold mt-1 text-red-600">{overdueCount}</p><p className="text-xs text-muted-foreground">Overdue</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Clock className="h-5 w-5 mx-auto text-amber-600" /><p className="text-xl font-bold mt-1">{activeCount}</p><p className="text-xs text-muted-foreground">Active Jobs</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><CheckCircle className="h-5 w-5 mx-auto text-green-600" /><p className="text-xl font-bold mt-1">{completedCount}</p><p className="text-xs text-muted-foreground">Completed</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold mt-1">{periodicCount}</p><p className="text-xs text-muted-foreground">Periodic/Scheduled</p></CardContent></Card>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-2 text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm">Loading jobs...</span>
        </div>
      )}
      {error && !loading && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-2 text-xs text-amber-700">⚠ Using demo data. {error}</CardContent>
        </Card>
      )}

      <Tabs defaultValue="active">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full">
          <TabsTrigger value="active">Active Jobs</TabsTrigger>
          <TabsTrigger value="preventive">Preventive Schedule</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search job..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
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
                  {filteredJobs.filter(j => j.status !== "completed").map((j) => (
                    <tr key={j.id} className={`border-b hover:bg-muted/30 ${j.status === "overdue" ? "bg-red-50/30" : ""}`}>
                      <td className="px-3 py-2 font-mono text-xs">{j.jobNo}</td>
                      <td className="px-3 py-2"><p className="font-medium text-xs">{j.title}</p><p className="text-[10px] text-muted-foreground">By: {j.reportedBy}</p></td>
                      <td className="px-3 py-2 text-xs">{j.location}</td>
                      <td className="px-3 py-2"><Badge variant="outline" className="text-[10px] capitalize">{j.type}</Badge></td>
                      <td className="px-3 py-2"><Badge variant={j.priority === "critical" || j.priority === "high" ? "destructive" : "secondary"} className="text-[10px] capitalize">{j.priority}</Badge></td>
                      <td className="px-3 py-2 text-xs">{j.assignedTo}</td>
                      <td className="px-3 py-2 text-xs">{j.dueDate}</td>
                      <td className="px-3 py-2"><Badge variant={j.status === "overdue" ? "destructive" : "secondary"} className="text-[10px] capitalize">{j.status.replace("_", " ")}</Badge></td>
                      <td className="px-3 py-2">
                        <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => updateStatus(j.id, j.status === "open" ? "in_progress" : "completed")}>{j.status === "open" ? "Start" : "Complete"}</Button>
                      </td>
                    </tr>
                  ))}
                  {filteredJobs.filter(j => j.status !== "completed").length === 0 && (
                    <tr><td colSpan={9} className="px-3 py-6 text-center text-muted-foreground">No active jobs</td></tr>
                  )}
                </tbody>
              </table>
            </div></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preventive" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Calendar className="h-4 w-4" /> Preventive Maintenance Schedule</CardTitle></CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Asset / Task</th>
                    <th className="px-3 py-2 text-left font-medium">Frequency</th>
                    <th className="px-3 py-2 text-left font-medium">Last Done</th>
                    <th className="px-3 py-2 text-left font-medium">Next Due</th>
                    <th className="px-3 py-2 text-left font-medium">Vendor / Team</th>
                    <th className="px-3 py-2 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {preventiveSchedule.map((item, idx) => {
                    const due = new Date(item.nextDue);
                    const today = new Date();
                    const daysLeft = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <tr key={idx} className={`border-b hover:bg-muted/30 ${daysLeft < 7 ? "bg-amber-50/30" : ""}`}>
                        <td className="px-3 py-2 font-medium text-xs">{item.asset}</td>
                        <td className="px-3 py-2"><Badge variant="outline" className="text-[10px]">{item.frequency}</Badge></td>
                        <td className="px-3 py-2 text-xs">{item.lastDone}</td>
                        <td className="px-3 py-2 text-xs font-medium">{item.nextDue}</td>
                        <td className="px-3 py-2 text-xs">{item.vendor}</td>
                        <td className="px-3 py-2">
                          <Badge variant={daysLeft < 7 ? "destructive" : daysLeft < 14 ? "secondary" : "outline"} className={`text-[10px] ${daysLeft >= 14 ? "text-green-600" : ""}`}>
                            {daysLeft < 0 ? "Overdue" : daysLeft < 7 ? `Due in ${daysLeft}d` : "On Track"}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Completed Jobs</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {jobs.filter(j => j.status === "completed").map(j => (
                  <div key={j.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium text-sm">{j.title}</p>
                      <p className="text-xs text-muted-foreground">{j.jobNo} · {j.location} · {j.assignedTo}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs text-green-600"><CheckCircle className="h-3 w-3 mr-1" />Done</Badge>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{j.dueDate}</p>
                    </div>
                  </div>
                ))}
                {jobs.filter(j => j.status === "completed").length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No completed jobs this period</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Jobs by Priority</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {[
                  { label: "Critical", count: jobs.filter(j => j.priority === "critical").length, color: "bg-red-500" },
                  { label: "High", count: jobs.filter(j => j.priority === "high").length, color: "bg-orange-500" },
                  { label: "Medium", count: jobs.filter(j => j.priority === "medium").length, color: "bg-amber-500" },
                  { label: "Low", count: jobs.filter(j => j.priority === "low").length, color: "bg-green-500" },
                ].map(p => (
                  <div key={p.label} className="flex items-center gap-3">
                    <span className="text-sm w-16">{p.label}</span>
                    <div className="flex-1 bg-muted rounded-full h-3">
                      <div className={`h-3 rounded-full ${p.color}`} style={{ width: `${(p.count / jobs.length) * 100}%` }} />
                    </div>
                    <span className="text-sm font-bold w-6 text-right">{p.count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Department-wise Breakdown</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {[...new Set(jobs.map(j => j.department))].map(dept => {
                  const count = jobs.filter(j => j.department === dept).length;
                  return (
                    <div key={dept} className="flex items-center justify-between p-2 rounded border">
                      <span className="text-sm">{dept}</span>
                      <Badge variant="outline" className="text-xs">{count} jobs</Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
            <Card className="sm:col-span-2">
              <CardHeader className="pb-2"><CardTitle className="text-base">KPIs</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-xl font-bold">92%</p><p className="text-xs text-muted-foreground">SLA Compliance</p></div>
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-xl font-bold">4.2 hrs</p><p className="text-xs text-muted-foreground">Avg Response Time</p></div>
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-xl font-bold">1.8 days</p><p className="text-xs text-muted-foreground">Avg Resolution Time</p></div>
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-xl font-bold">₹45K</p><p className="text-xs text-muted-foreground">Monthly Cost</p></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

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
